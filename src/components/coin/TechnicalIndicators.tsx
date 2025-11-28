import type { Coin } from '@/types/coin'
import { formatPrice, formatPercent, formatNumber } from '@/utils/format'
import { Badge } from '@/components/ui'

export interface TechnicalIndicatorsProps {
  coin: Coin
}

/**
 * TechnicalIndicators component displays VCP, Fibonacci levels, and other technical data
 */
export function TechnicalIndicators({ coin }: TechnicalIndicatorsProps) {
  const { indicators } = coin

  return (
    <div className="space-y-6">
      {/* VCP Section */}
      <div>
        <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">
          VCP Analysis
        </h3>
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-300">VCP Value</span>
            <span
              className={`text-lg font-bold ${
                indicators.vcp > 0
                  ? 'text-bullish'
                  : indicators.vcp < 0
                    ? 'text-bearish'
                    : 'text-gray-400'
              }`}
            >
              {formatNumber(indicators.vcp, 3)}
            </span>
          </div>
          <div className="mt-2 text-xs text-gray-400">
            (Price/WA) × [(Close-Low)-(High-Close)]/(High-Low)
          </div>
        </div>
      </div>

      {/* Fibonacci Pivot Levels */}
      <div>
        <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">
          Fibonacci Pivot Levels
        </h3>
        <div className="space-y-2">
          {/* Resistance Levels */}
          <div className="bg-gray-800 rounded-lg p-3">
            <div className="text-xs text-gray-400 mb-2">Resistance</div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-red-400">R1 (100%)</span>
                <span className="font-mono">
                  {formatPrice(indicators.fibonacci.resistance1)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-red-400">R0.618</span>
                <span className="font-mono">
                  {formatPrice(indicators.fibonacci.resistance0618)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-red-400">R0.382</span>
                <span className="font-mono">
                  {formatPrice(indicators.fibonacci.resistance0382)}
                </span>
              </div>
            </div>
          </div>

          {/* Pivot */}
          <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-3">
            <div className="flex justify-between text-sm">
              <span className="text-blue-400 font-semibold">Pivot Point</span>
              <span className="font-mono font-semibold">
                {formatPrice(indicators.fibonacci.pivot)}
              </span>
            </div>
          </div>

          {/* Support Levels */}
          <div className="bg-gray-800 rounded-lg p-3">
            <div className="text-xs text-gray-400 mb-2">Support</div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-green-400">S0.382</span>
                <span className="font-mono">
                  {formatPrice(indicators.fibonacci.support0382)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-green-400">S0.618</span>
                <span className="font-mono">
                  {formatPrice(indicators.fibonacci.support0618)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-green-400">S1 (100%)</span>
                <span className="font-mono">
                  {formatPrice(indicators.fibonacci.support1)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Price Ratios */}
      <div>
        <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">
          Price Ratios
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-800 rounded-lg p-3">
            <div className="text-xs text-gray-400 mb-1">Price/WA</div>
            <div className="text-sm font-mono">
              {formatNumber(indicators.priceToWeightedAvg, 4)}
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg p-3">
            <div className="text-xs text-gray-400 mb-1">Price/High</div>
            <div className="text-sm font-mono">
              {formatPercent(indicators.priceToHigh)}
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg p-3">
            <div className="text-xs text-gray-400 mb-1">Low/Price</div>
            <div className="text-sm font-mono">
              {formatPercent(indicators.lowToPrice)}
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg p-3">
            <div className="text-xs text-gray-400 mb-1">High/Low</div>
            <div className="text-sm font-mono">
              {formatPercent(indicators.highToLow)}
            </div>
          </div>
        </div>
      </div>

      {/* Volume Ratios */}
      <div>
        <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">
          Volume Metrics
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-800 rounded-lg p-3">
            <div className="text-xs text-gray-400 mb-1">Ask/Volume</div>
            <div className="text-sm font-mono">
              {formatNumber(indicators.askToVolume, 4)}
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg p-3">
            <div className="text-xs text-gray-400 mb-1">Price/Volume</div>
            <div className="text-sm font-mono">
              {formatNumber(indicators.priceToVolume, 2)}
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg p-3">
            <div className="text-xs text-gray-400 mb-1">Quote/Count</div>
            <div className="text-sm font-mono">
              {formatNumber(indicators.quoteToCount, 2)}
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg p-3">
            <div className="text-xs text-gray-400 mb-1">Trades/Volume</div>
            <div className="text-sm font-mono">
              {formatNumber(indicators.tradesPerVolume, 4)}
            </div>
          </div>
        </div>
      </div>

      {/* Market Dominance */}
      <div>
        <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">
          Market Dominance
        </h3>
        <div className="space-y-2">
          {indicators.ethDominance !== null && (
            <div className="flex items-center justify-between bg-gray-800 rounded-lg p-3">
              <span className="text-gray-300">vs ETH</span>
              <Badge
                variant={indicators.ethDominance > 0 ? 'success' : 'danger'}
              >
                {indicators.ethDominance > 0 ? '+' : ''}
                {formatPercent(indicators.ethDominance)}
              </Badge>
            </div>
          )}
          {indicators.btcDominance !== null && (
            <div className="flex items-center justify-between bg-gray-800 rounded-lg p-3">
              <span className="text-gray-300">vs BTC</span>
              <Badge
                variant={indicators.btcDominance > 0 ? 'success' : 'danger'}
              >
                {indicators.btcDominance > 0 ? '+' : ''}
                {formatPercent(indicators.btcDominance)}
              </Badge>
            </div>
          )}
          {indicators.paxgDominance !== null && (
            <div className="flex items-center justify-between bg-gray-800 rounded-lg p-3">
              <span className="text-gray-300">vs PAXG</span>
              <Badge
                variant={indicators.paxgDominance > 0 ? 'success' : 'danger'}
              >
                {indicators.paxgDominance > 0 ? '+' : ''}
                {formatPercent(indicators.paxgDominance)}
              </Badge>
            </div>
          )}
        </div>
      </div>

      {/* Change Percentages */}
      <div>
        <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">
          Change Metrics
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-800 rounded-lg p-3">
            <div className="text-xs text-gray-400 mb-1">From WA</div>
            <div
              className={`text-sm font-mono ${
                indicators.priceChangeFromWeightedAvg > 0
                  ? 'text-bullish'
                  : indicators.priceChangeFromWeightedAvg < 0
                    ? 'text-bearish'
                    : 'text-gray-400'
              }`}
            >
              {formatPercent(indicators.priceChangeFromWeightedAvg)}
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg p-3">
            <div className="text-xs text-gray-400 mb-1">From Prev Close</div>
            <div
              className={`text-sm font-mono ${
                indicators.priceChangeFromPrevClose > 0
                  ? 'text-bullish'
                  : indicators.priceChangeFromPrevClose < 0
                    ? 'text-bearish'
                    : 'text-gray-400'
              }`}
            >
              {formatPercent(indicators.priceChangeFromPrevClose)}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
