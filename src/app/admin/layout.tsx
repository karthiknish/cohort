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
  Megaphone,
  ShieldCheck,
  Users,
} from 'lucide-react'

import { AuthProvider } from '@/contexts/auth-context'
import { ProtectedRoute } from '@/components/protected-route'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

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
    title: 'Clients',
    href: '/admin/clients',
    icon: ShieldCheck,
  },
  {
    title: 'Leads',
    href: '/admin/leads',
    icon: Megaphone,
  },
  {
    title: 'Features',
    href: '/admin/features',
    icon: Lightbulb,
  },
  {
    title: 'Scheduler',
    href: '/admin/scheduler',
    icon: Activity,
  },
]

function AdminNav() {
  const pathname = usePathname()

  return (
    <nav className="flex flex-wrap items-center gap-1 border-b bg-background px-4 py-2">
      <Button asChild variant="ghost" size="sm" className="mr-2">
        <Link href="/dashboard">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Dashboard
        </Link>
      </Button>
      <div className="h-4 w-px bg-border mx-2" />
      {adminNavItems.map((item) => {
        const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
        return (
          <Button
            key={item.href}
            asChild
            variant={isActive ? 'secondary' : 'ghost'}
            size="sm"
            className={cn(
              'gap-2',
              isActive && 'bg-primary/10 text-primary hover:bg-primary/15'
            )}
          >
            <Link href={item.href}>
              <item.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{item.title}</span>
            </Link>
          </Button>
        )
      })}
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
    <Breadcrumb className="px-4 py-2 text-sm">
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
    <AuthProvider>
      <ProtectedRoute requiredRole="admin">
        <div className="min-h-screen bg-background">
          <AdminNav />
          <AdminBreadcrumb />
          <main className="pb-8">
            {children}
          </main>
        </div>
      </ProtectedRoute>
    </AuthProvider>
  )
}
