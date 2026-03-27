'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Skeleton } from '@/shared/ui/skeleton'

export function AdsSkeleton() {
  const insightSlots = ['insight-1', 'insight-2', 'insight-3']
  const statSlots = ['stat-1', 'stat-2', 'stat-3', 'stat-4']
  const metricSlots = ['metric-1', 'metric-2', 'metric-3']
  const rowSlots = ['row-1', 'row-2', 'row-3', 'row-4', 'row-5', 'row-6']

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>

      <Card className="border-muted/60 bg-background">
        <CardHeader className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-36" />
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {insightSlots.map((slot) => (
              <Card key={slot} className="border-muted/60 bg-muted/10">
                <CardContent className="space-y-3 p-4">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-4 w-28" />
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statSlots.map((slot) => (
          <Card key={slot} className="border-muted/60 bg-background">
            <CardContent className="space-y-3 p-5">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-8 w-28" />
              <Skeleton className="h-3 w-40" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-muted/60 bg-background">
        <CardHeader>
          <Skeleton className="h-5 w-40" />
          <Skeleton className="mt-2 h-4 w-64" />
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          {metricSlots.map((slot) => (
            <div key={slot} className="rounded-lg border border-muted/60 bg-muted/10 p-4">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="mt-2 h-3 w-40" />
              <div className="mt-3 grid grid-cols-3 gap-2">
                {metricSlots.map((metricSlot) => (
                  <Skeleton key={metricSlot} className="h-3 w-full" />
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-muted/60 bg-background">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">Latest synced rows</CardTitle>
            <CardDescription>Recent normalized records across all connected ad platforms.</CardDescription>
          </div>
          <Skeleton className="h-9 w-36" />
        </CardHeader>
        <CardContent className="space-y-2">
          {rowSlots.map((slot) => (
            <Skeleton key={slot} className="h-10 w-full rounded" />
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
