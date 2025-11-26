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
          <Card key={stat.name} className="overflow-hidden border-muted/60 bg-background transition-all hover:shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between space-x-4">
                <div className="flex items-center justify-center rounded-full bg-primary/10 p-2.5 text-primary ring-1 ring-primary/20">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex items-center gap-1">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground/50 hover:text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{stat.helper}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
              <div className="mt-4 space-y-1">
                <p className="text-sm font-medium text-muted-foreground">{stat.name}</p>
                <p className="text-2xl font-bold tracking-tight text-foreground">{stat.value}</p>
              </div>
              <div className="mt-2">
                <span className="text-xs text-muted-foreground">{stat.helper}</span>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
