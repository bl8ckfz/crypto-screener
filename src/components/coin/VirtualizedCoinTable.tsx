/**
 * VirtualizedCoinTable Component
 * 
 * High-performance table for rendering large datasets (100+ coins).
 * Uses @tanstack/react-virtual for windowing - only renders visible rows.
 * Provides significant performance improvement over standard CoinTable for large lists.
 */

import { useRef, useMemo } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import type { Coin } from '@/types/coin'
import { CoinTableRow } from './CoinTableRow'

export interface VirtualizedCoinTableProps {
  coins: Coin[]
  onCoinClick?: (coin: Coin) => void
  selectedRowIndex?: number
}

/**
 * Threshold for when to use virtualization
 * Below this, standard table is more efficient
 */
export const VIRTUALIZATION_THRESHOLD = 50

/**
 * VirtualizedCoinTable - Renders only visible rows for optimal performance
 * 
 * Benefits:
 * - Handles 1000+ rows smoothly
 * - Constant render time regardless of dataset size
 * - Minimal memory footprint
 * 
 * Trade-offs:
 * - Slightly more complex than standard table
 * - Uses absolute positioning for rows
 * - Requires fixed row heights (estimated dynamically)
 */
export function VirtualizedCoinTable({ 
  coins, 
  onCoinClick, 
  selectedRowIndex = 0 
}: VirtualizedCoinTableProps) {
  // Container ref for virtualizer
  const parentRef = useRef<HTMLDivElement>(null)

  // Create virtualizer instance
  const virtualizer = useVirtualizer({
    count: coins.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 48, // Estimated row height in pixels
    overscan: 10, // Number of items to render outside visible area (for smooth scrolling)
  })

  // Get virtual items (only the visible rows + overscan)
  const virtualItems = virtualizer.getVirtualItems()

  // Memoize total size to avoid recalculations
  const totalSize = useMemo(() => virtualizer.getTotalSize(), [virtualizer])

  return (
    <div className="overflow-hidden rounded-lg border border-gray-800 bg-gray-900">
      {/* Table Header - Fixed */}
      <div className="sticky top-0 z-10 bg-gray-900 border-b border-gray-800">
        <table className="w-full table-fixed">
          <thead>
            <tr className="text-left text-sm text-gray-400 bg-gray-800/50">
              <th className="px-4 py-3 font-medium w-24">Symbol</th>
              <th className="px-4 py-3 font-medium text-right w-32">Price</th>
              <th className="px-4 py-3 font-medium text-right w-28">Change %</th>
              <th className="px-4 py-3 font-medium text-right w-32">Volume</th>
              <th className="px-4 py-3 font-medium text-right w-32">Quote Vol</th>
              <th className="px-4 py-3 font-medium text-right w-24">VCP</th>
              <th className="px-4 py-3 font-medium text-right w-28">P/WA</th>
            </tr>
          </thead>
        </table>
      </div>

      {/* Scrollable Body - Virtualized */}
      <div
        ref={parentRef}
        className="overflow-auto"
        style={{
          height: '600px', // Fixed height for virtual scrolling
          contain: 'strict', // CSS containment for better performance
        }}
      >
        {/* Virtual container with total height */}
        <div
          style={{
            height: `${totalSize}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {/* Render only visible items */}
          {virtualItems.map((virtualRow) => {
            const coin = coins[virtualRow.index]
            const isSelected = virtualRow.index === selectedRowIndex

            return (
              <div
                key={virtualRow.key}
                data-index={virtualRow.index}
                ref={virtualizer.measureElement}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  transform: `translateY(${virtualRow.start}px)`,
                }}
                className={isSelected ? 'ring-2 ring-blue-500' : ''}
              >
                <table className="w-full table-fixed">
                  <tbody>
                    <CoinTableRow
                      coin={coin}
                      index={virtualRow.index}
                      onClick={onCoinClick}
                    />
                  </tbody>
                </table>
              </div>
            )
          })}
        </div>
      </div>

      {/* Footer Stats */}
      <div className="px-4 py-2 bg-gray-800/30 border-t border-gray-800 text-xs text-gray-400">
        <div className="flex justify-between items-center">
          <span>
            Showing {virtualItems.length} of {coins.length} rows (virtualized)
          </span>
          <span>
            Performance: ~{Math.round((virtualItems.length / coins.length) * 100)}% rendered
          </span>
        </div>
      </div>
    </div>
  )
}

/**
 * Smart table component that automatically switches between
 * standard and virtualized rendering based on dataset size
 */
export function SmartCoinTable(props: VirtualizedCoinTableProps) {
  const { coins } = props

  // Use virtualization for large datasets
  if (coins.length >= VIRTUALIZATION_THRESHOLD) {
    return <VirtualizedCoinTable {...props} />
  }

  // Use standard table for small datasets (better for < 50 items)
  return (
    <div className="overflow-hidden rounded-lg border border-gray-800 bg-gray-900">
      <table className="w-full">
        <thead className="sticky top-0 z-10 bg-gray-900 border-b border-gray-800">
          <tr className="text-left text-sm text-gray-400 bg-gray-800/50">
            <th className="px-4 py-3 font-medium">Symbol</th>
            <th className="px-4 py-3 font-medium text-right">Price</th>
            <th className="px-4 py-3 font-medium text-right">Change %</th>
            <th className="px-4 py-3 font-medium text-right">Volume</th>
            <th className="px-4 py-3 font-medium text-right">Quote Vol</th>
            <th className="px-4 py-3 font-medium text-right">VCP</th>
            <th className="px-4 py-3 font-medium text-right">P/WA</th>
          </tr>
        </thead>
        <tbody>
          {coins.map((coin, index) => (
            <CoinTableRow
              key={coin.id}
              coin={coin}
              index={index}
              onClick={props.onCoinClick}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}
