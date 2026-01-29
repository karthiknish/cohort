'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { AnalyticsEmptyState, NoIntegrationConnected } from '@/components/ui/analytics-empty-state'
import { formatCurrency } from '@/lib/utils'
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    ChartLegend,
    ChartLegendContent,
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
} from './chart-imports'
import {
    revenueSpendChartConfig,
    roasChartConfig,
    clicksChartConfig,
    platformChartConfig,
} from './chart-configs'

interface ChartDataPoint {
    date: string
    spend: number
    revenue: number
    clicks: number
    conversions: number
    roas: number
}

interface PlatformBreakdownItem {
    name: string
    value: number
    color: string
}

interface AnalyticsChartsProps {
    chartData: ChartDataPoint[]
    platformBreakdown: PlatformBreakdownItem[]
    isMetricsLoading: boolean
    initialMetricsLoading: boolean
}

export function AnalyticsCharts({
    chartData,
    platformBreakdown,
    isMetricsLoading,
    initialMetricsLoading,
}: AnalyticsChartsProps) {
    return (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Revenue vs Spend Chart */}
            <Card className="overflow-hidden border-muted/40 bg-background shadow-sm transition-all hover:shadow-md">
                <CardHeader className="border-b border-muted/20 bg-muted/5 py-4">
                    <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-primary" />
                        <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground/80">Revenue vs spend</CardTitle>
                    </div>
                    <CardDescription className="text-xs font-medium text-muted-foreground/60 leading-tight">Daily totals for the selected period</CardDescription>
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
                        <ChartContainer config={revenueSpendChartConfig} className="h-[300px] w-full">
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
                                    tickFormatter={(value) => formatCurrency(value)}
                                />
                                <ChartTooltip
                                    cursor={{ stroke: 'rgba(var(--primary), 0.2)', strokeWidth: 1 }}
                                    content={
                                        <ChartTooltipContent
                                            className="rounded-xl border-muted/40 shadow-lg backdrop-blur-md"
                                            formatter={(value, name) => (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">{name}:</span>
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
                                <Line
                                    type="monotone"
                                    dataKey="spend"
                                    stroke="var(--color-spend)"
                                    strokeWidth={3}
                                    dot={false}
                                    activeDot={{ r: 6, strokeWidth: 0 }}
                                />
                            </LineChart>
                        </ChartContainer>
                    )}
                </CardContent>
            </Card>

            {/* ROAS Performance Chart */}
            <Card className="overflow-hidden border-muted/40 bg-background shadow-sm transition-all hover:shadow-md">
                <CardHeader className="border-b border-muted/20 bg-muted/5 py-4">
                    <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-emerald-500" />
                        <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground/80">ROAS performance</CardTitle>
                    </div>
                    <CardDescription className="text-xs font-medium text-muted-foreground/60 leading-tight">Return on ad spend across the selected period</CardDescription>
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
                        <ChartContainer config={roasChartConfig} className="h-[300px] w-full">
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
                                    tickFormatter={(value) => `${value.toFixed(1)}x`}
                                />
                                <ChartTooltip
                                    cursor={{ fill: 'rgba(var(--primary), 0.05)' }}
                                    content={
                                        <ChartTooltipContent
                                            className="rounded-xl border-muted/40 shadow-lg backdrop-blur-md"
                                            formatter={(value) => (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">ROAS:</span>
                                                    <span className="text-sm font-bold text-foreground">{(value as number).toFixed(2)}x</span>
                                                </div>
                                            )}
                                        />
                                    }
                                />
                                <ChartLegend content={<ChartLegendContent className="pt-4 text-[10px] font-bold uppercase tracking-widest opacity-80" />} />
                                <Bar dataKey="roas" fill="var(--color-roas)" radius={[6, 6, 0, 0]} barSize={24} />
                            </BarChart>
                        </ChartContainer>
                    )}
                </CardContent>
            </Card>

            {/* Platform Budget Distribution Chart */}
            <Card className="overflow-hidden border-muted/40 bg-background shadow-sm transition-all hover:shadow-md">
                <CardHeader className="border-b border-muted/20 bg-muted/5 py-4">
                    <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-blue-500" />
                        <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground/80">Platform budget distribution</CardTitle>
                    </div>
                    <CardDescription className="text-xs font-medium text-muted-foreground/60 leading-tight">Spend share across connected platforms</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                    {initialMetricsLoading || (isMetricsLoading && platformBreakdown.length === 0) ? (
                        <Skeleton className="h-[300px] w-full rounded-xl" />
                    ) : platformBreakdown.length === 0 ? (
                        <NoIntegrationConnected
                            platform="ad"
                            className="h-[300px] py-6"
                        />
                    ) : (
                        <ChartContainer config={platformChartConfig} className="h-[300px] w-full">
                            <PieChart accessibilityLayer>
                                <ChartTooltip
                                    content={
                                        <ChartTooltipContent
                                            className="rounded-xl border-muted/40 shadow-lg backdrop-blur-md"
                                            formatter={(value, name) => (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">{name}:</span>
                                                    <span className="text-sm font-bold text-foreground">{formatCurrency(value as number)}</span>
                                                </div>
                                            )}
                                        />
                                    }
                                />
                                <Pie
                                    data={platformBreakdown}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={100}
                                    paddingAngle={4}
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    labelLine={false}
                                    style={{ fontSize: '10px', fontWeight: 'bold' }}
                                >
                                    {platformBreakdown.map((entry) => (
                                        <Cell key={entry.name} fill={entry.color} stroke="none" />
                                    ))}
                                </Pie>
                            </PieChart>
                        </ChartContainer>
                    )}
                </CardContent>
            </Card>

            {/* Click Performance Chart */}
            <Card className="overflow-hidden border-muted/40 bg-background shadow-sm transition-all hover:shadow-md">
                <CardHeader className="border-b border-muted/20 bg-muted/5 py-4">
                    <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-orange-500" />
                        <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground/80">Click performance</CardTitle>
                    </div>
                    <CardDescription className="text-xs font-medium text-muted-foreground/60 leading-tight">Breakdown of daily click volume</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                    {initialMetricsLoading || (isMetricsLoading && chartData.length === 0) ? (
                        <Skeleton className="h-[300px] w-full rounded-xl" />
                    ) : chartData.length === 0 ? (
                        <NoIntegrationConnected
                            platform="ad account"
                            className="h-[300px] py-6"
                        />
                    ) : (
                        <ChartContainer config={clicksChartConfig} className="h-[300px] w-full">
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
                                    tickFormatter={(value) => value.toLocaleString()}
                                />
                                <ChartTooltip
                                    cursor={{ stroke: 'rgba(var(--primary), 0.2)', strokeWidth: 1 }}
                                    content={
                                        <ChartTooltipContent
                                            className="rounded-xl border-muted/40 shadow-lg backdrop-blur-md"
                                            formatter={(value) => (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">Clicks:</span>
                                                    <span className="text-sm font-bold text-foreground">{(value as number).toLocaleString()}</span>
                                                </div>
                                            )}
                                        />
                                    }
                                />
                                <ChartLegend content={<ChartLegendContent className="pt-4 text-[10px] font-bold uppercase tracking-widest opacity-80" />} />
                                <Line
                                    type="monotone"
                                    dataKey="clicks"
                                    stroke="var(--color-clicks)"
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
