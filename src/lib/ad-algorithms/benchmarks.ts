// =============================================================================
// BENCHMARK COMPARISON ALGORITHMS
// =============================================================================

import type {
  AdMetricsSummary,
  IndustryBenchmarks,
  BenchmarkComparison,
} from './types'

/**
 * Industry benchmarks by platform (based on 2024 industry averages)
 * These can be customized per industry/vertical
 */
export const PLATFORM_BENCHMARKS: Record<string, IndustryBenchmarks> = {
  google: {
    providerId: 'google',
    ctr: 3.17,           // Search average
    cpc: 2.69,           // Cross-industry average
    conversionRate: 4.40, // Search average
    cpa: 56.11,
    roas: 2.0,
    cpm: 3.12,
  },
  facebook: {
    providerId: 'facebook',
    ctr: 0.90,
    cpc: 1.72,
    conversionRate: 9.21,
    cpa: 18.68,
    roas: 2.5,
    cpm: 11.54,
  },
  meta: {
    providerId: 'meta',
    ctr: 0.90,
    cpc: 1.72,
    conversionRate: 9.21,
    cpa: 18.68,
    roas: 2.5,
    cpm: 11.54,
  },
  linkedin: {
    providerId: 'linkedin',
    ctr: 0.44,
    cpc: 5.58,
    conversionRate: 6.10,
    cpa: 91.52,
    roas: 1.5,
    cpm: 6.59,
  },
  tiktok: {
    providerId: 'tiktok',
    ctr: 0.84,
    cpc: 1.00,
    conversionRate: 7.50,
    cpa: 13.33,
    roas: 2.0,
    cpm: 10.00,
  },
}

/**
 * Default benchmark for unknown platforms
 */
const DEFAULT_BENCHMARK: IndustryBenchmarks = {
  providerId: 'default',
  ctr: 1.0,
  cpc: 2.0,
  conversionRate: 5.0,
  cpa: 40.0,
  roas: 2.0,
  cpm: 8.0,
}

/**
 * Get benchmark for a specific platform
 */
export function getBenchmarkForPlatform(providerId: string): IndustryBenchmarks {
  return PLATFORM_BENCHMARKS[providerId.toLowerCase()] || DEFAULT_BENCHMARK
}

/**
 * Calculate percentile position (0-100)
 */
function calculatePercentile(
  value: number,
  benchmark: number,
  higherIsBetter: boolean = true
): number {
  if (benchmark === 0) return 50

  const ratio = value / benchmark

  if (higherIsBetter) {
    // 0.5x benchmark = 25th percentile, 1x = 50th, 2x = 90th
    if (ratio < 0.5) return Math.round(ratio * 50)
    if (ratio < 1) return Math.round(25 + (ratio - 0.5) * 50)
    if (ratio < 2) return Math.round(50 + (ratio - 1) * 40)
    return Math.min(99, Math.round(90 + (ratio - 2) * 5))
  } else {
    // For metrics where lower is better (CPC, CPA, CPM)
    if (ratio > 2) return Math.round((1 / ratio) * 25)
    if (ratio > 1) return Math.round(25 + (2 - ratio) * 25)
    if (ratio > 0.5) return Math.round(50 + (1 - ratio) * 40)
    return Math.min(99, Math.round(90 + (0.5 - ratio) * 20))
  }
}

/**
 * Determine status based on percentile
 */
function getStatusFromPercentile(percentile: number): 'below' | 'average' | 'above' | 'excellent' {
  if (percentile < 25) return 'below'
  if (percentile < 50) return 'average'
  if (percentile < 75) return 'above'
  return 'excellent'
}

/**
 * Compare a single metric against benchmark
 */
export function compareToBenchmark(
  metricName: string,
  value: number,
  benchmark: number,
  higherIsBetter: boolean = true
): BenchmarkComparison {
  const percentile = calculatePercentile(value, benchmark, higherIsBetter)
  const gap = value - benchmark
  const gapPercent = benchmark !== 0 ? (gap / benchmark) * 100 : 0

  return {
    metric: metricName,
    currentValue: value,
    benchmarkValue: benchmark,
    percentile,
    status: getStatusFromPercentile(percentile),
    gap: higherIsBetter ? gap : -gap, // Flip for "lower is better" metrics
    gapPercent: higherIsBetter ? gapPercent : -gapPercent,
  }
}

/**
 * Run comprehensive benchmark comparison for a provider
 */
export function runBenchmarkAnalysis(summary: AdMetricsSummary): BenchmarkComparison[] {
  const benchmark = getBenchmarkForPlatform(summary.providerId)
  const { totalSpend, totalClicks, totalConversions, totalImpressions, averageRoaS, averageCpc } = summary

  const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0
  const convRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0
  const cpa = totalConversions > 0 ? totalSpend / totalConversions : 0
  const cpm = totalImpressions > 0 ? (totalSpend / totalImpressions) * 1000 : 0

  return [
    compareToBenchmark('ROAS', averageRoaS, benchmark.roas, true),
    compareToBenchmark('CTR', ctr, benchmark.ctr, true),
    compareToBenchmark('CPC', averageCpc, benchmark.cpc, false),
    compareToBenchmark('Conv Rate', convRate, benchmark.conversionRate, true),
    compareToBenchmark('CPA', cpa, benchmark.cpa, false),
    compareToBenchmark('CPM', cpm, benchmark.cpm, false),
  ]
}

/**
 * Get benchmark chart data for visualization
 */
export function getBenchmarkChartData(
  comparisons: BenchmarkComparison[]
): { metric: string; current: number; benchmark: number; percentile: number }[] {
  return comparisons.map(c => ({
    metric: c.metric,
    current: c.currentValue,
    benchmark: c.benchmarkValue,
    percentile: c.percentile,
  }))
}

/**
 * Calculate overall benchmark score
 */
export function calculateBenchmarkScore(comparisons: BenchmarkComparison[]): number {
  if (comparisons.length === 0) return 50

  const avgPercentile = comparisons.reduce((sum, c) => sum + c.percentile, 0) / comparisons.length
  return Math.round(avgPercentile)
}

/**
 * Get areas needing improvement (below average metrics)
 */
export function getImprovementAreas(comparisons: BenchmarkComparison[]): BenchmarkComparison[] {
  return comparisons
    .filter(c => c.status === 'below' || c.status === 'average')
    .sort((a, b) => a.percentile - b.percentile)
}

/**
 * Get areas of strength (above average metrics)
 */
export function getStrengthAreas(comparisons: BenchmarkComparison[]): BenchmarkComparison[] {
  return comparisons
    .filter(c => c.status === 'above' || c.status === 'excellent')
    .sort((a, b) => b.percentile - a.percentile)
}

/**
 * Compare multiple providers against their respective benchmarks
 */
export function crossPlatformBenchmarkAnalysis(
  summaries: AdMetricsSummary[]
): { providerId: string; comparisons: BenchmarkComparison[]; overallScore: number }[] {
  return summaries.map(summary => {
    const comparisons = runBenchmarkAnalysis(summary)
    return {
      providerId: summary.providerId,
      comparisons,
      overallScore: calculateBenchmarkScore(comparisons),
    }
  })
}
