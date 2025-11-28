/**
 * Formatting utilities for displaying coin data
 */

/**
 * Format number with specified decimal places
 */
export function formatNumber(
  value: number,
  decimals: number = 2,
  showSign: boolean = false
): string {
  const formatted = value.toFixed(decimals)
  if (showSign && value > 0) {
    return `+${formatted}`
  }
  return formatted
}

/**
 * Format price with dynamic decimal places based on value
 */
export function formatPrice(price: number): string {
  if (price === 0) return '0.00'
  if (price >= 1000) return formatNumber(price, 2)
  if (price >= 1) return formatNumber(price, 4)
  if (price >= 0.01) return formatNumber(price, 6)
  return formatNumber(price, 8)
}

/**
 * Format percentage with sign
 */
export function formatPercent(value: number, decimals: number = 2): string {
  return formatNumber(value, decimals, true) + '%'
}

/**
 * Format large numbers with K/M/B suffixes
 */
export function formatLargeNumber(value: number, decimals: number = 2): string {
  if (value >= 1_000_000_000) {
    return formatNumber(value / 1_000_000_000, decimals) + 'B'
  }
  if (value >= 1_000_000) {
    return formatNumber(value / 1_000_000, decimals) + 'M'
  }
  if (value >= 1_000) {
    return formatNumber(value / 1_000, decimals) + 'K'
  }
  return formatNumber(value, decimals)
}

/**
 * Format volume (quote volume)
 */
export function formatVolume(volume: number): string {
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
