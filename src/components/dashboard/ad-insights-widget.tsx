'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import {
  Lightbulb,
  CircleCheck,
  TriangleAlert,
  Info,
  Zap,
  ArrowRight,
  TrendingUp,
} from 'lucide-react'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import {
  calculateAlgorithmicInsights,
  calculateEfficiencyScore,
  getGlobalBudgetSuggestions,
  enrichSummaryWithMetrics,
  type AdMetricsSummary,
  type AlgorithmicInsight,
} from '@/lib/ad-algorithms'

// =============================================================================
// TYPES
// =============================================================================

interface AdInsightsWidgetProps {
  /** Provider summaries from metrics */
  providerSummaries?: Record<string, {
    spend: number
    impressions: number
    clicks: number
    conversions: number
    revenue: number
  }>
  /** Whether data is loading */
  loading?: boolean
  /** Whether to show the widget even without data */
  showEmpty?: boolean
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function buildAdMetricsSummary(
  providerId: string,
  summary: { spend: number; impressions: number; clicks: number; conversions: number; revenue: number }
): AdMetricsSummary {
  const { spend, impressions, clicks, conversions, revenue } = summary
  const averageRoaS = spend > 0 ? revenue / spend : 0
  const averageCpc = clicks > 0 ? spend / clicks : 0

  return {
    providerId,
    totalSpend: spend,
    totalRevenue: revenue,
    totalClicks: clicks,
    totalConversions: conversions,
    totalImpressions: impressions,
    averageRoaS,
    averageCpc,
    averageCtr: impressions > 0 ? (clicks / impressions) * 100 : 0,
    averageConvRate: clicks > 0 ? (conversions / clicks) * 100 : 0,
    period: 'selected',
    dayCount: 0,
  }
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

function InsightLevelIcon({ level }: { level: AlgorithmicInsight['level'] }) {
  const icons = {
    success: CircleCheck,
    info: Info,
    warning: TriangleAlert,
    critical: Zap,
  }
  const Icon = icons[level] || Info
  return <Icon className="h-3.5 w-3.5 shrink-0" />
}

function CompactInsightItem({ insight }: { insight: AlgorithmicInsight }) {
  const levelStyles = {
    success: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30',
    info: 'text-blue-600 bg-blue-50 dark:bg-blue-950/30',
    warning: 'text-amber-600 bg-amber-50 dark:bg-amber-950/30',
    critical: 'text-red-600 bg-red-50 dark:bg-red-950/30',
  }

  return (
    <div className="flex items-start gap-2 py-2">
      <div
        className={cn(
          'mt-0.5 rounded-full p-1',
          levelStyles[insight.level]
        )}
      >
        <InsightLevelIcon level={insight.level} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{insight.title}</p>
        <p className="text-xs text-muted-foreground line-clamp-1">{insight.message}</p>
      </div>
    </div>
  )
}

function EfficiencyScoreMini({ score }: { score: number }) {
  const circumference = 2 * Math.PI * 16
  const offset = circumference * (1 - score / 100)

  return (
    <div className="relative flex h-12 w-12 items-center justify-center">
      <svg className="h-full w-full" viewBox="0 0 40 40">
        <circle
          className="stroke-muted/20"
          strokeWidth="3"
          fill="transparent"
          r="16"
          cx="20"
          cy="20"
        />
        <circle
          className={cn(
            'transition-all duration-700',
            score > 70 ? 'stroke-emerald-500' : score > 40 ? 'stroke-amber-500' : 'stroke-red-500'
          )}
          strokeWidth="3"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          fill="transparent"
          r="16"
          cx="20"
          cy="20"
          transform="rotate(-90 20 20)"
        />
      </svg>
      <span className="absolute text-xs font-bold">{score}</span>
    </div>
  )
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function AdInsightsWidget({
  providerSummaries,
  loading = false,
  showEmpty = false,
}: AdInsightsWidgetProps) {
  // Calculate insights from provider summaries
  const { insights, globalEfficiencyScore, hasCriticalInsights, actionCount } = useMemo(() => {
    if (!providerSummaries || Object.keys(providerSummaries).length === 0) {
      return { insights: [], globalEfficiencyScore: 0, hasCriticalInsights: false, actionCount: 0 }
    }

    const enrichedSummaries = Object.entries(providerSummaries).map(([providerId, summary]) => {
      const baseSummary = buildAdMetricsSummary(providerId, summary)
      return enrichSummaryWithMetrics(baseSummary)
    })

    // Calculate per-provider insights
    const allInsights: AlgorithmicInsight[] = []
    const providerScores: number[] = []

    for (const summary of enrichedSummaries) {
      allInsights.push(...calculateAlgorithmicInsights(summary))
      providerScores.push(calculateEfficiencyScore(summary))
    }

    // Add cross-platform budget suggestions
    if (enrichedSummaries.length >= 2) {
      allInsights.push(...getGlobalBudgetSuggestions(enrichedSummaries))
    }

    // Sort by importance
    const levelOrder = { critical: 0, warning: 1, success: 2, info: 3 }
    allInsights.sort((a, b) => (levelOrder[a.level] ?? 4) - (levelOrder[b.level] ?? 4))

    // Calculate weighted global score
    const totalSpend = enrichedSummaries.reduce((sum, s) => sum + s.totalSpend, 0)
    const weightedScore = totalSpend > 0
      ? Math.round(
        enrichedSummaries.reduce((sum, s, i) => sum + (providerScores[i] ?? 0) * s.totalSpend, 0) / totalSpend
      )
      : 0

    const critical = allInsights.filter((i) => i.level === 'critical').length
    const warning = allInsights.filter((i) => i.level === 'warning').length

    return {
      insights: allInsights.slice(0, 3),
      globalEfficiencyScore: weightedScore,
      hasCriticalInsights: critical > 0,
      actionCount: critical + warning,
    }
  }, [providerSummaries])

  if (loading) {
    return (
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </CardContent>
      </Card>
    )
  }

  const hasData = insights.length > 0 || globalEfficiencyScore > 0

  if (!hasData && !showEmpty) {
    return null
  }

  if (!hasData) {
    return (
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Lightbulb className="h-4 w-4 text-amber-500" />
            Ad Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-2 py-4 text-center text-sm text-muted-foreground">
            <TrendingUp className="h-6 w-6 text-muted-foreground/50" />
            <p>Connect ad platforms to see AI-powered insights</p>
            <Button asChild variant="outline" size="sm">
              <Link href="/dashboard/ads">
                Go to Ads Hub
                <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Lightbulb className="h-4 w-4 text-amber-500" />
            Ad Insights
            {actionCount > 0 && (
              <Badge
                variant="outline"
                className={cn(
                  'text-xs',
                  hasCriticalInsights
                    ? 'border-red-500/50 text-red-600'
                    : 'border-amber-500/50 text-amber-600'
                )}
              >
                {actionCount} action{actionCount !== 1 ? 's' : ''}
              </Badge>
            )}
          </CardTitle>
          <EfficiencyScoreMini score={globalEfficiencyScore} />
        </div>
        <CardDescription className="text-xs">
          {globalEfficiencyScore > 70
            ? 'Campaigns performing well'
            : globalEfficiencyScore > 40
              ? 'Room for optimization'
              : 'Attention recommended'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-1">
        {insights.length === 0 ? (
          <div className="flex items-center gap-2 py-2 text-sm text-muted-foreground">
            <CircleCheck className="h-4 w-4 text-emerald-500" />
            <span>All campaigns performing well</span>
          </div>
        ) : (
          <>
            <div className="divide-y">
              {insights.map((insight, idx) => (
                <CompactInsightItem key={idx} insight={insight} />
              ))}
            </div>
            <Button asChild variant="ghost" size="sm" className="w-full mt-2">
              <Link href="/dashboard/ads">
                View all insights
                <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  )
}
