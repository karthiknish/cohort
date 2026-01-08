// =============================================================================
// METRICS MODULE - Type Definitions
// =============================================================================

/**
 * Normalized ad metric data from any platform
 */
export type NormalizedAdMetric = {
    providerId: string
    adId: string
    adGroupId?: string
    campaignId: string
    name?: string
    date: string
    impressions: number
    clicks: number
    spend: number
    conversions: number
    revenue: number
    ctr?: number
    cpc?: number
    roas?: number
}

/**
 * Available metric fields for calculations
 */
export type MetricField = 'impressions' | 'clicks' | 'spend' | 'conversions' | 'revenue' | 'ctr' | 'cpc' | 'roas'

// =============================================================================
// FORMULA ENGINE RESULT TYPES
// =============================================================================

/**
 * Result of a moving average calculation
 */
export interface MovingAverageResult {
    date: string
    value: number
    rawValue: number
}

/**
 * Result of growth rate calculations
 */
export interface GrowthRateResult {
    weekOverWeek: {
        spend: number | null
        conversions: number | null
        revenue: number | null
        roas: number | null
    }
    monthOverMonth: {
        spend: number | null
        conversions: number | null
        revenue: number | null
        roas: number | null
    }
}

/**
 * Cross-platform benchmark comparison
 */
export interface BenchmarkResult {
    providerId: string
    metrics: {
        roas: number
        cpa: number
        ctr: number
        cpc: number
    }
    vsBlendedAverage: {
        roas: number // percentage difference from blended average
        cpa: number
        ctr: number
        cpc: number
    }
}

/**
 * Custom KPI calculation configuration
 */
export interface KpiConfig {
    /** Target CPA threshold for efficiency calculations */
    targetCpa?: number
    /** Customer lifetime value for LTV calculations */
    averageLifetimeValue?: number
    /** Attribution window in days */
    attributionWindow?: number
    /** Attribution model: 'lastClick' | 'firstClick' | 'linear' | 'timeDecay' */
    attributionModel?: 'lastClick' | 'firstClick' | 'linear' | 'timeDecay'
}

/**
 * Custom KPI calculation results
 */
export interface CustomKpiResult {
    /** Cost per acquisition */
    cpa: number
    /** Blended Cost per acquisition across platforms */
    blendedCpa: number
    /** Customer Lifetime Value (estimated) */
    ltv: number | null
    /** Return on Investment */
    roi: number
    /** Marketing Efficiency Ratio (Revenue / Total Spend) */
    mer: number
    /** Average Order Value */
    aov: number
    /** Revenue per Click */
    rpc: number
    /** Profit (Revenue - Spend) */
    profit: number
    /** Profit Margin percentage */
    profitMargin: number
    /** Attribution-adjusted conversions (if attribution model provided) */
    adjustedConversions?: number
}

// =============================================================================
// PIPELINE TYPES
// =============================================================================

/**
 * Options for the derived metrics pipeline
 */
export interface PipelineOptions {
    /** Whether to calculate moving averages (default: true) */
    includeMovingAverages?: boolean
    /** Whether to calculate growth rates (default: true) */
    includeGrowthRates?: boolean
    /** Whether to calculate benchmarks (default: true) */
    includeBenchmarks?: boolean
    /** Custom KPI configuration */
    kpiConfig?: KpiConfig
}

/**
 * Complete derived metrics result from the pipeline
 */
export interface DerivedMetricsResult {
    /** Weighted ROAS across all platforms (weighted by spend) */
    weightedRoas: number
    /** Moving average calculations */
    movingAverages: {
        ma7: {
            spend: MovingAverageResult[]
            conversions: MovingAverageResult[]
            revenue: MovingAverageResult[]
            roas: MovingAverageResult[]
        }
        ma30: {
            spend: MovingAverageResult[]
            conversions: MovingAverageResult[]
            revenue: MovingAverageResult[]
            roas: MovingAverageResult[]
        }
    }
    /** Growth rate calculations */
    growthRates: GrowthRateResult
    /** Cross-platform benchmarks */
    benchmarks: BenchmarkResult[]
    /** Custom KPI calculations */
    kpis: CustomKpiResult
    /** Timestamp of calculation */
    calculatedAt: string
}
