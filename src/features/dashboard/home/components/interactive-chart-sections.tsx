'use client'

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from '@/shared/ui/recharts-dynamic'
import { Download, RefreshCw } from 'lucide-react'

import { Button } from '@/shared/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'
import { CHART_COLORS } from '@/lib/colors'
import { cn } from '@/lib/utils'

import type { ChartDataPoint, ChartType, TimeRange } from './interactive-chart'

type RechartsTooltipPayloadItem = {
  name?: string
  value?: number
  payload?: Record<string, string | number | undefined>
}

type RechartsTooltipProps = {
  active?: boolean
  payload?: RechartsTooltipPayloadItem[]
}

const COLORS = CHART_COLORS.primary

export function ChartTooltipContent({
  active,
  payload,
  xAxisKey,
  dataKey,
  valueFormatter,
}: RechartsTooltipProps & {
  xAxisKey: string
  dataKey: string
  valueFormatter: (value: number) => string
}) {
  if (!active || !payload?.length || !payload[0]?.payload) return null

  const data = payload[0].payload
  const labelValue = data[xAxisKey] ?? data.date
  const numericValue = Number(data[dataKey] ?? 0)

  return (
    <div className="rounded-lg border bg-background px-3 py-2 shadow-sm">
      <p className="text-sm font-medium">{String(labelValue ?? '')}</p>
      <p className="text-lg font-bold">{valueFormatter(Number.isFinite(numericValue) ? numericValue : 0)}</p>
      {typeof data.category === 'string' && data.category.length > 0 ? <p className="text-xs text-muted-foreground">{data.category}</p> : null}
    </div>
  )
}

export function PieTooltipContent({
  active,
  payload,
  valueFormatter,
}: RechartsTooltipProps & {
  valueFormatter: (value: number) => string
}) {
  if (!active || !payload?.length) return null

  const first = payload[0]
  const name = first?.name ? String(first.name) : 'Unknown'
  const value = Number(first?.value ?? 0)

  return (
    <div className="rounded-lg border bg-background px-3 py-2 shadow-sm">
      <p className="font-medium">{name}</p>
      <p className="text-lg font-bold">{valueFormatter(Number.isFinite(value) ? value : 0)}</p>
    </div>
  )
}

export function InteractiveChartHeader({
  chartType,
  description,
  handleExport,
  isRefreshing,
  onRefresh,
  setChartType,
  setTimeRange,
  showExport,
  showRefresh,
  timeRange,
  title,
}: {
  chartType: ChartType
  description?: string
  handleExport: (format: 'csv' | 'png' | 'json') => void
  isRefreshing: boolean
  onRefresh?: () => void
  setChartType: (type: ChartType) => void
  setTimeRange: (range: TimeRange) => void
  showExport: boolean
  showRefresh: boolean
  timeRange: TimeRange
  title: string
}) {
  return (
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <div className="min-w-0 flex-1">
        <CardTitle>{title}</CardTitle>
        {description ? <CardDescription className="mt-1">{description}</CardDescription> : null}
      </div>

      <div className="flex items-center gap-2">
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

        <Select value={timeRange} onValueChange={(value) => setTimeRange(value as TimeRange)}>
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

        {showRefresh && onRefresh ? (
          <Button variant="outline" size="icon" onClick={onRefresh} disabled={isRefreshing} aria-label="Refresh chart data">
            <RefreshCw className={cn('h-4 w-4', isRefreshing && 'animate-spin')} />
          </Button>
        ) : null}

        {showExport ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" aria-label="Export chart">
                <Download className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleExport('csv')}>Export as CSV</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('json')}>Export as JSON</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('png')}>Export as Image</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}
      </div>
    </CardHeader>
  )
}

export function InteractiveChartEmptyState({ message = 'No data available for this time range' }: { message?: string }) {
  return (
    <div className="flex h-full items-center justify-center">
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  )
}

export function InteractiveChartRenderer({
  categoryData,
  chartType,
  dataKey,
  filteredData,
  height,
  valueFormatter,
  xAxisKey,
}: {
  categoryData: Array<{ name: string; value: number }>
  chartType: ChartType
  dataKey: string
  filteredData: ChartDataPoint[]
  height: number
  valueFormatter: (value: number) => string
  xAxisKey: string
}) {
  if (filteredData.length === 0) {
    return <InteractiveChartEmptyState />
  }

  const commonProps = {
    data: chartType === 'pie' ? categoryData : filteredData,
    height,
    margin: { top: 10, right: 10, left: 10, bottom: 10 },
  }

  const chartNode =
    chartType === 'line' ? (
      <LineChart {...commonProps}>
        <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.2} />
        <XAxis dataKey={xAxisKey} tick={{ fontSize: 12 }} stroke="currentColor" strokeOpacity={0.5} tickFormatter={(value) => new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} />
        <YAxis tick={{ fontSize: 12 }} stroke="currentColor" strokeOpacity={0.5} tickFormatter={valueFormatter} />
        <Tooltip content={<ChartTooltipContent xAxisKey={xAxisKey} dataKey={dataKey} valueFormatter={valueFormatter} />} />
        <Line type="monotone" dataKey={dataKey} stroke={CHART_COLORS.primary[0]} strokeWidth={2} dot={{ fill: CHART_COLORS.primary[0], r: 4 }} activeDot={{ r: 6 }} />
      </LineChart>
    ) : chartType === 'bar' ? (
      <BarChart {...commonProps}>
        <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.2} />
        <XAxis dataKey={xAxisKey} tick={{ fontSize: 12 }} stroke="currentColor" strokeOpacity={0.5} tickFormatter={(value) => new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} />
        <YAxis tick={{ fontSize: 12 }} stroke="currentColor" strokeOpacity={0.5} tickFormatter={valueFormatter} />
        <Tooltip content={<ChartTooltipContent xAxisKey={xAxisKey} dataKey={dataKey} valueFormatter={valueFormatter} />} />
        <Bar dataKey={dataKey} fill={CHART_COLORS.primary[0]} radius={[4, 4, 0, 0]} />
      </BarChart>
    ) : chartType === 'area' ? (
      <AreaChart {...commonProps}>
        <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.2} />
        <XAxis dataKey={xAxisKey} tick={{ fontSize: 12 }} stroke="currentColor" strokeOpacity={0.5} />
        <YAxis tick={{ fontSize: 12 }} stroke="currentColor" strokeOpacity={0.5} tickFormatter={valueFormatter} />
        <Tooltip content={<ChartTooltipContent xAxisKey={xAxisKey} dataKey={dataKey} valueFormatter={valueFormatter} />} />
        <Area type="monotone" dataKey={dataKey} stroke={CHART_COLORS.primary[0]} fill={CHART_COLORS.primary[0]} fillOpacity={0.3} />
      </AreaChart>
    ) : (
      <PieChart {...commonProps}>
        <Pie data={categoryData} dataKey="value" name="Share" cx="50%" cy="50%" innerRadius={40} outerRadius={80} paddingAngle={2} label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`} labelLine={false}>
          {categoryData.map((entry, index) => (
            <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<PieTooltipContent valueFormatter={valueFormatter} />} />
      </PieChart>
    )

  return (
    <ResponsiveContainer width="100%" height={height}>
      {chartNode}
    </ResponsiveContainer>
  )
}
