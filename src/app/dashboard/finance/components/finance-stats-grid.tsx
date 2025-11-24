'use client'

import { Info, type LucideIcon } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

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
          <Card key={stat.name} className="border-muted/60 bg-background">
            <CardContent className="flex items-center justify-between gap-3 p-5">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">{stat.name}</p>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-3 w-3 text-muted-foreground/70" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{stat.helper}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <p className="text-2xl font-semibold text-foreground">{stat.value}</p>
                <span className="text-xs text-muted-foreground">{stat.helper}</span>
              </div>
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </span>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
