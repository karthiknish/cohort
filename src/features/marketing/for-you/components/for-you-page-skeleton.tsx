'use client'

import { DASHBOARD_THEME } from '@/lib/dashboard-theme'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/shared/ui/skeleton'

function PinnedCardSkeleton() {
  return (
    <div className={cn('overflow-hidden rounded-lg border shadow-sm', DASHBOARD_THEME.cards.base)}>
      <div className="flex flex-col gap-4 border-b border-muted/40 p-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 flex-1 gap-3">
          <Skeleton className="mt-0.5 h-10 w-10 shrink-0 rounded-xl" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-5 w-44" />
            <Skeleton className="h-3 w-full max-w-md" />
          </div>
        </div>
        <Skeleton className="h-8 w-full shrink-0 rounded-md sm:w-28" />
      </div>
      <div className="px-4 pb-5 pt-0 sm:px-5">
        <div className="overflow-hidden rounded-xl border border-border/60 bg-muted/5">
          <div className="divide-y divide-border/60">
            <div className="flex gap-3 px-3.5 py-3.5 sm:px-4 sm:py-4">
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-4 w-4/5 max-w-sm" />
                <Skeleton className="h-3 w-full max-w-md" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="mt-1 h-4 w-4 shrink-0 rounded" />
            </div>
            <div className="flex gap-3 px-3.5 py-3.5 sm:px-4 sm:py-4">
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-5 w-24 rounded-full" />
                <Skeleton className="h-4 w-3/4 max-w-xs" />
                <Skeleton className="h-3 w-full max-w-sm" />
                <Skeleton className="h-3 w-28" />
              </div>
              <Skeleton className="mt-1 h-4 w-4 shrink-0 rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function ForYouPageSkeleton() {
  return (
    <div className={cn(DASHBOARD_THEME.layout.container, 'w-full')}>
      <div className={DASHBOARD_THEME.layout.header}>
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-6 w-36 rounded-full" />
            <Skeleton className="h-6 w-28 rounded-full" />
          </div>
          <Skeleton className="h-9 w-full max-w-lg sm:h-10" />
          <Skeleton className="h-4 w-full max-w-xl" />
          <Skeleton className="h-4 w-full max-w-lg" />
        </div>
        <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-end md:w-auto">
          <Skeleton className="h-9 w-full rounded-md sm:w-24" />
          <Skeleton className="h-9 w-full rounded-md sm:w-40" />
        </div>
      </div>

      <div className="space-y-10 pt-1">
        <div className="space-y-5">
          <div className="max-w-2xl space-y-2">
            <Skeleton className="h-3 w-14" />
            <Skeleton className="h-7 w-56 max-w-md" />
            <Skeleton className="h-4 w-full max-w-xl" />
          </div>
          <div className="grid gap-5 lg:gap-6 xl:grid-cols-2">
            <PinnedCardSkeleton key="sk-pinned-a" />
            <PinnedCardSkeleton key="sk-pinned-b" />
          </div>
        </div>

        <Skeleton className="h-px w-full max-w-none bg-border/80" />

        <div className="space-y-5">
          <div className="max-w-2xl space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-7 w-64 max-w-md" />
            <Skeleton className="h-4 w-full max-w-lg" />
          </div>

          <div className={cn('overflow-hidden rounded-lg border shadow-sm', DASHBOARD_THEME.cards.base)}>
            <div className="border-b border-muted/40 p-4">
              <Skeleton className="h-5 w-36" />
              <Skeleton className="mt-2 h-3 w-full max-w-lg" />
            </div>
            <div className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {['c1', 'c2', 'c3', 'c4'].map((key) => (
                <Skeleton key={key} className="h-36 rounded-2xl" />
              ))}
            </div>
          </div>

          <div className={cn('overflow-hidden rounded-lg border shadow-sm', DASHBOARD_THEME.cards.base)}>
            <div className="border-b border-muted/40 p-4">
              <Skeleton className="h-5 w-28" />
              <Skeleton className="mt-2 h-3 w-full max-w-sm" />
            </div>
            <div className="space-y-2 p-4">
              {['t1', 't2', 't3', 't4'].map((key) => (
                <div key={key} className="flex items-start gap-3 rounded-xl border border-border/40 bg-muted/10 p-3">
                  <Skeleton className="mt-0.5 h-4 w-4 shrink-0 rounded" />
                  <div className="min-w-0 flex-1 space-y-2">
                    <Skeleton className="h-4 w-4/5 max-w-md" />
                    <div className="flex gap-2">
                      <Skeleton className="h-5 w-16 rounded-full" />
                      <Skeleton className="h-5 w-20 rounded-full" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
