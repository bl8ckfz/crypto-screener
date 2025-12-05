/**
 * Integration Tests - Phase 5: Service Integration
 * 
 * Tests for FuturesMetricsService (WebSocket-only, no REST fallback)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import type { PartialChangeMetrics, WarmupStatus } from '@/types/metrics'

// Mock dependencies BEFORE any imports that use them
const mockWsManager = {
  start: vi.fn().mockResolvedValue(undefined),
  stop: vi.fn(),
  getMetrics: vi.fn(),
  getAllMetrics: vi.fn(),
  getWarmupStatus: vi.fn(),
  on: vi.fn(),
  emit: vi.fn(),
}

vi.mock('@/services/webSocketStreamManager', () => ({
  WebSocketStreamManager: vi.fn(() => mockWsManager),
}))

vi.mock('@/services/binanceFuturesApi', () => ({
  BinanceFuturesApiClient: vi.fn(() => ({
    fetchAllFuturesSymbols: vi.fn().mockResolvedValue(['BTCUSDT', 'ETHUSDT']),
    fetch24hrTickers: vi.fn(),
    fetchMultipleKlines: vi.fn(),
    processKlineData: vi.fn(),
  })),
}))

vi.mock('@/services/coinGeckoApi', () => ({
  CoinGeckoApiClient: vi.fn(() => ({
    fetchMarketCap: vi.fn().mockResolvedValue(1000000000),
  })),
}))

// Import AFTER mocks are set up
import { FuturesMetricsService } from '@/services/futuresMetricsService'

describe('FuturesMetricsService - WebSocket Integration', () => {
  let service: FuturesMetricsService

  beforeEach(() => {
    vi.clearAllMocks()

    // Create service (WebSocket-only now)
    service = new FuturesMetricsService()
  })

  afterEach(() => {
    if (service && typeof service.stop === 'function') {
      service.stop()
    }
  })

  describe('Initialization', () => {
    it('should initialize WebSocket manager with symbols', async () => {
      const symbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT']

      await service.initialize(symbols)

      expect(mockWsManager.start).toHaveBeenCalledWith(symbols)
      expect(mockWsManager.start).toHaveBeenCalledTimes(1)
    })


  })

  describe('Metrics Fetching', () => {
    it('should fetch metrics from WebSocket stream', async () => {
      const mockMetrics: PartialChangeMetrics = {
        symbol: 'BTCUSDT',
        timestamp: Date.now(),
        change_5m: 1.5,
        baseVolume_5m: 100,
        quoteVolume_5m: 5000000,
        change_15m: 2.0,
        baseVolume_15m: 300,
        quoteVolume_15m: 15000000,
        change_1h: 3.0,
        baseVolume_1h: 1200,
        quoteVolume_1h: 60000000,
        change_4h: null, // Still warming up
        baseVolume_4h: null,
        quoteVolume_4h: null,
        change_8h: null,
        baseVolume_8h: null,
        quoteVolume_8h: null,
        change_12h: null,
        baseVolume_12h: null,
        quoteVolume_12h: null,
        change_1d: null,
        baseVolume_1d: null,
        quoteVolume_1d: null,
      }

      mockWsManager.getMetrics.mockReturnValue(mockMetrics)

      const result = await service.fetchSymbolMetrics('BTCUSDT', { skipMarketCap: true })

      expect(mockWsManager.getMetrics).toHaveBeenCalledWith('BTCUSDT')
      expect(result.symbol).toBe('BTCUSDT')
      expect(result.change_5m).toBe(1.5)
      expect(result.change_15m).toBe(2.0)
      expect(result.change_1h).toBe(3.0)
      expect(result.change_8h).toBe(0) // Null defaults to 0
      expect(result.volume_5m).toBe(5000000)
    })

    it('should handle null metrics during warm-up', async () => {
      const mockMetrics: PartialChangeMetrics = {
        symbol: 'BTCUSDT',
        timestamp: Date.now(),
        change_5m: 1.5,
        baseVolume_5m: 100,
        quoteVolume_5m: 5000000,
        change_15m: null, // Not ready yet
        baseVolume_15m: null,
        quoteVolume_15m: null,
        change_1h: null,
        baseVolume_1h: null,
        quoteVolume_1h: null,
        change_4h: null,
        baseVolume_4h: null,
        quoteVolume_4h: null,
        change_8h: null,
        baseVolume_8h: null,
        quoteVolume_8h: null,
        change_12h: null,
        baseVolume_12h: null,
        quoteVolume_12h: null,
        change_1d: null,
        baseVolume_1d: null,
        quoteVolume_1d: null,
      }

      mockWsManager.getMetrics.mockReturnValue(mockMetrics)

      const result = await service.fetchSymbolMetrics('BTCUSDT', { skipMarketCap: true })

      expect(result.change_5m).toBe(1.5)
      expect(result.change_15m).toBe(0) // Null defaults to 0
      expect(result.change_1h).toBe(0)
      expect(result.volume_15m).toBe(0)
    })

    it('should return zeros for symbol not in stream', async () => {
      mockWsManager.getMetrics.mockReturnValue(null)

      const result = await service.fetchSymbolMetrics('UNKNOWNUSDT', { skipMarketCap: true })

      expect(result.change_5m).toBe(0)
      expect(result.change_15m).toBe(0)
      expect(result.volume_5m).toBe(0)
    })
  })

  describe('Warm-up Status', () => {
    it('should return warm-up status', () => {
      const mockStatus: WarmupStatus = {
        totalSymbols: 590,
        timeframes: {
          '5m': { ready: 590, total: 590 },
          '15m': { ready: 590, total: 590 },
          '1h': { ready: 590, total: 590 },
          '4h': { ready: 300, total: 590 },
          '8h': { ready: 100, total: 590 },
          '12h': { ready: 0, total: 590 },
          '1d': { ready: 0, total: 590 },
        },
        overallProgress: 50.5,
      }

      mockWsManager.getWarmupStatus.mockReturnValue(mockStatus)

      const status = service.getWarmupStatus()

      expect(status).toEqual(mockStatus)
      expect(status?.overallProgress).toBe(50.5)
      expect(status?.timeframes['5m'].ready).toBe(590)
    })


  })

  describe('Event Subscriptions', () => {
    it('should allow subscribing to metrics updates', () => {
      const handler = vi.fn()

      const unsubscribe = service.onMetricsUpdate(handler)

      expect(mockWsManager.on).toHaveBeenCalledWith('metricsUpdate', handler)
      expect(typeof unsubscribe).toBe('function')
    })

    it('should allow subscribing to ticker updates', () => {
      const handler = vi.fn()

      const unsubscribe = service.onTickerUpdate(handler)

      expect(mockWsManager.on).toHaveBeenCalledWith('tickerUpdate', handler)
      expect(typeof unsubscribe).toBe('function')
    })


  })

  describe('Cleanup', () => {
    it('should stop WebSocket manager on cleanup', () => {
      service.stop()

      expect(mockWsManager.stop).toHaveBeenCalled()
    })


  })
})
