'use client'

import { memo, useCallback } from 'react'
import { type LucideIcon, TrendingUp, TrendingDown, Minus, Info } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

interface StatCard {
  name: string
  value: string
  helper: string
  icon: LucideIcon
  trend?: {
    value: number
    label?: string
  }
  tooltip?: string
  onClick?: () => void
}

interface FinanceStatsGridProps {
  stats: {
    cards: StatCard[]
  }
  onStatClick?: (statName: string) => void
}

const STAT_TOOLTIPS: Record<string, string> = {
  'Total Collected': 'Total payments received during the selected period, minus any refunds issued.',
  'Outstanding': 'Unpaid amount across all open and overdue invoices. Click to view details.',
  'Company Costs': 'Recurring business expenses normalized to a monthly value.',
  'Net Profit': 'Revenue minus all costs. A positive value means you\'re profitable.',
}

function TrendIndicator({ value, label }: { value: number; label?: string }) {
  if (value === 0) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
        <Minus className="h-3 w-3" />
        <span>No change</span>
      </span>
    )
  }

  const isPositive = value > 0
  const Icon = isPositive ? TrendingUp : TrendingDown
  const colorClass = isPositive ? 'text-emerald-600' : 'text-red-600'

  return (
    <span className={cn('inline-flex items-center gap-1 text-xs font-medium', colorClass)}>
      <Icon className="h-3 w-3" />
      <span>
        {isPositive ? '+' : ''}{value}%{label ? ` ${label}` : ''}
      </span>
    </span>
  )
}

const StatCardComponent = memo(function StatCardComponent({
  stat,
  onClick,
}: {
  stat: StatCard
  onClick?: () => void
}) {
  const Icon = stat.icon
  const tooltip = stat.tooltip || STAT_TOOLTIPS[stat.name]
  const isClickable = Boolean(onClick || stat.onClick)

  const handleClick = useCallback(() => {
    if (stat.onClick) {
      stat.onClick()
    } else if (onClick) {
      onClick()
    }
  }, [onClick, stat])

  return (
    <Card
      className={cn(
        'group relative overflow-hidden border-muted/60 bg-background transition-all hover:shadow-lg hover:border-primary/20',
        isClickable && 'cursor-pointer hover:scale-[1.02] active:scale-[0.98]'
      )}
      onClick={isClickable ? handleClick : undefined}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={isClickable ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleClick()
        }
      } : undefined}
    >
      {/* Subtle gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <CardContent className="relative p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            {/* Header with tooltip */}
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-medium text-muted-foreground">{stat.name}</p>
              {tooltip && (
                <TooltipProvider delayDuration={300}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        className="inline-flex text-muted-foreground/60 hover:text-muted-foreground transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Info className="h-3.5 w-3.5" />
                        <span className="sr-only">More info about {stat.name}</span>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-[220px] text-center">
                      <p className="text-xs">{tooltip}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>

            {/* Value with animation */}
            <p className="text-2xl font-bold tracking-tight text-foreground tabular-nums">
              {stat.value}
            </p>

            {/* Trend indicator or helper text */}
            <div className="min-h-[1.25rem]">
              {stat.trend !== undefined ? (
                <TrendIndicator value={stat.trend.value} label={stat.trend.label} />
              ) : (
                <p className="text-xs text-muted-foreground/80 leading-relaxed">
                  {stat.helper}
                </p>
              )}
            </div>
          </div>

          {/* Icon */}
          <div className="flex items-center justify-center rounded-xl bg-primary/10 p-2.5 text-primary ring-1 ring-primary/20 group-hover:bg-primary/15 group-hover:ring-primary/30 transition-all">
            <Icon className="h-5 w-5" />
          </div>
        </div>

        {/* Click hint for interactive cards */}
        {isClickable && (
          <div className="absolute bottom-2 right-3 text-[10px] font-medium text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity">
            Click to view
          </div>
        )}
      </CardContent>
    </Card>
  )
})

export const FinanceStatsGrid = memo(function FinanceStatsGrid({ 
  stats, 
  onStatClick 
}: FinanceStatsGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.cards.map((stat) => (
        <StatCardComponent
          key={stat.name}
          stat={stat}
          onClick={onStatClick ? () => onStatClick(stat.name) : undefined}
        />
      ))}
    </div>
  )
})
