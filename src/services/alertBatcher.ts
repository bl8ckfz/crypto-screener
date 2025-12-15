/**
 * Alert Batching Service for Futures Alerts
 * 
 * Batches alerts over a configurable time window to prevent Discord rate limits
 * and provide better context with summary messages showing alert statistics.
 * 
 * Features:
 * - Collects alerts for 30-60 seconds before sending
 * - Single summary message per batch instead of one per alert
 * - Shows alert count per symbol with recent history (last hour)
 * - Severity breakdown and timeframe analysis
 * - Prevents Discord rate limit issues (5 messages per 5 seconds)
 */

import type { Alert } from '@/types/alert'

interface AlertBatch {
  alerts: Alert[]
  batchStartTime: number
  symbols: Set<string>
}

interface SymbolStats {
  symbol: string
  count: number // Count in current batch
  types: Set<string> // Types in current batch
  severities: Set<string> // Severities in current batch
  lastHourCount: number // Count in last hour (including batch)
  lastDayCount: number // Count in last 24 hours
  recentTypes: string[] // Last 3 alert types (most recent first)
}

interface AlertSummary {
  totalAlerts: number
  batchDuration: number // seconds
  symbolStats: SymbolStats[]
  severityBreakdown: Record<string, number>
  timeframeBreakdown: Record<string, number>
  batchStartTime: number
  batchEndTime: number
}

/**
 * Singleton class for batching futures alerts
 */
class AlertBatcherService {
  private currentBatch: AlertBatch | null = null
  private batchTimeoutId: number | null = null
  private alertHistory: Map<string, Array<{ timestamp: number; type: string }>> = new Map() // symbol -> alert details
  private readonly batchWindowMs: number
  private readonly hourWindowMs: number = 60 * 60 * 1000 // 1 hour
  private readonly dayWindowMs: number = 24 * 60 * 60 * 1000 // 24 hours
  private onBatchReadyCallback: ((summary: AlertSummary, alerts: Alert[]) => void) | null = null

  constructor(batchWindowMs: number = 60000) {
    this.batchWindowMs = batchWindowMs // Default: 60 seconds
  }

  /**
   * Add alert to current batch
   * Starts a new batch if none exists
   */
  addAlert(alert: Alert): void {
    // Initialize batch if needed
    if (!this.currentBatch) {
      this.startNewBatch()
    }

    // Add to current batch
    this.currentBatch!.alerts.push(alert)
    this.currentBatch!.symbols.add(alert.symbol)

    // Track in history for "recent count" calculations
    this.addToHistory(alert.symbol, alert.timestamp, alert.type)

    console.log(`📦 Added alert to batch: ${alert.symbol} (${alert.type}) - Batch size: ${this.currentBatch!.alerts.length}`)
  }

  /**
   * Register callback for when batch is ready to send
   */
  onBatchReady(callback: (summary: AlertSummary, alerts: Alert[]) => void): void {
    this.onBatchReadyCallback = callback
  }

  /**
   * Start a new batch and schedule its completion
   */
  private startNewBatch(): void {
    const now = Date.now()
    
    this.currentBatch = {
      alerts: [],
      batchStartTime: now,
      symbols: new Set(),
    }

    console.log(`🆕 Started new alert batch (window: ${this.batchWindowMs}ms)`)

    // Schedule batch completion
    if (this.batchTimeoutId !== null) {
      clearTimeout(this.batchTimeoutId)
    }

    this.batchTimeoutId = window.setTimeout(() => {
      this.completeBatch()
    }, this.batchWindowMs)
  }

  /**
   * Complete current batch and send summary
   */
  private completeBatch(): void {
    if (!this.currentBatch || this.currentBatch.alerts.length === 0) {
      console.log('📦 Batch timer expired but no alerts to send')
      this.currentBatch = null
      this.batchTimeoutId = null
      return
    }

    const summary = this.generateSummary(this.currentBatch)
    const alerts = [...this.currentBatch.alerts]

    console.log(`✅ Batch complete: ${alerts.length} alerts from ${summary.symbolStats.length} symbols`)

    // Send to callback
    if (this.onBatchReadyCallback) {
      this.onBatchReadyCallback(summary, alerts)
    }

    // Reset batch
    this.currentBatch = null
    this.batchTimeoutId = null
  }

  /**
   * Generate summary statistics from batch and history
   * Shows most active symbols from LAST HOUR, not just current batch
   */
  private generateSummary(batch: AlertBatch): AlertSummary {
    const now = Date.now()
    const symbolStatsMap = new Map<string, SymbolStats>()
    const severityBreakdown: Record<string, number> = {}
    const timeframeBreakdown: Record<string, number> = {}

    // First, get all symbols with alerts in last hour from history
    const hourCutoff = now - this.hourWindowMs
    const dayCutoff = now - this.dayWindowMs
    
    for (const [symbol, history] of this.alertHistory.entries()) {
      const hourAlerts = history.filter(h => h.timestamp > hourCutoff)
      const dayAlerts = history.filter(h => h.timestamp > dayCutoff)
      
      if (hourAlerts.length > 0) {
        // Get last 3 alert types (most recent first)
        const recentTypes = hourAlerts
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, 3)
          .map(h => h.type)
        
        symbolStatsMap.set(symbol, {
          symbol,
          count: 0, // Will fill from batch alerts
          types: new Set(),
          severities: new Set(),
          lastHourCount: hourAlerts.length,
          lastDayCount: dayAlerts.length,
          recentTypes,
        })
      }
    }

    // Process current batch alerts
    for (const alert of batch.alerts) {
      // Ensure symbol is in map
      if (!symbolStatsMap.has(alert.symbol)) {
        symbolStatsMap.set(alert.symbol, {
          symbol: alert.symbol,
          count: 0,
          types: new Set(),
          severities: new Set(),
          lastHourCount: this.getRecentCount(alert.symbol, this.hourWindowMs),
          lastDayCount: this.getRecentCount(alert.symbol, this.dayWindowMs),
          recentTypes: this.getRecentTypes(alert.symbol, 3),
        })
      }
      
      const stats = symbolStatsMap.get(alert.symbol)!
      stats.count++ // Count in current batch
      stats.types.add(alert.type)
      stats.severities.add(alert.severity)

      // Severity breakdown
      severityBreakdown[alert.severity] = (severityBreakdown[alert.severity] || 0) + 1

      // Timeframe breakdown
      if (alert.timeframe) {
        timeframeBreakdown[alert.timeframe] = (timeframeBreakdown[alert.timeframe] || 0) + 1
      }
    }

    // Sort symbols by LAST HOUR count (most active in last hour first)
    const symbolStats = Array.from(symbolStatsMap.values())
      .sort((a, b) => b.lastHourCount - a.lastHourCount)

    return {
      totalAlerts: batch.alerts.length,
      batchDuration: Math.round((now - batch.batchStartTime) / 1000),
      symbolStats,
      severityBreakdown,
      timeframeBreakdown,
      batchStartTime: batch.batchStartTime,
      batchEndTime: now,
    }
  }

  /**
   * Track alert in history for recent count calculations
   */
  private addToHistory(symbol: string, timestamp: number, type: string): void {
    if (!this.alertHistory.has(symbol)) {
      this.alertHistory.set(symbol, [])
    }
    
    const history = this.alertHistory.get(symbol)!
    history.push({ timestamp, type })

    // Clean old entries (older than 24 hours)
    const cutoff = timestamp - this.dayWindowMs
    const filtered = history.filter(h => h.timestamp > cutoff)
    this.alertHistory.set(symbol, filtered)
  }

  /**
   * Get count of alerts for symbol in specified time window
   */
  private getRecentCount(symbol: string, windowMs: number): number {
    const history = this.alertHistory.get(symbol)
    if (!history) return 0

    const cutoff = Date.now() - windowMs
    return history.filter(h => h.timestamp > cutoff).length
  }

  /**
   * Get recent alert types for symbol (most recent first)
   */
  private getRecentTypes(symbol: string, limit: number): string[] {
    const history = this.alertHistory.get(symbol)
    if (!history) return []

    const cutoff = Date.now() - this.hourWindowMs
    return history
      .filter(h => h.timestamp > cutoff)
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit)
      .map(h => h.type)
  }

  /**
   * Force complete current batch immediately (useful for testing)
   */
  flushBatch(): void {
    if (this.batchTimeoutId !== null) {
      clearTimeout(this.batchTimeoutId)
    }
    this.completeBatch()
  }

  /**
   * Get current batch size (for debugging)
   */
  getCurrentBatchSize(): number {
    return this.currentBatch?.alerts.length || 0
  }

  /**
   * Configure batch window duration
   */
  setBatchWindow(ms: number): void {
    if (ms < 10000) {
      console.warn('⚠️ Batch window too short, minimum 10 seconds')
      return
    }
    if (ms > 300000) {
      console.warn('⚠️ Batch window too long, maximum 5 minutes')
      return
    }
    
    // @ts-expect-error - readonly property can be set in constructor
    this.batchWindowMs = ms
    console.log(`⚙️ Alert batch window set to ${ms}ms`)
  }
}

// Export singleton instance
export const alertBatcher = new AlertBatcherService(60000) // 60 second batches (1 minute)

// Export types
export type { AlertSummary, SymbolStats, AlertBatch }
