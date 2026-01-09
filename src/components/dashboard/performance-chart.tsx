'use client'

import { memo, useMemo } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { Info } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import type { ChartConfig } from '@/components/ui/chart'

interface MetricRecord {
  date: string
  spend: number
  revenue?: number | null
}

interface PerformanceChartProps {
  metrics: MetricRecord[]
  loading: boolean
  currency?: string
}

function formatCurrencyValue(value: number, currency: string = 'USD'): string {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(value)
  } catch {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value)
  }
}

function formatCurrencyValueFull(value: number, currency: string = 'USD'): string {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    }).format(value)
  } catch {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value)
  }
}

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

// Direct Recharts imports to fix rendering issues on pages with many charts
import {
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from 'recharts'

const chartConfig = {
  revenue: {
    label: 'Revenue',
    color: 'hsl(160 84% 39%)', // Emerald-500
  },
  spend: {
    label: 'Ad Spend',
    color: 'hsl(0 84% 60%)', // Red-500
  },
} satisfies ChartConfig

export const PerformanceChart = memo(function PerformanceChart({ metrics, loading, currency = 'USD' }: PerformanceChartProps) {
  const chartData = useMemo(() => {
    if (!metrics || !metrics.length) return []

    // Aggregate by date
    const map = new Map<string, { date: string; spend: number; revenue: number }>()
    metrics.forEach((m) => {
      const key = m.date.split('T')[0] // Ensure YYYY-MM-DD
      if (!map.has(key)) {
        map.set(key, { date: key, spend: 0, revenue: 0 })
      }
      const entry = map.get(key)!
      entry.spend += m.spend
      entry.revenue += m.revenue || 0
    })

    return Array.from(map.values())
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(item => ({
        ...item,
        dateFormatted: new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
      }))
  }, [metrics])

  if (loading) {
    return (
      <Card className="h-full shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Performance Overview</CardTitle>
          <CardDescription>Loading metrics...</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <Skeleton className="h-full w-full" />
        </CardContent>
      </Card>
    )
  }

  if (chartData.length === 0) {
    return (
      <Card className="h-full shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">Performance Overview</CardTitle>
            <CardDescription>Key metrics from pipelines, tasks, and active campaigns.</CardDescription>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard/analytics">Open analytics workspace</Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-muted/70 p-10 text-center h-[300px]">
            <p className="max-w-md text-sm text-muted-foreground">
              Charts appear once analytics data is connected. Until then, you can explore channel-level insights in the analytics workspace.
            </p>
            <Button asChild size="sm">
              <Link href="/dashboard/analytics">Review analytics</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg">Performance Overview</CardTitle>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p><strong>Revenue:</strong> Total income generated from campaign conversions.</p>
                  <p className="mt-1"><strong>Ad Spend:</strong> Total amount invested in advertising. Compare with revenue to assess campaign profitability.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <CardDescription>Revenue vs Ad Spend over time</CardDescription>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/dashboard/analytics">View details</Link>
        </Button>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ChartContainer config={chartConfig} className="h-full w-full">
          <AreaChart data={chartData} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-revenue)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--color-revenue)" stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="fillSpend" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-spend)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--color-spend)" stopOpacity={0.05} />
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
              tickFormatter={(value) => formatCurrencyValue(value, currency)}
              tick={{ fontSize: 12 }}
            />
            <RechartsTooltip
              cursor={{ strokeDasharray: '3 3' }}
              content={
                <ChartTooltipContent
                  formatter={(value, name) => (
                    <div className="flex items-center justify-between gap-8">
                      <span className="text-muted-foreground">{chartConfig[name as keyof typeof chartConfig]?.label}</span>
                      <span className="font-mono font-medium">{formatCurrencyValueFull(Number(value), currency)}</span>
                    </div>
                  )}
                />
              }
            />
            <ChartLegend content={<ChartLegendContent />} />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="var(--color-revenue)"
              strokeWidth={2}
              fill="url(#fillRevenue)"
              dot={false}
              activeDot={{ r: 5, strokeWidth: 0 }}
            />
            <Area
              type="monotone"
              dataKey="spend"
              stroke="var(--color-spend)"
              strokeWidth={2}
              fill="url(#fillSpend)"
              dot={false}
              activeDot={{ r: 5, strokeWidth: 0 }}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
})
