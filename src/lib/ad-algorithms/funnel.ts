// =============================================================================
// FUNNEL ANALYSIS ALGORITHMS
// =============================================================================

import type {
  AdMetricsSummary,
  FunnelStage,
  FunnelAnalysis,
} from './types'

/**
 * Standard ad funnel stages
 */
export const FUNNEL_STAGES = [
  'impressions',
  'clicks',
  'conversions',
  'revenue',
] as const

export type FunnelStageName = typeof FUNNEL_STAGES[number]

/**
 * Build funnel analysis from metrics summary
 */
export function analyzeFunnel(summary: AdMetricsSummary): FunnelAnalysis {
  const { totalImpressions, totalClicks, totalConversions, totalRevenue, totalSpend } = summary

  // Build funnel stages
  const stageValues = [
    { name: 'Impressions', value: totalImpressions },
    { name: 'Clicks', value: totalClicks },
    { name: 'Conversions', value: totalConversions },
  ]

  const stages: FunnelStage[] = stageValues.map((stage, index) => {
    const previousValue = index === 0 ? stage.value : stageValues[index - 1]!.value
    const dropOffRate = previousValue > 0 ? 1 - (stage.value / previousValue) : 0
    const costPerStage = stage.value > 0 ? totalSpend / stage.value : 0

    return {
      name: stage.name,
      value: stage.value,
      percentage: totalImpressions > 0 ? (stage.value / totalImpressions) * 100 : 0,
      dropOffRate: dropOffRate * 100,
      costPerStage,
    }
  })

  // Find bottleneck (highest drop-off that can be improved)
  let bottleneckStage: string | null = null
  let biggestDropOff: { stage: string; rate: number } | null = null
  let maxDropOff = 0

  for (let i = 1; i < stages.length; i++) {
    if (stages[i]!.dropOffRate > maxDropOff) {
      maxDropOff = stages[i]!.dropOffRate
      bottleneckStage = stages[i]!.name
      biggestDropOff = { stage: stages[i]!.name, rate: stages[i]!.dropOffRate }
    }
  }

  // Overall conversion rate
  const overallConversionRate = totalImpressions > 0 
    ? (totalConversions / totalImpressions) * 100 
    : 0

  // Generate recommendations
  const recommendations = generateFunnelRecommendations(stages, summary)

  return {
    stages,
    overallConversionRate,
    bottleneckStage,
    biggestDropOff,
    recommendations,
  }
}

/**
 * Generate actionable recommendations based on funnel analysis
 */
function generateFunnelRecommendations(
  stages: FunnelStage[],
  summary: AdMetricsSummary
): string[] {
  const recommendations: string[] = []
  const ctr = summary.totalImpressions > 0 
    ? (summary.totalClicks / summary.totalImpressions) * 100 
    : 0
  const convRate = summary.totalClicks > 0 
    ? (summary.totalConversions / summary.totalClicks) * 100 
    : 0

  // CTR recommendations
  if (ctr < 0.5) {
    recommendations.push(
      'Your CTR is very low (<0.5%). Consider refreshing ad creatives, improving headlines, or refining audience targeting.'
    )
  } else if (ctr < 1.0) {
    recommendations.push(
      'CTR is below average. Test different ad formats, images, or copy variations to improve engagement.'
    )
  }

  // Conversion rate recommendations
  if (convRate < 1.0 && summary.totalClicks > 100) {
    recommendations.push(
      'Conversion rate is low despite traffic. Audit your landing page for load speed, mobile responsiveness, and clear CTAs.'
    )
  } else if (convRate < 2.0 && summary.totalClicks > 500) {
    recommendations.push(
      'Consider A/B testing landing page elements like headlines, form length, and trust signals to improve conversions.'
    )
  }

  // Cost efficiency recommendations
  const cpa = summary.totalConversions > 0 ? summary.totalSpend / summary.totalConversions : 0
  if (cpa > 100 && summary.totalConversions > 0) {
    recommendations.push(
      `Your CPA ($${cpa.toFixed(2)}) is high. Consider narrowing audience targeting or implementing lookalike audiences.`
    )
  }

  // Drop-off specific recommendations
  const clickStage = stages.find(s => s.name === 'Clicks')
  if (clickStage && clickStage.dropOffRate > 98) {
    recommendations.push(
      'Impressions to clicks drop-off is severe. Your ad creative may not be resonating with your audience.'
    )
  }

  const conversionStage = stages.find(s => s.name === 'Conversions')
  if (conversionStage && conversionStage.dropOffRate > 95) {
    recommendations.push(
      'High drop-off from clicks to conversions suggests a disconnect between ad promise and landing page experience.'
    )
  }

  if (recommendations.length === 0) {
    recommendations.push(
      'Your funnel is performing well. Focus on scaling spend while monitoring efficiency metrics.'
    )
  }

  return recommendations
}

/**
 * Compare funnels across multiple providers
 */
export function compareFunnels(
  summaries: AdMetricsSummary[]
): { providerId: string; analysis: FunnelAnalysis }[] {
  return summaries.map(summary => ({
    providerId: summary.providerId,
    analysis: analyzeFunnel(summary),
  }))
}

/**
 * Get funnel chart data for visualization
 */
export function getFunnelChartData(analysis: FunnelAnalysis): {
  name: string
  value: number
  fill: string
  dropOff: number
}[] {
  const colors = ['#3b82f6', '#22c55e', '#f59e0b']
  
  return analysis.stages.map((stage, index) => ({
    name: stage.name,
    value: stage.value,
    fill: colors[index] || '#6b7280',
    dropOff: stage.dropOffRate,
  }))
}

/**
 * Calculate funnel efficiency score
 */
export function calculateFunnelEfficiency(analysis: FunnelAnalysis): number {
  const { stages } = analysis
  
  if (stages.length < 2) return 0

  // Calculate average retention across stages
  let totalRetention = 0
  let stageCount = 0

  for (let i = 1; i < stages.length; i++) {
    const retention = 100 - stages[i]!.dropOffRate
    totalRetention += retention
    stageCount++
  }

  const avgRetention = stageCount > 0 ? totalRetention / stageCount : 0

  // Score based on retention (higher is better)
  // 10% average retention = 50 score, 50% = 100
  return Math.min(100, Math.round(avgRetention * 2))
}
