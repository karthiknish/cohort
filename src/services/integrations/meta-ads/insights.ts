// =============================================================================
// META ADS INSIGHTS - Platform-specific metric calculators
// =============================================================================

import type {
    PlatformInsight,
    PlatformInsightResult,
    MetaAdsCalculatedMetrics,
} from '../shared/insights-types'

/**
 * Raw Meta Ads metrics with extended fields for insights
 */
export interface MetaAdsRawMetrics {
    impressions: number
    clicks: number
    spend: number
    conversions: number
    revenue: number
    // Reach & Frequency
    reach?: number | null
    // Video metrics
    thruPlays?: number | null
    videoViews3s?: number | null
    videoViews?: number | null
    // Link clicks
    outboundClicks?: number | null
    linkClicks?: number | null
    // Results
    results?: number | null
}

// =============================================================================
// BENCHMARKS
// =============================================================================

const META_BENCHMARKS = {
    frequency: { optimal: 2.5, max: 4 },
    cpm: { good: 10, average: 15 }, // USD
    ctr: { good: 1.5, average: 0.9 }, // percentage
    hookRate: { good: 30, average: 15 }, // percentage
    thruPlayRate: { good: 25, average: 10 }, // percentage
}

// =============================================================================
// CALCULATOR
// =============================================================================

/**
 * Calculate derived metrics from Meta Ads raw data
 */
export function calculateMetaAdsMetrics(metrics: MetaAdsRawMetrics): MetaAdsCalculatedMetrics {
    const { impressions, clicks, spend, reach } = metrics

    // Frequency
    const frequency = reach && reach > 0 ? impressions / reach : null

    // CPM
    const cpm = impressions > 0 ? (spend / impressions) * 1000 : null

    // Cost per Reach
    const costPerReach = reach && reach > 0 ? spend / reach : null

    // CTR
    const ctr = impressions > 0 ? (clicks / impressions) * 100 : null

    // Outbound CTR
    const outboundClicks = metrics.outboundClicks ?? metrics.linkClicks ?? 0
    const outboundCtr = impressions > 0 ? (outboundClicks / impressions) * 100 : null

    // ThruPlay Rate (video completion)
    const thruPlayRate = impressions > 0 && metrics.thruPlays ? (metrics.thruPlays / impressions) * 100 : null

    // Hook Rate (3s video views)
    const hookRate = impressions > 0 && metrics.videoViews3s ? (metrics.videoViews3s / impressions) * 100 : null

    // Cost per Result
    const results = metrics.results ?? metrics.conversions
    const costPerResult = results > 0 ? spend / results : null

    return {
        frequency,
        cpm,
        costPerReach,
        thruPlayRate,
        hookRate,
        ctr,
        outboundCtr,
        costPerResult,
    }
}

/**
 * Generate insights from Meta Ads metrics
 */
export function generateMetaAdsInsights(
    metrics: MetaAdsRawMetrics,
    calculated: MetaAdsCalculatedMetrics
): PlatformInsight[] {
    const insights: PlatformInsight[] = []

    // Frequency Insights
    if (calculated.frequency !== null) {
        if (calculated.frequency > META_BENCHMARKS.frequency.max) {
            insights.push({
                type: 'audience',
                level: 'warning',
                metric: 'frequency',
                value: calculated.frequency,
                benchmark: META_BENCHMARKS.frequency.max,
                message: `Frequency of ${calculated.frequency.toFixed(1)} indicates ad fatigue risk`,
                recommendation: 'Refresh creative or expand audience targeting to reduce frequency.',
            })
        } else if (calculated.frequency <= META_BENCHMARKS.frequency.optimal) {
            insights.push({
                type: 'audience',
                level: 'success',
                metric: 'frequency',
                value: calculated.frequency,
                benchmark: META_BENCHMARKS.frequency.optimal,
                message: `Frequency of ${calculated.frequency.toFixed(1)} is in the optimal range`,
            })
        }
    }

    // CPM Insights
    if (calculated.cpm !== null) {
        if (calculated.cpm <= META_BENCHMARKS.cpm.good) {
            insights.push({
                type: 'efficiency',
                level: 'success',
                metric: 'cpm',
                value: calculated.cpm,
                benchmark: META_BENCHMARKS.cpm.good,
                message: `CPM of $${calculated.cpm.toFixed(2)} is efficient`,
            })
        } else if (calculated.cpm > META_BENCHMARKS.cpm.average) {
            insights.push({
                type: 'efficiency',
                level: 'warning',
                metric: 'cpm',
                value: calculated.cpm,
                benchmark: META_BENCHMARKS.cpm.average,
                message: `CPM of $${calculated.cpm.toFixed(2)} is above average`,
                recommendation: 'Test different placements or audience segments to reduce CPM.',
            })
        }
    }

    // Hook Rate Insights (video)
    if (calculated.hookRate !== null) {
        if (calculated.hookRate >= META_BENCHMARKS.hookRate.good) {
            insights.push({
                type: 'creative',
                level: 'success',
                metric: 'hookRate',
                value: calculated.hookRate,
                benchmark: META_BENCHMARKS.hookRate.good,
                message: `Hook Rate of ${calculated.hookRate.toFixed(1)}% shows strong opening`,
            })
        } else if (calculated.hookRate < META_BENCHMARKS.hookRate.average) {
            insights.push({
                type: 'creative',
                level: 'warning',
                metric: 'hookRate',
                value: calculated.hookRate,
                benchmark: META_BENCHMARKS.hookRate.average,
                message: `Hook Rate of ${calculated.hookRate.toFixed(1)}% suggests weak video opening`,
                recommendation: 'Improve the first 3 seconds of your video to capture attention.',
            })
        }
    }

    // ThruPlay Rate Insights
    if (calculated.thruPlayRate !== null) {
        if (calculated.thruPlayRate >= META_BENCHMARKS.thruPlayRate.good) {
            insights.push({
                type: 'creative',
                level: 'success',
                metric: 'thruPlayRate',
                value: calculated.thruPlayRate,
                benchmark: META_BENCHMARKS.thruPlayRate.good,
                message: `ThruPlay Rate of ${calculated.thruPlayRate.toFixed(1)}% shows engaging content`,
            })
        } else if (calculated.thruPlayRate < META_BENCHMARKS.thruPlayRate.average) {
            insights.push({
                type: 'creative',
                level: 'info',
                metric: 'thruPlayRate',
                value: calculated.thruPlayRate,
                benchmark: META_BENCHMARKS.thruPlayRate.average,
                message: `ThruPlay Rate of ${calculated.thruPlayRate.toFixed(1)}% could be improved`,
                recommendation: 'Shorten video length or improve pacing to increase completion rates.',
            })
        }
    }

    // CTR Insights
    if (calculated.ctr !== null) {
        if (calculated.ctr >= META_BENCHMARKS.ctr.good) {
            insights.push({
                type: 'performance',
                level: 'success',
                metric: 'ctr',
                value: calculated.ctr,
                benchmark: META_BENCHMARKS.ctr.good,
                message: `CTR of ${calculated.ctr.toFixed(2)}% is above average`,
            })
        } else if (calculated.ctr < META_BENCHMARKS.ctr.average) {
            insights.push({
                type: 'creative',
                level: 'warning',
                metric: 'ctr',
                value: calculated.ctr,
                benchmark: META_BENCHMARKS.ctr.average,
                message: `CTR of ${calculated.ctr.toFixed(2)}% is below industry average`,
                recommendation: 'Test different ad formats, copy, or targeting to improve engagement.',
            })
        }
    }

    return insights
}

/**
 * Full Meta Ads insights calculation
 */
export function calculateMetaAdsInsights(metrics: MetaAdsRawMetrics): PlatformInsightResult {
    const calculated = calculateMetaAdsMetrics(metrics)
    const insights = generateMetaAdsInsights(metrics, calculated)

    return {
        providerId: 'meta',
        calculatedMetrics: calculated as unknown as Record<string, number | null>,
        insights,
        calculatedAt: new Date().toISOString(),
    }
}
