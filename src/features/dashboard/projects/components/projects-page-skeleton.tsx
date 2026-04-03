'use client'

import { Skeleton } from '@/shared/ui/skeleton'

export function ProjectsPageSkeleton() {
  const cardSlots = ['card-1', 'card-2', 'card-3', 'card-4', 'card-5', 'card-6']
  const avatarSlots = ['avatar-1', 'avatar-2', 'avatar-3']

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-4 w-44" />
        </div>
        <Skeleton className="h-9 w-32" />
      </div>

      <div className="flex gap-3">
        <Skeleton className="h-10 max-w-sm flex-1" />
        <Skeleton className="h-10 w-28" />
        <Skeleton className="h-10 w-28" />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {cardSlots.map((slot) => (
          <div key={slot} className="space-y-4 rounded-lg border p-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <Skeleton className="h-5 w-36" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-6 w-20" />
            </div>

            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-4/5" />

            <div className="space-y-2">
              <div className="flex justify-between">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-8" />
              </div>
              <Skeleton className="h-2 w-full rounded-full" />
            </div>

            <div className="flex items-center justify-between border-t pt-2">
              <div className="flex -space-x-2">
                {avatarSlots.map((avatarSlot) => (
                  <Skeleton key={avatarSlot} className="h-7 w-7 rounded-full border-2 border-background" />
                ))}
              </div>
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}