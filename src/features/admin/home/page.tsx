'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import {
  Activity,
  AlertCircle,
  ArrowUpRight,
  ChevronRight,
  Lightbulb,
  ShieldCheck,
  UserCheck,
  Users,
} from 'lucide-react'
import { useQuery, usePaginatedQuery } from 'convex/react'

import { api } from '/_generated/api'
import { useAuth } from '@/shared/contexts/auth-context'
import { usePreview } from '@/shared/contexts/preview-context'
import { Button } from '@/shared/ui/button'
import { getPreviewAdminDashboardData } from '@/lib/preview-data'
import { cn } from '@/lib/utils'
import { AdminPageShell } from '../components/admin-page-shell'

const adminLinks = [
  { title: 'Team', href: '/admin/team', icon: Users, description: 'Members and roles' },
  { title: 'Users', href: '/admin/users', icon: UserCheck, description: 'Approvals and access' },
  { title: 'Clients', href: '/admin/clients', icon: ShieldCheck, description: 'Workspaces' },
  { title: 'Features', href: '/admin/features', icon: Lightbulb, description: 'Roadmap board' },
  { title: 'Health', href: '/admin/health', icon: Activity, description: 'System status' },
  { title: 'Issues', href: '/admin/issues', icon: AlertCircle, description: 'User reports' },
] as const

const ADMIN_WORKSPACE_LINK_ACTION = (
  <Button asChild variant="ghost" size="sm">
    <Link href="/dashboard">
      Workspace
      <ArrowUpRight className="size-4" />
    </Link>
  </Button>
)

export default function AdminPage() {
  const { user } = useAuth()
  const { isPreviewMode } = usePreview()
  const previewStats = useMemo(() => getPreviewAdminDashboardData().stats, [])
  const workspaceContext = useQuery(api.users.getMyWorkspaceContext, !isPreviewMode && user ? {} : 'skip')
  const workspaceId = workspaceContext?.workspaceId ?? null
  const includeAllWorkspaces = workspaceContext?.role === 'admin'
  const { results: usersPage } = usePaginatedQuery(
    api.adminUsers.listUsers,
    !isPreviewMode && workspaceId ? { workspaceId, includeAllWorkspaces } : 'skip',
    { initialNumItems: 50 },
  )
  const clientsRealtime = useQuery(
    api.clients.list,
    !isPreviewMode && workspaceId
      ? { workspaceId, limit: 100, includeAllWorkspaces }
      : 'skip',
  ) as { items?: Array<unknown> } | undefined

  const stats = useMemo(() => {
    if (isPreviewMode) return previewStats
    const users = Array.isArray(usersPage) ? usersPage : []
    const clients = Array.isArray(clientsRealtime?.items) ? clientsRealtime.items : []
    return {
      totalUsers: users.length,
      activeUsers: users.filter((u) => u.status === 'active').length,
      totalClients: clients.length,
    }
  }, [isPreviewMode, previewStats, usersPage, clientsRealtime])

  const statsLoading =
    !isPreviewMode && (usersPage === undefined || clientsRealtime === undefined)

  if (!user && !isPreviewMode) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="space-y-4 text-center">
          <p className="text-sm text-muted-foreground">Sign in with an admin account to continue.</p>
          <Button asChild size="sm">
            <Link href="/auth">Sign in</Link>
          </Button>
        </div>
      </div>
    )
  }

  const firstName = (user?.name ?? 'Admin').split(' ')[0]

  return (
    <AdminPageShell
      title="Admin"
      description={`${firstName}, pick a section below.`}
      isPreviewMode={isPreviewMode}
      actions={ADMIN_WORKSPACE_LINK_ACTION}
      className="mx-auto max-w-lg space-y-6"
      headerClassName="border-0 pb-0"
    >
      <dl className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
        <div>
          <dt className="sr-only">Users</dt>
          <dd>
            <span className="font-medium text-foreground">
              {statsLoading ? '—' : stats.totalUsers}
            </span>{' '}
            users
            {!statsLoading && stats.totalUsers > stats.activeUsers ? (
              <span className="text-muted-foreground/80">
                {' '}
                · {stats.totalUsers - stats.activeUsers} pending
              </span>
            ) : null}
          </dd>
        </div>
        <div>
          <dt className="sr-only">Clients</dt>
          <dd>
            <span className="font-medium text-foreground">
              {statsLoading ? '—' : stats.totalClients}
            </span>{' '}
            clients
          </dd>
        </div>
      </dl>

      <nav aria-label="Admin sections" className="divide-y divide-border rounded-lg border border-border">
        {adminLinks.map(({ title, href, icon: Icon, description }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-4 px-4 py-3.5 transition-colors',
              'hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            )}
          >
            <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium text-foreground">{title}</span>
              <span className="block text-xs text-muted-foreground">{description}</span>
            </span>
            <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          </Link>
        ))}
      </nav>
    </AdminPageShell>
  )
}
