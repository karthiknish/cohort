'use client'

import { DASHBOARD_THEME } from '@/lib/dashboard-theme'
import { Skeleton } from '@/shared/ui/skeleton'

export function AnalyticsPageSkeleton() {
  return (
    <div className="space-y-8">
      <div className={DASHBOARD_THEME.layout.header}>
        <div className="space-y-2">
          <Skeleton className="h-9 w-40" />
          <Skeleton className="h-4 w-72 max-w-full" />
        </div>
        <Skeleton className="h-9 w-36" />
      </div>

      <Skeleton className="h-28 w-full rounded-xl" />

      <div className={DASHBOARD_THEME.stats.container}>
        {['s1', 's2', 's3', 's4'].map((key) => (
          <Skeleton key={key} className="h-32 rounded-xl" />
        ))}
      </div>

      <Skeleton className="h-24 w-full rounded-xl" />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {['c1', 'c2', 'c3', 'c4'].map((key) => (
          <Skeleton key={key} className="h-[340px] rounded-xl" />
        ))}
      </div>
    </div>
  )
}
