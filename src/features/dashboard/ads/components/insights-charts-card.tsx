'use client'

import { useCallback, useMemo, useState } from 'react'
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

const MARGIN_LEFT_80 = { left: 80 }
const MARGIN_LEFT_80_RIGHT_40 = { left: 80, right: 40 }
const MARGIN_LEFT_10_RIGHT_10 = { left: 10, right: 10 }
const TICK_FONT_SIZE_11 = { fontSize: 11 }
const TICK_FONT_SIZE_10 = { fontSize: 10 }
const YAXIS_LABEL_PERCENTILE = { value: 'Percentile', angle: -90, position: 'insideLeft', fontSize: 10 }
const DOMAIN_0_100 = [0, 100]
const X_AXIS_DATE_LOCALE_OPTIONS: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }

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

  const formatXAxis = useCallback((v: number) => formatCurrency(v, currency), [currency])
  const tooltipFormatter = useCallback((value: number, name: string) => {
    if (name === 'spend' || name === 'revenue') return formatCurrency(value, currency)
    if (name === 'roas') return `${value.toFixed(2)}x`
    return value
  }, [currency])

  return (
    <div className="h-full min-h-[280px] w-full sm:min-h-[320px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} layout="vertical" margin={MARGIN_LEFT_80}>
          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
          <XAxis type="number" tickFormatter={formatXAxis} />
          <YAxis type="category" dataKey="name" width={80} />
          <Tooltip formatter={tooltipFormatter} />
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
          <PolarAngleAxis dataKey="metric" tick={TICK_FONT_SIZE_11} />
          <PolarRadiusAxis angle={90} domain={DOMAIN_0_100} tick={TICK_FONT_SIZE_10} />
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

  const formatXAxisDate = useCallback(
    (v: string) => new Date(v).toLocaleDateString('en-US', X_AXIS_DATE_LOCALE_OPTIONS),
    []
  )
  const formatYAxis = useCallback((v: number) => formatCurrency(v, currency), [currency])
  const labelFormatter = useCallback((v: string) => new Date(v).toLocaleDateString(), [])
  const tooltipFormatter = useCallback((v: number) => formatCurrency(v, currency), [currency])

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
        <LineChart data={trendData} margin={MARGIN_LEFT_10_RIGHT_10}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tickFormatter={formatXAxisDate}
            tick={TICK_FONT_SIZE_10}
          />
          <YAxis tickFormatter={formatYAxis} tick={TICK_FONT_SIZE_10} />
          <Tooltip
            labelFormatter={labelFormatter}
            formatter={tooltipFormatter}
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

  const formatXAxis = useCallback((v: number) => v.toLocaleString(), [])
  const tooltipFormatter = useCallback(
    (value: number, name: string, props: { payload?: { dropOff?: number } }) => {
      const dropOff = props.payload?.dropOff ?? 0
      return [
        `${value.toLocaleString()} (${dropOff.toFixed(1)}% drop-off)`,
        name
      ]
    },
    []
  )

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
        <BarChart data={funnelData} layout="vertical" margin={MARGIN_LEFT_80_RIGHT_40}>
          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
          <XAxis type="number" tickFormatter={formatXAxis} />
          <YAxis type="category" dataKey="name" width={80} />
          <Tooltip formatter={tooltipFormatter} />
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

  const tooltipFormatter = useCallback((v: number) => `${v}th percentile`, [])

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
        <BarChart data={chartData} margin={MARGIN_LEFT_10_RIGHT_10}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="metric" tick={TICK_FONT_SIZE_10} />
          <YAxis domain={DOMAIN_0_100} tick={TICK_FONT_SIZE_10} label={YAXIS_LABEL_PERCENTILE} />
          <Tooltip formatter={tooltipFormatter} />
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

  const benchmarkChart = <BenchmarkChart data={analysis.chartData.benchmarkCharts} providerId={activeProvider} />
  const comparisonChart = <ProviderComparisonChart currency={currency} data={analysis.chartData.providerComparison} />
  const efficiencyChart = <EfficiencyRadarChart data={analysis.chartData.efficiencyBreakdown} providerId={activeProvider} />
  const funnelChart = <FunnelChart data={analysis.chartData.funnelCharts} providerId={activeProvider} />
  const trendsChart = <TrendChart currency={currency} data={analysis.chartData.trendCharts} providerId={activeProvider} />

  return (
    <Card className="shadow-sm">
      <InsightsChartsHeader onSelectedProviderChange={setSelectedProvider} providers={providers} providersCount={providers.length} selectedProvider={selectedProvider} />
      <InsightsChartsTabs
        benchmarkChart={benchmarkChart}
        comparisonChart={comparisonChart}
        efficiencyChart={efficiencyChart}
        funnelChart={funnelChart}
        trendsChart={trendsChart}
      />
    </Card>
  )
}
