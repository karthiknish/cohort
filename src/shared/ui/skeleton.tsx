import * as React from 'react'

import { cn } from '@/lib/utils'

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'shimmer' | 'pulse'
}

export function Skeleton({ className, variant = 'shimmer', ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-md bg-muted',
        variant === 'shimmer' && 'before:absolute before:inset-0 before:-translate-x-full before:animate-[skeleton-shimmer_var(--motion-duration-shimmer)_var(--motion-ease-in-out)_infinite] before:bg-gradient-to-r before:from-transparent before:via-muted-foreground/20 before:to-transparent before:content-["\"] motion-reduce:before:animate-none',
        variant === 'pulse' && 'animate-pulse',
        className
      )}
      {...props}
    />
  )
}

export function SkeletonText({ className, lines = 3, ...props }: SkeletonProps & { lines?: number }) {
  return (
    <div className={cn('space-y-2', className)} {...props}>
      {Array.from({ length: lines }, (_, line) => `text-line-${line + 1}`).map((lineKey, lineIndex) => (
        <Skeleton
          key={lineKey}
          className={cn('h-4', lineIndex === lines - 1 ? 'w-3/4' : 'w-full')}
        />
      ))}
    </div>
  )
}

export function SkeletonCard({ className, ...props }: SkeletonProps) {
  return (
    <div className={cn('space-y-3 rounded-lg border p-4', className)} {...props}>
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-8 w-full" />
      <div className="space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
      </div>
    </div>
  )
}

// =============================================================================
// TABLE SKELETON
// =============================================================================

export interface SkeletonTableProps extends React.HTMLAttributes<HTMLDivElement> {
  rows?: number
  columns?: number
  showHeader?: boolean
}

const SKELETON_SLOT_KEYS = [
  'slot-a',
  'slot-b',
  'slot-c',
  'slot-d',
  'slot-e',
  'slot-f',
  'slot-g',
  'slot-h',
  'slot-i',
  'slot-j',
  'slot-k',
  'slot-l',
] as const

export function SkeletonTable({
  rows = 5,
  columns = 4,
  showHeader = true,
  className,
  ...props
}: SkeletonTableProps) {
  const headerKeys = SKELETON_SLOT_KEYS.slice(0, columns)
  const rowKeys = SKELETON_SLOT_KEYS.slice(0, rows)

  return (
    <div className={cn('space-y-3', className)} {...props}>
      {showHeader && (
        <div className="flex gap-4 border-b pb-2">
          {headerKeys.map((headerKey) => (
            <Skeleton key={headerKey} className="h-4 flex-1" />
          ))}
        </div>
      )}
      {rowKeys.map((rowKey) => (
        <div key={rowKey} className="flex gap-4 py-2">
          {headerKeys.map((columnKey) => (
            <Skeleton key={`${rowKey}-${columnKey}`} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  )
}

// =============================================================================
// LIST SKELETON
// =============================================================================

export interface SkeletonListProps extends React.HTMLAttributes<HTMLDivElement> {
  items?: number
  showAvatar?: boolean
}

export function SkeletonList({
  items = 5,
  showAvatar = true,
  className,
  ...props
}: SkeletonListProps) {
  return (
    <div className={cn('space-y-4', className)} {...props}>
      {Array.from({ length: items }, (_, item) => `list-item-${item + 1}`).map((itemKey) => (
        <div key={itemKey} className="flex items-center gap-3">
          {showAvatar && <Skeleton className="h-10 w-10 shrink-0 rounded-full" />}
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}

// =============================================================================
// DASHBOARD CARD SKELETON
// =============================================================================

export function SkeletonDashboardCard({ className, ...props }: SkeletonProps) {
  return (
    <div className={cn('space-y-4 rounded-lg border bg-card p-6', className)} {...props}>
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
      <Skeleton className="h-8 w-24" />
      <Skeleton className="h-2 w-full" />
      <div className="flex items-center gap-2">
        <Skeleton className="h-3 w-3 rounded-full" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  )
}

// =============================================================================
// STATS GRID SKELETON
// =============================================================================

export interface SkeletonStatsProps extends React.HTMLAttributes<HTMLDivElement> {
  cards?: number
}

export function SkeletonStats({ cards = 4, className, ...props }: SkeletonStatsProps) {
  const cardSlots = Array.from({ length: cards }, (_, slot) => `stats-card-${slot + 1}`)

  return (
    <div className={cn('grid gap-4 md:grid-cols-2 lg:grid-cols-4', className)} {...props}>
      {cardSlots.map((slotKey) => (
        <SkeletonDashboardCard key={slotKey} />
      ))}
    </div>
  )
}

// =============================================================================
// CHART SKELETON
// =============================================================================

// Static heights for skeleton bars to avoid hydration mismatch
const SKELETON_CHART_HEIGHTS = [45, 70, 30, 85, 55, 40, 75, 60, 35, 80, 50, 65]
const SKELETON_CHART_BARS = SKELETON_CHART_HEIGHTS.map((height, slot) => ({
  id: `chart-bar-${slot + 1}`,
  height,
}))

function SkeletonChartBar({ height }: { height: number }) {
  const style = React.useMemo(() => ({ height: `${height}%` }), [height])

  return <Skeleton className="flex-1" style={style} />
}

export function SkeletonChart({ className, ...props }: SkeletonProps) {
  return (
    <div className={cn('space-y-4 rounded-lg border bg-card p-6', className)} {...props}>
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-8 w-24" />
      </div>
      <div className="h-64 flex items-end justify-between gap-2">
        {SKELETON_CHART_BARS.map((bar) => (
          <SkeletonChartBar key={bar.id} height={bar.height} />
        ))}
      </div>
    </div>
  )
}