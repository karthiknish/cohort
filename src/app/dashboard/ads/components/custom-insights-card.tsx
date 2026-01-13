'use client'

import { useMemo } from 'react'
import {
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    Zap,
    Target,
    DollarSign,
    MousePointer,
    Eye,
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
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn, formatCurrency } from '@/lib/utils'
import { calculateBenchmarks } from '@/lib/metrics'

import type { DerivedMetrics, GrowthRateResult, CustomKPIs } from '../hooks/use-derived-metrics'
import type { MetricRecord } from './types'

// =============================================================================
// TYPES
// =============================================================================

interface CustomInsightsCardProps {
    derivedMetrics: DerivedMetrics | null
    processedMetrics?: MetricRecord[]
    loading?: boolean
}

interface KpiTileProps {
    label: string
    value: number | null
    format: 'currency' | 'percent' | 'number' | 'ratio'
    icon: React.ReactNode
    trend?: number | null
    benchmark?: number
    invertTrend?: boolean
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function formatValue(value: number | null, format: string): string {
    if (value === null || !isFinite(value)) return '—'

    switch (format) {
        case 'currency':
            return formatCurrency(value)
        case 'percent':
            return `${(value * 100).toFixed(2)}%`
        case 'ratio':
            return value.toFixed(2)
        case 'number':
        default:
            return value.toLocaleString(undefined, { maximumFractionDigits: 2 })
    }
}

function getTrendStatus(trend: number | null | undefined, invertTrend?: boolean): 'up' | 'down' | 'neutral' {
    if (trend === null || trend === undefined || Math.abs(trend) < 0.01) return 'neutral'
    const isPositive = trend > 0
    return invertTrend ? (isPositive ? 'down' : 'up') : (isPositive ? 'up' : 'down')
}

function isAnomaly(value: number | null, benchmark: number | undefined | null, threshold = 0.5): boolean {
    if (value === null || benchmark === undefined || benchmark === null || benchmark === 0) return false
    const deviation = Math.abs((value - benchmark) / benchmark)
    return deviation > threshold
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

function KpiTile({ label, value, format, icon, trend, benchmark, invertTrend }: KpiTileProps) {
    const trendStatus = getTrendStatus(trend ?? null, invertTrend)
    const hasAnomaly = isAnomaly(value, benchmark ?? null)

    return (
        <div
            className={cn(
                'relative flex flex-col gap-2 rounded-lg border p-4 transition-colors',
                hasAnomaly ? 'border-amber-500/50 bg-amber-50/50 dark:bg-amber-950/20' : 'border-muted/60 bg-background'
            )}
        >
            {hasAnomaly && (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div className="absolute right-2 top-2">
                                <AlertTriangle className="h-4 w-4 text-amber-500" />
                            </div>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>This metric deviates significantly from benchmark</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            )}

            <div className="flex items-center gap-2 text-muted-foreground">
                {icon}
                <span className="text-xs font-medium uppercase tracking-wider">{label}</span>
            </div>

            <div className="flex items-end justify-between">
                <span className="text-2xl font-semibold">{formatValue(value, format)}</span>

                {trend !== null && trend !== undefined && Math.abs(trend) >= 0.01 && (
                    <Badge
                        variant="secondary"
                        className={cn(
                            'flex items-center gap-1 text-xs',
                            trendStatus === 'up' && 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400',
                            trendStatus === 'down' && 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400'
                        )}
                    >
                        {trendStatus === 'up' ? (
                            <TrendingUp className="h-3 w-3" />
                        ) : (
                            <TrendingDown className="h-3 w-3" />
                        )}
                        {Math.abs(trend * 100).toFixed(1)}%
                    </Badge>
                )}
            </div>
        </div>
    )
}

function InsightsSkeleton() {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full rounded-lg" />
            ))}
        </div>
    )
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function CustomInsightsCard({ derivedMetrics, processedMetrics, loading }: CustomInsightsCardProps) {
    const computedBenchmarks = useMemo(() => {
        if (!derivedMetrics) return null

        const normalized = Array.isArray(processedMetrics) ? processedMetrics.map((m) => ({
            providerId: m.providerId,
            adId: m.id,
            campaignId: 'unknown',
            date: m.date,
            impressions: m.impressions,
            clicks: m.clicks,
            spend: m.spend,
            conversions: m.conversions,
            revenue: m.revenue ?? 0,
        })) : []

        return calculateBenchmarks(normalized)
    }, [derivedMetrics, processedMetrics])

    const cpaBenchmark = computedBenchmarks?.benchmarks.find((b) => b.metric === 'cpa')?.value ?? 50
    const roasBenchmark = computedBenchmarks?.benchmarks.find((b) => b.metric === 'roas')?.value ?? 3
    const ctrBenchmark = computedBenchmarks?.benchmarks.find((b) => b.metric === 'ctr')?.value ?? 0.02
    const cpcBenchmark = computedBenchmarks?.benchmarks.find((b) => b.metric === 'cpc')?.value ?? 2
    const cpmBenchmark = computedBenchmarks?.benchmarks.find((b) => b.metric === 'cpm')?.value ?? 10
    const conversionRateBenchmark = computedBenchmarks?.benchmarks.find((b) => b.metric === 'conversionRate')?.value ?? 0.03
    const profitMarginBenchmark = computedBenchmarks?.benchmarks.find((b) => b.metric === 'profitMargin')?.value ?? 0.2

    const kpiData = useMemo(() => {
        if (!derivedMetrics) return null

        const { kpis, growthWeekOverWeek } = derivedMetrics

        return [
            {
                label: 'CPA',
                value: kpis.cpa,
                format: 'currency' as const,
                icon: <Target className="h-4 w-4" />,
                trend: null,
                benchmark: cpaBenchmark,
                invertTrend: true, // Lower is better
            },
            {
                label: 'ROAS',
                value: kpis.roas,
                format: 'ratio' as const,
                icon: <Zap className="h-4 w-4" />,
                trend: growthWeekOverWeek.revenue,
                benchmark: roasBenchmark,
            },
            {
                label: 'CTR',
                value: kpis.ctr,
                format: 'percent' as const,
                icon: <MousePointer className="h-4 w-4" />,
                trend: growthWeekOverWeek.clicks,
                benchmark: ctrBenchmark,
            },
            {
                label: 'CPC',
                value: kpis.cpc,
                format: 'currency' as const,
                icon: <DollarSign className="h-4 w-4" />,
                trend: null,
                benchmark: cpcBenchmark,
                invertTrend: true,
            },
            {
                label: 'CPM',
                value: kpis.cpm,
                format: 'currency' as const,
                icon: <Eye className="h-4 w-4" />,
                trend: null,
                benchmark: cpmBenchmark,
                invertTrend: true,
            },
            {
                label: 'Conv. Rate',
                value: kpis.conversionRate,
                format: 'percent' as const,
                icon: <Target className="h-4 w-4" />,
                trend: growthWeekOverWeek.conversions,
                benchmark: conversionRateBenchmark,
            },
            {
                label: 'Profit',
                value: kpis.profit,
                format: 'currency' as const,
                icon: <TrendingUp className="h-4 w-4" />,
                trend: null,
            },
            {
                label: 'Profit Margin',
                value: kpis.profitMargin,
                format: 'percent' as const,
                icon: <Zap className="h-4 w-4" />,
                trend: null,
                benchmark: profitMarginBenchmark,
            },
        ]
    }, [derivedMetrics, cpaBenchmark, roasBenchmark, ctrBenchmark, cpcBenchmark, cpmBenchmark, conversionRateBenchmark, profitMarginBenchmark])

    const anomalyCount = useMemo(() => {
        if (!kpiData) return 0
        return kpiData.filter((kpi) => isAnomaly(kpi.value, kpi.benchmark)).length
    }, [kpiData])

    return (
        <Card className="shadow-sm">
            <CardHeader className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="flex flex-col gap-1">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        Custom Insights
                        {anomalyCount > 0 && (
                            <Badge variant="outline" className="border-amber-500 text-amber-600">
                                <AlertTriangle className="mr-1 h-3 w-3" />
                                {anomalyCount} anomal{anomalyCount === 1 ? 'y' : 'ies'}
                            </Badge>
                        )}
                    </CardTitle>
                    <CardDescription>
                        Real-time calculated metrics and KPIs based on your ad performance
                    </CardDescription>
                </div>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <InsightsSkeleton />
                ) : !derivedMetrics || !kpiData ? (
                    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-muted/60 p-10 text-center text-sm text-muted-foreground">
                        <p>No metrics data available to calculate insights.</p>
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        {kpiData.map((kpi) => (
                            <KpiTile key={kpi.label} {...kpi} />
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
