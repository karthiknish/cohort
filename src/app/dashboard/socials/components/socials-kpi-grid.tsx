'use client'

import { Activity, Gauge, MousePointerClick, Wallet } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

type SocialKpi = {
  id: string
  label: string
  value: string
  detail: string
}

const KPI_ICONS = {
  ctr: MousePointerClick,
  roas: Wallet,
  cpa: Activity,
  efficiency: Gauge,
} as const

type SocialsKpiGridProps = {
  items: SocialKpi[]
}

export function SocialsKpiGrid({ items }: SocialsKpiGridProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {items.map((item, index) => {
        const Icon = KPI_ICONS[item.id as keyof typeof KPI_ICONS] ?? Gauge

        return (
          <Card
            key={item.id}
            className="overflow-hidden border-muted/50 bg-background shadow-sm transition-[transform,box-shadow,border-color] hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-md"
          >
            <CardContent className="relative p-5">
              <div
                className={cn(
                  'pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r',
                  index % 4 === 0 && 'from-[#0668E1] via-[#1877F2] to-[#4C68D7]',
                  index % 4 === 1 && 'from-[#E4405F] via-[#FD5949] to-[#FCAF45]',
                  index % 4 === 2 && 'from-[#0F172A] via-[#0668E1] to-[#0EA5E9]',
                  index % 4 === 3 && 'from-emerald-500 via-cyan-500 to-blue-500',
                )}
              />
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                    {item.label}
                  </p>
                  <p className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
                    {item.value}
                  </p>
                </div>
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-primary/15 bg-primary/5 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <p className="text-sm leading-6 text-muted-foreground">{item.detail}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
