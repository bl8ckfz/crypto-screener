import { debug } from '@/utils/debug'
import type { CoinGeckoMarketData, ApiError } from '@/types/api'
import { API_CONFIG } from '@/config/api'
import { getCoinGeckoId } from '@/config/coinGeckoMapping'

/**
 * Cache entry for market cap data
 */
interface CacheEntry {
  marketCap: number
  timestamp: number
}

/**
 * Rate limiter for CoinGecko API calls
 */
class RateLimiter {
  private queue: number[] = []
  private readonly maxCalls: number
  private readonly timeWindow: number

  constructor(maxCalls: number = 30, timeWindowMs: number = 60000) {
    this.maxCalls = maxCalls
    this.timeWindow = timeWindowMs
  }

  /**
   * Wait if rate limit would be exceeded
   */
  async waitIfNeeded(): Promise<void> {
    const now = Date.now()
    
    // Remove timestamps outside the time window
    this.queue = this.queue.filter(timestamp => now - timestamp < this.timeWindow)

    // If we're at the limit, wait until the oldest call expires
    if (this.queue.length >= this.maxCalls) {
      const oldestCall = this.queue[0]
      const waitTime = this.timeWindow - (now - oldestCall)
      
      if (waitTime > 0) {
        debug.log(`⏳ Rate limit reached, waiting ${Math.ceil(waitTime / 1000)}s...`)
        await new Promise(resolve => setTimeout(resolve, waitTime))
      }
    }

    // Record this call
    this.queue.push(Date.now())
  }

  /**
   * Get current rate limit status
   */
  getStatus(): { calls: number; maxCalls: number; resetIn: number } {
    const now = Date.now()
    this.queue = this.queue.filter(timestamp => now - timestamp < this.timeWindow)
    
    const resetIn = this.queue.length > 0 
      ? Math.max(0, this.timeWindow - (now - this.queue[0]))
      : 0

    return {
      calls: this.queue.length,
      maxCalls: this.maxCalls,
      resetIn,
    }
  }
}

/**
 * CoinGecko API client for fetching market cap data
 * 
 * Features:
 * - 1-hour cache to reduce API calls
 * - Rate limiting (30 calls/minute for free tier)
 * - Symbol to CoinGecko ID mapping
 * 
 * API Documentation: https://www.coingecko.com/en/api/documentation
 */
export class CoinGeckoApiClient {
  private baseUrl: string
  private timeout: number
  private retries: number
  private cache: Map<string, CacheEntry>
  private rateLimiter: RateLimiter
  private readonly CACHE_TTL = 86400000 // 24 hours in milliseconds (market cap changes slowly)

  constructor(
    baseUrl: string = API_CONFIG.coinGeckoBaseUrl,
    timeout: number = API_CONFIG.timeout,
    retries: number = API_CONFIG.retries
  ) {
    this.baseUrl = baseUrl
    this.timeout = timeout
    this.retries = retries
    this.cache = new Map()
    // Conservative limit: 20 calls/minute (leaving buffer for other requests)
    this.rateLimiter = new RateLimiter(20, 60000)
  }

  /**
   * Fetch complete coin data including market cap
   * 
   * @param coinId - CoinGecko coin ID (e.g., 'bitcoin', 'ethereum')
   * @returns Coin data with market cap
   * 
   * @example
   * const data = await client.fetchCoinData('bitcoin')
   * debug.log(data.market_data.market_cap.usd)
   */
  async fetchCoinData(coinId: string): Promise<CoinGeckoMarketData> {
    await this.rateLimiter.waitIfNeeded()

    const endpoint = `/coins/${coinId}`
    const params = new URLSearchParams({
      localization: 'false',
      tickers: 'false',
      community_data: 'false',
      developer_data: 'false',
      sparkline: 'false',
    })

    const url = `${this.baseUrl}${endpoint}?${params}`

    try {
      return await this.fetchWithRetry<CoinGeckoMarketData>(url)
    } catch (error) {
      console.error(`Failed to fetch CoinGecko data for ${coinId}:`, error)
      throw error
    }
  }

  /**
   * Fetch market cap for a symbol with caching
   * 
   * Strategy:
   * - 24-hour cache (market cap changes slowly)
   * - Rate-limited to 20 calls/minute (conservative)
   * - Returns stale data on failure to avoid blocking alerts
   * - Silently handles missing mappings
   * 
   * @param symbol - Binance futures symbol (e.g., 'BTCUSDT')
   * @returns Market cap in USD or null if not available
   * 
   * @example
   * const marketCap = await client.fetchMarketCap('BTCUSDT')
   */
  async fetchMarketCap(symbol: string): Promise<number | null> {
    // Get CoinGecko ID from symbol
    const coinId = getCoinGeckoId(symbol)
    if (!coinId) {
      // Silently skip - not all Binance symbols have CoinGecko mappings
      return null
    }

    // Check cache first (24-hour TTL)
    const cached = this.cache.get(coinId)
    const now = Date.now()

    if (cached && now - cached.timestamp < this.CACHE_TTL) {
      // Cache hit - no API call needed
      return cached.marketCap
    }

    try {
      // Fetch fresh data (with rate limiting)
      const data = await this.fetchCoinData(coinId)
      const marketCap = data.market_data.market_cap.usd

      // Update cache
      this.cache.set(coinId, {
        marketCap,
        timestamp: now,
      })

      debug.log(`✅ Fetched market cap for ${symbol}: $${marketCap.toLocaleString()}`)
      return marketCap
    } catch (error) {
      debug.warn(`⚠️ Failed to fetch market cap for ${symbol}, using fallback...`, error)
      
      // Return stale cached data if available (better than nothing for alerts)
      if (cached) {
        debug.log(`📦 Using stale cache for ${symbol} (${Math.round((now - cached.timestamp) / 3600000)}h old)`)
        return cached.marketCap
      }
      
      // No cached data available
      return null
    }
  }

  /**
   * Fetch market cap for multiple symbols in parallel (with rate limiting)
   * 
   * @param symbols - Array of Binance futures symbols
   * @returns Map of symbol to market cap (or null)
   * 
   * @example
   * const marketCaps = await client.fetchMultipleMarketCaps(['BTCUSDT', 'ETHUSDT'])
   */
  async fetchMultipleMarketCaps(symbols: string[]): Promise<Map<string, number | null>> {
    const results = new Map<string, number | null>()

    // Filter to only symbols with CoinGecko mappings
    const validSymbols = symbols.filter(symbol => getCoinGeckoId(symbol) !== null)

    debug.log(`Fetching market caps for ${validSymbols.length} symbols...`)

    // Process symbols sequentially to respect rate limits
    // (Could be optimized with batching in the future)
    for (const symbol of validSymbols) {
      const marketCap = await this.fetchMarketCap(symbol)
      results.set(symbol, marketCap)
    }

    // Add null entries for symbols without mappings
    for (const symbol of symbols) {
      if (!results.has(symbol)) {
        results.set(symbol, null)
      }
    }

    return results
  }

  /**
   * Clear the market cap cache
   */
  clearCache(): void {
    this.cache.clear()
    debug.log('🗑️  Cleared CoinGecko cache')
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; oldestEntry: number | null } {
    const now = Date.now()
    let oldestTimestamp: number | null = null

    for (const entry of this.cache.values()) {
      if (oldestTimestamp === null || entry.timestamp < oldestTimestamp) {
        oldestTimestamp = entry.timestamp
      }
    }

    return {
      size: this.cache.size,
      oldestEntry: oldestTimestamp ? now - oldestTimestamp : null,
    }
  }

  /**
   * Get rate limiter status
   */
  getRateLimitStatus() {
    return this.rateLimiter.getStatus()
  }

  /**
   * Fetch with retry logic and exponential backoff
   * 
   * @param url - URL to fetch
   * @param attempt - Current attempt number (for recursion)
   * @returns Parsed JSON response
   */
  private async fetchWithRetry<T>(url: string, attempt: number = 1): Promise<T> {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), this.timeout)

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
        },
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        // Check for rate limit error (429)
        if (response.status === 429) {
          // Don't retry indefinitely on 429 - respect max retries
          if (attempt >= this.retries) {
            console.error(`Rate limit exceeded after ${this.retries} attempts`)
            throw new Error('CoinGecko rate limit exceeded')
          }
          
          const retryAfter = response.headers.get('Retry-After')
          const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : 60000
          
          debug.warn(`⏳ Rate limited by CoinGecko (attempt ${attempt}), waiting ${waitTime / 1000}s...`)
          await new Promise(resolve => setTimeout(resolve, waitTime))
          
          // Retry after waiting (increments attempt count)
          return this.fetchWithRetry<T>(url, attempt + 1)
        }

        const error: ApiError = {
          code: response.status,
          message: `HTTP ${response.status}: ${response.statusText}`,
        }
        throw error
      }

      return await response.json()
    } catch (error) {
      // If we've exhausted retries, throw the error
      if (attempt >= this.retries) {
        console.error(`Failed after ${this.retries} attempts:`, error)
        throw error
      }

      // Exponential backoff: 1s, 2s, 4s
      const delay = Math.pow(2, attempt - 1) * 1000
      debug.warn(`Attempt ${attempt} failed, retrying in ${delay}ms...`)

      await new Promise(resolve => setTimeout(resolve, delay))
      return this.fetchWithRetry<T>(url, attempt + 1)
    }
  }
}

/**
 * Singleton instance for convenient access
 */
export const coinGeckoApi = new CoinGeckoApiClient()
