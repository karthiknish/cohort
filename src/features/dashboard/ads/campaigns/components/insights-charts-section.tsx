'use client'

import { useMemo, useCallback } from 'react'
import { Info } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Skeleton } from '@/shared/ui/skeleton'
import { PerformanceChart } from '@/features/dashboard/home/components/performance-chart'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/shared/ui/tooltip'
import type { ChartConfig } from '@/shared/ui/chart'
import { CHART_COLORS } from '@/lib/colors'

// Direct imports from recharts to avoid dynamic import conflicts
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
} from '@/shared/ui/recharts-dynamic'

import {
  ChartContainer,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/shared/ui/chart'
import { formatMoney, normalizeCurrencyCode } from '@/constants/currencies'

const engagementChartConfig = {
  clicks: {
    label: 'Clicks',
    color: CHART_COLORS.hsl.blue,
  },
  ctr: {
    label: 'CTR',
    color: CHART_COLORS.hsl.emerald,
  },
} satisfies ChartConfig

const conversionsChartConfig = {
  conversions: {
    label: 'Conversions',
    color: CHART_COLORS.hsl.emerald,
  },
  revenue: {
    label: 'Revenue',
    color: CHART_COLORS.hsl.indigo,
  },
} satisfies ChartConfig

const costChartConfig = {
  cpc: {
    label: 'CPC',
    color: CHART_COLORS.hsl.amber,
  },
  cpa: {
    label: 'CPA',
    color: CHART_COLORS.hsl.red,
  },
} satisfies ChartConfig

const reachChartConfig = {
  reach: {
    label: 'Reach',
    color: CHART_COLORS.hsl.blue,
  },
  impressions: {
    label: 'Impressions',
    color: CHART_COLORS.hsl.blue,
  },
} satisfies ChartConfig

const CHART_MARGIN = { left: 12, right: 12, top: 8, bottom: 8 }
const TICK_STYLE = { fontSize: 12 }
const AREA_CURSOR = { strokeDasharray: '3 3' }
const AREA_ACTIVE_DOT = { r: 5, strokeWidth: 0 }
const BAR_REACH_CURSOR = { fill: 'var(--color-reach)', opacity: 0.1 }

type PerformanceMetricPoint = {
  date: string
  spend: number
  revenue: number
}

type EngagementChartPoint = {
  date: string
  dateFormatted: string
  clicks: number
  impressions: number
  ctr: number
}

type ConversionChartPoint = {
  date: string
  dateFormatted: string
  conversions: number
  revenue: number
  cpc: number
  cpa: number
}

type ReachChartPoint = {
  date: string
  dateFormatted: string
  reach: number
  impressions: number
}

interface InsightsChartsSectionProps {
  chartMetrics: PerformanceMetricPoint[]
  engagementChartData: EngagementChartPoint[]
  conversionsChartData: ConversionChartPoint[]
  reachChartData?: ReachChartPoint[]
  insightsLoading: boolean
  currency?: string
}

export function InsightsChartsSection({
  chartMetrics,
  engagementChartData,
  conversionsChartData,
  reachChartData,
  insightsLoading,
  currency = 'USD'
}: InsightsChartsSectionProps) {
  const displayCurrency = normalizeCurrencyCode(currency)

  const engagementFormatter = useCallback((value: unknown, name: unknown) => (
    <div className="flex items-center justify-between gap-8">
      <span className="text-muted-foreground">
        {engagementChartConfig[name as keyof typeof engagementChartConfig]?.label ?? name as string}
      </span>
      <span className="font-mono font-medium">
        {name === 'ctr' ? `${Number(value).toFixed(2)}%` : Number(value).toLocaleString('en-US')}
      </span>
    </div>
  ), [])

  const engagementTooltipContent = useMemo(() => (
    <ChartTooltipContent formatter={engagementFormatter} />
  ), [engagementFormatter])

  const chartLegendContent = useMemo(() => <ChartLegendContent />, [])

  const conversionsTickFormatter = useCallback((value: unknown) =>
    `${Number(value).toLocaleString('en-US')}`, [])

  const conversionsFormatter = useCallback((value: unknown, name: unknown) => (
    <div className="flex items-center justify-between gap-8">
      <span className="text-muted-foreground">
        {conversionsChartConfig[name as keyof typeof conversionsChartConfig]?.label ?? name as string}
      </span>
      <span className="font-mono font-medium">
        {name === 'revenue'
          ? formatMoney(Number(value), displayCurrency)
          : Number(value).toLocaleString('en-US')}
      </span>
    </div>
  ), [displayCurrency])

  const conversionsTooltipContent = useMemo(() => (
    <ChartTooltipContent formatter={conversionsFormatter} />
  ), [conversionsFormatter])

  const costTickFormatter = useCallback((value: unknown) =>
    formatMoney(Number(value), displayCurrency), [displayCurrency])

  const costFormatter = useCallback((value: unknown, name: unknown) => (
    <div className="flex items-center justify-between gap-8">
      <span className="text-muted-foreground">
        {costChartConfig[name as keyof typeof costChartConfig]?.label ?? name as string}
      </span>
      <span className="font-mono font-medium">
        {formatMoney(Number(value), displayCurrency)}
      </span>
    </div>
  ), [displayCurrency])

  const costTooltipContent = useMemo(() => (
    <ChartTooltipContent formatter={costFormatter} />
  ), [costFormatter])

  const reachTickFormatter = useCallback((value: unknown) =>
    Number(value) >= 1000 ? `${(Number(value) / 1000).toFixed(1)}k` : String(value), [])

  const reachFormatter = useCallback((value: unknown, name: unknown) => (
    <div className="flex items-center justify-between gap-8">
      <span className="text-muted-foreground">
        {reachChartConfig[name as keyof typeof reachChartConfig]?.label ?? name as string}
      </span>
      <span className="font-mono font-medium">
        {Number(value).toLocaleString('en-US')}
      </span>
    </div>
  ), [])

  const reachTooltipContent = useMemo(() => (
    <ChartTooltipContent formatter={reachFormatter} />
  ), [reachFormatter])

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* 1. Performance Overview */}
      <PerformanceChart metrics={chartMetrics} loading={insightsLoading} currency={displayCurrency} />

      {/* 2. Engagement Trends */}
      <Card className="border-muted/40 shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg">Engagement Trends</CardTitle>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p><strong>Clicks:</strong> Total number of times users clicked on your ad.</p>
                  <p className="mt-1"><strong>CTR (Click-Through Rate):</strong> Percentage of impressions that resulted in a click. Higher CTR indicates more engaging ad content.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <CardDescription>Clicks & CTR over time</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          {insightsLoading ? (
            <Skeleton className="h-full w-full" />
          ) : engagementChartData.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              No engagement data available
            </div>
          ) : (
            <ChartContainer config={engagementChartConfig} className="h-full w-full">
              <AreaChart data={engagementChartData} margin={CHART_MARGIN}>
                <defs>
                  <linearGradient id="fillClicks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-clicks)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--color-clicks)" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="dateFormatted"
                  axisLine={false}
                  tickLine={false}
                  tickMargin={10}
                  tick={TICK_STYLE}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tickMargin={8}
                  tick={TICK_STYLE}
                />
                <RechartsTooltip
                  cursor={AREA_CURSOR}
                  content={engagementTooltipContent}
                />
                <ChartLegend content={chartLegendContent} />
                <Area
                  type="monotone"
                  dataKey="clicks"
                  stroke="var(--color-clicks)"
                  strokeWidth={2}
                  fill="url(#fillClicks)"
                  dot={false}
                  activeDot={AREA_ACTIVE_DOT}
                />
              </AreaChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      {/* 3. Conversions Over Time */}
      <Card className="border-muted/40 shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg">Conversions Over Time</CardTitle>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p><strong>Conversions:</strong> Number of desired actions completed (purchases, sign-ups, etc.) attributed to your campaign.</p>
                  <p className="mt-1"><strong>Revenue:</strong> Total monetary value generated from conversions.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <CardDescription>Daily conversion performance</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          {insightsLoading ? (
            <Skeleton className="h-full w-full" />
          ) : conversionsChartData.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              No conversion data available
            </div>
          ) : (
            <ChartContainer config={conversionsChartConfig} className="h-full w-full">
              <AreaChart data={conversionsChartData} margin={CHART_MARGIN}>
                <defs>
                  <linearGradient id="fillConversions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-conversions)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--color-conversions)" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="dateFormatted"
                  axisLine={false}
                  tickLine={false}
                  tickMargin={10}
                  tick={TICK_STYLE}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tickMargin={8}
                  tick={TICK_STYLE}
                  tickFormatter={conversionsTickFormatter}
                />
                <RechartsTooltip
                  cursor={AREA_CURSOR}
                  content={conversionsTooltipContent}
                />
                <ChartLegend content={chartLegendContent} />
                <Area
                  type="monotone"
                  dataKey="conversions"
                  stroke="var(--color-conversions)"
                  strokeWidth={2}
                  fill="url(#fillConversions)"
                  dot={false}
                  activeDot={AREA_ACTIVE_DOT}
                />
              </AreaChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      {/* 4. Cost Efficiency */}
      <Card className="border-muted/40 shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg">Cost Efficiency</CardTitle>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p><strong>CPC (Cost Per Click):</strong> Average amount spent for each click. Lower CPC means more efficient ad spend.</p>
                  <p className="mt-1"><strong>CPA (Cost Per Acquisition):</strong> Average cost to acquire one conversion. Lower CPA indicates better campaign efficiency.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <CardDescription>CPC & CPA trends</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          {insightsLoading ? (
            <Skeleton className="h-full w-full" />
          ) : conversionsChartData.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              No cost efficiency data available
            </div>
          ) : (
            <ChartContainer config={costChartConfig} className="h-full w-full">
              <BarChart data={conversionsChartData} margin={CHART_MARGIN}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="dateFormatted"
                  axisLine={false}
                  tickLine={false}
                  tickMargin={10}
                  tick={TICK_STYLE}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tickMargin={8}
                  tick={TICK_STYLE}
                  tickFormatter={costTickFormatter}
                />
                <RechartsTooltip
                  cursor={false}
                  content={costTooltipContent}
                />
                <ChartLegend content={chartLegendContent} />
                <Bar
                  dataKey="cpc"
                  fill="var(--color-cpc)"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="cpa"
                  fill="var(--color-cpa)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      {/* 5. Reach vs Impressions (Facebook specific) */}
      {reachChartData && reachChartData.length > 0 && (
        <Card className="border-muted/40 shadow-sm lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">Reach vs Impressions</CardTitle>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p><strong>Reach:</strong> The number of unique people who saw your ads at least once.</p>
                    <p className="mt-1"><strong>Impressions:</strong> The number of times your ads were on screen.</p>
                    <p className="mt-1"><strong>Frequency:</strong> Average number of times each person saw your ad (Impressions / Reach).</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <CardDescription>Unique reach compared to total impressions</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ChartContainer config={reachChartConfig} className="h-full w-full">
              <BarChart data={reachChartData} margin={CHART_MARGIN}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="dateFormatted"
                  axisLine={false}
                  tickLine={false}
                  tickMargin={10}
                  tick={TICK_STYLE}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tickMargin={8}
                  tick={TICK_STYLE}
                  tickFormatter={reachTickFormatter}
                />
                <RechartsTooltip
                  cursor={BAR_REACH_CURSOR}
                  content={reachTooltipContent}
                />
                <ChartLegend content={chartLegendContent} />
                <Bar
                  dataKey="impressions"
                  fill="var(--color-impressions)"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
                <Bar
                  dataKey="reach"
                  fill="var(--color-reach)"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
