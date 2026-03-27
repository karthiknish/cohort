import { Skeleton } from '@/shared/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/shared/ui/card'

const SUMMARY_CARD_KEYS = ['summary-a', 'summary-b', 'summary-c'] as const
const OVERVIEW_CARD_KEYS = ['overview-a', 'overview-b', 'overview-c', 'overview-d'] as const
const METRIC_CARD_KEYS = ['metric-a', 'metric-b', 'metric-c'] as const
const METRIC_BAR_KEYS = ['bar-a', 'bar-b', 'bar-c'] as const
const ROW_KEYS = ['row-a', 'row-b', 'row-c', 'row-d', 'row-e', 'row-f'] as const

export default function AdsLoading() {
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
            {SUMMARY_CARD_KEYS.map((key) => (
              <Card key={key} className="border-muted/60 bg-muted/10">
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
        {OVERVIEW_CARD_KEYS.map((key) => (
          <Card key={key} className="border-muted/60 bg-background">
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
          {METRIC_CARD_KEYS.map((key) => (
            <div key={key} className="rounded-lg border border-muted/60 bg-muted/10 p-4">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="mt-2 h-3 w-40" />
              <div className="mt-3 grid grid-cols-3 gap-2">
                {METRIC_BAR_KEYS.map((barKey) => (
                  <Skeleton key={barKey} className="h-3 w-full" />
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-muted/60 bg-background">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <Skeleton className="h-5 w-40" />
            <Skeleton className="mt-2 h-4 w-64" />
          </div>
          <Skeleton className="h-9 w-36" />
        </CardHeader>
        <CardContent className="space-y-2">
          {ROW_KEYS.map((key) => (
            <Skeleton key={key} className="h-10 w-full rounded" />
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
