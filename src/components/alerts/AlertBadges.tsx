import type { CombinedAlertType } from '@/types/alert'
import { FUTURES_ALERT_LABELS } from '@/types/alert'

interface AlertBadgesProps {
  alertTypes: Set<CombinedAlertType>
  maxVisible?: number
  latestAlertType?: CombinedAlertType // Highlight this alert as the most recent
}

/**
 * Display alert type badges with colors matching alert severity
 * Shows first N badges, then "+X more" if there are additional types
 */
export function AlertBadges({ alertTypes, maxVisible = 3, latestAlertType }: AlertBadgesProps) {
  const types = Array.from(alertTypes)
  const visibleTypes = types.slice(0, maxVisible)
  const remainingCount = Math.max(0, types.length - maxVisible)

  const getAlertBadgeColor = (type: CombinedAlertType, isLatest: boolean): string => {
    // Latest alert gets bright highlight
    if (isLatest) {
      // Bullish latest alert - bright green
      if ([
        'futures_big_bull_60',
        'futures_pioneer_bull',
        'futures_5_big_bull',
        'futures_15_big_bull',
        'futures_bottom_hunter'
      ].includes(type)) {
        return 'bg-green-500/40 text-green-300 border-green-400 ring-2 ring-green-400/50'
      }
      
      // Bearish latest alert - bright red
      if ([
        'futures_big_bear_60',
        'futures_pioneer_bear',
        'futures_5_big_bear',
        'futures_15_big_bear',
        'futures_top_hunter'
      ].includes(type)) {
        return 'bg-red-500/40 text-red-300 border-red-400 ring-2 ring-red-400/50'
      }
      
      // Fallback latest - bright gray
      return 'bg-gray-400/40 text-gray-200 border-gray-300 ring-2 ring-gray-400/50'
    }
    // Bullish futures alerts - green gamma
    if ([
      'futures_big_bull_60',
      'futures_pioneer_bull',
      'futures_5_big_bull',
      'futures_15_big_bull',
      'futures_bottom_hunter'
    ].includes(type)) {
      return 'bg-green-500/20 text-green-400 border-green-500/50'
    }
    
    // Bearish futures alerts - red gamma
    if ([
      'futures_big_bear_60',
      'futures_pioneer_bear',
      'futures_5_big_bear',
      'futures_15_big_bear',
      'futures_top_hunter'
    ].includes(type)) {
      return 'bg-red-500/20 text-red-400 border-red-500/50'
    }
    
    // Fallback - gray
    return 'bg-gray-500/20 text-gray-400 border-gray-500/50'
  }

  const getAlertLabel = (type: CombinedAlertType): string => {
    // Futures alerts only - remove prefix for display
    if (type.startsWith('futures_')) {
      const futuresLabels = FUTURES_ALERT_LABELS as Record<string, string>
      return futuresLabels[type] || type
    }
    // Fallback for any non-futures types
    return type
  }

  if (types.length === 0) {
    return null
  }

  return (
    <div className="flex flex-wrap gap-1">
      {visibleTypes.map((type) => {
        const isLatest = latestAlertType === type
        return (
          <span
            key={type}
            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border transition-all ${getAlertBadgeColor(type, isLatest)}`}
            title={isLatest ? 'Latest alert' : undefined}
          >
            {getAlertLabel(type)}
          </span>
        )
      })}
      {remainingCount > 0 && (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border bg-gray-700/50 text-gray-400 border-gray-600">
          +{remainingCount} more
        </span>
      )}
    </div>
  )
}
