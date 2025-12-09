import type { CombinedAlertType } from '@/types/alert'
import { FUTURES_ALERT_LABELS } from '@/types/alert'

interface AlertBadgesProps {
  alertTypes: Set<CombinedAlertType>
  maxVisible?: number
}

/**
 * Display alert type badges with colors matching alert severity
 * Shows first N badges, then "+X more" if there are additional types
 */
export function AlertBadges({ alertTypes, maxVisible = 3 }: AlertBadgesProps) {
  const types = Array.from(alertTypes)
  const visibleTypes = types.slice(0, maxVisible)
  const remainingCount = Math.max(0, types.length - maxVisible)

  const getAlertBadgeColor = (type: CombinedAlertType): string => {
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
      {visibleTypes.map((type) => (
        <span
          key={type}
          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${getAlertBadgeColor(type)}`}
        >
          {getAlertLabel(type)}
        </span>
      ))}
      {remainingCount > 0 && (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border bg-gray-700/50 text-gray-400 border-gray-600">
          +{remainingCount} more
        </span>
      )}
    </div>
  )
}
