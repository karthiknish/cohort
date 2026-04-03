'use client'

import { Skeleton } from '@/shared/ui/skeleton'

const STAT_CARDS = ['stat-1', 'stat-2', 'stat-3', 'stat-4']
const FEATURE_CARDS = ['feature-1', 'feature-2', 'feature-3']
const ACTIVITY_ROWS = ['act-1', 'act-2', 'act-3', 'act-4', 'act-5', 'act-6', 'act-7', 'act-8']

export function ForYouPageSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-64" />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Skeleton className="h-9 w-24 rounded-md" />
        <Skeleton className="h-9 w-24 rounded-md" />
        <Skeleton className="h-9 w-32 rounded-md" />
        <Skeleton className="ml-auto h-9 w-40 rounded-md" />
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {STAT_CARDS.map((id) => (
          <div key={id} className="space-y-2 rounded-lg border p-4">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-7 w-16" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {FEATURE_CARDS.map((id) => (
          <div key={id} className="space-y-3 rounded-xl border p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5 rounded-full" />
                <Skeleton className="h-4 w-28" />
              </div>
              <Skeleton className="h-5 w-14 rounded-full" />
            </div>
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-4/5" />
            <Skeleton className="h-3 w-3/5" />
          </div>
        ))}
      </div>

      <div className="rounded-lg border">
        <div className="border-b p-4">
          <Skeleton className="h-5 w-32" />
        </div>
        <div className="divide-y">
          {ACTIVITY_ROWS.map((id) => (
            <div key={id} className="flex items-start gap-4 p-4">
              <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-56" />
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-5 w-16 shrink-0 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}