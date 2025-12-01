/**
 * Formatting utilities for displaying coin data
 */

/**
 * Format number with specified decimal places and comma separators
 */
export function formatNumber(
  value: number,
  decimals: number = 2,
  showSign: boolean = false
): string {
  // Check if value is a whole number (integer)
  const isWholeNumber = Number.isInteger(value)
  
  // If it's a whole number and decimals wasn't explicitly specified (using default),
  // format without decimals
  const effectiveDecimals = isWholeNumber && decimals === 2 ? 0 : decimals
  
  const formatted = value.toFixed(effectiveDecimals)
  // Add comma separators
  const parts = formatted.split('.')
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  
  const withCommas = effectiveDecimals === 0 ? parts[0] : parts.join('.')
  
  if (showSign && value > 0) {
    return `+${withCommas}`
  }
  return withCommas
}

/**
 * Format price with dynamic decimal places based on value
 * Always shows decimal places for prices
 */
export function formatPrice(price: number, decimals?: number): string {
  if (price === 0) return '0.00'
  
  // If custom decimals specified, use them
  if (decimals !== undefined) {
    // Force showing decimals by using toFixed directly with commas
    const formatted = price.toFixed(decimals)
    const parts = formatted.split('.')
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    return parts.join('.')
  }
  
  // Dynamic decimals based on price magnitude - always show decimals
  const absPrice = Math.abs(price)
  let targetDecimals = 2
  if (absPrice >= 1000) targetDecimals = 2
  else if (absPrice >= 1) targetDecimals = 2
  else if (absPrice >= 0.01) targetDecimals = 2
  else targetDecimals = 8
  
  const formatted = price.toFixed(targetDecimals)
  const parts = formatted.split('.')
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return parts.join('.')
}

/**
 * Format percentage with sign (always shows decimals)
 */
export function formatPercent(value: number, decimals: number = 2): string {
  // Always show decimals for percentages
  const formatted = value.toFixed(decimals)
  const sign = value > 0 ? '+' : ''
  return sign + formatted + '%'
}

/**
 * Format large numbers with K/M/B suffixes (no comma separators in suffix format)
 */
export function formatLargeNumber(value: number, decimals: number = 2): string {
  if (Math.abs(value) >= 1_000_000_000) {
    return (value / 1_000_000_000).toFixed(decimals) + 'B'
  }
  if (Math.abs(value) >= 1_000_000) {
    return (value / 1_000_000).toFixed(decimals) + 'M'
  }
  if (Math.abs(value) >= 1_000) {
    return (value / 1_000).toFixed(decimals) + 'K'
  }
  return formatNumber(value, decimals)
}

/**
 * Format volume (quote volume)
 */
export function formatVolume(volume: number): string {
  const absVolume = Math.abs(volume)
  
  // For small volumes, return without suffix and without decimals
  if (absVolume < 1000) {
    return formatNumber(volume, 0)
  }
  
  // For large volumes, use suffix
  return formatLargeNumber(volume, 2)
}

/**
 * Format timestamp to time string
 */
export function formatTime(timestamp: number): string {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
}

/**
 * Format timestamp to date string
 */
export function formatDate(timestamp: number): string {
  const date = new Date(timestamp)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

/**
 * Format timestamp to full date and time
 */
export function formatDateTime(timestamp: number): string {
  return `${formatDate(timestamp)} ${formatTime(timestamp)}`
}

/**
 * Get relative time string (e.g., "2 minutes ago")
 */
export function getRelativeTime(timestamp: number): string {
  const now = Date.now()
  const diff = now - timestamp
  const seconds = Math.floor(diff / 1000)

  if (seconds < 60) return `${seconds}s ago`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

/**
 * Format time ago from timestamp or Date object (e.g., "5s ago", "3m ago", "just now")
 */
export function formatTimeAgo(value: number | Date): string {
  const timestamp = value instanceof Date ? value.getTime() : value
  const now = Date.now()
  const diff = now - timestamp
  const seconds = Math.floor(diff / 1000)

  // "just now" only for very recent (< 5 seconds)
  if (seconds < 5) return 'just now'
  if (seconds < 60) return `${seconds}s ago`
  
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

/**
 * Truncate string to max length with ellipsis
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength - 3) + '...'
}

/**
 * Format coin symbol with pair (e.g., "BTC/USDT")
 */
export function formatSymbolWithPair(symbol: string, pair: string): string {
  return `${symbol}/${pair}`
}
