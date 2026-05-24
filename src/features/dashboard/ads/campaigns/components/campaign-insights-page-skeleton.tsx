'use client'

import { Card, CardContent, CardHeader } from '@/shared/ui/card'
import { Skeleton } from '@/shared/ui/skeleton'

export function CampaignInsightsPageSkeleton() {
  const metricSlots = ['metric-1', 'metric-2', 'metric-3', 'metric-4']
  const chartSlots = ['chart-1', 'chart-2']
  const rowSlots = ['row-1', 'row-2', 'row-3', 'row-4']

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-10 w-44 rounded-md" />
          <Skeleton className="h-10 w-28 rounded-md" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metricSlots.map((slot) => (
          <Card key={slot} className="border-muted/60 bg-background">
            <CardContent className="space-y-3 p-5">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {chartSlots.map((slot) => (
          <Card key={slot} className="border-muted/60 bg-background">
            <CardHeader>
              <Skeleton className="h-5 w-40" />
              <Skeleton className="mt-2 h-4 w-56" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-56 w-full rounded-lg" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-muted/60 bg-background">
        <CardHeader>
          <Skeleton className="h-5 w-36" />
        </CardHeader>
        <CardContent className="space-y-2">
          {rowSlots.map((slot) => (
            <Skeleton key={slot} className="h-16 w-full rounded-lg" />
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
