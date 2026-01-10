// =============================================================================
// EFFICIENCY ALGORITHMS - Score Calculations
// =============================================================================

import type {
  AdMetricsSummary,
  EnrichedMetricsSummary,
  EfficiencyBreakdown,
} from './types'

/**
 * Efficiency score weights - customizable per business
 */
export const EFFICIENCY_WEIGHTS = {
  roas: 0.35,           // Return on ad spend (most important)
  conversionRate: 0.25, // Conversion effectiveness
  ctr: 0.15,            // Ad relevance/engagement
  cpc: 0.10,            // Cost efficiency (inverse)
  cpm: 0.10,            // Reach efficiency (inverse)
  momentum: 0.05,       // Trend direction bonus
}

/**
 * Benchmark targets for "perfect" scores
 */
export const EFFICIENCY_BENCHMARKS = {
  roas: 5.0,            // 5x ROAS is excellent
  conversionRate: 5.0,  // 5% conversion rate
  ctr: 3.0,             // 3% CTR
  cpc: 1.0,             // $1 CPC target (lower is better)
  cpm: 5.0,             // $5 CPM target (lower is better)
}

/**
 * Calculate the main efficiency score (0-100)
 * This is a weighted composite of multiple performance dimensions
 */
export function calculateEfficiencyScore(summary: AdMetricsSummary): number {
  const { totalSpend, totalClicks, totalConversions, totalImpressions, averageRoaS, averageCpc } = summary
  
  if (totalSpend === 0) return 0

  const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0
  const convRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0
  const cpm = totalImpressions > 0 ? (totalSpend / totalImpressions) * 1000 : 0

  // Normalize each component (0-1 scale)
  const nRoas = Math.min(averageRoaS / EFFICIENCY_BENCHMARKS.roas, 1)
  const nConvRate = Math.min(convRate / EFFICIENCY_BENCHMARKS.conversionRate, 1)
  const nCtr = Math.min(ctr / EFFICIENCY_BENCHMARKS.ctr, 1)
  const nCpc = Math.max(0, 1 - (averageCpc / (EFFICIENCY_BENCHMARKS.cpc * 10)))
  const nCpm = Math.max(0, 1 - (cpm / (EFFICIENCY_BENCHMARKS.cpm * 10)))

  // Weighted sum
  const score = (
    nRoas * EFFICIENCY_WEIGHTS.roas +
    nConvRate * EFFICIENCY_WEIGHTS.conversionRate +
    nCtr * EFFICIENCY_WEIGHTS.ctr +
    nCpc * EFFICIENCY_WEIGHTS.cpc +
    nCpm * EFFICIENCY_WEIGHTS.cpm
  ) * 100

  return Math.round(Math.min(100, Math.max(0, score)))
}

/**
 * Calculate health score based on consistency and sustainability
 * Unlike efficiency, this measures stability over time
 */
export function calculateHealthScore(
  summary: AdMetricsSummary,
  variance?: { roasVariance: number; spendVariance: number }
): number {
  const baseScore = calculateEfficiencyScore(summary)
  
  if (!variance) return baseScore

  // Penalize high variance (inconsistency)
  const variancePenalty = Math.min(20, (variance.roasVariance + variance.spendVariance) * 10)
  
  return Math.round(Math.max(0, baseScore - variancePenalty))
}

/**
 * Calculate growth potential score
 * Identifies how much room for improvement exists
 */
export function calculateGrowthPotential(summary: EnrichedMetricsSummary): number {
  const gaps: number[] = []

  // ROAS gap
  if (summary.averageRoaS < EFFICIENCY_BENCHMARKS.roas) {
    gaps.push((EFFICIENCY_BENCHMARKS.roas - summary.averageRoaS) / EFFICIENCY_BENCHMARKS.roas)
  }

  // Conversion rate gap
  if (summary.averageConvRate < EFFICIENCY_BENCHMARKS.conversionRate) {
    gaps.push((EFFICIENCY_BENCHMARKS.conversionRate - summary.averageConvRate) / EFFICIENCY_BENCHMARKS.conversionRate)
  }

  // CTR gap
  if (summary.averageCtr < EFFICIENCY_BENCHMARKS.ctr) {
    gaps.push((EFFICIENCY_BENCHMARKS.ctr - summary.averageCtr) / EFFICIENCY_BENCHMARKS.ctr)
  }

  if (gaps.length === 0) return 0

  // Average gap represents growth potential
  const avgGap = gaps.reduce((sum, g) => sum + g, 0) / gaps.length
  return Math.round(Math.min(100, avgGap * 100))
}

/**
 * Get detailed efficiency breakdown for visualization
 */
export function getEfficiencyBreakdown(summary: AdMetricsSummary): EfficiencyBreakdown[] {
  const { totalSpend, totalClicks, totalConversions, totalImpressions, averageRoaS, averageCpc } = summary
  
  if (totalSpend === 0) return []

  const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0
  const convRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0
  const cpm = totalImpressions > 0 ? (totalSpend / totalImpressions) * 1000 : 0

  return [
    {
      dimension: 'ROAS',
      score: Math.min(100, (averageRoaS / EFFICIENCY_BENCHMARKS.roas) * 100),
      weight: EFFICIENCY_WEIGHTS.roas,
      benchmark: EFFICIENCY_BENCHMARKS.roas,
    },
    {
      dimension: 'Conv Rate',
      score: Math.min(100, (convRate / EFFICIENCY_BENCHMARKS.conversionRate) * 100),
      weight: EFFICIENCY_WEIGHTS.conversionRate,
      benchmark: EFFICIENCY_BENCHMARKS.conversionRate,
    },
    {
      dimension: 'CTR',
      score: Math.min(100, (ctr / EFFICIENCY_BENCHMARKS.ctr) * 100),
      weight: EFFICIENCY_WEIGHTS.ctr,
      benchmark: EFFICIENCY_BENCHMARKS.ctr,
    },
    {
      dimension: 'CPC',
      score: Math.max(0, (1 - averageCpc / (EFFICIENCY_BENCHMARKS.cpc * 10)) * 100),
      weight: EFFICIENCY_WEIGHTS.cpc,
      benchmark: EFFICIENCY_BENCHMARKS.cpc,
    },
    {
      dimension: 'CPM',
      score: Math.max(0, (1 - cpm / (EFFICIENCY_BENCHMARKS.cpm * 10)) * 100),
      weight: EFFICIENCY_WEIGHTS.cpm,
      benchmark: EFFICIENCY_BENCHMARKS.cpm,
    },
  ]
}

/**
 * Enrich a summary with all calculated metrics
 */
export function enrichSummaryWithMetrics(summary: AdMetricsSummary): EnrichedMetricsSummary {
  const { totalSpend, totalRevenue, totalClicks, totalConversions, totalImpressions } = summary
  
  const aov = totalConversions > 0 ? totalRevenue / totalConversions : 0
  const rpc = totalClicks > 0 ? totalRevenue / totalClicks : 0
  const roi = totalSpend > 0 ? (totalRevenue - totalSpend) / totalSpend : 0
  const cpa = totalConversions > 0 ? totalSpend / totalConversions : 0
  const cpm = totalImpressions > 0 ? (totalSpend / totalImpressions) * 1000 : 0
  const mer = totalSpend > 0 ? totalRevenue / totalSpend : 0
  
  const efficiencyScore = calculateEfficiencyScore(summary)

  const enriched: EnrichedMetricsSummary = {
    ...summary,
    aov,
    rpc,
    roi,
    cpa,
    cpm,
    mer,
    efficiencyScore,
    healthScore: efficiencyScore, // Will be updated with variance data if available
    growthPotential: 0,
  }

  enriched.growthPotential = calculateGrowthPotential(enriched)

  return enriched
}
