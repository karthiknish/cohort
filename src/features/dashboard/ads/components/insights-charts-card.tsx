'use client'

import { useMemo, useState } from 'react'
import { Card } from '@/shared/ui/card'
import { formatCurrency } from '@/lib/utils'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Cell,
  Legend,
  Tooltip,
} from '@/shared/ui/recharts-dynamic'
import type { PerformanceAnalysis } from '@/lib/ad-algorithms'
import { CHART_COLORS, GRAYS } from '@/lib/colors'

import {
  InsightsChartsEmptyState,
  InsightsChartsHeader,
  InsightsChartsLoadingState,
  InsightsChartsTabs,
} from './insights-charts-card-sections'

// =============================================================================
// TYPES
// =============================================================================

interface InsightsChartsCardProps {
  analysis: PerformanceAnalysis | null
  currency?: string
  loading?: boolean
}

// =============================================================================
// CHART CONFIGS
// =============================================================================

const metricColors = CHART_COLORS.metrics

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

function ProviderComparisonChart({ currency = 'USD', data }: { currency?: string; data: PerformanceAnalysis['chartData']['providerComparison'] }) {
  const chartData = data.map(d => ({
    name: d.displayName,
    spend: d.metrics.spend,
    revenue: d.metrics.revenue,
    roas: d.metrics.roas,
    efficiency: d.metrics.efficiencyScore,
    fill: d.color,
  }))

  return (
    <div className="h-full min-h-[280px] w-full sm:min-h-[320px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} layout="vertical" margin={{ left: 80 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
          <XAxis type="number" tickFormatter={(v) => formatCurrency(v, currency)} />
          <YAxis type="category" dataKey="name" width={80} />
          <Tooltip
            formatter={(value: number, name: string) => {
              if (name === 'spend' || name === 'revenue') return formatCurrency(value, currency)
              if (name === 'roas') return `${value.toFixed(2)}x`
              return value
            }}
          />
          <Legend />
          <Bar dataKey="spend" name="Spend" fill={metricColors.spend} radius={[0, 4, 4, 0]} />
          <Bar dataKey="revenue" name="Revenue" fill={metricColors.revenue} radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

function EfficiencyRadarChart({
  data,
  providerId
}: {
  data: Record<string, { dimension: string; score: number; weight: number; benchmark: number }[]>
  providerId: string
}) {
  const breakdown = data[providerId]
  if (!breakdown || breakdown.length === 0) {
    return (
      <div className="flex min-h-[280px] sm:min-h-[320px] items-center justify-center text-sm text-muted-foreground">
        No efficiency data available
      </div>
    )
  }

  const chartData = breakdown.map(b => ({
    metric: b.dimension,
    score: Math.round(b.score),
    fullMark: 100,
  }))

  return (
    <div className="h-full min-h-[280px] w-full sm:min-h-[320px]">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={chartData}>
          <PolarGrid />
          <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11 }} />
          <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10 }} />
          <Radar
            name="Score"
            dataKey="score"
            stroke={metricColors.efficiency}
            fill={metricColors.efficiency}
            fillOpacity={0.5}
          />
          <Tooltip />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}

function TrendChart({
  currency = 'USD',
  data,
  providerId
}: {
  currency?: string
  data: Record<string, { date: string; actual: number; trend: number }[]>
  providerId: string
}) {
  const trendData = data[providerId]
  if (!trendData || trendData.length === 0) {
    return (
      <div className="flex min-h-[280px] sm:min-h-[320px] items-center justify-center text-sm text-muted-foreground">
        Insufficient data for trend analysis
      </div>
    )
  }

  return (
    <div className="h-full min-h-[280px] w-full sm:min-h-[320px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={trendData} margin={{ left: 10, right: 10 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tickFormatter={(v) => new Date(v).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            tick={{ fontSize: 10 }}
          />
          <YAxis tickFormatter={(v) => formatCurrency(v, currency)} tick={{ fontSize: 10 }} />
          <Tooltip
            labelFormatter={(v) => new Date(v).toLocaleDateString()}
            formatter={(v: number) => formatCurrency(v, currency)}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="actual"
            name="Actual Spend"
            stroke={metricColors.spend}
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="trend"
            name="Trend (EMA)"
            stroke={metricColors.roas}
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

function FunnelChart({
  data,
  providerId
}: {
  data: Record<string, { name: string; value: number; fill: string; dropOff: number }[]>
  providerId: string
}) {
  const funnelData = data[providerId]
  if (!funnelData || funnelData.length === 0) {
    return (
      <div className="flex min-h-[280px] sm:min-h-[320px] items-center justify-center text-sm text-muted-foreground">
        No funnel data available
      </div>
    )
  }

  return (
    <div className="h-full min-h-[280px] w-full sm:min-h-[320px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={funnelData} layout="vertical" margin={{ left: 80, right: 40 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
          <XAxis type="number" tickFormatter={(v) => v.toLocaleString()} />
          <YAxis type="category" dataKey="name" width={80} />
          <Tooltip
            formatter={(value: number, name: string, props: { payload?: { dropOff?: number } }) => {
              const dropOff = props.payload?.dropOff ?? 0
              return [
                `${value.toLocaleString()} (${dropOff.toFixed(1)}% drop-off)`,
                name
              ]
            }}
          />
          <Bar dataKey="value" name="Volume" radius={[0, 4, 4, 0]}>
              {funnelData.map((entry) => (
                <Cell key={`funnel-${entry.name}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

function BenchmarkChart({
  data,
  providerId
}: {
  data: Record<string, { metric: string; current: number; benchmark: number; percentile: number }[]>
  providerId: string
}) {
  const benchmarkData = data[providerId]
  if (!benchmarkData || benchmarkData.length === 0) {
    return (
      <div className="flex min-h-[280px] sm:min-h-[320px] items-center justify-center text-sm text-muted-foreground">
        No benchmark data available
      </div>
    )
  }

  // Normalize for comparison (show as percentile)
  const chartData = benchmarkData.map(b => ({
    metric: b.metric,
    percentile: b.percentile,
    benchmark: 50, // Industry average is 50th percentile
  }))

  return (
    <div className="h-full min-h-[280px] w-full sm:min-h-[320px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ left: 10, right: 10 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="metric" tick={{ fontSize: 10 }} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} label={{ value: 'Percentile', angle: -90, position: 'insideLeft', fontSize: 10 }} />
          <Tooltip formatter={(v: number) => `${v}th percentile`} />
          <Legend />
          <Bar dataKey="percentile" name="Your Performance" fill={metricColors.efficiency} radius={[4, 4, 0, 0]}>
              {chartData.map((entry) => (
              <Cell
                  key={`benchmark-${entry.metric}`}
                fill={entry.percentile > 75 ? CHART_COLORS.metrics.revenue : entry.percentile > 50 ? CHART_COLORS.metrics.roas : entry.percentile > 25 ? CHART_COLORS.metrics.ctr : CHART_COLORS.metrics.spend}
              />
            ))}
          </Bar>
          <Bar dataKey="benchmark" name="Industry Average" fill={GRAYS[400]} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function InsightsChartsCard({ analysis, currency = 'USD', loading = false }: InsightsChartsCardProps) {
  const [selectedProvider, setSelectedProvider] = useState<string>('all')

  const providers = useMemo(() => {
    if (!analysis) return []
    return analysis.summaries.map(s => ({
      id: s.providerId,
      name: s.providerId === 'google' ? 'Google Ads' :
        s.providerId === 'facebook' || s.providerId === 'meta' ? 'Meta Ads' :
          s.providerId === 'linkedin' ? 'LinkedIn Ads' :
            s.providerId === 'tiktok' ? 'TikTok Ads' : s.providerId,
    }))
  }, [analysis])

  const firstProvider = providers[0]
  const activeProvider = selectedProvider === 'all' && firstProvider
    ? firstProvider.id
    : selectedProvider

  if (loading) {
    return <InsightsChartsLoadingState />
  }

  if (!analysis || analysis.summaries.length === 0) {
    return <InsightsChartsEmptyState />
  }

  return (
    <Card className="shadow-sm">
      <InsightsChartsHeader onSelectedProviderChange={setSelectedProvider} providers={providers} providersCount={providers.length} selectedProvider={selectedProvider} />
      <InsightsChartsTabs benchmarkChart={<BenchmarkChart data={analysis.chartData.benchmarkCharts} providerId={activeProvider} />} comparisonChart={<ProviderComparisonChart currency={currency} data={analysis.chartData.providerComparison} />} efficiencyChart={<EfficiencyRadarChart data={analysis.chartData.efficiencyBreakdown} providerId={activeProvider} />} funnelChart={<FunnelChart data={analysis.chartData.funnelCharts} providerId={activeProvider} />} trendsChart={<TrendChart currency={currency} data={analysis.chartData.trendCharts} providerId={activeProvider} />} />
    </Card>
  )
}
