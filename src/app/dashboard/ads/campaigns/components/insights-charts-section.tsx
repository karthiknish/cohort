'use client'

import dynamic from 'next/dynamic'
import { Info } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { PerformanceChart } from '@/components/dashboard/performance-chart'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import type { ChartConfig } from '@/components/ui/chart'

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
} from 'recharts'

const ChartPlaceholder = () => (
  <div className="h-full w-full animate-pulse rounded-lg bg-muted/40" />
)

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart'

const engagementChartConfig = {
  clicks: {
    label: 'Clicks',
    color: 'hsl(221 83% 53%)',
  },
  ctr: {
    label: 'CTR',
    color: 'hsl(160 84% 39%)',
  },
} satisfies ChartConfig

const conversionsChartConfig = {
  conversions: {
    label: 'Conversions',
    color: 'hsl(160 84% 39%)',
  },
  revenue: {
    label: 'Revenue',
    color: 'hsl(262 83% 58%)',
  },
} satisfies ChartConfig

const costChartConfig = {
  cpc: {
    label: 'CPC',
    color: 'hsl(38 92% 50%)',
  },
  cpa: {
    label: 'CPA',
    color: 'hsl(0 84% 60%)',
  },
} satisfies ChartConfig

interface InsightsChartsSectionProps {
  chartMetrics: any[]
  engagementChartData: any[]
  conversionsChartData: any[]
  insightsLoading: boolean
  currency?: string
}

export function InsightsChartsSection({
  chartMetrics,
  engagementChartData,
  conversionsChartData,
  insightsLoading,
  currency = 'USD'
}: InsightsChartsSectionProps) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* 1. Performance Overview */}
      <PerformanceChart metrics={chartMetrics} loading={insightsLoading} currency={currency} />

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
              <AreaChart data={engagementChartData} margin={{ left: 12, right: 12, top: 8, bottom: 8 }}>
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
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tickMargin={8}
                  tick={{ fontSize: 12 }}
                />
                <RechartsTooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  content={
                    <ChartTooltipContent
                      formatter={(value, name) => (
                        <div className="flex items-center justify-between gap-8">
                          <span className="text-muted-foreground">
                            {engagementChartConfig[name as keyof typeof engagementChartConfig]?.label ?? name}
                          </span>
                          <span className="font-mono font-medium">
                            {name === 'ctr' ? `${Number(value).toFixed(2)}%` : Number(value).toLocaleString('en-US')}
                          </span>
                        </div>
                      )}
                    />
                  }
                />
                <ChartLegend content={<ChartLegendContent />} />
                <Area
                  type="monotone"
                  dataKey="clicks"
                  stroke="var(--color-clicks)"
                  strokeWidth={2}
                  fill="url(#fillClicks)"
                  dot={false}
                  activeDot={{ r: 5, strokeWidth: 0 }}
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
              <AreaChart data={conversionsChartData} margin={{ left: 12, right: 12, top: 8, bottom: 8 }}>
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
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tickMargin={8}
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `${Number(value).toLocaleString('en-US')}`}
                />
                <RechartsTooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  content={
                    <ChartTooltipContent
                      formatter={(value, name) => (
                        <div className="flex items-center justify-between gap-8">
                          <span className="text-muted-foreground">
                            {conversionsChartConfig[name as keyof typeof conversionsChartConfig]?.label ?? name}
                          </span>
                          <span className="font-mono font-medium">
                            {name === 'revenue' 
                              ? new Intl.NumberFormat('en-US', { style: 'currency', currency: currency }).format(Number(value)) 
                              : Number(value).toLocaleString('en-US')}
                          </span>
                        </div>
                      )}
                    />
                  }
                />
                <ChartLegend content={<ChartLegendContent />} />
                <Area
                  type="monotone"
                  dataKey="conversions"
                  stroke="var(--color-conversions)"
                  strokeWidth={2}
                  fill="url(#fillConversions)"
                  dot={false}
                  activeDot={{ r: 5, strokeWidth: 0 }}
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
              <BarChart data={conversionsChartData} margin={{ left: 12, right: 12, top: 8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="dateFormatted"
                  axisLine={false}
                  tickLine={false}
                  tickMargin={10}
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tickMargin={8}
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => new Intl.NumberFormat('en-US', { style: 'currency', currency: currency, maximumFractionDigits: 0 }).format(Number(value))}
                />
                <RechartsTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      formatter={(value, name) => (
                        <div className="flex items-center justify-between gap-8">
                          <span className="text-muted-foreground">
                            {costChartConfig[name as keyof typeof costChartConfig]?.label ?? name}
                          </span>
                          <span className="font-mono font-medium">
                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: currency }).format(Number(value))}
                          </span>
                        </div>
                      )}
                    />
                  }
                />
                <ChartLegend content={<ChartLegendContent />} />
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
    </div>
  )
}
