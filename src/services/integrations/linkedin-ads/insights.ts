// =============================================================================
// LINKEDIN ADS INSIGHTS - Platform-specific metric calculators
// =============================================================================

import type {
    PlatformInsight,
    PlatformInsightResult,
    LinkedInAdsCalculatedMetrics,
} from '../shared/insights-types'

/**
 * Raw LinkedIn Ads metrics with extended fields for insights
 */
export interface LinkedInAdsRawMetrics {
    impressions: number
    clicks: number
    spend: number
    conversions: number
    revenue: number
    // Engagement metrics
    reactions?: number | null
    comments?: number | null
    shares?: number | null
    follows?: number | null
    // Lead metrics
    leads?: number | null
    leadFormOpens?: number | null
    leadFormCompletions?: number | null
    // Video metrics
    videoViews?: number | null
    videoCompletions?: number | null
    // Other
    totalEngagements?: number | null
}

// =============================================================================
// BENCHMARKS
// =============================================================================

const LINKEDIN_BENCHMARKS = {
    engagementRate: { good: 3.5, average: 2.0 }, // percentage
    socialEngagementRate: { good: 1.5, average: 0.5 }, // percentage
    ctr: { good: 0.8, average: 0.4 }, // percentage
    clickToLeadRate: { good: 15, average: 5 }, // percentage
    videoCompletionRate: { good: 30, average: 15 }, // percentage
    viralRate: { good: 0.1, average: 0.05 }, // percentage
}

// =============================================================================
// CALCULATOR
// =============================================================================

/**
 * Calculate derived metrics from LinkedIn Ads raw data
 */
export function calculateLinkedInAdsMetrics(metrics: LinkedInAdsRawMetrics): LinkedInAdsCalculatedMetrics {
    const { impressions, clicks, spend } = metrics

    // Total Engagements
    const totalEngagements = metrics.totalEngagements ?? (
        (metrics.reactions ?? 0) +
        (metrics.comments ?? 0) +
        (metrics.shares ?? 0) +
        clicks +
        (metrics.follows ?? 0)
    )

    // Engagement Rate
    const engagementRate = impressions > 0 ? (totalEngagements / impressions) * 100 : null

    // Social Engagement Rate (reactions + comments + shares only)
    const socialEngagements = (metrics.reactions ?? 0) + (metrics.comments ?? 0) + (metrics.shares ?? 0)
    const socialEngagementRate = impressions > 0 ? (socialEngagements / impressions) * 100 : null

    // Click-to-Lead Rate
    const leads = metrics.leads ?? metrics.leadFormCompletions ?? 0
    const clickToLeadRate = clicks > 0 ? (leads / clicks) * 100 : null

    // Lead Form Completion Rate
    const leadFormCompletionRate = metrics.leadFormOpens && metrics.leadFormOpens > 0 && metrics.leadFormCompletions
        ? (metrics.leadFormCompletions / metrics.leadFormOpens) * 100
        : null

    // Video Completion Rate
    const videoCompletionRate = metrics.videoViews && metrics.videoViews > 0 && metrics.videoCompletions
        ? (metrics.videoCompletions / metrics.videoViews) * 100
        : null

    // Cost per Engagement
    const costPerEngagement = totalEngagements > 0 ? spend / totalEngagements : null

    // CTR
    const ctr = impressions > 0 ? (clicks / impressions) * 100 : null

    // Viral Rate (shares / impressions)
    const viralRate = impressions > 0 && metrics.shares ? (metrics.shares / impressions) * 100 : null

    return {
        engagementRate,
        socialEngagementRate,
        clickToLeadRate,
        leadFormCompletionRate,
        videoCompletionRate,
        costPerEngagement,
        ctr,
        viralRate,
    }
}

/**
 * Generate insights from LinkedIn Ads metrics
 */
export function generateLinkedInAdsInsights(
    metrics: LinkedInAdsRawMetrics,
    calculated: LinkedInAdsCalculatedMetrics
): PlatformInsight[] {
    const insights: PlatformInsight[] = []

    // Engagement Rate Insights
    if (calculated.engagementRate !== null) {
        if (calculated.engagementRate >= LINKEDIN_BENCHMARKS.engagementRate.good) {
            insights.push({
                type: 'engagement',
                level: 'success',
                metric: 'engagementRate',
                value: calculated.engagementRate,
                benchmark: LINKEDIN_BENCHMARKS.engagementRate.good,
                message: `Engagement Rate of ${calculated.engagementRate.toFixed(2)}% is excellent for LinkedIn`,
            })
        } else if (calculated.engagementRate < LINKEDIN_BENCHMARKS.engagementRate.average) {
            insights.push({
                type: 'engagement',
                level: 'warning',
                metric: 'engagementRate',
                value: calculated.engagementRate,
                benchmark: LINKEDIN_BENCHMARKS.engagementRate.average,
                message: `Engagement Rate of ${calculated.engagementRate.toFixed(2)}% is below average`,
                recommendation: 'Use thought leadership content and ask questions to drive engagement.',
            })
        }
    }

    // Social Engagement Rate
    if (calculated.socialEngagementRate !== null) {
        if (calculated.socialEngagementRate >= LINKEDIN_BENCHMARKS.socialEngagementRate.good) {
            insights.push({
                type: 'engagement',
                level: 'success',
                metric: 'socialEngagementRate',
                value: calculated.socialEngagementRate,
                benchmark: LINKEDIN_BENCHMARKS.socialEngagementRate.good,
                message: `Social engagement (reactions, comments, shares) is strong at ${calculated.socialEngagementRate.toFixed(2)}%`,
            })
        }
    }

    // Click-to-Lead Rate
    if (calculated.clickToLeadRate !== null) {
        if (calculated.clickToLeadRate >= LINKEDIN_BENCHMARKS.clickToLeadRate.good) {
            insights.push({
                type: 'performance',
                level: 'success',
                metric: 'clickToLeadRate',
                value: calculated.clickToLeadRate,
                benchmark: LINKEDIN_BENCHMARKS.clickToLeadRate.good,
                message: `Click-to-Lead Rate of ${calculated.clickToLeadRate.toFixed(1)}% is excellent`,
            })
        } else if (calculated.clickToLeadRate < LINKEDIN_BENCHMARKS.clickToLeadRate.average) {
            insights.push({
                type: 'efficiency',
                level: 'warning',
                metric: 'clickToLeadRate',
                value: calculated.clickToLeadRate,
                benchmark: LINKEDIN_BENCHMARKS.clickToLeadRate.average,
                message: `Click-to-Lead Rate of ${calculated.clickToLeadRate.toFixed(1)}% suggests form or landing page issues`,
                recommendation: 'Simplify lead forms and ensure landing page matches ad promise.',
            })
        }
    }

    // Lead Form Completion Rate
    if (calculated.leadFormCompletionRate !== null) {
        if (calculated.leadFormCompletionRate < 50) {
            insights.push({
                type: 'efficiency',
                level: 'warning',
                metric: 'leadFormCompletionRate',
                value: calculated.leadFormCompletionRate,
                message: `Only ${calculated.leadFormCompletionRate.toFixed(1)}% of form opens result in submissions`,
                recommendation: 'Reduce form fields to 3-4 and use pre-filled LinkedIn data.',
            })
        }
    }

    // Video Completion Rate
    if (calculated.videoCompletionRate !== null) {
        if (calculated.videoCompletionRate >= LINKEDIN_BENCHMARKS.videoCompletionRate.good) {
            insights.push({
                type: 'creative',
                level: 'success',
                metric: 'videoCompletionRate',
                value: calculated.videoCompletionRate,
                benchmark: LINKEDIN_BENCHMARKS.videoCompletionRate.good,
                message: `Video Completion Rate of ${calculated.videoCompletionRate.toFixed(1)}% shows engaging content`,
            })
        } else if (calculated.videoCompletionRate < LINKEDIN_BENCHMARKS.videoCompletionRate.average) {
            insights.push({
                type: 'creative',
                level: 'info',
                metric: 'videoCompletionRate',
                value: calculated.videoCompletionRate,
                benchmark: LINKEDIN_BENCHMARKS.videoCompletionRate.average,
                message: `Video Completion Rate of ${calculated.videoCompletionRate.toFixed(1)}% could be improved`,
                recommendation: 'Keep videos under 30 seconds for better completion rates.',
            })
        }
    }

    // CTR
    if (calculated.ctr !== null) {
        if (calculated.ctr >= LINKEDIN_BENCHMARKS.ctr.good) {
            insights.push({
                type: 'performance',
                level: 'success',
                metric: 'ctr',
                value: calculated.ctr,
                benchmark: LINKEDIN_BENCHMARKS.ctr.good,
                message: `CTR of ${calculated.ctr.toFixed(2)}% is above LinkedIn average`,
            })
        } else if (calculated.ctr < LINKEDIN_BENCHMARKS.ctr.average) {
            insights.push({
                type: 'creative',
                level: 'warning',
                metric: 'ctr',
                value: calculated.ctr,
                benchmark: LINKEDIN_BENCHMARKS.ctr.average,
                message: `CTR of ${calculated.ctr.toFixed(2)}% is below average`,
                recommendation: 'Test different ad formats (carousel, video) and stronger CTAs.',
            })
        }
    }

    // Viral Rate
    if (calculated.viralRate !== null && calculated.viralRate >= LINKEDIN_BENCHMARKS.viralRate.good) {
        insights.push({
            type: 'engagement',
            level: 'success',
            metric: 'viralRate',
            value: calculated.viralRate,
            benchmark: LINKEDIN_BENCHMARKS.viralRate.good,
            message: `Content is being shared organically (${calculated.viralRate.toFixed(3)}% share rate)`,
        })
    }

    return insights
}

/**
 * Full LinkedIn Ads insights calculation
 */
export function calculateLinkedInAdsInsights(metrics: LinkedInAdsRawMetrics): PlatformInsightResult {
    const calculated = calculateLinkedInAdsMetrics(metrics)
    const insights = generateLinkedInAdsInsights(metrics, calculated)

    return {
        providerId: 'linkedin',
        calculatedMetrics: calculated as unknown as Record<string, number | null>,
        insights,
        calculatedAt: new Date().toISOString(),
    }
}
