'use client'

import { useMemo } from 'react'
import {
  DollarSign,
  Eye,
  MousePointer,
  Target,
  TrendingUp,
  Zap,
} from 'lucide-react'

import { Card } from '@/components/ui/card'
import { calculateBenchmarks } from '@/lib/metrics'

import {
    CustomInsightsCardHeader,
    CustomInsightsEmptyState,
    CustomInsightsGrid,
    CustomInsightsLoadingState,
    type KpiTileData,
} from './custom-insights-card-sections'

import type { DerivedMetrics } from '../hooks/use-derived-metrics'
import type { MetricRecord } from './types'

// =============================================================================
// TYPES
// =============================================================================

interface CustomInsightsCardProps {
  derivedMetrics: DerivedMetrics | null
  processedMetrics?: MetricRecord[]
  currency?: string
  loading?: boolean
}

function isAnomaly(value: number | null, benchmark: number | undefined | null, threshold = 0.5): boolean {
  if (value === null || benchmark === undefined || benchmark === null || benchmark === 0) return false
  const deviation = Math.abs((value - benchmark) / benchmark)
  return deviation > threshold
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function CustomInsightsCard({ derivedMetrics, processedMetrics, currency = 'USD', loading }: CustomInsightsCardProps) {
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

    const kpiData = useMemo<KpiTileData[] | null>(() => {
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
                theme: 'violet' as const,
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
        <Card className="overflow-hidden border-muted/60 shadow-sm">
            <CustomInsightsCardHeader anomalyCount={anomalyCount} />
            {loading ? <CustomInsightsLoadingState /> : !derivedMetrics || !kpiData ? <CustomInsightsEmptyState /> : <CustomInsightsGrid currency={currency} items={kpiData} />}
        </Card>
    )
}
