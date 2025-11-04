
"use client"

import Link from 'next/link'
import { useCallback, useEffect, useMemo, useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import {
  AlertCircle,
  Facebook,
  Linkedin,
  Loader2,
  Music,
  RefreshCw,
  Search,
  Sparkles,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { cn } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'
import { AdConnectionsCard } from '@/components/dashboard/ad-connections-card'
import { FadeIn, FadeInItem, FadeInStagger } from '@/components/ui/animate-in'
import { useAuth } from '@/contexts/auth-context'
import { Skeleton } from '@/components/ui/skeleton'
import { AdsSkeleton } from '@/app/dashboard/ads/components/ads-skeleton'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/use-toast'

const ADS_WORKFLOW_STEPS = [
  {
    title: 'Connect your ad accounts',
    description: 'Hook up Google, Meta, LinkedIn, or TikTok so Cohorts can pull spend and performance data.',
  },
  {
    title: 'Enable auto-sync',
    description: 'Turn on automatic syncs to keep campaign metrics and reports fresh without manual exports.',
  },
  {
    title: 'Review cross-channel insights',
    description: 'Use the overview cards and tables below to compare performance and spot optimisation wins.',
  },
] as const

interface IntegrationStatusResponse {
  statuses: Array<{
    providerId: string
    status: string
    lastSyncedAt?: string | null
    lastSyncRequestedAt?: string | null
    message?: string | null
    linkedAt?: string | null
    autoSyncEnabled?: boolean | null
    syncFrequencyMinutes?: number | null
    scheduledTimeframeDays?: number | null
  }>
}

interface MetricRecord {
  id: string
  providerId: string
  date: string
  spend: number
  impressions: number
  clicks: number
  conversions: number
  revenue?: number | null
  createdAt?: string | null
}

interface MetricsResponse {
  metrics: MetricRecord[]
  nextCursor: string | null
}

const METRICS_PAGE_SIZE = 100

type ProviderSummary = {
  spend: number
  impressions: number
  clicks: number
  conversions: number
  revenue: number
}

type Totals = {
  spend: number
  impressions: number
  clicks: number
  conversions: number
  revenue: number
}

type ProviderAutomationFormState = {
  autoSyncEnabled: boolean
  syncFrequencyMinutes: number
  scheduledTimeframeDays: number
}

const DEFAULT_SYNC_FREQUENCY_MINUTES = 6 * 60
const DEFAULT_TIMEFRAME_DAYS = 7

const FREQUENCY_OPTIONS: Array<{ label: string; value: number }> = [
  { label: 'Every 1 hour', value: 60 },
  { label: 'Every 3 hours', value: 180 },
  { label: 'Every 6 hours', value: 360 },
  { label: 'Every 12 hours', value: 720 },
  { label: 'Once per day', value: 1440 },
]

const TIMEFRAME_OPTIONS: Array<{ label: string; value: number }> = [
  { label: 'Past day', value: 1 },
  { label: 'Past 3 days', value: 3 },
  { label: 'Past week', value: 7 },
  { label: 'Past 14 days', value: 14 },
  { label: 'Past 30 days', value: 30 },
  { label: 'Past 90 days', value: 90 },
]

const PROVIDER_ICON_MAP: Record<string, LucideIcon> = {
  google: Search,
  facebook: Facebook,
  meta: Facebook,
  linkedin: Linkedin,
  tiktok: Music,
}

const DISPLAY_DATE_FORMATTER = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})

async function fetchIntegrationStatuses(token: string, userId?: string | null): Promise<IntegrationStatusResponse> {
  const url = userId ? `/api/integrations/status?userId=${encodeURIComponent(userId)}` : '/api/integrations/status'
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  })
  if (!response.ok) {
    const errorPayload = await response.json().catch(() => ({}))
    throw new Error(errorPayload.error || 'Failed to load integration status')
  }
  return response.json()
}

async function fetchMetrics(
  token: string,
  options: { userId?: string | null; cursor?: string | null; pageSize?: number } = {},
): Promise<MetricsResponse> {
  const params = new URLSearchParams()
  if (options.userId) {
    params.set('userId', options.userId)
  }
  if (typeof options.pageSize === 'number') {
    params.set('pageSize', String(options.pageSize))
  }
  if (options.cursor) {
    params.set('after', options.cursor)
  }

  const queryString = params.toString()
  const url = queryString.length > 0 ? `/api/metrics?${queryString}` : '/api/metrics'

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  })

  const payload = (await response.json().catch(() => null)) as
    | { metrics?: MetricRecord[]; nextCursor?: string | null; error?: string }
    | null

  if (!response.ok || !payload || !Array.isArray(payload.metrics)) {
    const message = typeof payload?.error === 'string' ? payload.error : 'Failed to load ad metrics'
    throw new Error(message)
  }

  return {
    metrics: payload.metrics,
    nextCursor: typeof payload.nextCursor === 'string' && payload.nextCursor.length > 0 ? payload.nextCursor : null,
  }
}

function normalizeFrequency(value?: number | null): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    const clamped = Math.min(Math.max(Math.round(value), FREQUENCY_OPTIONS[0].value), FREQUENCY_OPTIONS.at(-1)?.value ?? 1440)
    return clamped
  }
  return DEFAULT_SYNC_FREQUENCY_MINUTES
}

function normalizeTimeframe(value?: number | null): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    const clamped = Math.min(Math.max(Math.round(value), TIMEFRAME_OPTIONS[0].value), TIMEFRAME_OPTIONS.at(-1)?.value ?? DEFAULT_TIMEFRAME_DAYS)
    return clamped
  }
  return DEFAULT_TIMEFRAME_DAYS
}

export default function AdsPage() {
  const {
    user,
    connectGoogleAdsAccount,
    connectLinkedInAdsAccount,
    startMetaOauth,
    startTikTokOauth,
    getIdToken,
  } = useAuth()
  const { toast } = useToast()
  const [connectingProvider, setConnectingProvider] = useState<string | null>(null)
  const [connectionErrors, setConnectionErrors] = useState<Record<string, string>>({})
  const [connectedProviders, setConnectedProviders] = useState<Record<string, boolean>>({})
  const [integrationStatuses, setIntegrationStatuses] = useState<IntegrationStatusResponse | null>(null)
  const [metrics, setMetrics] = useState<MetricRecord[]>([])
  const [metricsLoading, setMetricsLoading] = useState(false)
  const [metricError, setMetricError] = useState<string | null>(null)
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [loadingMore, setLoadingMore] = useState(false)
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null)
  const [refreshTick, setRefreshTick] = useState(0)
  const [metaSetupMessage, setMetaSetupMessage] = useState<string | null>(null)
  const [automationDraft, setAutomationDraft] = useState<Record<string, ProviderAutomationFormState>>({})
  const [savingSettings, setSavingSettings] = useState<Record<string, boolean>>({})
  const [settingsErrors, setSettingsErrors] = useState<Record<string, string>>({})
  const [expandedProviders, setExpandedProviders] = useState<Record<string, boolean>>({})
  const hasMetricData = metrics.length > 0
  const initialMetricsLoading = metricsLoading && !hasMetricData

  const initializeGoogleIntegration = useCallback(async () => {
    const token = await getIdToken()
    const response = await fetch('/api/integrations/google/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
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
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const payload = await response.json().catch(() => ({}))
      throw new Error((payload as { error?: string }).error ?? 'Failed to initialize LinkedIn Ads')
    }

    return response.json()
  }, [getIdToken])

  const updateAutomationDraft = useCallback(
    (providerId: string, updates: Partial<ProviderAutomationFormState>) => {
      setAutomationDraft((prev) => {
        const current = prev[providerId] ?? {
          autoSyncEnabled: true,
          syncFrequencyMinutes: DEFAULT_SYNC_FREQUENCY_MINUTES,
          scheduledTimeframeDays: DEFAULT_TIMEFRAME_DAYS,
        }

        return {
          ...prev,
          [providerId]: {
            ...current,
            ...updates,
          },
        }
      })

      setSettingsErrors((prev) => {
        if (!prev[providerId]) {
          return prev
        }
        const next = { ...prev }
        delete next[providerId]
        return next
      })
    },
    [setSettingsErrors]
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
          title: 'Unable to save',
          description: 'Sign in again to update automation preferences.',
        })
        return
      }

      setSavingSettings((prev) => ({ ...prev, [providerId]: true }))
      setSettingsErrors((prev) => ({ ...prev, [providerId]: '' }))

      try {
        const token = await getIdToken()
        const response = await fetch('/api/integrations/settings', {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            providerId,
            autoSyncEnabled: draft.autoSyncEnabled,
            syncFrequencyMinutes: draft.syncFrequencyMinutes,
            scheduledTimeframeDays: draft.scheduledTimeframeDays,
          }),
        })

        if (!response.ok) {
          const payload = await response.json().catch(() => ({}))
          const message = typeof payload.error === 'string' ? payload.error : 'Failed to update automation settings'
          throw new Error(message)
        }

        toast({
          title: 'Automation updated',
          description: `${formatProviderName(providerId)} preferences saved.`,
        })

        setRefreshTick((tick) => tick + 1)
      } catch (error: unknown) {
        const message = getErrorMessage(error, 'Unable to update automation settings')
        setSettingsErrors((prev) => ({ ...prev, [providerId]: message }))
        toast({
          variant: 'destructive',
          title: 'Save failed',
          description: message,
        })
      } finally {
        setSavingSettings((prev) => ({ ...prev, [providerId]: false }))
      }
    },
    [automationDraft, getIdToken, toast, user?.id]
  )

  const toggleAdvanced = useCallback((providerId: string) => {
    setExpandedProviders((previous) => ({
      ...previous,
      [providerId]: !previous[providerId],
    }))
  }, [])

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

    return () => {
      isSubscribed = false
    }
  }, [user?.id, refreshTick, getIdToken])

  useEffect(() => {
    if (!integrationStatuses) return
    const updatedConnected: Record<string, boolean> = {}
    integrationStatuses.statuses.forEach((status) => {
      updatedConnected[status.providerId] = status.status === 'success'
    })
    setConnectedProviders(updatedConnected)
  }, [integrationStatuses])

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

  const automationStatuses = integrationStatuses?.statuses ?? []

  const providerSummaries = useMemo(() => {
    const summary: Record<string, ProviderSummary> = {}
    metrics.forEach((metric) => {
      if (!summary[metric.providerId]) {
        summary[metric.providerId] = { spend: 0, impressions: 0, clicks: 0, conversions: 0, revenue: 0 }
      }
      const providerSummary = summary[metric.providerId]
      providerSummary.spend += metric.spend
      providerSummary.impressions += metric.impressions
      providerSummary.clicks += metric.clicks
      providerSummary.conversions += metric.conversions
      providerSummary.revenue += metric.revenue ?? 0
    })
    return summary
  }, [metrics])

  const totals: Totals = useMemo(() => {
    return metrics.reduce(
      (acc, metric) => {
        acc.spend += metric.spend
        acc.impressions += metric.impressions
        acc.clicks += metric.clicks
        acc.conversions += metric.conversions
        acc.revenue += metric.revenue ?? 0
        return acc
      },
      { spend: 0, impressions: 0, clicks: 0, conversions: 0, revenue: 0 } satisfies Totals,
    )
  }, [metrics])

  const summaryCards = useMemo(() => {
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

  const adPlatforms = [
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
      mode: 'oauth' as const,
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
      mode: 'oauth' as const,
    },
  ]

  const handleConnect = async (providerId: string, action: () => Promise<void>) => {
    setConnectingProvider(providerId)
    setConnectionErrors((prev) => ({ ...prev, [providerId]: '' }))
    try {
      await action()
      if (providerId === 'google') {
        await initializeGoogleIntegration()
      } else if (providerId === 'linkedin') {
        await initializeLinkedInIntegration()
      }
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
    if (!nextCursor || loadingMore || metricsLoading || !user?.id) {
      return
    }

    setLoadingMore(true)
    setLoadMoreError(null)

    try {
      const token = await getIdToken()
      const response = await fetchMetrics(token, {
        userId: user.id,
        cursor: nextCursor,
        pageSize: METRICS_PAGE_SIZE,
      })

      setMetrics((prev) => [...prev, ...response.metrics])
      setNextCursor(response.nextCursor)
    } catch (error: unknown) {
      setLoadMoreError(getErrorMessage(error, 'Failed to load additional rows'))
    } finally {
      setLoadingMore(false)
    }
  }, [getIdToken, loadingMore, metricsLoading, nextCursor, user?.id])

  const handleOauthRedirect = async (providerId: string) => {
    if (typeof window === 'undefined') {
      return
    }

    if (providerId === 'facebook') {
      setMetaSetupMessage(null)
    }

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

      throw new Error('This provider does not support OAuth yet. Contact support for assistance.')
    } catch (error: unknown) {
      const message = getErrorMessage(
        error,
        providerId === 'facebook'
          ? 'Unable to start Meta OAuth. Please try again.'
          : providerId === 'tiktok'
            ? 'Unable to start TikTok OAuth. Please try again.'
            : 'Unable to start OAuth. Please try again.',
      )
      setConnectionErrors((prev) => ({ ...prev, [providerId]: message }))

      if (providerId === 'facebook' && message.toLowerCase().includes('meta business login is not configured')) {
        setMetaSetupMessage(
          'Meta business login is not configured. Add META_APP_ID, META_BUSINESS_CONFIG_ID, and META_OAUTH_REDIRECT_URI environment variables before trying again.',
        )
      }
    } finally {
      setConnectingProvider(null)
    }
  }

  const isInitialLoading = metricsLoading && metrics.length === 0 && !integrationStatuses

  if (isInitialLoading) {
    return <AdsSkeleton />
  }

  const showWorkflow =
    !integrationStatuses ||
    integrationStatuses.statuses.length === 0 ||
    integrationStatuses.statuses.every((status) => status.status !== 'success')

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
          <Card className="border-muted/70 bg-background shadow-sm">
            <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Sparkles className="h-4 w-4" />
                </span>
                <div>
                  <CardTitle className="text-base">Get your ads connected in minutes</CardTitle>
                  <CardDescription>Follow these steps to start pulling media performance into Cohorts.</CardDescription>
                </div>
              </div>
              <Button asChild size="sm" variant="outline">
                <Link href="/docs/integrations">View integration checklist</Link>
              </Button>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-3">
              {ADS_WORKFLOW_STEPS.map((step, index) => (
                <div key={step.title} className="space-y-2 rounded-lg border border-muted/60 p-4">
                  <Badge variant="secondary">Step {index + 1}</Badge>
                  <p className="text-sm font-semibold text-foreground">{step.title}</p>
                  <p className="text-xs text-muted-foreground">{step.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </FadeIn>
      )}

      {metaSetupMessage && (
        <FadeIn>
          <Alert className="border-amber-300 bg-amber-50 text-amber-900">
            <AlertTitle className="flex items-center gap-2 text-sm font-semibold">
              <AlertCircle className="h-4 w-4" /> Meta setup required
            </AlertTitle>
            <AlertDescription className="mt-1 text-xs leading-relaxed">
              {metaSetupMessage}
            </AlertDescription>
          </Alert>
        </FadeIn>
      )}

      <FadeIn>
        <div id="connect-ad-platforms">
          <AdConnectionsCard
            providers={adPlatforms}
            connectedProviders={connectedProviders}
          connectingProvider={connectingProvider}
          connectionErrors={connectionErrors}
          onConnect={handleConnect}
          onOauthRedirect={handleOauthRedirect}
          onRefresh={handleManualRefresh}
          refreshing={metricsLoading}
          />
        </div>
      </FadeIn>

      <FadeIn>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-col gap-1">
            <CardTitle className="text-lg">Automation controls</CardTitle>
            <CardDescription>Toggle automatic syncs and adjust frequency for each connected provider.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {automationStatuses.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-muted/60 p-10 text-center text-sm text-muted-foreground">
                <p>Connect an ad platform to configure auto-sync preferences.</p>
              </div>
            ) : (
              automationStatuses.map((status) => {
                const draft =
                  automationDraft[status.providerId] ?? {
                    autoSyncEnabled: true,
                    syncFrequencyMinutes: DEFAULT_SYNC_FREQUENCY_MINUTES,
                    scheduledTimeframeDays: DEFAULT_TIMEFRAME_DAYS,
                  }
                const saving = savingSettings[status.providerId] ?? false
                const errorMessage = settingsErrors[status.providerId]
                const isExpanded = expandedProviders[status.providerId] ?? false
                const frequencyLabel = describeFrequency(draft.syncFrequencyMinutes)
                const timeframeLabel = describeTimeframe(draft.scheduledTimeframeDays)
                const autoSyncSummary = draft.autoSyncEnabled
                  ? `Auto-sync is on. Cohorts refresh ${frequencyLabel.toLowerCase()} covering the ${timeframeLabel.toLowerCase()}.`
                  : 'Auto-sync is off. Turn it on to keep metrics current automatically.'

                return (
                  <div key={status.providerId} className="space-y-4 rounded-lg border border-muted/60 p-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-foreground">{formatProviderName(status.providerId)}</p>
                          <Badge variant={getStatusBadgeVariant(status.status)}>{getStatusLabel(status.status)}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{autoSyncSummary}</p>
                        <p className="text-xs text-muted-foreground">
                          Last sync: {formatRelativeTimestamp(status.lastSyncedAt)} · Last request: {formatRelativeTimestamp(status.lastSyncRequestedAt)}
                        </p>
                        {status.message ? (
                          <p className="text-xs text-muted-foreground">Last message: {status.message}</p>
                        ) : null}
                      </div>
                      <div className="flex items-center gap-2 self-start md:self-center">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-xs"
                          onClick={() => toggleAdvanced(status.providerId)}
                          disabled={saving}
                        >
                          {isExpanded ? 'Hide advanced' : 'Adjust cadence'}
                        </Button>
                      </div>
                    </div>

                    <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <Checkbox
                        checked={draft.autoSyncEnabled}
                        onChange={(event) => updateAutomationDraft(status.providerId, { autoSyncEnabled: event.target.checked })}
                        disabled={saving}
                      />
                      Enable automatic sync
                    </label>

                    {isExpanded && (
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                        <div className="space-y-1">
                          <span className="text-xs font-medium text-muted-foreground">Cadence</span>
                          <Select
                            value={String(draft.syncFrequencyMinutes)}
                            onValueChange={(value) => updateAutomationDraft(status.providerId, { syncFrequencyMinutes: Number(value) })}
                            disabled={saving}
                          >
                            <SelectTrigger disabled={saving}>
                              <SelectValue placeholder="Select cadence" />
                            </SelectTrigger>
                            <SelectContent>
                              {FREQUENCY_OPTIONS.map((option) => (
                                <SelectItem key={option.value} value={String(option.value)}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1">
                          <span className="text-xs font-medium text-muted-foreground">Data window</span>
                          <Select
                            value={String(draft.scheduledTimeframeDays)}
                            onValueChange={(value) => updateAutomationDraft(status.providerId, { scheduledTimeframeDays: Number(value) })}
                            disabled={saving}
                          >
                            <SelectTrigger disabled={saving}>
                              <SelectValue placeholder="Select window" />
                            </SelectTrigger>
                            <SelectContent>
                              {TIMEFRAME_OPTIONS.map((option) => (
                                <SelectItem key={option.value} value={String(option.value)}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                      {errorMessage ? (
                        <p className="text-xs text-destructive">{errorMessage}</p>
                      ) : (
                        <p className="text-xs text-muted-foreground">Changes apply to future scheduled syncs for this provider.</p>
                      )}
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="inline-flex items-center gap-2"
                        onClick={() => {
                          void handleSaveAutomation(status.providerId)
                        }}
                        disabled={saving}
                      >
                        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                        {saving ? 'Saving…' : 'Save automation'}
                      </Button>
                    </div>
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>
      </FadeIn>

      <FadeIn>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-col gap-1">
            <CardTitle className="text-lg">Cross-channel overview</CardTitle>
            <CardDescription>Key performance indicators from the latest successful sync.</CardDescription>
          </CardHeader>
          <CardContent>
            {initialMetricsLoading ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton key={index} className="h-24 w-full rounded-lg" />
                ))}
              </div>
            ) : !hasMetricData ? (
              <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-muted/60 p-10 text-center text-sm text-muted-foreground">
                <p>Connect an ad platform and run a sync to view aggregate performance.</p>
                <Button asChild size="sm" variant="outline">
                  <Link href="#connect-ad-platforms">Connect an account</Link>
                </Button>
              </div>
            ) : (
              <FadeInStagger className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {summaryCards.map((card) => (
                  <FadeInItem key={card.id}>
                    <Card className="border-muted/70 bg-background shadow-sm">
                      <CardContent className="space-y-2 p-5">
                        <p className="text-xs font-medium uppercase text-muted-foreground">{card.label}</p>
                        <p className="text-2xl font-semibold text-foreground">{card.value}</p>
                        <p className="text-xs text-muted-foreground">{card.helper}</p>
                      </CardContent>
                    </Card>
                  </FadeInItem>
                ))}
              </FadeInStagger>
            )}
          </CardContent>
        </Card>
      </FadeIn>

      <FadeIn>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="flex flex-col gap-1">
              <CardTitle className="text-lg">Ad performance summary</CardTitle>
              <CardDescription>Aggregated spend, clicks, and conversions over the last synced period.</CardDescription>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleManualRefresh}
              disabled={metricsLoading}
              className="inline-flex items-center gap-2"
            >
              <RefreshCw className={cn('h-4 w-4', metricsLoading && 'animate-spin')} /> Refresh metrics
            </Button>
          </CardHeader>
          <CardContent>
            {initialMetricsLoading ? (
              <div className="grid gap-4 md:grid-cols-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <Skeleton key={index} className="h-28 w-full rounded-lg" />
                ))}
              </div>
            ) : metricError ? (
              <Alert variant="destructive">
                <AlertTitle>Unable to load metrics</AlertTitle>
                <AlertDescription>{metricError}</AlertDescription>
              </Alert>
            ) : metrics.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-muted/60 p-10 text-center text-sm text-muted-foreground">
                <p>No synced performance data yet. Connect an ad platform and run a sync to populate these insights.</p>
                <Button asChild size="sm" variant="outline">
                  <Link href="#connect-ad-platforms">Run first sync</Link>
                </Button>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-3">
                {Object.entries(providerSummaries).map(([providerId, summary]) => (
                  <Card key={providerId} className="border-muted/60 bg-background">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">{formatProviderName(providerId)} overview</CardTitle>
                      <CardDescription>Aggregated performance since last sync</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="text-2xl font-semibold">{formatCurrency(summary.spend)}</div>
                      <div className="grid grid-cols-3 gap-3 text-xs text-muted-foreground">
                        <div>
                          <div className="font-medium text-foreground">Impressions</div>
                          <div>{summary.impressions.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="font-medium text-foreground">Clicks</div>
                          <div>{summary.clicks.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="font-medium text-foreground">Conversions</div>
                          <div>{summary.conversions.toLocaleString()}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </FadeIn>

      <FadeIn>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Latest synced rows</CardTitle>
              <CardDescription>Recent normalized records across all connected ad platforms.</CardDescription>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleManualRefresh}
              disabled={metricsLoading}
              className="inline-flex items-center gap-2"
            >
              <RefreshCw className={cn('h-4 w-4', metricsLoading && 'animate-spin')} /> Refresh rows
            </Button>
          </CardHeader>
          <CardContent>
            {initialMetricsLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 6 }).map((_, index) => (
                  <Skeleton key={index} className="h-10 w-full rounded" />
                ))}
              </div>
            ) : metricError ? (
              <Alert variant="destructive">
                <AlertTitle>Unable to load metrics</AlertTitle>
                <AlertDescription>{metricError}</AlertDescription>
              </Alert>
            ) : metrics.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-muted/60 p-10 text-center text-sm text-muted-foreground">
                <p>No data yet. Once a sync completes, your most recent rows will appear here.</p>
                <Button asChild size="sm" variant="outline">
                  <Link href="#connect-ad-platforms">Start a sync</Link>
                </Button>
              </div>
            ) : (
              <ScrollArea className="h-72">
                <table className="w-full table-fixed text-left text-sm">
                  <thead className="sticky top-0 bg-background">
                    <tr className="border-b border-muted/60">
                      <th className="py-2 pr-4 font-medium">Date</th>
                      <th className="py-2 pr-4 font-medium">Provider</th>
                      <th className="py-2 pr-4 font-medium">Spend</th>
                      <th className="py-2 pr-4 font-medium">Impressions</th>
                      <th className="py-2 pr-4 font-medium">Clicks</th>
                      <th className="py-2 pr-4 font-medium">Conversions</th>
                      <th className="py-2 font-medium">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metrics.map((metric) => {
                      const ProviderIcon = PROVIDER_ICON_MAP[metric.providerId]
                      return (
                        <tr key={metric.id} className="border-b border-muted/40">
                          <td className="whitespace-nowrap py-2 pr-4">{formatDisplayDate(metric.date)}</td>
                          <td className="py-2 pr-4">
                            <div className="flex items-center gap-2">
                              {ProviderIcon ? <ProviderIcon className="h-4 w-4 text-muted-foreground" aria-hidden="true" /> : null}
                              <span>{formatProviderName(metric.providerId)}</span>
                            </div>
                          </td>
                          <td className="py-2 pr-4">{formatCurrency(metric.spend)}</td>
                          <td className="py-2 pr-4">{metric.impressions.toLocaleString()}</td>
                          <td className="py-2 pr-4">{metric.clicks.toLocaleString()}</td>
                          <td className="py-2 pr-4">{metric.conversions.toLocaleString()}</td>
                          <td className="py-2">{metric.revenue != null ? formatCurrency(metric.revenue) : '—'}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </ScrollArea>
            )}
            {nextCursor && metrics.length > 0 && (
              <div className="mt-4 flex flex-col items-center gap-2">
                {loadMoreError && <p className="text-xs text-destructive">{loadMoreError}</p>}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    void handleLoadMore()
                  }}
                  disabled={loadingMore}
                  className="inline-flex items-center gap-2"
                >
                  <RefreshCw className={cn('h-4 w-4', loadingMore && 'animate-spin')} />
                  {loadingMore ? 'Loading rows…' : 'Load more rows'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  )
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === 'string') {
    return error
  }

  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as { message?: unknown }).message
    if (typeof message === 'string' && message.trim().length > 0) {
      return message
    }
  }

  return fallback
}

function formatRelativeTimestamp(iso?: string | null): string {
  if (!iso) {
    return 'Never synced'
  }
  const parsed = new Date(iso)
  if (Number.isNaN(parsed.getTime())) {
    return 'Unknown'
  }
  return `${formatDistanceToNow(parsed, { addSuffix: true })}`
}

function getStatusBadgeVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'success':
      return 'default'
    case 'pending':
      return 'secondary'
    case 'error':
      return 'destructive'
    default:
      return 'outline'
  }
}

function getStatusLabel(status: string): string {
  switch (status) {
    case 'success':
      return 'Healthy'
    case 'pending':
      return 'In progress'
    case 'error':
      return 'Failed'
    case 'never':
      return 'Not run yet'
    default:
      return status.charAt(0).toUpperCase() + status.slice(1)
  }
}

function formatProviderName(providerId: string): string {
  const mapping: Record<string, string> = {
    google: 'Google Ads',
    facebook: 'Meta Ads Manager',
    meta: 'Meta Ads Manager',
    linkedin: 'LinkedIn Ads',
    tiktok: 'TikTok Ads',
  }

  if (mapping[providerId]) {
    return mapping[providerId]
  }

  if (providerId.length === 0) {
    return 'Unknown Provider'
  }

  return providerId.charAt(0).toUpperCase() + providerId.slice(1)
}

function describeFrequency(minutes: number): string {
  const match = FREQUENCY_OPTIONS.find((option) => option.value === minutes)
  if (match) {
    return match.label
  }

  if (minutes % 1440 === 0) {
    const days = minutes / 1440
    return days === 1 ? 'Once per day' : `Every ${days} days`
  }

  if (minutes % 60 === 0) {
    const hours = minutes / 60
    return hours === 1 ? 'Every hour' : `Every ${hours} hours`
  }

  return `Every ${minutes} minutes`
}

function describeTimeframe(days: number): string {
  const match = TIMEFRAME_OPTIONS.find((option) => option.value === days)
  if (match) {
    return match.label.replace('Past', 'Last')
  }

  if (days === 1) {
    return 'Last day'
  }

  if (days === 7) {
    return 'Last 7 days'
  }

  return `Last ${days} days`
}

function formatDisplayDate(value: string): string {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return value
  }
  return DISPLAY_DATE_FORMATTER.format(parsed)
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: amount >= 1000 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount)
}
