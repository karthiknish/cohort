'use client'

import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import {
  ArrowRight,
  ArrowUpRight,
  Activity,
  AlertCircle,
  BarChart3,
  Bell,
  CheckCircle2,
  Clock,
  Inbox,
  Loader2,
  Megaphone,
  RefreshCw,
  Settings,
  ShieldCheck,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react'

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
  pendingLeads: number
  newLeadsToday: number
  schedulerHealth: 'healthy' | 'warning' | 'error'
  lastSyncTime: string | null
  recentErrors: number
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
  const { user, getIdToken } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [activities, setActivities] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchDashboardData = useCallback(async (isRefresh = false) => {
    if (!user?.id) return

    if (isRefresh) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }

    try {
      const token = await getIdToken()

      // Fetch stats from multiple endpoints in parallel
      const [usersRes, clientsRes, leadsRes, schedulerRes, notificationsRes] = await Promise.allSettled([
        fetch('/api/admin/users?pageSize=1', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/clients', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/admin/contact-messages?pageSize=50', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/admin/scheduler/events?pageSize=10', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/admin/notifications?limit=10', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ])

      // Process users
      let totalUsers = 0
      let activeUsers = 0
      if (usersRes.status === 'fulfilled' && usersRes.value.ok) {
        const data = await usersRes.value.json()
        totalUsers = data.total ?? data.users?.length ?? 0
        activeUsers = data.users?.filter((u: { status: string }) => u.status === 'active')?.length ?? 0
      }

      // Process clients
      let totalClients = 0
      let activeClients = 0
      if (clientsRes.status === 'fulfilled' && clientsRes.value.ok) {
        const data = await clientsRes.value.json()
        totalClients = data.clients?.length ?? 0
        activeClients = data.clients?.filter((c: { status: string }) => c.status === 'active')?.length ?? 0
      }

      // Process leads
      let pendingLeads = 0
      let newLeadsToday = 0
      const recentActivities: RecentActivity[] = []
      if (leadsRes.status === 'fulfilled' && leadsRes.value.ok) {
        const data = await leadsRes.value.json()
        const messages = data.messages ?? []
        pendingLeads = messages.filter((m: { status: string }) => m.status === 'new').length
        const today = new Date().toDateString()
        newLeadsToday = messages.filter((m: { createdAt: string }) =>
          m.createdAt && new Date(m.createdAt).toDateString() === today
        ).length

        // Add recent leads to activities
        messages.slice(0, 3).forEach((m: { id: string; name: string; company: string | null; createdAt: string }) => {
          recentActivities.push({
            id: `lead-${m.id}`,
            type: 'lead_received',
            title: 'New lead received',
            description: `${m.name}${m.company ? ` from ${m.company}` : ''}`,
            timestamp: m.createdAt,
          })
        })
      }

      // Process scheduler
      let schedulerHealth: 'healthy' | 'warning' | 'error' = 'healthy'
      let lastSyncTime: string | null = null
      let recentErrors = 0
      if (schedulerRes.status === 'fulfilled' && schedulerRes.value.ok) {
        const data = await schedulerRes.value.json()
        const events = data.events ?? []
        recentErrors = events.filter((e: { severity: string }) => e.severity === 'error').length
        if (recentErrors > 5) schedulerHealth = 'error'
        else if (recentErrors > 0) schedulerHealth = 'warning'

        const lastSync = events.find((e: { source: string }) => e.source === 'cron' || e.source === 'worker')
        if (lastSync?.createdAt) {
          lastSyncTime = lastSync.createdAt
        }
      }

      // Process admin notifications (new signups)
      if (notificationsRes.status === 'fulfilled' && notificationsRes.value.ok) {
        const data = await notificationsRes.value.json()
        const notifications = data.notifications ?? []
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

      // Sort activities by timestamp (most recent first)
      recentActivities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

      setStats({
        totalUsers,
        activeUsers,
        totalClients,
        activeClients,
        pendingLeads,
        newLeadsToday,
        schedulerHealth,
        lastSyncTime,
        recentErrors,
      })

      setActivities(recentActivities.slice(0, 5))
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [user?.id, getIdToken])

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

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
      title: 'Lead Pipeline',
      description: 'Review incoming inquiries and track follow-up progress.',
      href: '/admin/leads',
      icon: Megaphone,
      cta: 'Review leads',
      badge: stats && stats.pendingLeads > 0 ? `${stats.pendingLeads} new` : undefined,
      badgeVariant: stats && stats.pendingLeads > 0 ? 'destructive' : 'default',
    },
    {
      title: 'System Health',
      description: 'Monitor scheduler runs, sync status, and error logs.',
      href: '/admin/scheduler',
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
              <Link href="/auth">Sign in</Link>
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
              onClick={() => fetchDashboardData(true)}
              disabled={refreshing}
            >
              <RefreshCw className={cn('mr-2 h-4 w-4', refreshing && 'animate-spin')} />
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
              {loading ? (
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
              {loading ? (
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
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Leads</CardTitle>
              <Inbox className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{stats?.pendingLeads ?? 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats?.newLeadsToday ?? 0} new today
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
              {loading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    {stats?.schedulerHealth === 'healthy' && (
                      <>
                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                        <span className="text-2xl font-bold text-emerald-600">Healthy</span>
                      </>
                    )}
                    {stats?.schedulerHealth === 'warning' && (
                      <>
                        <AlertCircle className="h-5 w-5 text-amber-500" />
                        <span className="text-2xl font-bold text-amber-600">Warning</span>
                      </>
                    )}
                    {stats?.schedulerHealth === 'error' && (
                      <>
                        <AlertCircle className="h-5 w-5 text-red-500" />
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
                  <Link href="/admin/leads">
                    <Megaphone className="mr-2 h-4 w-4" />
                    Review new leads
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
                {loading ? (
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
                          activity.type === 'lead_received' && 'bg-blue-100 text-blue-600',
                          activity.type === 'user_joined' && 'bg-emerald-100 text-emerald-600',
                          activity.type === 'client_created' && 'bg-purple-100 text-purple-600',
                          activity.type === 'new_user_signup' && 'bg-amber-100 text-amber-600',
                          activity.type === 'error' && 'bg-red-100 text-red-600',
                        )}>
                          {activity.type === 'lead_received' && <Inbox className="h-4 w-4" />}
                          {activity.type === 'user_joined' && <Users className="h-4 w-4" />}
                          {activity.type === 'client_created' && <ShieldCheck className="h-4 w-4" />}
                          {activity.type === 'new_user_signup' && <Bell className="h-4 w-4" />}
                          {activity.type === 'error' && <AlertCircle className="h-4 w-4" />}
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

            {/* Help Card */}
            <Card className="border-dashed">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Inbox className="h-4 w-4" />
                  Need Help?
                </CardTitle>
                <CardDescription className="text-sm">
                  Contact support for custom workflows or permissions.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="secondary" size="sm" className="w-full">
                  <Link href="/contact">Contact Support</Link>
                </Button>
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
