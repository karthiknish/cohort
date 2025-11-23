'use client'

import { useMemo } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  Legend,
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface MetricRecord {
  date: string
  spend: number
  revenue?: number | null
}

interface PerformanceChartProps {
  metrics: MetricRecord[]
  loading: boolean
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-border bg-background p-3 shadow-md">
        <p className="mb-2 text-sm font-medium text-foreground">{label}</p>
        {payload.map((entry: any) => (
          <div key={entry.name} className="flex items-center gap-2 text-sm">
            <div 
              className="h-2 w-2 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-muted-foreground">{entry.name}:</span>
            <span className="font-medium text-foreground">
              ${entry.value.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

export function PerformanceChart({ metrics, loading }: PerformanceChartProps) {
  const chartData = useMemo(() => {
    if (!metrics.length) return []

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
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            <XAxis 
              dataKey="dateFormatted" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: '#6b7280' }} 
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: '#6b7280' }} 
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Area 
              type="monotone" 
              dataKey="revenue" 
              stroke="#10b981" 
              strokeWidth={2} 
              fillOpacity={1} 
              fill="url(#colorRevenue)" 
              name="Revenue"
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
            <Area 
              type="monotone" 
              dataKey="spend" 
              stroke="#ef4444" 
              strokeWidth={2} 
              fillOpacity={1} 
              fill="url(#colorSpend)" 
              name="Ad Spend"
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
