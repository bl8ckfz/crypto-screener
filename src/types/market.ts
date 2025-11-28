import { CurrencyPair } from './coin'

/**
 * Market sentiment
 */
export type MarketSentiment = 'bullish' | 'bearish' | 'neutral'

/**
 * Market statistics
 */
export interface MarketStats {
  // Total counts
  totalCoins: number
  bullishCount: number // priceChangePercent > 0
  bearishCount: number // priceChangePercent < 0
  neutralCount: number // priceChangePercent === 0

  // Percentages
  bullishPercent: number
  bearishPercent: number
  neutralPercent: number

  // Average values
  avgPriceChange: number
  avgWeightedAvg: number
  avgVolume: number
  avgVCP: number

  // Market leaders
  topGainers: Array<{
    symbol: string
    priceChangePercent: number
  }>
  topLosers: Array<{
    symbol: string
    priceChangePercent: number
  }>
  topVolume: Array<{
    symbol: string
    volume: number
    quoteVolume: number
  }>

  // Dominance indicators
  ethDominance?: number
  btcDominance?: number
  paxgDominance?: number

  // Last update time
  lastUpdated: number
}

/**
 * Market summary for a specific currency pair
 */
export interface MarketSummary {
  pair: CurrencyPair
  stats: MarketStats
  sentiment: MarketSentiment
  trendStrength: number // 0-100, based on bullish/bearish distribution
}

/**
 * Market overview across all tracked pairs
 */
export interface MarketOverview {
  currentPair: CurrencyPair
  summaries: Map<CurrencyPair, MarketSummary>
  globalSentiment: MarketSentiment
  lastUpdated: number
}

/**
 * Market data refresh status
 */
export interface MarketRefreshStatus {
  isRefreshing: boolean
  lastRefresh: number
  nextRefresh: number
  refreshInterval: number // in seconds
  error?: string
}
