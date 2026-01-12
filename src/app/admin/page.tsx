'use client'

import Link from 'next/link'
import { useCallback } from 'react'
import {
  ArrowRight,
  ArrowUpRight,
  Activity,
  CircleAlert,
  BarChart3,
  Bell,
  CircleCheck,
  RefreshCw,
  Settings,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  Users,
  Zap,
  FolderKanban,
  CheckSquare,
  FileText,
  Receipt,
  Bot,
} from 'lucide-react'

import { useQuery } from 'convex/react'

import { api } from '../../../convex/_generated/api'
import { useAuth } from '@/contexts/auth-context'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface DashboardStats {
  totalUsers: number
  activeUsers: number
  totalClients: number
  activeClients: number
  schedulerHealth: 'healthy' | 'warning' | 'error'
  lastSyncTime: string | null
  recentErrors: number
}

interface UsageStats {
  totalUsers: number
  activeUsersToday: number
  activeUsersWeek: number
  activeUsersMonth: number
  newUsersToday: number
  newUsersWeek: number
  totalProjects: number
  projectsThisWeek: number
  totalTasks: number
  tasksCompletedThisWeek: number
  totalInvoices: number
  invoicesThisWeek: number
  totalExpenses: number
  expensesThisWeek: number
  totalClients: number
  activeClientsWeek: number
  agentConversations: number
  agentActionsThisWeek: number
  dailyActiveUsers: Array<{ date: string; count: number }>
  featureUsage: Array<{ feature: string; count: number; trend: number }>
}

interface RecentActivity {
  id: string
  type: 'user_joined' | 'client_created' | 'lead_received' | 'sync_completed' | 'error' | 'new_user_signup'
  title: string
  description: string
  timestamp: string
}

type AdminSection = {
  title: string
  description: string
  href: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  cta: string
  badge?: string
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline'
}

export default function AdminPage() {
  const { user } = useAuth()
  const usersRealtime = useQuery((api as any).adminUsers.listUsers, {
    paginationOpts: { numItems: 1, cursor: null },
  }) as any

  const clientsRealtime = useQuery((api as any).clients.list, {
    workspaceId: user?.agencyId || user?.id || '',
    limit: 100,
  }) as any

  const schedulerEventsRealtime = useQuery((api as any).schedulerEvents.list, {
    limit: 10,
  }) as any

  const adminNotificationsRealtime = useQuery((api as any).adminNotifications.list, {
    limit: 10,
  }) as any

  const usageStatsRealtime = useQuery((api as any).adminUsage.getStats, {}) as any

  const statsLoading =
    usersRealtime === undefined ||
    clientsRealtime === undefined ||
    schedulerEventsRealtime === undefined ||
    adminNotificationsRealtime === undefined

  const usageLoading = usageStatsRealtime === undefined

  const derived = useCallback(() => {
    const usersPayload = usersRealtime
    const usersData = usersPayload && typeof usersPayload === 'object' && 'data' in usersPayload ? usersPayload.data : usersPayload

    const clientsPayload = clientsRealtime
    const clientsData = clientsPayload && typeof clientsPayload === 'object' && 'data' in clientsPayload ? clientsPayload.data : clientsPayload

    const schedulerPayload = schedulerEventsRealtime
    const schedulerData = schedulerPayload && typeof schedulerPayload === 'object' && 'data' in schedulerPayload ? schedulerPayload.data : schedulerPayload

    const notificationsPayload = adminNotificationsRealtime
    const notificationsData = notificationsPayload && typeof notificationsPayload === 'object' && 'data' in notificationsPayload ? notificationsPayload.data : notificationsPayload

    let totalUsers = 0
    let activeUsers = 0
    if (usersData) {
      totalUsers = typeof usersData.total === 'number' ? usersData.total : Array.isArray(usersData.users) ? usersData.users.length : 0
      activeUsers =
        typeof usersData.activeTotal === 'number'
          ? usersData.activeTotal
          : Array.isArray(usersData.users)
            ? usersData.users.filter((u: { status: string }) => u.status === 'active').length
            : 0
    }

    let totalClients = 0
    let activeClients = 0
    if (clientsData) {
      totalClients = typeof clientsData.total === 'number' ? clientsData.total : Array.isArray(clientsData.clients) ? clientsData.clients.length : 0
      activeClients = totalClients
    }

    const recentActivities: RecentActivity[] = []

    let schedulerHealth: 'healthy' | 'warning' | 'error' = 'healthy'
    let lastSyncTime: string | null = null
    let recentErrors = 0
    {
      const events = Array.isArray(schedulerData?.events) ? schedulerData.events : Array.isArray(schedulerPayload?.events) ? schedulerPayload.events : []
      recentErrors = events.filter((e: { severity: string }) => e.severity === 'error').length
      if (recentErrors > 5) schedulerHealth = 'error'
      else if (recentErrors > 0) schedulerHealth = 'warning'

      const lastSync = events.find((e: { source: string }) => e.source === 'cron' || e.source === 'worker')
      if (lastSync?.createdAt) {
        lastSyncTime = lastSync.createdAt
      }
    }

    {
      const notifications = Array.isArray(notificationsData?.notifications)
        ? notificationsData.notifications
        : Array.isArray(notificationsPayload?.notifications)
          ? notificationsPayload.notifications
          : []
      notifications.forEach((n: { id: string; type: string; title: string; message: string; createdAt: string }) => {
        if (n.type === 'new_user_signup') {
          recentActivities.push({
            id: `notification-${n.id}`,
            type: 'new_user_signup',
            title: n.title || 'New User Signup',
            description: n.message,
            timestamp: n.createdAt,
          })
        }
      })
    }

    recentActivities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    return {
      stats: {
        totalUsers,
        activeUsers,
        totalClients,
        activeClients,
        schedulerHealth,
        lastSyncTime,
        recentErrors,
      } satisfies DashboardStats,
      activities: recentActivities.slice(0, 5),
    }
  }, [usersRealtime, clientsRealtime, schedulerEventsRealtime, adminNotificationsRealtime])

  const derivedResult = derived()
  const stats = derivedResult.stats
  const activities = derivedResult.activities
  const refreshing = false
  const usageStats = usageStatsRealtime as UsageStats | null

  const fetchDashboardData = useCallback(async () => {
    // Convex subscriptions are realtime; no manual refresh required.
  }, [])

  const adminSections: AdminSection[] = [
    {
      title: 'Team Management',
      description: 'Invite members, manage roles, and control access permissions.',
      href: '/admin/team',
      icon: Users,
      cta: 'Manage team',
      badge: stats ? `${stats.totalUsers} members` : undefined,
    },
    {
      title: 'Client Workspaces',
      description: 'Create and configure client environments with team assignments.',
      href: '/admin/clients',
      icon: ShieldCheck,
      cta: 'Manage clients',
      badge: stats ? `${stats.activeClients} active` : undefined,
    },
    {
      title: 'System Health',
      description: 'Monitor real-time connectivity, latency, and service status.',
      href: '/admin/health',
      icon: Activity,
      cta: 'View status',
      badge: stats?.schedulerHealth === 'error' ? 'Issues' : stats?.schedulerHealth === 'warning' ? 'Warning' : 'Healthy',
      badgeVariant: stats?.schedulerHealth === 'error' ? 'destructive' : stats?.schedulerHealth === 'warning' ? 'secondary' : 'outline',
    },
  ]

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4 py-16">
        <Card className="max-w-md border-border">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <ShieldCheck className="h-6 w-6 text-muted-foreground" />
            </div>
            <CardTitle className="text-xl">Admin Access Required</CardTitle>
            <CardDescription>Sign in with an admin account to access the control panel.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button asChild>
              <Link href="/">Sign in</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
            <p className="mt-1 text-muted-foreground">
              Welcome back, {user.name?.split(' ')[0] ?? 'Admin'}. Here&apos;s your agency overview.
            </p>
          </div>
          <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                disabled
                title="Convex is realtime; refresh not needed"
              >
                <RefreshCw className={cn('mr-2 h-4 w-4')} />
                Refresh
              </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/dashboard">
                <ArrowUpRight className="mr-2 h-4 w-4" />
                Dashboard
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{stats?.totalUsers ?? 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats?.activeUsers ?? 0} active
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Clients</CardTitle>
              <ShieldCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{stats?.activeClients ?? 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats?.totalClients ?? 0} total workspaces
                  </p>
                </>
              )}
            </CardContent>
          </Card>


          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">System Status</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    {stats?.schedulerHealth === 'healthy' && (
                      <>
                        <CircleCheck className="h-5 w-5 text-emerald-500" />
                        <span className="text-2xl font-bold text-emerald-600">Healthy</span>
                      </>
                    )}
                    {stats?.schedulerHealth === 'warning' && (
                      <>
                        <CircleAlert className="h-5 w-5 text-amber-500" />
                        <span className="text-2xl font-bold text-amber-600">Warning</span>
                      </>
                    )}
                    {stats?.schedulerHealth === 'error' && (
                      <>
                        <CircleAlert className="h-5 w-5 text-red-500" />
                        <span className="text-2xl font-bold text-red-600">Issues</span>
                      </>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {stats?.recentErrors ?? 0} errors in last hour
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Usage Analytics Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Usage Analytics
            </h2>
            <Badge variant="outline" className="text-xs">Last 7 days</Badge>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Active Users Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Active Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {usageLoading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">{usageStats?.activeUsersWeek ?? 0}</div>
                    <p className="text-xs text-muted-foreground">
                      {usageStats?.activeUsersToday ?? 0} today · {usageStats?.newUsersWeek ?? 0} new
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Projects Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Projects</CardTitle>
                <FolderKanban className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {usageLoading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">{usageStats?.totalProjects ?? 0}</div>
                    <p className="text-xs text-muted-foreground">
                      +{usageStats?.projectsThisWeek ?? 0} this week
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Tasks Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Tasks Completed</CardTitle>
                <CheckSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {usageLoading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">{usageStats?.tasksCompletedThisWeek ?? 0}</div>
                    <p className="text-xs text-muted-foreground">
                      {usageStats?.totalTasks ?? 0} total tasks
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Agent Mode Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Agent Mode</CardTitle>
                <Bot className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {usageLoading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">{usageStats?.agentConversations ?? 0}</div>
                    <p className="text-xs text-muted-foreground">
                      +{usageStats?.agentActionsThisWeek ?? 0} this week
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Daily Active Users Trend + Feature Usage */}
          <div className="grid gap-4 mt-4 lg:grid-cols-2">
            {/* Daily Trend Chart */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Daily Active Users
                </CardTitle>
                <CardDescription>User logins over the past 7 days</CardDescription>
              </CardHeader>
              <CardContent>
                {usageLoading ? (
                  <div className="flex items-end gap-1 h-32">
                    {[...Array(7)].map((_, i) => (
                      <Skeleton key={i} className="flex-1 h-full" style={{ height: `${30 + Math.random() * 70}%` }} />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Simple bar chart */}
                    <div className="flex items-end gap-1 h-24">
                      {usageStats?.dailyActiveUsers?.map((day, i) => {
                        const maxCount = Math.max(...(usageStats?.dailyActiveUsers?.map(d => d.count) ?? [1]), 1)
                        const height = maxCount > 0 ? (day.count / maxCount) * 100 : 0
                        return (
                          <div
                            key={day.date}
                            className="flex-1 flex flex-col items-center gap-1"
                          >
                            <div
                              className={cn(
                                "w-full rounded-t-sm transition-all",
                                i === 6 ? "bg-primary" : "bg-primary/40"
                              )}
                              style={{ height: `${Math.max(height, 4)}%` }}
                              title={`${day.count} users on ${day.date}`}
                            />
                          </div>
                        )
                      })}
                    </div>
                    {/* Day labels */}
                    <div className="flex gap-1">
                      {usageStats?.dailyActiveUsers?.map((day) => {
                        const date = new Date(day.date)
                        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' })
                        return (
                          <div key={day.date} className="flex-1 text-center text-xs text-muted-foreground">
                            {dayName}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Feature Usage Breakdown */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Feature Usage This Week
                </CardTitle>
                <CardDescription>Activity by module</CardDescription>
              </CardHeader>
              <CardContent>
                {usageLoading ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-2 flex-1" />
                        <Skeleton className="h-4 w-10" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {usageStats?.featureUsage?.slice(0, 5).map((feature) => {
                      const icon = feature.feature === 'Projects' ? FolderKanban :
                        feature.feature === 'Tasks' ? CheckSquare :
                          feature.feature === 'Invoices' ? FileText :
                            feature.feature === 'Expenses' ? Receipt :
                              feature.feature === 'Agent Mode' ? Bot : Activity
                      const Icon = icon
                      const maxCount = Math.max(...(usageStats?.featureUsage?.map(f => f.count) ?? [1]), 1)
                      const percentage = maxCount > 0 ? (feature.count / maxCount) * 100 : 0

                      return (
                        <div key={feature.feature} className="flex items-center gap-3">
                          <div className="flex items-center gap-2 w-24">
                            <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-sm truncate">{feature.feature}</span>
                          </div>
                          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full transition-all"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <div className="flex items-center gap-1 w-16 justify-end">
                            <span className="text-sm font-medium">{feature.count}</span>
                            {feature.trend > 0 && (
                              <TrendingUp className="h-3 w-3 text-emerald-500" />
                            )}
                            {feature.trend < 0 && (
                              <TrendingDown className="h-3 w-3 text-red-500" />
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content Grid */}

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Admin Sections - 2 columns */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-lg font-semibold">Quick Access</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {adminSections.map(({ title, description, href, icon: Icon, cta, badge, badgeVariant }) => (
                <Card
                  key={href}
                  className="group relative overflow-hidden border-border bg-card transition-all hover:border-primary/20 hover:shadow-md"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                        <Icon className="h-5 w-5" />
                      </div>
                      {badge && (
                        <Badge variant={badgeVariant ?? 'secondary'} className="text-xs">
                          {badge}
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="mt-3 text-lg">{title}</CardTitle>
                    <CardDescription className="text-sm">{description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Button asChild variant="ghost" className="group/btn -ml-2 px-2">
                      <Link href={href} className="inline-flex items-center gap-2">
                        {cta}
                        <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Sidebar - Recent Activity & Quick Actions */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Zap className="h-4 w-4" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-2">
                <Button asChild variant="outline" size="sm" className="justify-start">
                  <Link href="/admin/team">
                    <Users className="mr-2 h-4 w-4" />
                    Invite team member
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm" className="justify-start">
                  <Link href="/admin/clients">
                    <ShieldCheck className="mr-2 h-4 w-4" />
                    Create client workspace
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm" className="justify-start">
                  <Link href="/admin/health">
                    <Activity className="mr-2 h-4 w-4" />
                    System health check
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm" className="justify-start">
                  <Link href="/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    Agency settings
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Bell className="h-4 w-4" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
              {statsLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex gap-3">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <div className="flex-1 space-y-1">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : activities.length > 0 ? (
                  <div className="space-y-4">
                    {activities.map((activity) => (
                      <div key={activity.id} className="flex gap-3">
                        <div className={cn(
                          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                          activity.type === 'user_joined' && 'bg-emerald-100 text-emerald-600',
                          activity.type === 'client_created' && 'bg-purple-100 text-purple-600',
                          activity.type === 'new_user_signup' && 'bg-amber-100 text-amber-600',
                          activity.type === 'error' && 'bg-red-100 text-red-600',
                        )}>
                          {activity.type === 'user_joined' && <Users className="h-4 w-4" />}
                          {activity.type === 'client_created' && <ShieldCheck className="h-4 w-4" />}
                          {activity.type === 'new_user_signup' && <Bell className="h-4 w-4" />}
                          {activity.type === 'error' && <CircleAlert className="h-4 w-4" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-foreground">{activity.title}</p>
                          <p className="truncate text-xs text-muted-foreground">{activity.description}</p>
                          {activity.timestamp && (
                            <p className="mt-0.5 text-xs text-muted-foreground/70">
                              {formatRelativeTime(activity.timestamp)}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-sm text-muted-foreground py-4">
                    No recent activity
                  </p>
                )}
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </div>
  )
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}
