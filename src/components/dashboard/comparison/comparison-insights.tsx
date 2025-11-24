import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import type { ComparisonInsight } from '@/types/dashboard'

interface ComparisonInsightsProps {
  insights: ComparisonInsight[]
  loading: boolean
}

export function ComparisonInsights({ insights, loading }: ComparisonInsightsProps) {
  return (
    <div className="space-y-4">
      {loading && (
        <div className="space-y-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      )}
      {!loading && insights.length === 0 && (
        <p className="text-sm text-muted-foreground">Select at least one workspace to see quick insights.</p>
      )}
      {!loading &&
        insights.map((insight) => {
          const Icon = insight.icon
          return (
            <div
              key={insight.id}
              className={cn(
                'rounded-lg border p-4 text-sm',
                insight.tone === 'positive' && 'border-emerald-200 bg-emerald-50/60',
                insight.tone === 'warning' && 'border-amber-200 bg-amber-50/80',
              )}
            >
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-background/70 p-2 text-primary">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {insight.title}
                </span>
              </div>
              <p className="mt-3 text-base font-semibold text-foreground">{insight.highlight}</p>
              <p className="mt-1 text-xs text-muted-foreground">{insight.body}</p>
            </div>
          )
        })}
    </div>
  )
}
