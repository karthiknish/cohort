'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState, Suspense } from 'react'
import {
  TriangleAlert,
  ArrowUpRight,
  BarChart3,
  Clock3,
  DollarSign,
  ListChecks,
  Megaphone,
  TrendingUp,
  Trophy,
  Shield,
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
import { usePreview } from '@/contexts/preview-context'
import { getPreviewFinanceSummary, getPreviewMetrics, getPreviewTasks } from '@/lib/preview-data'

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

// Local page components and utilities
import {
  MiniTaskKanban,
  TaskSummary,
  DEFAULT_TASK_SUMMARY,
  ROLE_PRIORITY,
  summarizeTasks,
  sumOutstanding,
  formatNextDueLabel,
  selectTopStatsByRole,
} from './components'

const DAY_IN_MS = 24 * 60 * 60 * 1000

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
  const { isPreviewMode } = usePreview()
  const [financeSummary, setFinanceSummary] = useState<FinanceSummaryResponse | null>(null)
  const [financeLoading, setFinanceLoading] = useState(true)
  const [financeError, setFinanceError] = useState<string | null>(null)
  const [metrics, setMetrics] = useState<MetricRecord[]>([])
  const [metricsLoading, setMetricsLoading] = useState(true)
  const [metricsError, setMetricsError] = useState<string | null>(null)
  const [taskItems, setTaskItems] = useState<DashboardTaskItem[]>([])
  const [rawTasks, setRawTasks] = useState<TaskRecord[]>([])
  const [taskSummary, setTaskSummary] = useState<TaskSummary>(DEFAULT_TASK_SUMMARY)
  const [tasksLoading, setTasksLoading] = useState(true)
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
      setTaskSummary(DEFAULT_TASK_SUMMARY)
      setTasksError(null)
      setTasksLoading(false)
      return () => {
        isCancelled = true
      }
    }

    if (isPreviewMode) {
      const previewFinance = getPreviewFinanceSummary(selectedClientId ?? null)
      const previewMetrics = getPreviewMetrics(selectedClientId ?? null)
      const previewTasks = getPreviewTasks(selectedClientId ?? null)

      setFinanceSummary(previewFinance)
      setFinanceError(null)
      setFinanceLoading(false)

      setMetrics(previewMetrics)
      setMetricsError(null)
      setMetricsLoading(false)

      setRawTasks(previewTasks)
      setTaskItems(mapTasksForDashboard(previewTasks))
      setTaskSummary(summarizeTasks(previewTasks))
      setTasksError(null)
      setTasksLoading(false)

      setLastRefreshed(new Date())

      return () => {
        isCancelled = true
      }
    }

    const query = selectedClientId ? `?clientId=${encodeURIComponent(selectedClientId)}` : ''
    const tasksQuery = query ? `${query}&includeSummary=1` : '?includeSummary=1'

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

        const payload = (await response.json()) as any
        const data = payload.data || payload
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

        const payload = (await response.json()) as any
        const data = payload.data || payload
        if (!isCancelled) {
          const entries = Array.isArray(data?.metrics) ? data.metrics : Array.isArray(data) ? data : []
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
        const response = await fetch(`/api/tasks${tasksQuery}`, {
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

        const payload = (await response.json()) as any
        const data = payload.data || payload
        if (!isCancelled) {
          const tasks = Array.isArray(data?.tasks) ? data.tasks : Array.isArray(data) ? data : []
          const summary = data?.summary
          setRawTasks(tasks)
          const entries = mapTasksForDashboard(tasks)
          setTaskItems(entries)

          if (
            summary &&
            typeof summary.total === 'number' &&
            typeof summary.overdue === 'number' &&
            typeof summary.dueSoon === 'number' &&
            typeof summary.highPriority === 'number'
          ) {
            setTaskSummary(summary)
          } else {
            setTaskSummary(summarizeTasks(tasks))
          }
        }
      } catch (error) {
        if (!isCancelled) {
          setRawTasks([])
          setTaskItems([])
          setTaskSummary(DEFAULT_TASK_SUMMARY)
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
  }, [user?.id, selectedClientId, getIdToken, refreshKey, isPreviewMode])

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

    if (isPreviewMode) {
      const targets = comparisonClientIds.length > 0 ? comparisonClientIds : selectedClientId ? [selectedClientId] : []

      if (targets.length === 0) {
        setComparisonSummaries([])
        setComparisonError(null)
        setComparisonLoading(false)
        return () => {
          isCancelled = true
        }
      }

      setComparisonLoading(true)
      setComparisonError(null)

      try {
        const summaries = targets.map((clientId) => {
          const name = clients.find((c) => c.id === clientId)?.name ?? 'Client'
          return buildClientComparisonSummary({
            clientId,
            clientName: name,
            finance: getPreviewFinanceSummary(clientId),
            metrics: getPreviewMetrics(clientId),
            periodDays: comparisonPeriodDays,
          })
        })

        if (!isCancelled) {
          setComparisonSummaries(summaries)
          setComparisonLoading(false)
        }
      } catch (error) {
        if (!isCancelled) {
          setComparisonSummaries([])
          setComparisonError(getErrorMessage(error, 'Unable to load comparison'))
          setComparisonLoading(false)
        }
      }

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

        const [financeEnvelopes, metricsEnvelope] = await Promise.all([Promise.all(financeRequests), metricsPromise])
        
        // Extract data from envelopes
        const financeResponses = financeEnvelopes.map(env => (env as any)?.data || env)
        const metricsData = (metricsEnvelope as any)?.data || metricsEnvelope
        
        const groupedMetrics = groupMetricsByClient(metricsData.metrics ?? [])

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
  }, [clients, comparisonClientIds, comparisonPeriodDays, getIdToken, selectedClientId, user?.id, isPreviewMode])

  const { primaryStats, secondaryStats } = useMemo(() => {
    const revenueRecords = Array.isArray(financeSummary?.revenue) ? financeSummary.revenue : []
    const costs = Array.isArray(financeSummary?.costs) ? financeSummary.costs : []
    const payments = financeSummary?.payments
    const metricsArray = Array.isArray(metrics) ? metrics : []

    const totalRevenue = revenueRecords.reduce((sum, record) => sum + (record.revenue || 0), 0)
    const totalOperatingExpenses = revenueRecords.reduce((sum, record) => sum + (record.operatingExpenses || 0), 0)
    const totalCompanyCosts = costs.reduce((sum, cost) => sum + (cost.amount || 0), 0)
    const totalAdSpend = metricsArray.reduce((sum, record) => sum + (record.spend || 0), 0)
    const providerCount = metricsArray.length > 0 ? new Set(metricsArray.map((record) => record.providerId)).size : 0
    const combinedExpenses = totalOperatingExpenses + totalCompanyCosts + totalAdSpend
    const netMargin = totalRevenue - combinedExpenses
    const roas = totalAdSpend > 0 && totalRevenue > 0 ? totalRevenue / totalAdSpend : null
    const totalConversions = metricsArray.reduce((sum, record) => sum + (record.conversions || 0), 0)
    const totalOutstanding = sumOutstanding(financeSummary?.payments?.totals ?? [])
    const overdueInvoices = payments?.overdueCount ?? 0
    const openInvoices = payments?.openCount ?? 0
    const nextDueLabel = formatNextDueLabel(payments?.nextDueAt)

    // Detect currency from records
    const currencies = new Set([
      ...revenueRecords.map((r) => r.currency).filter(Boolean),
      ...costs.map((c) => c.currency).filter(Boolean),
      ...(Array.isArray(payments?.totals) ? payments.totals : []).map((entry) => entry.currency).filter(Boolean),
    ])
    const displayCurrency = currencies.size === 1 ? (Array.from(currencies)[0] as string) : 'USD'

    const stats: SummaryStat[] = [
      {
        id: 'total-revenue',
        label: 'Total Revenue',
        value: formatCurrency(totalRevenue, displayCurrency),
        helper:
          revenueRecords.length > 0
            ? revenueRecords.length === 1
              ? 'Based on the latest billing period'
              : `Based on ${revenueRecords.length} billing periods`
            : 'Add revenue records to track income',
        icon: DollarSign,
        emphasis: totalRevenue > 0 ? 'positive' : 'neutral',
        urgency: totalRevenue <= 0 ? 'medium' : 'low',
      },
      {
        id: 'net-margin',
        label: 'Net Margin',
        value: formatCurrency(netMargin, displayCurrency),
        helper: 'Money left after marketing and operating costs',
        icon: TrendingUp,
        emphasis: netMargin > 0 ? 'positive' : netMargin < 0 ? 'negative' : 'neutral',
        urgency: netMargin < 0 ? 'high' : netMargin === 0 ? 'medium' : 'low',
      },
      {
        id: 'roas',
        label: 'ROAS',
        value: roas ? `${roas.toFixed(2)}x` : '—',
        helper: roas ? 'Shows revenue versus ad spend' : 'Need revenue and ad spend data',
        icon: BarChart3,
        emphasis: roas && roas < 1 ? 'negative' : roas && roas >= 1.5 ? 'positive' : 'neutral',
        urgency: roas && roas < 1 ? 'high' : roas && roas < 1.5 ? 'medium' : 'low',
      },
      {
        id: 'ad-spend',
        label: 'Ad Spend',
        value: formatCurrency(totalAdSpend, displayCurrency),
        helper: providerCount > 0 ? `Data from ${providerCount} ad platforms` : 'Connect ad accounts to see spend',
        icon: Megaphone,
        emphasis: 'neutral',
        urgency: providerCount === 0 ? 'medium' : 'low',
      },
      {
        id: 'outstanding',
        label: 'Outstanding',
        value: formatCurrency(totalOutstanding, displayCurrency),
        helper: totalOutstanding > 0 ? `${openInvoices} open invoice${openInvoices === 1 ? '' : 's'}` : 'No outstanding balances',
        icon: Shield,
        emphasis: totalOutstanding > 0 ? 'negative' : 'neutral',
        urgency: overdueInvoices > 0 ? 'high' : totalOutstanding > 0 ? 'medium' : 'low',
      },
      {
        id: 'overdue-invoices',
        label: 'Overdue invoices',
        value: overdueInvoices.toString(),
        helper: overdueInvoices > 0 ? 'Follow up on late payments' : 'All invoices on track',
        icon: TriangleAlert,
        emphasis: overdueInvoices > 0 ? 'negative' : 'neutral',
        urgency: overdueInvoices > 0 ? 'high' : 'low',
      },
      {
        id: 'next-due',
        label: 'Next due',
        value: nextDueLabel ?? 'None scheduled',
        helper: openInvoices > 0 ? `${openInvoices} open invoice${openInvoices === 1 ? '' : 's'}` : 'No invoices currently open',
        icon: Clock3,
        emphasis: nextDueLabel?.includes('overdue') ? 'negative' : 'neutral',
        urgency: nextDueLabel?.includes('overdue') ? 'high' : openInvoices > 0 ? 'medium' : 'low',
      },
      {
        id: 'open-tasks',
        label: 'Open tasks',
        value: taskSummary.total.toString(),
        helper: `${taskSummary.highPriority} high priority · ${taskSummary.overdue} overdue`,
        icon: ListChecks,
        emphasis: taskSummary.overdue > 0 ? 'negative' : taskSummary.highPriority > 0 ? 'neutral' : 'positive',
        urgency: taskSummary.overdue > 0 ? 'high' : taskSummary.dueSoon > 0 ? 'medium' : 'low',
      },
      {
        id: 'due-soon',
        label: 'Due soon (3d)',
        value: taskSummary.dueSoon.toString(),
        helper: taskSummary.dueSoon > 0 ? 'Focus on short-term deliverables' : 'No tasks due in the next 3 days',
        icon: Clock3,
        emphasis: taskSummary.dueSoon > 3 ? 'negative' : taskSummary.dueSoon > 0 ? 'neutral' : 'positive',
        urgency: taskSummary.dueSoon > 3 ? 'high' : taskSummary.dueSoon > 0 ? 'medium' : 'low',
      },
      {
        id: 'conversions',
        label: 'Conversions',
        value: totalConversions.toLocaleString('en-US'),
        helper: providerCount > 0 ? `From ${providerCount} channels` : 'Connect ad platforms to track conversions',
        icon: TrendingUp,
        emphasis: totalConversions === 0 ? 'neutral' : 'positive',
        urgency: totalConversions === 0 ? 'medium' : 'low',
      },
      {
        id: 'active-channels',
        label: 'Active channels',
        value: providerCount.toString(),
        helper: providerCount > 0 ? 'Ad platforms connected' : 'Connect ad platforms to see spend',
        icon: Megaphone,
        emphasis: providerCount === 0 ? 'negative' : 'neutral',
        urgency: providerCount === 0 ? 'medium' : 'low',
      },
    ]

    const { primary, secondary } = selectTopStatsByRole(stats, user?.role)

    return {
      primaryStats: primary,
      secondaryStats: secondary,
    }
  }, [financeSummary, metrics, taskSummary, user?.role])

  const orderedStats = useMemo(() => [...primaryStats, ...secondaryStats], [primaryStats, secondaryStats])

  const statsLoading = financeLoading || metricsLoading || tasksLoading
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
        icon: TriangleAlert,
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

    if (Array.isArray(metrics)) {
      metrics.forEach((m) => {
        if (!m || typeof m.date !== 'string') return
        const date = m.date.split('T')[0]
        const current = dailyMap.get(date) ?? { revenue: 0, spend: 0 }
        dailyMap.set(date, {
          ...current,
          spend: current.spend + (Number(m.spend) || 0),
        })
      })
    }

    const revenueRecords = Array.isArray(financeSummary?.revenue) 
      ? financeSummary!.revenue 
      : []

    if (Array.isArray(revenueRecords)) {
      revenueRecords.forEach((r) => {
        if (!r) return
        let date = ''
        if (typeof r.period === 'string' && r.period.length === 7) {
          // YYYY-MM -> YYYY-MM-01
          date = `${r.period}-01`
        } else if (r.createdAt) {
          date = typeof r.createdAt === 'string' ? r.createdAt.split('T')[0] : ''
        }

        if (date) {
          const current = dailyMap.get(date) ?? { revenue: 0, spend: 0 }
          dailyMap.set(date, {
            ...current,
            revenue: current.revenue + (Number(r.revenue) || 0),
          })
        }
      })
    }

    return Array.from(dailyMap.entries())
      .map(([date, vals]) => ({ date, ...vals }))
      .sort((a, b) => a.date.localeCompare(b.date))
  }, [metrics, financeSummary])

  const isNewUser = useMemo(() => {
    if (!user?.createdAt) return false
    const created = new Date(user.createdAt)
    const now = new Date()
    // User is considered new if account created within last 24 hours
    return (now.getTime() - created.getTime()) < 24 * 60 * 60 * 1000
  }, [user?.createdAt])

  const showOnboarding = !statsLoading && isNewUser && !selectedClientId && metrics.length === 0 && !financeSummary

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

        {/* Role-specific welcome messages */}
        {user?.role === 'admin' && (
          <FadeIn>
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">Admin Dashboard</p>
                  <p className="text-sm text-muted-foreground">
                    You have full access to all workspaces, team management, and administrative functions.
                  </p>
                </div>
                <Link href="/admin">
                  <Button variant="outline" size="sm" className="border-primary/20 hover:bg-primary/10">
                    Admin Panel <ArrowUpRight className="ml-1 h-3 w-3" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </FadeIn>
        )}

        {user?.role === 'client' && (
          <FadeIn>
            <Card className="border-green-200 bg-green-50">
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                  <Trophy className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-green-900">Welcome, {user?.name?.split(' ')[0] || 'Client'}!</p>
                  <p className="text-sm text-green-700">
                    View your project progress, proposals, and collaborate with your team.
                  </p>
                </div>
                <Link href="/dashboard/collaboration">
                  <Button variant="outline" size="sm" className="border-green-300 text-green-700 hover:bg-green-100">
                    Messages <ArrowUpRight className="ml-1 h-3 w-3" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </FadeIn>
        )}

        <StatsCards
          stats={orderedStats}
          primaryCount={Math.max(1, primaryStats.length || Math.min(4, orderedStats.length))}
          loading={statsLoading}
        />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <FadeIn>
              <PerformanceChart metrics={chartData} loading={statsLoading} />
            </FadeIn>

            {/* Comparison section - Admin and Team only */}
            {user?.role !== 'client' && (
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
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
                    <Card className="shadow-sm">
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
                  )}
                </div>
              </FadeIn>
            )}

            {/* Client-specific: Project progress overview */}
            {user?.role === 'client' && (
              <FadeIn>
                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-base">Your Projects</CardTitle>
                    <CardDescription>Track progress on your active projects</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-sm text-muted-foreground">
                        View your project updates, deliverables, and timelines in the Projects section.
                      </div>
                      <Link href="/dashboard/projects">
                        <Button variant="outline" size="sm">
                          View All Projects <ArrowUpRight className="ml-1 h-3 w-3" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </FadeIn>
            )}
          </div>

          <div className="space-y-6">
            <FadeIn>
              <QuickActions compact />
            </FadeIn>

            <FadeIn>
              <MiniTaskKanban tasks={rawTasks} loading={tasksLoading} />
            </FadeIn>

            {/* Comparison insights - Admin/Team only */}
            {user?.role !== 'client' && !comparisonError && comparisonHasSelection && (comparisonLoading || comparisonSummaries.length > 0) && (
              <FadeIn>
                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-base">Workspace highlights</CardTitle>
                    <CardDescription>Auto-generated callouts based on the selected period.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ComparisonInsights insights={comparisonInsights} loading={comparisonLoading} />
                  </CardContent>
                </Card>
              </FadeIn>
            )}

            <FadeIn>
              <TasksCard tasks={filteredUpcomingTasks} loading={tasksLoading} />
            </FadeIn>

            <FadeIn>
              <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
                <ActivityWidget />
              </Suspense>
            </FadeIn>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
