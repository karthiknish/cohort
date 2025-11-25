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
