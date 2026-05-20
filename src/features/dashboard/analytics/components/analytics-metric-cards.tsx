'use client'

import { Info } from 'lucide-react'

import { DASHBOARD_THEME } from '@/lib/dashboard-theme'
import { formatCurrency } from '@/lib/utils'
import { Card, CardContent } from '@/shared/ui/card'
import { Skeleton } from '@/shared/ui/skeleton'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/shared/ui/tooltip'

interface AnalyticsMetricCardsProps {
  avgUsersPerDay: number
  avgSessionsPerDay: number
  revenuePerSession: number
  sessionsPerUser: number
  isLoading: boolean
}

function SecondaryMetric({
  label,
  tooltip,
  value,
  isLoading,
}: {
  label: string
  tooltip: string
  value: string
  isLoading: boolean
}) {
  return (
    <div className="space-y-1 border-border/60 px-1 sm:border-l sm:px-4 first:sm:border-l-0 first:sm:pl-0">
      <div className="flex items-center gap-1.5">
        <p className={DASHBOARD_THEME.stats.label}>{label}</p>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Info className="h-3 w-3 text-muted-foreground/50 hover:text-primary" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p className="text-xs">{tooltip}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      {isLoading ? (
        <Skeleton className="h-6 w-16 rounded-md" />
      ) : (
        <p className="text-lg font-semibold tracking-tight text-foreground">{value}</p>
      )}
    </div>
  )
}

export function AnalyticsMetricCards({
  avgUsersPerDay,
  avgSessionsPerDay,
  revenuePerSession,
  sessionsPerUser,
  isLoading,
}: AnalyticsMetricCardsProps) {
  return (
    <Card className="border border-border/60 bg-muted/20 shadow-sm">
      <CardContent className="grid grid-cols-2 gap-6 py-5 sm:grid-cols-4">
        <SecondaryMetric
          label="Avg users / day"
          tooltip="Total users divided by the number of days in your selected range."
          value={avgUsersPerDay.toFixed(1)}
          isLoading={isLoading}
        />
        <SecondaryMetric
          label="Avg sessions / day"
          tooltip="Total sessions divided by days in range — useful for spotting steady traffic vs spikes."
          value={avgSessionsPerDay.toFixed(1)}
          isLoading={isLoading}
        />
        <SecondaryMetric
          label="Revenue / session"
          tooltip="Average revenue earned per session across the selected period."
          value={formatCurrency(revenuePerSession)}
          isLoading={isLoading}
        />
        <SecondaryMetric
          label="Sessions / user"
          tooltip="How often each user returned on average. Values above 1 indicate repeat visits."
          value={`${sessionsPerUser.toFixed(2)}×`}
          isLoading={isLoading}
        />
      </CardContent>
    </Card>
  )
}
