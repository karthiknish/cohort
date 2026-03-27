'use client'

import { AnalyticsEmptyState } from '@/shared/ui/analytics-empty-state'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Skeleton } from '@/shared/ui/skeleton'
import { formatCurrency } from '@/lib/utils'
import {
    Bar,
    BarChart,
    CartesianGrid,
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
    Line,
    LineChart,
    XAxis,
    YAxis,
} from './chart-imports'
import {
    conversionRateChartConfig,
    conversionsChartConfig,
    revenueChartConfig,
    usersSessionsChartConfig,
} from './chart-configs'

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
                            <LineChart data={chartData} accessibilityLayer>
                                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--muted-foreground)" opacity={0.1} />
                                <XAxis
                                    dataKey="date"
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={12}
                                    style={{ fontSize: '10px', fontWeight: '600', fill: 'var(--muted-foreground)', opacity: 0.8 }}
                                    tickFormatter={(value) => {
                                        const date = new Date(value)
                                        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                                    }}
                                />
                                <YAxis
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={12}
                                    style={{ fontSize: '10px', fontWeight: '600', fill: 'var(--muted-foreground)', opacity: 0.8 }}
                                    tickFormatter={(value) => Number(value).toLocaleString()}
                                />
                                <ChartTooltip
                                    cursor={{ stroke: 'rgba(var(--primary), 0.2)', strokeWidth: 1 }}
                                    content={
                                        <ChartTooltipContent
                                            className="rounded-xl border-muted/40 shadow-lg backdrop-blur-md"
                                            formatter={(value, name) => (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">{name}:</span>
                                                    <span className="text-sm font-bold text-foreground">{Number(value).toLocaleString()}</span>
                                                </div>
                                            )}
                                        />
                                    }
                                />
                                <ChartLegend content={<ChartLegendContent className="pt-4 text-[10px] font-bold uppercase tracking-widest opacity-80" />} />
                                <Line
                                    type="monotone"
                                    dataKey="users"
                                    stroke="var(--color-users)"
                                    strokeWidth={3}
                                    dot={false}
                                    activeDot={{ r: 6, strokeWidth: 0 }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="sessions"
                                    stroke="var(--color-sessions)"
                                    strokeWidth={3}
                                    dot={false}
                                    activeDot={{ r: 6, strokeWidth: 0 }}
                                />
                            </LineChart>
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
                            <LineChart data={chartData} accessibilityLayer>
                                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--muted-foreground)" opacity={0.1} />
                                <XAxis
                                    dataKey="date"
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={12}
                                    style={{ fontSize: '10px', fontWeight: '600', fill: 'var(--muted-foreground)', opacity: 0.8 }}
                                    tickFormatter={(value) => {
                                        const date = new Date(value)
                                        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                                    }}
                                />
                                <YAxis
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={12}
                                    style={{ fontSize: '10px', fontWeight: '600', fill: 'var(--muted-foreground)', opacity: 0.8 }}
                                    tickFormatter={(value) => formatCurrency(Number(value))}
                                />
                                <ChartTooltip
                                    cursor={{ stroke: 'rgba(var(--primary), 0.2)', strokeWidth: 1 }}
                                    content={
                                        <ChartTooltipContent
                                            className="rounded-xl border-muted/40 shadow-lg backdrop-blur-md"
                                            formatter={(value) => (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">Revenue:</span>
                                                    <span className="text-sm font-bold text-foreground">{formatCurrency(value as number)}</span>
                                                </div>
                                            )}
                                        />
                                    }
                                />
                                <ChartLegend content={<ChartLegendContent className="pt-4 text-[10px] font-bold uppercase tracking-widest opacity-80" />} />
                                <Line
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="var(--color-revenue)"
                                    strokeWidth={3}
                                    dot={false}
                                    activeDot={{ r: 6, strokeWidth: 0 }}
                                />
                            </LineChart>
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
                            <BarChart data={chartData} accessibilityLayer>
                                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--muted-foreground)" opacity={0.1} />
                                <XAxis
                                    dataKey="date"
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={12}
                                    style={{ fontSize: '10px', fontWeight: '600', fill: 'var(--muted-foreground)', opacity: 0.8 }}
                                    tickFormatter={(value) => {
                                        const date = new Date(value)
                                        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                                    }}
                                />
                                <YAxis
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={12}
                                    style={{ fontSize: '10px', fontWeight: '600', fill: 'var(--muted-foreground)', opacity: 0.8 }}
                                    tickFormatter={(value) => Number(value).toLocaleString()}
                                />
                                <ChartTooltip
                                    content={
                                        <ChartTooltipContent
                                            className="rounded-xl border-muted/40 shadow-lg backdrop-blur-md"
                                            formatter={(value) => (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">Conversions:</span>
                                                    <span className="text-sm font-bold text-foreground">{Number(value).toLocaleString()}</span>
                                                </div>
                                            )}
                                        />
                                    }
                                />
                                <ChartLegend content={<ChartLegendContent className="pt-4 text-[10px] font-bold uppercase tracking-widest opacity-80" />} />
                                <Bar dataKey="conversions" fill="var(--color-conversions)" radius={[6, 6, 0, 0]} barSize={24} />
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
                            <LineChart data={chartData} accessibilityLayer>
                                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--muted-foreground)" opacity={0.1} />
                                <XAxis
                                    dataKey="date"
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={12}
                                    style={{ fontSize: '10px', fontWeight: '600', fill: 'var(--muted-foreground)', opacity: 0.8 }}
                                    tickFormatter={(value) => {
                                        const date = new Date(value)
                                        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                                    }}
                                />
                                <YAxis
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={12}
                                    style={{ fontSize: '10px', fontWeight: '600', fill: 'var(--muted-foreground)', opacity: 0.8 }}
                                    tickFormatter={(value) => `${Number(value).toFixed(1)}%`}
                                />
                                <ChartTooltip
                                    cursor={{ stroke: 'rgba(var(--primary), 0.2)', strokeWidth: 1 }}
                                    content={
                                        <ChartTooltipContent
                                            className="rounded-xl border-muted/40 shadow-lg backdrop-blur-md"
                                            formatter={(value) => (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">Conv rate:</span>
                                                    <span className="text-sm font-bold text-foreground">{(value as number).toFixed(2)}%</span>
                                                </div>
                                            )}
                                        />
                                    }
                                />
                                <ChartLegend content={<ChartLegendContent className="pt-4 text-[10px] font-bold uppercase tracking-widest opacity-80" />} />
                                <Line
                                    type="monotone"
                                    dataKey="conversionRate"
                                    stroke="var(--color-conversionRate)"
                                    strokeWidth={3}
                                    dot={false}
                                    activeDot={{ r: 6, strokeWidth: 0 }}
                                />
                            </LineChart>
                        </ChartContainer>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
