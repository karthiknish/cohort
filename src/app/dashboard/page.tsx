
'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState, Suspense } from 'react'
import type { LucideIcon } from 'lucide-react'
import {
  Activity,
  BarChart3,
  CheckCircle,
  Clock,
  CreditCard,
  DollarSign,
  Megaphone,
  Sparkles,
  TrendingUp,
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
import type { CollaborationMessage } from '@/types/collaboration'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { ActivityWidget } from '@/components/activity/activity-widget'

interface MetricRecord {
  id: string
  providerId: string
  date: string
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

type ActivityFeedItem = {
  id: string
  message: string
  timestampLabel: string
  icon: LucideIcon
  accentClass?: string
}

type DashboardTaskItem = {
  id: string
  title: string
  dueLabel: string
  priority: TaskRecord['priority']
  clientName: string
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

const DEFAULT_ACTIVITY: ActivityFeedItem[] = [
  {
    id: 'default-activity-1',
    message: 'New task assigned: "Q4 Campaign Review"',
    timestampLabel: '2 minutes ago',
    icon: CheckCircle,
    accentClass: 'text-green-600',
  },
  {
    id: 'default-activity-2',
    message: 'Google Ads budget exceeded for Client ABC',
    timestampLabel: '1 hour ago',
    icon: Activity,
    accentClass: 'text-red-600',
  },
  {
    id: 'default-activity-3',
    message: 'Meta campaign "Holiday Sale" reached 50% of budget',
    timestampLabel: '3 hours ago',
    icon: Activity,
    accentClass: 'text-blue-600',
  },
]

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
  const { selectedClient, selectedClientId } = useClientContext()
  const { user, getIdToken } = useAuth()
  const [financeSummary, setFinanceSummary] = useState<FinanceSummaryResponse | null>(null)
  const [financeLoading, setFinanceLoading] = useState(false)
  const [financeError, setFinanceError] = useState<string | null>(null)
  const [metrics, setMetrics] = useState<MetricRecord[]>([])
  const [metricsLoading, setMetricsLoading] = useState(false)
  const [metricsError, setMetricsError] = useState<string | null>(null)
  const [activityItems, setActivityItems] = useState<ActivityFeedItem[]>([])
  const [activityLoading, setActivityLoading] = useState(false)
  const [activityError, setActivityError] = useState<string | null>(null)
  const [taskItems, setTaskItems] = useState<DashboardTaskItem[]>([])
  const [tasksLoading, setTasksLoading] = useState(false)
  const [tasksError, setTasksError] = useState<string | null>(null)

  useEffect(() => {
    let isCancelled = false

    if (!user?.id) {
      setFinanceSummary(null)
      setMetrics([])
      setFinanceError(null)
      setMetricsError(null)
      setFinanceLoading(false)
      setMetricsLoading(false)
      setActivityItems([])
      setActivityError(null)
      setActivityLoading(false)
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

    const loadActivity = async () => {
      setActivityLoading(true)
      setActivityError(null)
      try {
        const token = await getIdToken()
        const params = new URLSearchParams()
        if (selectedClientId) {
          params.set('channelType', 'client')
          params.set('clientId', selectedClientId)
        } else {
          params.set('channelType', 'team')
        }

        const endpoint = `/api/collaboration/messages?${params.toString()}`
        const response = await fetch(endpoint, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: 'no-store',
        })

        if (!response.ok) {
          let message = 'Failed to load recent activity'
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

        const payload = (await response.json()) as { messages?: CollaborationMessage[] }
        const messages = Array.isArray(payload.messages) ? payload.messages : []
        if (!isCancelled) {
          setActivityItems(mapActivityMessages(messages))
        }
      } catch (error) {
        if (!isCancelled) {
          setActivityItems([])
          setActivityError(getErrorMessage(error, 'Unable to load recent activity'))
        }
      } finally {
        if (!isCancelled) {
          setActivityLoading(false)
        }
      }
    }

    void loadFinance()
    void loadMetrics()
    void loadTasks()
    void loadActivity()

    return () => {
      isCancelled = true
    }
  }, [user?.id, selectedClientId, getIdToken])

  const summaryStats = useMemo<SummaryStat[]>(() => {
    const revenueRecords = financeSummary?.revenue ?? []
    const invoices = financeSummary?.invoices ?? []
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
      activityError && { id: 'activity', title: 'Activity feed unavailable', message: activityError },
    ].filter((entry): entry is { id: string; title: string; message: string } => Boolean(entry)),
    [financeError, metricsError, tasksError, activityError],
  )

  const resolvedActivity = useMemo(() => {
    if (activityItems.length > 0) {
      return activityItems
    }
    if (activityError) {
      return DEFAULT_ACTIVITY
    }
    return []
  }, [activityItems, activityError])

  const filteredActivity = useMemo(() => {
    if (resolvedActivity.length === 0) {
      return resolvedActivity
    }

    if (!selectedClient?.name) {
      return resolvedActivity
    }

    const needle = selectedClient.name.toLowerCase()
    const matches = resolvedActivity.filter((activity) => activity.message.toLowerCase().includes(needle))
    return matches.length > 0 ? matches : resolvedActivity
  }, [resolvedActivity, selectedClient?.name])

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
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Welcome back! Quickly scan your pipeline, team priorities, and account health from one view.
          </p>
        </div>
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
            <Card className="h-full">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Performance Overview</CardTitle>
                  <CardDescription>Key metrics from pipelines, tasks, and active campaigns.</CardDescription>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link href="/dashboard/analytics">Open analytics workspace</Link>
                </Button>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-muted/70 p-10 text-center">
                  <p className="max-w-md text-sm text-muted-foreground">
                    Charts appear once analytics data is connected. Until then, you can explore channel-level insights in the analytics workspace.
                  </p>
                  <Button asChild size="sm">
                    <Link href="/dashboard/analytics">Review analytics</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
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

function ActivityItem({ item }: { item: ActivityFeedItem }) {
  const Icon = item.icon
  return (
    <div className="flex items-start space-x-3">
      <div className={cn('flex h-8 w-8 items-center justify-center rounded-full bg-primary/10', item.accentClass)}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground">{item.message}</p>
        <p className="mt-1 text-xs text-muted-foreground">{item.timestampLabel}</p>
      </div>
    </div>
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

const RELATIVE_TIME_FORMATTER = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
const DAY_IN_MS = 24 * 60 * 60 * 1000

function mapActivityMessages(messages: CollaborationMessage[]): ActivityFeedItem[] {
  if (!Array.isArray(messages) || messages.length === 0) {
    return []
  }

  const relevantMessages = messages
    .filter((message) => typeof message.content === 'string' && message.content.trim().length > 0)
    .slice(-5)
    .reverse()

  return relevantMessages.map((message) => ({
    id: message.id,
    message: formatActivityMessage(message),
    timestampLabel: formatRelativeTime(message.createdAt),
    icon: Activity,
    accentClass: getActivityAccent(message.channelType),
  }))
}

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

  return withSortKey.slice(0, 5).map(({ sortValue, ...task }) => task)
}

function formatActivityMessage(message: CollaborationMessage): string {
  const sender = typeof message.senderName === 'string' ? message.senderName.trim() : ''
  const normalized = truncateText(normalizeWhitespace(message.content))
  return sender.length > 0 ? `${sender}: ${normalized}` : normalized
}

function getActivityAccent(channelType: CollaborationMessage['channelType']): string {
  switch (channelType) {
    case 'client':
      return 'text-blue-600'
    case 'project':
      return 'text-purple-600'
    default:
      return 'text-primary'
  }
}

function formatRelativeTime(input: string | null | undefined): string {
  if (!input) {
    return 'Moments ago'
  }

  const date = new Date(input)
  if (Number.isNaN(date.getTime())) {
    return input
  }

  const diffMs = date.getTime() - Date.now()
  const diffSeconds = Math.round(diffMs / 1000)

  if (Math.abs(diffSeconds) < 60) {
    return RELATIVE_TIME_FORMATTER.format(diffSeconds, 'second')
  }

  const diffMinutes = Math.round(diffSeconds / 60)
  if (Math.abs(diffMinutes) < 60) {
    return RELATIVE_TIME_FORMATTER.format(diffMinutes, 'minute')
  }

  const diffHours = Math.round(diffMinutes / 60)
  if (Math.abs(diffHours) < 24) {
    return RELATIVE_TIME_FORMATTER.format(diffHours, 'hour')
  }

  const diffDays = Math.round(diffHours / 24)
  if (Math.abs(diffDays) < 7) {
    return RELATIVE_TIME_FORMATTER.format(diffDays, 'day')
  }

  const diffWeeks = Math.round(diffDays / 7)
  if (Math.abs(diffWeeks) < 5) {
    return RELATIVE_TIME_FORMATTER.format(diffWeeks, 'week')
  }

  const diffMonths = Math.round(diffDays / 30)
  if (Math.abs(diffMonths) < 12) {
    return RELATIVE_TIME_FORMATTER.format(diffMonths, 'month')
  }

  const diffYears = Math.round(diffDays / 365)
  return RELATIVE_TIME_FORMATTER.format(diffYears, 'year')
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

function truncateText(value: string, maxLength = 140): string {
  if (value.length <= maxLength) {
    return value
  }
  return `${value.slice(0, maxLength - 3).trimEnd()}...`
}

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, ' ').trim()
}

function normalizeTaskPriority(value: unknown): DashboardTaskItem['priority'] {
  if (value === 'low' || value === 'medium' || value === 'high' || value === 'urgent') {
    return value
  }
  return 'medium'
}
