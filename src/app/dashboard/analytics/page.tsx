'use client'

import useSWR from 'swr'
import { useEffect, useMemo, useState } from 'react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import {
  TrendingUp,
  DollarSign,
  Users,
  Target,
  RefreshCw,
} from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { ScrollArea } from '@/components/ui/scroll-area'
import { authService } from '@/services/auth'
import { useClientContext } from '@/contexts/client-context'

interface MetricRecord {
  id: string
  providerId: string
  date: string
  spend: number
  impressions: number
  clicks: number
  conversions: number
  revenue?: number | null
  creatives?: Array<{
    id: string
    name: string
    type: string
    url?: string
    spend?: number
    impressions?: number
    clicks?: number
    conversions?: number
    revenue?: number
  }>
}

interface ProviderInsight {
  providerId: string
  summary: string
}

const PROVIDER_LABELS: Record<string, string> = {
  google: 'Google Ads',
  facebook: 'Meta Ads',
  linkedin: 'LinkedIn Ads',
  tiktok: 'TikTok Ads',
}

const fetcher = async (url: string, token: string) => {
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  })
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}))
    throw new Error(payload.error || 'Failed to load analytics data')
  }
  return response.json()
}

function useAnalyticsData(token: string | null, periodDays: number, clientId: string | null) {
  const shouldFetch = Boolean(token)
  const metricsUrl = clientId ? `/api/metrics?clientId=${encodeURIComponent(clientId)}` : '/api/metrics'
  const metricsKey: [string, string] | null = shouldFetch && token ? [metricsUrl, token] : null

  const insightsParams = new URLSearchParams({ periodDays: String(periodDays) })
  if (clientId) {
    insightsParams.set('clientId', clientId)
  }
  const insightsUrl = `/api/analytics/insights?${insightsParams.toString()}`
  const insightsKey: [string, string] | null = shouldFetch && token ? [insightsUrl, token] : null

  const {
    data,
    error,
    isLoading,
    isValidating,
    mutate: mutateMetrics,
  } = useSWR(metricsKey, ([url, jwt]) => fetcher(url, jwt))

  const {
    data: insightsData,
    error: insightsError,
    isLoading: insightsLoading,
    isValidating: insightsValidating,
    mutate: mutateInsights,
  } = useSWR(
    insightsKey,
    ([url, jwt]) => fetcher(url, jwt)
  )

  return {
    metricsData: (data as MetricRecord[]) ?? [],
    metricsError: error as Error | undefined,
    metricsLoading: isLoading,
    metricsRefreshing: isValidating,
    mutateMetrics,
    insights: (insightsData as { insights: ProviderInsight[] } | undefined)?.insights ?? [],
    insightsError: insightsError as Error | undefined,
    insightsLoading,
    insightsRefreshing: insightsValidating,
    mutateInsights,
  }
}

const PERIOD_OPTIONS = [
  { value: '7d', label: '7 days', days: 7 },
  { value: '30d', label: '30 days', days: 30 },
  { value: '90d', label: '90 days', days: 90 },
]

const PLATFORM_OPTIONS = [
  { value: 'all', label: 'All platforms' },
  { value: 'google', label: 'Google Ads' },
  { value: 'facebook', label: 'Meta Ads' },
  { value: 'linkedin', label: 'LinkedIn Ads' },
]

function formatCurrency(value: number) {
  return value.toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
}

export default function AnalyticsPage() {
  const { selectedClientId } = useClientContext()
  const [selectedPeriod, setSelectedPeriod] = useState(PERIOD_OPTIONS[0].value)
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
    metricsError,
    metricsLoading,
    metricsRefreshing,
    mutateMetrics,
    insights,
    insightsError,
    insightsLoading,
    insightsRefreshing,
    mutateInsights,
  } = useAnalyticsData(token, periodDays, selectedClientId ?? null)

  const metrics = metricsData
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
            onChange={(e) => setSelectedPeriod(e.target.value)}
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

      {metricsError && (
        <Alert variant="destructive">
          <AlertTitle>Unable to load analytics</AlertTitle>
          <AlertDescription>{metricsError.message}</AlertDescription>
        </Alert>
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-muted-foreground">Performance summary</h2>
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-muted/60 bg-background">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total spend</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{formatCurrency(totals.spend)}</div>
          </CardContent>
        </Card>
        <Card className="border-muted/60 bg-background">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{formatCurrency(totals.revenue)}</div>
          </CardContent>
        </Card>
        <Card className="border-muted/60 bg-background">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average ROAS</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{averageRoaS.toFixed(2)}x</div>
          </CardContent>
        </Card>
        <Card className="border-muted/60 bg-background">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion rate</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{conversionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Avg CPC {formatCurrency(averageCpc)}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="border-muted/60 bg-background">
          <CardHeader>
            <CardTitle>Revenue vs spend</CardTitle>
            <CardDescription>Daily totals for the selected period</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            {metricsLoading ? (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Loading…</div>
            ) : chartData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">No performance data for the selected filters.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} name="Revenue" />
                  <Line type="monotone" dataKey="spend" stroke="#ef4444" strokeWidth={2} name="Spend" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="border-muted/60 bg-background">
          <CardHeader>
            <CardTitle>ROAS performance</CardTitle>
            <CardDescription>Return on ad spend across the selected period</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            {metricsLoading ? (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Loading…</div>
            ) : chartData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">No performance data for the selected filters.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="roas" fill="#6366f1" name="ROAS" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="border-muted/60 bg-background">
          <CardHeader>
            <CardTitle>Platform budget distribution</CardTitle>
            <CardDescription>Spend share across connected platforms</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            {metricsLoading ? (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Loading…</div>
            ) : platformBreakdown.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Connect a platform to see spend distribution.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={platformBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                    {platformBreakdown.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number, _name, props) => [`${formatCurrency(value)}`, props?.payload?.name]} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="border-muted/60 bg-background">
          <CardHeader>
            <CardTitle>Click performance</CardTitle>
            <CardDescription>Breakdown of daily click volume</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            {metricsLoading ? (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Loading…</div>
            ) : chartData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">No data available.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="clicks" stroke="#f59e0b" strokeWidth={2} name="Clicks" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-muted/60 bg-background">
        <CardHeader>
          <CardTitle>AI-powered insights</CardTitle>
          <div className="mt-1 flex items-center justify-between gap-4">
            <CardDescription>Platform-specific takeaways generated by Gemini</CardDescription>
            <button
              type="button"
              onClick={() => mutateInsights()}
              disabled={insightsLoading || insightsRefreshing}
              className="inline-flex items-center gap-2 rounded-md border border-input px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm transition hover:bg-muted disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${insightsRefreshing ? 'animate-spin' : ''}`} />
              Refresh insights
            </button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {insightsError && (
            <Alert variant="destructive">
              <AlertTitle>Insight generation failed</AlertTitle>
              <AlertDescription>{insightsError.message}</AlertDescription>
            </Alert>
          )}
          {insightsLoading ? (
            <p className="text-sm text-muted-foreground">Generating fresh insights…</p>
          ) : insights.length === 0 ? (
            <p className="text-sm text-muted-foreground">Link a platform and run a sync to unlock insights.</p>
          ) : (
            insights.map((insight) => (
              <div key={insight.providerId} className="rounded-md border border-muted/60 bg-muted/20 p-4">
                <div className="flex items-center gap-2 text-xs uppercase text-muted-foreground">
                  <TrendingUp className="h-3 w-3" />
                  <span>{PROVIDER_LABELS[insight.providerId] ?? insight.providerId}</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground whitespace-pre-wrap">{insight.summary}</p>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card className="border-muted/60 bg-background">
        <CardHeader>
          <CardTitle>Meta creative highlights</CardTitle>
          <CardDescription className="flex items-center justify-between gap-4">
            <span>Top-performing creatives from Meta Ads (based on spend)</span>
            <button
              type="button"
              onClick={() => mutateMetrics()}
              disabled={metricsLoading || metricsRefreshing}
              className="inline-flex items-center gap-2 rounded-md border border-input px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm transition hover:bg-muted disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${metricsRefreshing ? 'animate-spin' : ''}`} />
              Refresh creatives
            </button>
          </CardDescription>
        </CardHeader>
        <CardContent>
          {creativeBreakdown.length === 0 ? (
            <div className="rounded border border-dashed border-muted/60 p-6 text-center text-sm text-muted-foreground">
              No creative-level data yet. Ensure Meta syncs are configured with creative insights.
            </div>
          ) : (
            <ScrollArea className="h-72">
              <table className="w-full table-fixed text-left text-sm">
                <thead className="sticky top-0 bg-background">
                  <tr className="border-b border-muted/60 text-xs uppercase text-muted-foreground">
                    <th className="py-2 pr-4 font-medium">Creative</th>
                    <th className="py-2 pr-4 font-medium">Spend</th>
                    <th className="py-2 pr-4 font-medium">Clicks</th>
                    <th className="py-2 pr-4 font-medium">Conversions</th>
                    <th className="py-2 pr-4 font-medium">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {creativeBreakdown.map((creative) => (
                    <tr key={`${creative.id}-${creative.date}`} className="border-b border-muted/40">
                      <td className="py-2 pr-4">
                        <div className="flex flex-col">
                          <span className="font-medium text-foreground line-clamp-1">{creative.name}</span>
                          <span className="text-xs text-muted-foreground">{creative.date}</span>
                        </div>
                      </td>
                      <td className="py-2 pr-4">{formatCurrency(creative.spend ?? 0)}</td>
                      <td className="py-2 pr-4">{creative.clicks?.toLocaleString() ?? '—'}</td>
                      <td className="py-2 pr-4">{creative.conversions?.toLocaleString() ?? '—'}</td>
                      <td className="py-2">{formatCurrency(creative.revenue ?? 0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
