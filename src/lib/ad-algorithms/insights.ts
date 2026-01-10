// =============================================================================
// INSIGHT GENERATION ALGORITHMS
// =============================================================================

import { formatCurrency } from '../utils'
import type {
  AdMetricsSummary,
  EnrichedMetricsSummary,
  AlgorithmicInsight,
  TrendResult,
  FunnelAnalysis,
  BenchmarkComparison,
} from './types'
import { enrichSummaryWithMetrics } from './efficiency'

let insightIdCounter = 0
function generateInsightId(type: string): string {
  return `${type}-${++insightIdCounter}-${Date.now()}`
}

/**
 * Generate efficiency-related insights
 */
export function generateEfficiencyInsights(summary: AdMetricsSummary): AlgorithmicInsight[] {
  const insights: AlgorithmicInsight[] = []
  const enriched = enrichSummaryWithMetrics(summary)
  const {
    totalSpend,
    totalRevenue,
    totalClicks,
    totalConversions,
    averageRoaS,
    averageCpc,
    efficiencyScore,
    cpa,
    roi,
  } = enriched

  if (totalSpend === 0) return []

  const convRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0
  const providerName = formatProviderName(summary.providerId)

  // High ROAS success
  if (averageRoaS > 4) {
    insights.push({
      id: generateInsightId('efficiency'),
      type: 'efficiency',
      level: 'success',
      category: 'Performance Excellence',
      title: 'Exceptional ROAS Performance',
      message: `${providerName} is delivering ${averageRoaS.toFixed(2)}x return on ad spend with ${roi > 0 ? '+' : ''}${(roi * 100).toFixed(0)}% ROI.`,
      suggestion: 'This platform is a prime candidate for budget scaling. Consider increasing spend by 15-25% incrementally.',
      score: 90,
      impact: 'high',
      effort: 'low',
      metrics: {
        roas: averageRoaS,
        roi: roi * 100,
        spend: totalSpend,
        revenue: totalRevenue,
      },
    })
  } else if (averageRoaS < 1.5 && totalSpend > 100) {
    insights.push({
      id: generateInsightId('efficiency'),
      type: 'efficiency',
      level: 'critical',
      category: 'Efficiency Alert',
      title: 'Below Break-Even Performance',
      message: `${providerName} ROAS is ${averageRoaS.toFixed(2)}x - you're losing ${formatCurrency(totalSpend - totalRevenue)} on this platform.`,
      suggestion: 'Immediately audit campaign targeting and pause lowest-performing ad sets. Consider restructuring your funnel.',
      score: 25,
      impact: 'high',
      effort: 'medium',
      metrics: {
        roas: averageRoaS,
        loss: totalSpend - totalRevenue,
        spend: totalSpend,
      },
    })
  } else if (averageRoaS >= 1.5 && averageRoaS <= 2.5) {
    insights.push({
      id: generateInsightId('efficiency'),
      type: 'efficiency',
      level: 'info',
      category: 'Optimization Opportunity',
      title: 'Moderate ROAS - Room for Improvement',
      message: `${providerName} is returning ${averageRoaS.toFixed(2)}x, which is profitable but could be optimized.`,
      suggestion: 'Focus on improving conversion rate through landing page optimization and audience refinement.',
      score: 55,
      impact: 'medium',
      effort: 'medium',
      metrics: { roas: averageRoaS, convRate },
    })
  }

  // Efficiency score insights
  if (efficiencyScore < 40 && totalSpend > 200) {
    insights.push({
      id: generateInsightId('efficiency'),
      type: 'efficiency',
      level: 'critical',
      category: 'System Health',
      title: 'Low Overall Efficiency Score',
      message: `${providerName} efficiency score is ${efficiencyScore}/100, indicating systemic performance issues.`,
      suggestion: 'A comprehensive audit is recommended: review creative performance, audience targeting, and landing page experience.',
      score: efficiencyScore,
      impact: 'high',
      effort: 'high',
    })
  } else if (efficiencyScore > 80) {
    insights.push({
      id: generateInsightId('efficiency'),
      type: 'efficiency',
      level: 'success',
      category: 'Top Performer',
      title: 'Excellent Efficiency Score',
      message: `${providerName} is operating at ${efficiencyScore}/100 efficiency - top-tier performance.`,
      suggestion: 'Maintain current strategies while exploring incremental scaling opportunities.',
      score: efficiencyScore,
      impact: 'medium',
      effort: 'low',
    })
  }

  return insights
}

/**
 * Generate creative/ad quality insights
 */
export function generateCreativeInsights(summary: AdMetricsSummary): AlgorithmicInsight[] {
  const insights: AlgorithmicInsight[] = []
  const { totalSpend, totalClicks, totalImpressions, averageCpc, providerId } = summary

  if (totalSpend === 0 || totalImpressions === 0) return []

  const ctr = (totalClicks / totalImpressions) * 100
  const providerName = formatProviderName(providerId)

  // High CPC with low CTR indicates poor ad relevance
  if (averageCpc > 5 && ctr < 1) {
    insights.push({
      id: generateInsightId('creative'),
      type: 'creative',
      level: 'warning',
      category: 'Ad Quality',
      title: 'High Cost, Low Engagement',
      message: `${providerName} ads have ${formatCurrency(averageCpc)} CPC but only ${ctr.toFixed(2)}% CTR.`,
      suggestion: 'Test new creative variants with stronger hooks, clearer value propositions, and more compelling CTAs.',
      score: 40,
      impact: 'high',
      effort: 'medium',
      metrics: { cpc: averageCpc, ctr },
    })
  }

  // Very low CTR
  if (ctr < 0.3 && totalImpressions > 10000) {
    insights.push({
      id: generateInsightId('creative'),
      type: 'creative',
      level: 'critical',
      category: 'Ad Relevance',
      title: 'Critically Low Click-Through Rate',
      message: `${providerName} CTR is only ${ctr.toFixed(2)}% - your ads may not be resonating with the audience.`,
      suggestion: 'Consider a complete creative refresh. Test different ad formats, messaging angles, and visual styles.',
      score: 20,
      impact: 'high',
      effort: 'high',
      metrics: { ctr, impressions: totalImpressions },
    })
  }

  // Good CTR
  if (ctr > 2) {
    insights.push({
      id: generateInsightId('creative'),
      type: 'creative',
      level: 'success',
      category: 'Ad Engagement',
      title: 'Strong Click-Through Rate',
      message: `${providerName} ads are achieving ${ctr.toFixed(2)}% CTR - above industry average.`,
      suggestion: 'Your creative is working well. Focus on scaling reach while monitoring frequency.',
      score: 85,
      impact: 'medium',
      effort: 'low',
      metrics: { ctr },
    })
  }

  return insights
}

/**
 * Generate audience/targeting insights
 */
export function generateAudienceInsights(summary: AdMetricsSummary): AlgorithmicInsight[] {
  const insights: AlgorithmicInsight[] = []
  const { totalClicks, totalConversions, totalSpend, providerId } = summary

  if (totalSpend === 0) return []

  const convRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0
  const providerName = formatProviderName(providerId)

  // High traffic, low conversion
  if (totalClicks > 500 && convRate < 0.5) {
    insights.push({
      id: generateInsightId('audience'),
      type: 'audience',
      level: 'warning',
      category: 'Traffic Quality',
      title: 'High Traffic, Low Conversion',
      message: `${providerName} drove ${totalClicks.toLocaleString()} clicks but only ${convRate.toFixed(2)}% converted.`,
      suggestion: 'Your audience targeting may be too broad. Consider implementing lookalike audiences or interest-based refinement.',
      score: 35,
      impact: 'high',
      effort: 'medium',
      metrics: { clicks: totalClicks, convRate },
    })
  }

  // Good conversion rate
  if (convRate > 5 && totalClicks > 100) {
    insights.push({
      id: generateInsightId('audience'),
      type: 'audience',
      level: 'success',
      category: 'Audience Quality',
      title: 'High-Quality Traffic',
      message: `${providerName} traffic is converting at ${convRate.toFixed(2)}% - well above average.`,
      suggestion: 'Your targeting is effective. Consider expanding to similar audience segments.',
      score: 90,
      impact: 'medium',
      effort: 'low',
      metrics: { convRate, conversions: totalConversions },
    })
  }

  return insights
}

/**
 * Legacy compatibility wrapper - generates a standard set of insights for a single provider
 */
export function calculateAlgorithmicInsights(summary: AdMetricsSummary): AlgorithmicInsight[] {
  const insights: AlgorithmicInsight[] = []

  insights.push(...generateEfficiencyInsights(summary))
  insights.push(...generateCreativeInsights(summary))
  insights.push(...generateAudienceInsights(summary))

  return combineInsights(insights)
}

/**
 * Generate trend-based insights
 */
export function generateTrendInsights(
  trends: Record<string, TrendResult>,
  providerId: string
): AlgorithmicInsight[] {
  const insights: AlgorithmicInsight[] = []
  const providerName = formatProviderName(providerId)

  // ROAS trend
  const roasTrend = trends['roas']
  if (roasTrend) {
    if (roasTrend.direction === 'down' && roasTrend.momentum < 40) {
      insights.push({
        id: generateInsightId('trend'),
        type: 'trend',
        level: 'warning',
        category: 'Performance Trend',
        title: 'Declining ROAS Trend',
        message: `${providerName} ROAS has been declining with ${roasTrend.momentum}/100 momentum.`,
        suggestion: 'Investigate recent changes in targeting, creative fatigue, or market conditions.',
        impact: 'high',
        effort: 'medium',
        metrics: { momentum: roasTrend.momentum, velocity: roasTrend.velocity },
      })
    } else if (roasTrend.direction === 'up' && roasTrend.momentum > 60) {
      insights.push({
        id: generateInsightId('trend'),
        type: 'trend',
        level: 'success',
        category: 'Performance Trend',
        title: 'Improving ROAS Trend',
        message: `${providerName} ROAS is trending upward with strong momentum (${roasTrend.momentum}/100).`,
        suggestion: 'Current optimizations are working. Consider accelerating successful strategies.',
        impact: 'medium',
        effort: 'low',
        metrics: { momentum: roasTrend.momentum },
      })
    }
  }

  // Spend trend
  const spendTrend = trends['spend']
  if (spendTrend && spendTrend.anomalies.length > 0) {
    const highSeverity = spendTrend.anomalies.filter(a => a.severity === 'high')
    if (highSeverity.length > 0) {
      insights.push({
        id: generateInsightId('trend'),
        type: 'trend',
        level: 'info',
        category: 'Spend Anomaly',
        title: 'Unusual Spend Pattern Detected',
        message: `${providerName} had ${highSeverity.length} significant spend anomaly(s) in the period.`,
        suggestion: 'Review these dates for campaign changes or platform issues.',
        impact: 'low',
        effort: 'low',
        metrics: { anomalyCount: highSeverity.length },
      })
    }
  }

  return insights
}

/**
 * Generate funnel-based insights
 */
export function generateFunnelInsights(
  analysis: FunnelAnalysis,
  providerId: string
): AlgorithmicInsight[] {
  const insights: AlgorithmicInsight[] = []
  const providerName = formatProviderName(providerId)

  if (analysis.bottleneckStage && analysis.biggestDropOff) {
    insights.push({
      id: generateInsightId('funnel'),
      type: 'funnel',
      level: analysis.biggestDropOff.rate > 98 ? 'critical' : 'warning',
      category: 'Funnel Optimization',
      title: `Bottleneck at ${analysis.bottleneckStage}`,
      message: `${providerName} loses ${analysis.biggestDropOff.rate.toFixed(1)}% of users at the ${analysis.bottleneckStage} stage.`,
      suggestion: analysis.recommendations[0] || 'Focus optimization efforts on this funnel stage.',
      impact: 'high',
      effort: 'medium',
      metrics: { dropOffRate: analysis.biggestDropOff.rate },
    })
  }

  return insights
}

/**
 * Generate benchmark-based insights
 */
export function generateBenchmarkInsights(
  comparisons: BenchmarkComparison[],
  providerId: string
): AlgorithmicInsight[] {
  const insights: AlgorithmicInsight[] = []
  const providerName = formatProviderName(providerId)

  const belowAverage = comparisons.filter(c => c.status === 'below')
  const excellent = comparisons.filter(c => c.status === 'excellent')

  if (belowAverage.length >= 3) {
    insights.push({
      id: generateInsightId('benchmark'),
      type: 'benchmark',
      level: 'warning',
      category: 'Industry Comparison',
      title: 'Multiple Metrics Below Benchmark',
      message: `${providerName} underperforms industry benchmarks in ${belowAverage.length} key metrics.`,
      suggestion: `Focus on improving: ${belowAverage.map(b => b.metric).join(', ')}.`,
      impact: 'high',
      effort: 'high',
      metrics: { belowCount: belowAverage.length },
    })
  }

  if (excellent.length >= 2) {
    insights.push({
      id: generateInsightId('benchmark'),
      type: 'benchmark',
      level: 'success',
      category: 'Industry Leader',
      title: 'Above-Average Performance',
      message: `${providerName} excels in ${excellent.map(e => e.metric).join(' and ')}.`,
      suggestion: 'Leverage these strengths as competitive advantages.',
      impact: 'medium',
      effort: 'low',
      metrics: { excellentCount: excellent.length },
    })
  }

  return insights
}

/**
 * Helper to format provider names
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
 * Combine and prioritize all insights
 */
export function combineInsights(
  allInsights: AlgorithmicInsight[]
): AlgorithmicInsight[] {
  // Sort by level priority, then by impact
  const levelOrder = { critical: 0, warning: 1, info: 2, success: 3 }
  const impactOrder = { high: 0, medium: 1, low: 2 }

  return allInsights.sort((a, b) => {
    const levelDiff = levelOrder[a.level] - levelOrder[b.level]
    if (levelDiff !== 0) return levelDiff

    const impactA = impactOrder[a.impact || 'medium']
    const impactB = impactOrder[b.impact || 'medium']
    return impactA - impactB
  })
}
