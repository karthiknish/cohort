'use client'

import { Skeleton } from '@/shared/ui/skeleton'

export function AnalyticsPageSkeleton() {
  const statSlots = ['stat-1', 'stat-2', 'stat-3', 'stat-4', 'stat-5', 'stat-6']

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-9 w-24" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
        {statSlots.map((slot) => (
          <div key={slot} className="space-y-3 rounded-lg border p-4">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-7 w-20" />
            <Skeleton className="h-3 w-12" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded-lg border p-4 lg:col-span-2">
          <div className="flex justify-between">
            <Skeleton className="h-5 w-40" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-20" />
            </div>
          </div>
          <Skeleton className="h-[350px] w-full" />
        </div>

        <div className="space-y-4 rounded-lg border p-4">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-[250px] w-full" />
        </div>

        <div className="space-y-4 rounded-lg border p-4">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-[250px] w-full" />
        </div>
      </div>
    </div>
  )
}