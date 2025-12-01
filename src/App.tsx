import { useState, useMemo, useRef, lazy, Suspense } from 'react'
import { useMarketData } from '@/hooks/useMarketData'
import { useStore } from '@/hooks/useStore'
import { useKeyboardShortcuts } from '@/hooks'
import { Layout, Sidebar } from '@/components/layout'
import { SmartCoinTable } from '@/components/coin'
import { MarketSummary } from '@/components/market'
import {
  PairSelector,
  RefreshControl,
  SearchBar,
  TimeframeSelector,
  ListSelector,
  ExportButton,
} from '@/components/controls'
import { ErrorStates, EmptyStates, ShortcutHelp } from '@/components/ui'
import { StorageMigration } from '@/components/StorageMigration'
import { AlertNotificationContainer, AlertConfig, AlertHistory } from '@/components/alerts'
import { sortCoinsByList } from '@/utils'
import { getListById } from '@/types'
import type { Coin, Timeframe } from '@/types/coin'

// Lazy load heavy components
const CoinModal = lazy(() => import('@/components/coin/CoinModal').then(m => ({ default: m.CoinModal })))

function App() {
  const { data: coins, isLoading, error } = useMarketData()
  const currentPair = useStore((state) => state.currentPair)
  const currentList = useStore((state) => state.currentList)
  const setCurrentList = useStore((state) => state.setCurrentList)
  const leftSidebarCollapsed = useStore((state) => state.leftSidebarCollapsed)
  const rightSidebarCollapsed = useStore((state) => state.rightSidebarCollapsed)
  const setLeftSidebarCollapsed = useStore((state) => state.setLeftSidebarCollapsed)
  const setRightSidebarCollapsed = useStore((state) => state.setRightSidebarCollapsed)
  
  // Alert system state
  const alertRules = useStore((state) => state.alertRules)
  const addAlertRule = useStore((state) => state.addAlertRule)
  const deleteAlertRule = useStore((state) => state.deleteAlertRule)
  const toggleAlertRule = useStore((state) => state.toggleAlertRule)

  // Local state for UI interactions
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTimeframe, setSelectedTimeframe] =
    useState<Timeframe>('5s')
  const [selectedCoin, setSelectedCoin] = useState<Coin | null>(null)
  const [showShortcutHelp, setShowShortcutHelp] = useState(false)
  const [selectedRowIndex, setSelectedRowIndex] = useState(0)
  const [showAlertHistory, setShowAlertHistory] = useState(false)
  
  // Ref for search input
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Filter and sort coins based on search query and selected list
  const filteredCoins = useMemo(() => {
    if (!coins) return []

    // Apply search filter
    let filtered = coins
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      filtered = coins.filter(
        (coin) =>
          coin.symbol.toLowerCase().includes(query) ||
          coin.fullSymbol.toLowerCase().includes(query)
      )
    }

    // Apply list-based sorting
    const list = getListById(currentList)
    if (list) {
      return sortCoinsByList(filtered, currentList, list.sortField, list.isBull)
    }

    return filtered
  }, [coins, searchQuery, currentList])

  // Keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: 'Escape',
      description: 'Close modal or clear search',
      callback: () => {
        if (selectedCoin) {
          setSelectedCoin(null)
        } else if (searchQuery) {
          setSearchQuery('')
        }
      },
    },
    {
      key: 'k',
      ctrl: true,
      description: 'Focus search bar',
      callback: () => {
        searchInputRef.current?.focus()
      },
    },
    {
      key: '?',
      description: 'Show keyboard shortcuts',
      callback: () => {
        setShowShortcutHelp(true)
      },
      preventDefault: true,
    },
    {
      key: 'ArrowDown',
      description: 'Navigate to next coin',
      callback: () => {
        if (!selectedCoin && filteredCoins.length > 0) {
          const nextIndex = (selectedRowIndex + 1) % filteredCoins.length
          setSelectedRowIndex(nextIndex)
        }
      },
      enabled: !selectedCoin,
    },
    {
      key: 'ArrowUp',
      description: 'Navigate to previous coin',
      callback: () => {
        if (!selectedCoin && filteredCoins.length > 0) {
          const prevIndex = selectedRowIndex === 0 ? filteredCoins.length - 1 : selectedRowIndex - 1
          setSelectedRowIndex(prevIndex)
        }
      },
      enabled: !selectedCoin,
    },
    {
      key: 'Enter',
      description: 'Open selected coin details',
      callback: () => {
        if (!selectedCoin && filteredCoins[selectedRowIndex]) {
          setSelectedCoin(filteredCoins[selectedRowIndex])
        }
      },
      enabled: !selectedCoin && filteredCoins.length > 0,
    },
  ])

  return (
    <>
      {/* Handle localStorage → IndexedDB migration on first load */}
      <StorageMigration />
      
      <Layout
        title="Crypto Screener"
        subtitle={`Real-time ${currentPair} market analysis`}
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Sidebar - Filters & Controls */}
        <div className={`${leftSidebarCollapsed ? 'lg:col-span-1' : 'lg:col-span-3'} transition-all duration-300`}>
          <Sidebar
            position="left"
            title="Filters & Controls"
            isCollapsed={leftSidebarCollapsed}
            onToggle={() => setLeftSidebarCollapsed(!leftSidebarCollapsed)}
          >
            <ListSelector 
              selectedListId={currentList} 
              onSelectList={setCurrentList} 
            />
            <PairSelector />
            <RefreshControl />
            <TimeframeSelector
              selectedTimeframe={selectedTimeframe}
              onSelect={setSelectedTimeframe}
            />
          </Sidebar>
        </div>

        {/* Main Content - Coin Table */}
        <div className={`${
          leftSidebarCollapsed && rightSidebarCollapsed ? 'lg:col-span-10' :
          leftSidebarCollapsed || rightSidebarCollapsed ? 'lg:col-span-8' :
          'lg:col-span-6'
        } transition-all duration-300 space-y-4`}>
          {/* Search Bar */}
          <SearchBar ref={searchInputRef} onSearch={setSearchQuery} />

          {/* Coin Table */}
          <div className="bg-gray-900 rounded-lg overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-gray-800">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">
                    Market Data{' '}
                    <span className="text-accent">{currentPair}</span>
                  </h2>
                  {coins && (
                    <span className="text-sm text-gray-400">
                      {filteredCoins.length} of {coins.length} coins
                      {searchQuery && ' (filtered)'}
                    </span>
                  )}
                </div>
                <ExportButton coins={filteredCoins} disabled={isLoading} />
              </div>
            </div>

            {/* Content */}
            <div className="min-h-[600px]">
              {error ? (
                ErrorStates.API()
              ) : isLoading ? (
                <div className="text-center py-12 text-gray-400">
                  Loading coin data...
                </div>
              ) : (
                <>
                  <SmartCoinTable
                    coins={filteredCoins}
                    onCoinClick={setSelectedCoin}
                    selectedRowIndex={selectedRowIndex}
                  />

                  {filteredCoins &&
                    filteredCoins.length === 0 &&
                    searchQuery &&
                    EmptyStates.NoSearchResults(searchQuery, () => setSearchQuery(''))}

                  {filteredCoins &&
                    filteredCoins.length === 0 &&
                    !searchQuery &&
                    coins &&
                    coins.length === 0 &&
                    EmptyStates.NoCoins(currentPair)}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar - Market Summary & Alerts */}
        <div className={`${rightSidebarCollapsed ? 'lg:col-span-1' : 'lg:col-span-3'} transition-all duration-300`}>
          <Sidebar
            position="right"
            title="Market Overview"
            isCollapsed={rightSidebarCollapsed}
            onToggle={() => setRightSidebarCollapsed(!rightSidebarCollapsed)}
          >
            <MarketSummary />
            
            {/* Alert Configuration */}
            {!rightSidebarCollapsed && (
              <div className="mt-4 space-y-4">
                <AlertConfig 
                  rules={alertRules}
                  onRuleToggle={toggleAlertRule}
                  onRuleCreate={addAlertRule}
                  onRuleDelete={deleteAlertRule}
                />
                
                {/* Alert History Toggle & Display */}
                <div>
                  <button
                    onClick={() => setShowAlertHistory(!showAlertHistory)}
                    className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-300 bg-gray-800/50 hover:bg-gray-700/50 rounded-md transition-colors"
                  >
                    <span>Alert History</span>
                    <svg
                      className={`w-4 h-4 transition-transform ${showAlertHistory ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {showAlertHistory && (
                    <div className="mt-2">
                      <AlertHistory />
                    </div>
                  )}
                </div>
              </div>
            )}
          </Sidebar>
        </div>
      </div>

      {/* Coin Detail Modal */}
      <Suspense fallback={null}>
        <CoinModal
          coin={selectedCoin}
          isOpen={!!selectedCoin}
          onClose={() => setSelectedCoin(null)}
        />
      </Suspense>

      {/* Keyboard Shortcuts Help */}
      <ShortcutHelp
        isOpen={showShortcutHelp}
        onClose={() => setShowShortcutHelp(false)}
        shortcuts={[
          { key: 'Escape', description: 'Close modal or clear search', callback: () => {} },
          { key: 'k', ctrl: true, description: 'Focus search bar', callback: () => {} },
          { key: '?', description: 'Show keyboard shortcuts', callback: () => {} },
          { key: 'ArrowDown', description: 'Navigate to next coin', callback: () => {} },
          { key: 'ArrowUp', description: 'Navigate to previous coin', callback: () => {} },
          { key: 'Enter', description: 'Open selected coin details', callback: () => {} },
        ]}
      />
      
      {/* Alert Notifications (renders outside layout in top-right) */}
      <AlertNotificationContainer />
    </Layout>
    </>
  )
}

export default App
