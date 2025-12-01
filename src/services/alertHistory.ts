import { Alert, AlertHistoryItem } from '@/types/alert'
import { storage } from './storage'

const ALERT_HISTORY_KEY = 'alert_history'
const MAX_HISTORY_ITEMS = 1000 // Keep last 1000 alerts

/**
 * Alert history service for IndexedDB persistence
 */
export class AlertHistoryService {
  /**
   * Add an alert to history
   */
  static async addToHistory(alert: Alert): Promise<void> {
    try {
      const history = await this.getHistory()
      const historyItem: AlertHistoryItem = {
        ...alert,
      }

      // Add new item at the beginning
      history.unshift(historyItem)

      // Keep only the most recent items
      if (history.length > MAX_HISTORY_ITEMS) {
        history.length = MAX_HISTORY_ITEMS
      }

      await storage.setItem(ALERT_HISTORY_KEY, JSON.stringify(history))
    } catch (error) {
      console.error('Failed to add alert to history:', error)
    }
  }

  /**
   * Get all alert history
   */
  static async getHistory(): Promise<AlertHistoryItem[]> {
    try {
      const data = await storage.getItem(ALERT_HISTORY_KEY)
      if (!data) return []
      return JSON.parse(data) as AlertHistoryItem[]
    } catch (error) {
      console.error('Failed to get alert history:', error)
      return []
    }
  }

  /**
   * Get history filtered by symbol
   */
  static async getHistoryBySymbol(symbol: string): Promise<AlertHistoryItem[]> {
    const history = await this.getHistory()
    return history.filter((item) => item.symbol === symbol)
  }

  /**
   * Get history filtered by type
   */
  static async getHistoryByType(type: string): Promise<AlertHistoryItem[]> {
    const history = await this.getHistory()
    return history.filter((item) => item.type === type)
  }

  /**
   * Get history within a time range
   */
  static async getHistoryByTimeRange(
    startTime: number,
    endTime: number
  ): Promise<AlertHistoryItem[]> {
    const history = await this.getHistory()
    return history.filter(
      (item) => item.timestamp >= startTime && item.timestamp <= endTime
    )
  }

  /**
   * Mark an alert as acknowledged
   */
  static async acknowledgeAlert(
    alertId: string,
    userId?: string
  ): Promise<void> {
    try {
      const history = await this.getHistory()
      const item = history.find((h) => h.id === alertId)
      if (item) {
        item.acknowledgedAt = Date.now()
        item.acknowledgedBy = userId
        await storage.setItem(ALERT_HISTORY_KEY, JSON.stringify(history))
      }
    } catch (error) {
      console.error('Failed to acknowledge alert:', error)
    }
  }

  /**
   * Clear all history
   */
  static async clearHistory(): Promise<void> {
    try {
      await storage.removeItem(ALERT_HISTORY_KEY)
    } catch (error) {
      console.error('Failed to clear alert history:', error)
    }
  }

  /**
   * Clear history older than specified days
   */
  static async clearOldHistory(days: number): Promise<void> {
    try {
      const cutoffTime = Date.now() - days * 24 * 60 * 60 * 1000
      const history = await this.getHistory()
      const filtered = history.filter((item) => item.timestamp >= cutoffTime)
      await storage.setItem(ALERT_HISTORY_KEY, JSON.stringify(filtered))
    } catch (error) {
      console.error('Failed to clear old history:', error)
    }
  }

  /**
   * Export history as JSON
   */
  static async exportHistory(): Promise<string> {
    const history = await this.getHistory()
    return JSON.stringify(history, null, 2)
  }

  /**
   * Export history as CSV
   */
  static async exportHistoryAsCSV(): Promise<string> {
    const history = await this.getHistory()
    if (history.length === 0) return ''

    // CSV header
    const headers = [
      'Timestamp',
      'Symbol',
      'Type',
      'Severity',
      'Title',
      'Message',
      'Value',
      'Threshold',
      'Timeframe',
      'Read',
      'Dismissed',
      'Acknowledged At',
      'Acknowledged By',
    ]

    // CSV rows
    const rows = history.map((item) => [
      new Date(item.timestamp).toISOString(),
      item.symbol,
      item.type,
      item.severity,
      `"${item.title.replace(/"/g, '""')}"`, // Escape quotes
      `"${item.message.replace(/"/g, '""')}"`,
      item.value,
      item.threshold,
      item.timeframe || '',
      item.read,
      item.dismissed,
      item.acknowledgedAt ? new Date(item.acknowledgedAt).toISOString() : '',
      item.acknowledgedBy || '',
    ])

    return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n')
  }

  /**
   * Get statistics about alert history
   */
  static async getStats() {
    const history = await this.getHistory()
    const now = Date.now()
    const oneDayAgo = now - 24 * 60 * 60 * 1000
    const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000

    return {
      total: history.length,
      last24h: history.filter((h) => h.timestamp >= oneDayAgo).length,
      lastWeek: history.filter((h) => h.timestamp >= oneWeekAgo).length,
      byType: history.reduce(
        (acc, h) => {
          acc[h.type] = (acc[h.type] || 0) + 1
          return acc
        },
        {} as Record<string, number>
      ),
      bySeverity: history.reduce(
        (acc, h) => {
          acc[h.severity] = (acc[h.severity] || 0) + 1
          return acc
        },
        {} as Record<string, number>
      ),
      mostActiveSymbol: Object.entries(
        history.reduce(
          (acc, h) => {
            acc[h.symbol] = (acc[h.symbol] || 0) + 1
            return acc
          },
          {} as Record<string, number>
        )
      ).sort(([, a], [, b]) => b - a)[0]?.[0] || '',
    }
  }
}

// Export singleton instance
export const alertHistory = AlertHistoryService
