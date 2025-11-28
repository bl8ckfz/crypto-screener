import { Timeframe } from './coin'

/**
 * Alert type categories
 */
export type AlertType =
  | 'price_pump' // Significant price increase
  | 'price_dump' // Significant price decrease
  | 'volume_spike' // Volume significantly increased
  | 'volume_drop' // Volume significantly decreased
  | 'vcp_signal' // VCP pattern detected
  | 'fibonacci_break' // Price broke Fibonacci level
  | 'trend_reversal' // Trend direction changed
  | 'custom' // User-defined custom alert

/**
 * Alert severity levels
 */
export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical'

/**
 * Alert trigger condition
 */
export interface AlertCondition {
  type: AlertType
  threshold: number // e.g., 5 for 5% price change
  timeframe?: Timeframe // Optional timeframe for the condition
  comparison: 'greater_than' | 'less_than' | 'equals'
}

/**
 * Alert notification
 */
export interface Alert {
  id: string
  symbol: string
  type: AlertType
  severity: AlertSeverity
  title: string
  message: string
  value: number // The value that triggered the alert
  threshold: number // The threshold that was crossed
  timeframe?: Timeframe
  timestamp: number
  read: boolean
  dismissed: boolean
}

/**
 * Alert rule (user-configured)
 */
export interface AlertRule {
  id: string
  name: string
  enabled: boolean
  symbols: string[] // Empty array means all symbols
  conditions: AlertCondition[]
  severity: AlertSeverity
  notificationEnabled: boolean
  soundEnabled: boolean
  createdAt: number
  lastTriggered?: number
}

/**
 * Alert settings
 */
export interface AlertSettings {
  enabled: boolean
  soundEnabled: boolean
  notificationEnabled: boolean
  maxAlertsPerSymbol: number // Prevent spam
  alertCooldown: number // Seconds between alerts for same symbol
  autoDismissAfter: number // Auto-dismiss alerts after N seconds (0 = never)
}

/**
 * Alert history item
 */
export interface AlertHistoryItem extends Alert {
  acknowledgedAt?: number
  acknowledgedBy?: string
}

/**
 * Alert statistics
 */
export interface AlertStats {
  total: number
  unread: number
  byType: Record<AlertType, number>
  bySeverity: Record<AlertSeverity, number>
  last24h: number
  mostActiveSymbol: string
}
