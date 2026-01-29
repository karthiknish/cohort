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
        variant === 'shimmer' && 'before:absolute before:inset-0 before:-translate-x-full before:animate-[skeleton-shimmer_1.4s_ease-in-out_infinite] before:bg-gradient-to-r before:from-transparent before:via-muted-foreground/20 before:to-transparent before:content-[""]',
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
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            'h-4',
            i === lines - 1 ? 'w-3/4' : 'w-full'
          )}
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

export function SkeletonTable({
  rows = 5,
  columns = 4,
  showHeader = true,
  className,
  ...props
}: SkeletonTableProps) {
  return (
    <div className={cn('space-y-3', className)} {...props}>
      {showHeader && (
        <div className="flex gap-4 pb-2 border-b">
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={`header-${i}`} className="h-4 flex-1" />
          ))}
        </div>
      )}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={`row-${rowIndex}`} className="flex gap-4 py-2">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={`cell-${rowIndex}-${colIndex}`} className="h-4 flex-1" />
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
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
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
    <div className={cn('rounded-lg border bg-card p-6 space-y-4', className)} {...props}>
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

export function SkeletonStats({
  cards = 4,
  className,
  ...props
}: SkeletonStatsProps) {
  return (
    <div className={cn('grid gap-4 md:grid-cols-2 lg:grid-cols-4', className)} {...props}>
      {Array.from({ length: cards }).map((_, i) => (
        <SkeletonDashboardCard key={i} />
      ))}
    </div>
  )
}

// =============================================================================
// CHART SKELETON
// =============================================================================

// Static heights for skeleton bars to avoid hydration mismatch
const SKELETON_CHART_HEIGHTS = [45, 70, 30, 85, 55, 40, 75, 60, 35, 80, 50, 65]

export function SkeletonChart({ className, ...props }: SkeletonProps) {
  return (
    <div className={cn('rounded-lg border bg-card p-6 space-y-4', className)} {...props}>
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-8 w-24" />
      </div>
      <div className="h-64 flex items-end justify-between gap-2">
        {SKELETON_CHART_HEIGHTS.map((height, i) => (
          <Skeleton
            key={i}
            className="flex-1"
            style={{ height: `${height}%` }}
          />
        ))}
      </div>
    </div>
  )
}
