'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAction, useMutation, useQuery } from 'convex/react'
import { differenceInDays, endOfDay, startOfDay } from 'date-fns'
import { CheckCircle2, Link2, LoaderCircle, RotateCw, TrendingUp, Unlink } from 'lucide-react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AutoRefreshControls } from '@/components/ui/auto-refresh-controls'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/contexts/auth-context'
import { useClientContext } from '@/contexts/client-context'
import { usePreview } from '@/contexts/preview-context'
import { apiFetch } from '@/lib/api-client'
import { analyticsIntegrationsApi } from '@/lib/convex-api'
import { asErrorMessage, logError } from '@/lib/convex-errors'
import { DASHBOARD_THEME, PAGE_TITLES, getIconContainerClasses } from '@/lib/dashboard-theme'
import { cn } from '@/lib/utils'
import { DisconnectDialog } from '../ads/components/connection-dialog'
import { AnalyticsCharts } from './components/analytics-charts'
import { AnalyticsDateRangePicker, type AnalyticsDateRange } from './components/analytics-date-range-picker'
import { AnalyticsDeepDiveSection } from './components/analytics-deep-dive-section'
import { AnalyticsExportButton } from './components/analytics-export-button'
import { AnalyticsInsightsSection } from './components/analytics-insights-section'
import { AnalyticsMetricCards } from './components/analytics-metric-cards'
import { AnalyticsSummaryCards } from './components/analytics-summary-cards'
import { GoogleAnalyticsSetupDialog } from './components/google-analytics-setup-dialog'
import { useAnalyticsData, useGoogleAnalyticsSync } from './hooks'
import { buildGoogleAnalyticsStory } from './lib/google-analytics-story'

type GoogleAnalyticsPropertyOption = {
  id: string
  name: string
  resourceName: string
}

type GoogleAnalyticsStatusRow = {
  providerId: string
  accountId: string | null
  accountName: string | null
  linkedAtMs: number | null
  lastSyncStatus: string | null
  lastSyncMessage: string | null
  lastSyncedAtMs: number | null
  lastSyncRequestedAtMs: number | null
}

function formatRelativeSyncTime(valueMs: number | null): string {
  if (!valueMs) return 'Never'
  const deltaMs = Date.now() - valueMs
  const minutes = Math.floor(deltaMs / (60 * 1000))
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(valueMs).toLocaleDateString()
}

function mapOauthErrorToMessage(code: string | null, fallback: string | null): string {
  if (fallback && fallback.trim().length > 0) {
    return fallback
  }

  switch (code) {
    case 'missing_code':
      return 'Google did not return an authorization code. Please try connecting again.'
    case 'invalid_state':
      return 'The OAuth session expired or became invalid. Please retry the connection flow.'
    case 'config_error':
      return 'Google Analytics OAuth is not configured correctly. Please check environment variables.'
    case 'oauth_failed':
      return 'Google Analytics OAuth failed before setup could complete. Please try again.'
    case 'google_analytics_error':
      return 'Google returned an OAuth error. Please retry and grant all requested permissions.'
    default:
      return 'Unable to connect Google Analytics. Please try again.'
  }
}

export default function AnalyticsPage() {
  const { selectedClientId } = useClientContext()
  const { toast } = useToast()
  const { isPreviewMode } = usePreview()
  const { user } = useAuth()

  // Date range state - initialize with 30 days
  const [dateRange, setDateRange] = useState<AnalyticsDateRange>(() => {
    const end = endOfDay(new Date())
    const start = startOfDay(new Date(Date.now() - 29 * 24 * 60 * 60 * 1000)) // 30 days
    return { start, end }
  })
  const [periodDays, setPeriodDays] = useState(30)

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
  const [gaPropertyId, setGaPropertyId] = useState<string | null>(null)
  const [gaLastSyncStatus, setGaLastSyncStatus] = useState<string | null>(null)
  const [gaLastSyncMessage, setGaLastSyncMessage] = useState<string | null>(null)
  const [gaLastSyncedAtMs, setGaLastSyncedAtMs] = useState<number | null>(null)
  const [gaLastSyncRequestedAtMs, setGaLastSyncRequestedAtMs] = useState<number | null>(null)
  const [gaLoading, setGaLoading] = useState(false)
  const [gaSetupDialogOpen, setGaSetupDialogOpen] = useState(false)
  const [gaSetupMessage, setGaSetupMessage] = useState<string | null>(null)
  const [gaProperties, setGaProperties] = useState<GoogleAnalyticsPropertyOption[]>([])
  const [gaSelectedPropertyId, setGaSelectedPropertyId] = useState('')
  const [gaLoadingProperties, setGaLoadingProperties] = useState(false)
  const [gaInitializingProperty, setGaInitializingProperty] = useState(false)
  const [gaDisconnectDialogOpen, setGaDisconnectDialogOpen] = useState(false)
  const [gaDisconnecting, setGaDisconnecting] = useState(false)

  // TanStack Query mutation for Google Analytics sync
  const googleAnalyticsSyncMutation = useGoogleAnalyticsSync()
  const listGoogleAnalyticsProperties = useAction(analyticsIntegrationsApi.listGoogleAnalyticsProperties)
  const initializeGoogleAnalyticsProperty = useAction(analyticsIntegrationsApi.initializeGoogleAnalyticsProperty)
  const deleteGoogleAnalyticsIntegrationMutation = useMutation(analyticsIntegrationsApi.deleteGoogleAnalyticsIntegration)
  const deleteGoogleAnalyticsSyncJobsMutation = useMutation(analyticsIntegrationsApi.deleteGoogleAnalyticsSyncJobs)
  const deleteGoogleAnalyticsMetricsMutation = useMutation(analyticsIntegrationsApi.deleteGoogleAnalyticsMetrics)

  const workspaceId = user?.agencyId ? String(user.agencyId) : null

  const googleAnalyticsStatus = useQuery(
    analyticsIntegrationsApi.getGoogleAnalyticsStatus,
    isPreviewMode || !workspaceId || !user?.id
      ? 'skip'
      : {
          workspaceId,
          clientId: selectedClientId ?? null,
        }
  ) as GoogleAnalyticsStatusRow | null | undefined

  const refreshGoogleAnalyticsStatus = useCallback(async () => {
    if (isPreviewMode) {
      setGaConnected(false)
      setGaAccountLabel(null)
      setGaPropertyId(null)
      setGaLastSyncStatus(null)
      setGaLastSyncMessage(null)
      setGaLastSyncedAtMs(null)
      setGaLastSyncRequestedAtMs(null)
      return
    }

    const ga = googleAnalyticsStatus ?? null

    const linkedAtMs = typeof ga?.linkedAtMs === 'number' ? ga.linkedAtMs : null
    const accountName = typeof ga?.accountName === 'string' ? ga.accountName : null
    const accountId = typeof ga?.accountId === 'string' ? ga.accountId : null
    const syncStatus = typeof ga?.lastSyncStatus === 'string' ? ga.lastSyncStatus : null
    const syncMessage = typeof ga?.lastSyncMessage === 'string' ? ga.lastSyncMessage : null
    const lastSyncedAtMs = typeof ga?.lastSyncedAtMs === 'number' ? ga.lastSyncedAtMs : null
    const lastSyncRequestedAtMs = typeof ga?.lastSyncRequestedAtMs === 'number' ? ga.lastSyncRequestedAtMs : null

    setGaConnected(Boolean(linkedAtMs))
    setGaAccountLabel(accountName ?? accountId ?? null)
    setGaPropertyId(accountId)
    setGaLastSyncStatus(syncStatus)
    setGaLastSyncMessage(syncMessage)
    setGaLastSyncedAtMs(lastSyncedAtMs)
    setGaLastSyncRequestedAtMs(lastSyncRequestedAtMs)
  }, [googleAnalyticsStatus, isPreviewMode])

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      void refreshGoogleAnalyticsStatus()
    })

    return () => {
      cancelAnimationFrame(frame)
    }
  }, [refreshGoogleAnalyticsStatus])

  const gaNeedsPropertySelection = gaConnected && !gaPropertyId

  const loadGoogleAnalyticsPropertyOptions = useCallback(async (clientIdOverride?: string | null) => {
    if (!workspaceId) {
      return Promise.reject(new Error('Workspace context is required'))
    }

    requestAnimationFrame(() => {
      setGaLoadingProperties(true)
    })
    return listGoogleAnalyticsProperties({
      workspaceId,
      clientId: clientIdOverride ?? selectedClientId ?? null,
    })
      .then((payload) => {
        const options = Array.isArray(payload)
          ? (payload as GoogleAnalyticsPropertyOption[])
          : []

        setGaProperties(options)
        setGaSelectedPropertyId((current) => {
          if (current && options.some((option) => option.id === current)) {
            return current
          }
          return options[0]?.id ?? ''
        })

        return options
      })
      .catch((error) => {
        setGaProperties([])
        setGaSelectedPropertyId('')
        return Promise.reject(error)
      })
      .finally(() => {
        setGaLoadingProperties(false)
      })
  }, [listGoogleAnalyticsProperties, selectedClientId, workspaceId])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const url = new URL(window.location.href)
    const oauthSuccess = url.searchParams.get('oauth_success') === 'true'
    const oauthError = url.searchParams.get('oauth_error')
    const provider = url.searchParams.get('provider')
    const message = url.searchParams.get('message')

    if (!oauthSuccess && !oauthError) return
    if (provider !== 'google-analytics') return

    url.searchParams.delete('oauth_success')
    url.searchParams.delete('oauth_error')
    url.searchParams.delete('provider')
    url.searchParams.delete('message')
    window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`)

    requestAnimationFrame(() => {
      setGaLoading(false)
    })

    if (oauthSuccess) {
      requestAnimationFrame(() => {
        setGaSetupMessage(null)
        setGaSetupDialogOpen(true)
      })
      toast({
        title: 'Google Analytics connected',
        description: 'Select a property to finish setup.',
      })
      void loadGoogleAnalyticsPropertyOptions()
        .catch((error) => {
          const mappedMessage = asErrorMessage(error)
          requestAnimationFrame(() => {
            setGaSetupMessage(mappedMessage)
          })
          toast({ title: 'Property load failed', description: mappedMessage, variant: 'destructive' })
        })
    } else {
      const mappedMessage = mapOauthErrorToMessage(oauthError, message)
      toast({ title: 'Google Analytics connection failed', description: mappedMessage, variant: 'destructive' })
    }
  }, [loadGoogleAnalyticsPropertyOptions, toast])

  useEffect(() => {
    if (!gaNeedsPropertySelection || isPreviewMode) {
      return
    }

    if (!gaSetupDialogOpen) {
      requestAnimationFrame(() => {
        setGaSetupDialogOpen(true)
      })
    }

    if (gaLoadingProperties || gaProperties.length > 0) {
      return
    }

    void loadGoogleAnalyticsPropertyOptions()
      .catch((error) => {
        const message = asErrorMessage(error)
        requestAnimationFrame(() => {
          setGaSetupMessage(message)
        })
      })
  }, [
    gaLoadingProperties,
    gaNeedsPropertySelection,
    gaProperties.length,
    gaSetupDialogOpen,
    isPreviewMode,
    loadGoogleAnalyticsPropertyOptions,
  ])

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
  } = useAnalyticsData(null, periodDays, selectedClientId ?? null, isPreviewMode, user?.agencyId, {
    providerIds: ['google-analytics'],
    includeInsights: true,
  })

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

  const selectedRangeDays = useMemo(() => {
    return Math.max(differenceInDays(dateRange.end, dateRange.start) + 1, 1)
  }, [dateRange.end, dateRange.start])

  const handleConnectGoogleAnalytics = useCallback(async () => {
    if (isPreviewMode) {
      toast({ title: 'Preview mode', description: 'Google Analytics connection is disabled in preview mode.' })
      return
    }

    if (typeof window === 'undefined') {
      return
    }

    setGaSetupMessage(null)
    setGaLoading(true)

    try {
      const search = new URLSearchParams({
        redirect: `${window.location.pathname}${window.location.search}`,
      })
      if (selectedClientId) {
        search.set('clientId', selectedClientId)
      }

      const target = search.toString().length > 0
        ? `/api/integrations/google-analytics/oauth/start?${search.toString()}`
        : '/api/integrations/google-analytics/oauth/start'

      const payload = await apiFetch<{ url?: string }>(target)
      if (typeof payload?.url !== 'string' || payload.url.length === 0) {
        throw new Error('Google Analytics OAuth did not return a URL.')
      }

      window.location.href = payload.url
    } catch (error) {
      logError(error, 'AnalyticsPage:handleConnectGoogleAnalytics')
      toast({
        title: 'Unable to connect Google Analytics',
        description: asErrorMessage(error),
        variant: 'destructive',
      })
      setGaLoading(false)
    }
  }, [isPreviewMode, selectedClientId, toast])

  const handleSyncGoogleAnalytics = useCallback(() => {
    if (isPreviewMode) {
      toast({ title: 'Preview mode', description: 'Google Analytics sync is disabled in preview mode.' })
      return
    }

    if (!gaConnected) {
      toast({ title: 'Not connected', description: 'Connect Google Analytics before running a sync.', variant: 'destructive' })
      return
    }

    if (gaNeedsPropertySelection) {
      setGaSetupDialogOpen(true)
      toast({ title: 'Property required', description: 'Select a Google Analytics property before syncing.', variant: 'destructive' })
      return
    }

    void googleAnalyticsSyncMutation.mutateAsync({
        periodDays,
        clientId: selectedClientId,
      })
      .then((result) => {
        const propertyName = result?.propertyName
        const writtenDays = result?.written ?? 0

        toast({
          title: 'Google Analytics synced',
          description: propertyName
            ? `Imported ${writtenDays} day(s) from ${propertyName}.`
            : `Imported ${writtenDays} day(s).`,
        })

        return refreshGoogleAnalyticsStatus()
      })
      .then(() => mutateMetrics())
      .catch((error: unknown) => {
        logError(error, 'AnalyticsPage:handleSyncGoogleAnalytics')
        toast({ title: 'Sync failed', description: asErrorMessage(error), variant: 'destructive' })
      })
  }, [
    gaConnected,
    gaNeedsPropertySelection,
    googleAnalyticsSyncMutation,
    isPreviewMode,
    mutateMetrics,
    periodDays,
    refreshGoogleAnalyticsStatus,
    selectedClientId,
    toast,
  ])

  const handleOpenGoogleAnalyticsSetup = useCallback(() => {
    setGaSetupDialogOpen(true)
    setGaSetupMessage(null)
    void loadGoogleAnalyticsPropertyOptions()
      .catch((error) => {
        const message = asErrorMessage(error)
        setGaSetupMessage(message)
        toast({ title: 'Property load failed', description: message, variant: 'destructive' })
      })
  }, [loadGoogleAnalyticsPropertyOptions, toast])

  const handleFinalizeGoogleAnalyticsSetup = useCallback(() => {
    if (isPreviewMode) {
      return
    }

    if (!workspaceId) {
      toast({ title: 'Setup failed', description: 'Workspace context is required.', variant: 'destructive' })
      return
    }

    if (!gaSelectedPropertyId) {
      setGaSetupMessage('Please select a Google Analytics property to continue.')
      return
    }

    setGaInitializingProperty(true)
    setGaSetupMessage(null)

    const clientId = selectedClientId === undefined ? null : selectedClientId

    void initializeGoogleAnalyticsProperty({
      workspaceId,
      clientId,
      accountId: gaSelectedPropertyId,
    })
      .then((rawPayload) => {
        const payload = rawPayload as { accountName?: string }
        let description = 'Property linked successfully.'
        if (typeof payload.accountName === 'string' && payload.accountName.length > 0) {
          description = `Using property ${payload.accountName}.`
        }

        toast({
          title: 'Google Analytics setup complete',
          description,
        })

        setGaSetupDialogOpen(false)
        return refreshGoogleAnalyticsStatus().then(() => mutateMetrics())
      })
      .catch((error) => {
        const message = asErrorMessage(error)
        setGaSetupMessage(message)
        toast({ title: 'Setup failed', description: message, variant: 'destructive' })
      })
      .finally(() => {
        setGaInitializingProperty(false)
      })
  }, [
    gaSelectedPropertyId,
    initializeGoogleAnalyticsProperty,
    isPreviewMode,
    mutateMetrics,
    refreshGoogleAnalyticsStatus,
    selectedClientId,
    toast,
    workspaceId,
  ])

  const handleDisconnectGoogleAnalytics = useCallback((options: { clearHistoricalData: boolean }): Promise<void> => {
    if (isPreviewMode) {
      return Promise.resolve()
    }

    if (!workspaceId) {
      toast({ title: 'Disconnect failed', description: 'Workspace context is required.', variant: 'destructive' })
      return Promise.resolve()
    }

    setGaDisconnecting(true)

    const effectiveClientId = selectedClientId === undefined ? null : selectedClientId
    const deleteMetricsPromise = options.clearHistoricalData
      ? deleteGoogleAnalyticsMetricsMutation({
          workspaceId,
          clientId: effectiveClientId,
        }).then((result) => {
          const typedResult = result as { deleted?: number }
          return typeof typedResult.deleted === 'number' ? typedResult.deleted : 0
        })
      : Promise.resolve(0)

    return deleteMetricsPromise
      .then((deletedMetrics) => {
        return Promise.all([
          deleteGoogleAnalyticsSyncJobsMutation({
            workspaceId,
            clientId: effectiveClientId,
          }),
          deleteGoogleAnalyticsIntegrationMutation({
            workspaceId,
            clientId: effectiveClientId,
          }),
        ]).then(() => deletedMetrics)
      })
      .then((deletedMetrics) => {
        setGaSetupDialogOpen(false)
        setGaProperties([])
        setGaSelectedPropertyId('')
        return refreshGoogleAnalyticsStatus().then(() => deletedMetrics)
      })
      .then((deletedMetrics) => {
        toast({
          title: 'Google Analytics disconnected',
          description: options.clearHistoricalData
            ? `Disconnected and removed ${deletedMetrics} historical metric row(s).`
            : 'Disconnected. Historical metrics were kept.',
        })
      })
      .catch((error) => {
        toast({ title: 'Disconnect failed', description: asErrorMessage(error), variant: 'destructive' })
      })
      .finally(() => {
        setGaDisconnecting(false)
      })
  }, [
    deleteGoogleAnalyticsIntegrationMutation,
    deleteGoogleAnalyticsMetricsMutation,
    deleteGoogleAnalyticsSyncJobsMutation,
    isPreviewMode,
    refreshGoogleAnalyticsStatus,
    selectedClientId,
    toast,
    workspaceId,
  ])

  const initialMetricsLoading = metricsLoading && metrics.length === 0
  const initialInsightsLoading = insightsLoading && insights.length === 0 && algorithmic.length === 0

  const filteredMetrics = useMemo(() => {
    if (!metrics.length) return []
    const startMs = dateRange.start.getTime()
    const endMs = dateRange.end.getTime()
    return metrics.filter((metric) => {
      if (metric.providerId !== 'google-analytics') return false
      const metricDate = new Date(metric.date).getTime()
      return metricDate >= startMs && metricDate <= endMs
    })
  }, [dateRange, metrics])

  const aggregatedByDate = useMemo(() => {
    const map = new Map<string, { date: string; users: number; sessions: number; conversions: number; revenue: number }>()
    filteredMetrics.forEach((metric) => {
      const key = metric.date
      if (!map.has(key)) {
        map.set(key, { date: key, users: 0, sessions: 0, conversions: 0, revenue: 0 })
      }
      const entry = map.get(key)
      if (!entry) return
      entry.users += metric.impressions
      entry.sessions += metric.clicks
      entry.conversions += metric.conversions
      entry.revenue += metric.revenue ?? 0
    })
    return Array.from(map.values()).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }, [filteredMetrics])

  const totals = useMemo(() => {
    return filteredMetrics.reduce(
      (acc, metric) => {
        acc.users += metric.impressions
        acc.sessions += metric.clicks
        acc.conversions += metric.conversions
        acc.revenue += metric.revenue ?? 0
        return acc
      },
      { users: 0, sessions: 0, conversions: 0, revenue: 0 }
    )
  }, [filteredMetrics])

  const previousTotals = useMemo(() => {
    if (!metrics.length) {
      return { users: 0, sessions: 0, conversions: 0, revenue: 0 }
    }

    const previousEndMs = dateRange.start.getTime() - 1
    const previousStartMs = previousEndMs - selectedRangeDays * 24 * 60 * 60 * 1000 + 1

    return metrics.reduce(
      (acc, metric) => {
        if (metric.providerId !== 'google-analytics') return acc
        const metricDate = new Date(metric.date).getTime()
        if (metricDate < previousStartMs || metricDate > previousEndMs) return acc
        acc.users += metric.impressions
        acc.sessions += metric.clicks
        acc.conversions += metric.conversions
        acc.revenue += metric.revenue ?? 0
        return acc
      },
      { users: 0, sessions: 0, conversions: 0, revenue: 0 }
    )
  }, [dateRange.start, metrics, selectedRangeDays])

  const conversionRate = totals.sessions > 0 ? (totals.conversions / totals.sessions) * 100 : 0
  const avgUsersPerDay = totals.users / selectedRangeDays
  const avgSessionsPerDay = totals.sessions / selectedRangeDays
  const revenuePerSession = totals.sessions > 0 ? totals.revenue / totals.sessions : 0
  const sessionsPerUser = totals.users > 0 ? totals.sessions / totals.users : 0

  // Check if Google Analytics has been synced (has data for selected period)
  const hasGaData = filteredMetrics.length > 0
  const isGaSelectedWithoutData = gaConnected && !hasGaData && !initialMetricsLoading

  const gaStatusLabel = useMemo(() => {
    if (!gaConnected) return 'Not connected'
    if (gaNeedsPropertySelection) return 'Property setup required'
    if (gaLastSyncStatus === 'error') return 'Last sync failed'
    if (gaLastSyncStatus === 'pending') return 'Sync queued'
    if (gaLastSyncStatus === 'success') return 'Synced'
    return 'Connected'
  }, [gaConnected, gaLastSyncStatus, gaNeedsPropertySelection])

  const gaLastSyncedLabel = useMemo(() => formatRelativeSyncTime(gaLastSyncedAtMs), [gaLastSyncedAtMs])
  const gaLastRequestedLabel = useMemo(() => formatRelativeSyncTime(gaLastSyncRequestedAtMs), [gaLastSyncRequestedAtMs])

  const chartData = useMemo(() => {
    return aggregatedByDate.map((entry) => ({
      ...entry,
      conversionRate: entry.sessions > 0 ? (entry.conversions / entry.sessions) * 100 : 0,
    }))
  }, [aggregatedByDate])

  const story = useMemo(() => {
    return buildGoogleAnalyticsStory({
      currentTotals: totals,
      previousTotals,
      chartData,
      selectedRangeDays,
    })
  }, [chartData, previousTotals, selectedRangeDays, totals])

  return (
    <div className={DASHBOARD_THEME.layout.container}>
      {/* Header */}
      <div className="space-y-8 pb-10">
        {/* Header Section */}
        <div className={DASHBOARD_THEME.layout.header}>
          <div>
            <div className="mb-2 flex items-center gap-2">
              <div className={getIconContainerClasses('medium')}>
                <TrendingUp className="h-6 w-6" />
              </div>
              <h1 className={DASHBOARD_THEME.layout.title}>{PAGE_TITLES.analytics?.title ?? 'Analytics'}</h1>
            </div>
            <p className={cn(DASHBOARD_THEME.layout.subtitle, 'text-sm font-medium max-w-xl')}>
              {PAGE_TITLES.analytics?.description ?? 'Real-time performance metrics and cross-platform creative insights for your active campaigns.'}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <AnalyticsDateRangePicker
              value={dateRange}
              onChange={handleDateRangeChange}
            />
          </div>
        </div>

        {/* Google Analytics Integration */}
        <Card className="overflow-hidden border-0 bg-white shadow-[0_1px_2px_0_rgba(60,64,67,0.3),0_1px_3px_1px_rgba(60,64,67,0.15)] transition-all hover:shadow-[0_1px_3px_0_rgba(60,64,67,0.3),0_2px_8px_4px_rgba(60,64,67,0.1)]">
          <CardHeader className="flex flex-col gap-4 border-b border-[#dadce0] bg-white py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              {/* Google Analytics Logo */}
              <div className="flex h-10 w-10 items-center justify-center">
                <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" aria-hidden="true">
                  <path d="M22 12c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2s10 4.477 10 10z" fill="#F9AB00"/>
                  <path d="M12 2C6.477 2 2 6.477 2 12h10V2z" fill="#E37400"/>
                  <circle cx="12" cy="12" r="3" fill="#fff"/>
                </svg>
              </div>
              <div>
                <CardTitle className="text-sm font-medium text-[#202124] tracking-normal">Google Analytics</CardTitle>
                <CardDescription className="text-xs text-[#5f6368] leading-tight mt-0.5">
                  Import users, sessions, and conversions into your dashboard
                </CardDescription>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {gaConnected ? (
                <div
                  className={cn(
                    'inline-flex animate-in fade-in slide-in-from-right-2 duration-300 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium',
                    gaLastSyncStatus === 'error'
                      ? 'bg-[#fce8e6] text-[#c5221f]'
                      : gaNeedsPropertySelection
                        ? 'bg-[#fff8e1] text-[#8d6e00]'
                        : 'bg-[#e6f4ea] text-[#137333]'
                  )}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {gaStatusLabel}{gaAccountLabel ? ` · ${gaAccountLabel}` : ''}
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 rounded-full bg-[#fce8e6] px-3 py-1.5 text-xs font-medium text-[#c5221f]">
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
                  className="h-9 rounded-md border-[#dadce0] bg-white text-[#1a73e8] hover:bg-[#f8f9fa] hover:border-[#dadce0] text-sm font-medium transition-colors"
                >
                  {gaLoading ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <Link2 className="mr-2 h-4 w-4" />}
                  {gaConnected ? 'Reconnect account' : 'Connect Google'}
                </Button>
                {gaConnected ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleOpenGoogleAnalyticsSetup}
                    disabled={gaLoadingProperties || gaInitializingProperty}
                    className="h-9 rounded-md border-[#dadce0] bg-white text-[#5f6368] hover:bg-[#f8f9fa] hover:border-[#dadce0] text-sm font-medium transition-colors"
                  >
                    {gaNeedsPropertySelection ? 'Select property' : 'Change property'}
                  </Button>
                ) : null}
                {gaConnected ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setGaDisconnectDialogOpen(true)}
                    className="h-9 rounded-md border-[#dadce0] bg-white text-[#c5221f] hover:bg-[#fce8e6] hover:border-[#f5c6c4] text-sm font-medium transition-colors"
                  >
                    <Unlink className="mr-2 h-4 w-4" />
                    Disconnect
                  </Button>
                ) : null}
                <Button
                  type="button"
                  size="sm"
                  onClick={() => void handleSyncGoogleAnalytics()}
                  disabled={googleAnalyticsSyncMutation.isPending || gaLoading || !gaConnected || gaNeedsPropertySelection}
                  className="h-9 rounded-md bg-[#1a73e8] hover:bg-[#1557b0] text-white text-sm font-medium shadow-none transition-colors"
                >
                  {googleAnalyticsSyncMutation.isPending ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <RotateCw className="mr-2 h-4 w-4" />}
                  Sync data
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="bg-[#f8f9fa] py-3 px-4">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#e8f0fe]">
                  <TrendingUp className="h-3 w-3 text-[#1a73e8]" />
                </div>
                <p className="text-xs text-[#5f6368]">
                  Last successful sync: <span className="font-medium text-[#202124]">{gaLastSyncedLabel}</span>
                  {' · '}
                  Last sync request: <span className="font-medium text-[#202124]">{gaLastRequestedLabel}</span>
                </p>
              </div>
              {gaNeedsPropertySelection ? (
                <p className="text-xs text-[#8d6e00] pl-7">
                  Property selection is required before sync can run.
                </p>
              ) : null}
              {gaLastSyncStatus === 'error' && gaLastSyncMessage ? (
                <p className="text-xs text-[#c5221f] pl-7">{gaLastSyncMessage}</p>
              ) : null}
            </div>
          </CardContent>
        </Card>

        <GoogleAnalyticsSetupDialog
          open={gaSetupDialogOpen}
          onOpenChange={setGaSetupDialogOpen}
          setupMessage={gaSetupMessage}
          properties={gaProperties}
          selectedPropertyId={gaSelectedPropertyId}
          onPropertySelectionChange={setGaSelectedPropertyId}
          loadingProperties={gaLoadingProperties}
          initializing={gaInitializingProperty}
          onReloadProperties={() => void loadGoogleAnalyticsPropertyOptions()}
          onInitialize={() => void handleFinalizeGoogleAnalyticsSetup()}
        />

        <DisconnectDialog
          open={gaDisconnectDialogOpen}
          onOpenChange={setGaDisconnectDialogOpen}
          providerName="Google Analytics"
          onConfirm={handleDisconnectGoogleAnalytics}
          isDisconnecting={gaDisconnecting}
        />

        {/* Error Alert */}
        {metricsError && (
          <Alert variant="destructive">
            <AlertTitle>Unable to load analytics</AlertTitle>
            <AlertDescription>{asErrorMessage(metricsError)}</AlertDescription>
          </Alert>
        )}

        {/* Empty State for Google Analytics when not synced */}
        {isGaSelectedWithoutData ? (
          <Card className="overflow-hidden border-0 bg-white shadow-[0_1px_2px_0_rgba(60,64,67,0.3),0_1px_3px_1px_rgba(60,64,67,0.15)]">
            <CardContent className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#f8f9fa]">
                <svg viewBox="0 0 24 24" className="h-12 w-12" fill="none" aria-hidden="true">
                  <path d="M22 12c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2s10 4.477 10 10z" fill="#F9AB00"/>
                  <path d="M12 2C6.477 2 2 6.477 2 12h10V2z" fill="#E37400"/>
                  <circle cx="12" cy="12" r="3" fill="#fff"/>
                </svg>
              </div>
              <h3 className="mb-2 text-base font-medium text-[#202124]">No analytics data yet</h3>
              <p className="mb-6 max-w-md text-sm text-[#5f6368]">
                Connect your Google Analytics property and sync your data to view users, sessions, conversions, and revenue trends.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                {!gaConnected && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => void handleConnectGoogleAnalytics()}
                    disabled={gaLoading}
                    className="rounded-md border-[#dadce0] bg-white text-[#1a73e8] hover:bg-[#f8f9fa]"
                  >
                    {gaLoading ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <Link2 className="mr-2 h-4 w-4" />}
                    Link Google Analytics
                  </Button>
                )}
                {gaConnected && gaNeedsPropertySelection ? (
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleOpenGoogleAnalyticsSetup}
                    className="rounded-md bg-[#1a73e8] hover:bg-[#1557b0] text-white shadow-none"
                  >
                    Select property
                  </Button>
                ) : (
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => void handleSyncGoogleAnalytics()}
                    disabled={googleAnalyticsSyncMutation.isPending || gaLoading || !gaConnected}
                    className="rounded-md bg-[#1a73e8] hover:bg-[#1557b0] text-white shadow-none"
                  >
                    {googleAnalyticsSyncMutation.isPending ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <RotateCw className="mr-2 h-4 w-4" />}
                    Sync data now
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : googleAnalyticsSyncMutation.isPending ? (
          <Card className="overflow-hidden border-0 bg-white shadow-[0_1px_2px_0_rgba(60,64,67,0.3),0_1px_3px_1px_rgba(60,64,67,0.15)]">
            <CardContent className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#e8f0fe]">
                <LoaderCircle className="h-10 w-10 animate-spin text-[#1a73e8]" />
              </div>
              <h3 className="mb-2 text-base font-medium text-[#202124]">Syncing analytics data</h3>
              <p className="max-w-md text-sm text-[#5f6368]">
                Importing your Google Analytics data. This may take a moment...
              </p>
            </CardContent>
          </Card>
        ) : !gaConnected ? null : (
          <>
            {/* Performance Summary Header */}
            <div className="flex items-center justify-between border-b border-muted/10 pb-2">
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground/70">Property performance</h2>
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
              conversionRate={conversionRate}
              isLoading={initialMetricsLoading}
            />

            {/* Advanced Metric Cards */}
            <AnalyticsMetricCards
              avgUsersPerDay={avgUsersPerDay}
              avgSessionsPerDay={avgSessionsPerDay}
              revenuePerSession={revenuePerSession}
              sessionsPerUser={sessionsPerUser}
              conversionRate={conversionRate}
              isLoading={initialMetricsLoading}
            />

            <AnalyticsDeepDiveSection story={story} />

            {/* Charts Grid */}
            <AnalyticsCharts
              chartData={chartData}
              isMetricsLoading={metricsLoading}
              initialMetricsLoading={initialMetricsLoading}
            />

            <AnalyticsInsightsSection
              insights={insights}
              algorithmic={algorithmic}
              insightsError={insightsError}
              insightsLoading={insightsLoading}
              insightsRefreshing={insightsRefreshing}
              initialInsightsLoading={initialInsightsLoading}
              onRefreshInsights={() => {
                void mutateInsights()
              }}
            />
          </>
        )}
      </div>
    </div>
  )
}
