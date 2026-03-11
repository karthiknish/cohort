'use client'

import { useMemo } from 'react'
import type { AlgorithmicInsight } from '@/lib/ad-algorithms'

import {
  AlgorithmicInsightsCompactCard,
  AlgorithmicInsightsEmptyCard,
  AlgorithmicInsightsFullCard,
  AlgorithmicInsightsLoadingCard,
} from './algorithmic-insights-card-sections'

// =============================================================================
// TYPES
// =============================================================================

interface AlgorithmicInsightsCardProps {
  insights: AlgorithmicInsight[]
  globalEfficiencyScore: number
  providerEfficiencyScores: Record<string, number>
  loading?: boolean
  compact?: boolean
  maxInsights?: number
  onViewAll?: () => void
  title?: string
  description?: string
  emptyMessage?: string
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function AlgorithmicInsightsCard({
  insights,
  globalEfficiencyScore,
  providerEfficiencyScores,
  loading = false,
  compact = false,
  maxInsights = 5,
  onViewAll,
  title = 'AI-Powered Insights',
  description = 'Algorithmic analysis of your cross-platform ad performance',
  emptyMessage = 'Connect ad platforms and sync data to receive AI-powered insights.',
}: AlgorithmicInsightsCardProps) {
  const displayedInsights = useMemo(() => {
    return (Array.isArray(insights) ? insights : []).slice(0, maxInsights)
  }, [insights, maxInsights])

  const hasMoreInsights = (Array.isArray(insights) ? insights : []).length > maxInsights

  const criticalCount = (Array.isArray(insights) ? insights : []).filter((i) => i.level === 'critical').length
  const warningCount = (Array.isArray(insights) ? insights : []).filter((i) => i.level === 'warning').length

  if (loading) {
    return <AlgorithmicInsightsLoadingCard title={title} compact={compact} />
  }

  if (insights.length === 0 && globalEfficiencyScore === 0) {
    return <AlgorithmicInsightsEmptyCard title={title} description={description} emptyMessage={emptyMessage} />
  }

  if (compact) {
    return <AlgorithmicInsightsCompactCard criticalCount={criticalCount} displayedInsights={displayedInsights} globalEfficiencyScore={globalEfficiencyScore} hasMoreInsights={hasMoreInsights} insightsCount={insights.length} onViewAll={onViewAll} title={title} warningCount={warningCount} />
  }

  return <AlgorithmicInsightsFullCard criticalCount={criticalCount} description={description} displayedInsights={displayedInsights} globalEfficiencyScore={globalEfficiencyScore} hasMoreInsights={hasMoreInsights} onViewAll={onViewAll} providerEfficiencyScores={providerEfficiencyScores} title={title} />
}
