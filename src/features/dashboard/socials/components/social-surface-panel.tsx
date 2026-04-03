'use client'

import { useCallback, useMemo } from 'react'
import { Activity, Facebook, Instagram, MessageSquareMore, Repeat2, UsersRound } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { cn } from '@/lib/utils'
import { DASHBOARD_THEME } from '@/lib/dashboard-theme'
import { Badge } from '@/shared/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { EmptyState } from '@/shared/ui/empty-state'
import { Skeleton } from '@/shared/ui/skeleton'
import { SocialsKpiGrid } from './socials-kpi-grid'
import type { SocialKpi } from '../hooks/use-social-insights'
import type { SocialOverview } from '../hooks/use-socials-metrics'

type SocialSurfacePanelProps = {
  surface: 'facebook' | 'instagram'
  kpis: SocialKpi[]
  overview: SocialOverview | null
  overviewLoading: boolean
  connected: boolean
}

type GraphMetric = {
  label: string
  value: number
  valueLabel: string
  detail: string
  colorClass: string
}

type InsightMetric = {
  title: string
  value: string
  detail: string
  icon: LucideIcon
}

const SURFACE_COPY = {
  facebook: {
    title: 'Facebook',
    icon: Facebook,
    summaryTitle: 'Facebook organic performance',
    summaryDescription: 'Organic reach, engagement, and follower growth for Facebook Pages in this workspace.',
    emptyMessage: 'Connect Facebook to start syncing organic metrics for this workspace.',
    emptyCtaLabel: 'Connect Facebook',
  },
  instagram: {
    title: 'Instagram',
    icon: Instagram,
    summaryTitle: 'Instagram organic performance',
    summaryDescription: 'Organic reach, engagement, and follower growth for Instagram business profiles in this workspace.',
    emptyMessage: 'Connect Instagram to start syncing organic metrics for this workspace.',
    emptyCtaLabel: 'Connect Instagram',
  },
} as const

function formatCompactNumber(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`
  return value.toLocaleString()
}

function formatRate(value: number): string {
  return `${value.toFixed(value >= 10 ? 1 : 2)}%`
}

function formatSignedNumber(value: number): string {
  if (value === 0) return '0'
  return `${value > 0 ? '+' : '-'}${formatCompactNumber(Math.abs(value))}`
}

function SocialMetricBarFill({ colorClass, width }: { colorClass: string; width: number }) {
  const widthStyle = useMemo(() => ({ width: `${width}%` }), [width])

  return <div className={cn('h-full rounded-full transition-[width]', colorClass)} style={widthStyle} />
}

function SocialMetricBars({ metrics }: { metrics: GraphMetric[] }) {
  const maxValue = Math.max(...metrics.map((metric) => metric.value), 0)

  return (
    <div className="space-y-4">
      {metrics.map((metric) => {
        const width = maxValue > 0 ? Math.max((metric.value / maxValue) * 100, metric.value > 0 ? 6 : 0) : 0

        return (
          <div key={metric.label} className="space-y-1.5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-foreground">{metric.label}</p>
                <p className="text-xs text-muted-foreground">{metric.detail}</p>
              </div>
              <p className="text-sm font-semibold text-foreground">{metric.valueLabel}</p>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-muted/60">
              <SocialMetricBarFill colorClass={metric.colorClass} width={width} />
            </div>
          </div>
        )
      })}
    </div>
  )
}

function SocialInsightCards({ insights }: { insights: InsightMetric[] }) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {insights.map((insight) => {
        const Icon = insight.icon

        return (
          <Card key={insight.title} className={cn('overflow-hidden', DASHBOARD_THEME.cards.base)}>
            <CardContent className="p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className={DASHBOARD_THEME.stats.label}>{insight.title}</p>
                  <p className={`mt-2 tracking-tight ${DASHBOARD_THEME.stats.value}`}>{insight.value}</p>
                </div>
                <div className={DASHBOARD_THEME.icons.container}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <p className={DASHBOARD_THEME.stats.description}>{insight.detail}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

export function SocialSurfacePanel({
  surface,
  kpis,
  overview,
  overviewLoading,
  connected,
}: SocialSurfacePanelProps) {
  const copy = SURFACE_COPY[surface]
  const SurfaceIcon = copy.icon
  const handleScrollToConnections = useCallback(() => {
    document.getElementById('social-connections-panel')?.scrollIntoView({ behavior: 'smooth' })
  }, [])
  const connectionAction = useMemo(() => ({
    label: copy.emptyCtaLabel,
    onClick: handleScrollToConnections,
  }), [copy.emptyCtaLabel, handleScrollToConnections])
  const performanceGraph = useMemo<GraphMetric[]>(() => {
    if (!overview) return []

    return [
      {
        label: 'Reach',
        value: overview.reach,
        valueLabel: formatCompactNumber(overview.reach),
        detail: 'Unique people reached in the selected range',
        colorClass: 'bg-primary',
      },
      {
        label: 'Impressions',
        value: overview.impressions,
        valueLabel: formatCompactNumber(overview.impressions),
        detail: 'Total content views delivered across the range',
        colorClass: 'bg-info',
      },
      {
        label: 'Engaged users',
        value: overview.engagedUsers,
        valueLabel: formatCompactNumber(overview.engagedUsers),
        detail: 'People who reacted, commented, shared, or saved content',
        colorClass: 'bg-success',
      },
    ]
  }, [overview])

  const interactionGraph = useMemo<GraphMetric[]>(() => {
    if (!overview) return []

    return [
      {
        label: 'Reactions',
        value: overview.reactions,
        valueLabel: formatCompactNumber(overview.reactions),
        detail: 'Lightweight approval and sentiment actions',
        colorClass: 'bg-primary',
      },
      {
        label: 'Comments',
        value: overview.comments,
        valueLabel: formatCompactNumber(overview.comments),
        detail: 'Direct responses that signal conversation depth',
        colorClass: 'bg-info',
      },
      {
        label: 'Shares',
        value: overview.shares,
        valueLabel: formatCompactNumber(overview.shares),
        detail: 'Content amplification from your audience',
        colorClass: 'bg-accent',
      },
      ...(overview.saves > 0 ? [{
        label: 'Saves',
        value: overview.saves,
        valueLabel: formatCompactNumber(overview.saves),
        detail: 'Intent signals from people bookmarking posts',
        colorClass: 'bg-warning',
      }] : []),
    ]
  }, [overview])

  const insightCards = useMemo<InsightMetric[]>(() => {
    if (!overview) return []

    const engagementRate = overview.reach > 0 ? (overview.engagedUsers / overview.reach) * 100 : 0
    const impressionFrequency = overview.reach > 0 ? overview.impressions / overview.reach : 0
    const conversationActions = overview.comments + overview.shares + overview.saves
    const conversationRate = overview.engagedUsers > 0 ? (conversationActions / overview.engagedUsers) * 100 : 0

    return [
      {
        title: 'Engagement rate',
        value: formatRate(engagementRate),
        detail: `${formatCompactNumber(overview.engagedUsers)} engaged users from ${formatCompactNumber(overview.reach)} reached accounts.`,
        icon: Activity,
      },
      {
        title: 'Repeat visibility',
        value: `${impressionFrequency.toFixed(2)}x`,
        detail: `${formatCompactNumber(overview.impressions)} impressions across ${overview.rowCount} synced days.`,
        icon: Repeat2,
      },
      {
        title: 'Community momentum',
        value: formatSignedNumber(overview.followerDeltaTotal),
        detail: overview.followerCountLatest !== null
          ? `${formatCompactNumber(overview.followerCountLatest)} total followers. ${formatRate(conversationRate)} of engaged users moved into comments, shares, or saves.`
          : `${formatRate(conversationRate)} of engaged users moved into comments, shares, or saves.`,
        icon: UsersRound,
      },
    ]
  }, [overview])

  return (
    <div className="space-y-6">
      <Card className={cn('overflow-hidden', DASHBOARD_THEME.cards.base)}>
        <CardHeader className={DASHBOARD_THEME.cards.header}>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className={DASHBOARD_THEME.icons.container}>
                <SurfaceIcon className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <CardTitle className="text-xl">{copy.summaryTitle}</CardTitle>
                <CardDescription>{copy.summaryDescription}</CardDescription>
              </div>
            </div>
            <Badge variant="outline" className={cn(DASHBOARD_THEME.badges.base, 'w-fit')}>
              {overviewLoading ? 'Loading…' : connected ? 'Organic data' : 'Not connected'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {overviewLoading ? (
            <div className={DASHBOARD_THEME.stats.container}>
              {[0, 1, 2, 3].map((slot) => (
                <Skeleton key={slot} className="h-28 w-full rounded-2xl" />
              ))}
            </div>
          ) : connected ? (
            <div className="space-y-6">
              <SocialsKpiGrid items={kpis} />

              <div className="grid gap-4 xl:grid-cols-2">
                <Card className={cn('overflow-hidden', DASHBOARD_THEME.cards.base)}>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-base">Audience footprint</CardTitle>
                    <CardDescription>Compare total visibility against engaged audience size for this range.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-5 pt-0">
                    <SocialMetricBars metrics={performanceGraph} />
                  </CardContent>
                </Card>

                <Card className={cn('overflow-hidden', DASHBOARD_THEME.cards.base)}>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-base">Interaction mix</CardTitle>
                    <CardDescription>See where people are reacting, replying, amplifying, and saving content.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-5 pt-0">
                    <SocialMetricBars metrics={interactionGraph} />
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <MessageSquareMore className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">Insight signals</h3>
                </div>
                <SocialInsightCards insights={insightCards} />
              </div>
            </div>
          ) : (
            <EmptyState
              title={`${copy.title} not connected`}
              description={copy.emptyMessage}
              action={connectionAction}
              variant="card"
              className="rounded-2xl"
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
