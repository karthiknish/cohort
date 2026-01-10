// =============================================================================
// BUDGET OPTIMIZATION ALGORITHMS
// =============================================================================

import type {
  AdMetricsSummary,
  EnrichedMetricsSummary,
  BudgetAllocation,
  AlgorithmicInsight,
} from './types'
import { enrichSummaryWithMetrics } from './efficiency'

/**
 * Budget allocation strategies
 */
export type AllocationStrategy =
  | 'maximize_roas'      // Shift budget to highest ROAS platforms
  | 'maximize_volume'    // Shift budget to platforms with best CPAs
  | 'balanced'           // Balance between efficiency and volume
  | 'growth'             // Prioritize platforms with growth potential

/**
 * Calculate optimal budget allocation across platforms
 */
export function calculateOptimalAllocation(
  summaries: AdMetricsSummary[],
  strategy: AllocationStrategy = 'balanced',
  totalBudget?: number
): BudgetAllocation[] {
  if (summaries.length === 0) return []

  const enriched = summaries.map(enrichSummaryWithMetrics)
  const currentTotal = enriched.reduce((sum, s) => sum + s.totalSpend, 0)
  const budget = totalBudget ?? currentTotal

  if (budget === 0) return []

  // Calculate scores based on strategy
  const scored = enriched.map(summary => {
    let score: number

    switch (strategy) {
      case 'maximize_roas':
        score = summary.averageRoaS * 100
        break
      case 'maximize_volume':
        score = summary.cpa > 0 ? (100 / summary.cpa) * 10 : 0
        break
      case 'growth':
        score = summary.efficiencyScore * 0.5 + summary.growthPotential * 0.5
        break
      case 'balanced':
      default:
        score = summary.efficiencyScore * 0.6 + (summary.averageRoaS * 10) * 0.4
        break
    }

    return { summary, score }
  })

  // Normalize scores to get allocation percentages
  const totalScore = scored.reduce((sum, s) => sum + Math.max(0, s.score), 0)
  if (totalScore === 0) {
    // Equal distribution if no meaningful scores
    const equalShare = budget / summaries.length
    return enriched.map(s => ({
      providerId: s.providerId,
      currentSpend: s.totalSpend,
      recommendedSpend: equalShare,
      changePercent: s.totalSpend > 0
        ? ((equalShare - s.totalSpend) / s.totalSpend) * 100
        : 0,
      reason: 'Equal distribution (insufficient data for optimization)',
      expectedRoasChange: 0,
    }))
  }

  return scored.map(({ summary, score }) => {
    const allocationPercent = score / totalScore
    const recommendedSpend = budget * allocationPercent
    const change = recommendedSpend - summary.totalSpend
    const changePercent = summary.totalSpend > 0
      ? (change / summary.totalSpend) * 100
      : 0

    // Estimate ROAS change based on reallocation
    // Platforms getting more budget may see diminishing returns
    const expectedRoasChange = changePercent > 0
      ? Math.max(-10, -changePercent * 0.1)  // More spend = potential slight ROAS decrease
      : Math.min(15, -changePercent * 0.15)   // Less spend on inefficient = slight ROAS increase

    const reason = generateAllocationReason(summary, changePercent, strategy)

    return {
      providerId: summary.providerId,
      currentSpend: summary.totalSpend,
      recommendedSpend,
      changePercent,
      reason,
      expectedRoasChange,
    }
  })
}

/**
 * Generate human-readable reason for allocation change
 */
function generateAllocationReason(
  summary: EnrichedMetricsSummary,
  changePercent: number,
  strategy: AllocationStrategy
): string {
  const direction = changePercent > 5 ? 'Increase' : changePercent < -5 ? 'Decrease' : 'Maintain'
  const platformName = formatProviderName(summary.providerId)

  if (direction === 'Maintain') {
    return `Current ${platformName} allocation is optimal.`
  }

  switch (strategy) {
    case 'maximize_roas':
      return changePercent > 0
        ? `${platformName} shows ${summary.averageRoaS.toFixed(1)}x ROAS - above average performance.`
        : `${platformName} ROAS (${summary.averageRoaS.toFixed(1)}x) underperforms - reallocate to higher performers.`
    case 'maximize_volume':
      return changePercent > 0
        ? `${platformName} has efficient CPA ($${summary.cpa.toFixed(0)}) - good for volume scaling.`
        : `${platformName} CPA ($${summary.cpa.toFixed(0)}) too high for volume focus.`
    case 'growth':
      return changePercent > 0
        ? `${platformName} shows ${summary.growthPotential}% growth potential.`
        : `${platformName} is near optimal - limited growth opportunity.`
    default:
      return changePercent > 0
        ? `${platformName} efficiency score (${summary.efficiencyScore}) justifies increased investment.`
        : `Reallocate from ${platformName} to better-performing channels.`
  }
}

/**
 * Format provider name for display
 */
function formatProviderName(providerId: string): string {
  const names: Record<string, string> = {
    google: 'Google Ads',
    facebook: 'Meta Ads',
    meta: 'Meta Ads',
    linkedin: 'LinkedIn Ads',
    tiktok: 'TikTok Ads',
  }
  return names[providerId.toLowerCase()] || providerId
}

/**
 * Generate budget-related insights
 */
export function generateBudgetInsights(
  summaries: AdMetricsSummary[]
): AlgorithmicInsight[] {
  if (summaries.length < 2) return []

  const insights: AlgorithmicInsight[] = []
  const enriched = summaries.map(enrichSummaryWithMetrics)

  // Sort by ROAS
  const sortedByRoas = [...enriched].sort((a, b) => b.averageRoaS - a.averageRoaS)
  const best = sortedByRoas[0]
  const worst = sortedByRoas[sortedByRoas.length - 1]

  // Cross-platform reallocation insight
  if (best.averageRoaS > worst.averageRoaS * 1.5 && worst.totalSpend > 100) {
    const roasMultiple = (best.averageRoaS / worst.averageRoaS).toFixed(1)
    insights.push({
      id: 'budget-reallocation-1',
      type: 'budget',
      level: 'info',
      category: 'Cross-Platform Optimization',
      title: 'Budget Reallocation Opportunity',
      message: `${formatProviderName(best.providerId)} outperforms ${formatProviderName(worst.providerId)} by ${roasMultiple}x in ROAS.`,
      suggestion: `Consider shifting 10-20% of budget from ${formatProviderName(worst.providerId)} to ${formatProviderName(best.providerId)}.`,
      impact: 'high',
      effort: 'low',
      metrics: {
        bestRoas: best.averageRoaS,
        worstRoas: worst.averageRoaS,
        potentialSavings: worst.totalSpend * 0.15,
      },
      relatedProviders: [best.providerId, worst.providerId],
    })
  }

  // Efficiency-based scaling insight
  const highEfficiency = enriched.filter(s => s.efficiencyScore > 70)
  if (highEfficiency.length > 0) {
    const topPerformer = highEfficiency[0]
    insights.push({
      id: 'budget-scale-1',
      type: 'budget',
      level: 'success',
      category: 'Scaling Opportunity',
      title: 'High-Efficiency Platform Detected',
      message: `${formatProviderName(topPerformer.providerId)} has an efficiency score of ${topPerformer.efficiencyScore}/100.`,
      suggestion: 'This platform is a good candidate for budget scaling while monitoring efficiency metrics.',
      impact: 'medium',
      effort: 'low',
      metrics: {
        efficiencyScore: topPerformer.efficiencyScore,
        currentSpend: topPerformer.totalSpend,
      },
      relatedProviders: [topPerformer.providerId],
    })
  }

  // Diminishing returns warning
  const highSpendLowRoas = enriched.filter(
    s => s.totalSpend > 1000 && s.averageRoaS < 1.5
  )
  for (const summary of highSpendLowRoas) {
    insights.push({
      id: `budget-warning-${summary.providerId}`,
      type: 'budget',
      level: 'warning',
      category: 'Efficiency Alert',
      title: 'Potential Overspend Detected',
      message: `${formatProviderName(summary.providerId)} has $${summary.totalSpend.toFixed(0)} spend but only ${summary.averageRoaS.toFixed(1)}x ROAS.`,
      suggestion: 'Consider reducing spend or pausing underperforming campaigns to improve efficiency.',
      impact: 'high',
      effort: 'medium',
      metrics: {
        spend: summary.totalSpend,
        roas: summary.averageRoaS,
        wastedSpend: summary.totalSpend * (1 - summary.averageRoaS),
      },
      relatedProviders: [summary.providerId],
    })
  }

  return insights
}

/**
 * Legacy compatibility wrapper - generates a cross-platform budget reallocation insight
 */
export function getGlobalBudgetSuggestions(summaries: AdMetricsSummary[]): AlgorithmicInsight[] {
  return generateBudgetInsights(summaries).filter(i => i.title === 'Budget Reallocation Opportunity')
}

/**
 * Calculate projected impact of budget changes
 */
export function projectBudgetImpact(
  allocations: BudgetAllocation[],
  summaries: AdMetricsSummary[]
): { projectedRevenue: number; projectedRoas: number; revenueChange: number } {
  let projectedRevenue = 0
  let totalProjectedSpend = 0

  for (const allocation of allocations) {
    const summary = summaries.find(s => s.providerId === allocation.providerId)
    if (!summary) continue

    // Project revenue based on current ROAS adjusted for diminishing returns
    const roasAdjustment = 1 + (allocation.expectedRoasChange / 100)
    const adjustedRoas = summary.averageRoaS * roasAdjustment
    projectedRevenue += allocation.recommendedSpend * adjustedRoas
    totalProjectedSpend += allocation.recommendedSpend
  }

  const currentRevenue = summaries.reduce((sum, s) => sum + s.totalRevenue, 0)
  const projectedRoas = totalProjectedSpend > 0 ? projectedRevenue / totalProjectedSpend : 0

  return {
    projectedRevenue,
    projectedRoas,
    revenueChange: projectedRevenue - currentRevenue,
  }
}
