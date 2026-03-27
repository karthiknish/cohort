'use client'

import { useState, useCallback, useMemo } from 'react'
import {
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from '@/shared/ui/recharts-dynamic'
import { Card, CardContent } from '@/shared/ui/card'
import { cn } from '@/lib/utils'
import { useToast } from '@/shared/ui/use-toast'
import { CHART_COLORS, GRAYS } from '@/lib/colors'
import {
  InteractiveChartHeader,
  InteractiveChartRenderer,
} from './interactive-chart-sections'

export type ChartType = 'line' | 'bar' | 'area' | 'pie'
export type TimeRange = '7d' | '14d' | '30d' | '90d' | '12m' | 'all'

export interface ChartDataPoint {
  date: string
  value: number
  label?: string
  category?: string
  [key: string]: string | number | undefined
}

interface InteractiveChartProps {
  data: ChartDataPoint[]
  title?: string
  description?: string
  dataKey?: string
  xAxisKey?: string
  valueFormatter?: (value: number) => string
  className?: string
  height?: number
  onExport?: (format: 'csv' | 'png' | 'json') => void
  showExport?: boolean
  showRefresh?: boolean
  onRefresh?: () => void
  isRefreshing?: boolean
}

const DEFAULT_VALUE_FORMATTER = (value: number) => value.toString()

/**
 * Interactive chart component with multiple chart types and export
 */
export function InteractiveChart({
  data,
  title = 'Performance Chart',
  description,
  dataKey = 'value',
  xAxisKey = 'date',
  valueFormatter = DEFAULT_VALUE_FORMATTER,
  className,
  height = 350,
  onExport,
  showExport = true,
  showRefresh = false,
  onRefresh,
  isRefreshing = false,
}: InteractiveChartProps) {
  const { toast } = useToast()
  const [chartType, setChartType] = useState<ChartType>('line')
  const [timeRange, setTimeRange] = useState<TimeRange>('30d')

  // Filter data by time range
  const filteredData = useMemo(() => {
    if (timeRange === 'all') return data

    const now = new Date()
    const ranges: Record<TimeRange, number> = {
      '7d': 7,
      '14d': 14,
      '30d': 30,
      '90d': 90,
      '12m': 365,
      'all': 0,
    }

    const days = ranges[timeRange]
    const cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)

    return data.filter((d) => {
      const dateValue = d[xAxisKey]
      if (!dateValue) return false
      const date = new Date(dateValue)
      return date >= cutoffDate
    })
  }, [data, timeRange, xAxisKey])

  // Aggregate data by category for pie charts
  const categoryData = useMemo(() => {
    const categoryMap = new Map<string, number>()
    filteredData.forEach((d) => {
      const category = d.category || 'Other'
      categoryMap.set(category, (categoryMap.get(category) ?? 0) + (d[dataKey] as number))
    })
    return Array.from(categoryMap.entries()).map(([name, value]) => ({ name, value }))
  }, [filteredData, dataKey])

  // Handle export
  const handleExport = useCallback(
    async (format: 'csv' | 'png' | 'json') => {
      if (!onExport) return

      try {
        if (format === 'csv') {
          // Export as CSV
          const headers = [xAxisKey, dataKey]
          const csvContent = [
            headers.join(','),
            ...filteredData.map((d) => `${d[xAxisKey]},${d[dataKey]}`),
          ].join('\n')

          const blob = new Blob([csvContent], { type: 'text/csv' })
          const url = URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          link.download = `${title.replace(/\s+/g, '-').toLowerCase()}-${timeRange}.csv`
          link.click()
          URL.revokeObjectURL(url)

          toast({ title: 'Exported as CSV', description: 'Your data has been downloaded.' })
        } else if (format === 'json') {
          // Export as JSON
          const jsonContent = JSON.stringify(filteredData, null, 2)
          const blob = new Blob([jsonContent], { type: 'application/json' })
          const url = URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          link.download = `${title.replace(/\s+/g, '-').toLowerCase()}-${timeRange}.json`
          link.click()
          URL.revokeObjectURL(url)

          toast({ title: 'Exported as JSON', description: 'Your data has been downloaded.' })
        } else if (format === 'png') {
          // Export chart as PNG using html2canvas
          const container = document.querySelector('.chart-container')
          if (container) {
            // This would require html2canvas library
            toast({
              title: 'PNG export',
              description: 'Chart image download requires html2canvas library.',
            })
          }
        }
      } catch (error) {
        console.error('Export failed:', error)
        toast({
          title: 'Export failed',
          description: 'An error occurred while exporting your data.',
          variant: 'destructive',
        })
      }
    },
    [filteredData, xAxisKey, dataKey, title, timeRange, onExport, toast]
  )

  return (
    <Card className={cn('chart-container', className)}>
      <InteractiveChartHeader
        chartType={chartType}
        description={description}
        handleExport={handleExport}
        isRefreshing={isRefreshing}
        onRefresh={onRefresh}
        setChartType={setChartType}
        setTimeRange={setTimeRange}
        showExport={showExport && !!onExport}
        showRefresh={showRefresh}
        timeRange={timeRange}
        title={title}
      />

      <CardContent className="pt-4">
        <InteractiveChartRenderer
          categoryData={categoryData}
          chartType={chartType}
          dataKey={dataKey}
          filteredData={filteredData}
          height={height}
          valueFormatter={valueFormatter}
          xAxisKey={xAxisKey}
        />
      </CardContent>
    </Card>
  )
}

/**
 * Mini sparkline chart for displaying trends in small spaces
 */
export function SparklineChart({
  data,
  valueKey = 'value',
  width = 100,
  height = 40,
  className,
  trend,
}: {
  data: ChartDataPoint[]
  valueKey?: string
  width?: number
  height?: number
  className?: string
  trend?: 'up' | 'down' | 'neutral'
}) {
  const color = trend === 'up' ? CHART_COLORS.metrics.revenue : trend === 'down' ? CHART_COLORS.metrics.spend : GRAYS[500]

  return (
    <div className={cn('inline-block', className)}>
      <ResponsiveContainer width={width} height={height}>
        <LineChart data={data}>
          <Line
            type="monotone"
            dataKey={valueKey}
            stroke={color}
            strokeWidth={2}
            dot={false}
            activeDot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

/**
 * Multi-metric comparison chart
 */
export function MultiMetricChart({
  data,
  metrics,
  xAxisKey = 'date',
  height = 300,
  className,
}: {
  data: ChartDataPoint[]
  metrics: Array<{ key: string; label: string; color: string }>
  xAxisKey?: string
  height?: number
  className?: string
}) {
  return (
    <ResponsiveContainer width="100%" height={height} className={className}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.2} />
        <XAxis
          dataKey={xAxisKey}
          tick={{ fontSize: 11 }}
          stroke="hsl(var(--muted-foreground))"
          strokeOpacity={0.5}
        />
        <YAxis
          tick={{ fontSize: 11 }}
          stroke="hsl(var(--muted-foreground))"
          strokeOpacity={0.5}
        />
        <Tooltip
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null
            return (
              <div className="bg-background border rounded-lg px-2 py-1 shadow-sm">
                {payload.map((entry, index: number) => {
                  const typedEntry = entry as { name?: string; value?: number | string }
                  const metric = metrics[index]
                  return (
                    <p key={typedEntry.name} style={{ color: metric?.color }}>
                      {metric?.label}: {typedEntry.value}
                    </p>
                  )
                })}
              </div>
            )
          }}
        />
        <Legend />
        {metrics.map((metric) => (
          <Line
            key={metric.key}
            type="monotone"
            dataKey={metric.key}
            stroke={metric.color}
            strokeWidth={2}
            dot={{ fill: metric.color, r: 3 }}
            activeDot={{ r: 5 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}
