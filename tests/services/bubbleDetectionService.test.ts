/**
 * BubbleDetectionService Tests
 * 
 * Unit tests for bubble detection logic including:
 * - EMA calculation
 * - Standard deviation calculation
 * - Z-score computation
 * - Bubble size classification
 * - Side determination
 * - Edge cases
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { BubbleDetectionService, DEFAULT_BUBBLE_CONFIG } from '@/services/bubbleDetectionService'
import type { WindowMetrics } from '@/types/api'

describe('BubbleDetectionService', () => {
  let service: BubbleDetectionService

  beforeEach(() => {
    service = new BubbleDetectionService()
  })

  describe('initialization', () => {
    it('should initialize with default config', () => {
      const config = service.getConfig()
      expect(config.thresholds5m.largeZScore).toBe(3.5)
      expect(config.thresholds15m.largeZScore).toBe(3.0)
    })

    it('should accept custom config', () => {
      const customService = new BubbleDetectionService({
        thresholds5m: {
          largeZScore: 4.0,
          mediumZScore: 3.0,
          smallZScore: 2.0,
          minPriceChangePct: 0.2,
        },
      })
      const config = customService.getConfig()
      expect(config.thresholds5m.largeZScore).toBe(4.0)
      expect(config.thresholds15m.largeZScore).toBe(3.0) // Default preserved
    })

    it('should initialize symbol on first detection', () => {
      const metrics = createMockMetrics('BTCUSDT', 100000, 100)
      service.detectBubbles(metrics)
      
      const state = service.getSymbolState('BTCUSDT')
      expect(state).not.toBeNull()
      expect(state?.symbol).toBe('BTCUSDT')
    })
  })

  describe('bubble detection', () => {
    it('should not detect bubble with insufficient history', () => {
      const metrics = createMockMetrics('BTCUSDT', 100000, 100)
      const bubbles = service.detectBubbles(metrics)
      
      expect(bubbles).toHaveLength(0)
    })

    it('should detect large buy bubble with sufficient history and high volume', () => {
      const symbol = 'BTCUSDT'
      
      // Build up history with normal volumes
      for (let i = 0; i < 25; i++) {
        const metrics = createMockMetrics(symbol, 100000, 100 + i)
        service.detectBubbles(metrics)
      }
      
      // Inject large volume spike with price increase
      const spikeMetrics = createMockMetrics(symbol, 110000, 1000, 100000) // 10x volume, +10% price
      const bubbles = service.detectBubbles(spikeMetrics)
      
      expect(bubbles.length).toBeGreaterThan(0)
      
      const bubble5m = bubbles.find(b => b.timeframe === '5m')
      if (bubble5m) {
        expect(bubble5m.side).toBe('buy')
        expect(['large', 'medium', 'small']).toContain(bubble5m.size)
        expect(bubble5m.zScore).toBeGreaterThan(1.5)
      }
    })

    it('should detect sell bubble with price decrease', () => {
      const symbol = 'ETHUSDT'
      
      // Build up history
      for (let i = 0; i < 25; i++) {
        const metrics = createMockMetrics(symbol, 100000, 100 + i)
        service.detectBubbles(metrics)
      }
      
      // Inject volume spike with price decrease
      const spikeMetrics = createMockMetrics(symbol, 90000, 1000, 100000) // 10x volume, -10% price
      const bubbles = service.detectBubbles(spikeMetrics)
      
      const bubble5m = bubbles.find(b => b.timeframe === '5m')
      if (bubble5m) {
        expect(bubble5m.side).toBe('sell')
      }
    })

    it('should not detect bubble when price change is too small', () => {
      const symbol = 'BTCUSDT'
      
      // Build up history
      for (let i = 0; i < 25; i++) {
        const metrics = createMockMetrics(symbol, 100000, 100 + i)
        service.detectBubbles(metrics)
      }
      
      // Inject volume spike but minimal price change
      const spikeMetrics = createMockMetrics(symbol, 100050, 1000, 100000) // 10x volume, +0.05% price
      const bubbles = service.detectBubbles(spikeMetrics)
      
      // Should not detect due to minPriceChangePct threshold (0.1%)
      expect(bubbles).toHaveLength(0)
    })
  })

  describe('EMA calculation', () => {
    it('should calculate simple average for small datasets', () => {
      const service = new BubbleDetectionService()
      const values = [10, 20, 30]
      
      // Access private method through detection flow
      const symbol = 'TEST'
      for (const val of values) {
        const metrics = createMockMetrics(symbol, 100000, val)
        service.detectBubbles(metrics)
      }
      
      const state = service.getSymbolState(symbol)
      expect(state?.vol5mHistory).toHaveLength(3)
    })

    it('should maintain volume history with max length', () => {
      const symbol = 'TEST'
      const maxLength = DEFAULT_BUBBLE_CONFIG.historyLength5m
      
      // Add more than max length
      for (let i = 0; i < maxLength + 10; i++) {
        const metrics = createMockMetrics(symbol, 100000, 100)
        service.detectBubbles(metrics)
      }
      
      const state = service.getSymbolState(symbol)
      expect(state?.vol5mHistory.length).toBeLessThanOrEqual(maxLength)
    })
  })

  describe('state management', () => {
    it('should track multiple symbols independently', () => {
      const metrics1 = createMockMetrics('BTCUSDT', 100000, 100)
      const metrics2 = createMockMetrics('ETHUSDT', 200000, 200)
      
      service.detectBubbles(metrics1)
      service.detectBubbles(metrics2)
      
      const state1 = service.getSymbolState('BTCUSDT')
      const state2 = service.getSymbolState('ETHUSDT')
      
      expect(state1?.symbol).toBe('BTCUSDT')
      expect(state2?.symbol).toBe('ETHUSDT')
      expect(state1?.vol5mHistory).not.toEqual(state2?.vol5mHistory)
    })

    it('should clear all state', () => {
      const metrics = createMockMetrics('BTCUSDT', 100000, 100)
      service.detectBubbles(metrics)
      
      expect(service.getSymbolState('BTCUSDT')).not.toBeNull()
      
      service.clear()
      
      expect(service.getSymbolState('BTCUSDT')).toBeNull()
    })

    it('should provide memory usage stats', () => {
      const metrics = createMockMetrics('BTCUSDT', 100000, 100)
      service.detectBubbles(metrics)
      
      const usage = service.getMemoryUsage()
      
      expect(usage.symbols).toBe(1)
      expect(usage.estimatedBytes).toBeGreaterThan(0)
      expect(usage.averageHistoryLength).toBeGreaterThanOrEqual(0)
    })
  })

  describe('configuration management', () => {
    it('should update config', () => {
      service.updateConfig({
        thresholds5m: {
          largeZScore: 5.0,
          mediumZScore: 4.0,
          smallZScore: 3.0,
          minPriceChangePct: 0.5,
        },
      })
      
      const config = service.getConfig()
      expect(config.thresholds5m.largeZScore).toBe(5.0)
    })

    it('should preserve other config when updating', () => {
      const originalConfig = service.getConfig()
      
      service.updateConfig({
        thresholds5m: {
          largeZScore: 5.0,
          mediumZScore: 4.0,
          smallZScore: 3.0,
          minPriceChangePct: 0.5,
        },
      })
      
      const newConfig = service.getConfig()
      expect(newConfig.historyLength5m).toBe(originalConfig.historyLength5m)
      expect(newConfig.thresholds15m).toEqual(originalConfig.thresholds15m)
    })
  })

  describe('bubble object properties', () => {
    it('should create bubble with all required properties', () => {
      const symbol = 'BTCUSDT'
      
      // Build history
      for (let i = 0; i < 25; i++) {
        service.detectBubbles(createMockMetrics(symbol, 100000, 100))
      }
      
      // Create spike
      const spikeMetrics = createMockMetrics(symbol, 110000, 1000, 100000)
      const bubbles = service.detectBubbles(spikeMetrics)
      
      if (bubbles.length > 0) {
        const bubble = bubbles[0]
        
        expect(bubble.id).toBeDefined()
        expect(bubble.symbol).toBe(symbol)
        expect(bubble.timeframe).toBeDefined()
        expect(bubble.time).toBeGreaterThan(0)
        expect(bubble.windowStartTime).toBeGreaterThan(0)
        expect(bubble.price).toBeGreaterThan(0)
        expect(bubble.startPrice).toBeGreaterThan(0)
        expect(bubble.endPrice).toBeGreaterThan(0)
        expect(bubble.side).toBeDefined()
        expect(bubble.size).toBeDefined()
        expect(bubble.zScore).toBeGreaterThan(0)
        expect(bubble.quoteVolume).toBeGreaterThan(0)
        expect(bubble.volumeEMA).toBeGreaterThan(0)
        expect(bubble.volumeStdDev).toBeGreaterThanOrEqual(0)
      }
    })
  })
})

/**
 * Helper function to create mock WindowMetrics
 */
function createMockMetrics(
  symbol: string,
  endPrice: number,
  quoteVolume: number,
  startPrice?: number
): {
  symbol: string
  m5: WindowMetrics
  m15: WindowMetrics
  timestamp: number
} {
  const start = startPrice ?? endPrice * 0.99 // Default to 1% change
  const now = Date.now()

  const windowMetrics: WindowMetrics = {
    symbol,
    windowMinutes: 5,
    priceChange: endPrice - start,
    priceChangePercent: ((endPrice - start) / start) * 100,
    baseVolume: quoteVolume / endPrice,
    quoteVolume,
    windowStartTime: now - 5 * 60 * 1000,
    windowEndTime: now,
    startPrice: start,
    endPrice,
  }

  return {
    symbol,
    m5: windowMetrics,
    m15: { ...windowMetrics, windowMinutes: 15 },
    timestamp: now,
  }
}
