import { useState, useMemo } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui'
import { getAllScreeningLists } from '@/types'
import type { ScreeningListDefinition, ScreeningCategory } from '@/types'

interface ListSelectorProps {
  selectedListId: number
  onSelectList: (listId: number) => void
  className?: string
}

const CATEGORY_LABELS: Record<ScreeningCategory, string> = {
  price_movers: 'Price Movers',
  volume: 'Volume',
  technical: 'Technical Indicators',
  volatility: 'Volatility',
  trends: 'Trends & Comparisons',
  custom: 'Custom Lists',
}

export function ListSelector({ selectedListId, onSelectList, className = '' }: ListSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [showBearMode, setShowBearMode] = useState(selectedListId >= 300)

  const allLists = useMemo(() => getAllScreeningLists(), [])
  
  const filteredLists = useMemo(() => {
    // Filter by bull/bear mode
    const modeFiltered = allLists.filter(list => 
      showBearMode ? list.id >= 300 : list.id < 300
    )
    
    // Filter by search query
    if (!searchQuery.trim()) return modeFiltered
    
    const query = searchQuery.toLowerCase()
    return modeFiltered.filter(list => 
      list.name.toLowerCase().includes(query) ||
      list.description.toLowerCase().includes(query)
    )
  }, [allLists, searchQuery, showBearMode])

  // Group lists by category
  const groupedLists = useMemo(() => {
    const groups: Record<ScreeningCategory, ScreeningListDefinition[]> = {
      price_movers: [],
      volume: [],
      technical: [],
      volatility: [],
      trends: [],
      custom: [],
    }
    
    filteredLists.forEach(list => {
      groups[list.category].push(list)
    })
    
    return groups
  }, [filteredLists])

  const selectedList = allLists.find(l => l.id === selectedListId)

  const handleSelectList = (listId: number) => {
    onSelectList(listId)
    setIsOpen(false)
  }

  const handleToggleMode = () => {
    const newShowBear = !showBearMode
    setShowBearMode(newShowBear)
    
    // Switch current selection to equivalent list in new mode
    if (newShowBear && selectedListId < 300) {
      onSelectList(selectedListId + 300)
    } else if (!newShowBear && selectedListId >= 300) {
      onSelectList(selectedListId - 300)
    }
  }

  return (
    <div className={`relative ${className}`}>
      {/* Selected List Display */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 bg-surface-dark border border-border rounded-lg text-left hover:border-border-hover transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-text-primary truncate">
              {selectedList?.name || 'Select Screening List'}
            </div>
            <div className="text-xs text-text-secondary mt-1 truncate">
              {selectedList?.description || 'Choose from 134+ screening criteria'}
            </div>
          </div>
          <svg
            className={`ml-2 w-5 h-5 text-text-secondary transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute z-[900] mt-2 w-full bg-surface-dark border border-border rounded-lg shadow-xl max-h-[600px] overflow-hidden">
          {/* Search & Mode Toggle */}
          <div className="p-3 border-b border-border space-y-2">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
              <Input
                type="text"
                placeholder="Search lists..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Bull/Bear Toggle */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleToggleMode}
                className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  !showBearMode
                    ? 'bg-bullish/20 text-bullish border border-bullish/30'
                    : 'bg-surface-light text-text-secondary hover:bg-surface-light/50'
                }`}
              >
                🐂 Bull Mode (↑)
              </button>
              <button
                onClick={handleToggleMode}
                className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  showBearMode
                    ? 'bg-bearish/20 text-bearish border border-bearish/30'
                    : 'bg-surface-light text-text-secondary hover:bg-surface-light/50'
                }`}
              >
                🐻 Bear Mode (↓)
              </button>
            </div>
          </div>

          {/* List Categories */}
          <div className="overflow-y-auto max-h-[480px]">
            {(Object.keys(groupedLists) as ScreeningCategory[]).map(category => {
              const categoryLists = groupedLists[category]
              if (categoryLists.length === 0) return null

              return (
                <div key={category} className="border-b border-border last:border-b-0">
                  <div className="sticky top-0 bg-surface-light px-4 py-2 text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    {CATEGORY_LABELS[category]} ({categoryLists.length})
                  </div>
                  <div className="py-1">
                    {categoryLists.map(list => (
                      <button
                        key={list.id}
                        onClick={() => handleSelectList(list.id)}
                        className={`w-full px-4 py-2.5 text-left hover:bg-surface-light transition-colors ${
                          list.id === selectedListId ? 'bg-surface-light border-l-2 border-accent' : ''
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <span className="text-xs text-text-secondary font-mono mt-0.5">
                            #{list.id}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-text-primary">
                              {list.name}
                            </div>
                            <div className="text-xs text-text-secondary mt-0.5 line-clamp-2">
                              {list.description}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>

          {/* No Results */}
          {filteredLists.length === 0 && (
            <div className="px-4 py-8 text-center text-text-secondary">
              <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No lists found matching &ldquo;{searchQuery}&rdquo;</p>
            </div>
          )}

          {/* Footer Stats */}
          <div className="px-4 py-2 bg-surface-light border-t border-border text-xs text-text-secondary">
            Showing {filteredLists.length} of {showBearMode ? '135' : '135'} {showBearMode ? 'bear' : 'bull'} market lists
          </div>
        </div>
      )}
    </div>
  )
}
