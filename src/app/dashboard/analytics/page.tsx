'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { RefreshCw, LoaderCircle } from 'lucide-react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { authService } from '@/services/auth'
import { useClientContext } from '@/contexts/client-context'
import { useToast } from '@/components/ui/use-toast'
import { usePreview } from '@/contexts/preview-context'

// Extracted hooks and types
import {
  useAnalyticsData,
  PROVIDER_LABELS,
  PERIOD_OPTIONS,
  PLATFORM_OPTIONS,
} from './hooks'

// Extracted components
import { AnalyticsSummaryCards } from './components/analytics-summary-cards'
import { AnalyticsMetricCards } from './components/analytics-metric-cards'
import { AnalyticsCharts } from './components/analytics-charts'
import { AnalyticsInsightsSection } from './components/analytics-insights-section'
import { AnalyticsCreativesSection } from './components/analytics-creatives-section'

export default function AnalyticsPage() {
  const { selectedClientId } = useClientContext()
  const { toast } = useToast()
  const { isPreviewMode } = usePreview()
  const [selectedPeriod, setSelectedPeriod] = useState<typeof PERIOD_OPTIONS[number]['value']>(PERIOD_OPTIONS[0].value)
  const [selectedPlatform, setSelectedPlatform] = useState('all')

  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const fetchToken = async () => {
      if (token) return
      const jwt = await authService.getIdToken().catch(() => null)
      if (!cancelled) {
        setToken(jwt)
      }
    }
    void fetchToken()
    return () => {
      cancelled = true
    }
  }, [token])

  const periodDays = useMemo(() => {
    const option = PERIOD_OPTIONS.find((opt) => opt.value === selectedPeriod)
    return option?.days ?? 7
  }, [selectedPeriod])

  const {
    metricsData,
    metricsNextCursor,
    metricsLoadingMore,
    loadMoreMetrics,
    metricsError,
    metricsLoading,
    metricsRefreshing,
    mutateMetrics,
    insights,
    algorithmic,
    insightsError,
    insightsLoading,
    insightsRefreshing,
    mutateInsights,
  } = useAnalyticsData(token, periodDays, selectedClientId ?? null, isPreviewMode)

  const metrics = metricsData

  const handleLoadMoreMetrics = useCallback(async () => {
    if (!metricsNextCursor) {
      return
    }

    try {
      await loadMoreMetrics()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to load additional metrics'
      toast({ title: 'Metrics pagination error', description: message, variant: 'destructive' })
    }
  }, [loadMoreMetrics, metricsNextCursor, toast])

  const initialMetricsLoading = metricsLoading && metrics.length === 0
  const initialInsightsLoading = insightsLoading && insights.length === 0

  const referenceTimestamp = useMemo(() => {
    return metrics.reduce((latest, metric) => {
      const timestamp = new Date(metric.date).getTime()
      return timestamp > latest ? timestamp : latest
    }, 0)
  }, [metrics])

  const filteredMetrics = useMemo(() => {
    if (!metrics.length) return []
    const cutoff = periodDays ? referenceTimestamp - periodDays * 24 * 60 * 60 * 1000 : null
    return metrics.filter((metric) => {
      const inPlatform = selectedPlatform === 'all' || metric.providerId === selectedPlatform
      if (!inPlatform) return false
      if (!cutoff) return true
      const metricDate = new Date(metric.date).getTime()
      return metricDate >= cutoff
    })
  }, [metrics, selectedPlatform, periodDays, referenceTimestamp])

  const aggregatedByDate = useMemo(() => {
    const map = new Map<string, { date: string; spend: number; revenue: number; clicks: number; conversions: number }>()
    filteredMetrics.forEach((metric) => {
      const key = metric.date
      if (!map.has(key)) {
        map.set(key, { date: key, spend: 0, revenue: 0, clicks: 0, conversions: 0 })
      }
      const entry = map.get(key)!
      entry.spend += metric.spend
      entry.revenue += metric.revenue ?? 0
      entry.clicks += metric.clicks
      entry.conversions += metric.conversions
    })
    return Array.from(map.values()).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }, [filteredMetrics])

  const platformTotals = useMemo(() => {
    const summary: Record<string, { spend: number; revenue: number; clicks: number; conversions: number }> = {}
    filteredMetrics.forEach((metric) => {
      const key = metric.providerId
      if (!summary[key]) {
        summary[key] = { spend: 0, revenue: 0, clicks: 0, conversions: 0 }
      }
      summary[key].spend += metric.spend
      summary[key].revenue += metric.revenue ?? 0
      summary[key].clicks += metric.clicks
      summary[key].conversions += metric.conversions
    })
    return summary
  }, [filteredMetrics])

  const totals = useMemo(() => {
    return filteredMetrics.reduce(
      (acc, metric) => {
        acc.spend += metric.spend
        acc.revenue += metric.revenue ?? 0
        acc.clicks += metric.clicks
        acc.conversions += metric.conversions
        return acc
      },
      { spend: 0, revenue: 0, clicks: 0, conversions: 0 }
    )
  }, [filteredMetrics])

  const averageRoaS = totals.spend > 0 ? totals.revenue / totals.spend : 0
  const conversionRate = totals.clicks > 0 ? (totals.conversions / totals.clicks) * 100 : 0
  const averageCpc = totals.clicks > 0 ? totals.spend / totals.clicks : 0

  // Advanced Metrics
  const mer = averageRoaS // Marketing Efficiency Ratio is blended ROAS
  const aov = totals.conversions > 0 ? totals.revenue / totals.conversions : 0
  const rpc = totals.clicks > 0 ? totals.revenue / totals.clicks : 0
  const roi = totals.spend > 0 ? ((totals.revenue - totals.spend) / totals.spend) * 100 : 0

  const platformBreakdown = useMemo(() => {
    return Object.entries(platformTotals).map(([providerId, summary]) => ({
      name: PROVIDER_LABELS[providerId] ?? providerId,
      value: summary.spend,
      color: providerId === 'facebook' ? '#1877F2' : providerId === 'google' ? '#4285F4' : '#6366f1',
    }))
  }, [platformTotals])

  const creativeBreakdown = useMemo(() => {
    return filteredMetrics
      .filter((metric) => metric.providerId === 'facebook' && Array.isArray(metric.creatives) && metric.creatives.length > 0)
      .flatMap((metric) =>
        metric.creatives!.map((creative) => ({
          id: creative.id,
          name: creative.name || 'Untitled creative',
          spend: creative.spend ?? metric.spend,
          impressions: creative.impressions ?? metric.impressions,
          clicks: creative.clicks ?? metric.clicks,
          conversions: creative.conversions ?? metric.conversions,
          revenue: creative.revenue ?? metric.revenue ?? 0,
          date: metric.date,
        }))
      )
      .sort((a, b) => b.spend - a.spend)
      .slice(0, 10)
  }, [filteredMetrics])

  const chartData = useMemo(() => {
    return aggregatedByDate.map((entry) => ({
      ...entry,
      roas: entry.spend > 0 ? entry.revenue / entry.spend : 0,
    }))
  }, [aggregatedByDate])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Analytics dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track spend, performance, and creative efficiency across connected ad platforms.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <select
            value={selectedPlatform}
            onChange={(e) => setSelectedPlatform(e.target.value)}
            className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            {PLATFORM_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as typeof PERIOD_OPTIONS[number]['value'])}
            className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            {PERIOD_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Error Alert */}
      {metricsError && (
        <Alert variant="destructive">
          <AlertTitle>Unable to load analytics</AlertTitle>
          <AlertDescription>{metricsError.message}</AlertDescription>
        </Alert>
      )}

      {/* Performance Summary Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-muted-foreground">Performance summary</h2>
        <div className="flex items-center gap-2">
          {metricsNextCursor && (
            <button
              type="button"
              onClick={handleLoadMoreMetrics}
              disabled={metricsLoadingMore}
              className="inline-flex items-center gap-2 rounded-md border border-input px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm transition hover:bg-muted disabled:opacity-50"
            >
              {metricsLoadingMore ? (
                <>
                  <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                  Loading more
                </>
              ) : (
                'Load older data'
              )}
            </button>
          )}
          <button
            type="button"
            onClick={() => mutateMetrics()}
            disabled={metricsLoading || metricsRefreshing}
            className="inline-flex items-center gap-2 rounded-md border border-input px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm transition hover:bg-muted disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${metricsRefreshing ? 'animate-spin' : ''}`} />
            Refresh metrics
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <AnalyticsSummaryCards
        totals={totals}
        averageRoaS={averageRoaS}
        conversionRate={conversionRate}
        averageCpc={averageCpc}
        isLoading={initialMetricsLoading}
      />

      {/* Advanced Metric Cards */}
      <AnalyticsMetricCards
        mer={mer}
        aov={aov}
        rpc={rpc}
        roi={roi}
        isLoading={initialMetricsLoading}
      />

      {/* Charts Grid */}
      <AnalyticsCharts
        chartData={chartData}
        platformBreakdown={platformBreakdown}
        isMetricsLoading={metricsLoading}
        initialMetricsLoading={initialMetricsLoading}
      />

      {/* Insights Section */}
      <AnalyticsInsightsSection
        insights={insights}
        algorithmic={algorithmic}
        insightsError={insightsError}
        insightsLoading={insightsLoading}
        insightsRefreshing={insightsRefreshing}
        initialInsightsLoading={initialInsightsLoading}
        onRefreshInsights={() => mutateInsights()}
      />

      {/* Creatives Section */}
      <AnalyticsCreativesSection
        creativeBreakdown={creativeBreakdown}
        isMetricsLoading={metricsLoading}
        metricsRefreshing={metricsRefreshing}
        initialMetricsLoading={initialMetricsLoading}
        onRefreshMetrics={() => mutateMetrics()}
      />
    </div>
  )
}
