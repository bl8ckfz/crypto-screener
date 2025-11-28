import { Timeframe, TIMEFRAMES } from '@/types/coin'

export interface TimeframeSelectorProps {
  selectedTimeframe: Timeframe
  onSelect: (timeframe: Timeframe) => void
  className?: string
}

/**
 * TimeframeSelector component for switching between different timeframes
 */
export function TimeframeSelector({
  selectedTimeframe,
  onSelect,
  className = '',
}: TimeframeSelectorProps) {
  return (
    <div className={`bg-gray-900 rounded-lg p-4 ${className}`}>
      <h3 className="text-sm font-medium text-gray-400 mb-3">Timeframe</h3>
      <div className="grid grid-cols-5 gap-2">
        {TIMEFRAMES.map((timeframe) => (
          <button
            key={timeframe}
            onClick={() => onSelect(timeframe)}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedTimeframe === timeframe
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            {timeframe}
          </button>
        ))}
      </div>
      <div className="mt-3 text-xs text-gray-400">
        View price changes over {selectedTimeframe}
      </div>
    </div>
  )
}
