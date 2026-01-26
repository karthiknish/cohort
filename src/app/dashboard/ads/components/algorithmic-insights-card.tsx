'use client'

import { useMemo } from 'react'
import {
  Lightbulb,
  CircleCheck,
  TriangleAlert,
  Info,
  Zap,
  TrendingUp,
  ArrowRight,
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
import type { AlgorithmicInsight } from '@/lib/ad-algorithms'

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
  return <Icon className="h-4 w-4 shrink-0" />
}

function InsightLevelBadge({ level }: { level: AlgorithmicInsight['level'] }) {
  const styles = {
    success: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    info: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    warning: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    critical: 'bg-red-500/10 text-red-600 border-red-500/20',
  }

  const labels = {
    success: 'Performing Well',
    info: 'Suggestion',
    warning: 'Needs Attention',
    critical: 'Critical',
  }

  return (
    <Badge
      variant="outline"
      className={cn('text-[10px] font-semibold uppercase', styles[level])}
    >
      {labels[level]}
    </Badge>
  )
}

function InsightItem({ insight, compact }: { insight: AlgorithmicInsight; compact?: boolean }) {
  const levelStyles = {
    success: 'border-l-emerald-500',
    info: 'border-l-blue-500',
    warning: 'border-l-amber-500',
    critical: 'border-l-red-500',
  }

  return (
    <div
      className={cn(
        'rounded-lg border border-l-4 bg-background p-4 transition-colors hover:bg-muted/50',
        levelStyles[insight.level]
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            'mt-0.5 rounded-full p-1',
            insight.level === 'success' && 'bg-emerald-100 text-emerald-600',
            insight.level === 'info' && 'bg-blue-100 text-blue-600',
            insight.level === 'warning' && 'bg-amber-100 text-amber-600',
            insight.level === 'critical' && 'bg-red-100 text-red-600'
          )}
        >
          <InsightLevelIcon level={insight.level} />
        </div>
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-sm">{insight.title}</h4>
            {!compact && <InsightLevelBadge level={insight.level} />}
          </div>
          <p className="text-sm text-muted-foreground">{insight.message}</p>
          {!compact && insight.suggestion && (
            <div className="mt-2 flex items-start gap-2 rounded-md bg-muted/50 p-2 text-xs text-muted-foreground">
              <Lightbulb className="h-3.5 w-3.5 mt-0.5 shrink-0 text-amber-500" />
              <span>{insight.suggestion}</span>
            </div>
          )}
        </div>
        {insight.score !== undefined && (
          <div className="text-right">
            <span className="text-lg font-bold">{insight.score}</span>
            <span className="text-xs text-muted-foreground">/100</span>
          </div>
        )}
      </div>
    </div>
  )
}

function EfficiencyScoreRing({ score, size = 'md' }: { score: number; size?: 'sm' | 'md' | 'lg' }) {
  const dimensions = {
    sm: { container: 'h-20 w-20', text: 'text-xl', label: 'text-[8px]', radius: 32, stroke: 6 },
    md: { container: 'h-28 w-28', text: 'text-3xl', label: 'text-[10px]', radius: 38, stroke: 7 },
    lg: { container: 'h-36 w-36', text: 'text-4xl', label: 'text-xs', radius: 42, stroke: 8 },
  }

  const d = dimensions[size]
  const circumference = 2 * Math.PI * d.radius
  const offset = circumference * (1 - score / 100)

  // Determine performance level for accessibility
  const performanceLevel = score > 70 ? 'good' : score > 40 ? 'moderate' : 'needs improvement'
  const ariaLabel = `Efficiency Score: ${score} out of 100, performance is ${performanceLevel}`

  return (
    <div
      className={cn('relative flex items-center justify-center', d.container)}
      role="img"
      aria-label={ariaLabel}
    >
      <svg className="h-full w-full" viewBox="0 0 100 100" aria-hidden="true">
        <circle
          className="stroke-muted/20"
          strokeWidth={d.stroke}
          fill="transparent"
          r={d.radius}
          cx="50"
          cy="50"
        />
        <circle
          className={cn(
            'transition-all duration-1000',
            score > 70 ? 'stroke-emerald-500' : score > 40 ? 'stroke-amber-500' : 'stroke-red-500'
          )}
          strokeWidth={d.stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          fill="transparent"
          r={d.radius}
          cx="50"
          cy="50"
          transform="rotate(-90 50 50)"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center" aria-hidden="true">
        <span className={cn('font-black tracking-tighter', d.text)}>{score}</span>
        <span className={cn('font-bold uppercase tracking-widest text-muted-foreground/60', d.label)}>
          Score
        </span>
      </div>
    </div>
  )
}

function InsightsSkeleton({ compact }: { compact?: boolean }) {
  if (compact) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Skeleton className="h-48 w-full rounded-lg" />
      <div className="lg:col-span-2 space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-lg" />
        ))}
      </div>
    </div>
  )
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
}: AlgorithmicInsightsCardProps) {
  const displayedInsights = useMemo(() => {
    return (Array.isArray(insights) ? insights : []).slice(0, maxInsights)
  }, [insights, maxInsights])

  const hasMoreInsights = (Array.isArray(insights) ? insights : []).length > maxInsights

  const criticalCount = (Array.isArray(insights) ? insights : []).filter((i) => i.level === 'critical').length
  const warningCount = (Array.isArray(insights) ? insights : []).filter((i) => i.level === 'warning').length

  if (loading) {
    return (
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">AI-Powered Insights</CardTitle>
          <CardDescription>Analyzing your ad performance...</CardDescription>
        </CardHeader>
        <CardContent>
          <InsightsSkeleton compact={compact} />
        </CardContent>
      </Card>
    )
  }

  if (insights.length === 0 && globalEfficiencyScore === 0) {
    return (
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Lightbulb className="h-5 w-5 text-amber-500" />
            AI-Powered Insights
          </CardTitle>
          <CardDescription>
            Algorithmic analysis of your ad performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-muted/60 p-10 text-center text-sm text-muted-foreground">
            <Lightbulb className="h-8 w-8 text-muted-foreground/50" />
            <p>Connect ad platforms and sync data to receive AI-powered insights.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (compact) {
    return (
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <Lightbulb className="h-4 w-4 text-amber-500" />
                Ad Insights
                {(criticalCount > 0 || warningCount > 0) && (
                  <Badge variant="outline" className="border-amber-500/50 text-amber-600 text-xs">
                    {criticalCount + warningCount} action{criticalCount + warningCount !== 1 ? 's' : ''} needed
                  </Badge>
                )}
              </CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <EfficiencyScoreRing score={globalEfficiencyScore} size="sm" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {displayedInsights.map((insight, idx) => (
            <InsightItem key={idx} insight={insight} compact />
          ))}
          {hasMoreInsights && onViewAll && (
            <Button variant="ghost" size="sm" className="w-full" onClick={onViewAll}>
              View all {insights.length} insights
              <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Lightbulb className="h-5 w-5 text-amber-500" />
              AI-Powered Insights
              {criticalCount > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {criticalCount} critical
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Algorithmic analysis of your cross-platform ad performance
            </CardDescription>
          </div>
          {onViewAll && hasMoreInsights && (
            <Button variant="outline" size="sm" onClick={onViewAll}>
              View all insights
              <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Efficiency Score Section */}
          <div className="flex flex-col items-center justify-center space-y-4 rounded-lg border bg-muted/30 p-6">
            <EfficiencyScoreRing score={globalEfficiencyScore} size="lg" />
            <div className="text-center">
              <p className="text-sm font-medium">Overall Efficiency</p>
              <p className="text-xs text-muted-foreground">
                {globalEfficiencyScore > 70
                  ? 'Your campaigns are performing well'
                  : globalEfficiencyScore > 40
                    ? 'There is room for improvement'
                    : 'Immediate attention recommended'}
              </p>
            </div>
            {Object.keys(providerEfficiencyScores).length > 1 && (
              <div className="flex flex-wrap justify-center gap-2">
                {Object.entries(providerEfficiencyScores).map(([provider, score]) => (
                  <Badge key={provider} variant="secondary" className="text-xs">
                    {provider}: {score}%
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Insights List */}
          <div className="lg:col-span-2 space-y-3">
            {displayedInsights.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-8 text-center">
                <TrendingUp className="h-8 w-8 text-emerald-500" />
                <p className="font-medium">All systems nominal</p>
                <p className="text-sm text-muted-foreground">
                  No immediate actions required. Keep up the good work!
                </p>
              </div>
            ) : (
              displayedInsights.map((insight, idx) => (
                <InsightItem key={idx} insight={insight} />
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
