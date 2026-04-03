'use client'

import { AnalyticsEmptyState } from '@/shared/ui/analytics-empty-state'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Skeleton } from '@/shared/ui/skeleton'
import { formatCurrency } from '@/lib/utils'
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
    XAxis,
    YAxis,
} from './chart-imports'
import {
    conversionRateChartConfig,
    conversionsChartConfig,
    revenueChartConfig,
    usersSessionsChartConfig,
} from './chart-configs'
import type { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent'

const AXIS_TICK_STYLE = {
    fontSize: '10px',
    fontWeight: '600',
    fill: 'var(--muted-foreground)',
    opacity: 0.8,
} as const

const CHART_TOOLTIP_CLASS_NAME = 'rounded-xl border-muted/40 shadow-lg backdrop-blur-md'
const CHART_TOOLTIP_CURSOR = { strokeDasharray: '3 3' } as const
const CHART_ACTIVE_DOT = { r: 6, strokeWidth: 0 } as const
const CHART_LEGEND_CONTENT = <ChartLegendContent className="pt-4 text-[10px] font-bold uppercase tracking-widest opacity-80" />
const CHART_MARGIN = { top: 8, right: 8, left: 0, bottom: 0 } as const

function formatDateTick(value: string) {
    const date = new Date(value)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function formatNumberTick(value: number | string) {
    return Number(value).toLocaleString()
}

function formatCurrencyTick(value: number | string) {
    return formatCurrency(Number(value))
}

function formatPercentTick(value: number | string) {
    return `${Number(value).toFixed(1)}%`
}

function renderUsersSessionsTooltip(value: ValueType, name: NameType) {
    const displayValue = Array.isArray(value) ? value[0] ?? 0 : value

    return (
        <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">{String(name)}:</span>
            <span className="text-sm font-bold text-foreground">{Number(displayValue).toLocaleString()}</span>
        </div>
    )
}

function renderRevenueTooltip(value: unknown) {
    return (
        <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">Revenue:</span>
            <span className="text-sm font-bold text-foreground">{formatCurrency(value as number)}</span>
        </div>
    )
}

function renderConversionsTooltip(value: unknown) {
    return (
        <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">Conversions:</span>
            <span className="text-sm font-bold text-foreground">{Number(value).toLocaleString()}</span>
        </div>
    )
}

function renderConversionRateTooltip(value: unknown) {
    return (
        <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">Conv rate:</span>
            <span className="text-sm font-bold text-foreground">{(value as number).toFixed(2)}%</span>
        </div>
    )
}

const USERS_SESSIONS_TOOLTIP_CONTENT = (
    <ChartTooltipContent className={CHART_TOOLTIP_CLASS_NAME} formatter={renderUsersSessionsTooltip} />
)

const REVENUE_TOOLTIP_CONTENT = (
    <ChartTooltipContent className={CHART_TOOLTIP_CLASS_NAME} formatter={renderRevenueTooltip} />
)

const CONVERSIONS_TOOLTIP_CONTENT = (
    <ChartTooltipContent className={CHART_TOOLTIP_CLASS_NAME} formatter={renderConversionsTooltip} />
)

const CONVERSION_RATE_TOOLTIP_CONTENT = (
    <ChartTooltipContent className={CHART_TOOLTIP_CLASS_NAME} formatter={renderConversionRateTooltip} />
)

interface ChartDataPoint {
    date: string
    users: number
    sessions: number
    revenue: number
    conversions: number
    conversionRate: number
}

interface AnalyticsChartsProps {
    chartData: ChartDataPoint[]
    isMetricsLoading: boolean
    initialMetricsLoading: boolean
}

export function AnalyticsCharts({
    chartData,
    isMetricsLoading,
    initialMetricsLoading,
}: AnalyticsChartsProps) {
    return (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Users vs Sessions Chart */}
            <Card className="overflow-hidden border-muted/40 bg-background shadow-sm transition-[color,background-color,border-color,text-decoration-color,fill,stroke,opacity,box-shadow,transform,filter,backdrop-filter] hover:shadow-md">
                <CardHeader className="border-b border-muted/20 bg-muted/5 py-4">
                    <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-primary" />
                        <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground/80">Users vs sessions</CardTitle>
                    </div>
                    <CardDescription className="text-xs font-medium text-muted-foreground/60 leading-tight">Daily audience and visit volume for the selected period</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                    {initialMetricsLoading || (isMetricsLoading && chartData.length === 0) ? (
                        <Skeleton className="h-[300px] w-full rounded-xl" />
                    ) : chartData.length === 0 ? (
                        <AnalyticsEmptyState
                            variant="no-filters"
                            title="No Performance Data"
                            description="There is no performance data available for the selected filters and time period."
                            className="h-[300px] py-6"
                        />
                    ) : (
                        <ChartContainer config={usersSessionsChartConfig} className="h-[300px] w-full">
                            <AreaChart data={chartData} margin={CHART_MARGIN} accessibilityLayer>
                                <defs>
                                    <linearGradient id="fillUsersAnalytics" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--color-users)" stopOpacity={0.28} />
                                        <stop offset="95%" stopColor="var(--color-users)" stopOpacity={0.04} />
                                    </linearGradient>
                                    <linearGradient id="fillSessionsAnalytics" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--color-sessions)" stopOpacity={0.24} />
                                        <stop offset="95%" stopColor="var(--color-sessions)" stopOpacity={0.03} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.12} />
                                <XAxis
                                    dataKey="date"
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={12}
                                    style={AXIS_TICK_STYLE}
                                    tickFormatter={formatDateTick}
                                />
                                <YAxis
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={12}
                                    style={AXIS_TICK_STYLE}
                                    tickFormatter={formatNumberTick}
                                />
                                <ChartTooltip
                                    cursor={CHART_TOOLTIP_CURSOR}
                                    content={USERS_SESSIONS_TOOLTIP_CONTENT}
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
                                    fill="url(#fillSessionsAnalytics)"
                                    dot={false}
                                    activeDot={CHART_ACTIVE_DOT}
                                />
                            </AreaChart>
                        </ChartContainer>
                    )}
                </CardContent>
            </Card>

            {/* Revenue Trend Chart */}
            <Card className="overflow-hidden border-muted/40 bg-background shadow-sm transition-[color,background-color,border-color,text-decoration-color,fill,stroke,opacity,box-shadow,transform,filter,backdrop-filter] hover:shadow-md">
                <CardHeader className="border-b border-muted/20 bg-muted/5 py-4">
                    <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-success" />
                        <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground/80">Revenue trend</CardTitle>
                    </div>
                    <CardDescription className="text-xs font-medium text-muted-foreground/60 leading-tight">Daily revenue reported by Google Analytics</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                    {initialMetricsLoading || (isMetricsLoading && chartData.length === 0) ? (
                        <Skeleton className="h-[300px] w-full rounded-xl" />
                    ) : chartData.length === 0 ? (
                        <AnalyticsEmptyState
                            variant="no-filters"
                            title="No Performance Data"
                            description="There is no performance data available for the selected filters and time period."
                            className="h-[300px] py-6"
                        />
                    ) : (
                        <ChartContainer config={revenueChartConfig} className="h-[300px] w-full">
                            <AreaChart data={chartData} margin={CHART_MARGIN} accessibilityLayer>
                                <defs>
                                    <linearGradient id="fillRevenueAnalytics" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--color-revenue)" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="var(--color-revenue)" stopOpacity={0.05} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.12} />
                                <XAxis
                                    dataKey="date"
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={12}
                                    style={AXIS_TICK_STYLE}
                                    tickFormatter={formatDateTick}
                                />
                                <YAxis
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={12}
                                    style={AXIS_TICK_STYLE}
                                    tickFormatter={formatCurrencyTick}
                                />
                                <ChartTooltip
                                    cursor={CHART_TOOLTIP_CURSOR}
                                    content={REVENUE_TOOLTIP_CONTENT}
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

            {/* Conversions Chart */}
            <Card className="overflow-hidden border-muted/40 bg-background shadow-sm transition-[color,background-color,border-color,text-decoration-color,fill,stroke,opacity,box-shadow,transform,filter,backdrop-filter] hover:shadow-md">
                <CardHeader className="border-b border-muted/20 bg-muted/5 py-4">
                    <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-info" />
                        <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground/80">Conversions</CardTitle>
                    </div>
                    <CardDescription className="text-xs font-medium text-muted-foreground/60 leading-tight">Daily conversion volume for the selected period</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                    {initialMetricsLoading || (isMetricsLoading && chartData.length === 0) ? (
                        <Skeleton className="h-[300px] w-full rounded-xl" />
                    ) : chartData.length === 0 ? (
                        <AnalyticsEmptyState
                            variant="no-filters"
                            title="No Performance Data"
                            description="There is no performance data available for the selected filters and time period."
                            className="h-[300px] py-6"
                        />
                    ) : (
                        <ChartContainer config={conversionsChartConfig} className="h-[300px] w-full">
                            <BarChart data={chartData} margin={CHART_MARGIN} accessibilityLayer>
                                <defs>
                                    <linearGradient id="fillConversionsAnalytics" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="var(--color-conversions)" stopOpacity={0.95} />
                                        <stop offset="100%" stopColor="var(--color-conversions)" stopOpacity={0.45} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.12} />
                                <XAxis
                                    dataKey="date"
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={12}
                                    style={AXIS_TICK_STYLE}
                                    tickFormatter={formatDateTick}
                                />
                                <YAxis
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={12}
                                    style={AXIS_TICK_STYLE}
                                    tickFormatter={formatNumberTick}
                                />
                                <ChartTooltip
                                    content={CONVERSIONS_TOOLTIP_CONTENT}
                                />
                                <ChartLegend content={CHART_LEGEND_CONTENT} />
                                <Bar dataKey="conversions" fill="url(#fillConversionsAnalytics)" radius={[6, 6, 0, 0]} barSize={24} />
                            </BarChart>
                        </ChartContainer>
                    )}
                </CardContent>
            </Card>

            {/* Conversion Rate Chart */}
            <Card className="overflow-hidden border-muted/40 bg-background shadow-sm transition-[color,background-color,border-color,text-decoration-color,fill,stroke,opacity,box-shadow,transform,filter,backdrop-filter] hover:shadow-md">
                <CardHeader className="border-b border-muted/20 bg-muted/5 py-4">
                    <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-warning" />
                        <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground/80">Conversion rate</CardTitle>
                    </div>
                    <CardDescription className="text-xs font-medium text-muted-foreground/60 leading-tight">Daily conversion rate based on sessions</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                    {initialMetricsLoading || (isMetricsLoading && chartData.length === 0) ? (
                        <Skeleton className="h-[300px] w-full rounded-xl" />
                    ) : chartData.length === 0 ? (
                        <AnalyticsEmptyState
                            variant="no-filters"
                            title="No Performance Data"
                            description="There is no performance data available for the selected filters and time period."
                            className="h-[300px] py-6"
                        />
                    ) : (
                        <ChartContainer config={conversionRateChartConfig} className="h-[300px] w-full">
                            <AreaChart data={chartData} margin={CHART_MARGIN} accessibilityLayer>
                                <defs>
                                    <linearGradient id="fillConversionRateAnalytics" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--color-conversionRate)" stopOpacity={0.24} />
                                        <stop offset="95%" stopColor="var(--color-conversionRate)" stopOpacity={0.04} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.12} />
                                <XAxis
                                    dataKey="date"
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={12}
                                    style={AXIS_TICK_STYLE}
                                    tickFormatter={formatDateTick}
                                />
                                <YAxis
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={12}
                                    style={AXIS_TICK_STYLE}
                                    tickFormatter={formatPercentTick}
                                />
                                <ChartTooltip
                                    cursor={CHART_TOOLTIP_CURSOR}
                                    content={CONVERSION_RATE_TOOLTIP_CONTENT}
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
