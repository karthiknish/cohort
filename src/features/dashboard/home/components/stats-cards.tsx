import Link from 'next/link'
import { memo, useMemo, useState } from 'react'
import { ArrowRight } from 'lucide-react'

import { Card, CardContent, CardDescription } from '@/shared/ui/card'
import { Skeleton } from '@/shared/ui/skeleton'
import { Button } from '@/shared/ui/button'
import { FadeInItem, FadeInStagger } from '@/shared/ui/animate-in'
import { cn } from '@/lib/utils'
import type { SummaryStat } from '@/types/dashboard'

interface StatsCardsProps {
  stats: SummaryStat[]
  loading: boolean
  primaryCount?: number
}

export function StatsCards({ stats, loading, primaryCount = 4 }: StatsCardsProps) {
  const [expanded, setExpanded] = useState(false)

  const { visibleStats, hiddenCount } = useMemo(() => {
    if (!stats || stats.length === 0) {
      return { visibleStats: [], hiddenCount: 0 }
    }

    const clampedPrimary = Math.max(1, Math.min(primaryCount, stats.length))
    const hasHidden = stats.length > clampedPrimary

    return {
      visibleStats: expanded || !hasHidden ? stats : stats.slice(0, clampedPrimary),
      hiddenCount: hasHidden ? stats.length - clampedPrimary : 0,
    }
  }, [expanded, primaryCount, stats])

  return (
    <div className="space-y-4">
      <FadeInStagger className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {visibleStats.map((stat) => (
          <FadeInItem key={stat.id}>
            <StatsCard stat={stat} loading={loading} />
          </FadeInItem>
        ))}
      </FadeInStagger>

      {hiddenCount > 0 && (
        <div className="flex justify-center">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-primary"
            onClick={() => setExpanded((current) => !current)}
          >
            {expanded ? 'Show less' : `Show more (${hiddenCount})`}
          </Button>
        </div>
      )}
    </div>
  )
}

const StatsCard = memo(function StatsCard({ stat, loading }: { stat: SummaryStat; loading: boolean }) {
  const Icon = stat.icon
  const valueClasses = cn(
    'text-3xl font-bold tracking-tight',
    !loading && stat.emphasis === 'positive' && 'text-success',
    !loading && stat.emphasis === 'negative' && 'text-destructive',
  )

  const cardBody = (
    <Card className={cn('shadow-sm transition-colors', stat.href && 'group-hover:border-primary/60 group-hover:shadow-md')}>
      <CardContent className="flex items-center justify-between p-6">
        <div className="space-y-2">
          <CardDescription className="text-xs font-medium uppercase text-muted-foreground">
            <span className="flex items-center gap-2">
              {stat.urgency && (
                <span
                  className={cn('h-2.5 w-2.5 rounded-full', getUrgencyDotClass(stat.urgency))}
                  aria-hidden="true"
                  title={`${stat.urgency} urgency`}
                />
              )}
              {stat.label}
            </span>
          </CardDescription>
          <div className={valueClasses}>{loading ? <Skeleton className="h-8 w-20" /> : stat.value}</div>
          <div className="text-xs text-muted-foreground">
            {loading ? <Skeleton className="h-4 w-32" /> : stat.helper}
          </div>
          {!loading && stat.href && stat.featureLabel ? (
            <div className="inline-flex items-center gap-1 text-xs font-medium text-primary">
              {stat.featureLabel}
              <ArrowRight className="h-3.5 w-3.5" />
            </div>
          ) : null}
        </div>
        <div className="rounded-full bg-info/10 p-3">
          <Icon className="h-6 w-6 text-primary" />
        </div>
      </CardContent>
    </Card>
  )

  if (stat.href) {
    return (
      <Link href={stat.href} className="group block h-full rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40">
        {cardBody}
      </Link>
    )
  }

  return cardBody
})

function getUrgencyDotClass(level: SummaryStat['urgency']): string {
  switch (level) {
    case 'high':
      return 'bg-destructive shadow-[0_0_0_4px_hsl(var(--destructive)/0.12)]'
    case 'medium':
      return 'bg-warning shadow-[0_0_0_4px_hsl(var(--warning)/0.16)]'
    case 'low':
      return 'bg-success shadow-[0_0_0_4px_hsl(var(--success)/0.14)]'
    default:
      return 'bg-muted-foreground'
  }
}
