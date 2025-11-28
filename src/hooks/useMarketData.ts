import { useQuery } from '@tanstack/react-query'
import { useStore } from './useStore'
import { binanceApi, BinanceApiClient } from '@/services/binanceApi'
import { processTickersForPair } from '@/services/dataProcessor'
import { applyTechnicalIndicators } from '@/utils/indicators'
import { timeframeService } from '@/services/timeframeService'
import { MOCK_TICKERS, USE_MOCK_DATA } from '@/services/mockData'
import type { Coin } from '@/types/coin'

/**
 * Fetch and process market data for current currency pair
 */
export function useMarketData() {
  const currentPair = useStore((state) => state.currentPair)
  const refreshInterval = useStore((state) => state.refreshInterval)
  const autoRefresh = useStore((state) => state.autoRefresh)

  return useQuery({
    queryKey: ['marketData', currentPair],
    queryFn: async (): Promise<Coin[]> => {
      // Use mock data if enabled, otherwise fetch from Binance API
      let tickers
      if (USE_MOCK_DATA) {
        console.log('Using mock data for development')
        tickers = MOCK_TICKERS
      } else {
        try {
          tickers = await binanceApi.fetch24hrTickers()
        } catch (error) {
          console.warn(
            'Failed to fetch from Binance API, falling back to mock data:',
            error
          )
          tickers = MOCK_TICKERS
        }
      }

      // Parse to numeric values
      const processedTickers = BinanceApiClient.parseTickerBatch(tickers)

      // Filter by currency pair and convert to Coin objects
      let coins = processTickersForPair(processedTickers, currentPair)

      // Apply technical indicators (VCP, Fibonacci, etc.)
      coins = applyTechnicalIndicators(coins)

      // Update timeframe snapshots
      coins = timeframeService.updateSnapshots(coins)

      return coins
    },
    staleTime: (refreshInterval * 1000) / 2, // Half of refresh interval
    refetchInterval: autoRefresh ? refreshInterval * 1000 : false,
    refetchOnWindowFocus: autoRefresh,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })
}

/**
 * Get market statistics
 */
export function useMarketStats() {
  const { data: coins, isLoading } = useMarketData()

  if (isLoading || !coins) {
    return { isLoading, stats: null }
  }

  const bullishCoins = coins.filter((c) => c.priceChangePercent > 0)
  const bearishCoins = coins.filter((c) => c.priceChangePercent < 0)
  const neutralCoins = coins.filter((c) => c.priceChangePercent === 0)

  const totalCoins = coins.length
  const bullishCount = bullishCoins.length
  const bearishCount = bearishCoins.length
  const neutralCount = neutralCoins.length

  return {
    isLoading: false,
    stats: {
      totalCoins,
      bullishCount,
      bearishCount,
      neutralCount,
      bullishPercent: (bullishCount / totalCoins) * 100,
      bearishPercent: (bearishCount / totalCoins) * 100,
      neutralPercent: (neutralCount / totalCoins) * 100,
      sentiment:
        bullishCount > bearishCount
          ? ('bullish' as const)
          : bearishCount > bullishCount
            ? ('bearish' as const)
            : ('neutral' as const),
    },
  }
}
