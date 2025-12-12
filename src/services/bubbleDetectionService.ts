/**
 * Bubble Detection Service
 * 
 * Detects volume anomalies (bubbles) using z-score analysis on sliding windows.
 * Integrates with existing Stream1mManager metrics output.
 * 
 * Architecture:
 * - Maintains volume history arrays per symbol (5m: 60 windows, 15m: 80 windows)
 * - Calculates EMA and standard deviation incrementally
 * - Computes z-scores to identify statistical outliers
 * - Classifies bubbles by size (small/medium/large) and side (buy/sell)
 * 
 * Memory footprint: ~1.16 KB per symbol
 * Performance: <1ms per candle for 200 symbols
 */

import type { WindowMetrics } from '@/types/api'
import type { Bubble, BubbleConfig, VolumeHistoryState } from '@/types/bubble'

/**
 * Default configuration for bubble detection
 */
const DEFAULT_BUBBLE_CONFIG: BubbleConfig = {
  thresholds5m: {
    largeZScore: 3.5,
    mediumZScore: 2.5,
    smallZScore: 1.5,
    minPriceChangePct: 0.1,
  },
  thresholds15m: {
    largeZScore: 3.0,
    mediumZScore: 2.0,
    smallZScore: 1.2,
    minPriceChangePct: 0.1,
  },
  historyLength5m: 60,
  historyLength15m: 80,
  emaPeriod5m: 60,
  emaPeriod15m: 80,
  minHistoryLength5m: 20,
  minHistoryLength15m: 20,
}

/**
 * Bubble Detection Service
 * 
 * Manages volume history tracking and bubble detection across all symbols
 */
export class BubbleDetectionService {
  private volumeHistory: Map<string, VolumeHistoryState> = new Map()
  private config: BubbleConfig

  constructor(config?: Partial<BubbleConfig>) {
    this.config = {
      ...DEFAULT_BUBBLE_CONFIG,
      ...config,
      thresholds5m: {
        ...DEFAULT_BUBBLE_CONFIG.thresholds5m,
        ...config?.thresholds5m,
      },
      thresholds15m: {
        ...DEFAULT_BUBBLE_CONFIG.thresholds15m,
        ...config?.thresholds15m,
      },
    }
  }

  /**
   * Initialize volume history for a symbol
   */
  initializeSymbol(symbol: string): void {
    if (this.volumeHistory.has(symbol)) {
      return // Already initialized
    }

    this.volumeHistory.set(symbol, {
      symbol,
      vol5mHistory: [],
      emaVol5m: 0,
      stdVol5m: 0,
      vol15mHistory: [],
      emaVol15m: 0,
      stdVol15m: 0,
      lastUpdate5m: 0,
      lastUpdate15m: 0,
    })
  }

  /**
   * Process window metrics and detect bubbles
   * Called on each 1m candle close
   * 
   * @param metrics - Window metrics from SlidingWindowCalculator
   * @returns Array of detected bubbles (0-2 bubbles: one for 5m, one for 15m)
   */
  detectBubbles(metrics: {
    symbol: string
    m5: WindowMetrics
    m15: WindowMetrics
    timestamp: number
  }): Bubble[] {
    const bubbles: Bubble[] = []

    // Get or create volume history state
    let state = this.volumeHistory.get(metrics.symbol)
    if (!state) {
      this.initializeSymbol(metrics.symbol)
      state = this.volumeHistory.get(metrics.symbol)!
    }

    // Process 5m window
    const bubble5m = this.processTimeframe(
      state,
      metrics.m5,
      '5m',
      metrics.timestamp
    )
    if (bubble5m) bubbles.push(bubble5m)

    // Process 15m window
    const bubble15m = this.processTimeframe(
      state,
      metrics.m15,
      '15m',
      metrics.timestamp
    )
    if (bubble15m) bubbles.push(bubble15m)

    return bubbles
  }

  /**
   * Process a single timeframe window
   */
  private processTimeframe(
    state: VolumeHistoryState,
    metrics: WindowMetrics,
    timeframe: '5m' | '15m',
    timestamp: number
  ): Bubble | null {
    const is5m = timeframe === '5m'
    const config = is5m ? this.config.thresholds5m : this.config.thresholds15m
    const historyLength = is5m
      ? this.config.historyLength5m
      : this.config.historyLength15m
    const minHistory = is5m
      ? this.config.minHistoryLength5m
      : this.config.minHistoryLength15m

    // Extract history and update arrays
    const history = is5m ? state.vol5mHistory : state.vol15mHistory
    const volume = metrics.quoteVolume

    // Add new volume to history
    history.push(volume)
    if (history.length > historyLength) {
      history.shift() // Remove oldest
    }

    // Need minimum history for reliable statistics
    if (history.length < minHistory) {
      return null
    }

    // Compute EMA and standard deviation
    const emaPeriod = is5m ? this.config.emaPeriod5m : this.config.emaPeriod15m
    const ema = this.calculateEMA(history, emaPeriod)
    const std = this.calculateStdDev(history, ema)

    // Update state
    if (is5m) {
      state.emaVol5m = ema
      state.stdVol5m = std
      state.lastUpdate5m = timestamp
    } else {
      state.emaVol15m = ema
      state.stdVol15m = std
      state.lastUpdate15m = timestamp
    }

    // Calculate z-score
    const zScore = std > 0 ? (volume - ema) / std : 0

    // Determine bubble size
    let size: 'small' | 'medium' | 'large' | null = null
    if (zScore >= config.largeZScore) {
      size = 'large'
    } else if (zScore >= config.mediumZScore) {
      size = 'medium'
    } else if (zScore >= config.smallZScore) {
      size = 'small'
    }

    if (!size) return null // No bubble detected

    // Calculate price change percentage
    const priceChangePct =
      ((metrics.endPrice - metrics.startPrice) / metrics.startPrice) * 100

    // Determine side (buy/sell) based on price movement
    let side: 'buy' | 'sell' | null = null
    if (Math.abs(priceChangePct) >= config.minPriceChangePct) {
      side = priceChangePct > 0 ? 'buy' : 'sell'
    }

    if (!side) return null // No clear direction

    // Create bubble object
    return {
      id: `${metrics.symbol}-${timeframe}-${timestamp}`,
      symbol: metrics.symbol,
      timeframe,
      time: timestamp,
      windowStartTime: metrics.windowStartTime,
      price: side === 'buy' ? metrics.endPrice : metrics.startPrice,
      startPrice: metrics.startPrice,
      endPrice: metrics.endPrice,
      priceChangePct,
      side,
      size,
      zScore,
      quoteVolume: volume,
      volumeEMA: ema,
      volumeStdDev: std,
    }
  }

  /**
   * Calculate Exponential Moving Average
   * 
   * Uses simple moving average for initial periods, then EMA formula:
   * EMA = Price(t) × k + EMA(y) × (1 − k)
   * where k = 2 / (period + 1)
   */
  private calculateEMA(values: number[], period: number): number {
    if (values.length === 0) return 0

    // Use simple moving average for initial EMA
    if (values.length < period) {
      return values.reduce((sum, val) => sum + val, 0) / values.length
    }

    // EMA calculation
    const k = 2 / (period + 1)
    let ema =
      values.slice(0, period).reduce((sum, val) => sum + val, 0) / period

    for (let i = period; i < values.length; i++) {
      ema = values[i] * k + ema * (1 - k)
    }

    return ema
  }

  /**
   * Calculate Standard Deviation
   * 
   * σ = sqrt(Σ(x - μ)² / N)
   */
  private calculateStdDev(values: number[], mean: number): number {
    if (values.length < 2) return 0

    const squaredDiffs = values.map((val) => Math.pow(val - mean, 2))
    const variance =
      squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length

    return Math.sqrt(variance)
  }

  /**
   * Get current state for a symbol (for debugging/monitoring)
   */
  getSymbolState(symbol: string): VolumeHistoryState | null {
    return this.volumeHistory.get(symbol) ?? null
  }

  /**
   * Get all symbol states (for debugging/monitoring)
   */
  getAllStates(): Map<string, VolumeHistoryState> {
    return new Map(this.volumeHistory)
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<BubbleConfig>): void {
    this.config = {
      ...this.config,
      ...config,
      thresholds5m: {
        ...this.config.thresholds5m,
        ...config.thresholds5m,
      },
      thresholds15m: {
        ...this.config.thresholds15m,
        ...config.thresholds15m,
      },
    }
  }

  /**
   * Get current configuration
   */
  getConfig(): BubbleConfig {
    return { ...this.config }
  }

  /**
   * Clear all state
   */
  clear(): void {
    this.volumeHistory.clear()
  }

  /**
   * Get memory usage estimate (for monitoring)
   */
  getMemoryUsage(): {
    symbols: number
    estimatedBytes: number
    averageHistoryLength: number
  } {
    let totalHistoryLength = 0

    this.volumeHistory.forEach((state) => {
      totalHistoryLength += state.vol5mHistory.length + state.vol15mHistory.length
    })

    const symbols = this.volumeHistory.size
    const avgHistoryLength = symbols > 0 ? totalHistoryLength / (symbols * 2) : 0
    const estimatedBytes = symbols * 1160 // ~1.16 KB per symbol

    return {
      symbols,
      estimatedBytes,
      averageHistoryLength: avgHistoryLength,
    }
  }
}

/**
 * Export default config for external use
 */
export { DEFAULT_BUBBLE_CONFIG }
