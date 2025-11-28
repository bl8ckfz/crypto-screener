import { useStore } from '@/hooks/useStore'
import { getRelativeTime } from '@/utils/format'
import { useMarketData } from '@/hooks/useMarketData'

const REFRESH_OPTIONS = [5, 10, 15, 20, 30, 60] as const

export function RefreshControl() {
  const { autoRefresh, refreshInterval, setAutoRefresh, setRefreshInterval } =
    useStore()
  const { dataUpdatedAt, isRefetching } = useMarketData()

  return (
    <div className="bg-gray-900 rounded-lg p-4">
      <h3 className="text-sm font-semibold mb-3 text-gray-400">
        Auto-Refresh
      </h3>

      {/* Toggle Auto-Refresh */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm">Enabled</span>
        <button
          onClick={() => setAutoRefresh(!autoRefresh)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            autoRefresh ? 'bg-accent' : 'bg-gray-700'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              autoRefresh ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {/* Refresh Interval */}
      <div className="mb-3">
        <label className="text-sm text-gray-400 block mb-2">
          Interval (seconds)
        </label>
        <div className="grid grid-cols-3 gap-2">
          {REFRESH_OPTIONS.map((seconds) => (
            <button
              key={seconds}
              onClick={() => setRefreshInterval(seconds)}
              disabled={!autoRefresh}
              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                refreshInterval === seconds && autoRefresh
                  ? 'bg-accent text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              } ${!autoRefresh && 'opacity-50 cursor-not-allowed'}`}
            >
              {seconds}s
            </button>
          ))}
        </div>
      </div>

      {/* Last Update Info */}
      {dataUpdatedAt && (
        <div className="text-xs text-gray-500 text-center pt-3 border-t border-gray-800">
          {isRefetching ? (
            <span className="text-accent">Refreshing...</span>
          ) : (
            <span>Updated {getRelativeTime(dataUpdatedAt)}</span>
          )}
        </div>
      )}
    </div>
  )
}
