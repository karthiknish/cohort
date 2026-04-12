'use client'

import { Eye, TrendingUp, Users, UserPlus } from 'lucide-react'

import { DASHBOARD_THEME } from '@/lib/dashboard-theme'
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/shared/ui/card'

type SocialKpi = {
  id: string
  label: string
  value: string
  detail: string
}

const KPI_ICONS = {
  reach: Eye,
  impressions: TrendingUp,
  engaged_users: Users,
  follower_growth: UserPlus,
} as const

const KPI_ACCENT: Record<string, string> = {
  reach: 'border-l-[3px] border-l-info bg-linear-to-br from-info/8 to-background',
  impressions: 'border-l-[3px] border-l-primary bg-linear-to-br from-primary/6 to-background',
  engaged_users: 'border-l-[3px] border-l-success bg-linear-to-br from-success/6 to-background',
  follower_growth: 'border-l-[3px] border-l-accent bg-linear-to-br from-accent/8 to-background',
}

type SocialsKpiGridProps = {
  items: SocialKpi[]
}

export function SocialsKpiGrid({ items }: SocialsKpiGridProps) {
  return (
    <div className={DASHBOARD_THEME.stats.container}>
      {items.map((item) => {
        const Icon = KPI_ICONS[item.id as keyof typeof KPI_ICONS] ?? TrendingUp
        const accent =
          KPI_ACCENT[item.id] ??
          'border-l-[3px] border-l-muted-foreground/35 bg-linear-to-br from-muted/15 to-background'

        return (
          <Card
            key={item.id}
            className={cn(
              DASHBOARD_THEME.stats.card,
              'overflow-hidden border-muted/50 shadow-sm transition-[box-shadow,border-color] hover:border-primary/15 hover:shadow-md',
              accent,
            )}
          >
            <CardContent className="relative p-5">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1 space-y-1">
                  <p className={DASHBOARD_THEME.stats.label}>{item.label}</p>
                  <p className="text-3xl font-bold tabular-nums tracking-tight text-foreground md:text-4xl">{item.value}</p>
                </div>
                <div className={cn(DASHBOARD_THEME.icons.container, 'h-11 w-11 shrink-0 shadow-sm')}>
                  <Icon className="h-5 w-5" aria-hidden />
                </div>
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground md:text-sm">{item.detail}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
