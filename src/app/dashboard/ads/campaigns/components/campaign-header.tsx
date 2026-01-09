'use client'

import { ArrowRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { DateRangePicker, type DateRange } from '@/app/dashboard/ads/components/date-range-picker'
import { cn } from '@/lib/utils'

interface Campaign {
  id: string
  name: string
  providerId: string
  status: string
  startTime?: string
  stopTime?: string
}

interface CampaignHeaderProps {
  campaign: Campaign | null
  loading: boolean
  dateRange: DateRange
  onDateRangeChange: (range: DateRange) => void
  onRefresh: () => void
  refreshing: boolean
}

function formatCampaignDateRange(startTime?: string, stopTime?: string): string {
  const start = startTime ? new Date(startTime) : null
  const stop = stopTime ? new Date(stopTime) : null

  const hasStart = Boolean(start && !Number.isNaN(start.getTime()))
  const hasStop = Boolean(stop && !Number.isNaN(stop.getTime()))

  if (!hasStart && !hasStop) return '—'
  if (hasStart && !hasStop) return `Starts ${start!.toLocaleDateString()}`
  if (!hasStart && hasStop) return `Ends ${stop!.toLocaleDateString()}`
  return `${start!.toLocaleDateString()} → ${stop!.toLocaleDateString()}`
}

export function CampaignHeader({
  campaign,
  loading,
  dateRange,
  onDateRangeChange,
  onRefresh,
  refreshing,
}: CampaignHeaderProps) {
  const providerDisplay = campaign?.providerId === 'facebook' ? 'Meta Ads' : 
                         campaign?.providerId === 'google' ? 'Google Ads' : 
                         campaign?.providerId

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
      <div className="space-y-4">

        <div>
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-64" />
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-3">
              <Badge
                variant="outline"
                className={cn(
                  'px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider',
                  campaign?.providerId === 'facebook'
                    ? 'border-blue-500/30 bg-blue-500/10 text-blue-600'
                    : 'border-muted/40 bg-muted/20 text-muted-foreground'
                )}
              >
                {providerDisplay}
              </Badge>
              <Badge
                variant="outline"
                className={cn(
                  'px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider',
                  campaign?.status === 'ACTIVE'
                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600'
                    : 'border-yellow-500/30 bg-yellow-500/10 text-yellow-600'
                )}
              >
                {campaign?.status}
              </Badge>
              <h1 className="w-full text-4xl font-black tracking-tighter sm:w-auto">
                {campaign?.name}
              </h1>
            </div>
          )}
          {!loading && (
            <p className="mt-1 text-sm font-medium text-muted-foreground/80">
              {formatCampaignDateRange(campaign?.startTime, campaign?.stopTime)}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <DateRangePicker
          value={dateRange}
          onChange={onDateRangeChange}
        />
        <Button
          onClick={onRefresh}
          disabled={refreshing}
          variant="secondary"
          className="font-bold shadow-sm"
        >
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>
    </div>
  )
}
