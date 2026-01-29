'use client'

import { useState, useCallback, useMemo } from 'react'
import {
  Line,
  LineChart,
  Bar,
  BarChart,
  Area,
  AreaChart,
  Pie,
  PieChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Download, ZoomIn, ZoomOut, RefreshCw, Settings2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/utils'
import { useToast } from '@/components/ui/use-toast'

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

const COLORS = [
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#f59e0b', // amber
  '#10b981', // emerald
  '#06b6d4', // cyan
  '#f97316', // orange
  '#84cc16', // lime
]

/**
 * Interactive chart component with multiple chart types and export
 */
export function InteractiveChart({
  data,
  title = 'Performance Chart',
  description,
  dataKey = 'value',
  xAxisKey = 'date',
  valueFormatter = (v) => v.toString(),
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

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null

    const data = payload[0].payload
    return (
      <div className="bg-background border rounded-lg px-3 py-2 shadow-sm">
        <p className="text-sm font-medium">{data[xAxisKey] || data.date}</p>
        <p className="text-lg font-bold">{valueFormatter(data[dataKey] as number)}</p>
        {data.category && (
          <p className="text-xs text-muted-foreground">{data.category}</p>
        )}
      </div>
    )
  }

  const renderChart = () => {
    if (filteredData.length === 0) {
      return (
        <div className="flex items-center justify-center h-full">
          <p className="text-sm text-muted-foreground">No data available for this time range</p>
        </div>
      )
    }

    const commonProps = {
      data: chartType === 'pie' ? categoryData : filteredData,
      height,
      margin: { top: 10, right: 10, left: 10, bottom: 10 },
    }

    switch (chartType) {
      case 'line':
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.2} />
            <XAxis
              dataKey={xAxisKey}
              tick={{ fontSize: 12 }}
              stroke="currentColor"
              strokeOpacity={0.5}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
              }}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              stroke="currentColor"
              strokeOpacity={0.5}
              tickFormatter={valueFormatter}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: '#3b82f6', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        )

      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.2} />
            <XAxis
              dataKey={xAxisKey}
              tick={{ fontSize: 12 }}
              stroke="currentColor"
              strokeOpacity={0.5}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
              }}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              stroke="currentColor"
              strokeOpacity={0.5}
              tickFormatter={valueFormatter}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey={dataKey} fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        )

      case 'area':
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.2} />
            <XAxis
              dataKey={xAxisKey}
              tick={{ fontSize: 12 }}
              stroke="currentColor"
              strokeOpacity={0.5}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              stroke="currentColor"
              strokeOpacity={0.5}
              tickFormatter={valueFormatter}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke="#3b82f6"
              fill="#3b82f6"
              fillOpacity={0.3}
            />
          </AreaChart>
        )

      case 'pie':
        return (
          <PieChart {...commonProps}>
            <Pie
              data={categoryData}
              dataKey="value"
              name="Share"
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={80}
              paddingAngle={2}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              labelLine={false}
            >
              {categoryData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              content={(props: any) => {
                if (!props.active || !props.payload) return null
                const { name, value } = props.payload[0]
                return (
                  <div className="bg-background border rounded-lg px-3 py-2 shadow-sm">
                    <p className="font-medium">{name}</p>
                    <p className="text-lg font-bold">{valueFormatter(value as number)}</p>
                  </div>
                )
              }}
            />
          </PieChart>
        )

      default:
        return null
    }
  }

  return (
    <Card className={cn('chart-container', className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex-1 min-w-0">
          <CardTitle>{title}</CardTitle>
          {description && (
            <CardDescription className="mt-1">{description}</CardDescription>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Chart type selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                {chartType === 'line' && 'Line Chart'}
                {chartType === 'bar' && 'Bar Chart'}
                {chartType === 'area' && 'Area Chart'}
                {chartType === 'pie' && 'Pie Chart'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setChartType('line')}>Line Chart</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setChartType('bar')}>Bar Chart</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setChartType('area')}>Area Chart</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setChartType('pie')}>Pie Chart</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Time range selector */}
          <Select value={timeRange} onValueChange={(v) => setTimeRange(v as TimeRange)}>
            <SelectTrigger className="w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="14d">Last 14 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="12m">Last 12 months</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>

          {/* Actions */}
          {showRefresh && onRefresh && (
            <Button
              variant="outline"
              size="icon"
              onClick={onRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={cn('h-4 w-4', isRefreshing && 'animate-spin')} />
            </Button>
          )}

          {showExport && onExport && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Download className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleExport('csv')}>
                  Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('json')}>
                  Export as JSON
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('png')}>
                  Export as Image
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        <ResponsiveContainer width="100%" height={height}>
          {renderChart() ?? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              No data available
            </div>
          )}
        </ResponsiveContainer>
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
  const color = trend === 'up' ? '#10b981' : trend === 'down' ? '#ef4444' : '#6b7280'

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
                {payload.map((entry: any, index: number) => {
                  const metric = metrics[index]
                  return (
                    <p key={entry.name} style={{ color: metric?.color }}>
                      {metric?.label}: {entry.value}
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
