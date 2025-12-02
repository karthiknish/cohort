'use client'

import { type LucideIcon } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'

interface StatCard {
  name: string
  value: string
  helper: string
  icon: LucideIcon
}

interface FinanceStatsGridProps {
  stats: {
    cards: StatCard[]
  }
}

export function FinanceStatsGrid({ stats }: FinanceStatsGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.cards.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.name} className="group overflow-hidden border-muted/60 bg-background transition-all hover:shadow-lg hover:border-primary/20">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-3 flex-1">
                  <p className="text-sm font-medium text-muted-foreground">{stat.name}</p>
                  <p className="text-2xl font-bold tracking-tight text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground/80 leading-relaxed">{stat.helper}</p>
                </div>
                <div className="flex items-center justify-center rounded-xl bg-primary/10 p-2.5 text-primary ring-1 ring-primary/20 group-hover:bg-primary/15 transition-colors">
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
