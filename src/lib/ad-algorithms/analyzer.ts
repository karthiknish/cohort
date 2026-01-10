// =============================================================================
// PERFORMANCE ANALYZER - Main Orchestrator
// =============================================================================

import type {
  MetricDataPoint,
  AdMetricsSummary,
  EnrichedMetricsSummary,
  AlgorithmicInsight,
  TrendResult,
  FunnelAnalysis,
  BenchmarkComparison,
  ProviderComparisonData,
  EfficiencyBreakdown,
  BudgetAllocation,
} from './types'

import { enrichSummaryWithMetrics, getEfficiencyBreakdown } from './efficiency'
import { analyzeAllTrends, getTrendChartData } from './trends'
import { analyzeFunnel, getFunnelChartData, calculateFunnelEfficiency } from './funnel'
import { runBenchmarkAnalysis, getBenchmarkChartData, calculateBenchmarkScore } from './benchmarks'
import { calculateOptimalAllocation, generateBudgetInsights, projectBudgetImpact } from './budget'
import {
  generateEfficiencyInsights,
  generateCreativeInsights,
  generateAudienceInsights,
  generateTrendInsights,
  generateFunnelInsights,
  generateBenchmarkInsights,
  combineInsights,
} from './insights'

/**
 * Comprehensive performance analysis result
 */
export interface PerformanceAnalysis {
  // Summaries
  summaries: EnrichedMetricsSummary[]
  globalSummary: EnrichedMetricsSummary | null
  
  // Scores
  globalEfficiencyScore: number
  providerEfficiencyScores: Record<string, number>
  
  // Insights
  insights: AlgorithmicInsight[]
  criticalInsightsCount: number
  warningInsightsCount: number
  
  // Trends (per provider)
  trends: Record<string, Record<string, TrendResult>>
  
  // Funnel analysis (per provider)
  funnels: Record<string, FunnelAnalysis>
  
  // Benchmark comparisons (per provider)
  benchmarks: Record<string, BenchmarkComparison[]>
  benchmarkScores: Record<string, number>
  
  // Budget recommendations
  budgetAllocations: BudgetAllocation[]
  budgetProjection: { projectedRevenue: number; projectedRoas: number; revenueChange: number }
  
  // Chart data for visualizations
  chartData: {
    providerComparison: ProviderComparisonData[]
    efficiencyBreakdown: Record<string, EfficiencyBreakdown[]>
    trendCharts: Record<string, { date: string; actual: number; trend: number }[]>
    funnelCharts: Record<string, { name: string; value: number; fill: string; dropOff: number }[]>
    benchmarkCharts: Record<string, { metric: string; current: number; benchmark: number; percentile: number }[]>
  }
}

/**
 * Build summary from metric data points
 */
function buildSummary(
  providerId: string,
  dataPoints: MetricDataPoint[],
  accountId?: string | null
): AdMetricsSummary {
  const totals = dataPoints.reduce(
    (acc, d) => ({
      spend: acc.spend + d.spend,
      revenue: acc.revenue + d.revenue,
      clicks: acc.clicks + d.clicks,
      conversions: acc.conversions + d.conversions,
      impressions: acc.impressions + d.impressions,
    }),
    { spend: 0, revenue: 0, clicks: 0, conversions: 0, impressions: 0 }
  )

  const averageRoaS = totals.spend > 0 ? totals.revenue / totals.spend : 0
  const averageCpc = totals.clicks > 0 ? totals.spend / totals.clicks : 0
  const averageCtr = totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0
  const averageConvRate = totals.clicks > 0 ? (totals.conversions / totals.clicks) * 100 : 0

  return {
    providerId,
    accountId,
    totalSpend: totals.spend,
    totalRevenue: totals.revenue,
    totalClicks: totals.clicks,
    totalConversions: totals.conversions,
    totalImpressions: totals.impressions,
    averageRoaS,
    averageCpc,
    averageCtr,
    averageConvRate,
    period: 'analyzed',
    dayCount: new Set(dataPoints.map(d => d.date)).size,
  }
}

/**
 * Main analysis function - analyzes all metrics and returns comprehensive results
 */
export function analyzeAdPerformance(
  dataPoints: MetricDataPoint[]
): PerformanceAnalysis {
  // Group by provider
  const byProvider = new Map<string, MetricDataPoint[]>()
  for (const point of dataPoints) {
    const existing = byProvider.get(point.providerId) || []
    existing.push(point)
    byProvider.set(point.providerId, existing)
  }

  const providers = Array.from(byProvider.keys())

  // Build and enrich summaries
  const summaries: EnrichedMetricsSummary[] = providers.map(providerId => {
    const points = byProvider.get(providerId) || []
    const summary = buildSummary(providerId, points)
    return enrichSummaryWithMetrics(summary)
  })

  // Build global summary
  const globalSummary = dataPoints.length > 0
    ? enrichSummaryWithMetrics(buildSummary('all', dataPoints))
    : null

  // Calculate efficiency scores
  const providerEfficiencyScores: Record<string, number> = {}
  for (const summary of summaries) {
    providerEfficiencyScores[summary.providerId] = summary.efficiencyScore
  }

  // Weighted global efficiency score
  const totalSpend = summaries.reduce((sum, s) => sum + s.totalSpend, 0)
  const globalEfficiencyScore = totalSpend > 0
    ? Math.round(
        summaries.reduce((sum, s) => sum + s.efficiencyScore * s.totalSpend, 0) / totalSpend
      )
    : 0

  // Analyze trends per provider
  const trends: Record<string, Record<string, TrendResult>> = {}
  for (const [providerId, points] of byProvider.entries()) {
    trends[providerId] = analyzeAllTrends(points)
  }

  // Analyze funnels per provider
  const funnels: Record<string, FunnelAnalysis> = {}
  for (const summary of summaries) {
    funnels[summary.providerId] = analyzeFunnel(summary)
  }

  // Benchmark comparisons per provider
  const benchmarks: Record<string, BenchmarkComparison[]> = {}
  const benchmarkScores: Record<string, number> = {}
  for (const summary of summaries) {
    benchmarks[summary.providerId] = runBenchmarkAnalysis(summary)
    benchmarkScores[summary.providerId] = calculateBenchmarkScore(benchmarks[summary.providerId])
  }

  // Generate all insights
  const allInsights: AlgorithmicInsight[] = []

  // Per-provider insights
  for (const summary of summaries) {
    allInsights.push(...generateEfficiencyInsights(summary))
    allInsights.push(...generateCreativeInsights(summary))
    allInsights.push(...generateAudienceInsights(summary))
    
    if (trends[summary.providerId]) {
      allInsights.push(...generateTrendInsights(trends[summary.providerId], summary.providerId))
    }
    
    if (funnels[summary.providerId]) {
      allInsights.push(...generateFunnelInsights(funnels[summary.providerId], summary.providerId))
    }
    
    if (benchmarks[summary.providerId]) {
      allInsights.push(...generateBenchmarkInsights(benchmarks[summary.providerId], summary.providerId))
    }
  }

  // Cross-platform insights
  allInsights.push(...generateBudgetInsights(summaries))

  // Combine and prioritize
  const insights = combineInsights(allInsights)
  const criticalInsightsCount = insights.filter(i => i.level === 'critical').length
  const warningInsightsCount = insights.filter(i => i.level === 'warning').length

  // Budget allocations
  const budgetAllocations = calculateOptimalAllocation(summaries)
  const budgetProjection = projectBudgetImpact(budgetAllocations, summaries)

  // Chart data
  const chartData = {
    providerComparison: buildProviderComparisonData(summaries),
    efficiencyBreakdown: {} as Record<string, EfficiencyBreakdown[]>,
    trendCharts: {} as Record<string, { date: string; actual: number; trend: number }[]>,
    funnelCharts: {} as Record<string, { name: string; value: number; fill: string; dropOff: number }[]>,
    benchmarkCharts: {} as Record<string, { metric: string; current: number; benchmark: number; percentile: number }[]>,
  }

  for (const summary of summaries) {
    chartData.efficiencyBreakdown[summary.providerId] = getEfficiencyBreakdown(summary)
  }

  for (const [providerId, points] of byProvider.entries()) {
    chartData.trendCharts[providerId] = getTrendChartData(points, 'spend')
  }

  for (const [providerId, funnel] of Object.entries(funnels)) {
    chartData.funnelCharts[providerId] = getFunnelChartData(funnel)
  }

  for (const [providerId, comparison] of Object.entries(benchmarks)) {
    chartData.benchmarkCharts[providerId] = getBenchmarkChartData(comparison)
  }

  return {
    summaries,
    globalSummary,
    globalEfficiencyScore,
    providerEfficiencyScores,
    insights,
    criticalInsightsCount,
    warningInsightsCount,
    trends,
    funnels,
    benchmarks,
    benchmarkScores,
    budgetAllocations,
    budgetProjection,
    chartData,
  }
}

/**
 * Build provider comparison data for visualization
 */
function buildProviderComparisonData(summaries: EnrichedMetricsSummary[]): ProviderComparisonData[] {
  const colors: Record<string, string> = {
    google: '#4285F4',
    facebook: '#1877F2',
    meta: '#1877F2',
    linkedin: '#0A66C2',
    tiktok: '#000000',
  }

  const names: Record<string, string> = {
    google: 'Google Ads',
    facebook: 'Meta Ads',
    meta: 'Meta Ads',
    linkedin: 'LinkedIn Ads',
    tiktok: 'TikTok Ads',
  }

  return summaries.map(s => ({
    providerId: s.providerId,
    displayName: names[s.providerId.toLowerCase()] || s.providerId,
    color: colors[s.providerId.toLowerCase()] || '#6B7280',
    metrics: {
      spend: s.totalSpend,
      revenue: s.totalRevenue,
      roas: s.averageRoaS,
      ctr: s.averageCtr,
      cpc: s.averageCpc,
      conversionRate: s.averageConvRate,
      efficiencyScore: s.efficiencyScore,
    },
  }))
}
