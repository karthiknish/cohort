'use client'

import { useMemo } from 'react'
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import Link from 'next/link'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'

interface MetricRecord {
  date: string
  spend: number
  revenue?: number | null
}

interface PerformanceChartProps {
  metrics: MetricRecord[]
  loading: boolean
}

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

export function PerformanceChart({ metrics, loading }: PerformanceChartProps) {
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
          <CardTitle className="text-lg">Performance Overview</CardTitle>
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
              tickFormatter={(value) => `$${value.toLocaleString()}`}
              tick={{ fontSize: 12 }}
            />
            <ChartTooltip
              cursor={{ strokeDasharray: '3 3' }}
              content={
                <ChartTooltipContent
                  formatter={(value, name) => (
                    <div className="flex items-center justify-between gap-8">
                      <span className="text-muted-foreground">{chartConfig[name as keyof typeof chartConfig]?.label}</span>
                      <span className="font-mono font-medium">${Number(value).toLocaleString()}</span>
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
}
