// =============================================================================
// DERIVED METRICS PIPELINE
// =============================================================================

import type {
    NormalizedAdMetric,
    PipelineOptions,
    DerivedMetricsResult,
} from './types'
import {
    calculateWeightedRoas,
    calculateMovingAverage,
    calculateRoasMovingAverage,
    calculateGrowthRates,
    calculateCrossplatformBenchmarks,
    calculateCustomKpis,
} from './formula-engine'

/**
 * Runs the complete derived metrics pipeline on normalized ad metrics.
 * 
 * This should be called after normalization in the API route to calculate
 * all advanced metrics server-side.
 * 
 * @param metrics - Normalized ad metrics from any platform
 * @param options - Optional configuration for the pipeline
 * @returns Complete derived metrics result
 * 
 * @example
 * ```typescript
 * const metrics = normalizeGoogleMetrics(googleMetrics)
 * const derived = runDerivedMetricsPipeline(metrics)
 * return { metrics, derivedMetrics: derived }
 * ```
 */
export function runDerivedMetricsPipeline(
    metrics: NormalizedAdMetric[],
    options?: PipelineOptions
): DerivedMetricsResult {
    const {
        includeMovingAverages = true,
        includeGrowthRates = true,
        includeBenchmarks = true,
        kpiConfig,
    } = options ?? {}

    // 1. Weighted ROAS (always calculated as core metric)
    const weightedRoas = calculateWeightedRoas(metrics)

    // 2. Moving Averages (7-day and 30-day)
    const movingAverages = includeMovingAverages
        ? {
            ma7: {
                spend: calculateMovingAverage(metrics, 'spend', 7),
                conversions: calculateMovingAverage(metrics, 'conversions', 7),
                revenue: calculateMovingAverage(metrics, 'revenue', 7),
                roas: calculateRoasMovingAverage(metrics, 7),
            },
            ma30: {
                spend: calculateMovingAverage(metrics, 'spend', 30),
                conversions: calculateMovingAverage(metrics, 'conversions', 30),
                revenue: calculateMovingAverage(metrics, 'revenue', 30),
                roas: calculateRoasMovingAverage(metrics, 30),
            },
        }
        : {
            ma7: { spend: [], conversions: [], revenue: [], roas: [] },
            ma30: { spend: [], conversions: [], revenue: [], roas: [] },
        }

    // 3. Growth Rates (WoW and MoM)
    const growthRates = includeGrowthRates
        ? calculateGrowthRates(metrics)
        : {
            weekOverWeek: { spend: null, conversions: null, revenue: null, roas: null },
            monthOverMonth: { spend: null, conversions: null, revenue: null, roas: null },
        }

    // 4. Cross-Platform Benchmarks
    const benchmarks = includeBenchmarks
        ? calculateCrossplatformBenchmarks(metrics)
        : []

    // 5. Custom KPIs
    const kpis = calculateCustomKpis(metrics, kpiConfig)

    return {
        weightedRoas,
        movingAverages,
        growthRates,
        benchmarks,
        kpis,
        calculatedAt: new Date().toISOString(),
    }
}

/**
 * Lightweight version of the pipeline that only calculates essential KPIs.
 * Useful for high-frequency calls where full pipeline is too expensive.
 */
export function runLightweightPipeline(
    metrics: NormalizedAdMetric[]
): Pick<DerivedMetricsResult, 'weightedRoas' | 'kpis' | 'calculatedAt'> {
    return {
        weightedRoas: calculateWeightedRoas(metrics),
        kpis: calculateCustomKpis(metrics),
        calculatedAt: new Date().toISOString(),
    }
}
