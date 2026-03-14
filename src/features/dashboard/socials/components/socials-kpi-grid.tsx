'use client'

import { Eye, TrendingUp, Users, UserPlus } from 'lucide-react'

import { Card, CardContent } from '@/shared/ui/card'
import { DASHBOARD_THEME } from '@/lib/dashboard-theme'

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

type SocialsKpiGridProps = {
  items: SocialKpi[]
}

export function SocialsKpiGrid({ items }: SocialsKpiGridProps) {
  return (
    <div className={DASHBOARD_THEME.stats.container}>
      {items.map((item) => {
        const Icon = KPI_ICONS[item.id as keyof typeof KPI_ICONS] ?? TrendingUp

        return (
          <Card
            key={item.id}
            className={DASHBOARD_THEME.stats.card}
          >
            <CardContent className="p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className={DASHBOARD_THEME.stats.label}>
                    {item.label}
                  </p>
                  <p className={`mt-2 tracking-tight ${DASHBOARD_THEME.stats.value}`}>
                    {item.value}
                  </p>
                </div>
                <div className={DASHBOARD_THEME.icons.container}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <p className={DASHBOARD_THEME.stats.description}>{item.detail}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
