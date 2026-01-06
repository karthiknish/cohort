'use client'

import useSWR from 'swr'
import { useCallback, useEffect, useMemo, useState } from 'react'
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
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import {
  TrendingUp,
  DollarSign,
  Users,
  Target,
  RefreshCw,
  Loader2,
  Info,
  Lightbulb,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { ScrollArea } from '@/components/ui/scroll-area'
import { authService } from '@/services/auth'
import { useClientContext } from '@/contexts/client-context'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/components/ui/use-toast'
import { formatCurrency, cn } from '@/lib/utils'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

import { FeatureTips } from '@/components/dashboard/feature-tips'
import { Megaphone, CreditCard, FileText } from 'lucide-react'
import { usePreview } from '@/contexts/preview-context'
import { getPreviewAnalyticsMetrics, getPreviewAnalyticsInsights } from '@/lib/preview-data'
import { PreviewDataBanner } from '@/components/dashboard/preview-data-banner'

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

interface MetricsResponse {
  metrics?: MetricRecord[]
  nextCursor?: string | null
}

interface ProviderInsight {
  providerId: string
  summary: string
}

interface AlgorithmicSuggestion {
  type: 'efficiency' | 'budget' | 'creative' | 'audience'
  level: 'success' | 'warning' | 'info' | 'critical'
  title: string
  message: string
  suggestion: string
  score?: number
}

interface AlgorithmicInsight {
  providerId: string
  suggestions: AlgorithmicSuggestion[]
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

function useAnalyticsData(token: string | null, periodDays: number, clientId: string | null, isPreviewMode: boolean) {
  // If in preview mode, return preview data immediately
  const previewMetrics = useMemo(() => {
    if (!isPreviewMode) return null
    return getPreviewAnalyticsMetrics(clientId) as MetricRecord[]
  }, [isPreviewMode, clientId])
  
  const previewInsights = useMemo(() => {
    if (!isPreviewMode) return null
    return getPreviewAnalyticsInsights()
  }, [isPreviewMode])

  const shouldFetch = Boolean(token) && !isPreviewMode
  const metricsUrl = clientId ? `/api/metrics?clientId=${encodeURIComponent(clientId)}` : '/api/metrics'
  const metricsKey: [string, string] | null = shouldFetch && token ? [metricsUrl, token] : null

  const [metricsList, setMetricsList] = useState<MetricRecord[]>([])
  const [metricsCursor, setMetricsCursor] = useState<string | null>(null)
  const [metricsLoadingMore, setMetricsLoadingMore] = useState(false)

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

  useEffect(() => {
    if (isPreviewMode) return
    setMetricsList([])
    setMetricsCursor(null)
  }, [metricsUrl, isPreviewMode])

  useEffect(() => {
    if (isPreviewMode) return
    if (!data) {
      return
    }

    const payload = data as MetricsResponse
    const entries = Array.isArray(payload.metrics) ? payload.metrics : []
    setMetricsList(entries)
    setMetricsCursor(typeof payload.nextCursor === 'string' && payload.nextCursor.length > 0 ? payload.nextCursor : null)
  }, [data, isPreviewMode])

  const loadMoreMetrics = useCallback(async () => {
    if (isPreviewMode || !token || !metricsCursor) {
      return
    }

    setMetricsLoadingMore(true)
    try {
      const separator = metricsUrl.includes('?') ? '&' : '?'
      const url = `${metricsUrl}${separator}after=${encodeURIComponent(metricsCursor)}`
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      })

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null
        const message = payload?.error ?? 'Unable to load additional metrics'
        throw new Error(message)
      }

      const payload = (await response.json()) as MetricsResponse
      const entries = Array.isArray(payload.metrics) ? payload.metrics : []
      if (entries.length > 0) {
        setMetricsList((prev) => [...prev, ...entries])
      }
      setMetricsCursor(typeof payload.nextCursor === 'string' && payload.nextCursor.length > 0 ? payload.nextCursor : null)
    } finally {
      setMetricsLoadingMore(false)
    }
  }, [metricsCursor, metricsUrl, token, isPreviewMode])

  // Return preview data if in preview mode
  if (isPreviewMode && previewMetrics && previewInsights) {
    return {
      metricsData: previewMetrics,
      metricsNextCursor: null,
      metricsLoadingMore: false,
      loadMoreMetrics: async () => {},
      metricsError: undefined,
      metricsLoading: false,
      metricsRefreshing: false,
      mutateMetrics: async () => undefined,
      insights: previewInsights.insights as ProviderInsight[],
      algorithmic: previewInsights.algorithmic as AlgorithmicInsight[],
      insightsError: undefined,
      insightsLoading: false,
      insightsRefreshing: false,
      mutateInsights: async () => undefined,
    }
  }

  return {
    metricsData: metricsList,
    metricsNextCursor: metricsCursor,
    metricsLoadingMore,
    loadMoreMetrics,
    metricsError: error as Error | undefined,
    metricsLoading: isLoading,
    metricsRefreshing: isValidating,
    mutateMetrics,
    insights: (insightsData as { insights: ProviderInsight[] } | undefined)?.insights ?? [],
    algorithmic: (insightsData as { algorithmic: AlgorithmicInsight[] } | undefined)?.algorithmic ?? [],
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

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-border bg-background p-3 shadow-md">
        <p className="mb-2 text-sm font-medium text-foreground">{label}</p>
        {payload.map((entry: any) => (
          <div key={entry.name} className="flex items-center gap-2 text-sm">
            <div 
              className="h-2 w-2 rounded-full" 
              style={{ backgroundColor: entry.color || entry.fill }}
            />
            <span className="text-muted-foreground">{entry.name}:</span>
            <span className="font-medium text-foreground">
              {entry.name === 'ROAS' ? `${Number(entry.value).toFixed(2)}x` : 
               entry.name === 'Clicks' || entry.name === 'Conversions' ? Number(entry.value).toLocaleString() :
               formatCurrency(entry.value)}
            </span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

export default function AnalyticsPage() {
  const { selectedClientId } = useClientContext()
  const { toast } = useToast()
  const { isPreviewMode } = usePreview()
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

      <PreviewDataBanner />

      {metricsError && (
        <Alert variant="destructive">
          <AlertTitle>Unable to load analytics</AlertTitle>
          <AlertDescription>{metricsError.message}</AlertDescription>
        </Alert>
      )}

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
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-muted/60 bg-background">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-medium">Total spend</CardTitle>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-3 w-3 text-muted-foreground/70" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Total amount spent across all selected platforms</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {initialMetricsLoading ? (
              <Skeleton className="h-7 w-24" />
            ) : (
              <div className="text-2xl font-semibold">{formatCurrency(totals.spend)}</div>
            )}
          </CardContent>
        </Card>
        <Card className="border-muted/60 bg-background">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-3 w-3 text-muted-foreground/70" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Total revenue generated from ad campaigns</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {initialMetricsLoading ? (
              <Skeleton className="h-7 w-24" />
            ) : (
              <div className="text-2xl font-semibold">{formatCurrency(totals.revenue)}</div>
            )}
          </CardContent>
        </Card>
        <Card className="border-muted/60 bg-background">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-medium">Average ROAS</CardTitle>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-3 w-3 text-muted-foreground/70" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Return on Ad Spend (Revenue / Spend)</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {initialMetricsLoading ? (
              <Skeleton className="h-7 w-20" />
            ) : (
              <div className="text-2xl font-semibold">{averageRoaS.toFixed(2)}x</div>
            )}
          </CardContent>
        </Card>
        <Card className="border-muted/60 bg-background">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-medium">Conversion rate</CardTitle>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-3 w-3 text-muted-foreground/70" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Percentage of clicks that resulted in a conversion</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-1">
            {initialMetricsLoading ? (
              <>
                <Skeleton className="h-7 w-20" />
                <Skeleton className="h-4 w-28" />
              </>
            ) : (
              <>
                <div className="text-2xl font-semibold">{conversionRate.toFixed(1)}%</div>
                <div className="text-xs text-muted-foreground">Avg CPC {formatCurrency(averageCpc)}</div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-muted/40 bg-background/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">MER (Blended ROAS)</CardTitle>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-3 w-3 text-muted-foreground/50" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Marketing Efficiency Ratio: Total Revenue / Total Spend</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </CardHeader>
          <CardContent>
            {initialMetricsLoading ? (
              <Skeleton className="h-6 w-16" />
            ) : (
              <div className="text-xl font-semibold">{mer.toFixed(2)}x</div>
            )}
          </CardContent>
        </Card>
        <Card className="border-muted/40 bg-background/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">Avg. Order Value (AOV)</CardTitle>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-3 w-3 text-muted-foreground/50" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Average revenue generated per conversion</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </CardHeader>
          <CardContent>
            {initialMetricsLoading ? (
              <Skeleton className="h-6 w-20" />
            ) : (
              <div className="text-xl font-semibold">{formatCurrency(aov)}</div>
            )}
          </CardContent>
        </Card>
        <Card className="border-muted/40 bg-background/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">Revenue Per Click (RPC)</CardTitle>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-3 w-3 text-muted-foreground/50" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Average revenue generated for every click</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </CardHeader>
          <CardContent>
            {initialMetricsLoading ? (
              <Skeleton className="h-6 w-16" />
            ) : (
              <div className="text-xl font-semibold">{formatCurrency(rpc)}</div>
            )}
          </CardContent>
        </Card>
        <Card className="border-muted/40 bg-background/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">Return on Investment (ROI)</CardTitle>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-3 w-3 text-muted-foreground/50" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Percentage of profit relative to spend: ((Rev - Spend) / Spend) * 100</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </CardHeader>
          <CardContent>
            {initialMetricsLoading ? (
              <Skeleton className="h-6 w-16" />
            ) : (
              <div className={cn(
                "text-xl font-semibold",
                roi >= 0 ? "text-emerald-600" : "text-red-600"
              )}>
                {roi > 0 ? '+' : ''}{roi.toFixed(1)}%
              </div>
            )}
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
            {initialMetricsLoading || (metricsLoading && chartData.length === 0) ? (
              <Skeleton className="h-full w-full" />
            ) : chartData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">No performance data for the selected filters.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} activeDot={{ r: 6 }} name="Revenue" />
                  <Line type="monotone" dataKey="spend" stroke="#ef4444" strokeWidth={2} activeDot={{ r: 6 }} name="Spend" />
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
            {initialMetricsLoading || (metricsLoading && chartData.length === 0) ? (
              <Skeleton className="h-full w-full" />
            ) : chartData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">No performance data for the selected filters.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <RechartsTooltip content={<CustomTooltip />} />
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
            {initialMetricsLoading || (metricsLoading && platformBreakdown.length === 0) ? (
              <Skeleton className="h-full w-full" />
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
                  <RechartsTooltip formatter={(value: number, _name, props) => [`${formatCurrency(value)}`, props?.payload?.name]} />
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
            {initialMetricsLoading || (metricsLoading && chartData.length === 0) ? (
              <Skeleton className="h-full w-full" />
            ) : chartData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                Welcome! Connect your first ad account to see click performance.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line type="monotone" dataKey="clicks" stroke="#f59e0b" strokeWidth={2} activeDot={{ r: 6 }} name="Clicks" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" />
            Algorithmic suggestions
          </CardTitle>
          <CardDescription>Data-driven optimizations based on your current ad performance</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {initialInsightsLoading ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {Array.from({ length: 2 }).map((_, idx) => (
                <Skeleton key={idx} className="h-32 w-full" />
              ))}
            </div>
          ) : algorithmic.length === 0 ? (
            <p className="text-sm text-muted-foreground">No specific optimizations identified for the current data set.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {algorithmic.flatMap((group) => 
                group.suggestions.map((suggestion, idx) => (
                  <div 
                    key={`${group.providerId}-${idx}`}
                    className={cn(
                      "relative overflow-hidden rounded-lg border p-4 shadow-sm transition-all hover:shadow-md",
                      suggestion.level === 'success' && "border-emerald-200 bg-emerald-50/50",
                      suggestion.level === 'warning' && "border-amber-200 bg-amber-50/50",
                      suggestion.level === 'critical' && "border-red-200 bg-red-50/50",
                      suggestion.level === 'info' && "border-blue-200 bg-blue-50/50"
                    )}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          {suggestion.level === 'success' && <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
                          {suggestion.level === 'warning' && <AlertTriangle className="h-4 w-4 text-amber-600" />}
                          {suggestion.level === 'critical' && <AlertTriangle className="h-4 w-4 text-red-600" />}
                          {suggestion.level === 'info' && <Info className="h-4 w-4 text-blue-600" />}
                          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            {group.providerId === 'global' ? 'Strategy' : PROVIDER_LABELS[group.providerId] ?? group.providerId}
                          </span>
                        </div>
                        <h4 className="font-semibold text-foreground">{suggestion.title}</h4>
                        <p className="text-sm text-muted-foreground">{suggestion.message}</p>
                      </div>
                      {suggestion.score && (
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-primary/20 bg-background text-xs font-bold text-primary">
                          {suggestion.score}
                        </div>
                      )}
                    </div>
                    <div className="mt-4 flex items-center gap-2 rounded-md bg-background/80 p-2 text-sm font-medium text-foreground shadow-inner">
                      <ArrowRight className="h-4 w-4 shrink-0 text-primary" />
                      <span>{suggestion.suggestion}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-muted/60 bg-background">
        <CardHeader>
          <CardTitle>AI-powered insights</CardTitle>
          <div className="mt-1 flex items-center justify-between gap-4">
            <CardDescription>Platform-specific takeaways generated by our AI assistant</CardDescription>
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
          {initialInsightsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, idx) => (
                <div key={idx} className="rounded-md border border-muted/60 bg-muted/10 p-4">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="mt-3 h-14 w-full" />
                </div>
              ))}
            </div>
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
          {initialMetricsLoading || (metricsLoading && creativeBreakdown.length === 0) ? (
            <div className="rounded border border-dashed border-muted/60 p-6">
              <div className="mb-4 flex items-center justify-between">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-28" />
              </div>
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <div key={idx} className="rounded border border-muted/40 p-4">
                    <Skeleton className="h-4 w-56" />
                    <div className="mt-3 grid grid-cols-4 gap-3">
                      {Array.from({ length: 4 }).map((__, metricIdx) => (
                        <Skeleton key={metricIdx} className="h-4 w-full" />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : creativeBreakdown.length === 0 ? (
            <div className="rounded border border-dashed border-muted/60 p-6 text-center text-sm text-muted-foreground">
              No creative-level data yet. Ensure Meta syncs are configured with creative insights.
            </div>
          ) : (
            <ScrollArea className="h-72">
              <table className="w-full table-fixed text-left text-sm">
                <thead className="sticky top-0 bg-background">
                  <tr className="border-b border-muted/60 text-xs uppercase text-muted-foreground">
                    <th className="py-2 pr-4 font-medium">Creative</th>
                    <th className="py-2 pr-4 font-medium">
                      <div className="flex items-center gap-1">
                        Spend
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="h-3 w-3 text-muted-foreground/70" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Amount spent on this creative</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </th>
                    <th className="py-2 pr-4 font-medium">
                      <div className="flex items-center gap-1">
                        Clicks
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="h-3 w-3 text-muted-foreground/70" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Number of clicks on this creative</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </th>
                    <th className="py-2 pr-4 font-medium">
                      <div className="flex items-center gap-1">
                        Conversions
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="h-3 w-3 text-muted-foreground/70" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Number of conversions from this creative</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </th>
                    <th className="py-2 pr-4 font-medium">
                      <div className="flex items-center gap-1">
                        Revenue
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="h-3 w-3 text-muted-foreground/70" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Revenue generated by this creative</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </th>
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
