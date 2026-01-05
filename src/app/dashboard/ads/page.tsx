'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Facebook, Linkedin, Music, Search } from 'lucide-react'

import { AdConnectionsCard } from '@/components/dashboard/ad-connections-card'
import { FadeIn } from '@/components/ui/animate-in'
import { useAuth } from '@/contexts/auth-context'
import { useToast } from '@/components/ui/use-toast'
import { formatCurrency } from '@/lib/utils'

import {
  AdsSkeleton,
  AutomationControlsCard,
  CrossChannelOverviewCard,
  PerformanceSummaryCard,
  MetricsTableCard,
  WorkflowCard,
  SetupAlerts,
  // Types
  type IntegrationStatusResponse,
  type MetricRecord,
  type ProviderSummary,
  type Totals,
  type ProviderAutomationFormState,
  type AdPlatform,
  type SummaryCard,
  // Utils
  METRICS_PAGE_SIZE,
  DEFAULT_SYNC_FREQUENCY_MINUTES,
  DEFAULT_TIMEFRAME_DAYS,
  fetchIntegrationStatuses,
  fetchMetrics,
  normalizeFrequency,
  normalizeTimeframe,
  getErrorMessage,
  formatProviderName,
  exportMetricsToCsv,
} from './components'

export default function AdsPage() {
  const {
    user,
    connectGoogleAdsAccount,
    connectLinkedInAdsAccount,
    startMetaOauth,
    startTikTokOauth,
    disconnectProvider,
    getIdToken,
  } = useAuth()
  const { toast } = useToast()

  // Connection state
  const [connectingProvider, setConnectingProvider] = useState<string | null>(null)
  const [connectionErrors, setConnectionErrors] = useState<Record<string, string>>({})
  const [connectedProviders, setConnectedProviders] = useState<Record<string, boolean>>({})
  const [integrationStatuses, setIntegrationStatuses] = useState<IntegrationStatusResponse | null>(null)

  // Metrics state
  const [metrics, setMetrics] = useState<MetricRecord[]>([])
  const [metricsLoading, setMetricsLoading] = useState(false)
  const [metricError, setMetricError] = useState<string | null>(null)
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [loadingMore, setLoadingMore] = useState(false)
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null)
  const [refreshTick, setRefreshTick] = useState(0)
  const [viewTimeframe, setViewTimeframe] = useState(30)

  // Setup state
  const [metaSetupMessage, setMetaSetupMessage] = useState<string | null>(null)
  const [tiktokSetupMessage, setTiktokSetupMessage] = useState<string | null>(null)
  const [initializingMeta, setInitializingMeta] = useState(false)
  const [initializingTikTok, setInitializingTikTok] = useState(false)

  // Automation state
  const [automationDraft, setAutomationDraft] = useState<Record<string, ProviderAutomationFormState>>({})
  const [savingSettings, setSavingSettings] = useState<Record<string, boolean>>({})
  const [settingsErrors, setSettingsErrors] = useState<Record<string, string>>({})
  const [expandedProviders, setExpandedProviders] = useState<Record<string, boolean>>({})
  const [syncingProvider, setSyncingProvider] = useState<string | null>(null)

  const hasMetricData = metrics.length > 0
  const initialMetricsLoading = metricsLoading && !hasMetricData

  // Initialize integrations
  const initializeGoogleIntegration = useCallback(async () => {
    const token = await getIdToken()
    const response = await fetch('/api/integrations/google/initialize', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!response.ok) {
      const payload = await response.json().catch(() => ({}))
      throw new Error((payload as { error?: string }).error ?? 'Failed to initialize Google Ads')
    }
    return response.json()
  }, [getIdToken])

  const initializeLinkedInIntegration = useCallback(async () => {
    const token = await getIdToken()
    const response = await fetch('/api/integrations/linkedin/initialize', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!response.ok) {
      const payload = await response.json().catch(() => ({}))
      throw new Error((payload as { error?: string }).error ?? 'Failed to initialize LinkedIn Ads')
    }
    return response.json()
  }, [getIdToken])

  const initializeMetaIntegration = useCallback(async () => {
    setMetaSetupMessage(null)
    setInitializingMeta(true)
    try {
      const token = await getIdToken()
      const response = await fetch('/api/integrations/meta/initialize', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      const payload = (await response.json().catch(() => ({}))) as { accountName?: string; error?: string }
      if (!response.ok) {
        throw new Error(payload?.error ?? 'Failed to finish Meta Ads setup')
      }
      toast({
        title: 'Meta Ads connected!',
        description: payload?.accountName
          ? `Syncing data from ${payload.accountName}.`
          : 'Default ad account linked successfully.',
      })
      setRefreshTick((tick) => tick + 1)
    } catch (error: unknown) {
      const message = getErrorMessage(error, 'Unable to complete Meta setup')
      setMetaSetupMessage(message)
      toast({ variant: 'destructive', title: 'Meta setup failed', description: message })
    } finally {
      setInitializingMeta(false)
    }
  }, [getIdToken, toast])

  const initializeTikTokIntegration = useCallback(async () => {
    setTiktokSetupMessage(null)
    setInitializingTikTok(true)
    try {
      const token = await getIdToken()
      const response = await fetch('/api/integrations/tiktok/initialize', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      const payload = (await response.json().catch(() => ({}))) as { accountName?: string; error?: string }
      if (!response.ok) {
        throw new Error(payload?.error ?? 'Failed to finish TikTok Ads setup')
      }
      toast({
        title: 'TikTok Ads connected!',
        description: payload?.accountName
          ? `Syncing data from ${payload.accountName}.`
          : 'Default ad account linked successfully.',
      })
      setRefreshTick((tick) => tick + 1)
    } catch (error: unknown) {
      const message = getErrorMessage(error, 'Unable to complete TikTok setup')
      setTiktokSetupMessage(message)
      toast({ variant: 'destructive', title: 'TikTok setup failed', description: message })
    } finally {
      setInitializingTikTok(false)
    }
  }, [getIdToken, toast])

  // Automation handlers
  const updateAutomationDraft = useCallback(
    (providerId: string, updates: Partial<ProviderAutomationFormState>) => {
      setAutomationDraft((prev) => {
        const current = prev[providerId] ?? {
          autoSyncEnabled: true,
          syncFrequencyMinutes: DEFAULT_SYNC_FREQUENCY_MINUTES,
          scheduledTimeframeDays: DEFAULT_TIMEFRAME_DAYS,
        }
        return { ...prev, [providerId]: { ...current, ...updates } }
      })
      setSettingsErrors((prev) => {
        if (!prev[providerId]) return prev
        const next = { ...prev }
        delete next[providerId]
        return next
      })
    },
    []
  )

  const handleSaveAutomation = useCallback(
    async (providerId: string) => {
      const draft = automationDraft[providerId]
      if (!draft) {
        toast({
          variant: 'destructive',
          title: 'No settings to save',
          description: 'Connect an integration before adjusting automation.',
        })
        return
      }
      if (!user?.id) {
        toast({
          variant: 'destructive',
          title: 'Session expired',
          description: 'Please sign in again to update your preferences.',
        })
        return
      }

      setSavingSettings((prev) => ({ ...prev, [providerId]: true }))
      setSettingsErrors((prev) => ({ ...prev, [providerId]: '' }))

      try {
        const token = await getIdToken()
        const response = await fetch('/api/integrations/settings', {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            providerId,
            autoSyncEnabled: draft.autoSyncEnabled,
            syncFrequencyMinutes: draft.syncFrequencyMinutes,
            scheduledTimeframeDays: draft.scheduledTimeframeDays,
          }),
        })
        if (!response.ok) {
          const payload = await response.json().catch(() => ({}))
          throw new Error(payload.error ?? 'Failed to update automation settings')
        }
        toast({
          title: 'Automation updated',
          description: `${formatProviderName(providerId)} sync settings saved.`,
        })
        setRefreshTick((tick) => tick + 1)
      } catch (error: unknown) {
        const message = getErrorMessage(error, 'Unable to update automation settings')
        setSettingsErrors((prev) => ({ ...prev, [providerId]: message }))
        toast({ variant: 'destructive', title: 'Save failed', description: message })
      } finally {
        setSavingSettings((prev) => ({ ...prev, [providerId]: false }))
      }
    },
    [automationDraft, getIdToken, toast, user?.id]
  )

  const toggleAdvanced = useCallback((providerId: string) => {
    setExpandedProviders((prev) => ({ ...prev, [providerId]: !prev[providerId] }))
  }, [])

  const runManualSync = useCallback(
    async (providerId: string) => {
      if (!user?.id) {
        toast({ variant: 'destructive', title: 'Unable to sync', description: 'Sign in again to run a sync.' })
        return
      }
      setSyncingProvider(providerId)
      try {
        const token = await getIdToken()
        const scheduleResponse = await fetch('/api/integrations/manual-sync', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ providerId, force: true }),
        })
        const schedulePayload = (await scheduleResponse.json().catch(() => ({}))) as { scheduled?: boolean; message?: string }
        if (!scheduleResponse.ok) {
          throw new Error(schedulePayload?.message ?? 'Failed to queue sync job')
        }
        if (!schedulePayload?.scheduled) {
          toast({
            title: 'Nothing to sync right now',
            description: schedulePayload?.message ?? 'A sync is already running for this provider.',
          })
          return
        }
        const processResponse = await fetch('/api/integrations/process', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        })
        if (!processResponse.ok && processResponse.status !== 204) {
          const payload = await processResponse.json().catch(() => ({}))
          throw new Error((payload as { error?: string }).error ?? 'Sync processor failed')
        }
        toast({ title: 'Sync complete', description: `${formatProviderName(providerId)} metrics refreshed.` })
        setRefreshTick((tick) => tick + 1)
      } catch (error: unknown) {
        toast({ variant: 'destructive', title: 'Sync failed', description: getErrorMessage(error, 'Unable to run sync job') })
      } finally {
        setSyncingProvider(null)
      }
    },
    [getIdToken, toast, user?.id]
  )

  // Data loading effects
  useEffect(() => {
    if (!user?.id) {
      setIntegrationStatuses(null)
      setMetrics([])
      setMetricsLoading(false)
      setNextCursor(null)
      setLoadMoreError(null)
      return
    }

    let isSubscribed = true
    const loadData = async () => {
      if (isSubscribed) {
        setMetricsLoading(true)
        setMetricError(null)
        setLoadMoreError(null)
        setNextCursor(null)
      }
      try {
        const token = await getIdToken()
        const [statusResponse, metricResponse] = await Promise.all([
          fetchIntegrationStatuses(token, user.id),
          fetchMetrics(token, { userId: user.id, pageSize: METRICS_PAGE_SIZE }),
        ])
        if (isSubscribed) {
          setIntegrationStatuses(statusResponse)
          setMetrics(metricResponse.metrics)
          setNextCursor(metricResponse.nextCursor)
          setLoadMoreError(null)
        }
      } catch (error: unknown) {
        if (isSubscribed) {
          setMetricError(getErrorMessage(error, 'Failed to load marketing data'))
          setNextCursor(null)
          setMetrics([])
        }
      } finally {
        if (isSubscribed) setMetricsLoading(false)
      }
    }
    void loadData()
    return () => { isSubscribed = false }
  }, [user?.id, refreshTick, getIdToken])

  useEffect(() => {
    if (!integrationStatuses) return
    const updatedConnected: Record<string, boolean> = {}
    integrationStatuses.statuses.forEach((status) => {
      updatedConnected[status.providerId] = status.status === 'success'
    })
    setConnectedProviders(updatedConnected)
  }, [integrationStatuses])

  // OAuth cookie handlers
  useEffect(() => {
    if (typeof document === 'undefined') return
    const hasMetaCookie = document.cookie.split(';').some((c) => c.trim().startsWith('meta_oauth_success='))
    if (!hasMetaCookie) return
    document.cookie = 'meta_oauth_success=; Path=/; Max-Age=0; SameSite=Lax'
    void initializeMetaIntegration()
  }, [initializeMetaIntegration])

  useEffect(() => {
    if (typeof document === 'undefined') return
    const hasTikTokCookie = document.cookie.split(';').some((c) => c.trim().startsWith('tiktok_oauth_success='))
    if (!hasTikTokCookie) return
    document.cookie = 'tiktok_oauth_success=; Path=/; Max-Age=0; SameSite=Lax'
    void initializeTikTokIntegration()
  }, [initializeTikTokIntegration])

  // Sync automation draft with server state
  useEffect(() => {
    if (!integrationStatuses || integrationStatuses.statuses.length === 0) {
      setAutomationDraft({})
      return
    }
    const nextDraft: Record<string, ProviderAutomationFormState> = {}
    integrationStatuses.statuses.forEach((status) => {
      nextDraft[status.providerId] = {
        autoSyncEnabled: status.autoSyncEnabled !== false,
        syncFrequencyMinutes: normalizeFrequency(status.syncFrequencyMinutes ?? null),
        scheduledTimeframeDays: normalizeTimeframe(status.scheduledTimeframeDays ?? null),
      }
    })
    setAutomationDraft(nextDraft)
  }, [integrationStatuses])

  // Computed values
  const automationStatuses = useMemo(() => integrationStatuses?.statuses ?? [], [integrationStatuses])

  const metaStatus = useMemo(
    () => automationStatuses.find((s) => s.providerId === 'facebook'),
    [automationStatuses]
  )
  const metaNeedsAccountSelection = Boolean(metaStatus?.linkedAt && !metaStatus.accountId)

  const tiktokStatus = useMemo(
    () => automationStatuses.find((s) => s.providerId === 'tiktok'),
    [automationStatuses]
  )
  const tiktokNeedsAccountSelection = Boolean(tiktokStatus?.linkedAt && !tiktokStatus.accountId)

  const processedMetrics = useMemo(() => {
    const uniqueMap = new Map<string, MetricRecord>()
    metrics.forEach((m) => {
      const key = `${m.providerId}|${m.date}`
      const existing = uniqueMap.get(key)
      if (!existing || (m.createdAt && existing.createdAt && m.createdAt > existing.createdAt)) {
        uniqueMap.set(key, m)
      } else if (!existing?.createdAt && m.createdAt) {
        uniqueMap.set(key, m)
      } else if (!existing && !m.createdAt) {
        uniqueMap.set(key, m)
      }
    })
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - viewTimeframe)
    cutoff.setHours(0, 0, 0, 0)
    return Array.from(uniqueMap.values())
      .filter((m) => {
        const d = new Date(m.date)
        return !Number.isNaN(d.getTime()) && d >= cutoff
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [metrics, viewTimeframe])

  const providerSummaries = useMemo(() => {
    const summary: Record<string, ProviderSummary> = {}
    processedMetrics.forEach((metric) => {
      if (!summary[metric.providerId]) {
        summary[metric.providerId] = { spend: 0, impressions: 0, clicks: 0, conversions: 0, revenue: 0 }
      }
      const s = summary[metric.providerId]
      s.spend += metric.spend
      s.impressions += metric.impressions
      s.clicks += metric.clicks
      s.conversions += metric.conversions
      s.revenue += metric.revenue ?? 0
    })
    return summary
  }, [processedMetrics])

  const totals: Totals = useMemo(() => {
    return processedMetrics.reduce(
      (acc, m) => {
        acc.spend += m.spend
        acc.impressions += m.impressions
        acc.clicks += m.clicks
        acc.conversions += m.conversions
        acc.revenue += m.revenue ?? 0
        return acc
      },
      { spend: 0, impressions: 0, clicks: 0, conversions: 0, revenue: 0 }
    )
  }, [processedMetrics])

  const summaryCards: SummaryCard[] = useMemo(() => {
    const averageCpc = totals.clicks > 0 ? totals.spend / totals.clicks : 0
    const roas = totals.spend > 0 ? totals.revenue / totals.spend : 0
    return [
      {
        id: 'spend',
        label: 'Total Spend',
        value: formatCurrency(totals.spend),
        helper: hasMetricData ? 'All connected platforms combined' : 'Connect a platform to populate',
      },
      {
        id: 'impressions',
        label: 'Impressions',
        value: totals.impressions > 0 ? totals.impressions.toLocaleString() : '—',
        helper: hasMetricData ? 'Total times ads were served' : 'Awaiting your first sync',
      },
      {
        id: 'avg-cpc',
        label: 'Avg CPC',
        value: totals.clicks > 0 ? formatCurrency(averageCpc) : '—',
        helper: totals.clicks > 0 ? 'What each click cost on average' : 'Need click data to calculate',
      },
      {
        id: 'roas',
        label: 'ROAS',
        value: roas > 0 ? `${roas.toFixed(2)}x` : '—',
        helper: roas > 0 ? 'Revenue ÷ spend (higher is better)' : 'Needs revenue and spend data',
      },
    ]
  }, [totals, hasMetricData])

  const adPlatforms: AdPlatform[] = [
    {
      id: 'google',
      name: 'Google Ads',
      description: 'Import campaign performance, budgets, and ROAS insights directly from Google Ads.',
      icon: Search,
      connect: connectGoogleAdsAccount,
    },
    {
      id: 'facebook',
      name: 'Meta Ads Manager',
      description: 'Pull spend, results, and creative breakdowns from Meta and Instagram campaigns.',
      icon: Facebook,
      mode: 'oauth',
    },
    {
      id: 'linkedin',
      name: 'LinkedIn Ads',
      description: 'Sync lead-gen form results and campaign analytics from LinkedIn.',
      icon: Linkedin,
      connect: connectLinkedInAdsAccount,
    },
    {
      id: 'tiktok',
      name: 'TikTok Ads',
      description: 'Bring in spend, engagement, and conversion insights from TikTok campaign flights.',
      icon: Music,
      mode: 'oauth',
    },
  ]

  // Handlers
  const handleConnect = async (providerId: string, action: () => Promise<void>) => {
    setConnectingProvider(providerId)
    setConnectionErrors((prev) => ({ ...prev, [providerId]: '' }))
    try {
      await action()
      if (providerId === 'google') await initializeGoogleIntegration()
      else if (providerId === 'linkedin') await initializeLinkedInIntegration()
      setConnectedProviders((prev) => ({ ...prev, [providerId]: true }))
      setRefreshTick((tick) => tick + 1)
    } catch (error: unknown) {
      const message = getErrorMessage(error, 'Unable to connect. Please try again.')
      setConnectionErrors((prev) => ({ ...prev, [providerId]: message }))
      setConnectedProviders((prev) => ({ ...prev, [providerId]: false }))
    } finally {
      setConnectingProvider(null)
    }
  }

  const handleManualRefresh = () => {
    if (metricsLoading) return
    setMetrics([])
    setNextCursor(null)
    setLoadMoreError(null)
    setMetricError(null)
    setRefreshTick((tick) => tick + 1)
  }

  const handleLoadMore = useCallback(async () => {
    if (!nextCursor || loadingMore || metricsLoading || !user?.id) return
    setLoadingMore(true)
    setLoadMoreError(null)
    try {
      const token = await getIdToken()
      const response = await fetchMetrics(token, { userId: user.id, cursor: nextCursor, pageSize: METRICS_PAGE_SIZE })
      setMetrics((prev) => [...prev, ...response.metrics])
      setNextCursor(response.nextCursor)
    } catch (error: unknown) {
      setLoadMoreError(getErrorMessage(error, 'Failed to load additional rows'))
    } finally {
      setLoadingMore(false)
    }
  }, [getIdToken, loadingMore, metricsLoading, nextCursor, user?.id])

  const handleOauthRedirect = async (providerId: string) => {
    if (typeof window === 'undefined') return
    if (providerId === 'facebook') setMetaSetupMessage(null)
    if (providerId === 'tiktok') setTiktokSetupMessage(null)

    setConnectingProvider(providerId)
    setConnectionErrors((prev) => ({ ...prev, [providerId]: '' }))

    try {
      const redirectTarget = `${window.location.origin}/dashboard/ads`
      if (providerId === 'facebook') {
        const { url } = await startMetaOauth(redirectTarget)
        window.location.href = url
        return
      }
      if (providerId === 'tiktok') {
        const { url } = await startTikTokOauth(redirectTarget)
        window.location.href = url
        return
      }
      throw new Error('This provider does not support OAuth yet.')
    } catch (error: unknown) {
      const message = getErrorMessage(
        error,
        providerId === 'facebook'
          ? 'Unable to start Meta OAuth. Please try again.'
          : providerId === 'tiktok'
            ? 'Unable to start TikTok OAuth. Please try again.'
            : 'Unable to start OAuth. Please try again.'
      )
      setConnectionErrors((prev) => ({ ...prev, [providerId]: message }))
      if (providerId === 'facebook' && message.toLowerCase().includes('meta business login is not configured')) {
        setMetaSetupMessage('Meta business login is not configured. Add META_APP_ID, META_BUSINESS_CONFIG_ID, and META_OAUTH_REDIRECT_URI environment variables.')
      }
      if (providerId === 'tiktok' && message.toLowerCase().includes('tiktok oauth is not configured')) {
        setTiktokSetupMessage('TikTok OAuth is not configured. Add TIKTOK_CLIENT_KEY, TIKTOK_CLIENT_SECRET, and TIKTOK_OAUTH_REDIRECT_URI environment variables.')
      }
    } finally {
      setConnectingProvider(null)
    }
  }

  const handleDisconnect = async (providerId: string) => {
    if (!confirm(`Are you sure you want to disconnect ${formatProviderName(providerId)}? This will stop all future syncs.`)) return
    setConnectingProvider(providerId)
    setConnectionErrors((prev) => ({ ...prev, [providerId]: '' }))
    try {
      await disconnectProvider(providerId)
      setConnectedProviders((prev) => ({ ...prev, [providerId]: false }))
      toast({ title: 'Disconnected', description: `${formatProviderName(providerId)} has been disconnected.` })
      setRefreshTick((tick) => tick + 1)
    } catch (error: unknown) {
      const message = getErrorMessage(error, 'Unable to disconnect. Please try again.')
      setConnectionErrors((prev) => ({ ...prev, [providerId]: message }))
      toast({ variant: 'destructive', title: 'Disconnect failed', description: message })
    } finally {
      setConnectingProvider(null)
    }
  }

  const handleExport = () => exportMetricsToCsv(processedMetrics)

  // Loading state
  const isInitialLoading = metricsLoading && metrics.length === 0 && !integrationStatuses
  if (isInitialLoading) return <AdsSkeleton />

  const showWorkflow =
    !integrationStatuses ||
    integrationStatuses.statuses.length === 0 ||
    integrationStatuses.statuses.every((s) => s.status !== 'success')

  return (
    <div className="space-y-6">
      <FadeIn>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Ads Hub</h1>
          <p className="text-sm text-muted-foreground">
            Connect paid media accounts, trigger data syncs, and review cross-channel performance in one place.
          </p>
        </div>
      </FadeIn>

      {showWorkflow && (
        <FadeIn>
          <WorkflowCard />
        </FadeIn>
      )}

      <FadeIn>
        <SetupAlerts
          metaSetupMessage={metaSetupMessage}
          metaNeedsAccountSelection={metaNeedsAccountSelection}
          initializingMeta={initializingMeta}
          onInitializeMeta={() => void initializeMetaIntegration()}
          tiktokSetupMessage={tiktokSetupMessage}
          tiktokNeedsAccountSelection={tiktokNeedsAccountSelection}
          initializingTikTok={initializingTikTok}
          onInitializeTikTok={() => void initializeTikTokIntegration()}
        />
      </FadeIn>

      <FadeIn>
        <div id="connect-ad-platforms">
          <AdConnectionsCard
            providers={adPlatforms}
            connectedProviders={connectedProviders}
            connectingProvider={connectingProvider}
            connectionErrors={connectionErrors}
            onConnect={handleConnect}
            onDisconnect={handleDisconnect}
            onOauthRedirect={handleOauthRedirect}
            onRefresh={handleManualRefresh}
            refreshing={metricsLoading}
          />
        </div>
      </FadeIn>

      <FadeIn>
        <AutomationControlsCard
          automationStatuses={automationStatuses}
          automationDraft={automationDraft}
          savingSettings={savingSettings}
          settingsErrors={settingsErrors}
          expandedProviders={expandedProviders}
          syncingProvider={syncingProvider}
          onUpdateDraft={updateAutomationDraft}
          onSaveAutomation={(id) => void handleSaveAutomation(id)}
          onToggleAdvanced={toggleAdvanced}
          onRunManualSync={(id) => void runManualSync(id)}
        />
      </FadeIn>

      <FadeIn>
        <CrossChannelOverviewCard
          summaryCards={summaryCards}
          processedMetrics={processedMetrics}
          hasMetricData={hasMetricData}
          initialMetricsLoading={initialMetricsLoading}
          metricsLoading={metricsLoading}
          viewTimeframe={viewTimeframe}
          onViewTimeframeChange={setViewTimeframe}
          onExport={handleExport}
        />
      </FadeIn>

      <FadeIn>
        <PerformanceSummaryCard
          providerSummaries={providerSummaries}
          hasMetrics={hasMetricData}
          initialMetricsLoading={initialMetricsLoading}
          metricsLoading={metricsLoading}
          metricError={metricError}
          onRefresh={handleManualRefresh}
          onExport={handleExport}
        />
      </FadeIn>

      <FadeIn>
        <MetricsTableCard
          processedMetrics={processedMetrics}
          hasMetrics={hasMetricData}
          initialMetricsLoading={initialMetricsLoading}
          metricsLoading={metricsLoading}
          metricError={metricError}
          nextCursor={nextCursor}
          loadingMore={loadingMore}
          loadMoreError={loadMoreError}
          onRefresh={handleManualRefresh}
          onLoadMore={() => void handleLoadMore()}
        />
      </FadeIn>
    </div>
  )
}
