import Link from 'next/link'
import { BarChart3, CreditCard, Megaphone } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

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

export function QuickActions() {
  return (
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
  )
}
