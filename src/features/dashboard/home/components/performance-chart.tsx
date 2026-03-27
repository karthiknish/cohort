'use client'

import { memo, useMemo } from 'react'
import Link from 'next/link'
import { Info } from 'lucide-react'

import { Skeleton } from '@/shared/ui/skeleton'
import { Button } from '@/shared/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/shared/ui/tooltip'
import type { ChartConfig } from '@/shared/ui/chart'
import { CHART_COLORS } from '@/lib/colors'

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

import {
  ChartContainer,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/shared/ui/chart'

// Direct Recharts imports to fix rendering issues on pages with many charts
import {
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
} from '@/shared/ui/recharts-dynamic'

const chartConfig = {
  revenue: {
    label: 'Revenue',
    color: CHART_COLORS.hsl.emerald,
  },
  spend: {
    label: 'Ad Spend',
    color: CHART_COLORS.hsl.red,
  },
} satisfies ChartConfig

export const PerformanceChart = memo(function PerformanceChart({ metrics, loading, currency = 'USD' }: PerformanceChartProps) {
  const chartData = useMemo(() => {
    if (!metrics || !metrics.length) return []

    // Aggregate by date
    const map = new Map<string, { date: string; spend: number; revenue: number }>()
    metrics.forEach((m) => {
      const parts = m.date.split('T')
      const key = parts[0] ?? m.date
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
      <div className="flex h-full flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">Performance Overview</span>
        </div>
        <Skeleton className="h-full w-full" />
      </div>
    )
  }

  if (chartData.length === 0) {
    return (
      <div className="flex h-full flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Performance Overview</span>
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard/analytics">Open analytics workspace</Link>
          </Button>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-muted/70 p-10 text-center">
          <p className="max-w-md text-sm text-muted-foreground">
            Charts appear once analytics data is connected. Until then, you can explore channel-level insights in the analytics workspace.
          </p>
          <Button asChild size="sm">
            <Link href="/dashboard/analytics">Review analytics</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col gap-1">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Performance Overview</span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-3.5 w-3.5 cursor-help text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p><strong>Revenue:</strong> Total income generated from campaign conversions.</p>
                <p className="mt-1"><strong>Ad Spend:</strong> Total amount invested in advertising. Compare with revenue to assess campaign profitability.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/dashboard/analytics">View details</Link>
        </Button>
      </div>
      <div className="min-h-0 flex-1">
        <ChartContainer config={chartConfig} className="h-full w-full">
          <AreaChart data={chartData} margin={{ top: 12, right: 12, left: 0, bottom: 28 }}>
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
              tickMargin={12}
              height={40}
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
      </div>
    </div>
  )
})
