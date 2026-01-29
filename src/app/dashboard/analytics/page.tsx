'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useQuery } from 'convex/react'
import { RefreshCw, LoaderCircle, Link2, CheckCircle2, RotateCw, TrendingUp } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { differenceInDays, startOfDay, endOfDay } from 'date-fns'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

import { useClientContext } from '@/contexts/client-context'
import { useToast } from '@/components/ui/use-toast'
import { usePreview } from '@/contexts/preview-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/auth-context'
import { adsIntegrationsApi } from '@/lib/convex-api'
import { asErrorMessage, logError } from '@/lib/convex-errors'

// Extracted hooks and types
import {
  useAnalyticsData,
  useGoogleAnalyticsSync,
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
import { AnalyticsDateRangePicker, type AnalyticsDateRange } from './components/analytics-date-range-picker'
import { AnalyticsExportButton } from './components/analytics-export-button'
import { AutoRefreshControls } from '@/components/ui/auto-refresh-controls'

export default function AnalyticsPage() {
  const { selectedClientId } = useClientContext()
  const { toast } = useToast()
  const { isPreviewMode } = usePreview()
  const { user } = useAuth()
  const searchParams = useSearchParams()

  // Date range state - initialize with 30 days
  const [dateRange, setDateRange] = useState<AnalyticsDateRange>(() => {
    const end = endOfDay(new Date())
    const start = startOfDay(new Date(Date.now() - 29 * 24 * 60 * 60 * 1000)) // 30 days
    return { start, end }
  })
  const [periodDays, setPeriodDays] = useState(30)

  const [selectedPlatform, setSelectedPlatform] = useState(() => {
    const platform = searchParams.get('platform')
    const valid = PLATFORM_OPTIONS.some((opt) => opt.value === platform)
    return valid ? (platform as string) : 'all'
  })

  // Keep state in sync when navigating via links that change query params.
  const platformParam = searchParams.get('platform')
  useEffect(() => {
    if (platformParam && PLATFORM_OPTIONS.some((opt) => opt.value === platformParam)) {
      setSelectedPlatform(platformParam)
    }
  }, [platformParam])

  const handleDateRangeChange = (range: AnalyticsDateRange, days?: number) => {
    setDateRange(range)
    if (days) {
      setPeriodDays(days)
    } else {
      setPeriodDays(differenceInDays(range.end, range.start) + 1)
    }
  }

  const [gaConnected, setGaConnected] = useState(false)
  const [gaAccountLabel, setGaAccountLabel] = useState<string | null>(null)
  const [gaLoading, setGaLoading] = useState(false)

  // TanStack Query mutation for Google Analytics sync
  const googleAnalyticsSyncMutation = useGoogleAnalyticsSync()

  const workspaceId = user?.agencyId ? String(user.agencyId) : null

  const integrationStatuses = useQuery(
    adsIntegrationsApi.listStatuses,
    isPreviewMode || !workspaceId || !user?.id
      ? 'skip'
      : {
          workspaceId,
          clientId: selectedClientId ?? null,
        }
  ) as Array<any> | undefined

  const refreshGoogleAnalyticsStatus = useCallback(async () => {
    if (isPreviewMode) {
      setGaConnected(false)
      setGaAccountLabel(null)
      return
    }

    const rows = Array.isArray(integrationStatuses) ? integrationStatuses : []
    const ga = rows.find((s: any) => s?.providerId === 'google-analytics')

    const linkedAtMs = typeof ga?.linkedAtMs === 'number' ? ga.linkedAtMs : null
    const accountName = typeof ga?.accountName === 'string' ? ga.accountName : null
    const accountId = typeof ga?.accountId === 'string' ? ga.accountId : null

    setGaConnected(Boolean(linkedAtMs))
    setGaAccountLabel(accountName ?? accountId ?? null)
  }, [integrationStatuses, isPreviewMode])

  useEffect(() => {
    void refreshGoogleAnalyticsStatus()
  }, [refreshGoogleAnalyticsStatus])

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
  } = useAnalyticsData(null, periodDays, selectedClientId ?? null, isPreviewMode, user?.agencyId)

  const metrics = metricsData

  const handleLoadMoreMetrics = useCallback(async () => {
    if (!metricsNextCursor) {
      return
    }

    try {
      await loadMoreMetrics()
    } catch (error) {
      logError(error, 'AnalyticsPage:handleLoadMoreMetrics')
      toast({ title: 'Metrics pagination error', description: asErrorMessage(error), variant: 'destructive' })
    }
  }, [loadMoreMetrics, metricsNextCursor, toast])

  const handleConnectGoogleAnalytics = useCallback(async () => {
    if (isPreviewMode) {
      toast({ title: 'Preview mode', description: 'Google Analytics connection is disabled in preview mode.' })
      return
    }

    setGaLoading(true)
      try {
        window.location.href = '/api/integrations/google-analytics/oauth/start'
      toast({
        title: 'Google Analytics connected',
        description: 'Account access granted. You can sync data now.',
      })
      await refreshGoogleAnalyticsStatus()
    } catch (error: unknown) {
      logError(error, 'AnalyticsPage:handleConnectGoogleAnalytics')
      toast({ title: 'Connection failed', description: asErrorMessage(error), variant: 'destructive' })
    } finally {
      setGaLoading(false)
    }
  }, [isPreviewMode, refreshGoogleAnalyticsStatus, toast])

  const handleSyncGoogleAnalytics = useCallback(async () => {
    if (isPreviewMode) {
      toast({ title: 'Preview mode', description: 'Google Analytics sync is disabled in preview mode.' })
      return
    }

    try {
      const result = await googleAnalyticsSyncMutation.mutateAsync({
        periodDays,
        clientId: selectedClientId,
      })

      toast({
        title: 'Google Analytics synced',
        description: result?.propertyName
          ? `Imported ${result?.written ?? 0} day(s) from ${result.propertyName}.`
          : `Imported ${result?.written ?? 0} day(s).`,
      })

      await refreshGoogleAnalyticsStatus()
      await mutateMetrics()
    } catch (error: unknown) {
      logError(error, 'AnalyticsPage:handleSyncGoogleAnalytics')
      toast({ title: 'Sync failed', description: asErrorMessage(error), variant: 'destructive' })
    }
  }, [isPreviewMode, googleAnalyticsSyncMutation, mutateMetrics, periodDays, refreshGoogleAnalyticsStatus, selectedClientId, toast])

  const initialMetricsLoading = metricsLoading && metrics.length === 0
  const initialInsightsLoading = insightsLoading && insights.length === 0

  const filteredMetrics = useMemo(() => {
    if (!metrics.length) return []
    const startMs = dateRange.start.getTime()
    const endMs = dateRange.end.getTime()
    return metrics.filter((metric) => {
      const inPlatform = selectedPlatform === 'all' || metric.providerId === selectedPlatform
      if (!inPlatform) return false
      const metricDate = new Date(metric.date).getTime()
      return metricDate >= startMs && metricDate <= endMs
    })
  }, [metrics, selectedPlatform, dateRange])

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

  // Check if Google Analytics has been synced (has data for selected period)
  const hasGaData = useMemo(() => {
    if (selectedPlatform !== 'google-analytics') return true
    return filteredMetrics.some((metric) => metric.providerId === 'google-analytics')
  }, [filteredMetrics, selectedPlatform])

  const isGaSelectedWithoutData = selectedPlatform === 'google-analytics' && !hasGaData && !initialMetricsLoading

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
      <div className="space-y-8 pb-10">
        {/* Header Section */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <TrendingUp className="h-6 w-6" />
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Analytics</h1>
            </div>
            <p className="text-sm font-medium text-muted-foreground/80 max-w-xl">
              Real-time performance metrics and cross-platform creative insights for your active campaigns.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative group">
              <div className="absolute -left-3 top-1/2 h-4 w-[2px] -translate-y-1/2 rounded-full bg-primary/40 opacity-0 transition-opacity group-focus-within:opacity-100" />
              <select
                value={selectedPlatform}
                onChange={(e) => setSelectedPlatform(e.target.value)}
                className="block w-full min-w-[160px] cursor-pointer rounded-xl border border-muted/30 bg-background px-4 py-2.5 text-xs font-bold uppercase tracking-wider shadow-sm transition-all hover:border-primary/40 focus:border-primary/60 focus:outline-none focus:ring-4 focus:ring-primary/5"
              >
                {PLATFORM_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <AnalyticsDateRangePicker
              value={dateRange}
              onChange={handleDateRangeChange}
            />
          </div>
        </div>

        {/* Google Analytics Integration */}
        <Card className="overflow-hidden border-0 bg-white dark:bg-[#1f1f1f] shadow-[0_1px_2px_0_rgba(60,64,67,0.3),0_1px_3px_1px_rgba(60,64,67,0.15)] dark:shadow-[0_1px_3px_0_rgba(0,0,0,0.5)] transition-all hover:shadow-[0_1px_3px_0_rgba(60,64,67,0.3),0_2px_8px_4px_rgba(60,64,67,0.1)]">
          <CardHeader className="flex flex-col gap-4 border-b border-[#dadce0] dark:border-[#3c4043] bg-white dark:bg-[#1f1f1f] py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              {/* Google Analytics Logo */}
              <div className="flex h-10 w-10 items-center justify-center">
                <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none">
                  <path d="M22 12c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2s10 4.477 10 10z" fill="#F9AB00"/>
                  <path d="M12 2C6.477 2 2 6.477 2 12h10V2z" fill="#E37400"/>
                  <circle cx="12" cy="12" r="3" fill="#fff"/>
                </svg>
              </div>
              <div>
                <CardTitle className="text-sm font-medium text-[#202124] dark:text-[#e8eaed] tracking-normal">Google Analytics</CardTitle>
                <CardDescription className="text-xs text-[#5f6368] dark:text-[#9aa0a6] leading-tight mt-0.5">
                  Import users, sessions, and conversions into your dashboard
                </CardDescription>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {gaConnected ? (
                <div className="inline-flex animate-in fade-in slide-in-from-right-2 duration-300 items-center gap-1.5 rounded-full bg-[#e6f4ea] dark:bg-[#1e3a2f] px-3 py-1.5 text-xs font-medium text-[#137333] dark:text-[#81c995]">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Connected{gaAccountLabel ? ` · ${gaAccountLabel}` : ''}
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 rounded-full bg-[#fce8e6] dark:bg-[#3c2a2a] px-3 py-1.5 text-xs font-medium text-[#c5221f] dark:text-[#f28b82]">
                  <Link2 className="h-3.5 w-3.5" />
                  Not connected
                </div>
              )}

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => void handleConnectGoogleAnalytics()}
                  disabled={gaLoading}
                  className="h-9 rounded-md border-[#dadce0] dark:border-[#5f6368] bg-white dark:bg-[#303134] text-[#1a73e8] dark:text-[#8ab4f8] hover:bg-[#f8f9fa] dark:hover:bg-[#3c4043] hover:border-[#dadce0] text-sm font-medium transition-colors"
                >
                  {gaLoading ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <Link2 className="mr-2 h-4 w-4" />}
                  {gaConnected ? 'Reconnect' : 'Link property'}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => void handleSyncGoogleAnalytics()}
                  disabled={googleAnalyticsSyncMutation.isPending || gaLoading}
                  className="h-9 rounded-md bg-[#1a73e8] hover:bg-[#1557b0] text-white text-sm font-medium shadow-none transition-colors"
                >
                  {googleAnalyticsSyncMutation.isPending ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <RotateCw className="mr-2 h-4 w-4" />}
                  Sync data
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="bg-[#f8f9fa] dark:bg-[#28292a] py-3 px-4">
            <div className="flex items-center gap-2">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#e8f0fe] dark:bg-[#1a3a5c]">
                <TrendingUp className="h-3 w-3 text-[#1a73e8] dark:text-[#8ab4f8]" />
              </div>
              <p className="text-xs text-[#5f6368] dark:text-[#9aa0a6]">
                Syncing imports metrics from <span className="font-medium text-[#202124] dark:text-[#e8eaed]">Google Analytics</span> for unified reporting
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Error Alert */}
        {metricsError && (
          <Alert variant="destructive">
            <AlertTitle>Unable to load analytics</AlertTitle>
            <AlertDescription>{asErrorMessage(metricsError)}</AlertDescription>
          </Alert>
        )}

        {/* Empty State for Google Analytics when not synced */}
        {isGaSelectedWithoutData ? (
          <Card className="overflow-hidden border-0 bg-white dark:bg-[#1f1f1f] shadow-[0_1px_2px_0_rgba(60,64,67,0.3),0_1px_3px_1px_rgba(60,64,67,0.15)] dark:shadow-[0_1px_3px_0_rgba(0,0,0,0.5)]">
            <CardContent className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#f8f9fa] dark:bg-[#28292a]">
                <svg viewBox="0 0 24 24" className="h-12 w-12" fill="none">
                  <path d="M22 12c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2s10 4.477 10 10z" fill="#F9AB00"/>
                  <path d="M12 2C6.477 2 2 6.477 2 12h10V2z" fill="#E37400"/>
                  <circle cx="12" cy="12" r="3" fill="#fff"/>
                </svg>
              </div>
              <h3 className="mb-2 text-base font-medium text-[#202124] dark:text-[#e8eaed]">No analytics data yet</h3>
              <p className="mb-6 max-w-md text-sm text-[#5f6368] dark:text-[#9aa0a6]">
                Connect your Google Analytics property and sync your data to view performance metrics, insights, and reports.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                {!gaConnected && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => void handleConnectGoogleAnalytics()}
                    disabled={gaLoading}
                    className="rounded-md border-[#dadce0] dark:border-[#5f6368] bg-white dark:bg-[#303134] text-[#1a73e8] dark:text-[#8ab4f8] hover:bg-[#f8f9fa] dark:hover:bg-[#3c4043]"
                  >
                    {gaLoading ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <Link2 className="mr-2 h-4 w-4" />}
                    Link Google Analytics
                  </Button>
                )}
                <Button
                  type="button"
                  size="sm"
                  onClick={() => void handleSyncGoogleAnalytics()}
                  disabled={googleAnalyticsSyncMutation.isPending || gaLoading}
                  className="rounded-md bg-[#1a73e8] hover:bg-[#1557b0] text-white shadow-none"
                >
                  {googleAnalyticsSyncMutation.isPending ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <RotateCw className="mr-2 h-4 w-4" />}
                  Sync data now
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : googleAnalyticsSyncMutation.isPending ? (
          <Card className="overflow-hidden border-0 bg-white dark:bg-[#1f1f1f] shadow-[0_1px_2px_0_rgba(60,64,67,0.3),0_1px_3px_1px_rgba(60,64,67,0.15)] dark:shadow-[0_1px_3px_0_rgba(0,0,0,0.5)]">
            <CardContent className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#e8f0fe] dark:bg-[#1a3a5c]">
                <LoaderCircle className="h-10 w-10 animate-spin text-[#1a73e8] dark:text-[#8ab4f8]" />
              </div>
              <h3 className="mb-2 text-base font-medium text-[#202124] dark:text-[#e8eaed]">Syncing analytics data</h3>
              <p className="max-w-md text-sm text-[#5f6368] dark:text-[#9aa0a6]">
                Importing your Google Analytics data. This may take a moment...
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Performance Summary Header */}
            <div className="flex items-center justify-between border-b border-muted/10 pb-2">
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground/70">Performance Summary</h2>
              </div>
              <div className="flex items-center gap-1.5">
                {metricsNextCursor && (
                  <button
                    type="button"
                    onClick={handleLoadMoreMetrics}
                    disabled={metricsLoadingMore}
                    className="group inline-flex items-center gap-2 rounded-xl border border-muted/30 bg-background px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70 shadow-sm transition-all hover:bg-muted/5 hover:text-foreground active:scale-[0.98] disabled:opacity-50"
                  >
                    {metricsLoadingMore ? (
                      <>
                        <LoaderCircle className="h-3 w-3 animate-spin" />
                        Loading
                      </>
                    ) : (
                      <>
                        <RotateCw className="h-3 w-3 transition-transform group-hover:rotate-180 duration-500" />
                        Load older data
                      </>
                    )}
                  </button>
                )}
                <AutoRefreshControls
                  onRefresh={() => mutateMetrics()}
                  disabled={isPreviewMode || metricsLoading}
                  isRefreshing={metricsRefreshing}
                  defaultInterval="off"
                />
                <AnalyticsExportButton metrics={filteredMetrics} disabled={isPreviewMode} />
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
          </>
        )}
      </div>
    </div>
  )
}
