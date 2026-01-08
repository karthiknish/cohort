'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
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
            <Card className="border-muted/60 bg-background">
                <CardHeader>
                    <CardTitle>Revenue vs spend</CardTitle>
                    <CardDescription>Daily totals for the selected period</CardDescription>
                </CardHeader>
                <CardContent>
                    {initialMetricsLoading || (isMetricsLoading && chartData.length === 0) ? (
                        <Skeleton className="h-[300px] w-full" />
                    ) : chartData.length === 0 ? (
                        <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
                            No performance data for the selected filters.
                        </div>
                    ) : (
                        <ChartContainer config={revenueSpendChartConfig} className="h-[300px] w-full">
                            <LineChart data={chartData} accessibilityLayer>
                                <CartesianGrid vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={8}
                                    tickFormatter={(value) => {
                                        const date = new Date(value)
                                        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                                    }}
                                />
                                <YAxis
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={8}
                                    tickFormatter={(value) => formatCurrency(value)}
                                />
                                <ChartTooltip
                                    cursor={false}
                                    content={
                                        <ChartTooltipContent
                                            formatter={(value, name) => (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-muted-foreground">{name}:</span>
                                                    <span className="font-medium">{formatCurrency(value as number)}</span>
                                                </div>
                                            )}
                                        />
                                    }
                                />
                                <ChartLegend content={<ChartLegendContent />} />
                                <Line
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="var(--color-revenue)"
                                    strokeWidth={2}
                                    dot={false}
                                    activeDot={{ r: 6 }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="spend"
                                    stroke="var(--color-spend)"
                                    strokeWidth={2}
                                    dot={false}
                                    activeDot={{ r: 6 }}
                                />
                            </LineChart>
                        </ChartContainer>
                    )}
                </CardContent>
            </Card>

            {/* ROAS Performance Chart */}
            <Card className="border-muted/60 bg-background">
                <CardHeader>
                    <CardTitle>ROAS performance</CardTitle>
                    <CardDescription>Return on ad spend across the selected period</CardDescription>
                </CardHeader>
                <CardContent>
                    {initialMetricsLoading || (isMetricsLoading && chartData.length === 0) ? (
                        <Skeleton className="h-[300px] w-full" />
                    ) : chartData.length === 0 ? (
                        <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
                            No performance data for the selected filters.
                        </div>
                    ) : (
                        <ChartContainer config={roasChartConfig} className="h-[300px] w-full">
                            <BarChart data={chartData} accessibilityLayer>
                                <CartesianGrid vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={8}
                                    tickFormatter={(value) => {
                                        const date = new Date(value)
                                        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                                    }}
                                />
                                <YAxis
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={8}
                                    tickFormatter={(value) => `${value.toFixed(1)}x`}
                                />
                                <ChartTooltip
                                    cursor={false}
                                    content={
                                        <ChartTooltipContent
                                            formatter={(value) => (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-muted-foreground">ROAS:</span>
                                                    <span className="font-medium">{(value as number).toFixed(2)}x</span>
                                                </div>
                                            )}
                                        />
                                    }
                                />
                                <ChartLegend content={<ChartLegendContent />} />
                                <Bar dataKey="roas" fill="var(--color-roas)" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ChartContainer>
                    )}
                </CardContent>
            </Card>

            {/* Platform Budget Distribution Chart */}
            <Card className="border-muted/60 bg-background">
                <CardHeader>
                    <CardTitle>Platform budget distribution</CardTitle>
                    <CardDescription>Spend share across connected platforms</CardDescription>
                </CardHeader>
                <CardContent>
                    {initialMetricsLoading || (isMetricsLoading && platformBreakdown.length === 0) ? (
                        <Skeleton className="h-[300px] w-full" />
                    ) : platformBreakdown.length === 0 ? (
                        <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
                            Connect a platform to see spend distribution.
                        </div>
                    ) : (
                        <ChartContainer config={platformChartConfig} className="h-[300px] w-full">
                            <PieChart accessibilityLayer>
                                <ChartTooltip
                                    content={
                                        <ChartTooltipContent
                                            formatter={(value, name) => (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-muted-foreground">{name}:</span>
                                                    <span className="font-medium">{formatCurrency(value as number)}</span>
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
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={2}
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    labelLine={false}
                                >
                                    {platformBreakdown.map((entry) => (
                                        <Cell key={entry.name} fill={entry.color} />
                                    ))}
                                </Pie>
                            </PieChart>
                        </ChartContainer>
                    )}
                </CardContent>
            </Card>

            {/* Click Performance Chart */}
            <Card className="border-muted/60 bg-background">
                <CardHeader>
                    <CardTitle>Click performance</CardTitle>
                    <CardDescription>Breakdown of daily click volume</CardDescription>
                </CardHeader>
                <CardContent>
                    {initialMetricsLoading || (isMetricsLoading && chartData.length === 0) ? (
                        <Skeleton className="h-[300px] w-full" />
                    ) : chartData.length === 0 ? (
                        <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
                            Welcome! Connect your first ad account to see click performance.
                        </div>
                    ) : (
                        <ChartContainer config={clicksChartConfig} className="h-[300px] w-full">
                            <LineChart data={chartData} accessibilityLayer>
                                <CartesianGrid vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={8}
                                    tickFormatter={(value) => {
                                        const date = new Date(value)
                                        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                                    }}
                                />
                                <YAxis
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={8}
                                    tickFormatter={(value) => value.toLocaleString()}
                                />
                                <ChartTooltip
                                    cursor={false}
                                    content={
                                        <ChartTooltipContent
                                            formatter={(value) => (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-muted-foreground">Clicks:</span>
                                                    <span className="font-medium">{(value as number).toLocaleString()}</span>
                                                </div>
                                            )}
                                        />
                                    }
                                />
                                <ChartLegend content={<ChartLegendContent />} />
                                <Line
                                    type="monotone"
                                    dataKey="clicks"
                                    stroke="var(--color-clicks)"
                                    strokeWidth={2}
                                    dot={false}
                                    activeDot={{ r: 6 }}
                                />
                            </LineChart>
                        </ChartContainer>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
