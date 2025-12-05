import type { WarmupStatus } from '@/types/metrics'

// Utility function for conditional classnames
function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ')
}

interface LiveStatusBadgeProps {
  /** Whether WebSocket is connected */
  connected: boolean
  /** Timestamp of last data update (ms) */
  lastUpdate: number
  /** Warm-up status (null if not in WebSocket mode or fully warmed up) */
  warmupStatus?: WarmupStatus | null
  /** Additional CSS classes */
  className?: string
}

/**
 * LiveStatusBadge - Shows connection status and warm-up progress for WebSocket streaming
 * 
 * Used in WebSocket mode to replace manual refresh controls.
 * Shows:
 * - Connection status (connected/disconnected/stale)
 * - Live indicator (pulsing green dot when receiving data)
 * - Warm-up progress (percentage and timeframe readiness)
 * 
 * @example
 * // Basic usage
 * <LiveStatusBadge
 *   connected={wsConnected}
 *   lastUpdate={Date.now()}
 * />
 * 
 * @example
 * // With warm-up status
 * <LiveStatusBadge
 *   connected={wsConnected}
 *   lastUpdate={lastDataUpdate}
 *   warmupStatus={warmupStatus}
 * />
 */
export function LiveStatusBadge({
  connected,
  lastUpdate,
  warmupStatus,
  className,
}: LiveStatusBadgeProps) {
  const now = Date.now()
  const timeSinceUpdate = now - lastUpdate
  const isStale = timeSinceUpdate > 10000 // >10s is stale
  const isWarmingUp = warmupStatus && warmupStatus.overallProgress < 100

  // Determine status text and color
  const getStatus = () => {
    if (!connected) return { text: 'Disconnected', color: 'text-red-500' }
    if (isStale) return { text: 'Reconnecting...', color: 'text-yellow-500' }
    return { text: 'Live', color: 'text-green-500' }
  }

  const status = getStatus()

  // Format time since update
  const formatTimeSince = (ms: number): string => {
    const seconds = Math.floor(ms / 1000)
    if (seconds < 60) return `${seconds}s ago`
    const minutes = Math.floor(seconds / 60)
    return `${minutes}m ago`
  }

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      {/* Connection status */}
      <div className="flex items-center gap-2">
        {/* Status indicator dot */}
        <div
          className={cn(
            'w-2 h-2 rounded-full',
            connected && !isStale ? 'bg-green-500 animate-pulse' : 'bg-red-500'
          )}
          aria-label={status.text}
        />

        {/* Status text */}
        <span className={cn('text-sm font-medium', status.color)}>{status.text}</span>

        {/* Last update time */}
        {connected && !isStale && (
          <span className="text-xs text-muted-foreground">
            ({formatTimeSince(timeSinceUpdate)})
          </span>
        )}
      </div>

      {/* Warm-up progress */}
      {isWarmingUp && (
        <div className="flex flex-col gap-1">
          {/* Progress bar */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Warming up:</span>
            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${warmupStatus.overallProgress}%` }}
              />
            </div>
            <span className="text-xs font-medium text-primary">
              {warmupStatus.overallProgress.toFixed(0)}%
            </span>
          </div>

          {/* Timeframe readiness */}
          <div className="flex items-center gap-1 flex-wrap">
            {Object.entries(warmupStatus.timeframes).map(([timeframe, status]) => {
              const isReady = status.ready === status.total
              return (
                <span
                  key={timeframe}
                  className={cn(
                    'text-xs px-1.5 py-0.5 rounded',
                    isReady
                      ? 'bg-green-500/20 text-green-700 dark:text-green-300'
                      : 'bg-muted text-muted-foreground'
                  )}
                  title={`${status.ready}/${status.total} symbols ready`}
                >
                  {timeframe}
                </span>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
