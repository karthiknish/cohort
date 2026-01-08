// =============================================================================
// TIKTOK ADS INSIGHTS - Platform-specific metric calculators
// =============================================================================

import type {
    PlatformInsight,
    PlatformInsightResult,
    TikTokAdsCalculatedMetrics,
} from '../shared/insights-types'

/**
 * Raw TikTok Ads metrics with extended fields for insights
 */
export interface TikTokAdsRawMetrics {
    impressions: number
    clicks: number
    spend: number
    conversions: number
    revenue: number
    // Video metrics
    videoViews?: number | null
    videoViews6s?: number | null
    videoViewsP25?: number | null
    videoViewsP50?: number | null
    videoViewsP75?: number | null
    videoViewsP100?: number | null
    averageWatchTime?: number | null
    // Engagement
    likes?: number | null
    comments?: number | null
    shares?: number | null
    profileVisits?: number | null
    follows?: number | null
}

// =============================================================================
// BENCHMARKS
// =============================================================================

const TIKTOK_BENCHMARKS = {
    videoViewRate: { good: 15, average: 8 }, // percentage
    sixSecondViewRate: { good: 30, average: 15 }, // percentage
    completionRate: { good: 15, average: 5 }, // percentage
    engagementRate: { good: 5, average: 2 }, // percentage
    ctr: { good: 1.5, average: 0.8 }, // percentage
}

// =============================================================================
// CALCULATOR
// =============================================================================

/**
 * Calculate derived metrics from TikTok Ads raw data
 */
export function calculateTikTokAdsMetrics(metrics: TikTokAdsRawMetrics): TikTokAdsCalculatedMetrics {
    const { impressions, clicks, spend, videoViews } = metrics

    // Video View Rate (2s views / impressions)
    const videoViewRate = impressions > 0 && videoViews ? (videoViews / impressions) * 100 : null

    // 6-second View Rate
    const sixSecondViewRate = impressions > 0 && metrics.videoViews6s ? (metrics.videoViews6s / impressions) * 100 : null

    // Completion Rate (100% views / total views)
    const completionRate = videoViews && videoViews > 0 && metrics.videoViewsP100
        ? (metrics.videoViewsP100 / videoViews) * 100
        : null

    // Engagement Rate
    const totalEngagements = (metrics.likes ?? 0) + (metrics.comments ?? 0) + (metrics.shares ?? 0)
    const engagementRate = impressions > 0 ? (totalEngagements / impressions) * 100 : null

    // Profile Visits Rate
    const profileVisitsRate = impressions > 0 && metrics.profileVisits ? (metrics.profileVisits / impressions) * 100 : null

    // CTR
    const ctr = impressions > 0 ? (clicks / impressions) * 100 : null

    // CPC
    const cpc = clicks > 0 ? spend / clicks : null

    // Average Watch Time (pass through)
    const averageWatchTime = metrics.averageWatchTime ?? null

    return {
        videoViewRate,
        sixSecondViewRate,
        completionRate,
        engagementRate,
        profileVisitsRate,
        ctr,
        cpc,
        averageWatchTime,
    }
}

/**
 * Generate insights from TikTok Ads metrics
 */
export function generateTikTokAdsInsights(
    metrics: TikTokAdsRawMetrics,
    calculated: TikTokAdsCalculatedMetrics
): PlatformInsight[] {
    const insights: PlatformInsight[] = []

    // Video View Rate Insights
    if (calculated.videoViewRate !== null) {
        if (calculated.videoViewRate >= TIKTOK_BENCHMARKS.videoViewRate.good) {
            insights.push({
                type: 'creative',
                level: 'success',
                metric: 'videoViewRate',
                value: calculated.videoViewRate,
                benchmark: TIKTOK_BENCHMARKS.videoViewRate.good,
                message: `Video View Rate of ${calculated.videoViewRate.toFixed(1)}% is excellent`,
            })
        } else if (calculated.videoViewRate < TIKTOK_BENCHMARKS.videoViewRate.average) {
            insights.push({
                type: 'creative',
                level: 'warning',
                metric: 'videoViewRate',
                value: calculated.videoViewRate,
                benchmark: TIKTOK_BENCHMARKS.videoViewRate.average,
                message: `Video View Rate of ${calculated.videoViewRate.toFixed(1)}% is below average`,
                recommendation: 'Improve thumbnail and opening hook to increase view rate.',
            })
        }
    }

    // 6-second View Rate
    if (calculated.sixSecondViewRate !== null) {
        if (calculated.sixSecondViewRate >= TIKTOK_BENCHMARKS.sixSecondViewRate.good) {
            insights.push({
                type: 'creative',
                level: 'success',
                metric: 'sixSecondViewRate',
                value: calculated.sixSecondViewRate,
                benchmark: TIKTOK_BENCHMARKS.sixSecondViewRate.good,
                message: `6s View Rate of ${calculated.sixSecondViewRate.toFixed(1)}% shows strong hook`,
            })
        } else if (calculated.sixSecondViewRate < TIKTOK_BENCHMARKS.sixSecondViewRate.average) {
            insights.push({
                type: 'creative',
                level: 'warning',
                metric: 'sixSecondViewRate',
                value: calculated.sixSecondViewRate,
                benchmark: TIKTOK_BENCHMARKS.sixSecondViewRate.average,
                message: `6s View Rate of ${calculated.sixSecondViewRate.toFixed(1)}% indicates weak hook`,
                recommendation: 'Lead with your strongest content in the first 2-3 seconds.',
            })
        }
    }

    // Completion Rate
    if (calculated.completionRate !== null) {
        if (calculated.completionRate >= TIKTOK_BENCHMARKS.completionRate.good) {
            insights.push({
                type: 'creative',
                level: 'success',
                metric: 'completionRate',
                value: calculated.completionRate,
                benchmark: TIKTOK_BENCHMARKS.completionRate.good,
                message: `Completion Rate of ${calculated.completionRate.toFixed(1)}% shows engaging content`,
            })
        } else if (calculated.completionRate < TIKTOK_BENCHMARKS.completionRate.average) {
            insights.push({
                type: 'creative',
                level: 'info',
                metric: 'completionRate',
                value: calculated.completionRate,
                benchmark: TIKTOK_BENCHMARKS.completionRate.average,
                message: `Completion Rate of ${calculated.completionRate.toFixed(1)}% could be improved`,
                recommendation: 'Keep videos under 15 seconds or improve pacing throughout.',
            })
        }
    }

    // Engagement Rate
    if (calculated.engagementRate !== null) {
        if (calculated.engagementRate >= TIKTOK_BENCHMARKS.engagementRate.good) {
            insights.push({
                type: 'engagement',
                level: 'success',
                metric: 'engagementRate',
                value: calculated.engagementRate,
                benchmark: TIKTOK_BENCHMARKS.engagementRate.good,
                message: `Engagement Rate of ${calculated.engagementRate.toFixed(2)}% is excellent`,
            })
        } else if (calculated.engagementRate < TIKTOK_BENCHMARKS.engagementRate.average) {
            insights.push({
                type: 'engagement',
                level: 'warning',
                metric: 'engagementRate',
                value: calculated.engagementRate,
                benchmark: TIKTOK_BENCHMARKS.engagementRate.average,
                message: `Engagement Rate of ${calculated.engagementRate.toFixed(2)}% is below average`,
                recommendation: 'Add CTAs encouraging likes and comments; use trending sounds.',
            })
        }
    }

    // CTR
    if (calculated.ctr !== null) {
        if (calculated.ctr >= TIKTOK_BENCHMARKS.ctr.good) {
            insights.push({
                type: 'performance',
                level: 'success',
                metric: 'ctr',
                value: calculated.ctr,
                benchmark: TIKTOK_BENCHMARKS.ctr.good,
                message: `CTR of ${calculated.ctr.toFixed(2)}% is above average`,
            })
        } else if (calculated.ctr < TIKTOK_BENCHMARKS.ctr.average) {
            insights.push({
                type: 'creative',
                level: 'warning',
                metric: 'ctr',
                value: calculated.ctr,
                benchmark: TIKTOK_BENCHMARKS.ctr.average,
                message: `CTR of ${calculated.ctr.toFixed(2)}% is below average`,
                recommendation: 'Add clearer call-to-action and test different CTA buttons.',
            })
        }
    }

    return insights
}

/**
 * Full TikTok Ads insights calculation
 */
export function calculateTikTokAdsInsights(metrics: TikTokAdsRawMetrics): PlatformInsightResult {
    const calculated = calculateTikTokAdsMetrics(metrics)
    const insights = generateTikTokAdsInsights(metrics, calculated)

    return {
        providerId: 'tiktok',
        calculatedMetrics: calculated as unknown as Record<string, number | null>,
        insights,
        calculatedAt: new Date().toISOString(),
    }
}
