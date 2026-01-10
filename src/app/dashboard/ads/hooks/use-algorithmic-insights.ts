'use client'

import { useMemo } from 'react'

import type { MetricRecord, ProviderSummary } from '../components/types'
import {
  analyzeAdPerformance,
  type PerformanceAnalysis,
  type AlgorithmicInsight,
  type MetricDataPoint,
} from '@/lib/ad-algorithms'

// =============================================================================
// TYPES
// =============================================================================

export interface UseAlgorithmicInsightsOptions {
  /** Processed metrics from useAdsMetrics */
  metrics: MetricRecord[]
  /** Provider summaries calculated from metrics */
  providerSummaries: Record<string, ProviderSummary>
  /** Whether metrics are currently loading */
  loading?: boolean
}

export interface UseAlgorithmicInsightsReturn {
  /** Full performance analysis with all algorithms */
  analysis: PerformanceAnalysis | null
  /** All generated insights across platforms */
  insights: AlgorithmicInsight[]
  /** Per-provider insights */
  providerInsights: Record<string, AlgorithmicInsight[]>
  /** Cross-platform budget reallocation suggestions */
  budgetSuggestions: AlgorithmicInsight[]
  /** Overall efficiency score (0-100) */
  globalEfficiencyScore: number
  /** Per-provider efficiency scores */
  providerEfficiencyScores: Record<string, number>
  /** Whether there are any critical insights */
  hasCriticalInsights: boolean
  /** Whether there are any warning insights */
  hasWarningInsights: boolean
  /** Count of insights by level */
  insightCounts: {
    success: number
    warning: number
    info: number
    critical: number
  }
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function convertToDataPoints(metrics: MetricRecord[]): MetricDataPoint[] {
  return metrics.map(m => ({
    date: m.date,
    providerId: m.providerId,
    accountId: m.accountId,
    spend: m.spend,
    revenue: m.revenue ?? 0,
    clicks: m.clicks,
    conversions: m.conversions,
    impressions: m.impressions,
  }))
}

// =============================================================================
// HOOK
// =============================================================================

/**
 * Hook for calculating algorithmic insights from ad metrics
 * Uses the modular ad-algorithms library to generate comprehensive performance analysis
 */
export function useAlgorithmicInsights(
  options: UseAlgorithmicInsightsOptions
): UseAlgorithmicInsightsReturn {
  const { metrics, providerSummaries, loading } = options

  // Run the full performance analysis
  const analysis = useMemo<PerformanceAnalysis | null>(() => {
    if (loading || metrics.length === 0) return null
    
    const dataPoints = convertToDataPoints(metrics)
    return analyzeAdPerformance(dataPoints)
  }, [metrics, loading])

  // Extract insights
  const insights = useMemo<AlgorithmicInsight[]>(() => {
    return analysis?.insights || []
  }, [analysis])

  // Group insights by provider
  const providerInsights = useMemo<Record<string, AlgorithmicInsight[]>>(() => {
    if (!analysis) return {}

    const grouped: Record<string, AlgorithmicInsight[]> = {}
    for (const insight of insights) {
      const providers = insight.relatedProviders || ['global']
      for (const provider of providers) {
        if (!grouped[provider]) grouped[provider] = []
        grouped[provider].push(insight)
      }
    }
    return grouped
  }, [analysis, insights])

  // Extract budget suggestions
  const budgetSuggestions = useMemo<AlgorithmicInsight[]>(() => {
    return insights.filter(i => i.type === 'budget')
  }, [insights])

  // Get efficiency scores
  const globalEfficiencyScore = analysis?.globalEfficiencyScore || 0
  const providerEfficiencyScores = analysis?.providerEfficiencyScores || {}

  // Check for critical/warning insights
  const hasCriticalInsights = useMemo(() => {
    return insights.some(i => i.level === 'critical')
  }, [insights])

  const hasWarningInsights = useMemo(() => {
    return insights.some(i => i.level === 'warning')
  }, [insights])

  // Count insights by level
  const insightCounts = useMemo(() => {
    const counts = { success: 0, warning: 0, info: 0, critical: 0 }
    for (const insight of insights) {
      if (insight.level in counts) {
        counts[insight.level as keyof typeof counts]++
      }
    }
    return counts
  }, [insights])

  return {
    analysis,
    insights,
    providerInsights,
    budgetSuggestions,
    globalEfficiencyScore,
    providerEfficiencyScores,
    hasCriticalInsights,
    hasWarningInsights,
    insightCounts,
  }
}
