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
  | 'pioneer_bull' // Legacy: PIONEER BULL ALARM (strong bull signal)
  | 'pioneer_bear' // Legacy: PIONEER BEAR ALARM (strong bear signal)
  | '5m_big_bull' // Legacy: 5m BIG BULL ALARM (5-minute volume spike)
  | '5m_big_bear' // Legacy: 5m BIG BEAR ALARM (5-minute volume drop)
  | '15m_big_bull' // Legacy: 15m BIG BULL ALARM (15-minute volume spike)
  | '15m_big_bear' // Legacy: 15m BIG BEAR ALARM (15-minute volume drop)
  | 'bottom_hunter' // Legacy: BOTTOM HUNTER ALARM (potential bottom reversal)
  | 'top_hunter' // Legacy: TOP HUNTER ALARM (potential top reversal)
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
  webhookEnabled?: boolean // Per-rule webhook override (if undefined, uses global setting)
  createdAt: number
  lastTriggered?: number
}

/**
 * Webhook configuration
 */
export interface WebhookConfig {
  id: string
  name: string
  type: 'discord' | 'telegram'
  url: string
  enabled: boolean
  createdAt: number
}

/**
 * Webhook delivery status
 */
export interface WebhookDelivery {
  id: string
  webhookId: string
  alertId: string
  status: 'pending' | 'success' | 'failed' | 'retrying'
  attempts: number
  lastAttempt: number
  error?: string
}

/**
 * Alert settings
 */
export interface AlertSettings {
  enabled: boolean
  soundEnabled: boolean
  notificationEnabled: boolean // In-app toast notifications
  browserNotificationEnabled: boolean // Browser desktop notifications
  webhookEnabled: boolean // Global webhook toggle
  discordWebhookUrl: string // Legacy: Primary Discord webhook (backwards compatibility)
  telegramBotToken: string // Telegram bot token
  telegramChatId: string // Telegram chat/channel ID
  webhooks: WebhookConfig[] // Multiple webhook configurations
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

/**
 * Legacy alert rule presets from fast.html
 * These replicate the original alert logic for backward compatibility
 */
export interface LegacyAlertPreset {
  type: AlertType
  name: string
  description: string
  conditions: {
    priceRatios?: Record<string, { min?: number; max?: number }> // e.g., { '1m/3m': { min: 1.01 } }
    volumeDeltas?: Record<string, { min?: number }> // e.g., { '5m': { min: 100000 } }
    volumeRatios?: Record<string, { min?: number }> // e.g., { 'current/1m': { min: 1.04 } }
    trendConditions?: string[] // Complex conditions like "price ascending across timeframes"
  }
  severity: AlertSeverity
  marketMode?: 'bull' | 'bear' | 'both' // Some alerts only trigger in bull/bear markets
}

/**
 * Predefined legacy alert presets
 */
export const LEGACY_ALERT_PRESETS: LegacyAlertPreset[] = [
  {
    type: 'pioneer_bull',
    name: 'Pioneer Bull',
    description: 'Strong bullish momentum with accelerating price growth',
    conditions: {
      priceRatios: {
        'current/3m': { min: 1.01 },
        'current/15m': { min: 1.01 },
      },
      volumeRatios: {
        'current/3m': { min: 1.5 }, // 2*current/3m > current/15m
        'current/15m': { min: 1 },
      },
      trendConditions: ['3*price_1m > price_5m', 'accelerating_momentum'],
    },
    severity: 'critical',
    marketMode: 'bull',
  },
  {
    type: 'pioneer_bear',
    name: 'Pioneer Bear',
    description: 'Strong bearish momentum with accelerating price decline',
    conditions: {
      priceRatios: {
        'current/3m': { max: 0.99 }, // price < 2-1.01 = 0.99
        'current/15m': { max: 0.99 },
      },
      volumeRatios: {
        'current/3m': { min: 1.5 },
        'current/15m': { min: 1 },
      },
      trendConditions: ['3*price_1m < price_5m', 'accelerating_momentum'],
    },
    severity: 'critical',
    marketMode: 'bear',
  },
  {
    type: '5m_big_bull',
    name: '5m Big Bull',
    description: '5-minute significant volume and price increase',
    conditions: {
      priceRatios: {
        'current/3m': { min: 1.006 },
      },
      volumeDeltas: {
        '3m_delta': { min: 100000 },
        '5m_delta': { min: 50000 },
      },
      trendConditions: [
        'price: 3m < 1m < current',
        'volume: 3m < 1m < 5m < current',
      ],
    },
    severity: 'high',
    marketMode: 'bull',
  },
  {
    type: '5m_big_bear',
    name: '5m Big Bear',
    description: '5-minute significant volume and price decrease',
    conditions: {
      priceRatios: {
        'current/3m': { max: 0.994 }, // < 2-1.006
      },
      volumeDeltas: {
        '3m_delta': { min: 100000 },
        '5m_delta': { min: 50000 },
      },
      trendConditions: [
        'price: 3m > 1m > current',
        'volume: 3m < 1m < 5m < current',
      ],
    },
    severity: 'high',
    marketMode: 'bear',
  },
  {
    type: '15m_big_bull',
    name: '15m Big Bull',
    description: '15-minute significant volume and price increase',
    conditions: {
      priceRatios: {
        'current/15m': { min: 1.01 },
        'current/3m': { min: 1 },
        '3m/15m': { min: 1 },
      },
      volumeDeltas: {
        '15m_delta': { min: 400000 },
        '3m_delta': { min: 100000 },
      },
      trendConditions: [
        'price: 15m < 3m < current',
        'volume: 15m < 3m < 5m < current',
      ],
    },
    severity: 'high',
    marketMode: 'bull',
  },
  {
    type: '15m_big_bear',
    name: '15m Big Bear',
    description: '15-minute significant volume and price decrease',
    conditions: {
      priceRatios: {
        'current/15m': { max: 0.99 },
        'current/3m': { max: 1 },
        '3m/15m': { max: 1 },
      },
      volumeDeltas: {
        '15m_delta': { min: 400000 },
        '3m_delta': { min: 100000 },
      },
      trendConditions: [
        'price: 15m > 3m > current',
        'volume: 15m < 3m < 5m < current',
      ],
    },
    severity: 'high',
    marketMode: 'bear',
  },
  {
    type: 'bottom_hunter',
    name: 'Bottom Hunter',
    description: 'Potential bottom reversal - price declining but showing support',
    conditions: {
      priceRatios: {
        'current/15m': { max: 0.994 }, // < 2-1.006
        'current/3m': { max: 0.995 }, // < 2-1.005
        'current/1m': { min: 1.004 },
      },
      volumeRatios: {
        'current/5m': { min: 1 },
        '5m/3m': { min: 1 },
      },
      trendConditions: ['price_declining_then_reversing', 'volume_increasing'],
    },
    severity: 'medium',
    marketMode: 'both',
  },
  {
    type: 'top_hunter',
    name: 'Top Hunter',
    description: 'Potential top reversal - price rising but losing momentum',
    conditions: {
      priceRatios: {
        'current/15m': { min: 1.006 },
        'current/3m': { min: 1.005 },
        'current/1m': { min: 0.996 }, // > 2-1.004
      },
      volumeRatios: {
        'current/5m': { min: 1 },
        '5m/3m': { min: 1 },
      },
      trendConditions: ['price_rising_then_slowing', 'volume_increasing'],
    },
    severity: 'medium',
    marketMode: 'both',
  },
]
