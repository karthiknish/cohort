'use client'

import { useMemo } from 'react'
import {
    TrendingUp,
    TrendingDown,
    Minus,
    ArrowRight,
    Calendar,
    Layers,
} from 'lucide-react'

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn, formatCurrency } from '@/lib/utils'

import type { PeriodComparison, ProviderComparison } from '../hooks/use-metrics-comparison'
import { PROVIDER_ICON_MAP, formatProviderName } from './utils'

// =============================================================================
// TYPES
// =============================================================================

interface ComparisonViewCardProps {
    periodComparison: PeriodComparison | null
    providerComparison: ProviderComparison[]
    loading?: boolean
}

interface MetricRowProps {
    label: string
    current: number | null
    previous: number | null
    delta: number | null
    deltaPercent: number | null
    format: 'currency' | 'percent' | 'number'
    invertTrend?: boolean
}

// =============================================================================
// HELPERS
// =============================================================================

function formatValue(value: number | null, format: string): string {
    if (value === null || !isFinite(value)) return '—'

    switch (format) {
        case 'currency':
            return formatCurrency(value)
        case 'percent':
            return `${(value * 100).toFixed(2)}%`
        case 'number':
        default:
            return value.toLocaleString(undefined, { maximumFractionDigits: 0 })
    }
}

function TrendIndicator({
    delta,
    invertTrend,
}: {
    delta: number | null
    invertTrend?: boolean
}) {
    if (delta === null || Math.abs(delta) < 0.0001) {
        return <Minus className="h-4 w-4 text-muted-foreground" />
    }

    const isPositive = delta > 0
    const isGood = invertTrend ? !isPositive : isPositive

    return isPositive ? (
        <TrendingUp className={cn('h-4 w-4', isGood ? 'text-emerald-500' : 'text-red-500')} />
    ) : (
        <TrendingDown className={cn('h-4 w-4', isGood ? 'text-emerald-500' : 'text-red-500')} />
    )
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

function MetricRow({
    label,
    current,
    previous,
    delta,
    deltaPercent,
    format,
    invertTrend,
}: MetricRowProps) {
    const isPositive = delta !== null && delta > 0
    const isGood = invertTrend ? !isPositive : isPositive

    return (
        <div className="flex items-center justify-between py-3 border-b border-muted/40 last:border-0">
            <span className="text-sm font-medium text-muted-foreground">{label}</span>
            <div className="flex items-center gap-4">
                <div className="text-right">
                    <div className="text-sm text-muted-foreground">Previous</div>
                    <div className="font-medium">{formatValue(previous, format)}</div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <div className="text-right">
                    <div className="text-sm text-muted-foreground">Current</div>
                    <div className="font-semibold">{formatValue(current, format)}</div>
                </div>
                <div className="flex items-center gap-2 min-w-[100px]">
                    <TrendIndicator delta={delta} invertTrend={invertTrend} />
                    {deltaPercent !== null && Math.abs(deltaPercent) >= 0.01 && (
                        <Badge
                            variant="secondary"
                            className={cn(
                                'text-xs',
                                isGood
                                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                                    : 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400'
                            )}
                        >
                            {deltaPercent > 0 ? '+' : ''}
                            {deltaPercent.toFixed(1)}%
                        </Badge>
                    )}
                </div>
            </div>
        </div>
    )
}

function PeriodComparisonView({ comparison }: { comparison: PeriodComparison }) {
    const metrics = [
        {
            label: 'Spend',
            current: comparison.current.spend,
            previous: comparison.previous.spend,
            delta: comparison.delta.spend,
            deltaPercent: comparison.deltaPercent.spend,
            format: 'currency' as const,
            invertTrend: true,
        },
        {
            label: 'Impressions',
            current: comparison.current.impressions,
            previous: comparison.previous.impressions,
            delta: comparison.delta.impressions,
            deltaPercent: comparison.deltaPercent.impressions,
            format: 'number' as const,
        },
        {
            label: 'Clicks',
            current: comparison.current.clicks,
            previous: comparison.previous.clicks,
            delta: comparison.delta.clicks,
            deltaPercent: comparison.deltaPercent.clicks,
            format: 'number' as const,
        },
        {
            label: 'Conversions',
            current: comparison.current.conversions,
            previous: comparison.previous.conversions,
            delta: comparison.delta.conversions,
            deltaPercent: comparison.deltaPercent.conversions,
            format: 'number' as const,
        },
        {
            label: 'Revenue',
            current: comparison.current.revenue,
            previous: comparison.previous.revenue,
            delta: comparison.delta.revenue,
            deltaPercent: comparison.deltaPercent.revenue,
            format: 'currency' as const,
        },
        {
            label: 'CTR',
            current: comparison.current.ctr,
            previous: comparison.previous.ctr,
            delta: comparison.delta.ctr,
            deltaPercent: comparison.deltaPercent.ctr,
            format: 'percent' as const,
        },
        {
            label: 'ROAS',
            current: comparison.current.roas,
            previous: comparison.previous.roas,
            delta: comparison.delta.roas,
            deltaPercent: comparison.deltaPercent.roas,
            format: 'number' as const,
        },
    ]

    return (
        <div className="space-y-1">
            {metrics.map((metric) => (
                <MetricRow key={metric.label} {...metric} />
            ))}
        </div>
    )
}

function ProviderComparisonView({
    providers,
}: {
    providers: ProviderComparison[]
}) {
    if (providers.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-muted/60 p-10 text-center text-sm text-muted-foreground">
                <p>No provider data available for comparison.</p>
            </div>
        )
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {providers.map((provider) => {
                const ProviderIcon = PROVIDER_ICON_MAP[provider.providerId]

                return (
                    <Card key={provider.providerId} className="border-muted/60 bg-background">
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center gap-2 text-base">
                                {ProviderIcon && <ProviderIcon className="h-4 w-4" />}
                                {formatProviderName(provider.providerId)}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="text-2xl font-semibold">
                                {formatCurrency(provider.metrics.spend)}
                            </div>
                            <div className="grid grid-cols-2 gap-3 text-xs">
                                <div>
                                    <div className="font-medium text-muted-foreground">CTR</div>
                                    <div className="text-foreground">
                                        {provider.metrics.ctr !== null
                                            ? `${(provider.metrics.ctr * 100).toFixed(2)}%`
                                            : '—'}
                                    </div>
                                </div>
                                <div>
                                    <div className="font-medium text-muted-foreground">ROAS</div>
                                    <div className="text-foreground">
                                        {provider.metrics.roas !== null
                                            ? provider.metrics.roas.toFixed(2)
                                            : '—'}
                                    </div>
                                </div>
                                <div>
                                    <div className="font-medium text-muted-foreground">CPA</div>
                                    <div className="text-foreground">
                                        {provider.metrics.cpa !== null
                                            ? formatCurrency(provider.metrics.cpa)
                                            : '—'}
                                    </div>
                                </div>
                                <div>
                                    <div className="font-medium text-muted-foreground">Conversions</div>
                                    <div className="text-foreground">
                                        {provider.metrics.conversions.toLocaleString()}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )
            })}
        </div>
    )
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function ComparisonViewCard({
    periodComparison,
    providerComparison,
    loading,
}: ComparisonViewCardProps) {
    return (
        <Card className="shadow-sm">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Layers className="h-5 w-5" />
                    Comparison View
                </CardTitle>
                <CardDescription>
                    Compare performance across periods and platforms
                </CardDescription>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="space-y-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-64 w-full" />
                    </div>
                ) : (
                    <Tabs defaultValue="period" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="period" className="gap-2">
                                <Calendar className="h-4 w-4" />
                                Period
                            </TabsTrigger>
                            <TabsTrigger value="platform" className="gap-2">
                                <Layers className="h-4 w-4" />
                                Platform
                            </TabsTrigger>
                        </TabsList>
                        <TabsContent value="period" className="mt-4">
                            {periodComparison ? (
                                <PeriodComparisonView comparison={periodComparison} />
                            ) : (
                                <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-muted/60 p-10 text-center text-sm text-muted-foreground">
                                    <Calendar className="h-8 w-8 opacity-50" />
                                    <p>
                                        Not enough data for period comparison. Need at least two periods
                                        of data.
                                    </p>
                                </div>
                            )}
                        </TabsContent>
                        <TabsContent value="platform" className="mt-4">
                            <ProviderComparisonView providers={providerComparison} />
                        </TabsContent>
                    </Tabs>
                )}
            </CardContent>
        </Card>
    )
}
