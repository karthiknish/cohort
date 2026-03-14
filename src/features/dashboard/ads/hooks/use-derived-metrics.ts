'use client'

import { useMemo } from 'react'

import type { MetricRecord } from '../components/types'

// =============================================================================
// TYPES
// =============================================================================

export interface DerivedMetrics {
    // Moving Averages
    movingAverage7Day: MovingAverageResult
    movingAverage30Day: MovingAverageResult

    // Growth Rates
    growthWeekOverWeek: GrowthRateResult
    growthMonthOverMonth: GrowthRateResult

    // Custom KPIs
    kpis: CustomKPIs

    // Totals
    totals: MetricTotals
}

export interface MovingAverageResult {
    spend: number | null
    impressions: number | null
    clicks: number | null
    conversions: number | null
    revenue: number | null
    ctr: number | null
    cpc: number | null
    roas: number | null
}

export interface GrowthRateResult {
    spend: number | null
    impressions: number | null
    clicks: number | null
    conversions: number | null
    revenue: number | null
}

export interface CustomKPIs {
    /** Cost per acquisition */
    cpa: number | null
    /** Return on ad spend */
    roas: number | null
    /** Click-through rate */
    ctr: number | null
    /** Cost per click */
    cpc: number | null
    /** Cost per mille (1000 impressions) */
    cpm: number | null
    /** Conversion rate */
    conversionRate: number | null
    /** Revenue per click */
    revenuePerClick: number | null
    /** Profit (revenue - spend) */
    profit: number | null
    /** Profit margin */
    profitMargin: number | null
}

export interface MetricTotals {
    spend: number
    impressions: number
    clicks: number
    conversions: number
    revenue: number
    days: number
}

export interface UseDerivedMetricsOptions {
    /** Processed metrics from useAdsMetrics */
    metrics: MetricRecord[]
    /** Optional provider filter */
    providerId?: string
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function safeDiv(numerator: number, denominator: number): number | null {
    if (denominator === 0 || !isFinite(denominator)) return null
    const result = numerator / denominator
    return isFinite(result) ? result : null
}

function calculateTotals(metrics: MetricRecord[]): MetricTotals {
    return metrics.reduce(
        (acc, m) => ({
            spend: acc.spend + m.spend,
            impressions: acc.impressions + m.impressions,
            clicks: acc.clicks + m.clicks,
            conversions: acc.conversions + m.conversions,
            revenue: acc.revenue + (m.revenue ?? 0),
            days: acc.days + 1,
        }),
        { spend: 0, impressions: 0, clicks: 0, conversions: 0, revenue: 0, days: 0 }
    )
}

function calculateMovingAverage(
    metrics: MetricRecord[],
    days: number
): MovingAverageResult {
    // Sort by date descending and take last N days
    const sorted = [...metrics].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )
    const subset = sorted.slice(0, days)

    if (subset.length === 0) {
        return {
            spend: null,
            impressions: null,
            clicks: null,
            conversions: null,
            revenue: null,
            ctr: null,
            cpc: null,
            roas: null,
        }
    }

    const totals = calculateTotals(subset)
    const count = subset.length

    return {
        spend: totals.spend / count,
        impressions: totals.impressions / count,
        clicks: totals.clicks / count,
        conversions: totals.conversions / count,
        revenue: totals.revenue / count,
        ctr: safeDiv(totals.clicks, totals.impressions),
        cpc: safeDiv(totals.spend, totals.clicks),
        roas: safeDiv(totals.revenue, totals.spend),
    }
}

function calculateGrowthRate(
    current: MetricTotals,
    previous: MetricTotals
): GrowthRateResult {
    return {
        spend: safeDiv(current.spend - previous.spend, previous.spend),
        impressions: safeDiv(current.impressions - previous.impressions, previous.impressions),
        clicks: safeDiv(current.clicks - previous.clicks, previous.clicks),
        conversions: safeDiv(current.conversions - previous.conversions, previous.conversions),
        revenue: safeDiv(current.revenue - previous.revenue, previous.revenue),
    }
}

function splitMetricsByPeriod(
    metrics: MetricRecord[],
    daysPerPeriod: number
): { current: MetricRecord[]; previous: MetricRecord[] } {
    const sorted = [...metrics].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )

    const current = sorted.slice(0, daysPerPeriod)
    const previous = sorted.slice(daysPerPeriod, daysPerPeriod * 2)

    return { current, previous }
}

function calculateKPIs(totals: MetricTotals): CustomKPIs {
    return {
        cpa: safeDiv(totals.spend, totals.conversions),
        roas: safeDiv(totals.revenue, totals.spend),
        ctr: safeDiv(totals.clicks, totals.impressions),
        cpc: safeDiv(totals.spend, totals.clicks),
        cpm: safeDiv(totals.spend * 1000, totals.impressions),
        conversionRate: safeDiv(totals.conversions, totals.clicks),
        revenuePerClick: safeDiv(totals.revenue, totals.clicks),
        profit: totals.revenue - totals.spend,
        profitMargin: safeDiv(totals.revenue - totals.spend, totals.revenue),
    }
}

// =============================================================================
// HOOK
// =============================================================================

/**
 * Hook for real-time derived metric calculations
 * Uses memoization for performance with expensive calculations
 */
export function useDerivedMetrics(options: UseDerivedMetricsOptions): DerivedMetrics {
    const { metrics, providerId } = options

    // Filter by provider if specified
    const filteredMetrics = useMemo(() => {
        if (!providerId) return metrics
        return metrics.filter((m) => m.providerId === providerId)
    }, [metrics, providerId])

    // Calculate totals (memoized)
    const totals = useMemo(() => calculateTotals(filteredMetrics), [filteredMetrics])

    // Calculate 7-day moving average (memoized)
    const movingAverage7Day = useMemo(
        () => calculateMovingAverage(filteredMetrics, 7),
        [filteredMetrics]
    )

    // Calculate 30-day moving average (memoized)
    const movingAverage30Day = useMemo(
        () => calculateMovingAverage(filteredMetrics, 30),
        [filteredMetrics]
    )

    // Calculate week-over-week growth (memoized)
    const growthWeekOverWeek = useMemo(() => {
        const { current, previous } = splitMetricsByPeriod(filteredMetrics, 7)
        if (previous.length === 0) {
            return { spend: null, impressions: null, clicks: null, conversions: null, revenue: null }
        }
        return calculateGrowthRate(calculateTotals(current), calculateTotals(previous))
    }, [filteredMetrics])

    // Calculate month-over-month growth (memoized)
    const growthMonthOverMonth = useMemo(() => {
        const { current, previous } = splitMetricsByPeriod(filteredMetrics, 30)
        if (previous.length === 0) {
            return { spend: null, impressions: null, clicks: null, conversions: null, revenue: null }
        }
        return calculateGrowthRate(calculateTotals(current), calculateTotals(previous))
    }, [filteredMetrics])

    // Calculate custom KPIs (memoized)
    const kpis = useMemo(() => calculateKPIs(totals), [totals])

    return {
        movingAverage7Day,
        movingAverage30Day,
        growthWeekOverWeek,
        growthMonthOverMonth,
        kpis,
        totals,
    }
}
