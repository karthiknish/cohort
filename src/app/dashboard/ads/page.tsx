"use client"

import { useEffect, useMemo, useState } from 'react'
import {
  AlertCircle,
  Facebook,
  Linkedin,
  RefreshCw,
  Search,
} from 'lucide-react'

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

interface IntegrationStatusResponse {
  statuses: Array<{
    providerId: string
    status: string
    lastSyncedAt?: string | null
    lastSyncRequestedAt?: string | null
    message?: string | null
    linkedAt?: string | null
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

async function fetchMetrics(token: string, userId?: string | null): Promise<MetricRecord[]> {
  const url = userId ? `/api/metrics?userId=${encodeURIComponent(userId)}` : '/api/metrics'
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  })
  if (!response.ok) {
    const errorPayload = await response.json().catch(() => ({}))
    throw new Error(errorPayload.error || 'Failed to load ad metrics')
  }
  return response.json()
}

export default function AdsPage() {
  const {
    user,
    connectGoogleAdsAccount,
    connectLinkedInAdsAccount,
    startMetaOauth,
    getIdToken,
  } = useAuth()
  const [connectingProvider, setConnectingProvider] = useState<string | null>(null)
  const [connectionErrors, setConnectionErrors] = useState<Record<string, string>>({})
  const [connectedProviders, setConnectedProviders] = useState<Record<string, boolean>>({})
  const [integrationStatuses, setIntegrationStatuses] = useState<IntegrationStatusResponse | null>(null)
  const [metrics, setMetrics] = useState<MetricRecord[]>([])
  const [metricsLoading, setMetricsLoading] = useState(false)
  const [metricError, setMetricError] = useState<string | null>(null)
  const [refreshTick, setRefreshTick] = useState(0)
  const [metaSetupMessage, setMetaSetupMessage] = useState<string | null>(null)
  const hasMetricData = metrics.length > 0
  const initialMetricsLoading = metricsLoading && !hasMetricData

  useEffect(() => {
    if (!user?.id) {
      setIntegrationStatuses(null)
      setMetrics([])
      setMetricsLoading(false)
      return
    }

    let isSubscribed = true

    const loadData = async () => {
      if (isSubscribed) {
        setMetricsLoading(true)
        setMetricError(null)
      }

      try {
        const token = await getIdToken()
        const [statusResponse, metricResponse] = await Promise.all([
          fetchIntegrationStatuses(token, user.id),
          fetchMetrics(token, user.id),
        ])

        if (isSubscribed) {
          setIntegrationStatuses(statusResponse)
          setMetrics(metricResponse)
        }
      } catch (error: unknown) {
        if (isSubscribed) {
          setMetricError(getErrorMessage(error, 'Failed to load marketing data'))
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
        helper: hasMetricData ? 'Across all synced platforms' : 'Connect a platform to populate',
      },
      {
        id: 'impressions',
        label: 'Impressions',
        value: totals.impressions > 0 ? totals.impressions.toLocaleString() : '—',
        helper: hasMetricData ? 'Combined delivery volume' : 'Awaiting sync',
      },
      {
        id: 'avg-cpc',
        label: 'Avg CPC',
        value: totals.clicks > 0 ? formatCurrency(averageCpc) : '—',
        helper: 'Spend divided by clicks',
      },
      {
        id: 'roas',
        label: 'ROAS',
        value: roas > 0 ? `${roas.toFixed(2)}x` : '—',
        helper: 'Attributed revenue vs spend',
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
  ]

  const handleConnect = async (providerId: string, action: () => Promise<void>) => {
    setConnectingProvider(providerId)
    setConnectionErrors((prev) => ({ ...prev, [providerId]: '' }))
    try {
      await action()
      setConnectedProviders((prev) => ({ ...prev, [providerId]: true }))
      setRefreshTick((tick) => tick + 1)
    } catch (error: unknown) {
      const message = getErrorMessage(error, 'Unable to connect. Please try again.')
      setConnectionErrors((prev) => ({ ...prev, [providerId]: message }))
    } finally {
      setConnectingProvider(null)
    }
  }

  const handleManualRefresh = () => {
    if (metricsLoading) return
    setRefreshTick((tick) => tick + 1)
  }

  const handleMetaOauthRedirect = async (providerId: string) => {
    if (typeof window === 'undefined') {
      return
    }

    setMetaSetupMessage(null)
    setConnectingProvider(providerId)
    setConnectionErrors((prev) => ({ ...prev, [providerId]: '' }))

    try {
      const redirectTarget = `${window.location.origin}/dashboard/ads`
      const { url } = await startMetaOauth(redirectTarget)
      window.location.href = url
    } catch (error: unknown) {
      const message = getErrorMessage(error, 'Unable to start Meta OAuth. Please try again.')
      setConnectionErrors((prev) => ({ ...prev, [providerId]: message }))
      if (message.toLowerCase().includes('meta business login is not configured')) {
        setMetaSetupMessage(
          'Meta business login is not configured. Add META_APP_ID, META_BUSINESS_CONFIG_ID, and META_OAUTH_REDIRECT_URI environment variables before trying again.',
        )
      }
      setConnectingProvider(null)
    }
  }

  const isInitialLoading = metricsLoading && metrics.length === 0 && !integrationStatuses

  if (isInitialLoading) {
    return <AdsSkeleton />
  }

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
        <AdConnectionsCard
          providers={adPlatforms}
          connectedProviders={connectedProviders}
          connectingProvider={connectingProvider}
          connectionErrors={connectionErrors}
          onConnect={handleConnect}
          onOauthRedirect={handleMetaOauthRedirect}
          onRefresh={handleManualRefresh}
          refreshing={metricsLoading}
        />
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
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-muted/60 p-10 text-sm text-muted-foreground">
                <p>Connect an ad platform and run a sync to view aggregate performance.</p>
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
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-muted/60 p-10 text-center text-sm text-muted-foreground">
                <p>No synced performance data yet. Connect an ad platform and run a sync to populate these insights.</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-3">
                {Object.entries(providerSummaries).map(([providerId, summary]) => (
                  <Card key={providerId} className="border-muted/60 bg-background">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base capitalize">{providerId} overview</CardTitle>
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
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-muted/60 p-10 text-center text-sm text-muted-foreground">
                <p>No data yet. Once a sync completes, your most recent rows will appear here.</p>
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
                    {metrics.map((metric) => (
                      <tr key={metric.id} className="border-b border-muted/40">
                        <td className="whitespace-nowrap py-2 pr-4">{metric.date}</td>
                        <td className="py-2 pr-4 capitalize">{metric.providerId}</td>
                        <td className="py-2 pr-4">{formatCurrency(metric.spend)}</td>
                        <td className="py-2 pr-4">{metric.impressions.toLocaleString()}</td>
                        <td className="py-2 pr-4">{metric.clicks.toLocaleString()}</td>
                        <td className="py-2 pr-4">{metric.conversions.toLocaleString()}</td>
                        <td className="py-2">{metric.revenue != null ? formatCurrency(metric.revenue) : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </ScrollArea>
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

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: amount >= 1000 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount)
}
