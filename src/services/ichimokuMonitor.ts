/**
 * Ichimoku Cloud Monitoring Service
 * Fetches 15m kline data and calculates Ichimoku for breakout detection
 */

import { fetchKlines } from './chartData'
import { calculateIchimoku } from '@/utils/indicators'
import type { CurrencyPair } from '@/types/coin'
import { debug } from '@/utils/debug'

export interface IchimokuCloudData {
  symbol: string
  currentPrice: number
  senkouSpanA: number
  senkouSpanB: number
  cloudTop: number // max(spanA, spanB)
  cloudBottom: number // min(spanA, spanB)
  isBullishBreakout: boolean // price > cloudTop
  isBearishBreakout: boolean // price < cloudBottom
  timestamp: number
}

// Cache for Ichimoku data (symbol -> data)
const ichimokuCache = new Map<string, IchimokuCloudData>()

// Rate limiting: batch requests with delays
const BATCH_SIZE = 10 // Process 10 symbols at a time
const BATCH_DELAY = 500 // 500ms delay between batches

/**
 * Fetch and calculate Ichimoku for a single symbol
 */
async function fetchIchimokuForSymbol(
  symbol: string,
  pair: CurrencyPair
): Promise<IchimokuCloudData | null> {
  try {
    // Fetch 15m klines (need at least 52 for Ichimoku)
    const chartData = await fetchKlines(symbol, pair, '15m', 100)
    
    if (chartData.candlesticks.length < 52) {
      debug.warn(`Insufficient data for Ichimoku: ${symbol} (${chartData.candlesticks.length} candles)`)
      return null
    }

    // Calculate Ichimoku
    const ichimokuData = calculateIchimoku(chartData.candlesticks)
    
    if (ichimokuData.length === 0) {
      return null
    }

    // Get the most recent Ichimoku values
    const latest = ichimokuData[ichimokuData.length - 1]
    const currentPrice = chartData.candlesticks[chartData.candlesticks.length - 1].close

    const cloudTop = Math.max(latest.senkouSpanA, latest.senkouSpanB)
    const cloudBottom = Math.min(latest.senkouSpanA, latest.senkouSpanB)

    return {
      symbol,
      currentPrice,
      senkouSpanA: latest.senkouSpanA,
      senkouSpanB: latest.senkouSpanB,
      cloudTop,
      cloudBottom,
      isBullishBreakout: currentPrice > cloudTop,
      isBearishBreakout: currentPrice < cloudBottom,
      timestamp: Date.now(),
    }
  } catch (error) {
    debug.error(`Failed to fetch Ichimoku for ${symbol}:`, error)
    return null
  }
}

/**
 * Fetch Ichimoku data for multiple symbols with rate limiting
 */
export async function fetchIchimokuData(
  symbols: Array<{ symbol: string; pair: CurrencyPair }>
): Promise<Map<string, IchimokuCloudData>> {
  const results = new Map<string, IchimokuCloudData>()
  
  // Process in batches to avoid rate limiting
  for (let i = 0; i < symbols.length; i += BATCH_SIZE) {
    const batch = symbols.slice(i, i + BATCH_SIZE)
    
    // Fetch batch in parallel
    const batchPromises = batch.map(({ symbol, pair }) =>
      fetchIchimokuForSymbol(symbol, pair)
    )
    
    const batchResults = await Promise.allSettled(batchPromises)
    
    // Store successful results
    batchResults.forEach((result) => {
      if (result.status === 'fulfilled' && result.value) {
        const data = result.value
        results.set(data.symbol, data)
        ichimokuCache.set(data.symbol, data)
      }
    })
    
    // Delay before next batch (unless it's the last batch)
    if (i + BATCH_SIZE < symbols.length) {
      await new Promise(resolve => setTimeout(resolve, BATCH_DELAY))
    }
  }
  
  debug.log(`📊 Ichimoku monitor: ${results.size}/${symbols.length} symbols processed`)
  return results
}

/**
 * Get cached Ichimoku data for a symbol
 */
export function getCachedIchimokuData(symbol: string): IchimokuCloudData | null {
  return ichimokuCache.get(symbol) || null
}

/**
 * Clear Ichimoku cache
 */
export function clearIchimokuCache(): void {
  ichimokuCache.clear()
}

/**
 * Get cache size
 */
export function getIchimokuCacheSize(): number {
  return ichimokuCache.size
}
