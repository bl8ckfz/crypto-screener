/**
 * Bubble Detection Types
 * 
 * Type definitions for market bubble order detection and alerting.
 */

/**
 * Volume history tracking state per symbol
 */
export interface VolumeHistoryState {
  symbol: string
  
  // 5m timeframe
  vol5mHistory: number[]
  emaVol5m: number
  stdVol5m: number
  lastUpdate5m: number
  
  // 15m timeframe
  vol15mHistory: number[]
  emaVol15m: number
  stdVol15m: number
  lastUpdate15m: number
}

/**
 * Detected bubble (volume anomaly)
 */
export interface Bubble {
  // Identification
  id: string
  symbol: string
  timeframe: '5m' | '15m'
  
  // Timing
  time: number
  windowStartTime: number
  
  // Price context
  price: number
  startPrice: number
  endPrice: number
  priceChangePct: number
  
  // Volume metrics
  side: 'buy' | 'sell'
  size: 'small' | 'medium' | 'large'
  zScore: number
  quoteVolume: number
  volumeEMA: number
  volumeStdDev: number
  
  // Optional metadata
  trades?: number
  highPrice?: number
  lowPrice?: number
}

/**
 * Bubble size classification based on z-score
 */
export type BubbleSize = 'small' | 'medium' | 'large'

/**
 * Bubble side (buy or sell pressure)
 */
export type BubbleSide = 'buy' | 'sell'

/**
 * Bubble detection configuration
 */
export interface BubbleConfig {
  // 5m thresholds
  thresholds5m: {
    largeZScore: number
    mediumZScore: number
    smallZScore: number
    minPriceChangePct: number
  }
  
  // 15m thresholds
  thresholds15m: {
    largeZScore: number
    mediumZScore: number
    smallZScore: number
    minPriceChangePct: number
  }
  
  // History configuration
  historyLength5m: number
  historyLength15m: number
  emaPeriod5m: number
  emaPeriod15m: number
  minHistoryLength5m: number
  minHistoryLength15m: number
}

/**
 * Bubble statistics for monitoring
 */
export interface BubbleStats {
  totalDetected: number
  by5m: number
  by15m: number
  bySize: {
    small: number
    medium: number
    large: number
  }
  bySide: {
    buy: number
    sell: number
  }
  avgZScore: number
  maxZScore: number
}
