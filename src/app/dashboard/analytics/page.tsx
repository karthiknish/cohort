'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { RefreshCw, LoaderCircle, Link2, CheckCircle2, RotateCw, TrendingUp } from 'lucide-react'
import { useSearchParams } from 'next/navigation'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { authService } from '@/services/auth'
import { useClientContext } from '@/contexts/client-context'
import { useToast } from '@/components/ui/use-toast'
import { usePreview } from '@/contexts/preview-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

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
  const searchParams = useSearchParams()

  const [selectedPeriod, setSelectedPeriod] = useState<typeof PERIOD_OPTIONS[number]['value']>(() => {
    const period = searchParams.get('period')
    const valid = PERIOD_OPTIONS.some((opt) => opt.value === period)
    return (valid ? period : PERIOD_OPTIONS[0].value) as typeof PERIOD_OPTIONS[number]['value']
  })

  const [selectedPlatform, setSelectedPlatform] = useState(() => {
    const platform = searchParams.get('platform')
    const valid = PLATFORM_OPTIONS.some((opt) => opt.value === platform)
    return valid ? (platform as string) : 'all'
  })

  // Keep state in sync when navigating via links that change query params.
  const platformParam = searchParams.get('platform')
  const periodParam = searchParams.get('period')
  useEffect(() => {
    if (platformParam && PLATFORM_OPTIONS.some((opt) => opt.value === platformParam)) {
      setSelectedPlatform(platformParam)
    }
    if (periodParam && PERIOD_OPTIONS.some((opt) => opt.value === periodParam)) {
      setSelectedPeriod(periodParam as typeof PERIOD_OPTIONS[number]['value'])
    }
  }, [platformParam, periodParam])

  const [gaConnected, setGaConnected] = useState(false)
  const [gaAccountLabel, setGaAccountLabel] = useState<string | null>(null)
  const [gaLoading, setGaLoading] = useState(false)
  const [gaSyncing, setGaSyncing] = useState(false)

  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const fetchToken = async () => {
      if (token) return
      await authService.waitForInitialAuth().catch(() => {})
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

  const refreshGoogleAnalyticsStatus = useCallback(async () => {
    if (isPreviewMode) {
      setGaConnected(false)
      setGaAccountLabel(null)
      return
    }

    await authService.waitForInitialAuth().catch(() => {})
    const jwt = await authService.getIdToken().catch(() => null)
    if (!jwt) return

    try {
      const params = new URLSearchParams()
      if (selectedClientId) params.set('clientId', selectedClientId)
      const url = params.toString().length > 0
        ? `/api/integrations/status?${params.toString()}`
        : '/api/integrations/status'

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${jwt}` },
        cache: 'no-store',
      })

      const payload = (await response.json().catch(() => ({}))) as any
      const statuses = payload && typeof payload === 'object' && 'success' in payload
        ? (payload.data?.statuses ?? [])
        : (payload.statuses ?? [])

      const ga = Array.isArray(statuses)
        ? statuses.find((s: any) => s?.providerId === 'google-analytics')
        : null

      const linkedAt = ga?.linkedAt
      const accountName = typeof ga?.accountName === 'string' ? ga.accountName : null
      const accountId = typeof ga?.accountId === 'string' ? ga.accountId : null

      setGaConnected(Boolean(linkedAt))
      setGaAccountLabel(accountName ?? accountId ?? null)
    } catch {
      // Silent; analytics can still load.
    }
  }, [isPreviewMode, selectedClientId])

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

  const handleConnectGoogleAnalytics = useCallback(async () => {
    if (isPreviewMode) {
      toast({ title: 'Preview mode', description: 'Google Analytics connection is disabled in preview mode.' })
      return
    }

    setGaLoading(true)
    try {
      await authService.connectGoogleAnalyticsAccount(selectedClientId ?? null)
      toast({
        title: 'Google Analytics connected',
        description: 'Account access granted. You can sync data now.',
      })
      await refreshGoogleAnalyticsStatus()
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unable to connect Google Analytics'
      toast({ title: 'Connection failed', description: message, variant: 'destructive' })
    } finally {
      setGaLoading(false)
    }
  }, [isPreviewMode, refreshGoogleAnalyticsStatus, selectedClientId, toast])

  const handleSyncGoogleAnalytics = useCallback(async () => {
    if (isPreviewMode) {
      toast({ title: 'Preview mode', description: 'Google Analytics sync is disabled in preview mode.' })
      return
    }

    await authService.waitForInitialAuth().catch(() => {})
    const jwt = await authService.getIdToken().catch(() => null)
    if (!jwt) {
      toast({ title: 'Auth required', description: 'Please sign in again and retry.', variant: 'destructive' })
      return
    }

    setGaSyncing(true)
    try {
      const params = new URLSearchParams({ days: String(periodDays) })
      if (selectedClientId) params.set('clientId', selectedClientId)
      const url = `/api/analytics/google-analytics/sync?${params.toString()}`

      const response = await fetch(url, {
        method: 'POST',
        headers: { Authorization: `Bearer ${jwt}` },
      })

      const payload = (await response.json().catch(() => ({}))) as any
      if (!response.ok) {
        const message = typeof payload?.error === 'string' ? payload.error : 'Failed to sync Google Analytics'
        throw new Error(message)
      }

      toast({
        title: 'Google Analytics synced',
        description: payload?.propertyName
          ? `Imported ${payload?.written ?? 0} day(s) from ${payload.propertyName}.`
          : `Imported ${payload?.written ?? 0} day(s).`,
      })

      await refreshGoogleAnalyticsStatus()
      await mutateMetrics()
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unable to sync Google Analytics'
      toast({ title: 'Sync failed', description: message, variant: 'destructive' })
    } finally {
      setGaSyncing(false)
    }
  }, [isPreviewMode, mutateMetrics, periodDays, refreshGoogleAnalyticsStatus, selectedClientId, toast])

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
            <div className="relative group">
              <div className="absolute -left-3 top-1/2 h-4 w-[2px] -translate-y-1/2 rounded-full bg-primary/40 opacity-0 transition-opacity group-focus-within:opacity-100" />
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value as typeof PERIOD_OPTIONS[number]['value'])}
                className="block w-full min-w-[140px] cursor-pointer rounded-xl border border-muted/30 bg-background px-4 py-2.5 text-xs font-bold uppercase tracking-wider shadow-sm transition-all hover:border-primary/40 focus:border-primary/60 focus:outline-none focus:ring-4 focus:ring-primary/5"
              >
                {PERIOD_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Google Analytics data source */}
        {/* Google Analytics data source */}
        <Card className="overflow-hidden border-muted/40 bg-background shadow-sm transition-all hover:shadow-md">
          <CardHeader className="flex flex-col gap-4 border-b border-muted/10 bg-muted/5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500 shadow-sm">
                <RotateCw className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground/80">Google Analytics Integration</CardTitle>
                <CardDescription className="text-xs font-medium text-muted-foreground/60 leading-tight">
                  Import users, sessions, and conversions into your dashboard.
                </CardDescription>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {gaConnected ? (
                <div className="inline-flex animate-in fade-in slide-in-from-right-2 duration-500 items-center gap-2 rounded-xl bg-emerald-500/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-600 border border-emerald-500/20">
                  <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                  Connected{gaAccountLabel ? `: ${gaAccountLabel}` : ''}
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 rounded-xl bg-muted px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70 border border-muted/30">
                  <Link2 className="h-3.5 w-3.5" />
                  No property linked
                </div>
              )}

              <div className="flex items-center gap-1.5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => void handleConnectGoogleAnalytics()}
                  disabled={gaLoading}
                  className="h-9 rounded-xl border-muted/40 text-[10px] font-bold uppercase tracking-widest transition-all hover:bg-muted/10 active:scale-[0.98]"
                >
                  {gaLoading ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : <Link2 className="h-3.5 w-3.5" />}
                  {gaConnected ? 'Reconnect' : 'Link Account'}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => void handleSyncGoogleAnalytics()}
                  disabled={gaSyncing || gaLoading}
                  className="h-9 rounded-xl bg-primary text-[10px] font-bold uppercase tracking-widest shadow-md transition-all hover:bg-primary/90 active:scale-[0.98]"
                >
                  {gaSyncing ? <LoaderCircle className="h-3.5 w-3.5 animate-spin text-white" /> : <RotateCw className="h-3.5 w-3.5 text-white" />}
                  Sync now
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="bg-muted/5 py-3">
            <div className="flex items-center gap-2">
              <div className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-tighter text-primary">TIP</div>
              <p className="text-[10px] font-medium text-muted-foreground/70">
                Sync writes metrics with provider <span className="font-bold text-muted-foreground underline decoration-primary/30">Google Analytics</span> for unified filtering.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Error Alert */}
        {metricsError && (
          <Alert variant="destructive">
            <AlertTitle>Unable to load analytics</AlertTitle>
            <AlertDescription>{metricsError.message}</AlertDescription>
          </Alert>
        )}

        {/* Performance Summary Header */}
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
            <button
              type="button"
              onClick={() => mutateMetrics()}
              disabled={metricsLoading || metricsRefreshing}
              className="group inline-flex items-center gap-2 rounded-xl border border-muted/30 bg-background px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70 shadow-sm transition-all hover:bg-muted/5 hover:text-foreground active:scale-[0.98] disabled:opacity-50"
            >
              <RefreshCw className={`h-3 w-3 transition-transform duration-500 group-hover:rotate-180 ${metricsRefreshing ? 'animate-spin' : ''}`} />
              Refresh
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
    </div>
  )
}
