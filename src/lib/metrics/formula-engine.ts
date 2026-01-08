// =============================================================================
// FORMULA ENGINE - Custom Metrics Calculators
// =============================================================================

import type {
    NormalizedAdMetric,
    MetricField,
    MovingAverageResult,
    GrowthRateResult,
    BenchmarkResult,
    KpiConfig,
    CustomKpiResult,
} from './types'

// =============================================================================
// WEIGHTED AVERAGES
// =============================================================================

/**
 * Calculates spend-weighted ROAS across all metrics.
 * Platforms with higher spend have more influence on the result.
 */
export function calculateWeightedRoas(metrics: NormalizedAdMetric[]): number {
    const totalSpend = metrics.reduce((sum, m) => sum + m.spend, 0)
    if (totalSpend === 0) return 0

    const totalRevenue = metrics.reduce((sum, m) => sum + m.revenue, 0)
    return totalRevenue / totalSpend
}

/**
 * Calculates spend-weighted average for any numeric metric field.
 */
export function calculateWeightedAverage(
    metrics: NormalizedAdMetric[],
    field: MetricField
): number {
    const totalSpend = metrics.reduce((sum, m) => sum + m.spend, 0)
    if (totalSpend === 0) return 0

    const weightedSum = metrics.reduce((sum, m) => {
        const value = m[field] ?? 0
        return sum + value * m.spend
    }, 0)

    return weightedSum / totalSpend
}

// =============================================================================
// MOVING AVERAGES
// =============================================================================

/**
 * Groups metrics by date and sums the values for a given field.
 */
function groupByDate(
    metrics: NormalizedAdMetric[],
    field: MetricField
): Map<string, number> {
    const grouped = new Map<string, number>()

    for (const m of metrics) {
        const existing = grouped.get(m.date) || 0
        const value = m[field] ?? 0
        grouped.set(m.date, existing + value)
    }

    return grouped
}

/**
 * Calculates simple moving average for a given field over a window of days.
 * @param metrics - Normalized ad metrics
 * @param field - The metric field to calculate moving average for
 * @param windowDays - Number of days in the moving average window (7 or 30)
 * @returns Array of moving average results per date
 */
export function calculateMovingAverage(
    metrics: NormalizedAdMetric[],
    field: MetricField,
    windowDays: number
): MovingAverageResult[] {
    if (metrics.length === 0) return []

    // Group by date and sum values
    const dailyValues = groupByDate(metrics, field)

    // Sort dates chronologically
    const sortedDates = Array.from(dailyValues.keys()).sort()

    if (sortedDates.length === 0) return []

    const results: MovingAverageResult[] = []

    for (let i = 0; i < sortedDates.length; i++) {
        const currentDate = sortedDates[i]
        const rawValue = dailyValues.get(currentDate) || 0

        // Get the window of values (current day and previous windowDays-1 days)
        const windowStart = Math.max(0, i - windowDays + 1)
        const windowValues = sortedDates
            .slice(windowStart, i + 1)
            .map((d) => dailyValues.get(d) || 0)

        // Calculate average
        const sum = windowValues.reduce((a, b) => a + b, 0)
        const avg = windowValues.length > 0 ? sum / windowValues.length : 0

        results.push({
            date: currentDate,
            value: avg,
            rawValue,
        })
    }

    return results
}

/**
 * Calculates moving average for ROAS specifically (requires revenue/spend ratio).
 */
export function calculateRoasMovingAverage(
    metrics: NormalizedAdMetric[],
    windowDays: number
): MovingAverageResult[] {
    if (metrics.length === 0) return []

    // Group revenue and spend by date
    const dailyRevenue = groupByDate(metrics, 'revenue')
    const dailySpend = groupByDate(metrics, 'spend')

    // Sort dates chronologically
    const sortedDates = Array.from(
        new Set([...dailyRevenue.keys(), ...dailySpend.keys()])
    ).sort()

    if (sortedDates.length === 0) return []

    const results: MovingAverageResult[] = []

    for (let i = 0; i < sortedDates.length; i++) {
        const currentDate = sortedDates[i]
        const currentSpend = dailySpend.get(currentDate) || 0
        const currentRevenue = dailyRevenue.get(currentDate) || 0
        const rawRoas = currentSpend > 0 ? currentRevenue / currentSpend : 0

        // Get the window values
        const windowStart = Math.max(0, i - windowDays + 1)
        const windowDates = sortedDates.slice(windowStart, i + 1)

        // Sum revenue and spend in window, then calculate ROAS
        const windowRevenue = windowDates.reduce(
            (sum, d) => sum + (dailyRevenue.get(d) || 0),
            0
        )
        const windowSpend = windowDates.reduce(
            (sum, d) => sum + (dailySpend.get(d) || 0),
            0
        )

        const maRoas = windowSpend > 0 ? windowRevenue / windowSpend : 0

        results.push({
            date: currentDate,
            value: maRoas,
            rawValue: rawRoas,
        })
    }

    return results
}

// =============================================================================
// GROWTH RATES
// =============================================================================

/**
 * Calculates the sum of a field within a date range.
 */
function sumInDateRange(
    metrics: NormalizedAdMetric[],
    field: MetricField,
    startDate: Date,
    endDate: Date
): number {
    return metrics
        .filter((m) => {
            const d = new Date(m.date)
            return d >= startDate && d <= endDate
        })
        .reduce((sum, m) => sum + (m[field] ?? 0), 0)
}

/**
 * Calculates percentage change between two values.
 * Returns null if the previous value is 0.
 */
function calculatePercentageChange(
    current: number,
    previous: number
): number | null {
    if (previous === 0) return current > 0 ? 100 : null
    return ((current - previous) / previous) * 100
}

/**
 * Calculates week-over-week and month-over-month growth rates.
 * Uses the most recent complete periods for comparison.
 */
export function calculateGrowthRates(
    metrics: NormalizedAdMetric[]
): GrowthRateResult {
    if (metrics.length === 0) {
        return {
            weekOverWeek: { spend: null, conversions: null, revenue: null, roas: null },
            monthOverMonth: { spend: null, conversions: null, revenue: null, roas: null },
        }
    }

    // Find date range
    const dates = metrics.map((m) => new Date(m.date))
    const maxDate = new Date(Math.max(...dates.map((d) => d.getTime())))
    const minDate = new Date(Math.min(...dates.map((d) => d.getTime())))

    // Calculate WoW: compare last 7 days vs previous 7 days
    const thisWeekEnd = maxDate
    const thisWeekStart = new Date(maxDate)
    thisWeekStart.setDate(thisWeekStart.getDate() - 6)

    const lastWeekEnd = new Date(thisWeekStart)
    lastWeekEnd.setDate(lastWeekEnd.getDate() - 1)
    const lastWeekStart = new Date(lastWeekEnd)
    lastWeekStart.setDate(lastWeekStart.getDate() - 6)

    // Calculate MoM: compare last 30 days vs previous 30 days
    const thisMonthEnd = maxDate
    const thisMonthStart = new Date(maxDate)
    thisMonthStart.setDate(thisMonthStart.getDate() - 29)

    const lastMonthEnd = new Date(thisMonthStart)
    lastMonthEnd.setDate(lastMonthEnd.getDate() - 1)
    const lastMonthStart = new Date(lastMonthEnd)
    lastMonthStart.setDate(lastMonthStart.getDate() - 29)

    // WoW calculations
    const thisWeekSpend = sumInDateRange(metrics, 'spend', thisWeekStart, thisWeekEnd)
    const lastWeekSpend = sumInDateRange(metrics, 'spend', lastWeekStart, lastWeekEnd)
    const thisWeekConversions = sumInDateRange(metrics, 'conversions', thisWeekStart, thisWeekEnd)
    const lastWeekConversions = sumInDateRange(metrics, 'conversions', lastWeekStart, lastWeekEnd)
    const thisWeekRevenue = sumInDateRange(metrics, 'revenue', thisWeekStart, thisWeekEnd)
    const lastWeekRevenue = sumInDateRange(metrics, 'revenue', lastWeekStart, lastWeekEnd)

    const thisWeekRoas = thisWeekSpend > 0 ? thisWeekRevenue / thisWeekSpend : 0
    const lastWeekRoas = lastWeekSpend > 0 ? lastWeekRevenue / lastWeekSpend : 0

    // MoM calculations
    const thisMonthSpend = sumInDateRange(metrics, 'spend', thisMonthStart, thisMonthEnd)
    const lastMonthSpend = sumInDateRange(metrics, 'spend', lastMonthStart, lastMonthEnd)
    const thisMonthConversions = sumInDateRange(metrics, 'conversions', thisMonthStart, thisMonthEnd)
    const lastMonthConversions = sumInDateRange(metrics, 'conversions', lastMonthStart, lastMonthEnd)
    const thisMonthRevenue = sumInDateRange(metrics, 'revenue', thisMonthStart, thisMonthEnd)
    const lastMonthRevenue = sumInDateRange(metrics, 'revenue', lastMonthStart, lastMonthEnd)

    const thisMonthRoas = thisMonthSpend > 0 ? thisMonthRevenue / thisMonthSpend : 0
    const lastMonthRoas = lastMonthSpend > 0 ? lastMonthRevenue / lastMonthSpend : 0

    return {
        weekOverWeek: {
            spend: calculatePercentageChange(thisWeekSpend, lastWeekSpend),
            conversions: calculatePercentageChange(thisWeekConversions, lastWeekConversions),
            revenue: calculatePercentageChange(thisWeekRevenue, lastWeekRevenue),
            roas: calculatePercentageChange(thisWeekRoas, lastWeekRoas),
        },
        monthOverMonth: {
            spend: calculatePercentageChange(thisMonthSpend, lastMonthSpend),
            conversions: calculatePercentageChange(thisMonthConversions, lastMonthConversions),
            revenue: calculatePercentageChange(thisMonthRevenue, lastMonthRevenue),
            roas: calculatePercentageChange(thisMonthRoas, lastMonthRoas),
        },
    }
}

// =============================================================================
// CROSS-PLATFORM BENCHMARKS
// =============================================================================

/**
 * Calculates platform-level benchmarks and compares to blended average.
 */
export function calculateCrossplatformBenchmarks(
    metrics: NormalizedAdMetric[]
): BenchmarkResult[] {
    if (metrics.length === 0) return []

    // Group metrics by provider
    const byProvider = new Map<string, NormalizedAdMetric[]>()
    for (const m of metrics) {
        const existing = byProvider.get(m.providerId) || []
        existing.push(m)
        byProvider.set(m.providerId, existing)
    }

    // Calculate blended averages across all providers
    const totalSpend = metrics.reduce((sum, m) => sum + m.spend, 0)
    const totalRevenue = metrics.reduce((sum, m) => sum + m.revenue, 0)
    const totalConversions = metrics.reduce((sum, m) => sum + m.conversions, 0)
    const totalClicks = metrics.reduce((sum, m) => sum + m.clicks, 0)
    const totalImpressions = metrics.reduce((sum, m) => sum + m.impressions, 0)

    const blendedRoas = totalSpend > 0 ? totalRevenue / totalSpend : 0
    const blendedCpa = totalConversions > 0 ? totalSpend / totalConversions : 0
    const blendedCtr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0
    const blendedCpc = totalClicks > 0 ? totalSpend / totalClicks : 0

    const results: BenchmarkResult[] = []

    for (const [providerId, providerMetrics] of byProvider) {
        const pSpend = providerMetrics.reduce((sum, m) => sum + m.spend, 0)
        const pRevenue = providerMetrics.reduce((sum, m) => sum + m.revenue, 0)
        const pConversions = providerMetrics.reduce((sum, m) => sum + m.conversions, 0)
        const pClicks = providerMetrics.reduce((sum, m) => sum + m.clicks, 0)
        const pImpressions = providerMetrics.reduce((sum, m) => sum + m.impressions, 0)

        const roas = pSpend > 0 ? pRevenue / pSpend : 0
        const cpa = pConversions > 0 ? pSpend / pConversions : 0
        const ctr = pImpressions > 0 ? (pClicks / pImpressions) * 100 : 0
        const cpc = pClicks > 0 ? pSpend / pClicks : 0

        // Calculate percentage difference from blended average
        const roasDiff = blendedRoas > 0 ? ((roas - blendedRoas) / blendedRoas) * 100 : 0
        const cpaDiff = blendedCpa > 0 ? ((cpa - blendedCpa) / blendedCpa) * 100 : 0
        const ctrDiff = blendedCtr > 0 ? ((ctr - blendedCtr) / blendedCtr) * 100 : 0
        const cpcDiff = blendedCpc > 0 ? ((cpc - blendedCpc) / blendedCpc) * 100 : 0

        results.push({
            providerId,
            metrics: { roas, cpa, ctr, cpc },
            vsBlendedAverage: {
                roas: roasDiff,
                cpa: cpaDiff,
                ctr: ctrDiff,
                cpc: cpcDiff,
            },
        })
    }

    return results
}

// =============================================================================
// CUSTOM KPIs
// =============================================================================

/**
 * Calculates custom KPIs including CPA, LTV, ROI, and attribution-adjusted metrics.
 */
export function calculateCustomKpis(
    metrics: NormalizedAdMetric[],
    config?: KpiConfig
): CustomKpiResult {
    const totalSpend = metrics.reduce((sum, m) => sum + m.spend, 0)
    const totalRevenue = metrics.reduce((sum, m) => sum + m.revenue, 0)
    const totalConversions = metrics.reduce((sum, m) => sum + m.conversions, 0)
    const totalClicks = metrics.reduce((sum, m) => sum + m.clicks, 0)

    // CPA - Cost Per Acquisition
    const cpa = totalConversions > 0 ? totalSpend / totalConversions : 0

    // Blended CPA (same as CPA when all platforms combined)
    const blendedCpa = cpa

    // LTV - Lifetime Value (uses config or returns null)
    const ltv = config?.averageLifetimeValue ?? null

    // ROI - Return on Investment
    const roi = totalSpend > 0 ? ((totalRevenue - totalSpend) / totalSpend) * 100 : 0

    // MER - Marketing Efficiency Ratio (Revenue / Spend, similar to ROAS)
    const mer = totalSpend > 0 ? totalRevenue / totalSpend : 0

    // AOV - Average Order Value
    const aov = totalConversions > 0 ? totalRevenue / totalConversions : 0

    // RPC - Revenue Per Click
    const rpc = totalClicks > 0 ? totalRevenue / totalClicks : 0

    // Profit
    const profit = totalRevenue - totalSpend

    // Profit Margin
    const profitMargin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0

    // Attribution-adjusted conversions (simple model implementations)
    let adjustedConversions: number | undefined

    if (config?.attributionModel && totalConversions > 0) {
        switch (config.attributionModel) {
            case 'lastClick':
                // Last click gets 100% credit (default behavior)
                adjustedConversions = totalConversions
                break
            case 'firstClick':
                // First click gets 100% credit (same as last for aggregated data)
                adjustedConversions = totalConversions
                break
            case 'linear':
                // Linear attribution - evenly distributed
                adjustedConversions = totalConversions
                break
            case 'timeDecay':
                // Time decay - more recent interactions get more credit
                // For aggregated data, apply a 0.85 factor as a simplified model
                adjustedConversions = totalConversions * 0.85
                break
        }
    }

    return {
        cpa,
        blendedCpa,
        ltv,
        roi,
        mer,
        aov,
        rpc,
        profit,
        profitMargin,
        adjustedConversions,
    }
}
