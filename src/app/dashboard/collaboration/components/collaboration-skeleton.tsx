'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'

export function CollaborationSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-80" />
      </div>

      <Card className="border-muted/60 bg-background">
        <CardHeader className="border-b border-muted/40 pb-4">
          <div className="flex flex-wrap items-center gap-3">
            {Array.from({ length: 3 }).map((_, idx) => (
              <Skeleton key={idx} className="h-6 w-40" />
            ))}
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 p-0 lg:flex-row">
          <div className="w-full max-w-xs border-r border-muted/30 p-4">
            <Skeleton className="h-9 w-full" />
            <div className="mt-4 space-y-3">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div key={idx} className="rounded-md border border-muted/60 bg-muted/10 p-3">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="mt-2 h-3 w-32" />
                </div>
              ))}
            </div>
          </div>

          <Separator orientation="vertical" className="hidden h-[640px] lg:block" />

          <div className="flex-1 space-y-4 p-4">
            <div className="space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-3 w-44" />
            </div>
            <div className="space-y-3">
              {Array.from({ length: 8 }).map((_, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                    <Skeleton className="h-3 w-36" />
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <Skeleton className="h-5 w-40" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-10 w-28" />
                <Skeleton className="h-10 w-10 rounded-full" />
              </div>
            </div>
          </div>

          <Separator orientation="vertical" className="hidden h-[640px] lg:block" />

          <div className="w-full max-w-xs space-y-4 border-l border-muted/30 p-4">
            <Skeleton className="h-5 w-44" />
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, idx) => (
                <div key={idx} className="rounded-md border border-muted/60 bg-muted/10 p-3">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="mt-2 h-3 w-28" />
                </div>
              ))}
            </div>
            <Skeleton className="h-5 w-40" />
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, idx) => (
                <div key={idx} className="rounded-md border border-muted/60 bg-muted/10 p-3">
                  <Skeleton className="h-4 w-32" />
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    {Array.from({ length: 3 }).map((__, innerIdx) => (
                      <Skeleton key={innerIdx} className="h-3 w-full" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
