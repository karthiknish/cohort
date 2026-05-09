'use client'

import { Card, CardContent } from '@/shared/ui/card'

export type ProposalMetricStat = {
  label: string
  value: string
  description: string
  color: string
  bg: string
}

export function ProposalMetricsLoadingGrid() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {['proposal-metric-skeleton-1', 'proposal-metric-skeleton-2', 'proposal-metric-skeleton-3', 'proposal-metric-skeleton-4'].map((slotKey) => (
        <Card key={slotKey} className="animate-pulse border-muted">
          <CardContent className="p-6">
            <div className="mb-2 h-4 w-24 rounded bg-muted" />
            <div className="h-8 w-16 rounded bg-muted" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export function ProposalMetricCard({ stat }: { stat: ProposalMetricStat }) {
  return (
    <Card className="overflow-hidden border-muted/50 transition-colors duration-200 hover:border-accent/20">
      <CardContent className="relative p-6">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-bold tracking-tight">{stat.value}</h3>
          </div>
          <p className="text-xs text-muted-foreground/80">{stat.description}</p>
        </div>
        <div className={`absolute -bottom-4 -right-4 h-24 w-24 rounded-full opacity-5 blur-2xl ${stat.bg}`} />
      </CardContent>
    </Card>
  )
}

export function ProposalMetricsGrid({ stats }: { stats: ProposalMetricStat[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <ProposalMetricCard key={stat.label} stat={stat} />
      ))}
    </div>
  )
}