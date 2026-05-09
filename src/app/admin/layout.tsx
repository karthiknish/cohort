'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { type ReactNode } from 'react'
import {
  Activity,
  ArrowLeft,
  ChevronRight,
  LayoutDashboard,
  Lightbulb,
  ShieldCheck,
  UserCheck,
  Users,
  AlertCircle,
} from 'lucide-react'

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
  {
    title: 'Overview',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    title: 'Team',
    href: '/admin/team',
    icon: Users,
  },
  {
    title: 'Users',
    href: '/admin/users',
    icon: UserCheck,
  },
  {
    title: 'Clients',
    href: '/admin/clients',
    icon: ShieldCheck,
  },
  {
    title: 'Features',
    href: '/admin/features',
    icon: Lightbulb,
  },
  {
    title: 'Health',
    href: '/admin/health',
    icon: Activity,
  },
  {
    title: 'Issues',
    href: '/admin/issues',
    icon: AlertCircle,
  },
]

function AdminNav() {
  const pathname = usePathname()

  return (
    <nav className="mx-auto flex w-full max-w-7xl flex-nowrap items-center gap-1 px-4 py-2 sm:px-6 lg:px-8">
      <Button asChild variant="ghost" size="sm" className="shrink-0 gap-2">
        <Link href="/dashboard">
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Dashboard</span>
        </Link>
      </Button>
      <div className="mx-1 hidden h-6 w-px shrink-0 bg-border sm:block" aria-hidden />
      <div className="flex min-w-0 flex-1 items-center gap-0.5 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] sm:gap-1 [&::-webkit-scrollbar]:hidden">
        {adminNavItems.map((item) => {
          const isActive =
            pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
          return (
            <Button
              key={item.href}
              asChild
              variant={isActive ? 'secondary' : 'ghost'}
              size="sm"
              className={cn(
                'shrink-0 gap-2 rounded-md',
                isActive && 'bg-accent/10 text-primary shadow-sm hover:bg-accent/15',
              )}
            >
              <Link href={item.href} className="whitespace-nowrap">
                <item.icon className="h-4 w-4 shrink-0" />
                <span>{item.title}</span>
              </Link>
            </Button>
          )
        })}
      </div>
    </nav>
  )
}

function AdminBreadcrumb() {
  const pathname = usePathname()

  const getBreadcrumbs = () => {
    const segments = pathname.split('/').filter(Boolean)
    const breadcrumbs: { title: string; href: string }[] = []

    if (segments[0] === 'admin') {
      breadcrumbs.push({ title: 'Admin', href: '/admin' })
      if (segments[1]) {
        const navItem = adminNavItems.find(item => item.href === `/admin/${segments[1]}`)
        if (navItem) {
          breadcrumbs.push({ title: navItem.title, href: navItem.href })
        }
      }
    }

    return breadcrumbs
  }

  const breadcrumbs = getBreadcrumbs()

  if (breadcrumbs.length <= 1) return null

  return (
    <Breadcrumb className="mx-auto max-w-7xl border-t border-border/40 px-4 py-2.5 text-sm sm:px-6 lg:px-8">
      <BreadcrumbList>
        {breadcrumbs.map((crumb, index) => (
          <React.Fragment key={crumb.href}>
            <BreadcrumbItem>
              {index < breadcrumbs.length - 1 ? (
                <BreadcrumbLink asChild>
                  <Link href={crumb.href}>{crumb.title}</Link>
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage>{crumb.title}</BreadcrumbPage>
              )}
            </BreadcrumbItem>
            {index < breadcrumbs.length - 1 && (
              <BreadcrumbSeparator>
                <ChevronRight className="h-4 w-4" />
              </BreadcrumbSeparator>
            )}
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute requiredRole="admin">
      <WorkspaceProviders enablePreview>
        <NavigationProvider>
          <div className="relative min-h-dvh bg-muted/20">
            <main className="min-h-dvh">
              <div className="sticky top-0 z-40 border-b border-border/80 bg-background/90 shadow-sm backdrop-blur-md supports-backdrop-filter:bg-background/75">
                <AdminNav />
                <AdminBreadcrumb />
              </div>
              <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">{children}</div>
            </main>
            <AgentModeDynamic />
          </div>
        </NavigationProvider>
      </WorkspaceProviders>
    </ProtectedRoute>
  )
}
