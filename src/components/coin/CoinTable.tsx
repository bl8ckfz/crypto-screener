import { useMemo } from 'react'
import type { Coin } from '@/types/coin'
import { useStore } from '@/hooks/useStore'
import { sortCoins } from '@/utils/sort'
import { formatPrice, formatPercent, formatVolume } from '@/utils/format'
import { TableRowSkeleton } from '@/components/ui'

interface CoinTableProps {
  coins: Coin[]
  onCoinClick?: (coin: Coin) => void
  isLoading?: boolean
}

export function CoinTable({ coins, onCoinClick, isLoading = false }: CoinTableProps) {
  const { sort, setSort } = useStore()

  const sortedCoins = useMemo(() => {
    return sortCoins(coins, sort)
  }, [coins, sort])

  const handleSort = (field: typeof sort.field) => {
    setSort({
      field,
      direction:
        sort.field === field && sort.direction === 'desc' ? 'asc' : 'desc',
    })
  }

  const getSortIndicator = (field: typeof sort.field) => {
    if (sort.field !== field) return ''
    return sort.direction === 'desc' ? ' ↓' : ' ↑'
  }

  const getChangeColor = (value: number) => {
    if (value > 0) return 'text-bullish'
    if (value < 0) return 'text-bearish'
    return 'text-neutral'
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-900 sticky top-0">
          <tr>
            <th
              className="px-4 py-2 text-left cursor-pointer hover:bg-gray-800"
              onClick={() => handleSort('symbol')}
            >
              Symbol{getSortIndicator('symbol')}
            </th>
            <th
              className="px-4 py-2 text-right cursor-pointer hover:bg-gray-800"
              onClick={() => handleSort('lastPrice')}
            >
              Price{getSortIndicator('lastPrice')}
            </th>
            <th
              className="px-4 py-2 text-right cursor-pointer hover:bg-gray-800"
              onClick={() => handleSort('priceChangePercent')}
            >
              Change %{getSortIndicator('priceChangePercent')}
            </th>
            <th
              className="px-4 py-2 text-right cursor-pointer hover:bg-gray-800"
              onClick={() => handleSort('volume')}
            >
              Volume{getSortIndicator('volume')}
            </th>
            <th
              className="px-4 py-2 text-right cursor-pointer hover:bg-gray-800"
              onClick={() => handleSort('quoteVolume')}
            >
              Quote Vol{getSortIndicator('quoteVolume')}
            </th>
            <th
              className="px-4 py-2 text-right cursor-pointer hover:bg-gray-800"
              onClick={() => handleSort('vcp')}
            >
              VCP{getSortIndicator('vcp')}
            </th>
            <th
              className="px-4 py-2 text-right cursor-pointer hover:bg-gray-800"
              onClick={() => handleSort('priceToWeightedAvg')}
            >
              P/WA{getSortIndicator('priceToWeightedAvg')}
            </th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            // Show skeleton rows while loading
            Array.from({ length: 8 }).map((_, i) => <TableRowSkeleton key={i} />)
          ) : (
            sortedCoins.map((coin) => (
              <tr
                key={coin.id}
                onClick={() => onCoinClick?.(coin)}
                className="border-b border-gray-800 hover:bg-gray-900 cursor-pointer transition-colors"
              >
                <td className="px-4 py-2 font-medium">{coin.symbol}</td>
                <td className="px-4 py-2 text-right mono-number">
                  {formatPrice(coin.lastPrice)}
                </td>
                <td
                  className={`px-4 py-2 text-right mono-number font-medium ${getChangeColor(coin.priceChangePercent)}`}
                >
                  {formatPercent(coin.priceChangePercent)}
                </td>
                <td className="px-4 py-2 text-right mono-number text-gray-400">
                  {formatVolume(coin.volume)}
                </td>
                <td className="px-4 py-2 text-right mono-number text-gray-400">
                  {formatVolume(coin.quoteVolume)}
                </td>
                <td
                  className={`px-4 py-2 text-right mono-number ${getChangeColor(coin.indicators.vcp)}`}
                >
                  {coin.indicators.vcp.toFixed(3)}
                </td>
                <td className="px-4 py-2 text-right mono-number text-gray-400">
                  {coin.indicators.priceToWeightedAvg.toFixed(3)}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {sortedCoins.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No coins found for this pair
        </div>
      )}
    </div>
  )
}
