'use client'

import { Skeleton } from '@/shared/ui/skeleton'

const FIELD_SLOTS = ['field-1', 'field-2', 'field-3']

export function AuthPageSkeleton() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-md rounded-xl border border-border/60 bg-background p-6 shadow-sm">
        <div className="space-y-3 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted/60">
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
          <Skeleton className="mx-auto h-7 w-40" />
          <Skeleton className="mx-auto h-4 w-64" />
        </div>

        <div className="mt-8 space-y-4">
          {FIELD_SLOTS.map((slot) => (
            <div key={slot} className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-11 w-full rounded-md" />
            </div>
          ))}
        </div>

        <div className="mt-6 space-y-3">
          <Skeleton className="h-11 w-full rounded-md" />
          <Skeleton className="h-11 w-full rounded-md" />
        </div>
      </div>
    </div>
  )
}