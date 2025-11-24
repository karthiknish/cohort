import { Card, CardContent, CardDescription } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { FadeInItem, FadeInStagger } from '@/components/ui/animate-in'
import { cn } from '@/lib/utils'
import type { SummaryStat } from '@/types/dashboard'

interface StatsCardsProps {
  stats: SummaryStat[]
  loading: boolean
}

export function StatsCards({ stats, loading }: StatsCardsProps) {
  return (
    <FadeInStagger className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <FadeInItem key={stat.id}>
          <StatsCard stat={stat} loading={loading} />
        </FadeInItem>
      ))}
    </FadeInStagger>
  )
}

function StatsCard({ stat, loading }: { stat: SummaryStat; loading: boolean }) {
  const Icon = stat.icon
  const valueClasses = cn(
    'text-3xl font-bold tracking-tight',
    !loading && stat.emphasis === 'positive' && 'text-emerald-600',
    !loading && stat.emphasis === 'negative' && 'text-red-600',
  )

  return (
    <Card className="shadow-sm">
      <CardContent className="flex items-center justify-between p-6">
        <div className="space-y-2">
          <CardDescription className="text-xs font-medium uppercase text-muted-foreground">
            {stat.label}
          </CardDescription>
          <div className={valueClasses}>{loading ? <Skeleton className="h-8 w-20" /> : stat.value}</div>
          <div className="text-xs text-muted-foreground">
            {loading ? <Skeleton className="h-4 w-32" /> : stat.helper}
          </div>
        </div>
        <div className="rounded-full bg-primary/10 p-3">
          <Icon className="h-6 w-6 text-primary" />
        </div>
      </CardContent>
    </Card>
  )
}
