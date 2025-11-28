import { type CSSProperties } from 'react'

export interface SkeletonProps {
  width?: string | number
  height?: string | number
  variant?: 'text' | 'circular' | 'rectangular'
  animation?: 'pulse' | 'wave' | 'none'
  className?: string
}

/**
 * Skeleton loading component for content placeholders
 * 
 * @example
 * <Skeleton width="100%" height={20} />
 * <Skeleton variant="circular" width={40} height={40} />
 */
export function Skeleton({
  width = '100%',
  height = 16,
  variant = 'text',
  animation = 'pulse',
  className = '',
}: SkeletonProps) {
  const style: CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  }

  const baseClasses = 'bg-surface-light'
  
  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-md',
  }

  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer',
    none: '',
  }

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${animationClasses[animation]} ${className}`}
      style={style}
      aria-hidden="true"
    />
  )
}

/**
 * Table row skeleton for CoinTable loading state
 */
export function TableRowSkeleton() {
  return (
    <tr className="border-b border-border">
      <td className="px-4 py-3">
        <Skeleton width={60} height={16} />
      </td>
      <td className="px-4 py-3">
        <Skeleton width={100} height={20} />
      </td>
      <td className="px-4 py-3">
        <Skeleton width={80} height={16} />
      </td>
      <td className="px-4 py-3">
        <Skeleton width={70} height={16} />
      </td>
      <td className="px-4 py-3">
        <Skeleton width={90} height={16} />
      </td>
      <td className="px-4 py-3">
        <Skeleton width={60} height={16} />
      </td>
      <td className="px-4 py-3">
        <Skeleton width={60} height={16} />
      </td>
    </tr>
  )
}

/**
 * Card skeleton for mobile/card view
 */
export function CardSkeleton() {
  return (
    <div className="bg-surface rounded-lg border border-border p-4 space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton width={80} height={20} />
        <Skeleton width={60} height={24} variant="rectangular" />
      </div>
      <div className="space-y-2">
        <Skeleton width="100%" height={16} />
        <Skeleton width="80%" height={16} />
      </div>
      <div className="flex gap-2">
        <Skeleton width={60} height={32} variant="rectangular" />
        <Skeleton width={60} height={32} variant="rectangular" />
      </div>
    </div>
  )
}

/**
 * Chart skeleton for loading charts
 */
export function ChartSkeleton({ height = 400 }: { height?: number }) {
  return (
    <div className="space-y-3">
      {/* Controls skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} width={40} height={32} variant="rectangular" />
          ))}
        </div>
        <div className="flex gap-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} width={80} height={32} variant="rectangular" />
          ))}
        </div>
      </div>

      {/* Chart area skeleton */}
      <div className="bg-surface-dark border border-border rounded-lg p-4">
        <Skeleton width="100%" height={height} variant="rectangular" animation="wave" />
      </div>

      {/* Info text skeleton */}
      <Skeleton width={200} height={12} />
    </div>
  )
}

/**
 * Stats card skeleton for market summary
 */
export function StatsCardSkeleton() {
  return (
    <div className="bg-surface rounded-lg border border-border p-4">
      <Skeleton width={100} height={14} className="mb-2" />
      <Skeleton width={80} height={32} className="mb-1" />
      <Skeleton width={60} height={12} />
    </div>
  )
}

/**
 * Loading overlay with skeletons for full page
 */
export function PageSkeleton() {
  return (
    <div className="space-y-6 p-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton width={200} height={32} />
        <div className="flex gap-2">
          <Skeleton width={120} height={40} variant="rectangular" />
          <Skeleton width={120} height={40} variant="rectangular" />
        </div>
      </div>

      {/* Stats grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <StatsCardSkeleton key={i} />
        ))}
      </div>

      {/* Table skeleton */}
      <div className="bg-surface rounded-lg border border-border overflow-hidden">
        <table className="w-full">
          <thead className="bg-surface-light">
            <tr className="border-b border-border">
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <th key={i} className="px-4 py-3">
                  <Skeleton width={80} height={16} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <TableRowSkeleton key={i} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
