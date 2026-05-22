'use client'

import { ArrowRight, CircleCheck, Info, Lightbulb, RefreshCw, TrendingUp, TriangleAlert } from 'lucide-react'
import ReactMarkdown, { type Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'

import { DASHBOARD_THEME, getBadgeClasses, getIconContainerClasses } from '@/lib/dashboard-theme'
import { cn } from '@/lib/utils'
import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/alert'
import { NoInsightsData, NoIntegrationConnected } from '@/shared/ui/analytics-empty-state'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Skeleton } from '@/shared/ui/skeleton'
import { normalizeInsightMarkdown } from '../lib/insight-utils'
import { PROVIDER_LABELS, type AlgorithmicInsight, type ProviderInsight } from '../hooks'

interface AnalyticsInsightsSectionProps {
  insights: ProviderInsight[]
  algorithmic: AlgorithmicInsight[]
  insightsError: Error | null | undefined
  insightsLoading: boolean
  insightsRefreshing: boolean
  initialInsightsLoading: boolean
  onRefreshInsights: () => void
}

function formatInsightProviderLabel(providerId: string) {
  if (providerId === 'global') return 'Overall property'
  if (providerId === 'google_vs_facebook') return 'Cross-platform comparison'
  return PROVIDER_LABELS[providerId] ?? providerId
}

const INSIGHT_MARKDOWN_COMPONENTS: Components = {
  p: ({ children }) => <p className="leading-relaxed">{children}</p>,
  ul: ({ children }) => <ul className="ml-5 list-disc space-y-1.5">{children}</ul>,
  ol: ({ children }) => <ol className="ml-5 list-decimal space-y-1.5">{children}</ol>,
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
  h1: ({ children }) => <h4 className="text-sm font-semibold text-foreground">{children}</h4>,
  h2: ({ children }) => <h4 className="text-sm font-semibold text-foreground">{children}</h4>,
  h3: ({ children }) => <h5 className="text-sm font-semibold text-foreground">{children}</h5>,
  code: ({ children }) => (
    <code className="rounded bg-muted px-1 py-0.5 text-[0.9em] text-foreground">{children}</code>
  ),
}

function InsightMarkdown({ content }: { content: string }) {
  const normalized = normalizeInsightMarkdown(content)

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      className="space-y-3 text-sm text-muted-foreground"
      components={INSIGHT_MARKDOWN_COMPONENTS}
      skipHtml
    >
      {normalized}
    </ReactMarkdown>
  )
}

function suggestionLevelClasses(level: 'success' | 'warning' | 'critical' | 'info') {
  if (level === 'success') return 'border-success/20 bg-success/5'
  if (level === 'warning') return 'border-warning/20 bg-warning/5'
  if (level === 'critical') return 'border-destructive/20 bg-destructive/5'
  return 'border-border/60 bg-muted/30'
}

function suggestionIconClasses(level: 'success' | 'warning' | 'critical' | 'info') {
  if (level === 'success') return 'bg-success/10 text-success'
  if (level === 'warning') return 'bg-warning/10 text-warning'
  if (level === 'critical') return 'bg-destructive/10 text-destructive'
  return 'bg-accent/10 text-primary'
}

export function AnalyticsInsightsSection({
  insights,
  algorithmic,
  insightsError,
  insightsLoading,
  insightsRefreshing,
  initialInsightsLoading,
  onRefreshInsights,
}: AnalyticsInsightsSectionProps) {
  return (
    <div className="space-y-6">
      <Card className={DASHBOARD_THEME.cards.base}>
        <CardHeader className={DASHBOARD_THEME.cards.header}>
          <div className="flex items-center gap-3">
            <div className={getIconContainerClasses('small')}>
              <Lightbulb className="size-4" />
            </div>
            <div>
              <CardTitle className="text-sm font-semibold text-foreground">Recommended next actions</CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                Rule-based observations from your synced analytics performance.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {initialInsightsLoading ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {['algo-skeleton-1', 'algo-skeleton-2'].map((slotKey) => (
                <Skeleton key={slotKey} className="h-32 w-full rounded-lg" />
              ))}
            </div>
          ) : algorithmic.length === 0 ? (
            <NoInsightsData className="rounded-lg border border-dashed border-border/60" />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {algorithmic.flatMap((group) =>
                group.suggestions.map((suggestion) => (
                  <div
                    key={`${group.providerId}-${suggestion.level}-${suggestion.title}`}
                    className={cn(
                      'rounded-lg border p-4 shadow-sm',
                      suggestionLevelClasses(suggestion.level),
                    )}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div
                            className={cn(
                              'flex size-7 items-center justify-center rounded-md',
                              suggestionIconClasses(suggestion.level),
                            )}
                          >
                            {suggestion.level === 'success' && <CircleCheck className="size-3.5" />}
                            {suggestion.level === 'warning' && <TriangleAlert className="size-3.5" />}
                            {suggestion.level === 'critical' && <TriangleAlert className="size-3.5" />}
                            {suggestion.level === 'info' && <Info className="size-3.5" />}
                          </div>
                          <span className="text-xs font-medium text-muted-foreground">
                            {formatInsightProviderLabel(group.providerId)}
                          </span>
                        </div>
                        <h4 className="text-sm font-semibold text-foreground">{suggestion.title}</h4>
                        <p className="text-sm text-muted-foreground">{suggestion.message}</p>
                      </div>
                      {suggestion.score ? (
                        <div className="flex size-10 shrink-0 flex-col items-center justify-center rounded-lg border border-border/60 bg-card">
                          <span className="text-xs font-bold text-primary leading-none">{suggestion.score}</span>
                          <span className="text-[10px] text-muted-foreground">Score</span>
                        </div>
                      ) : null}
                    </div>
                    <div className="mt-4 flex items-center gap-2 rounded-lg border border-border/60 bg-card/80 p-3 text-sm text-foreground">
                      <ArrowRight className="size-3.5 shrink-0 text-primary" />
                      <span className="line-clamp-2">{suggestion.suggestion}</span>
                    </div>
                  </div>
                )),
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className={DASHBOARD_THEME.cards.base}>
        <CardHeader className={DASHBOARD_THEME.cards.header}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle className="text-sm font-semibold text-foreground">AI insight brief</CardTitle>
              <CardDescription className="mt-1 text-sm text-muted-foreground">
                Narrative analysis from synced users, sessions, conversions, and revenue.
              </CardDescription>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onRefreshInsights}
              disabled={insightsLoading || insightsRefreshing}
              className="gap-2"
            >
              <RefreshCw className={cn('size-3.5', insightsRefreshing && 'animate-spin')} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {insightsError ? (
            <Alert variant="destructive">
              <TriangleAlert className="size-4" />
              <AlertTitle>Insight generation failed</AlertTitle>
              <AlertDescription>{insightsError.message}</AlertDescription>
            </Alert>
          ) : null}
          {initialInsightsLoading ? (
            <div className="space-y-4">
              {['insight-skeleton-1', 'insight-skeleton-2', 'insight-skeleton-3'].map((slotKey) => (
                <div key={slotKey} className="rounded-lg border border-border/60 bg-muted/30 p-4">
                  <Skeleton className="h-3 w-24 rounded-full" />
                  <Skeleton className="mt-4 h-16 w-full rounded-lg" />
                </div>
              ))}
            </div>
          ) : insights.length === 0 ? (
            <NoIntegrationConnected
              platform="analytics property"
              className="rounded-lg border border-dashed border-border/60"
            />
          ) : (
            insights.map((insight) => (
              <div
                key={insight.providerId}
                className="rounded-lg border border-border/60 bg-muted/30 p-5"
              >
                <div className="mb-3 flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <TrendingUp className="size-3.5 text-primary" />
                  <span>{formatInsightProviderLabel(insight.providerId)}</span>
                  <span className={getBadgeClasses('secondary')}>Brief</span>
                </div>
                <InsightMarkdown content={insight.summary} />
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
