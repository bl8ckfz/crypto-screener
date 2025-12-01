import type { Coin, CoinSort, CoinSortField, SortDirection } from '@/types/coin'
import { memoize } from './performance'

/**
 * Get value from coin for sorting
 */
function getCoinSortValue(coin: Coin, field: CoinSortField): number | string {
  switch (field) {
    case 'symbol':
      return coin.symbol
    case 'lastPrice':
      return coin.lastPrice
    case 'priceChangePercent':
      return coin.priceChangePercent
    case 'volume':
      return coin.volume
    case 'quoteVolume':
      return coin.quoteVolume
    case 'vcp':
      return coin.indicators.vcp
    case 'priceToWeightedAvg':
      return coin.indicators.priceToWeightedAvg
    case 'highToLow':
      return coin.indicators.highToLow
    case 'count':
      return coin.count
    default:
      return coin.lastPrice
  }
}

/**
 * Compare two values for sorting
 */
function compareValues(
  a: number | string,
  b: number | string,
  direction: SortDirection
): number {
  let result: number

  if (typeof a === 'string' && typeof b === 'string') {
    result = a.localeCompare(b)
  } else {
    result = (a as number) - (b as number)
  }

  return direction === 'desc' ? -result : result
}

/**
 * Sort coins by field and direction
 */
export function sortCoins(
  coins: Coin[],
  sort: CoinSort
): Coin[] {
  return [...coins].sort((a, b) => {
    const aValue = getCoinSortValue(a, sort.field)
    const bValue = getCoinSortValue(b, sort.field)
    return compareValues(aValue, bValue, sort.direction)
  })
}

/**
 * Sort coins by multiple fields
 */
export function sortCoinsByMultiple(
  coins: Coin[],
  sorts: CoinSort[]
): Coin[] {
  return [...coins].sort((a, b) => {
    for (const sort of sorts) {
      const aValue = getCoinSortValue(a, sort.field)
      const bValue = getCoinSortValue(b, sort.field)
      const comparison = compareValues(aValue, bValue, sort.direction)

      if (comparison !== 0) {
        return comparison
      }
    }
    return 0
  })
}

/**
 * Get top N coins by field
 */
export function getTopCoins(
  coins: Coin[],
  field: CoinSortField,
  limit: number = 10
): Coin[] {
  const sorted = sortCoins(coins, { field, direction: 'desc' })
  return sorted.slice(0, limit)
}

/**
 * Get bottom N coins by field
 */
export function getBottomCoins(
  coins: Coin[],
  field: CoinSortField,
  limit: number = 10
): Coin[] {
  const sorted = sortCoins(coins, { field, direction: 'asc' })
  return sorted.slice(0, limit)
}

/**
 * Sort coins by screening list - Internal implementation
 * Lists 0-134: Bull mode (descending - highest first)
 * Lists 300-434: Bear mode (ascending - lowest first)
 * 
 * Note: sortField from list definition should map to a valid CoinSortField
 * For advanced fields not yet in CoinSortField, falls back to VCP sorting
 */
function sortCoinsByListInternal(
  coins: Coin[],
  listId: number,
  listSortField?: string,
  isBull?: boolean
): Coin[] {
  // Fallback to default if list data not provided
  if (!listSortField) {
    console.warn(`No sort field provided for list ${listId}, using VCP`)
    return sortCoins(coins, { field: 'vcp', direction: 'desc' })
  }

  // Map list sortField to CoinSortField (some advanced fields may not exist yet)
  const sortFieldMap: Record<string, CoinSortField> = {
    'vcp': 'vcp',
    'priceToWeightedAvg': 'priceToWeightedAvg',
    'priceChangePercent': 'priceChangePercent',
    'volume': 'volume',
    'quoteVolume': 'quoteVolume',
    'count': 'count',
    'highToLow': 'highToLow',
    'lastPrice': 'lastPrice',
    'symbol': 'symbol',
  }

  const sortField = sortFieldMap[listSortField] || 'vcp'
  const direction: SortDirection = isBull !== false ? 'desc' : 'asc'

  return sortCoins(coins, { field: sortField, direction })
}

// Memoized version with 30s cache (shorter since sorting is less expensive than calculations)
const sortCoinsByListMemoized = memoize(sortCoinsByListInternal, {
  maxSize: 50,
  maxAge: 30000,
})

/**
 * Sort coins by screening list (memoized)
 */
export function sortCoinsByList(
  coins: Coin[],
  listId: number,
  listSortField?: string,
  isBull?: boolean
): Coin[] {
  return sortCoinsByListMemoized(coins, listId, listSortField, isBull)
}
