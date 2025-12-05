import { useEffect, useState, useCallback } from 'react'
import { FuturesMetricsService } from '@/services/futuresMetricsService'
import type { WarmupStatus, PartialChangeMetrics } from '@/types/metrics'
import type { FuturesMetrics } from '@/types/api'

// Create singleton instance
const futuresMetricsService = new FuturesMetricsService()

/**
 * Hook for WebSocket-based real-time futures streaming
 * 
 * NOTE: This hook is only active when USE_WEBSOCKET_STREAMING = true in futuresMetricsService
 * 
 * Features:
 * - Real-time price/volume updates via WebSocket
 * - Gradual warm-up over 24 hours (5m → 15m → 1h → 4h → 8h → 12h → 1d)
 * - Zero API requests after initialization
 * - Auto-reconnection on disconnect
 * 
 * @example
 * const { metrics, warmupStatus, isInitialized } = useFuturesStreaming()
 * 
 * // Check if symbol has enough data for 1h timeframe
 * if (warmupStatus.timeframes['1h'].ready === warmupStatus.totalSymbols) {
 *   console.log('All symbols ready for 1h metrics')
 * }
 */
export function useFuturesStreaming() {
  const [isInitialized, setIsInitialized] = useState(false)
  const [metricsMap, setMetricsMap] = useState<Map<string, PartialChangeMetrics>>(new Map())
  const [warmupStatus, setWarmupStatus] = useState<WarmupStatus | null>(null)
  const [error, setError] = useState<Error | null>(null)

  // Initialize WebSocket streaming on mount
  useEffect(() => {
    let isSubscribed = true

    const init = async () => {
      try {
        console.log('🚀 Initializing futures streaming...')
        
        // Fetch all USDT-M futures symbols
        const symbols = await futuresMetricsService.getAllFuturesSymbols()
        console.log(`📋 Found ${symbols.length} futures symbols`)
        
        // Start streaming (connects, subscribes, starts receiving data)
        await futuresMetricsService.initialize(symbols)
        
        if (!isSubscribed) return
        
        setIsInitialized(true)
        console.log('✅ Futures streaming initialized')
        
        // Subscribe to real-time metrics updates
        const unsubMetrics = futuresMetricsService.onMetricsUpdate(({ symbol, metrics }: { symbol: string; metrics: PartialChangeMetrics }) => {
          if (!isSubscribed) return
          
          setMetricsMap(prev => {
            const next = new Map(prev)
            next.set(symbol, metrics)
            return next
          })
        })
        
        // Track warm-up progress every 5 seconds
        const warmupInterval = setInterval(() => {
          if (!isSubscribed) return
          
          const status = futuresMetricsService.getWarmupStatus()
          setWarmupStatus(status)
          
          // Stop tracking once fully warmed up
          if (status && status.overallProgress >= 100) {
            clearInterval(warmupInterval)
            console.log('🔥 Fully warmed up - all timeframes ready!')
          }
        }, 5000)
        
        // Cleanup on unmount
        return () => {
          isSubscribed = false
          unsubMetrics()
          clearInterval(warmupInterval)
          futuresMetricsService.stop()
        }
      } catch (err) {
        console.error('❌ Failed to initialize futures streaming:', err)
        if (isSubscribed) {
          setError(err instanceof Error ? err : new Error(String(err)))
        }
      }
    }

    init()

    return () => {
      isSubscribed = false
    }
  }, [])

  /**
   * Get metrics for a specific symbol
   * Returns null if symbol not in stream or timeframe not ready
   */
  const getMetrics = useCallback((symbol: string): PartialChangeMetrics | null => {
    return metricsMap.get(symbol) || null
  }, [metricsMap])

  /**
   * Get all metrics as array (for screener table)
   * Converts partial metrics to FuturesMetrics format with nulls defaulted to 0
   */
  const getAllMetrics = useCallback((): Omit<FuturesMetrics, 'passes_filters' | 'filter_details' | 'marketCap' | 'coinGeckoId'>[] => {
    return Array.from(metricsMap.values()).map(partial => ({
      symbol: partial.symbol,
      timestamp: partial.timestamp,
      change_5m: partial.change_5m ?? 0,
      change_15m: partial.change_15m ?? 0,
      change_1h: partial.change_1h ?? 0,
      change_8h: partial.change_8h ?? 0,
      change_1d: partial.change_1d ?? 0,
      volume_5m: partial.quoteVolume_5m ?? 0,
      volume_15m: partial.quoteVolume_15m ?? 0,
      volume_1h: partial.quoteVolume_1h ?? 0,
      volume_8h: partial.quoteVolume_8h ?? 0,
      volume_1d: partial.quoteVolume_1d ?? 0,
    }))
  }, [metricsMap])

  return {
    // State
    isInitialized,
    error,
    
    // Data
    metricsMap,
    warmupStatus,
    
    // Helpers
    getMetrics,
    getAllMetrics,
    
    // Status checks
    isFullyWarmedUp: warmupStatus?.overallProgress === 100,
    symbolCount: metricsMap.size,
  }
}
