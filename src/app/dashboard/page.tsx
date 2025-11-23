'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState, Suspense } from 'react'
import type { LucideIcon } from 'lucide-react'
import {
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  CreditCard,
  DollarSign,
  Megaphone,
  Sparkles,
  TrendingUp,
  Trophy,
} from 'lucide-react'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { FadeIn, FadeInItem, FadeInStagger } from '@/components/ui/animate-in'
import { useClientContext } from '@/contexts/client-context'
import { useAuth } from '@/contexts/auth-context'
import type { FinanceSummaryResponse } from '@/types/finance'
import type { TaskRecord } from '@/types/tasks'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { ActivityWidget } from '@/components/activity/activity-widget'
import { DashboardFilterBar } from '@/components/dashboard/dashboard-filter-bar'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { PerformanceChart } from '@/components/dashboard/performance-chart'

interface MetricRecord {
  id: string
  providerId: string
  date: string
  clientId?: string | null
  createdAt?: string | null
  spend: number
  impressions: number
  clicks: number
  conversions: number
  revenue?: number | null
}

type SummaryStat = {
  id: string
  label: string
  value: string
  helper: string
  icon: LucideIcon
  emphasis?: 'positive' | 'negative' | 'neutral'
}

type DashboardTaskItem = {
  id: string
  title: string
  dueLabel: string
  priority: TaskRecord['priority']
  clientName: string
}

type ClientComparisonSummary = {
  clientId: string
  clientName: string
  totalRevenue: number
  totalOperatingExpenses: number
  totalAdSpend: number
  totalConversions: number
  roas: number
  cpa: number | null
  outstanding: number
  currency: string
  periodDays: number
}

type ComparisonInsight = {
  id: string
  title: string
  highlight: string
  body: string
  tone: 'positive' | 'warning' | 'neutral'
  icon: LucideIcon
}

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
})

function formatCurrency(value: number): string {
  return currencyFormatter.format(Number.isFinite(value) ? value : 0)
}

const currencyFormatterCache = new Map<string, Intl.NumberFormat>()

function formatCurrencyWithCode(value: number, currency = 'USD'): string {
  if (!currencyFormatterCache.has(currency)) {
    currencyFormatterCache.set(
      currency,
      new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }),
    )
  }
  const formatter = currencyFormatterCache.get(currency) ?? currencyFormatter
  const safeValue = Number.isFinite(value) ? value : 0
  return formatter.format(safeValue)
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

const quickLinks = [
  {
    title: 'Manage ad integrations',
    description: 'Connect platforms, refresh syncs, and review campaign metrics in the Ads hub.',
    href: '/dashboard/ads',
    icon: Megaphone,
  },
  {
    title: 'Track cash flow',
    description: 'Log operating costs and monitor profitability trends on the Finance tab.',
    href: '/dashboard/finance',
    icon: CreditCard,
  },
  {
    title: 'Deep-dive analytics',
    description: 'Use advanced breakdowns and visualizations to compare channel performance.',
    href: '/dashboard/analytics',
    icon: BarChart3,
  },
]

const onboardingSteps = [
  {
    title: 'Pick a client',
    description: 'Use the client switcher to focus this dashboard on one relationship at a time.',
  },
  {
    title: 'Log revenue & costs',
    description: 'Add invoicing data so cash flow and margin stats stay up to date.',
  },
  {
    title: 'Connect ad platforms',
    description: 'Head to the Ads hub to sync Google, Meta, LinkedIn, or TikTok campaigns.',
  },
] as const

const DEFAULT_TASKS: DashboardTaskItem[] = [
  {
    id: 'default-task-1',
    title: 'Review Q3 performance report',
    dueLabel: 'Today',
    priority: 'high',
    clientName: 'Tech Corp',
  },
  {
    id: 'default-task-2',
    title: 'Create proposal for new client',
    dueLabel: 'Tomorrow',
    priority: 'medium',
    clientName: 'StartupXYZ',
  },
  {
    id: 'default-task-3',
    title: 'Optimize Google Ads campaigns',
    dueLabel: 'This week',
    priority: 'low',
    clientName: 'Retail Store',
  },
]

export default function DashboardPage() {
  const { clients, selectedClient, selectedClientId } = useClientContext()
  const { user, getIdToken } = useAuth()
  const [financeSummary, setFinanceSummary] = useState<FinanceSummaryResponse | null>(null)
  const [financeLoading, setFinanceLoading] = useState(false)
  const [financeError, setFinanceError] = useState<string | null>(null)
  const [metrics, setMetrics] = useState<MetricRecord[]>([])
  const [metricsLoading, setMetricsLoading] = useState(false)
  const [metricsError, setMetricsError] = useState<string | null>(null)
  const [taskItems, setTaskItems] = useState<DashboardTaskItem[]>([])
  const [tasksLoading, setTasksLoading] = useState(false)
  const [tasksError, setTasksError] = useState<string | null>(null)
  const [comparisonClientIds, setComparisonClientIds] = useState<string[]>(() => (selectedClientId ? [selectedClientId] : []))
  const [comparisonPeriodDays, setComparisonPeriodDays] = useState(30)
  const [comparisonSummaries, setComparisonSummaries] = useState<ClientComparisonSummary[]>([])
  const [comparisonLoading, setComparisonLoading] = useState(false)
  const [comparisonError, setComparisonError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date())

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1)
  }

  const comparisonTargets = comparisonClientIds.length > 0
    ? comparisonClientIds
    : selectedClientId
      ? [selectedClientId]
      : []

  const canCompareAcrossClients = user?.role === 'admin'
  const comparisonHasSelection = comparisonTargets.length > 0

  useEffect(() => {
    setComparisonClientIds((current) => {
      if (clients.length === 0) {
        return []
      }
      const validIds = current.filter((id) => clients.some((client) => client.id === id))
      if (validIds.length === current.length && (current.length > 0 || !selectedClientId)) {
        return current
      }
      if (validIds.length === 0 && selectedClientId) {
        return [selectedClientId]
      }
      return validIds
    })
  }, [clients, selectedClientId])

  useEffect(() => {
    if (canCompareAcrossClients) {
      return
    }
    setComparisonClientIds((current) => {
      if (selectedClientId) {
        if (current.length === 1 && current[0] === selectedClientId) {
          return current
        }
        return [selectedClientId]
      }
      return current.length > 1 ? current.slice(0, 1) : current
    })
  }, [canCompareAcrossClients, selectedClientId])

  useEffect(() => {
    let isCancelled = false

    if (!user?.id) {
      setFinanceSummary(null)
      setMetrics([])
      setFinanceError(null)
      setMetricsError(null)
      setFinanceLoading(false)
      setMetricsLoading(false)
      setTaskItems([])
      setTasksError(null)
      setTasksLoading(false)
      return () => {
        isCancelled = true
      }
    }

    const query = selectedClientId ? `?clientId=${encodeURIComponent(selectedClientId)}` : ''

    const loadFinance = async () => {
      setFinanceLoading(true)
      setFinanceError(null)
      try {
        const token = await getIdToken()
        const response = await fetch(`/api/finance${query}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: 'no-store',
        })

        if (!response.ok) {
          let message = 'Failed to load finance data'
          try {
            const payload = (await response.json()) as { error?: unknown }
            if (typeof payload.error === 'string' && payload.error.trim().length > 0) {
              message = payload.error
            }
          } catch {
            // ignore JSON parse errors
          }
          throw new Error(message)
        }

        const data = (await response.json()) as FinanceSummaryResponse
        if (!isCancelled) {
          setFinanceSummary(data)
        }
      } catch (error) {
        if (!isCancelled) {
          setFinanceSummary(null)
          setFinanceError(getErrorMessage(error, 'Unable to load finance data'))
        }
      } finally {
        if (!isCancelled) {
          setFinanceLoading(false)
        }
      }
    }

    const loadMetrics = async () => {
      setMetricsLoading(true)
      setMetricsError(null)
      try {
        const token = await getIdToken()
        const response = await fetch(`/api/metrics${query}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: 'no-store',
        })

        if (!response.ok) {
          let message = 'Failed to load marketing data'
          try {
            const payload = (await response.json()) as { error?: unknown }
            if (typeof payload.error === 'string' && payload.error.trim().length > 0) {
              message = payload.error
            }
          } catch {
            // ignore JSON parse errors
          }
          throw new Error(message)
        }

        const data = (await response.json()) as { metrics?: MetricRecord[] }
        if (!isCancelled) {
          const entries = Array.isArray(data?.metrics) ? data.metrics : []
          setMetrics(entries)
        }
      } catch (error) {
        if (!isCancelled) {
          setMetrics([])
          setMetricsError(getErrorMessage(error, 'Unable to load marketing performance'))
        }
      } finally {
        if (!isCancelled) {
          setMetricsLoading(false)
        }
      }
    }

    const loadTasks = async () => {
      setTasksLoading(true)
      setTasksError(null)
      try {
        const token = await getIdToken()
        const response = await fetch(`/api/tasks${query}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: 'no-store',
        })

        if (!response.ok) {
          let message = 'Failed to load tasks'
          try {
            const payload = (await response.json()) as { error?: unknown }
            if (typeof payload.error === 'string' && payload.error.trim().length > 0) {
              message = payload.error
            }
          } catch {
            // ignore JSON parse errors
          }
          throw new Error(message)
        }

        const data = (await response.json()) as { tasks?: TaskRecord[] }
        if (!isCancelled) {
          const entries = Array.isArray(data?.tasks) ? data.tasks : []
          setTaskItems(mapTasksForDashboard(entries))
        }
      } catch (error) {
        if (!isCancelled) {
          setTaskItems([])
          setTasksError(getErrorMessage(error, 'Unable to load tasks'))
        }
      } finally {
        if (!isCancelled) {
          setTasksLoading(false)
        }
      }
    }

    const loadAll = async () => {
      await Promise.all([loadFinance(), loadMetrics(), loadTasks()])
      if (!isCancelled) {
        setLastRefreshed(new Date())
      }
    }

    void loadAll()
    return () => {
      isCancelled = true
    }
  }, [user?.id, selectedClientId, getIdToken, refreshKey])

  useEffect(() => {
    let isCancelled = false

    if (!user?.id) {
      setComparisonSummaries([])
      setComparisonError(null)
      setComparisonLoading(false)
      return () => {
        isCancelled = true
      }
    }

    const targets = comparisonClientIds.length > 0 ? comparisonClientIds : selectedClientId ? [selectedClientId] : []

    if (targets.length === 0) {
      setComparisonSummaries([])
      setComparisonError(null)
      setComparisonLoading(false)
      return () => {
        isCancelled = true
      }
    }

    const loadComparison = async () => {
      setComparisonLoading(true)
      setComparisonError(null)
      try {
        const token = await getIdToken()

        const params = new URLSearchParams()
        targets.forEach((clientId) => {
          if (clientId) {
            params.append('clientIds', clientId)
          }
        })
        params.set('pageSize', '250')

        const financeRequests = targets.map((clientId) => {
          const financeParams = new URLSearchParams()
          if (clientId) {
            financeParams.set('clientId', clientId)
          }
          const endpoint = financeParams.toString() ? `/api/finance?${financeParams.toString()}` : '/api/finance'
          return fetch(endpoint, {
            headers: { Authorization: `Bearer ${token}` },
            cache: 'no-store',
          }).then((response) => resolveJson(response, 'Unable to load finance data for comparison') as Promise<FinanceSummaryResponse>)
        })

        const metricsEndpoint = params.toString() ? `/api/metrics?${params.toString()}` : '/api/metrics'
        const metricsPromise = fetch(metricsEndpoint, {
          headers: { Authorization: `Bearer ${token}` },
          cache: 'no-store',
        }).then((response) => resolveJson(response, 'Unable to load metrics for comparison') as Promise<{ metrics?: MetricRecord[] }>)

        const [financeResponses, metricsPayload] = await Promise.all([Promise.all(financeRequests), metricsPromise])
        const groupedMetrics = groupMetricsByClient(metricsPayload.metrics ?? [])

        const summaries = targets.map((clientId, index) => {
          const financeData = financeResponses[index] ?? null
          const metricsForClient = groupedMetrics.get(clientId) ?? []
          const clientName = clients.find((client) => client.id === clientId)?.name ?? 'Workspace'

          return buildClientComparisonSummary({
            clientId,
            clientName,
            finance: financeData,
            metrics: metricsForClient,
            periodDays: comparisonPeriodDays,
          })
        })

        if (!isCancelled) {
          const ordered = [...summaries].sort((a, b) => {
            if (a.totalRevenue === b.totalRevenue) {
              return b.totalAdSpend - a.totalAdSpend
            }
            return b.totalRevenue - a.totalRevenue
          })
          setComparisonSummaries(ordered)
        }
      } catch (error) {
        if (!isCancelled) {
          setComparisonSummaries([])
          setComparisonError(getErrorMessage(error, 'Unable to build comparison view'))
        }
      } finally {
        if (!isCancelled) {
          setComparisonLoading(false)
        }
      }
    }

    void loadComparison()

    return () => {
      isCancelled = true
    }
  }, [clients, comparisonClientIds, comparisonPeriodDays, getIdToken, selectedClientId, user?.id])

  const summaryStats = useMemo<SummaryStat[]>(() => {
    const revenueRecords = financeSummary?.revenue ?? []
    const costs = financeSummary?.costs ?? []

    const totalRevenue = revenueRecords.reduce((sum, record) => sum + record.revenue, 0)
    const totalOperatingExpenses = revenueRecords.reduce((sum, record) => sum + record.operatingExpenses, 0)
    const totalCompanyCosts = costs.reduce((sum, cost) => sum + cost.amount, 0)
    const totalAdSpend = metrics.reduce((sum, record) => sum + record.spend, 0)
    const providerCount = metrics.length > 0 ? new Set(metrics.map((record) => record.providerId)).size : 0
    const combinedExpenses = totalOperatingExpenses + totalCompanyCosts + totalAdSpend
    const netMargin = totalRevenue - combinedExpenses
    const roas = totalAdSpend > 0 && totalRevenue > 0 ? totalRevenue / totalAdSpend : null

    return [
      {
        id: 'total-revenue',
        label: 'Total Revenue',
        value: formatCurrency(totalRevenue),
        helper:
          revenueRecords.length > 0
            ? revenueRecords.length === 1
              ? 'Based on the latest billing period'
              : `Based on ${revenueRecords.length} billing periods`
            : 'Add revenue records to track income',
        icon: DollarSign,
        emphasis: totalRevenue > 0 ? 'positive' : 'neutral',
      },
      {
        id: 'ad-spend',
        label: 'Ad Spend',
        value: formatCurrency(totalAdSpend),
        helper: providerCount > 0 ? `Data from ${providerCount} ad platforms` : 'Connect ad accounts to see spend',
        icon: Megaphone,
        emphasis: 'neutral',
      },
      {
        id: 'net-margin',
        label: 'Net Margin',
        value: formatCurrency(netMargin),
        helper: 'Money left after marketing and operating costs',
        icon: TrendingUp,
        emphasis: netMargin > 0 ? 'positive' : netMargin < 0 ? 'negative' : 'neutral',
      },
      {
        id: 'roas',
        label: 'ROAS',
        value: roas ? `${roas.toFixed(2)}x` : '—',
        helper: roas ? 'Shows revenue versus ad spend' : 'Need revenue and ad spend data',
        icon: BarChart3,
        emphasis: roas && roas < 1 ? 'negative' : roas && roas >= 1.5 ? 'positive' : 'neutral',
      },
    ]
  }, [financeSummary, metrics])

  const statsLoading = financeLoading || metricsLoading
  const errorStates = useMemo(
    () => [
      financeError && { id: 'finance', title: 'Finance data unavailable', message: financeError },
      metricsError && { id: 'metrics', title: 'Ad metrics unavailable', message: metricsError },
      tasksError && { id: 'tasks', title: 'Tasks unavailable', message: tasksError },
    ].filter((entry): entry is { id: string; title: string; message: string } => Boolean(entry)),
    [financeError, metricsError, tasksError],
  )

  const comparisonInsights = useMemo<ComparisonInsight[]>(() => {
    if (comparisonSummaries.length === 0) {
      return []
    }

    const roasLeader = [...comparisonSummaries]
      .filter((summary) => Number.isFinite(summary.roas) && summary.roas !== 0)
      .sort((a, b) => (b.roas === Number.POSITIVE_INFINITY ? Number.MAX_VALUE : b.roas) - (a.roas === Number.POSITIVE_INFINITY ? Number.MAX_VALUE : a.roas))[0]

    const spendLeader = [...comparisonSummaries].sort((a, b) => b.totalAdSpend - a.totalAdSpend)[0]
    const cpaRisk = [...comparisonSummaries]
      .filter((summary) => summary.cpa !== null)
      .sort((a, b) => (b.cpa ?? 0) - (a.cpa ?? 0))[0]

    const insights: ComparisonInsight[] = []

    if (roasLeader) {
      insights.push({
        id: 'roas-leader',
        title: 'Top ROAS performer',
        highlight: roasLeader.clientName,
        body: `${formatRoas(roasLeader.roas)} over the past ${roasLeader.periodDays} days`,
        tone: 'positive',
        icon: Trophy,
      })
    }

    if (spendLeader) {
      insights.push({
        id: 'spend-leader',
        title: 'Highest ad investment',
        highlight: spendLeader.clientName,
        body: `${formatCurrencyWithCode(spendLeader.totalAdSpend, spendLeader.currency)} spent`,
        tone: 'neutral',
        icon: ArrowUpRight,
      })
    }

    if (cpaRisk) {
      insights.push({
        id: 'cpa-risk',
        title: 'Rising CPA risk',
        highlight: cpaRisk.clientName,
        body: `${formatCpa(cpaRisk.cpa, cpaRisk.currency)} per conversion`,
        tone: 'warning',
        icon: AlertTriangle,
      })
    }

    return insights
  }, [comparisonSummaries])

  const comparisonAggregate = useMemo(() => {
    if (comparisonSummaries.length === 0) {
      return null
    }
    const totalRevenue = comparisonSummaries.reduce((sum, summary) => sum + summary.totalRevenue, 0)
    const totalAdSpend = comparisonSummaries.reduce((sum, summary) => sum + summary.totalAdSpend, 0)
    const totalOutstanding = comparisonSummaries.reduce((sum, summary) => sum + summary.outstanding, 0)
    const currencySet = new Set(comparisonSummaries.map((summary) => summary.currency))
    const singleCurrency = currencySet.size === 1 ? comparisonSummaries[0].currency : null
    const avgRoas = totalAdSpend > 0 ? totalRevenue / totalAdSpend : totalRevenue > 0 ? Number.POSITIVE_INFINITY : null

    return {
      totalRevenue,
      totalAdSpend,
      totalOutstanding,
      avgRoas,
      selectionCount: comparisonSummaries.length,
      currency: singleCurrency,
      mixedCurrencies: singleCurrency === null,
    }
  }, [comparisonSummaries])

  const resolvedTasks = useMemo(() => {
    if (taskItems.length > 0) {
      return taskItems
    }
    if (tasksError) {
      return DEFAULT_TASKS
    }
    return []
  }, [taskItems, tasksError])

  const filteredUpcomingTasks = useMemo(() => {
    if (resolvedTasks.length === 0) {
      return resolvedTasks
    }

    if (!selectedClient?.name) {
      return resolvedTasks.slice(0, 5)
    }

    const needle = selectedClient.name.toLowerCase()
    const matches = resolvedTasks.filter((task) => task.clientName.toLowerCase().includes(needle))
    const scoped = matches.length > 0 ? matches : resolvedTasks
    return scoped.slice(0, 5)
  }, [resolvedTasks, selectedClient?.name])

  const chartData = useMemo(() => {
    const dailyMap = new Map<string, { revenue: number; spend: number }>()

    metrics.forEach((m) => {
      const date = m.date.split('T')[0]
      const current = dailyMap.get(date) ?? { revenue: 0, spend: 0 }
      dailyMap.set(date, {
        ...current,
        spend: current.spend + m.spend,
      })
    })

    financeSummary?.revenue.forEach((r) => {
      let date = ''
      if (r.period && r.period.length === 7) {
        // YYYY-MM -> YYYY-MM-01
        date = `${r.period}-01`
      } else if (r.createdAt) {
        date = r.createdAt.split('T')[0]
      }

      if (date) {
        const current = dailyMap.get(date) ?? { revenue: 0, spend: 0 }
        dailyMap.set(date, {
          ...current,
          revenue: current.revenue + r.revenue,
        })
      }
    })

    return Array.from(dailyMap.entries())
      .map(([date, vals]) => ({ date, ...vals }))
      .sort((a, b) => a.date.localeCompare(b.date))
  }, [metrics, financeSummary])

  const showOnboarding = !statsLoading && !selectedClientId && metrics.length === 0 && !financeSummary

  return (
    <div className="space-y-6">
      {errorStates.map((error) => (
        <FadeIn key={error.id}>
          <Alert variant="destructive">
            <AlertTitle>{error.title}</AlertTitle>
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
        </FadeIn>
      ))}

      <FadeIn>
        <DashboardHeader
          userDisplayName={user?.name}
          onRefresh={handleRefresh}
          isRefreshing={financeLoading || metricsLoading || tasksLoading}
          lastRefreshed={lastRefreshed}
        />
      </FadeIn>

      {showOnboarding && (
        <FadeIn>
          <Card className="border-muted/70 bg-background shadow-sm">
            <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Sparkles className="h-4 w-4" />
                </span>
                <div>
                  <CardTitle className="text-base">Get the most from Cohorts</CardTitle>
                  <CardDescription>Follow these quick steps to personalise this dashboard for your agency.</CardDescription>
                </div>
              </div>
              <Button asChild size="sm" variant="outline">
                <Link href="/docs/background-sync-setup">View setup guide</Link>
              </Button>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-3">
              {onboardingSteps.map((step, index) => (
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

      <FadeInStagger className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {summaryStats.map((stat) => (
          <FadeInItem key={stat.id}>
            <StatsCard stat={stat} loading={statsLoading} />
          </FadeInItem>
        ))}
      </FadeInStagger>

      <FadeIn>
        <div className="space-y-4">
          <DashboardFilterBar
            clients={clients}
            selectedClientIds={comparisonClientIds}
            onClientChange={setComparisonClientIds}
            periodDays={comparisonPeriodDays}
            onPeriodChange={setComparisonPeriodDays}
            canCompare={Boolean(canCompareAcrossClients)}
          />
          {comparisonHasSelection && !comparisonError && (comparisonLoading || comparisonSummaries.length > 0) && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {comparisonLoading || !comparisonAggregate ? (
                <>
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                </>
              ) : (
                <>
                  <ComparisonSummaryTile
                    label="Combined revenue"
                    value={comparisonAggregate.currency ? formatCurrencyWithCode(comparisonAggregate.totalRevenue, comparisonAggregate.currency) : '—'}
                    helper={comparisonAggregate.mixedCurrencies
                      ? 'Totals unavailable for mixed currencies'
                      : `${comparisonAggregate.selectionCount} workspace${comparisonAggregate.selectionCount > 1 ? 's' : ''}`}
                  />
                  <ComparisonSummaryTile
                    label="Ad spend"
                    value={comparisonAggregate.currency ? formatCurrencyWithCode(comparisonAggregate.totalAdSpend, comparisonAggregate.currency) : '—'}
                    helper={comparisonAggregate.mixedCurrencies ? 'Align currencies to compare spend' : 'Same selection window'}
                  />
                  <ComparisonSummaryTile
                    label="Outstanding"
                    value={comparisonAggregate.currency ? formatCurrencyWithCode(comparisonAggregate.totalOutstanding, comparisonAggregate.currency) : '—'}
                    helper={comparisonAggregate.mixedCurrencies ? 'Totals hidden (mixed currencies)' : 'Open invoices + retainers'}
                  />
                  <ComparisonSummaryTile
                    label="Weighted ROAS"
                    value={comparisonAggregate.mixedCurrencies || comparisonAggregate.avgRoas === null ? '—' : formatRoas(comparisonAggregate.avgRoas)}
                    helper={comparisonAggregate.mixedCurrencies ? 'Unavailable for mixed currencies' : 'Revenue ÷ ad spend across selection'}
                  />
                </>
              )}
            </div>
          )}
          {comparisonError ? (
            <Alert variant="destructive">
              <AlertTitle>Comparison data unavailable</AlertTitle>
              <AlertDescription>{comparisonError}</AlertDescription>
            </Alert>
          ) : (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <Card className="lg:col-span-2 shadow-sm">
                <CardHeader className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle className="text-base">Workspace comparison</CardTitle>
                    <CardDescription>
                      {comparisonHasSelection
                        ? `Tracking ${comparisonTargets.length} workspace${comparisonTargets.length > 1 ? 's' : ''} over the last ${comparisonPeriodDays} days.`
                        : 'Pick at least one workspace to start comparing performance.'}
                    </CardDescription>
                  </div>
                  {!canCompareAcrossClients && (
                    <Badge variant="secondary" className="text-xs">Admin view only</Badge>
                  )}
                </CardHeader>
                <CardContent>
                  <ComparisonTable rows={comparisonSummaries} loading={comparisonLoading} hasSelection={comparisonHasSelection} />
                </CardContent>
              </Card>
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base">Workspace highlights</CardTitle>
                  <CardDescription>Auto-generated callouts based on the selected period.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {comparisonLoading && (
                    <div className="space-y-3">
                      <Skeleton className="h-20 w-full" />
                      <Skeleton className="h-20 w-full" />
                      <Skeleton className="h-20 w-full" />
                    </div>
                  )}
                  {!comparisonLoading && comparisonInsights.length === 0 && (
                    <p className="text-sm text-muted-foreground">Select at least one workspace to see quick insights.</p>
                  )}
                  {!comparisonLoading &&
                    comparisonInsights.map((insight) => {
                      const Icon = insight.icon
                      return (
                        <div
                          key={insight.id}
                          className={cn(
                            'rounded-lg border p-4 text-sm',
                            insight.tone === 'positive' && 'border-emerald-200 bg-emerald-50/60',
                            insight.tone === 'warning' && 'border-amber-200 bg-amber-50/80',
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <span className="rounded-full bg-background/70 p-2 text-primary">
                              <Icon className="h-4 w-4" />
                            </span>
                            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                              {insight.title}
                            </span>
                          </div>
                          <p className="mt-3 text-base font-semibold text-foreground">{insight.highlight}</p>
                          <p className="mt-1 text-xs text-muted-foreground">{insight.body}</p>
                        </div>
                      )
                    })}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </FadeIn>

      <FadeIn>
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Quick actions</CardTitle>
            <CardDescription>Jump into the teams and workflows that need attention.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {quickLinks.map((link) => {
              const Icon = link.icon
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="group flex h-full flex-col justify-between rounded-lg border border-muted/60 bg-background p-4 transition hover:border-primary/80 hover:shadow-sm"
                >
                  <div className="space-y-3">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-foreground group-hover:text-primary">{link.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{link.description}</p>
                    </div>
                  </div>
                  <span className="mt-4 inline-flex items-center text-xs font-medium text-primary">
                    Go to {link.title.split(' ')[0]}
                  </span>
                </Link>
              )
            })}
          </CardContent>
        </Card>
      </FadeIn>

      <FadeIn>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <FadeInItem className="lg:col-span-2">
            <PerformanceChart metrics={chartData} loading={statsLoading} />
          </FadeInItem>

          <div className="space-y-6">
            <FadeInItem>
              <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
                <ActivityWidget />
              </Suspense>
            </FadeInItem>

            <FadeInItem>
              <Card className="shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-base">Upcoming Tasks</CardTitle>
                    <CardDescription>Important actions scheduled this week</CardDescription>
                  </div>
                  <Button asChild variant="ghost" size="sm" className="text-xs">
                    <Link href="/dashboard/tasks">Manage tasks</Link>
                  </Button>
                </CardHeader>
                <CardContent className="space-y-3">
                  {tasksLoading ? (
                    <div className="space-y-3">
                      <Skeleton className="h-16 w-full" />
                      <Skeleton className="h-16 w-full" />
                      <Skeleton className="h-16 w-full" />
                    </div>
                  ) : filteredUpcomingTasks.length > 0 ? (
                    filteredUpcomingTasks.map((task) => (
                      <FadeInItem key={task.id}>
                        <TaskItem task={task} />
                      </FadeInItem>
                    ))
                  ) : (
                    <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-muted/60 p-6 text-center text-sm text-muted-foreground">
                      <p>No open tasks on your radar. Add an item to keep your team aligned.</p>
                      <Button asChild size="sm" variant="outline">
                        <Link href="/dashboard/tasks/new">Create a task</Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </FadeInItem>
          </div>
        </div>
      </FadeIn>
    </div>
  )
}

async function resolveJson(response: Response, fallbackMessage: string): Promise<unknown> {
  if (response.ok) {
    return await response.json()
  }

  let message = fallbackMessage
  try {
    const payload = (await response.json()) as { error?: unknown }
    if (typeof payload?.error === 'string' && payload.error.trim().length > 0) {
      message = payload.error
    }
  } catch {
    // swallow JSON parse failures, fall back to default message
  }
  throw new Error(message)
}

type BuildComparisonSummaryArgs = {
  clientId: string
  clientName: string
  finance: FinanceSummaryResponse | null
  metrics: MetricRecord[]
  periodDays: number
}

function buildClientComparisonSummary({ clientId, clientName, finance, metrics, periodDays }: BuildComparisonSummaryArgs): ClientComparisonSummary {
  const cutoff = Date.now() - periodDays * DAY_IN_MS
  const revenueRecords = finance?.revenue ?? []
  const filteredRevenue = revenueRecords.filter((record) => isRevenueRecordWithinPeriod(record, cutoff))
  const totalRevenue = filteredRevenue.reduce((sum, record) => sum + record.revenue, 0)
  const totalOperatingExpenses = filteredRevenue.reduce((sum, record) => sum + record.operatingExpenses, 0)

  const filteredMetrics = metrics.filter((record) => isMetricWithinPeriod(record, cutoff))
  const totalAdSpend = filteredMetrics.reduce((sum, record) => sum + record.spend, 0)
  const totalConversions = filteredMetrics.reduce((sum, record) => sum + record.conversions, 0)
  const roas = totalAdSpend > 0 ? totalRevenue / totalAdSpend : totalRevenue > 0 ? Number.POSITIVE_INFINITY : 0
  const cpa = totalConversions > 0 ? totalAdSpend / totalConversions : null

  const outstanding = sumOutstandingTotals(finance?.payments?.totals ?? [])
  const currency = determineDominantCurrency(finance)

  return {
    clientId,
    clientName,
    totalRevenue,
    totalOperatingExpenses,
    totalAdSpend,
    totalConversions,
    roas,
    cpa,
    outstanding,
    currency,
    periodDays,
  }
}

function groupMetricsByClient(records: MetricRecord[]): Map<string | null, MetricRecord[]> {
  const map = new Map<string | null, MetricRecord[]>()
  records.forEach((record) => {
    const key = record.clientId ?? null
    const bucket = map.get(key)
    if (bucket) {
      bucket.push(record)
      return
    }
    map.set(key, [record])
  })
  return map
}

function sumOutstandingTotals(totals: { totalOutstanding: number; currency?: string | null }[]): number {
  if (!Array.isArray(totals) || totals.length === 0) {
    return 0
  }
  return totals.reduce((sum, entry) => sum + (Number.isFinite(entry.totalOutstanding) ? entry.totalOutstanding : 0), 0)
}

function determineDominantCurrency(finance: FinanceSummaryResponse | null): string {
  const revenueCurrency = finance?.revenue?.find((record) => typeof record.currency === 'string' && record.currency)?.currency
  if (revenueCurrency) {
    return revenueCurrency
  }
  const paymentsCurrency = finance?.payments?.totals?.find((total) => typeof total.currency === 'string' && total.currency)
  if (paymentsCurrency?.currency) {
    return paymentsCurrency.currency
  }
  return 'USD'
}

function isRevenueRecordWithinPeriod(record: { createdAt?: string | null; period?: string }, cutoff: number): boolean {
  const timestamp = parsePeriodDate(record)
  if (timestamp === null) {
    return true
  }
  return timestamp >= cutoff
}

function parsePeriodDate(record: { createdAt?: string | null; period?: string }): number | null {
  if (record.createdAt) {
    const parsed = Date.parse(record.createdAt)
    if (!Number.isNaN(parsed)) {
      return parsed
    }
  }
  if (record.period) {
    const parsedPeriod = Date.parse(record.period)
    if (!Number.isNaN(parsedPeriod)) {
      return parsedPeriod
    }
    // attempt to parse YYYY-MM strings by appending day
    const asMonth = Date.parse(`${record.period}-01`)
    if (!Number.isNaN(asMonth)) {
      return asMonth
    }
  }
  return null
}

function isMetricWithinPeriod(record: MetricRecord, cutoff: number): boolean {
  const timestamp = parseDateSafe(record.date) ?? parseDateSafe(record.createdAt ?? null)
  if (timestamp === null) {
    return true
  }
  return timestamp >= cutoff
}

function parseDateSafe(value: string | null | undefined): number | null {
  if (!value) {
    return null
  }
  const parsed = Date.parse(value)
  return Number.isNaN(parsed) ? null : parsed
}

function formatRoas(value: number): string {
  if (value === Number.POSITIVE_INFINITY) {
    return 'INF'
  }
  if (!Number.isFinite(value) || value === 0) {
    return '—'
  }
  return `${value.toFixed(2)}x`
}

function formatCpa(value: number | null, currency = 'USD'): string {
  if (value === null || !Number.isFinite(value)) {
    return '—'
  }
  return formatCurrencyWithCode(value, currency)
}

function ComparisonTable({ rows, loading, hasSelection }: { rows: ClientComparisonSummary[]; loading: boolean; hasSelection: boolean }) {
  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    )
  }

  if (!hasSelection) {
    return <p className="text-sm text-muted-foreground">Select one or more workspaces to populate this table.</p>
  }

  if (rows.length === 0) {
    return <p className="text-sm text-muted-foreground">No comparison data yet. Once revenue and ad metrics sync in, you&rsquo;ll see client-by-client stats here.</p>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
            <th className="pb-2">Workspace</th>
            <th className="pb-2">Revenue</th>
            <th className="pb-2">Ad spend</th>
            <th className="pb-2">ROAS</th>
            <th className="pb-2">CPA</th>
            <th className="pb-2">Outstanding</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/60">
          {rows.map((row) => (
            <tr key={row.clientId} className="align-top">
              <td className="py-3">
                <p className="text-sm font-semibold text-foreground">{row.clientName}</p>
                <p className="text-xs text-muted-foreground">{row.periodDays}-day window</p>
              </td>
              <td className="py-3 font-medium text-foreground">{formatCurrencyWithCode(row.totalRevenue, row.currency)}</td>
              <td className="py-3">{formatCurrencyWithCode(row.totalAdSpend, row.currency)}</td>
              <td className="py-3">
                <span className={cn(
                  'rounded-md px-2 py-1 text-xs font-semibold',
                  row.roas !== Number.POSITIVE_INFINITY && row.roas < 1
                    ? 'bg-rose-100 text-rose-700'
                    : row.roas > 2
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-muted text-foreground',
                )}>
                  {formatRoas(row.roas)}
                </span>
              </td>
              <td className="py-3">{formatCpa(row.cpa, row.currency)}</td>
              <td className="py-3">{formatCurrencyWithCode(row.outstanding, row.currency)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function ComparisonSummaryTile({ label, value, helper }: { label: string; value: string; helper: string }) {
  return (
    <div className="rounded-lg border border-muted/70 bg-background p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-2 text-xl font-semibold text-foreground">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{helper}</p>
    </div>
  )
}

function StatsCard({ stat, loading }: { stat: SummaryStat; loading: boolean }) {
  const Icon = stat.icon
  const valueClasses = cn(
    'text-3xl font-bold tracking-tight',
    !loading && stat.emphasis === 'positive' && 'text-emerald-600',
    !loading && stat.emphasis === 'negative' && 'text-red-600',
  )

  return (
    <Card className="shadow-sm">
      <CardContent className="flex items-center justify-between p-6">
        <div className="space-y-2">
          <CardDescription className="text-xs font-medium uppercase text-muted-foreground">
            {stat.label}
          </CardDescription>
          <div className={valueClasses}>{loading ? <Skeleton className="h-8 w-20" /> : stat.value}</div>
          <div className="text-xs text-muted-foreground">
            {loading ? <Skeleton className="h-4 w-32" /> : stat.helper}
          </div>
        </div>
        <div className="rounded-full bg-primary/10 p-3">
          <Icon className="h-6 w-6 text-primary" />
        </div>
      </CardContent>
    </Card>
  )
}

function TaskItem({ task }: { task: DashboardTaskItem }) {
  const priorityColors: Record<DashboardTaskItem['priority'], string> = {
    urgent: 'bg-rose-100 text-rose-700',
    high: 'bg-red-100 text-red-700',
    medium: 'bg-yellow-100 text-yellow-700',
    low: 'bg-green-100 text-green-700',
  }

  return (
    <Card className="border-muted bg-background">
      <CardContent className="flex items-center justify-between p-4">
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">{task.title}</p>
          <p className="text-xs text-muted-foreground">{task.clientName}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={cn('capitalize', priorityColors[task.priority] ?? 'bg-muted text-muted-foreground')}>
            {task.priority}
          </Badge>
          <span className="text-xs text-muted-foreground">{task.dueLabel}</span>
        </div>
      </CardContent>
    </Card>
  )
}

const DAY_IN_MS = 24 * 60 * 60 * 1000

function mapTasksForDashboard(tasks: TaskRecord[]): DashboardTaskItem[] {
  if (!Array.isArray(tasks) || tasks.length === 0) {
    return []
  }

  const withSortKey = tasks
    .filter((task) => task.status !== 'completed')
    .map((task) => {
      const { label, timestamp } = deriveDueMetadata(task.dueDate)
      const rawTitle = typeof task.title === 'string' ? task.title.trim() : ''
      const rawClient = typeof task.client === 'string' ? task.client.trim() : ''
      return {
        id: task.id,
        title: rawTitle.length > 0 ? rawTitle : 'Untitled task',
        dueLabel: label,
        priority: normalizeTaskPriority(task.priority),
        clientName: rawClient.length > 0 ? rawClient : 'Internal',
        sortValue: timestamp,
      }
    })

  withSortKey.sort((a, b) => a.sortValue - b.sortValue)

  return withSortKey.slice(0, 5).map((task) => {
    const { sortValue, ...taskWithoutSort } = task
    void sortValue
    return taskWithoutSort
  })
}

function deriveDueMetadata(rawDue: string | null | undefined): { label: string; timestamp: number } {
  if (!rawDue) {
    return { label: 'No due date', timestamp: Number.MAX_SAFE_INTEGER }
  }

  const dueDate = new Date(rawDue)
  if (Number.isNaN(dueDate.getTime())) {
    return { label: rawDue, timestamp: Number.MAX_SAFE_INTEGER }
  }

  const dueStart = startOfDay(dueDate)
  const todayStart = startOfDay(new Date())
  const diffDays = Math.round((dueStart - todayStart) / DAY_IN_MS)

  if (diffDays === 0) {
    return { label: 'Today', timestamp: dueStart }
  }

  if (diffDays === 1) {
    return { label: 'Tomorrow', timestamp: dueStart }
  }

  if (diffDays === -1) {
    return { label: 'Yesterday', timestamp: dueStart }
  }

  if (diffDays < -1) {
    const daysOverdue = Math.abs(diffDays)
    const suffix = daysOverdue === 1 ? 'day overdue' : 'days overdue'
    return { label: `${daysOverdue} ${suffix}`, timestamp: dueStart }
  }

  if (diffDays <= 7) {
    return { label: `In ${diffDays} days`, timestamp: dueStart }
  }

  return {
    label: dueDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    timestamp: dueStart,
  }
}

function startOfDay(date: Date): number {
  const copy = new Date(date)
  copy.setHours(0, 0, 0, 0)
  return copy.getTime()
}

function normalizeTaskPriority(value: unknown): DashboardTaskItem['priority'] {
  if (value === 'low' || value === 'medium' || value === 'high' || value === 'urgent') {
    return value
  }
  return 'medium'
}
