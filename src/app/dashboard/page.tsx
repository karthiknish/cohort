import { Suspense, useEffect, useMemo, useState } from 'react'
import {
  BarChart3,
  TrendingUp,
  Users,
  DollarSign,
  Activity,
  Clock,
  CheckCircle,
  AlertCircle,
  Search,
  Facebook,
  Linkedin,
  RefreshCw,
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/contexts/auth-context'
import { ScrollArea } from '@/components/ui/scroll-area'

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

const stats = [
  {
    name: 'Total Revenue',
    value: '$45,231',
    change: '+20.1%',
    changeType: 'positive',
    icon: DollarSign
  },
  {
    name: 'Active Clients',
    value: '24',
    change: '+4',
    changeType: 'positive',
    icon: Users
  },
  {
    name: 'Conversion Rate',
    value: '3.24%',
    change: '+0.8%',
    changeType: 'positive',
    icon: TrendingUp
  },
  {
    name: 'ROAS',
    value: '4.2x',
    change: '-0.3x',
    changeType: 'negative',
    icon: BarChart3
  }
]

const recentActivity = [
  {
    id: 1,
    type: 'task',
    message: 'New task assigned: "Q4 Campaign Review"',
    time: '2 minutes ago',
    icon: CheckCircle,
    color: 'text-green-600'
  },
  {
    id: 2,
    type: 'alert',
    message: 'Google Ads budget exceeded for Client ABC',
    time: '1 hour ago',
    icon: AlertCircle,
    color: 'text-red-600'
  },
  {
    id: 3,
    type: 'activity',
    message: 'Meta campaign "Holiday Sale" reached 50% of budget',
    time: '3 hours ago',
    icon: Activity,
    color: 'text-blue-600'
  }
]

const upcomingTasks = [
  {
    id: 1,
    title: 'Review Q3 performance report',
    dueDate: 'Today',
    priority: 'high',
    client: 'Tech Corp'
  },
  {
    id: 2,
    title: 'Create proposal for new client',
    dueDate: 'Tomorrow',
    priority: 'medium',
    client: 'StartupXYZ'
  },
  {
    id: 3,
    title: 'Optimize Google Ads campaigns',
    dueDate: 'This week',
    priority: 'low',
    client: 'Retail Store'
  }
]

function StatsCard({ stat }: { stat: typeof stats[0] }) {
  const Icon = stat.icon
  return (
    <Card className="shadow-sm">
      <CardContent className="flex items-center justify-between p-6">
        <div className="space-y-2">
          <CardDescription className="text-xs font-medium uppercase text-muted-foreground">
            {stat.name}
          </CardDescription>
          <p className="text-3xl font-bold tracking-tight">{stat.value}</p>
          <Badge
            variant={stat.changeType === 'positive' ? 'default' : 'destructive'}
            className="rounded-full text-xs font-medium"
          >
            {stat.change}
          </Badge>
        </div>
        <div className="rounded-full bg-primary/10 p-3">
          <Icon className="h-6 w-6 text-primary" />
        </div>
      </CardContent>
    </Card>
  )
}

function ActivityItem({ item }: { item: typeof recentActivity[0] }) {
  const Icon = item.icon
  return (
    <div className="flex items-start space-x-3">
      <div className={`flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 ${item.color}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">{item.message}</p>
        <p className="mt-1 text-xs text-muted-foreground">{item.time}</p>
      </div>
    </div>
  )
}

function TaskItem({ task }: { task: typeof upcomingTasks[0] }) {
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

export default function DashboardPage() {
  const {
    user,
    connectGoogleAdsAccount,
    connectFacebookAdsAccount,
    connectLinkedInAdsAccount,
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
      } catch (error: any) {
        if (isSubscribed) {
          setMetricError(error.message ?? 'Failed to load marketing data')
        }
      } finally {
        if (isSubscribed) setMetricsLoading(false)
      }
    }

    loadData()

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
    const summary: Record<string, { spend: number; impressions: number; clicks: number; conversions: number; revenue: number }> = {}
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
      connect: connectFacebookAdsAccount,
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
    } catch (error: any) {
      const message = error?.message || 'Unable to connect. Please try again.'
      setConnectionErrors((prev) => ({ ...prev, [providerId]: message }))
    } finally {
      setConnectingProvider(null)
    }
  }

  const handleManualRefresh = () => {
    if (metricsLoading) return
    setRefreshTick((tick) => tick + 1)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Welcome back! Here's an overview of your agency performance.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatsCard key={stat.name} stat={stat} />
        ))}
      </div>

      <Card className="shadow-sm">
        <CardHeader className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="flex flex-col gap-1">
            <CardTitle className="text-lg">Ad platform connections</CardTitle>
            <CardDescription>
              Connect your paid media accounts to import spend, conversions, and creative performance into Cohorts.
            </CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleManualRefresh}
            disabled={metricsLoading}
            className="inline-flex items-center gap-2"
          >
            <RefreshCw className={cn('h-4 w-4', metricsLoading && 'animate-spin')} /> Refresh status
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {adPlatforms.map((platform) => {
              const Icon = platform.icon
              const isConnecting = connectingProvider === platform.id
              const isConnected = connectedProviders[platform.id]
              const error = connectionErrors[platform.id]

              return (
                <Card key={platform.id} className="border-muted/70 bg-background shadow-sm">
                  <CardHeader className="space-y-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <CardTitle className="text-base">{platform.name}</CardTitle>
                      <CardDescription className="text-sm leading-relaxed">
                        {platform.description}
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2 text-xs">
                      <Badge variant={isConnected ? 'default' : 'outline'} className="rounded-full">
                        {isConnected ? 'Connected' : 'Not connected'}
                      </Badge>
                      {isConnecting && <span className="text-muted-foreground">Connecting…</span>}
                    </div>
                    {error && (
                      <Alert variant="destructive" className="text-xs">
                        <AlertTitle>Connection failed</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}
                    <Button
                      type="button"
                      className="w-full"
                      variant={isConnected ? 'outline' : 'default'}
                      disabled={isConnecting}
                      onClick={() => handleConnect(platform.id, platform.connect)}
                    >
                      {isConnected ? 'Reconnect account' : `Connect ${platform.name}`}
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <div className="space-y-2 text-xs text-muted-foreground">
            <Separator />
            <p>
              After connecting, Cohorts will queue an initial data sync covering the last 90 days of performance. You can
              review sync status from the Integrations settings page.
            </p>
          </div>
        </CardContent>
      </Card>

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
          {metricsLoading ? (
            <div className="grid gap-4 md:grid-cols-3">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="h-28 w-full animate-pulse rounded-lg bg-muted" />
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
                    <div className="text-2xl font-semibold">${summary.spend.toFixed(2)}</div>
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
          {metricsLoading ? (
            <div className="space-y-2">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="h-10 w-full animate-pulse rounded bg-muted" />
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
                      <td className="py-2 pr-4 whitespace-nowrap">{metric.date}</td>
                      <td className="py-2 pr-4 capitalize">{metric.providerId}</td>
                      <td className="py-2 pr-4">${metric.spend.toFixed(2)}</td>
                      <td className="py-2 pr-4">{metric.impressions.toLocaleString()}</td>
                      <td className="py-2 pr-4">{metric.clicks.toLocaleString()}</td>
                      <td className="py-2 pr-4">{metric.conversions.toLocaleString()}</td>
                      <td className="py-2">{metric.revenue != null ? `$${metric.revenue.toFixed(2)}` : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Performance Overview</CardTitle>
              <CardDescription>Key metrics from all active campaigns</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              View detailed report
            </Button>
          </CardHeader>
          <CardContent>
            <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-muted">
              <p className="text-sm text-muted-foreground">
                Analytics chart will be displayed here
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
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
              {recentActivity.map((item) => (
                <ActivityItem key={item.id} item={item} />
              ))}
            </CardContent>
          </Card>

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
              {upcomingTasks.map((task) => (
                <TaskItem key={task.id} task={task} />
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
