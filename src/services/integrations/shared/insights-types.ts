// =============================================================================
// PLATFORM INSIGHTS - Shared Types
// =============================================================================

/**
 * Insight type categories for ad metrics
 */
export type InsightType = 'performance' | 'efficiency' | 'creative' | 'audience' | 'budget' | 'engagement'

/**
 * Severity level for insights
 */
export type InsightLevel = 'success' | 'warning' | 'info' | 'critical'

/**
 * Single platform insight with actionable information
 */
export interface PlatformInsight {
    /** Category of the insight */
    type: InsightType
    /** Severity level */
    level: InsightLevel
    /** Name of the metric this insight relates to */
    metric: string
    /** Current value of the metric */
    value: number
    /** Industry or platform benchmark for comparison */
    benchmark?: number
    /** Human-readable message explaining the insight */
    message: string
    /** Actionable recommendation */
    recommendation?: string
}

/**
 * Extended metrics from a platform with calculated fields and insights
 */
export interface EnrichedMetrics<TRaw, TCalculated extends Record<string, number | null> = Record<string, number | null>> {
    /** Original raw metrics from the platform */
    raw: TRaw
    /** Calculated/derived metric values */
    calculated: TCalculated
    /** Generated insights based on the metrics */
    insights: PlatformInsight[]
}

/**
 * Platform-specific insight result
 */
export interface PlatformInsightResult {
    /** Platform identifier */
    providerId: string
    /** Calculated metrics specific to this platform */
    calculatedMetrics: Record<string, number | null>
    /** Generated insights */
    insights: PlatformInsight[]
    /** ISO timestamp when calculated */
    calculatedAt: string
}

// =============================================================================
// GOOGLE ADS SPECIFIC TYPES
// =============================================================================

export interface GoogleAdsCalculatedMetrics {
    /** Quality Score rating (1-10 normalized to tier) */
    qualityScoreRating: number | null
    /** Search impression share percentage */
    searchImpressionShare: number | null
    /** Impression share lost due to budget */
    impressionShareLostBudget: number | null
    /** Impression share lost due to rank */
    impressionShareLostRank: number | null
    /** Top position impression percentage */
    topPositionRate: number | null
    /** Absolute top position impression percentage */
    absoluteTopPositionRate: number | null
    /** Average CPC */
    averageCpc: number | null
    /** CTR */
    ctr: number | null
    /** Conversion rate */
    conversionRate: number | null
}

// =============================================================================
// META ADS SPECIFIC TYPES
// =============================================================================

export interface MetaAdsCalculatedMetrics {
    /** Frequency: avg times ad shown to each person */
    frequency: number | null
    /** CPM: Cost per 1000 impressions */
    cpm: number | null
    /** Cost per unique reach */
    costPerReach: number | null
    /** ThruPlay rate for video ads */
    thruPlayRate: number | null
    /** Hook rate: 3s video views / impressions */
    hookRate: number | null
    /** CTR */
    ctr: number | null
    /** Outbound CTR (link clicks specifically) */
    outboundCtr: number | null
    /** Cost per result */
    costPerResult: number | null
}

// =============================================================================
// TIKTOK ADS SPECIFIC TYPES
// =============================================================================

export interface TikTokAdsCalculatedMetrics {
    /** Video view rate (2s views / impressions) */
    videoViewRate: number | null
    /** 6-second view rate */
    sixSecondViewRate: number | null
    /** Video completion rate */
    completionRate: number | null
    /** Engagement rate: (likes + comments + shares) / impressions */
    engagementRate: number | null
    /** Profile visits rate */
    profileVisitsRate: number | null
    /** CTR */
    ctr: number | null
    /** CPC */
    cpc: number | null
    /** Average watch time (seconds) */
    averageWatchTime: number | null
}

// =============================================================================
// LINKEDIN ADS SPECIFIC TYPES
// =============================================================================

export interface LinkedInAdsCalculatedMetrics {
    /** Engagement rate: total engagements / impressions */
    engagementRate: number | null
    /** Social engagement rate: (reactions + comments + shares) / impressions */
    socialEngagementRate: number | null
    /** Click-to-lead rate */
    clickToLeadRate: number | null
    /** Lead form completion rate */
    leadFormCompletionRate: number | null
    /** Video completion rate */
    videoCompletionRate: number | null
    /** Cost per engagement */
    costPerEngagement: number | null
    /** CTR */
    ctr: number | null
    /** Viral rate: shares / impressions */
    viralRate: number | null
}
