import Link from 'next/link'
import { BarChart3, CreditCard, Megaphone, FileText, MessageSquare, CheckSquare, Plus } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const quickLinks = [
  {
    title: 'Manage ad integrations',
    description: 'Connect platforms, refresh syncs, and review campaign metrics in the Ads hub.',
    href: '/dashboard/ads',
    icon: Megaphone,
    badge: null,
  },
  {
    title: 'Track cash flow',
    description: 'Log operating costs and monitor profitability trends on the Finance tab.',
    href: '/dashboard/finance',
    icon: CreditCard,
    badge: null,
  },
  {
    title: 'Deep-dive analytics',
    description: 'Use advanced breakdowns and visualizations to compare channel performance.',
    href: '/dashboard/analytics',
    icon: BarChart3,
    badge: null,
  },
]

const createActions = [
  {
    label: 'New Proposal',
    href: '/dashboard/proposals',
    icon: FileText,
    description: 'AI-powered',
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

export function QuickActions() {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Quick actions</CardTitle>
            <CardDescription>Jump into the teams and workflows that need attention.</CardDescription>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            {createActions.map((action) => {
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
        </div>
      </CardHeader>
      <CardContent>
        {/* Mobile create actions */}
        <div className="grid gap-2 sm:hidden mb-4">
          {createActions.map((action) => {
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

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {quickLinks.map((link) => {
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
                    <p className="mt-1 text-xs text-muted-foreground">{link.description}</p>
                  </div>
                </div>
                <span className="mt-4 inline-flex items-center text-xs font-medium text-primary">
                  Go to {link.title.split(' ')[0]}
                </span>
              </Link>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
