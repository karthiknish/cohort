'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState, Suspense } from 'react'
import {
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  DollarSign,
  Megaphone,
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
import { TooltipProvider } from '@/components/ui/tooltip'
import { formatCurrency } from '@/lib/utils'
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

// New components
import { OnboardingCard } from '@/components/dashboard/onboarding-card'
import { QuickActions } from '@/components/dashboard/quick-actions'
import { StatsCards } from '@/components/dashboard/stats-cards'
import { TasksCard } from '@/components/dashboard/tasks-card'
import { ComparisonTable } from '@/components/dashboard/comparison/comparison-table'
import { ComparisonSummaryTile } from '@/components/dashboard/comparison/comparison-summary-tile'
import { ComparisonInsights } from '@/components/dashboard/comparison/comparison-insights'

// Types and Utils
import type {
  MetricRecord,
  SummaryStat,
  DashboardTaskItem,
  ClientComparisonSummary,
  ComparisonInsight,
} from '@/types/dashboard'
import {
  resolveJson,
  buildClientComparisonSummary,
  groupMetricsByClient,
  formatRoas,
  formatCpa,
  mapTasksForDashboard,
  getErrorMessage,
} from '@/lib/dashboard-utils'

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
        body: `${formatCurrency(spendLeader.totalAdSpend, spendLeader.currency)} spent`,
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
    <TooltipProvider>
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
            <OnboardingCard />
          </FadeIn>
        )}

        <StatsCards stats={summaryStats} loading={statsLoading} />

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
                      value={comparisonAggregate.currency ? formatCurrency(comparisonAggregate.totalRevenue, comparisonAggregate.currency) : '—'}
                      helper={comparisonAggregate.mixedCurrencies
                        ? 'Totals unavailable for mixed currencies'
                        : `${comparisonAggregate.selectionCount} workspace${comparisonAggregate.selectionCount > 1 ? 's' : ''}`}
                      tooltip="Total revenue across all selected workspaces"
                    />
                    <ComparisonSummaryTile
                      label="Ad spend"
                      value={comparisonAggregate.currency ? formatCurrency(comparisonAggregate.totalAdSpend, comparisonAggregate.currency) : '—'}
                      helper={comparisonAggregate.mixedCurrencies ? 'Align currencies to compare spend' : 'Same selection window'}
                      tooltip="Total ad spend across all selected workspaces"
                    />
                    <ComparisonSummaryTile
                      label="Outstanding"
                      value={comparisonAggregate.currency ? formatCurrency(comparisonAggregate.totalOutstanding, comparisonAggregate.currency) : '—'}
                      helper={comparisonAggregate.mixedCurrencies ? 'Totals hidden (mixed currencies)' : 'Open invoices + retainers'}
                      tooltip="Total unpaid invoices and retainers"
                    />
                    <ComparisonSummaryTile
                      label="Weighted ROAS"
                      value={comparisonAggregate.mixedCurrencies || comparisonAggregate.avgRoas === null ? '—' : formatRoas(comparisonAggregate.avgRoas)}
                      helper={comparisonAggregate.mixedCurrencies ? 'Unavailable for mixed currencies' : 'Revenue ÷ ad spend across selection'}
                      tooltip="Average ROAS weighted by ad spend"
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
                  <CardContent>
                    <ComparisonInsights insights={comparisonInsights} loading={comparisonLoading} />
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </FadeIn>

        <FadeIn>
          <QuickActions />
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
                <TasksCard tasks={filteredUpcomingTasks} loading={tasksLoading} />
              </FadeInItem>
            </div>
          </div>
        </FadeIn>
      </div>
    </TooltipProvider>
  )
}

