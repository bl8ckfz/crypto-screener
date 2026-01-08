import type { Coin } from '@/types/coin'
import { formatPrice, formatPercent, formatLargeNumber, formatDateTime } from '@/utils/format'
import { TechnicalIndicators } from './TechnicalIndicators'
import { ExternalLinks } from './ExternalLinks'
import { EmptyState, Badge } from '@/components/ui'

export interface CoinDetailsPanelProps {
  coin: Coin | null
  onClose?: () => void
  className?: string
}

/**
 * CoinDetailsPanel Component
 * 
 * Displays detailed coin information in a side panel.
 * Replaces CoinModal content for the new alert-centric layout.
 * Shows 24h statistics, technical indicators, Fibonacci pivots, and external tools.
 * 
 * Phase 8.1.3: Create Coin Details Side Panel
 */
export function CoinDetailsPanel({ coin, onClose, className = '' }: CoinDetailsPanelProps) {
  // Show empty state when no coin selected
  if (!coin) {
    return (
      <div className={`h-full flex items-center justify-center ${className}`}>
        <EmptyState
          icon="💰"
          title="No Coin Selected"
          description="Select a coin from the alert history to view details"
        />
      </div>
    )
  }

  const priceChangeColor =
    coin.priceChangePercent > 0
      ? 'text-bullish'
      : coin.priceChangePercent < 0
        ? 'text-bearish'
        : 'text-neutral'

  return (
    <div className={`h-full overflow-y-auto ${className}`}>
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-gray-900 border-b border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div>
              <h3 className="text-lg font-bold text-white">
                {coin.symbol}
                <span className="text-gray-400 text-sm ml-2">/ {coin.pair}</span>
              </h3>
              <p className="text-xs text-gray-500">{coin.fullSymbol}</p>
            </div>
            <Badge
              variant={
                coin.priceChangePercent > 0
                  ? 'success'
                  : coin.priceChangePercent < 0
                    ? 'danger'
                    : 'default'
              }
              size="md"
            >
              {coin.priceChangePercent > 0 ? '+' : ''}
              {formatPercent(coin.priceChangePercent)}
            </Badge>
          </div>
          
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
              aria-label="Deselect coin"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="space-y-4 p-4">
        {/* Current Price */}
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-1">
            Current Price
          </div>
          <div className={`text-2xl font-bold ${priceChangeColor}`}>
            {formatPrice(coin.lastPrice)}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {formatDateTime(coin.closeTime)}
          </div>
        </div>

        {/* 24h Statistics */}
        <div className="bg-gray-800 rounded-lg p-4 space-y-3">
          <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
            24h Statistics
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">High</span>
              <span className="font-mono text-red-400">
                {formatPrice(coin.highPrice)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Low</span>
              <span className="font-mono text-green-400">
                {formatPrice(coin.lowPrice)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Open</span>
              <span className="font-mono text-gray-300">
                {formatPrice(coin.openPrice)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Prev Close</span>
              <span className="font-mono text-gray-300">
                {formatPrice(coin.prevClosePrice)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Weighted Avg</span>
              <span className="font-mono text-gray-300">
                {formatPrice(coin.weightedAvgPrice)}
              </span>
            </div>
          </div>
        </div>

        {/* Volume Information */}
        <div className="bg-gray-800 rounded-lg p-4 space-y-3">
          <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
            Volume
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">24h Volume</span>
              <span className="font-mono text-gray-300">
                {formatLargeNumber(coin.volume)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Quote Volume</span>
              <span className="font-mono text-gray-300">
                {formatLargeNumber(coin.quoteVolume)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Trades</span>
              <span className="font-mono text-gray-300">
                {formatLargeNumber(coin.count)}
              </span>
            </div>
          </div>
        </div>

        {/* Order Book */}
        <div className="bg-gray-800 rounded-lg p-4 space-y-3">
          <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
            Order Book
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Best Bid</span>
              <span className="font-mono text-green-400">
                {formatPrice(coin.bidPrice)}
              </span>
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>Bid Qty</span>
              <span>{formatLargeNumber(coin.bidQty)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Best Ask</span>
              <span className="font-mono text-red-400">
                {formatPrice(coin.askPrice)}
              </span>
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>Ask Qty</span>
              <span>{formatLargeNumber(coin.askQty)}</span>
            </div>
            <div className="pt-2 border-t border-gray-700">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Spread</span>
                <span className="font-mono text-gray-300">
                  {formatPercent(
                    ((coin.askPrice - coin.bidPrice) / coin.bidPrice) * 100
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Technical Indicators */}
        <TechnicalIndicators coin={coin} />

        {/* External Links */}
        <ExternalLinks coin={coin} />
      </div>
    </div>
  )
}
