import { CoinSortField, SortDirection } from './coin'

/**
 * Screening list ID (1-134+)
 */
export type ScreeningListId = number

/**
 * Filter operator
 */
export type FilterOperator =
  | 'equals'
  | 'not_equals'
  | 'greater_than'
  | 'less_than'
  | 'greater_than_or_equal'
  | 'less_than_or_equal'
  | 'between'
  | 'in'
  | 'not_in'

/**
 * Screening filter condition
 */
export interface ScreenerFilter {
  field: CoinSortField | string
  operator: FilterOperator
  value: number | string | number[] | string[]
  label?: string
}

/**
 * Screening list configuration
 */
export interface ScreeningList {
  id: ScreeningListId
  name: string
  description?: string
  filters: ScreenerFilter[]
  sort?: {
    field: CoinSortField
    direction: SortDirection
  }
  isDefault?: boolean
  isCustom?: boolean
  createdAt?: number
  updatedAt?: number
}

/**
 * Predefined screening categories
 */
export type ScreeningCategory =
  | 'price_movers' // Top gainers, losers
  | 'volume' // High volume, volume spikes
  | 'technical' // VCP, Fibonacci breaks, etc.
  | 'trends' // Uptrends, downtrends, reversals
  | 'volatility' // High/low volatility
  | 'custom' // User-defined

/**
 * Screening result
 */
export interface ScreeningResult {
  listId: ScreeningListId
  coins: string[] // Array of coin symbols matching criteria
  count: number
  timestamp: number
}

/**
 * Watchlist (user-created coin list)
 */
export interface Watchlist {
  id: string
  name: string
  symbols: string[]
  color?: string
  icon?: string
  createdAt: number
  updatedAt: number
}

/**
 * Screening preset (quick filters)
 */
export interface ScreeningPreset {
  id: string
  name: string
  category: ScreeningCategory
  filters: ScreenerFilter[]
  description?: string
  icon?: string
}

/**
 * All 134 screening list definitions from fast.html
 * Lists 0-134: Bull market (descending sort - highest first)
 * Lists 300-434: Bear market (ascending sort - lowest first)
 */
export interface ScreeningListDefinition {
  id: number
  name: string
  description: string
  sortField: string // Maps to DATA array column or Coin field
  isBull: boolean // true for 0-134, false for 300-434
  category: ScreeningCategory
}

export const SCREENING_LISTS: ScreeningListDefinition[] = [
  // Core Lists
  { id: 0, name: 'Latest Listed', description: 'Latest Listed on Binance', sortField: 'listingDate', isBull: true, category: 'custom' },
  { id: 3, name: 'Price Pump Daily', description: 'Price Pump - Daily %', sortField: 'priceChangePercent', isBull: true, category: 'price_movers' },
  { id: 16, name: 'Volume', description: 'Trading Volume', sortField: 'volume', isBull: true, category: 'volume' },
  { id: 21, name: 'Trade Count', description: 'Number of Trades', sortField: 'count', isBull: true, category: 'volume' },
  { id: 22, name: 'VCP', description: 'Volatility Contraction Pattern = (P/WA) * [(close-low)-(high-close)]/(high-low)', sortField: 'vcp', isBull: true, category: 'technical' },
  { id: 23, name: 'P/WA', description: 'Last Price / Weighted Average Price', sortField: 'priceToWeightedAvg', isBull: true, category: 'technical' },
  { id: 24, name: 'At Highest', description: 'Last Price / High Price', sortField: 'priceToHigh', isBull: true, category: 'technical' },
  { id: 25, name: 'At Lowest', description: 'Low Price / Last Price', sortField: 'lowToPrice', isBull: true, category: 'technical' },
  { id: 26, name: 'Max Margin Range', description: 'High / Low Price', sortField: 'highToLow', isBull: true, category: 'volatility' },
  { id: 27, name: 'Max/Min Spread', description: 'Ask / Bid Price', sortField: 'askPrice', isBull: true, category: 'technical' },
  { id: 28, name: 'Last Qty / Volume', description: 'Last Quantity / Total Volume', sortField: 'askToVolume', isBull: true, category: 'volume' },
  { id: 29, name: 'Volume / Trade Count', description: 'Volume per Trade %', sortField: 'quoteToCount', isBull: true, category: 'volume' },
  
  // Fibonacci Pivot Lists
  { id: 30, name: 'Fibo Support S3', description: 'Price / Fibonacci Pivot Support (S3) = P - (1 * (High - Low))', sortField: 'support1', isBull: true, category: 'technical' },
  { id: 31, name: 'Newest Listings', description: 'Newest Coin Listings', sortField: 'listingDate', isBull: true, category: 'custom' },
  { id: 32, name: 'Fibo Pivot', description: 'WA + Fibonacci Pivot = (High + Low + Close) / 3', sortField: 'pivot', isBull: true, category: 'technical' },
  { id: 33, name: 'Price / Pivot', description: 'Last Price / Fibonacci Pivot', sortField: 'pivotToPrice', isBull: true, category: 'technical' },
  { id: 34, name: 'Fibo Support S1', description: 'Price / Fibonacci Pivot Support (S1) = P - (0.382 * (High - Low))', sortField: 'support0382', isBull: true, category: 'technical' },
  { id: 35, name: 'Fibo Support S2', description: 'Price / Fibonacci Pivot Support (S2) = P - (0.618 * (High - Low))', sortField: 'support0618', isBull: true, category: 'technical' },
  { id: 36, name: 'Fibo Resistance R1', description: 'Price / Fibonacci Pivot Resistance (R1) = P + (0.382 * (High - Low))', sortField: 'resistance0382', isBull: true, category: 'technical' },
  { id: 37, name: 'Fibo Resistance R2', description: 'Price / Fibonacci Pivot Resistance (R2) = P + (0.618 * (High - Low))', sortField: 'resistance0618', isBull: true, category: 'technical' },
  { id: 38, name: 'Fibo Resistance R3', description: 'Price / Fibonacci Pivot Resistance (R3) = P + (1 * (High - Low))', sortField: 'resistance1', isBull: true, category: 'technical' },
  
  // Price & Dominance Lists
  { id: 39, name: 'WA Price %', description: 'Weighted Average Price %', sortField: 'priceChangeFromWeightedAvg', isBull: true, category: 'price_movers' },
  { id: 40, name: 'Prev Price %', description: 'Last / Previous Close Price %', sortField: 'priceChangeFromPrevClose', isBull: true, category: 'price_movers' },
  { id: 41, name: 'Fibonacci Pivot', description: 'Fibonacci Pivot Point', sortField: 'pivot', isBull: true, category: 'technical' },
  { id: 42, name: 'ETH Dominance', description: 'ETH Dominance = Price % / ETH Price %', sortField: 'ethDominance', isBull: true, category: 'technical' },
  { id: 43, name: 'BTC Dominance', description: 'BTC Dominance = Price % / BTC Price %', sortField: 'btcDominance', isBull: true, category: 'technical' },
  { id: 44, name: 'PAXG Dominance', description: 'PAXG Dominance = Price % / PAXG Price %', sortField: 'paxgDominance', isBull: true, category: 'technical' },
  
  // Timeframe Comparative Lists (15s, 30s, 45s, 60s)
  { id: 48, name: 'P/WA 15s', description: 'P/WA Ratio 15 Seconds Ago', sortField: 'timeframe_15s_pwa', isBull: true, category: 'trends' },
  { id: 49, name: 'VCP 15s', description: 'VCP 15 Seconds Ago', sortField: 'timeframe_15s_vcp', isBull: true, category: 'trends' },
  { id: 53, name: 'P/WA 30s', description: 'P/WA Ratio 30 Seconds Ago', sortField: 'timeframe_30s_pwa', isBull: true, category: 'trends' },
  { id: 54, name: 'VCP 30s', description: 'VCP 30 Seconds Ago', sortField: 'timeframe_30s_vcp', isBull: true, category: 'trends' },
  { id: 58, name: 'P/WA 45s', description: 'P/WA Ratio 45 Seconds Ago', sortField: 'timeframe_45s_pwa', isBull: true, category: 'trends' },
  { id: 59, name: 'VCP 45s', description: 'VCP 45 Seconds Ago', sortField: 'timeframe_45s_vcp', isBull: true, category: 'trends' },
  { id: 63, name: 'P/WA 60s', description: 'P/WA Ratio 60 Seconds Ago', sortField: 'timeframe_60s_pwa', isBull: true, category: 'trends' },
  { id: 64, name: 'VCP 60s', description: 'VCP 60 Seconds Ago', sortField: 'timeframe_60s_vcp', isBull: true, category: 'trends' },
  { id: 68, name: 'P/WA Avg 60s', description: 'P/WA Average 15+30+45+60 Seconds', sortField: 'timeframe_avg_pwa', isBull: true, category: 'trends' },
  { id: 69, name: 'VCP Avg 60s', description: 'VCP Average 15+30+45+60 Seconds', sortField: 'timeframe_avg_vcp', isBull: true, category: 'trends' },
  
  // Current vs Historical (15s intervals)
  { id: 70, name: 'P/WA vs 15s', description: 'Current P/WA / 15 Seconds P/WA', sortField: 'delta_15s_pwa', isBull: true, category: 'trends' },
  { id: 71, name: 'VCP vs 15s', description: 'Current VCP / 15 Seconds VCP', sortField: 'delta_15s_vcp', isBull: true, category: 'trends' },
  { id: 72, name: 'P/WA vs 30s', description: 'Current P/WA / 30 Seconds P/WA', sortField: 'delta_30s_pwa', isBull: true, category: 'trends' },
  { id: 73, name: 'VCP vs 30s', description: 'Current VCP / 30 Seconds VCP', sortField: 'delta_30s_vcp', isBull: true, category: 'trends' },
  { id: 74, name: 'P/WA vs 45s', description: 'Current P/WA / 45 Seconds P/WA', sortField: 'delta_45s_pwa', isBull: true, category: 'trends' },
  { id: 75, name: 'VCP vs 45s', description: 'Current VCP / 45 Seconds VCP', sortField: 'delta_45s_vcp', isBull: true, category: 'trends' },
  { id: 76, name: 'P/WA vs 1m', description: 'Current P/WA / 1 Minute P/WA', sortField: 'delta_1m_pwa', isBull: true, category: 'trends' },
  { id: 77, name: 'VCP vs 1m', description: 'Current VCP / 1 Minute VCP', sortField: 'delta_1m_vcp', isBull: true, category: 'trends' },
  { id: 78, name: 'P/WA vs 3m', description: 'Current P/WA / 3 Minutes P/WA', sortField: 'delta_3m_pwa', isBull: true, category: 'trends' },
  { id: 79, name: 'VCP vs 3m', description: 'Current VCP / 3 Minutes VCP', sortField: 'delta_3m_vcp', isBull: true, category: 'trends' },
  { id: 80, name: 'P/WA vs 5m', description: 'Current P/WA / 5 Minutes P/WA', sortField: 'delta_5m_pwa', isBull: true, category: 'trends' },
  { id: 81, name: 'VCP vs 5m', description: 'Current VCP / 5 Minutes VCP', sortField: 'delta_5m_vcp', isBull: true, category: 'trends' },
  { id: 82, name: 'P/WA vs 15m', description: 'Current P/WA / 15 Minutes P/WA', sortField: 'delta_15m_pwa', isBull: true, category: 'trends' },
  { id: 83, name: 'VCP vs 15m', description: 'Current VCP / 15 Minutes VCP', sortField: 'delta_15m_vcp', isBull: true, category: 'trends' },
  
  // Pump Detection Lists
  { id: 84, name: 'VCP 60s / 1 Day', description: 'VCP 60 Seconds / 1 Day Ratio', sortField: 'vcp_60s_1d_ratio', isBull: true, category: 'volatility' },
  { id: 85, name: 'V Pump 15s', description: 'Volume Pump 15 Seconds', sortField: 'volume_pump_15s', isBull: true, category: 'volume' },
  { id: 86, name: 'P Pump 15s', description: 'Price Pump 15 Seconds', sortField: 'price_pump_15s', isBull: true, category: 'price_movers' },
  { id: 87, name: 'V Pump 30s', description: 'Volume Pump 30 Seconds', sortField: 'volume_pump_30s', isBull: true, category: 'volume' },
  { id: 88, name: 'P Pump 30s', description: 'Price Pump 30 Seconds', sortField: 'price_pump_30s', isBull: true, category: 'price_movers' },
  { id: 89, name: 'V Pump 45s', description: 'Volume Pump 45 Seconds', sortField: 'volume_pump_45s', isBull: true, category: 'volume' },
  { id: 90, name: 'P Pump 45s', description: 'Price Pump 45 Seconds', sortField: 'price_pump_45s', isBull: true, category: 'price_movers' },
  { id: 91, name: 'V Pump 1m', description: 'Volume Pump 1 Minute', sortField: 'volume_pump_1m', isBull: true, category: 'volume' },
  { id: 92, name: 'P Pump 1m', description: 'Price Pump 1 Minute', sortField: 'price_pump_1m', isBull: true, category: 'price_movers' },
  { id: 93, name: 'V Pump Avg 60s', description: 'Volume Pump 60 Seconds Average', sortField: 'volume_pump_avg', isBull: true, category: 'volume' },
  { id: 94, name: 'P Pump Avg 60s', description: 'Price Pump 60 Seconds Average', sortField: 'price_pump_avg', isBull: true, category: 'price_movers' },
  { id: 95, name: 'V/P 15*30*45*60', description: 'Volume/Price Combined 15+30+45+60', sortField: 'vp_combined', isBull: true, category: 'volume' },
  
  // Longer Timeframes (3m, 5m, 15m)
  { id: 99, name: 'P/WA 3m', description: 'P/WA 3 Minutes Ago', sortField: 'timeframe_3m_pwa', isBull: true, category: 'trends' },
  { id: 100, name: 'VCP 3m', description: 'VCP 3 Minutes Ago', sortField: 'timeframe_3m_vcp', isBull: true, category: 'trends' },
  { id: 104, name: 'P/WA 5m', description: 'P/WA 5 Minutes Ago', sortField: 'timeframe_5m_pwa', isBull: true, category: 'trends' },
  { id: 105, name: 'VCP 5m', description: 'VCP 5 Minutes Ago', sortField: 'timeframe_5m_vcp', isBull: true, category: 'trends' },
  { id: 109, name: 'P/WA 15m', description: 'P/WA 15 Minutes Ago', sortField: 'timeframe_15m_pwa', isBull: true, category: 'trends' },
  { id: 110, name: 'VCP 15m', description: 'VCP 15 Minutes Ago', sortField: 'timeframe_15m_vcp', isBull: true, category: 'trends' },
  
  // Timeframe Comparisons (1m vs 3m, 5m, 15m)
  { id: 111, name: 'Volume 1m/3m', description: 'Volume 1 Minute / 3 Minutes', sortField: 'volume_1m_3m', isBull: true, category: 'volume' },
  { id: 112, name: 'Price 1m/3m', description: 'Price 1 Minute / 3 Minutes', sortField: 'price_1m_3m', isBull: true, category: 'price_movers' },
  { id: 113, name: 'WA 1m/3m', description: 'Weighted Average 1 Minute / 3 Minutes', sortField: 'wa_1m_3m', isBull: true, category: 'technical' },
  { id: 114, name: 'P/WA 1m/3m', description: 'P/WA Ratio 1 Minute / 3 Minutes', sortField: 'pwa_1m_3m', isBull: true, category: 'trends' },
  { id: 115, name: 'VCP 1m/3m', description: 'VCP 1 Minute / 3 Minutes', sortField: 'vcp_1m_3m', isBull: true, category: 'trends' },
  { id: 116, name: 'Volume 1m/5m', description: 'Volume 1 Minute / 5 Minutes', sortField: 'volume_1m_5m', isBull: true, category: 'volume' },
  { id: 117, name: 'Price 1m/5m', description: 'Price 1 Minute / 5 Minutes', sortField: 'price_1m_5m', isBull: true, category: 'price_movers' },
  { id: 118, name: 'WA 1m/5m', description: 'Weighted Average 1 Minute / 5 Minutes', sortField: 'wa_1m_5m', isBull: true, category: 'technical' },
  { id: 119, name: 'P/WA 1m/5m', description: 'P/WA Ratio 1 Minute / 5 Minutes', sortField: 'pwa_1m_5m', isBull: true, category: 'trends' },
  { id: 120, name: 'VCP 1m/5m', description: 'VCP 1 Minute / 5 Minutes', sortField: 'vcp_1m_5m', isBull: true, category: 'trends' },
  
  // Ultra-Short Timeframes (5s, 10s)
  { id: 121, name: 'V Pump 5s', description: 'Volume Pump 5 Seconds', sortField: 'volume_pump_5s', isBull: true, category: 'volume' },
  { id: 122, name: 'P Pump 5s', description: 'Price Pump 5 Seconds', sortField: 'price_pump_5s', isBull: true, category: 'price_movers' },
  { id: 123, name: 'P/WA 5s', description: 'P/WA Ratio 5 Seconds', sortField: 'delta_5s_pwa', isBull: true, category: 'trends' },
  { id: 124, name: 'VCP 5s', description: 'VCP 5 Seconds', sortField: 'delta_5s_vcp', isBull: true, category: 'trends' },
  { id: 125, name: 'V Pump 10s', description: 'Volume Pump 10 Seconds', sortField: 'volume_pump_10s', isBull: true, category: 'volume' },
  { id: 126, name: 'P Pump 10s', description: 'Price Pump 10 Seconds', sortField: 'price_pump_10s', isBull: true, category: 'price_movers' },
  { id: 127, name: 'P/WA 10s', description: 'P/WA Ratio 10 Seconds', sortField: 'delta_10s_pwa', isBull: true, category: 'trends' },
  { id: 128, name: 'VCP 10s', description: 'VCP 10 Seconds', sortField: 'delta_10s_vcp', isBull: true, category: 'trends' },
  
  // Long Timeframe Pumps
  { id: 129, name: 'V Pump 3m', description: 'Volume Pump 3 Minutes', sortField: 'volume_pump_3m', isBull: true, category: 'volume' },
  { id: 130, name: 'P Pump 3m', description: 'Price Pump 3 Minutes', sortField: 'price_pump_3m', isBull: true, category: 'price_movers' },
  { id: 131, name: 'V Pump 5m', description: 'Volume Pump 5 Minutes', sortField: 'volume_pump_5m', isBull: true, category: 'volume' },
  { id: 132, name: 'P Pump 5m', description: 'Price Pump 5 Minutes', sortField: 'price_pump_5m', isBull: true, category: 'price_movers' },
  { id: 133, name: 'V Pump 15m', description: 'Volume Pump 15 Minutes', sortField: 'volume_pump_15m', isBull: true, category: 'volume' },
  { id: 134, name: 'P Pump 15m', description: 'Price Pump 15 Minutes', sortField: 'price_pump_15m', isBull: true, category: 'price_movers' },
]

// Helper function to get bear market list (adds 300 to ID, inverts sort)
export function getBearList(bullListId: number): ScreeningListDefinition | undefined {
  const bullList = SCREENING_LISTS.find(l => l.id === bullListId)
  if (!bullList) return undefined
  
  return {
    ...bullList,
    id: bullListId + 300,
    isBull: false,
    name: `${bullList.name} (Bear)`,
  }
}

// Get all lists (0-134 bull + 300-434 bear)
export function getAllScreeningLists(): ScreeningListDefinition[] {
  const bullLists = SCREENING_LISTS
  const bearLists = SCREENING_LISTS.map(list => ({
    ...list,
    id: list.id + 300,
    isBull: false,
    name: `${list.name} (Bear)`,
  }))
  return [...bullLists, ...bearLists]
}

// Get list by ID (supports both bull and bear)
export function getListById(id: number): ScreeningListDefinition | undefined {
  if (id >= 300) {
    return getBearList(id - 300)
  }
  return SCREENING_LISTS.find(l => l.id === id)
}

// Get lists by category
export function getListsByCategory(category: ScreeningCategory): ScreeningListDefinition[] {
  return SCREENING_LISTS.filter(l => l.category === category)
}

/**
 * Common screening presets (legacy support)
 */
export const SCREENING_PRESETS: ScreeningPreset[] = [
  {
    id: 'top_gainers',
    name: 'Top Gainers (24h)',
    category: 'price_movers',
    filters: [
      {
        field: 'priceChangePercent',
        operator: 'greater_than',
        value: 5,
        label: 'Price change > 5%',
      },
    ],
  },
  {
    id: 'top_losers',
    name: 'Top Losers (24h)',
    category: 'price_movers',
    filters: [
      {
        field: 'priceChangePercent',
        operator: 'less_than',
        value: -5,
        label: 'Price change < -5%',
      },
    ],
  },
  {
    id: 'high_volume',
    name: 'High Volume',
    category: 'volume',
    filters: [
      {
        field: 'quoteVolume',
        operator: 'greater_than',
        value: 1000000,
        label: 'Quote volume > 1M',
      },
    ],
  },
  {
    id: 'high_vcp',
    name: 'High VCP',
    category: 'technical',
    filters: [
      {
        field: 'vcp',
        operator: 'greater_than',
        value: 1,
        label: 'VCP > 1',
      },
    ],
  },
  {
    id: 'low_vcp',
    name: 'Low VCP',
    category: 'technical',
    filters: [
      {
        field: 'vcp',
        operator: 'less_than',
        value: -1,
        label: 'VCP < -1',
      },
    ],
  },
]
