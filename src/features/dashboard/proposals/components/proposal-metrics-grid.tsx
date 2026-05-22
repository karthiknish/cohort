'use client'

import { DASHBOARD_THEME } from '@/lib/dashboard-theme'

import { ProposalMetricCard } from './proposal-metric-card'
import type { ProposalMetricStat } from './proposal-metrics-sections'

export function ProposalMetricsGrid({ stats }: { stats: ProposalMetricStat[] }) {
  return (
    <div className={DASHBOARD_THEME.stats.container}>
      {stats.map((stat) => (
        <ProposalMetricCard key={stat.label} stat={stat} />
      ))}
    </div>
  )
}
