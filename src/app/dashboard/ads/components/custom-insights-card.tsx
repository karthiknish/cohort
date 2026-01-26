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
    theme?: 'emerald' | 'blue' | 'violet' | 'amber' | 'rose' | 'cyan'
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

const themeStyles = {
    emerald: {
        bg: 'bg-gradient-to-br from-emerald-50/50 to-teal-50/30 dark:from-emerald-950/30 dark:to-teal-950/20',
        border: 'border-emerald-200/60 dark:border-emerald-800/40',
        accent: 'text-emerald-600 dark:text-emerald-400',
        glow: 'shadow-emerald-500/10',
        gradientBorder: 'before:bg-gradient-to-br before:from-emerald-500/20 before:to-teal-500/20',
    },
    blue: {
        bg: 'bg-gradient-to-br from-blue-50/50 to-indigo-50/30 dark:from-blue-950/30 dark:to-indigo-950/20',
        border: 'border-blue-200/60 dark:border-blue-800/40',
        accent: 'text-blue-600 dark:text-blue-400',
        glow: 'shadow-blue-500/10',
        gradientBorder: 'before:bg-gradient-to-br before:from-blue-500/20 before:to-indigo-500/20',
    },
    violet: {
        bg: 'bg-gradient-to-br from-violet-50/50 to-purple-50/30 dark:from-violet-950/30 dark:to-purple-950/20',
        border: 'border-violet-200/60 dark:border-violet-800/40',
        accent: 'text-violet-600 dark:text-violet-400',
        glow: 'shadow-violet-500/10',
        gradientBorder: 'before:bg-gradient-to-br before:from-violet-500/20 before:to-purple-500/20',
    },
    amber: {
        bg: 'bg-gradient-to-br from-amber-50/50 to-orange-50/30 dark:from-amber-950/30 dark:to-orange-950/20',
        border: 'border-amber-200/60 dark:border-amber-800/40',
        accent: 'text-amber-600 dark:text-amber-400',
        glow: 'shadow-amber-500/10',
        gradientBorder: 'before:bg-gradient-to-br before:from-amber-500/20 before:to-orange-500/20',
    },
    rose: {
        bg: 'bg-gradient-to-br from-rose-50/50 to-pink-50/30 dark:from-rose-950/30 dark:to-pink-950/20',
        border: 'border-rose-200/60 dark:border-rose-800/40',
        accent: 'text-rose-600 dark:text-rose-400',
        glow: 'shadow-rose-500/10',
        gradientBorder: 'before:bg-gradient-to-br before:from-rose-500/20 before:to-pink-500/20',
    },
    cyan: {
        bg: 'bg-gradient-to-br from-cyan-50/50 to-sky-50/30 dark:from-cyan-950/30 dark:to-sky-950/20',
        border: 'border-cyan-200/60 dark:border-cyan-800/40',
        accent: 'text-cyan-600 dark:text-cyan-400',
        glow: 'shadow-cyan-500/10',
        gradientBorder: 'before:bg-gradient-to-br before:from-cyan-500/20 before:to-sky-500/20',
    },
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

function KpiTile({ label, value, format, icon, trend, benchmark, invertTrend, theme = 'blue' }: KpiTileProps) {
    const trendStatus = getTrendStatus(trend ?? null, invertTrend)
    const hasAnomaly = isAnomaly(value, benchmark ?? null)
    const styles = themeStyles[theme]

    return (
        <div
            className={cn(
                'group relative flex flex-col gap-3 rounded-xl border p-5 overflow-hidden',
                'transition-all duration-300 ease-out',
                'hover:shadow-xl hover:shadow-black/5 hover:scale-[1.02] hover:-translate-y-0.5',
                styles.bg, styles.border, styles.glow,
                hasAnomaly && 'ring-2 ring-amber-500/50 ring-offset-2 ring-offset-background'
            )}
        >
            {/* Subtle inner glow on hover */}
            <div className={cn(
                'absolute inset-0 rounded-xl opacity-0 transition-opacity duration-500',
                'group-hover:opacity-100 bg-gradient-to-tr from-white/60 to-transparent dark:from-white/10'
            )} />

            {hasAnomaly && (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div className="absolute right-3 top-3 z-10">
                                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/50 animate-pulse">
                                    <AlertTriangle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                                </div>
                            </div>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>This metric deviates significantly from benchmark</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            )}

            <div className="relative z-10 flex items-center gap-2.5">
                <div className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-xl',
                    'bg-gradient-to-br shadow-md transition-transform duration-300',
                    'group-hover:scale-110 group-hover:shadow-lg',
                    theme === 'emerald' && 'from-emerald-100 to-teal-100 dark:from-emerald-900/50 dark:to-teal-900/50',
                    theme === 'blue' && 'from-blue-100 to-indigo-100 dark:from-blue-900/50 dark:to-indigo-900/50',
                    theme === 'violet' && 'from-violet-100 to-purple-100 dark:from-violet-900/50 dark:to-purple-900/50',
                    theme === 'amber' && 'from-amber-100 to-orange-100 dark:from-amber-900/50 dark:to-orange-900/50',
                    theme === 'rose' && 'from-rose-100 to-pink-100 dark:from-rose-900/50 dark:to-pink-900/50',
                    theme === 'cyan' && 'from-cyan-100 to-sky-100 dark:from-cyan-900/50 dark:to-sky-900/50',
                )}>
                    <div className={cn(styles.accent)}>
                        {icon}
                    </div>
                </div>
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">{label}</span>
            </div>

            <div className="relative z-10 flex items-end justify-between gap-2">
                <div className="flex flex-col">
                    <span className="text-3xl font-bold tracking-tight tabular-nums">{formatValue(value, format)}</span>
                    <span className="mt-1 text-xs text-muted-foreground/60">
                        {format === 'currency' && 'Cost per acquisition'}
                        {format === 'percent' && 'Rate percentage'}
                        {format === 'ratio' && 'Return multiplier'}
                    </span>
                </div>

                {trend !== null && trend !== undefined && Math.abs(trend) >= 0.01 && (
                    <Badge
                        variant="secondary"
                        className={cn(
                            'flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full',
                            'transition-all duration-200',
                            'group-hover:scale-110',
                            trendStatus === 'up' && 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/50',
                            trendStatus === 'down' && 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400 border border-rose-200/50 dark:border-rose-800/50'
                        )}
                    >
                        {trendStatus === 'up' ? (
                            <TrendingUp className="h-3.5 w-3.5" />
                        ) : (
                            <TrendingDown className="h-3.5 w-3.5" />
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
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-32 w-full rounded-xl" />
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
                theme: 'rose' as const,
            },
            {
                label: 'ROAS',
                value: kpis.roas,
                format: 'ratio' as const,
                icon: <Zap className="h-4 w-4" />,
                trend: growthWeekOverWeek.revenue,
                benchmark: roasBenchmark,
                theme: 'emerald' as const,
            },
            {
                label: 'CTR',
                value: kpis.ctr,
                format: 'percent' as const,
                icon: <MousePointer className="h-4 w-4" />,
                trend: growthWeekOverWeek.clicks,
                benchmark: ctrBenchmark,
                theme: 'violet' as const,
            },
            {
                label: 'CPC',
                value: kpis.cpc,
                format: 'currency' as const,
                icon: <DollarSign className="h-4 w-4" />,
                trend: null,
                benchmark: cpcBenchmark,
                invertTrend: true,
                theme: 'amber' as const,
            },
            {
                label: 'CPM',
                value: kpis.cpm,
                format: 'currency' as const,
                icon: <Eye className="h-4 w-4" />,
                trend: null,
                benchmark: cpmBenchmark,
                invertTrend: true,
                theme: 'cyan' as const,
            },
            {
                label: 'Conv. Rate',
                value: kpis.conversionRate,
                format: 'percent' as const,
                icon: <Target className="h-4 w-4" />,
                trend: growthWeekOverWeek.conversions,
                benchmark: conversionRateBenchmark,
                theme: 'blue' as const,
            },
            {
                label: 'Profit',
                value: kpis.profit,
                format: 'currency' as const,
                icon: <TrendingUp className="h-4 w-4" />,
                trend: null,
                theme: 'emerald' as const,
            },
            {
                label: 'Profit Margin',
                value: kpis.profitMargin,
                format: 'percent' as const,
                icon: <Zap className="h-4 w-4" />,
                trend: null,
                benchmark: profitMarginBenchmark,
                theme: 'violet' as const,
            },
        ]
    }, [derivedMetrics, cpaBenchmark, roasBenchmark, ctrBenchmark, cpcBenchmark, cpmBenchmark, conversionRateBenchmark, profitMarginBenchmark])

    const anomalyCount = useMemo(() => {
        if (!kpiData) return 0
        return kpiData.filter((kpi) => isAnomaly(kpi.value, kpi.benchmark)).length
    }, [kpiData])

    return (
        <Card className="shadow-lg border-muted/80 overflow-hidden">
            {/* Subtle gradient accent at top */}
            <div className="h-1 bg-gradient-to-r from-emerald-500 via-blue-500 to-violet-500" />

            <CardHeader className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between pb-4">
                <div className="flex flex-col gap-2">
                    <CardTitle className="flex items-center gap-3 text-xl">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/10 to-blue-500/10">
                            <Zap className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                        </div>
                        Custom Insights
                        {anomalyCount > 0 && (
                            <Badge className="ml-2 border-amber-500/50 bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400">
                                <AlertTriangle className="mr-1.5 h-3.5 w-3.5" />
                                {anomalyCount} anomal{anomalyCount === 1 ? 'y' : 'ies'}
                            </Badge>
                        )}
                    </CardTitle>
                    <CardDescription className="text-sm">
                        Real-time calculated metrics and KPIs based on your ad performance
                    </CardDescription>
                </div>
            </CardHeader>
            <CardContent className="pt-2">
                {loading ? (
                    <InsightsSkeleton />
                ) : !derivedMetrics || !kpiData ? (
                    <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-muted/60 bg-muted/20 p-12 text-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                            <Zap className="h-6 w-6 text-muted-foreground/50" />
                        </div>
                        <p className="text-sm text-muted-foreground">No metrics data available to calculate insights.</p>
                    </div>
                ) : (
                    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
                        {kpiData.map((kpi, index) => (
                            <div
                                key={kpi.label}
                                className="animate-in fade-in slide-in-from-bottom-2"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <KpiTile {...kpi} />
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
