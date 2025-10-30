
'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import {
  Activity,
  BarChart3,
  CheckCircle,
  Clock,
  CreditCard,
  DollarSign,
  Megaphone,
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

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

const recentActivity = [
  {
    id: 1,
    type: 'task',
    message: 'New task assigned: "Q4 Campaign Review"',
    time: '2 minutes ago',
    icon: CheckCircle,
    color: 'text-green-600',
  },
  {
    id: 2,
    type: 'alert',
    message: 'Google Ads budget exceeded for Client ABC',
    time: '1 hour ago',
    icon: Activity,
    color: 'text-red-600',
  },
  {
    id: 3,
    type: 'activity',
    message: 'Meta campaign "Holiday Sale" reached 50% of budget',
    time: '3 hours ago',
    icon: Activity,
    color: 'text-blue-600',
  },
]

const upcomingTasks = [
  {
    id: 1,
    title: 'Review Q3 performance report',
    dueDate: 'Today',
    priority: 'high',
    client: 'Tech Corp',
  },
  {
    id: 2,
    title: 'Create proposal for new client',
    dueDate: 'Tomorrow',
    priority: 'medium',
    client: 'StartupXYZ',
  },
  {
    id: 3,
    title: 'Optimize Google Ads campaigns',
    dueDate: 'This week',
    priority: 'low',
    client: 'Retail Store',
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

  useEffect(() => {
    let isCancelled = false

    if (!user?.id) {
      setFinanceSummary(null)
      setMetrics([])
      setFinanceError(null)
      setMetricsError(null)
      setFinanceLoading(false)
      setMetricsLoading(false)
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

        const data = (await response.json()) as MetricRecord[]
        if (!isCancelled) {
          setMetrics(data)
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

    void loadFinance()
    void loadMetrics()

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
        helper: revenueRecords.length > 0 ? `${revenueRecords.length} periods tracked` : 'No revenue records yet',
        icon: DollarSign,
        emphasis: totalRevenue > 0 ? 'positive' : 'neutral',
      },
      {
        id: 'ad-spend',
        label: 'Ad Spend',
        value: formatCurrency(totalAdSpend),
        helper: providerCount > 0 ? `Across ${providerCount} platforms` : 'Connect ad integrations',
        icon: Megaphone,
        emphasis: 'neutral',
      },
      {
        id: 'net-margin',
        label: 'Net Margin',
        value: formatCurrency(netMargin),
        helper: 'After ad and operating costs',
        icon: TrendingUp,
        emphasis: netMargin > 0 ? 'positive' : netMargin < 0 ? 'negative' : 'neutral',
      },
      {
        id: 'roas',
        label: 'ROAS',
        value: roas ? `${roas.toFixed(2)}x` : '—',
        helper: roas ? 'Revenue divided by ad spend' : 'Need revenue and ad spend data',
        icon: BarChart3,
        emphasis: roas && roas < 1 ? 'negative' : roas && roas >= 1.5 ? 'positive' : 'neutral',
      },
    ]
  }, [financeSummary, metrics])

  const statsLoading = financeLoading || metricsLoading
  const combinedErrors = useMemo(
    () => [financeError, metricsError].filter((message): message is string => Boolean(message)),
    [financeError, metricsError],
  )

  const filteredActivity = useMemo(() => {
    if (!selectedClient) return recentActivity
    const matches = recentActivity.filter((activity) => activity.message.includes(selectedClient.name))
    return matches.length > 0 ? matches : recentActivity
  }, [selectedClient])

  const filteredUpcomingTasks = useMemo(() => {
    if (!selectedClient) return upcomingTasks
    const matches = upcomingTasks.filter((task) => task.client === selectedClient.name)
    return matches.length > 0 ? matches : upcomingTasks
  }, [selectedClient])

  return (
    <div className="space-y-6">
      {combinedErrors.length > 0 && (
        <FadeIn>
          <Alert variant="destructive">
            <AlertTitle>Unable to refresh analytics</AlertTitle>
            <AlertDescription>{combinedErrors.join(' ')}</AlertDescription>
          </Alert>
        </FadeIn>
      )}

      <FadeIn>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Welcome back! Quickly scan your pipeline, team priorities, and account health from one view.
          </p>
        </div>
      </FadeIn>

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
                <Button variant="outline" size="sm">
                  View detailed report
                </Button>
              </CardHeader>
              <CardContent>
                <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-muted">
                  <p className="text-sm text-muted-foreground">Analytics chart will be displayed here</p>
                </div>
              </CardContent>
            </Card>
          </FadeInItem>

          <div className="space-y-6">
            <FadeInItem>
              <Card className="shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                      <Clock className="h-4 w-4 text-primary" />
                    </span>
                    <div>
                      <CardTitle className="text-base">Recent Activity</CardTitle>
                      <CardDescription>Latest updates from your teams</CardDescription>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="text-xs">
                    View all
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {filteredActivity.map((item) => (
                    <FadeInItem key={item.id}>
                      <ActivityItem item={item} />
                    </FadeInItem>
                  ))}
                </CardContent>
              </Card>
            </FadeInItem>

            <FadeInItem>
              <Card className="shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-base">Upcoming Tasks</CardTitle>
                    <CardDescription>Important actions scheduled this week</CardDescription>
                  </div>
                  <Button variant="ghost" size="sm" className="text-xs">
                    Manage tasks
                  </Button>
                </CardHeader>
                <CardContent className="space-y-3">
                  {filteredUpcomingTasks.map((task) => (
                    <FadeInItem key={task.id}>
                      <TaskItem task={task} />
                    </FadeInItem>
                  ))}
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
          <p className={valueClasses}>
            {loading ? <span className="block h-8 w-20 animate-pulse rounded bg-muted" /> : stat.value}
          </p>
          <p className="text-xs text-muted-foreground">
            {loading ? <span className="block h-4 w-32 animate-pulse rounded bg-muted" /> : stat.helper}
          </p>
        </div>
        <div className="rounded-full bg-primary/10 p-3">
          <Icon className="h-6 w-6 text-primary" />
        </div>
      </CardContent>
    </Card>
  )
}

function ActivityItem({ item }: { item: (typeof recentActivity)[number] }) {
  const Icon = item.icon
  return (
    <div className="flex items-start space-x-3">
      <div className={cn('flex h-8 w-8 items-center justify-center rounded-full bg-primary/10', item.color)}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground">{item.message}</p>
        <p className="mt-1 text-xs text-muted-foreground">{item.time}</p>
      </div>
    </div>
  )
}

function TaskItem({ task }: { task: (typeof upcomingTasks)[number] }) {
  const priorityColors: Record<string, string> = {
    high: 'bg-red-100 text-red-700',
    medium: 'bg-yellow-100 text-yellow-700',
    low: 'bg-green-100 text-green-700',
  }

  return (
    <Card className="border-muted bg-background">
      <CardContent className="flex items-center justify-between p-4">
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">{task.title}</p>
          <p className="text-xs text-muted-foreground">{task.client}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={cn('capitalize', priorityColors[task.priority])}>
            {task.priority}
          </Badge>
          <span className="text-xs text-muted-foreground">{task.dueDate}</span>
        </div>
      </CardContent>
    </Card>
  )
}
