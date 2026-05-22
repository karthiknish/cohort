'use client'

import type { LucideIcon } from 'lucide-react'

import { DASHBOARD_THEME } from '@/lib/dashboard-theme'

export type ProposalMetricStat = {
  label: string
  value: string
  description: string
  color: string
  bg: string
  icon?: LucideIcon
}

export { ProposalMetricCard } from './proposal-metric-card'
export { ProposalMetricsGrid } from './proposal-metrics-grid'

export function ProposalMetricsLoadingGrid() {
  return (
    <div className={DASHBOARD_THEME.stats.container}>
      {['proposal-metric-skeleton-1', 'proposal-metric-skeleton-2', 'proposal-metric-skeleton-3', 'proposal-metric-skeleton-4'].map((slotKey) => (
        <div
          key={slotKey}
          className="h-[7.5rem] animate-pulse rounded-2xl border border-muted/50 bg-muted/30"
          aria-hidden
        />
      ))}
    </div>
  )
}
