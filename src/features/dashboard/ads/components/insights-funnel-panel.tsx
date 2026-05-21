'use client'

import { useMemo } from 'react'
import { Lightbulb } from 'lucide-react'

import type { FunnelAnalysis } from '@/lib/ad-algorithms'

import { InsightsProportionalFunnel } from './insights-proportional-funnel'

const funnelMetricPillClass =
  'inline-flex items-center gap-1 rounded-full border border-border bg-background px-2.5 py-1 text-xs tabular-nums text-muted-foreground shadow-sm'

const funnelBottleneckPillClass =
  'inline-flex items-center rounded-full border border-warning/45 bg-warning/15 px-2.5 py-1 text-xs font-medium text-warning'

function FunnelMetricPill({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <span className={funnelMetricPillClass}>
      {label} <strong className="font-semibold text-foreground">{value}</strong>
    </span>
  )
}
import { AdsChartShell } from './ads-chart-primitives'
import { InsightsPanelEmpty } from './insights-charts-card-sections'

export type FunnelChartDatum = {
  name: string
  value: number
  fill: string
  dropOff: number
}

function FunnelRecommendations({ analysis }: { analysis: FunnelAnalysis | null }) {
  if (!analysis?.recommendations.length) return null

  return (
    <div className="rounded-lg border border-border/60 bg-muted/25 p-3">
      <div className="mb-2 flex items-center gap-2 text-xs font-medium text-foreground">
        <Lightbulb className="h-3.5 w-3.5 text-amber-600" aria-hidden />
        Recommendations
      </div>
      <ul className="space-y-1.5 text-xs leading-relaxed text-muted-foreground">
        {analysis.recommendations.slice(0, 2).map((tip) => (
          <li key={tip}>{tip}</li>
        ))}
      </ul>
    </div>
  )
}

export function InsightsFunnelPanel({
  stages,
  analysis,
  providerLabel,
}: {
  stages: FunnelChartDatum[] | undefined
  analysis: FunnelAnalysis | null
  providerLabel: string
}) {
  const funnelStages = useMemo(
    () =>
      (stages ?? []).map((s) => ({
        name: s.name,
        value: s.value,
        dropOff: s.dropOff,
      })),
    [stages],
  )
  const hasVolume = funnelStages.some((s) => s.value > 0)

  const ctr = useMemo(() => {
    if (funnelStages.length < 2) return null
    const impressions = funnelStages[0]?.value ?? 0
    const clicks = funnelStages[1]?.value ?? 0
    if (impressions <= 0) return null
    return (clicks / impressions) * 100
  }, [funnelStages])

  const convRate = useMemo(() => {
    if (funnelStages.length < 3) return null
    const clicks = funnelStages[1]?.value ?? 0
    const conversions = funnelStages[2]?.value ?? 0
    if (clicks <= 0) return null
    return (conversions / clicks) * 100
  }, [funnelStages])

  if (!funnelStages.length || !hasVolume) {
    return (
      <InsightsPanelEmpty
        title="No funnel data for this range"
        description={`Sync ${providerLabel} and ensure impressions, clicks, or conversions are reported for the selected dates.`}
        actionHref="#connect-ad-platforms"
        actionLabel="Run sync"
      />
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        {ctr !== null ? <FunnelMetricPill label="CTR" value={`${ctr.toFixed(2)}%`} /> : null}
        {convRate !== null ? (
          <FunnelMetricPill label="Conv. rate" value={`${convRate.toFixed(2)}%`} />
        ) : null}
        {analysis?.overallConversionRate !== undefined ? (
          <FunnelMetricPill
            label="End-to-end"
            value={`${analysis.overallConversionRate.toFixed(3)}%`}
          />
        ) : null}
        {analysis?.bottleneckStage ? (
          <span className={funnelBottleneckPillClass}>
            Bottleneck: <span className="font-semibold">{analysis.bottleneckStage}</span>
          </span>
        ) : null}
      </div>

      <AdsChartShell>
        <InsightsProportionalFunnel stages={funnelStages} />
      </AdsChartShell>

      <FunnelRecommendations analysis={analysis} />
    </div>
  )
}
