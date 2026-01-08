// =============================================================================
// GOOGLE ADS INSIGHTS - Platform-specific metric calculators
// =============================================================================

import type {
    PlatformInsight,
    PlatformInsightResult,
    GoogleAdsCalculatedMetrics,
} from '../shared/insights-types'

/**
 * Raw Google Ads metrics with extended fields for insights
 */
export interface GoogleAdsRawMetrics {
    impressions: number
    clicks: number
    spend: number
    conversions: number
    revenue: number
    // Quality Score fields
    qualityScore?: number | null
    // Search Impression Share fields
    searchImpressionShare?: number | null
    searchBudgetLostImpressionShare?: number | null
    searchRankLostImpressionShare?: number | null
    // Position fields
    topImpressionPercentage?: number | null
    absoluteTopImpressionPercentage?: number | null
}

// =============================================================================
// BENCHMARKS
// =============================================================================

const GOOGLE_BENCHMARKS = {
    qualityScore: { good: 7, average: 5 },
    searchImpressionShare: { good: 80, average: 50 },
    ctr: { good: 3.0, average: 1.5 }, // percentage
    conversionRate: { good: 5.0, average: 2.0 }, // percentage
    topPositionRate: { good: 70, average: 40 },
}

// =============================================================================
// CALCULATOR
// =============================================================================

/**
 * Calculate derived metrics from Google Ads raw data
 */
export function calculateGoogleAdsMetrics(metrics: GoogleAdsRawMetrics): GoogleAdsCalculatedMetrics {
    const { impressions, clicks, spend, conversions } = metrics

    // CTR
    const ctr = impressions > 0 ? (clicks / impressions) * 100 : null

    // Average CPC
    const averageCpc = clicks > 0 ? spend / clicks : null

    // Conversion Rate
    const conversionRate = clicks > 0 ? (conversions / clicks) * 100 : null

    // Quality Score Rating (already 1-10, just pass through)
    const qualityScoreRating = metrics.qualityScore ?? null

    // Search Impression Share (already percentage from API)
    const searchImpressionShare = metrics.searchImpressionShare ?? null

    // Impression Share Lost
    const impressionShareLostBudget = metrics.searchBudgetLostImpressionShare ?? null
    const impressionShareLostRank = metrics.searchRankLostImpressionShare ?? null

    // Position Rates (already percentages from API)
    const topPositionRate = metrics.topImpressionPercentage ?? null
    const absoluteTopPositionRate = metrics.absoluteTopImpressionPercentage ?? null

    return {
        qualityScoreRating,
        searchImpressionShare,
        impressionShareLostBudget,
        impressionShareLostRank,
        topPositionRate,
        absoluteTopPositionRate,
        averageCpc,
        ctr,
        conversionRate,
    }
}

/**
 * Generate insights from Google Ads metrics
 */
export function generateGoogleAdsInsights(
    metrics: GoogleAdsRawMetrics,
    calculated: GoogleAdsCalculatedMetrics
): PlatformInsight[] {
    const insights: PlatformInsight[] = []

    // Quality Score Insights
    if (calculated.qualityScoreRating !== null) {
        if (calculated.qualityScoreRating >= GOOGLE_BENCHMARKS.qualityScore.good) {
            insights.push({
                type: 'performance',
                level: 'success',
                metric: 'qualityScore',
                value: calculated.qualityScoreRating,
                benchmark: GOOGLE_BENCHMARKS.qualityScore.good,
                message: `Quality Score is excellent at ${calculated.qualityScoreRating}/10`,
                recommendation: 'Maintain your current keyword-ad relevance strategy.',
            })
        } else if (calculated.qualityScoreRating < GOOGLE_BENCHMARKS.qualityScore.average) {
            insights.push({
                type: 'efficiency',
                level: 'warning',
                metric: 'qualityScore',
                value: calculated.qualityScoreRating,
                benchmark: GOOGLE_BENCHMARKS.qualityScore.average,
                message: `Quality Score is below average at ${calculated.qualityScoreRating}/10`,
                recommendation: 'Improve ad relevance by aligning keywords, ad copy, and landing pages.',
            })
        }
    }

    // Search Impression Share Insights
    if (calculated.searchImpressionShare !== null) {
        if (calculated.searchImpressionShare < GOOGLE_BENCHMARKS.searchImpressionShare.average) {
            insights.push({
                type: 'budget',
                level: 'info',
                metric: 'searchImpressionShare',
                value: calculated.searchImpressionShare,
                benchmark: GOOGLE_BENCHMARKS.searchImpressionShare.average,
                message: `Search Impression Share is ${calculated.searchImpressionShare.toFixed(1)}%, missing potential traffic`,
                recommendation: 'Increase budget or improve Quality Score to capture more impressions.',
            })
        }
    }

    // Lost Impression Share Analysis
    if (calculated.impressionShareLostBudget !== null && calculated.impressionShareLostBudget > 20) {
        insights.push({
            type: 'budget',
            level: 'warning',
            metric: 'impressionShareLostBudget',
            value: calculated.impressionShareLostBudget,
            message: `Losing ${calculated.impressionShareLostBudget.toFixed(1)}% of impressions due to budget constraints`,
            recommendation: 'Consider increasing daily budget to capture more conversions.',
        })
    }

    if (calculated.impressionShareLostRank !== null && calculated.impressionShareLostRank > 30) {
        insights.push({
            type: 'performance',
            level: 'warning',
            metric: 'impressionShareLostRank',
            value: calculated.impressionShareLostRank,
            message: `Losing ${calculated.impressionShareLostRank.toFixed(1)}% of impressions due to Ad Rank`,
            recommendation: 'Improve Quality Score or increase bids to win more auctions.',
        })
    }

    // CTR Analysis
    if (calculated.ctr !== null) {
        if (calculated.ctr >= GOOGLE_BENCHMARKS.ctr.good) {
            insights.push({
                type: 'creative',
                level: 'success',
                metric: 'ctr',
                value: calculated.ctr,
                benchmark: GOOGLE_BENCHMARKS.ctr.good,
                message: `CTR of ${calculated.ctr.toFixed(2)}% is above average`,
                recommendation: 'Your ad copy is resonating well with searchers.',
            })
        } else if (calculated.ctr < GOOGLE_BENCHMARKS.ctr.average) {
            insights.push({
                type: 'creative',
                level: 'warning',
                metric: 'ctr',
                value: calculated.ctr,
                benchmark: GOOGLE_BENCHMARKS.ctr.average,
                message: `CTR of ${calculated.ctr.toFixed(2)}% is below industry average`,
                recommendation: 'Test new headlines and descriptions to improve click-through.',
            })
        }
    }

    // Conversion Rate Analysis
    if (calculated.conversionRate !== null && metrics.clicks > 100) {
        if (calculated.conversionRate < GOOGLE_BENCHMARKS.conversionRate.average) {
            insights.push({
                type: 'efficiency',
                level: 'warning',
                metric: 'conversionRate',
                value: calculated.conversionRate,
                benchmark: GOOGLE_BENCHMARKS.conversionRate.average,
                message: `Conversion rate of ${calculated.conversionRate.toFixed(2)}% suggests landing page issues`,
                recommendation: 'Review landing page relevance, load speed, and call-to-action clarity.',
            })
        }
    }

    // Position Insights
    if (calculated.topPositionRate !== null && calculated.topPositionRate < GOOGLE_BENCHMARKS.topPositionRate.average) {
        insights.push({
            type: 'performance',
            level: 'info',
            metric: 'topPositionRate',
            value: calculated.topPositionRate,
            benchmark: GOOGLE_BENCHMARKS.topPositionRate.average,
            message: `Only ${calculated.topPositionRate.toFixed(1)}% of impressions are in top positions`,
            recommendation: 'Improve Quality Score or increase bids for better positions.',
        })
    }

    return insights
}

/**
 * Full Google Ads insights calculation
 */
export function calculateGoogleAdsInsights(metrics: GoogleAdsRawMetrics): PlatformInsightResult {
    const calculated = calculateGoogleAdsMetrics(metrics)
    const insights = generateGoogleAdsInsights(metrics, calculated)

    return {
        providerId: 'google',
        calculatedMetrics: calculated as unknown as Record<string, number | null>,
        insights,
        calculatedAt: new Date().toISOString(),
    }
}
