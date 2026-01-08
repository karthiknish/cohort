'use client'

import { useMemo } from 'react'

import type { MetricRecord } from '../components/types'
import type { DateRange } from '../components/date-range-picker'

// =============================================================================
// TYPES
// =============================================================================

export interface ComparisonMetrics {
    spend: number
    impressions: number
    clicks: number
    conversions: number
    revenue: number
    ctr: number | null
    cpc: number | null
    roas: number | null
    cpa: number | null
}

export interface MetricsDelta {
    spend: number | null
    impressions: number | null
    clicks: number | null
    conversions: number | null
    revenue: number | null
    ctr: number | null
    cpc: number | null
    roas: number | null
    cpa: number | null
}

export interface PeriodComparison {
    current: ComparisonMetrics
    previous: ComparisonMetrics
    delta: MetricsDelta
    deltaPercent: MetricsDelta
}

export interface ProviderComparison {
    providerId: string
    metrics: ComparisonMetrics
}

export interface UseMetricsComparisonOptions {
    /** All metrics from useAdsMetrics */
    metrics: MetricRecord[]
    /** Current date range */
    dateRange: DateRange
}

export interface UseMetricsComparisonReturn {
    /** Compare current period with previous period of same length */
    periodComparison: PeriodComparison | null

    /** Compare metrics across providers */
    providerComparison: ProviderComparison[]

    /** Get comparison for a specific provider */
    getProviderMetrics: (providerId: string) => ComparisonMetrics | null

    /** Compare two custom date ranges */
    compareDateRanges: (range1: DateRange, range2: DateRange) => {
        range1: ComparisonMetrics
        range2: ComparisonMetrics
        delta: MetricsDelta
        deltaPercent: MetricsDelta
    } | null

    /** Compare two providers */
    compareProviders: (provider1: string, provider2: string) => {
        provider1: ComparisonMetrics
        provider2: ComparisonMetrics
        delta: MetricsDelta
    } | null
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function safeDiv(numerator: number, denominator: number): number | null {
    if (denominator === 0 || !isFinite(denominator)) return null
    const result = numerator / denominator
    return isFinite(result) ? result : null
}

function calculateDelta(current: number, previous: number): number | null {
    return current - previous
}

function calculateDeltaPercent(current: number, previous: number): number | null {
    if (previous === 0) return null
    return ((current - previous) / previous) * 100
}

function filterMetricsByDateRange(
    metrics: MetricRecord[],
    range: DateRange
): MetricRecord[] {
    return metrics.filter((m) => {
        const date = new Date(m.date)
        return date >= range.start && date <= range.end
    })
}

function aggregateMetrics(metrics: MetricRecord[]): ComparisonMetrics {
    const totals = metrics.reduce(
        (acc, m) => ({
            spend: acc.spend + m.spend,
            impressions: acc.impressions + m.impressions,
            clicks: acc.clicks + m.clicks,
            conversions: acc.conversions + m.conversions,
            revenue: acc.revenue + (m.revenue ?? 0),
        }),
        { spend: 0, impressions: 0, clicks: 0, conversions: 0, revenue: 0 }
    )

    return {
        ...totals,
        ctr: safeDiv(totals.clicks, totals.impressions),
        cpc: safeDiv(totals.spend, totals.clicks),
        roas: safeDiv(totals.revenue, totals.spend),
        cpa: safeDiv(totals.spend, totals.conversions),
    }
}

function calculateMetricsDelta(
    current: ComparisonMetrics,
    previous: ComparisonMetrics
): MetricsDelta {
    return {
        spend: calculateDelta(current.spend, previous.spend),
        impressions: calculateDelta(current.impressions, previous.impressions),
        clicks: calculateDelta(current.clicks, previous.clicks),
        conversions: calculateDelta(current.conversions, previous.conversions),
        revenue: calculateDelta(current.revenue, previous.revenue),
        ctr: current.ctr !== null && previous.ctr !== null
            ? calculateDelta(current.ctr, previous.ctr)
            : null,
        cpc: current.cpc !== null && previous.cpc !== null
            ? calculateDelta(current.cpc, previous.cpc)
            : null,
        roas: current.roas !== null && previous.roas !== null
            ? calculateDelta(current.roas, previous.roas)
            : null,
        cpa: current.cpa !== null && previous.cpa !== null
            ? calculateDelta(current.cpa, previous.cpa)
            : null,
    }
}

function calculateMetricsDeltaPercent(
    current: ComparisonMetrics,
    previous: ComparisonMetrics
): MetricsDelta {
    return {
        spend: calculateDeltaPercent(current.spend, previous.spend),
        impressions: calculateDeltaPercent(current.impressions, previous.impressions),
        clicks: calculateDeltaPercent(current.clicks, previous.clicks),
        conversions: calculateDeltaPercent(current.conversions, previous.conversions),
        revenue: calculateDeltaPercent(current.revenue, previous.revenue),
        ctr: current.ctr !== null && previous.ctr !== null
            ? calculateDeltaPercent(current.ctr, previous.ctr)
            : null,
        cpc: current.cpc !== null && previous.cpc !== null
            ? calculateDeltaPercent(current.cpc, previous.cpc)
            : null,
        roas: current.roas !== null && previous.roas !== null
            ? calculateDeltaPercent(current.roas, previous.roas)
            : null,
        cpa: current.cpa !== null && previous.cpa !== null
            ? calculateDeltaPercent(current.cpa, previous.cpa)
            : null,
    }
}

function getPreviousDateRange(range: DateRange): DateRange {
    const duration = range.end.getTime() - range.start.getTime()
    return {
        start: new Date(range.start.getTime() - duration - 86400000), // -1 day buffer
        end: new Date(range.start.getTime() - 86400000),
    }
}

// =============================================================================
// HOOK
// =============================================================================

/**
 * Hook for comparing metrics across periods and providers
 */
export function useMetricsComparison(
    options: UseMetricsComparisonOptions
): UseMetricsComparisonReturn {
    const { metrics, dateRange } = options

    // Period comparison (current vs previous period)
    const periodComparison = useMemo((): PeriodComparison | null => {
        const currentMetrics = filterMetricsByDateRange(metrics, dateRange)
        const previousRange = getPreviousDateRange(dateRange)
        const previousMetrics = filterMetricsByDateRange(metrics, previousRange)

        if (currentMetrics.length === 0) return null

        const current = aggregateMetrics(currentMetrics)
        const previous = aggregateMetrics(previousMetrics)
        const delta = calculateMetricsDelta(current, previous)
        const deltaPercent = calculateMetricsDeltaPercent(current, previous)

        return { current, previous, delta, deltaPercent }
    }, [metrics, dateRange])

    // Provider comparison (memoized)
    const providerComparison = useMemo((): ProviderComparison[] => {
        const currentMetrics = filterMetricsByDateRange(metrics, dateRange)
        const byProvider = new Map<string, MetricRecord[]>()

        currentMetrics.forEach((m) => {
            const existing = byProvider.get(m.providerId) ?? []
            existing.push(m)
            byProvider.set(m.providerId, existing)
        })

        return Array.from(byProvider.entries()).map(([providerId, provMetrics]) => ({
            providerId,
            metrics: aggregateMetrics(provMetrics),
        }))
    }, [metrics, dateRange])

    // Get metrics for a specific provider
    const getProviderMetrics = useMemo(() => {
        return (providerId: string): ComparisonMetrics | null => {
            const provider = providerComparison.find((p) => p.providerId === providerId)
            return provider?.metrics ?? null
        }
    }, [providerComparison])

    // Compare two custom date ranges
    const compareDateRanges = useMemo(() => {
        return (range1: DateRange, range2: DateRange) => {
            const metrics1 = filterMetricsByDateRange(metrics, range1)
            const metrics2 = filterMetricsByDateRange(metrics, range2)

            if (metrics1.length === 0 && metrics2.length === 0) return null

            const agg1 = aggregateMetrics(metrics1)
            const agg2 = aggregateMetrics(metrics2)

            return {
                range1: agg1,
                range2: agg2,
                delta: calculateMetricsDelta(agg1, agg2),
                deltaPercent: calculateMetricsDeltaPercent(agg1, agg2),
            }
        }
    }, [metrics])

    // Compare two providers
    const compareProviders = useMemo(() => {
        return (provider1: string, provider2: string) => {
            const m1 = providerComparison.find((p) => p.providerId === provider1)?.metrics
            const m2 = providerComparison.find((p) => p.providerId === provider2)?.metrics

            if (!m1 || !m2) return null

            return {
                provider1: m1,
                provider2: m2,
                delta: calculateMetricsDelta(m1, m2),
            }
        }
    }, [providerComparison])

    return {
        periodComparison,
        providerComparison,
        getProviderMetrics,
        compareDateRanges,
        compareProviders,
    }
}
