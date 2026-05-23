'use client'

import { useCallback, useMemo, type ReactNode } from 'react'

import { formatMoney } from '@/constants/currencies'
import type { PerformanceAnalysis } from '@/lib/ad-algorithms'

import {
  benchmarkChartConfig,
  efficiencyRadarChartConfig,
  funnelStageThemeKey,
  providerComparisonChartConfig,
  spendTrendChartConfig,
} from './ads-chart-configs'
import {
  ADS_ACTIVE_DOT,
  ADS_AXIS_TICK_STYLE,
  ADS_CHART_CONTAINER_CLASSNAME,
  ADS_CHART_LEGEND,
  ADS_CHART_MARGIN,
  ADS_CHART_MARGIN_CATEGORY_Y,
  ADS_CHART_TOOLTIP_PROPS,
  ADS_TOOLTIP_CURSOR,
  AdsChartShell,
} from './ads-chart-primitives'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ChartContainer,
  ChartLegend,
  ChartTooltipContent,
  Line,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  RechartsTooltip,
  XAxis,
  YAxis,
} from './ads-chart-imports'
import { InsightsPanelEmpty } from './insights-charts-card-sections'

const DOMAIN_0_100: [number, number] = [0, 100]
const DATE_TICK_OPTIONS: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }
const RADAR_TOOLTIP_CONTENT = <ChartTooltipContent hideLabel />

function formatDateTick(value: string) {
  const date = new Date(value)
  return date.toLocaleDateString('en-US', DATE_TICK_OPTIONS)
}

export function ProviderComparisonChart({
  currency = 'USD',
  data,
}: {
  currency?: string
  data: PerformanceAnalysis['chartData']['providerComparison']
}) {
  const chartData = data.map((d) => ({
    name: d.displayName,
    spend: d.metrics.spend,
    revenue: d.metrics.revenue,
  }))

  const hasData = chartData.some((d) => d.spend > 0 || d.revenue > 0)

  const spendFormatter = useCallback(
    (value: unknown, name: unknown) => (
      <div className="flex items-center justify-between gap-8">
        <span className="text-muted-foreground">
          {providerComparisonChartConfig[name as keyof typeof providerComparisonChartConfig]
            ?.label ?? String(name)}
        </span>
        <span className="font-mono text-sm font-medium tabular-nums">
          {name === 'spend' || name === 'revenue'
            ? formatMoney(Number(value), currency)
            : Number(value).toLocaleString()}
        </span>
      </div>
    ),
    [currency],
  )

  const formatXAxis = useCallback((v: number) => formatMoney(v, currency), [currency])

  if (!hasData) {
    return (
      <InsightsPanelEmpty
        title="No spend or revenue to compare"
        description="Sync at least one platform with financial metrics in this date range."
        actionHref="#connect-ad-platforms"
        actionLabel="Run sync"
      />
    )
  }

  return (
    <ProviderComparisonChartPlot
      chartData={chartData}
      formatXAxis={formatXAxis}
      spendFormatter={spendFormatter}
    />
  )
}

function ProviderComparisonChartPlot({
  chartData,
  formatXAxis,
  spendFormatter,
}: {
  chartData: { name: string; spend: number; revenue: number }[]
  formatXAxis: (v: number) => string
  spendFormatter: (value: unknown, name: unknown) => React.ReactNode
}) {
  const tooltipContent = useMemo(
    () => <ChartTooltipContent formatter={spendFormatter} />,
    [spendFormatter],
  )

  return (
    <AdsChartShell>
      <ChartContainer config={providerComparisonChartConfig} className={ADS_CHART_CONTAINER_CLASSNAME}>
        <BarChart data={chartData} layout="vertical" margin={ADS_CHART_MARGIN_CATEGORY_Y}>
          <CartesianGrid horizontal vertical={false} strokeDasharray="3 3" opacity={0.2} />
          <XAxis
            type="number"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            style={ADS_AXIS_TICK_STYLE}
            tickFormatter={formatXAxis}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={88}
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            style={ADS_AXIS_TICK_STYLE}
          />
          <RechartsTooltip
            {...ADS_CHART_TOOLTIP_PROPS}
            cursor={ADS_TOOLTIP_CURSOR}
            content={tooltipContent}
          />
          <ChartLegend content={ADS_CHART_LEGEND} />
          <Bar dataKey="spend" fill="var(--color-spend)" radius={[0, 6, 6, 0]} maxBarSize={28} />
          <Bar dataKey="revenue" fill="var(--color-revenue)" radius={[0, 6, 6, 0]} maxBarSize={28} />
        </BarChart>
      </ChartContainer>
    </AdsChartShell>
  )
}

export function EfficiencyRadarChart({
  data,
  providerId,
  providerLabel,
}: {
  data: Record<string, { dimension: string; score: number; weight: number; benchmark: number }[]>
  providerId: string
  providerLabel: string
}) {
  const breakdown = data[providerId]

  const chartData = useMemo(
    () =>
      (breakdown ?? []).map((b) => ({
        metric: b.dimension,
        score: Math.round(b.score),
      })),
    [breakdown],
  )

  if (!chartData.length) {
    return (
      <InsightsPanelEmpty
        title="No efficiency breakdown"
        description={`Need more synced metrics for ${providerLabel} to score delivery, cost, and conversion dimensions.`}
      />
    )
  }

  return (
    <AdsChartShell>
      <ChartContainer config={efficiencyRadarChartConfig} className={ADS_CHART_CONTAINER_CLASSNAME}>
        <RadarChart data={chartData} cx="50%" cy="50%" outerRadius="72%">
          <PolarGrid stroke="var(--border)" strokeOpacity={0.6} />
          <PolarAngleAxis dataKey="metric" tick={ADS_AXIS_TICK_STYLE} />
          <PolarRadiusAxis
            angle={90}
            domain={DOMAIN_0_100}
            tick={ADS_AXIS_TICK_STYLE}
            tickCount={4}
          />
          <Radar
            name="Score"
            dataKey="score"
            stroke="var(--color-score)"
            fill="var(--color-score)"
            fillOpacity={0.35}
            strokeWidth={2}
          />
          <RechartsTooltip
            {...ADS_CHART_TOOLTIP_PROPS}
            content={RADAR_TOOLTIP_CONTENT}
          />
        </RadarChart>
      </ChartContainer>
    </AdsChartShell>
  )
}

export function SpendTrendChart({
  currency = 'USD',
  data,
  providerId,
  providerLabel,
}: {
  currency?: string
  data: Record<string, { date: string; actual: number; trend: number }[]>
  providerId: string
  providerLabel: string
}) {
  const trendData = data[providerId]

  if (!trendData || trendData.length < 2) {
    return (
      <InsightsPanelEmpty
        title="Not enough daily data for trends"
        description={`Trend lines need multiple days of spend for ${providerLabel}. Widen the date range or run another sync.`}
        actionHref="#connect-ad-platforms"
        actionLabel="Run sync"
      />
    )
  }

  return <SpendTrendChartPlot currency={currency} trendData={trendData} />
}

function SpendTrendChartPlot({
  currency,
  trendData,
}: {
  currency: string
  trendData: { date: string; actual: number; trend: number }[]
}) {
  const currencyFormatter = useCallback(
    (value: unknown, name: unknown) => (
      <div className="flex items-center justify-between gap-8">
        <span className="text-muted-foreground">
          {spendTrendChartConfig[name as keyof typeof spendTrendChartConfig]?.label ??
            String(name)}
        </span>
        <span className="font-mono text-sm font-medium tabular-nums">
          {formatMoney(Number(value), currency)}
        </span>
      </div>
    ),
    [currency],
  )

  const formatYAxis = useCallback((v: number) => formatMoney(v, currency), [currency])

  const tooltipContent = useMemo(
    () => <ChartTooltipContent labelFormatter={formatDateTick} formatter={currencyFormatter} />,
    [currencyFormatter],
  )

  return (
    <AdsChartShell>
      <ChartContainer config={spendTrendChartConfig} className={ADS_CHART_CONTAINER_CLASSNAME}>
        <AreaChart data={trendData} margin={ADS_CHART_MARGIN}>
          <defs>
            <linearGradient id="fillSpendActualInsights" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-actual)" stopOpacity={0.28} />
              <stop offset="95%" stopColor="var(--color-actual)" stopOpacity={0.04} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.2} />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tickMargin={10}
            style={ADS_AXIS_TICK_STYLE}
            tickFormatter={formatDateTick}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={10}
            style={ADS_AXIS_TICK_STYLE}
            tickFormatter={formatYAxis}
          />
          <RechartsTooltip
            {...ADS_CHART_TOOLTIP_PROPS}
            cursor={ADS_TOOLTIP_CURSOR}
            content={tooltipContent}
          />
          <ChartLegend content={ADS_CHART_LEGEND} />
          <Area
            type="monotone"
            dataKey="actual"
            stroke="var(--color-actual)"
            strokeWidth={2}
            fill="url(#fillSpendActualInsights)"
            dot={false}
            activeDot={ADS_ACTIVE_DOT}
          />
          <Line
            type="monotone"
            dataKey="trend"
            stroke="var(--color-trend)"
            strokeWidth={2}
            strokeDasharray="6 4"
            dot={false}
            activeDot={ADS_ACTIVE_DOT}
          />
        </AreaChart>
      </ChartContainer>
    </AdsChartShell>
  )
}

export function BenchmarkComparisonChart({
  data,
  providerId,
  providerLabel,
}: {
  data: Record<string, { metric: string; current: number; benchmark: number; percentile: number }[]>
  providerId: string
  providerLabel: string
}) {
  const benchmarkData = data[providerId]
  const chartData = (benchmarkData ?? []).map((b) => ({
    metric: b.metric,
    percentile: b.percentile,
    benchmark: 50,
  }))

  if (!chartData.length) {
    return (
      <InsightsPanelEmpty
        title="No benchmark comparison"
        description={`Industry benchmarks for ${providerLabel} need CTR, CPC, and conversion signals from your sync.`}
      />
    )
  }

  return <BenchmarkComparisonChartPlot chartData={chartData} />
}

function BenchmarkComparisonChartPlot({
  chartData,
}: {
  chartData: { metric: string; percentile: number; benchmark: number }[]
}) {
  const percentileFormatter = useCallback(
    (value: unknown, name: unknown) => (
      <div className="flex items-center justify-between gap-8">
        <span className="text-muted-foreground">
          {benchmarkChartConfig[name as keyof typeof benchmarkChartConfig]?.label ??
            String(name)}
        </span>
        <span className="font-mono text-sm font-medium tabular-nums">
          {name === 'benchmark' ? '50th' : `${Number(value)}th`} percentile
        </span>
      </div>
    ),
    [],
  )

  const formatPercentTick = useCallback((value: number) => `${value}%`, [])

  const tooltipContent = useMemo(
    () => <ChartTooltipContent formatter={percentileFormatter} />,
    [percentileFormatter],
  )

  return (
    <AdsChartShell>
      <ChartContainer config={benchmarkChartConfig} className={ADS_CHART_CONTAINER_CLASSNAME}>
        <BarChart data={chartData} margin={ADS_CHART_MARGIN}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.2} />
          <XAxis
            dataKey="metric"
            tickLine={false}
            axisLine={false}
            tickMargin={10}
            style={ADS_AXIS_TICK_STYLE}
          />
          <YAxis
            domain={DOMAIN_0_100}
            tickLine={false}
            axisLine={false}
            tickMargin={10}
            style={ADS_AXIS_TICK_STYLE}
            tickFormatter={formatPercentTick}
          />
          <RechartsTooltip
            {...ADS_CHART_TOOLTIP_PROPS}
            cursor={ADS_TOOLTIP_CURSOR}
            content={tooltipContent}
          />
          <ChartLegend content={ADS_CHART_LEGEND} />
          <Bar
            dataKey="benchmark"
            fill="var(--color-benchmark)"
            fillOpacity={0.35}
            radius={[6, 6, 0, 0]}
            maxBarSize={36}
          />
          <Bar dataKey="percentile" fill="var(--color-percentile)" radius={[6, 6, 0, 0]} maxBarSize={36} />
        </BarChart>
      </ChartContainer>
    </AdsChartShell>
  )
}

