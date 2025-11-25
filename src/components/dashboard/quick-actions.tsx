import Link from 'next/link'
import { BarChart3, CreditCard, Megaphone, FileText, MessageSquare, CheckSquare, Plus, Briefcase, Users } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/auth-context'

type QuickLink = {
  title: string
  description: string
  href: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  badge: string | null
  roles?: ('admin' | 'team' | 'client')[]
}

type CreateAction = {
  label: string
  href: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  description: string
  roles?: ('admin' | 'team' | 'client')[]
}

// Admin-specific quick links
const adminQuickLinks: QuickLink[] = [
  {
    title: 'Manage ad integrations',
    description: 'Connect platforms, refresh syncs, and review campaign metrics in the Ads hub.',
    href: '/dashboard/ads',
    icon: Megaphone,
    badge: null,
    roles: ['admin', 'team'],
  },
  {
    title: 'Track cash flow',
    description: 'Log operating costs and monitor profitability trends on the Finance tab.',
    href: '/dashboard/finance',
    icon: CreditCard,
    badge: null,
    roles: ['admin', 'team'],
  },
  {
    title: 'Deep-dive analytics',
    description: 'Use advanced breakdowns and visualizations to compare channel performance.',
    href: '/dashboard/analytics',
    icon: BarChart3,
    badge: null,
  },
]

// Client-specific quick links (simpler, focused on their needs)
const clientQuickLinks: QuickLink[] = [
  {
    title: 'View your projects',
    description: 'Check project status, timelines, and deliverables.',
    href: '/dashboard/projects',
    icon: Briefcase,
    badge: null,
  },
  {
    title: 'Track your tasks',
    description: 'See tasks assigned to you and their current status.',
    href: '/dashboard/tasks',
    icon: CheckSquare,
    badge: null,
  },
  {
    title: 'Team collaboration',
    description: 'Message your team and stay updated on discussions.',
    href: '/dashboard/collaboration',
    icon: MessageSquare,
    badge: null,
  },
]

const createActions: CreateAction[] = [
  {
    label: 'New Proposal',
    href: '/dashboard/proposals',
    icon: FileText,
    description: 'AI-powered',
    roles: ['admin', 'team'],
  },
  {
    label: 'New Task',
    href: '/dashboard/tasks?new=true',
    icon: CheckSquare,
    description: 'Add task',
  },
  {
    label: 'Start Chat',
    href: '/dashboard/collaboration',
    icon: MessageSquare,
    description: 'Team discussion',
  },
]

interface QuickActionsProps {
  compact?: boolean
}

export function QuickActions({ compact }: QuickActionsProps) {
  const { user } = useAuth()
  const userRole = user?.role ?? 'client'
  
  // Choose quick links based on role
  const quickLinks = userRole === 'client' ? clientQuickLinks : adminQuickLinks
  
  // Filter create actions based on role
  const filteredCreateActions = createActions.filter(action => {
    if (!action.roles) return true
    return action.roles.includes(userRole as 'admin' | 'team' | 'client')
  })
  
  // Filter quick links based on role
  const filteredQuickLinks = quickLinks.filter(link => {
    if (!link.roles) return true
    return link.roles.includes(userRole as 'admin' | 'team' | 'client')
  })

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Quick actions</CardTitle>
            {!compact && <CardDescription>Jump into the teams and workflows that need attention.</CardDescription>}
          </div>
          {!compact && (
            <div className="hidden sm:flex items-center gap-2">
              {filteredCreateActions.map((action) => {
                const Icon = action.icon
                return (
                  <Button key={action.href} asChild variant="outline" size="sm" className="gap-1.5">
                    <Link href={action.href}>
                      <Plus className="h-3.5 w-3.5" />
                      {action.label}
                    </Link>
                  </Button>
                )
              })}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* Mobile create actions */}
        {!compact && (
          <div className="grid gap-2 sm:hidden mb-4">
            {filteredCreateActions.map((action) => {
              const Icon = action.icon
              return (
                <Button key={action.href} asChild variant="outline" size="sm" className="justify-start gap-2">
                  <Link href={action.href}>
                    <Icon className="h-4 w-4" />
                    {action.label}
                    <span className="ml-auto text-xs text-muted-foreground">{action.description}</span>
                  </Link>
                </Button>
              )
            })}
          </div>
        )}

        <div className={`grid gap-4 ${compact ? 'grid-cols-1' : 'sm:grid-cols-2 lg:grid-cols-3'}`}>
          {filteredQuickLinks.map((link) => {
            const Icon = link.icon
            return (
              <Link
                key={link.href}
                href={link.href}
                className="group flex h-full flex-col justify-between rounded-lg border border-muted/60 bg-background p-4 transition hover:border-primary/80 hover:shadow-sm"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Icon className="h-4 w-4" />
                    </span>
                    {link.badge && (
                      <Badge variant="secondary" className="text-xs">{link.badge}</Badge>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground group-hover:text-primary">{link.title}</p>
                    {!compact && <p className="mt-1 text-xs text-muted-foreground">{link.description}</p>}
                  </div>
                </div>
                {!compact && (
                  <span className="mt-4 inline-flex items-center text-xs font-medium text-primary">
                    Go to {link.title.split(' ')[0]}
                  </span>
                )}
              </Link>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
