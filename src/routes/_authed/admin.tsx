import { Outlet, createFileRoute, useLocation } from '@tanstack/react-router'
import { Link as TanStackLink } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import React from 'react'
import { AdminError } from '@/shared/ui/route-boundaries/admin-error'
import { AdminLoading } from '@/shared/ui/route-boundaries/admin-loading'
import {
  Activity,
  AlertCircle,
  ArrowLeft,
  ChevronRight,
  LayoutDashboard,
  Lightbulb,
  ShieldCheck,
  UserCheck,
  Users,
} from 'lucide-react'
import {
  isScreenRecordingAuthBypassEnabled,
  PREVIEW_ROUTE_REQUEST_HEADER,
} from '@/lib/preview-data'
import { ProtectedRoute } from '@/shared/components/protected-route'
import { NavigationProvider } from '@/shared/contexts/navigation-context'
import { AgentModeDynamic } from '@/shared/components/agent-mode/agent-mode-dynamic'
import { cn } from '@/lib/utils'
import { Button } from '@/shared/ui/button'
import { WorkspaceProviders } from '@/shared/providers/workspace-providers'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/shared/ui/breadcrumb'

const adminNavItems = [
  { title: 'Overview', href: '/admin', icon: LayoutDashboard },
  { title: 'Team', href: '/admin/team', icon: Users },
  { title: 'Users', href: '/admin/users', icon: UserCheck },
  { title: 'Clients', href: '/admin/clients', icon: ShieldCheck },
  { title: 'Features', href: '/admin/features', icon: Lightbulb },
  { title: 'Health', href: '/admin/health', icon: Activity },
  { title: 'Issues', href: '/admin/issues', icon: AlertCircle },
]

const loadAdminShell = createServerFn({ method: 'GET' }).handler(async () => {
  const { getRequestHeader } = await import('@tanstack/react-start/server')
  return {
    allowPreviewAccess:
      isScreenRecordingAuthBypassEnabled() ||
      getRequestHeader(PREVIEW_ROUTE_REQUEST_HEADER) === '1',
  }
})

export const Route = createFileRoute('/_authed/admin')({
  loader: () => loadAdminShell(),
  component: AdminLayoutRoute,
  errorComponent: AdminError,
  pendingComponent: AdminLoading,
})

function AdminNav() {
  const location = useLocation()
  const pathname = location.pathname

  return (
    <nav className="mx-auto flex w-full max-w-7xl flex-nowrap items-center gap-1 px-4 py-2 sm:px-6 lg:px-8">
      <Button asChild variant="ghost" size="sm" className="shrink-0 gap-2">
        <TanStackLink to="/dashboard">
          <ArrowLeft className="size-4" />
          <span className="hidden sm:inline">Dashboard</span>
        </TanStackLink>
      </Button>
      <div className="mx-1 hidden h-6 w-px shrink-0 bg-border sm:block" aria-hidden />
      <div className="flex min-w-0 flex-1 items-center gap-0.5 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] sm:gap-1 [&::-webkit-scrollbar]:hidden">
        {adminNavItems.map((item) => {
          const           isActive =
            pathname === item.href ||
            (item.href !== '/admin' && pathname.startsWith(item.href))
          return (
            <Button
              key={item.href}
              asChild
              variant={isActive ? 'secondary' : 'ghost'}
              size="sm"
              className={cn(
                'shrink-0 gap-2 rounded-md',
                isActive &&
                  'bg-accent/10 text-primary shadow-sm hover:bg-accent/15',
              )}
            >
              <TanStackLink to={item.href} className="whitespace-nowrap">
                <item.icon className="size-4 shrink-0" />
                <span>{item.title}</span>
              </TanStackLink>
            </Button>
          )
        })}
      </div>
    </nav>
  )
}

function AdminBreadcrumb() {
  const location = useLocation()
  const pathname = location.pathname

  const segments = pathname.split('/').filter(Boolean)
  const breadcrumbs: { title: string; href: string }[] = []
  if (segments[0] === '_authed' && segments[1] === 'admin') {
    breadcrumbs.push({ title: 'Admin', href: '/admin' })
    if (segments[2]) {
      const navItem = adminNavItems.find(
        (item) => item.href === `/admin/${segments[2]}`,
      )
      if (navItem) {
        breadcrumbs.push({ title: navItem.title, href: navItem.href })
      }
    }
  }

  if (breadcrumbs.length <= 1) return null

  return (
    <Breadcrumb className="mx-auto max-w-7xl border-t border-border/40 px-4 py-2 text-sm sm:px-6 lg:px-8">
      <BreadcrumbList>
        {breadcrumbs.map((crumb, index) => (
          <React.Fragment key={crumb.href}>
            <BreadcrumbItem>
              {index < breadcrumbs.length - 1 ? (
                <BreadcrumbLink asChild>
                  <TanStackLink to={crumb.href}>{crumb.title}</TanStackLink>
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage>{crumb.title}</BreadcrumbPage>
              )}
            </BreadcrumbItem>
            {index < breadcrumbs.length - 1 && (
              <BreadcrumbSeparator>
                <ChevronRight className="size-4" />
              </BreadcrumbSeparator>
            )}
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}

function AdminLayoutRoute() {
  const { allowPreviewAccess } = Route.useLoaderData()
  return (
    <ProtectedRoute requiredRole="admin" allowPreviewAccess={allowPreviewAccess}>
      <WorkspaceProviders enablePreview>
        <NavigationProvider>
          <div className="relative min-h-dvh bg-background">
            <main className="min-h-dvh">
              <div className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-sm">
                <AdminNav />
                <AdminBreadcrumb />
              </div>
              <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                <Outlet />
              </div>
            </main>
            <AgentModeDynamic />
          </div>
        </NavigationProvider>
      </WorkspaceProviders>
    </ProtectedRoute>
  )
}
