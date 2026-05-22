'use client'

import type { LucideIcon } from 'lucide-react'
import { DollarSign, FileText, Send, Sparkles } from 'lucide-react'

import { DASHBOARD_THEME } from '@/lib/dashboard-theme'
import { cn } from '@/lib/utils'
import { MotionCard } from '@/shared/ui/motion-primitives'
import { CardContent } from '@/shared/ui/card'

import type { ProposalMetricStat } from './proposal-metrics-sections'

const METRIC_ICONS: Record<string, LucideIcon> = {
  'Total Proposals': FileText,
  'Ready for Pitch': Sparkles,
  'Sent to Clients': Send,
  'Pipeline Value': DollarSign,
}

export function ProposalMetricCard({ stat }: { stat: ProposalMetricStat }) {
  const Icon = stat.icon ?? METRIC_ICONS[stat.label] ?? FileText

  return (
    <MotionCard className={cn(DASHBOARD_THEME.stats.card, 'group relative overflow-hidden')}>
      <CardContent className="relative p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2">
            <p className={DASHBOARD_THEME.stats.label}>{stat.label}</p>
            <p className={cn(DASHBOARD_THEME.stats.value, 'tabular-nums')}>{stat.value}</p>
            <p className={DASHBOARD_THEME.stats.description}>{stat.description}</p>
          </div>
          <div
            className={cn(
              'flex size-10 shrink-0 items-center justify-center rounded-xl border border-border/50',
              stat.bg,
              stat.color,
            )}
          >
            <Icon className="size-5" aria-hidden />
          </div>
        </div>
        <div
          className={cn('pointer-events-none absolute inset-x-0 bottom-0 h-1 opacity-60', stat.bg.replace('/10', '/40'))}
          aria-hidden
        />
      </CardContent>
    </MotionCard>
  )
}
