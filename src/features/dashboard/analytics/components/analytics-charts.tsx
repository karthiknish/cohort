'use client'

import { useMemo } from 'react'
import { Info } from 'lucide-react'

import { AnalyticsEmptyState } from '@/shared/ui/analytics-empty-state'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Skeleton } from '@/shared/ui/skeleton'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/shared/ui/tooltip'
import {
  ANALYTICS_CHART_CONTAINER_CLASS,
  ANALYTICS_CHART_TOOLTIP_PROPS,
  AnalyticsConversionRateTooltip,
  AnalyticsConversionsTooltip,
  AnalyticsRevenueTooltip,
  AnalyticsUsersSessionsTooltip,
  type AnalyticsChartPoint,
} from './analytics-chart-tooltips'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  RechartsTooltip,
  XAxis,
  YAxis,
} from './chart-imports'
import {
  conversionRateChartConfig,
  conversionsChartConfig,
  revenueChartConfig,
  usersSessionsChartConfig,
} from './chart-configs'

const AXIS_TICK_STYLE = {
  fontSize: 11,
  fill: 'var(--muted-foreground)',
} as const

const CHART_TOOLTIP_CURSOR = { strokeDasharray: '3 3' } as const
const CHART_ACTIVE_DOT = { r: 5, strokeWidth: 0 } as const
const CHART_LEGEND_CONTENT = <ChartLegendContent className="pt-3 text-xs text-muted-foreground" />
const CHART_MARGIN = { top: 8, right: 12, left: 4, bottom: 4 } as const
const CHART_CARD_CLASS = 'border border-border/60 bg-card shadow-sm'
const CHART_HEADER_CLASS = 'border-b border-border/60 bg-muted/30 px-6 py-4'

function formatDateTick(value: string) {
  const date = new Date(value)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function formatNumberTick(value: number | string) {
  return Number(value).toLocaleString()
}

function formatPercentTick(value: number | string) {
  return `${Number(value).toFixed(1)}%`
}

interface AnalyticsChartsProps {
  chartData: AnalyticsChartPoint[]
  formatRevenue: (amount: number | null | undefined) => string
  isMetricsLoading: boolean
  initialMetricsLoading: boolean
}

function ChartCardHeader({
  title,
  description,
  tip,
}: {
  title: string
  description: string
  tip: string
}) {
  return (
    <CardHeader className={CHART_HEADER_CLASS}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <CardTitle className="text-sm font-semibold text-foreground">{title}</CardTitle>
          <CardDescription className="text-xs text-muted-foreground">{description}</CardDescription>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger className="rounded-md p-1 text-muted-foreground hover:text-primary">
              <Info className="h-4 w-4" aria-hidden />
              <span className="sr-only">Chart tips</span>
            </TooltipTrigger>
            <TooltipContent side="left" className="max-w-xs">
              <p className="text-xs leading-relaxed">{tip}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </CardHeader>
  )
}

export function AnalyticsCharts({
  chartData,
  formatRevenue,
  isMetricsLoading,
  initialMetricsLoading,
}: AnalyticsChartsProps) {
  const showChartSkeleton = initialMetricsLoading || (isMetricsLoading && chartData.length === 0)
  const formatCurrencyTick = useMemo(
    () => (value: number | string) => formatRevenue(Number(value)),
    [formatRevenue],
  )

  const usersSessionsTooltipContent = useMemo(
    () => <AnalyticsUsersSessionsTooltip chartData={chartData} />,
    [chartData],
  )
  const revenueTooltipContent = useMemo(
    () => <AnalyticsRevenueTooltip chartData={chartData} formatRevenue={formatRevenue} />,
    [chartData, formatRevenue],
  )
  const conversionsTooltipContent = useMemo(
    () => <AnalyticsConversionsTooltip chartData={chartData} formatRevenue={formatRevenue} />,
    [chartData, formatRevenue],
  )
  const conversionRateTooltipContent = useMemo(
    () => <AnalyticsConversionRateTooltip chartData={chartData} />,
    [chartData],
  )

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Card className={CHART_CARD_CLASS}>
        <ChartCardHeader
          title="Users vs sessions"
          description="Daily audience and visit volume"
          tip="Hover the chart to see users, sessions, day-over-day change, and visit patterns."
        />
        <CardContent className="pt-6">
          {showChartSkeleton ? (
            <Skeleton className="h-[280px] w-full rounded-lg" />
          ) : chartData.length === 0 ? (
            <AnalyticsEmptyState
              variant="no-filters"
              title="No performance data"
              description="There is no performance data for the selected date range."
              className="h-[280px] py-6"
            />
          ) : (
            <ChartContainer config={usersSessionsChartConfig} className={ANALYTICS_CHART_CONTAINER_CLASS}>
              <AreaChart data={chartData} margin={CHART_MARGIN}>
                <defs>
                  <linearGradient id="fillUsersAnalytics" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-users)" stopOpacity={0.22} />
                    <stop offset="95%" stopColor="var(--color-users)" stopOpacity={0.03} />
                  </linearGradient>
                  <linearGradient id="fillSessionsAnalytics" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-sessions)" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="var(--color-sessions)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.2} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                  style={AXIS_TICK_STYLE}
                  tickFormatter={formatDateTick}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                  style={AXIS_TICK_STYLE}
                  tickFormatter={formatNumberTick}
                />
                <RechartsTooltip
                  {...ANALYTICS_CHART_TOOLTIP_PROPS}
                  cursor={CHART_TOOLTIP_CURSOR}
                  content={usersSessionsTooltipContent}
                />
                <ChartLegend content={CHART_LEGEND_CONTENT} />
                <Area
                  type="monotone"
                  dataKey="users"
                  stroke="var(--color-users)"
                  strokeWidth={2}
                  fill="url(#fillUsersAnalytics)"
                  dot={false}
                  activeDot={CHART_ACTIVE_DOT}
                />
                <Area
                  type="monotone"
                  dataKey="sessions"
                  stroke="var(--color-sessions)"
                  strokeWidth={2}
                  strokeDasharray="5 4"
                  fill="url(#fillSessionsAnalytics)"
                  dot={false}
                  activeDot={CHART_ACTIVE_DOT}
                />
              </AreaChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      <Card className={CHART_CARD_CLASS}>
        <ChartCardHeader
          title="Revenue trend"
          description="Daily revenue from Google Analytics"
          tip="Hover to compare revenue, conversions, and revenue per session for each day."
        />
        <CardContent className="pt-6">
          {showChartSkeleton ? (
            <Skeleton className="h-[280px] w-full rounded-lg" />
          ) : chartData.length === 0 ? (
            <AnalyticsEmptyState
              variant="no-filters"
              title="No performance data"
              description="There is no performance data for the selected date range."
              className="h-[280px] py-6"
            />
          ) : (
            <ChartContainer config={revenueChartConfig} className={ANALYTICS_CHART_CONTAINER_CLASS}>
              <AreaChart data={chartData} margin={CHART_MARGIN}>
                <defs>
                  <linearGradient id="fillRevenueAnalytics" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-revenue)" stopOpacity={0.24} />
                    <stop offset="95%" stopColor="var(--color-revenue)" stopOpacity={0.04} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.2} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                  style={AXIS_TICK_STYLE}
                  tickFormatter={formatDateTick}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                  style={AXIS_TICK_STYLE}
                  tickFormatter={formatCurrencyTick}
                />
                <RechartsTooltip
                  {...ANALYTICS_CHART_TOOLTIP_PROPS}
                  cursor={CHART_TOOLTIP_CURSOR}
                  content={revenueTooltipContent}
                />
                <ChartLegend content={CHART_LEGEND_CONTENT} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="var(--color-revenue)"
                  strokeWidth={2}
                  fill="url(#fillRevenueAnalytics)"
                  dot={false}
                  activeDot={CHART_ACTIVE_DOT}
                />
              </AreaChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      <Card className={CHART_CARD_CLASS}>
        <ChartCardHeader
          title="Conversions"
          description="Daily conversion volume"
          tip="Hover bars to see conversions with session context and day-over-day change."
        />
        <CardContent className="pt-6">
          {showChartSkeleton ? (
            <Skeleton className="h-[280px] w-full rounded-lg" />
          ) : chartData.length === 0 ? (
            <AnalyticsEmptyState
              variant="no-filters"
              title="No performance data"
              description="There is no performance data for the selected date range."
              className="h-[280px] py-6"
            />
          ) : (
            <ChartContainer config={conversionsChartConfig} className={ANALYTICS_CHART_CONTAINER_CLASS}>
              <BarChart data={chartData} margin={CHART_MARGIN}>
                <defs>
                  <linearGradient id="fillConversionsAnalytics" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-conversions)" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="var(--color-conversions)" stopOpacity={0.4} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.2} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                  style={AXIS_TICK_STYLE}
                  tickFormatter={formatDateTick}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                  style={AXIS_TICK_STYLE}
                  tickFormatter={formatNumberTick}
                />
                <RechartsTooltip
                  {...ANALYTICS_CHART_TOOLTIP_PROPS}
                  cursor={{ fill: 'hsl(var(--muted))', opacity: 0.2 }}
                  content={conversionsTooltipContent}
                />
                <ChartLegend content={CHART_LEGEND_CONTENT} />
                <Bar dataKey="conversions" fill="url(#fillConversionsAnalytics)" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      <Card className={CHART_CARD_CLASS}>
        <ChartCardHeader
          title="Conversion rate"
          description="Conversions divided by sessions, per day"
          tip="Hover to inspect rate changes — low session days can exaggerate swings."
        />
        <CardContent className="pt-6">
          {showChartSkeleton ? (
            <Skeleton className="h-[280px] w-full rounded-lg" />
          ) : chartData.length === 0 ? (
            <AnalyticsEmptyState
              variant="no-filters"
              title="No performance data"
              description="There is no performance data for the selected date range."
              className="h-[280px] py-6"
            />
          ) : (
            <ChartContainer config={conversionRateChartConfig} className={ANALYTICS_CHART_CONTAINER_CLASS}>
              <AreaChart data={chartData} margin={CHART_MARGIN}>
                <defs>
                  <linearGradient id="fillConversionRateAnalytics" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-conversionRate)" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="var(--color-conversionRate)" stopOpacity={0.03} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.2} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                  style={AXIS_TICK_STYLE}
                  tickFormatter={formatDateTick}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                  style={AXIS_TICK_STYLE}
                  tickFormatter={formatPercentTick}
                />
                <RechartsTooltip
                  {...ANALYTICS_CHART_TOOLTIP_PROPS}
                  cursor={CHART_TOOLTIP_CURSOR}
                  content={conversionRateTooltipContent}
                />
                <ChartLegend content={CHART_LEGEND_CONTENT} />
                <Area
                  type="monotone"
                  dataKey="conversionRate"
                  stroke="var(--color-conversionRate)"
                  strokeWidth={2}
                  fill="url(#fillConversionRateAnalytics)"
                  dot={false}
                  activeDot={CHART_ACTIVE_DOT}
                />
              </AreaChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
