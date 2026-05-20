'use client'

import { ViewTransition } from 'react'
import { Chrome, Facebook, Linkedin, Megaphone, Music4, RefreshCw } from 'lucide-react'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Skeleton } from '@/shared/ui/skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar'
import { DateRangePicker, type DateRange } from '@/features/dashboard/ads/components/date-range-picker'
import { cn } from '@/lib/utils'
import { formatDate, DATE_FORMATS } from '@/lib/dates'
import { DASHBOARD_THEME, getIconContainerClasses } from '@/lib/dashboard-theme'
import { formatProviderName, getProviderColor } from '@/lib/themes'
import { BackLink } from '@/shared/components/back-link'

interface Campaign {
  id: string
  name: string
  providerId: string
  status: string
  objective?: string
  startTime?: string
  stopTime?: string
  accountName?: string
  accountLogoUrl?: string
}

interface CampaignHeaderProps {
  campaign: Campaign | null
  loading: boolean
  dateRange: DateRange
  onDateRangeChange: (range: DateRange) => void
  onRefresh: () => void
  refreshing: boolean
}

function formatObjectiveLabel(objective?: string): string | null {
  if (!objective?.trim()) return null
  return objective.toLowerCase().replace(/^outcome_/, '').replace(/_/g, ' ')
}

function formatCampaignDateRange(startTime?: string, stopTime?: string): string {
  const start = startTime ? new Date(startTime) : null
  const stop = stopTime ? new Date(stopTime) : null

  const hasStart = Boolean(start && !Number.isNaN(start.getTime()))
  const hasStop = Boolean(stop && !Number.isNaN(stop.getTime()))

  if (!hasStart && !hasStop) return '—'
  if (hasStart && !hasStop) return `Started ${formatDate(start, DATE_FORMATS.SHORT)}`
  if (!hasStart && hasStop) return `Ends ${formatDate(stop, DATE_FORMATS.SHORT)}`
  return `${formatDate(start, DATE_FORMATS.SHORT)} — ${formatDate(stop, DATE_FORMATS.SHORT)}`
}

export function CampaignHeader({
  campaign,
  loading,
  dateRange,
  onDateRangeChange,
  onRefresh,
  refreshing,
}: CampaignHeaderProps) {
  const providerDisplay = formatProviderName(campaign?.providerId ?? '')
  const sharedCampaignKey = campaign ? `${campaign.providerId}-${campaign.id}` : null
  const campaignName = campaign?.name ?? ''
  const campaignStatus = campaign?.status ?? ''

  const getProviderIcon = () => {
    if (!campaign?.providerId) return null
    const color = getProviderColor(campaign.providerId).hex
    const colorClass = `text-[${color}]`

    switch (campaign.providerId) {
      case 'facebook':
      case 'meta':
        return <Facebook className={cn("h-3 w-3", colorClass)} />
      case 'google':
        return <Chrome className={cn("h-3 w-3", colorClass)} />
      case 'tiktok':
        return <Music4 className={cn("h-3 w-3", colorClass)} />
      case 'linkedin':
        return <Linkedin className={cn("h-3 w-3", colorClass)} />
      default:
        return null
    }
  }

  const objectiveLabel = formatObjectiveLabel(campaign?.objective)

  return (
    <header className={cn(DASHBOARD_THEME.layout.header, 'gap-4 border-b border-muted/40 pb-6')}>
      <div className="min-w-0 flex-1 space-y-4">
        <BackLink label="Back to ads" href="/dashboard/ads" transitionTypes={['nav-back']} />

        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <Skeleton className="h-8 w-72 max-w-full" />
            <Skeleton className="h-4 w-48" />
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className={getIconContainerClasses('medium')}>
                <Megaphone className="h-6 w-6" aria-hidden />
              </div>
              {campaign?.accountLogoUrl ? (
                <Avatar className="h-7 w-7 ring-1 ring-border">
                  <AvatarImage src={campaign.accountLogoUrl} alt={campaign.accountName} />
                  <AvatarFallback className="text-[10px]">{campaign.accountName?.[0] || '?'}</AvatarFallback>
                </Avatar>
              ) : null}
              {campaign?.accountName ? (
                <span className="text-xs font-medium text-muted-foreground">{campaign.accountName}</span>
              ) : null}
              <Badge
                variant="outline"
                className="flex items-center gap-1.5 px-2 py-0 text-[10px] font-medium capitalize"
              >
                {getProviderIcon()}
                {providerDisplay}
              </Badge>
              {objectiveLabel ? (
                <Badge variant="secondary" className="text-[10px] font-medium capitalize">
                  {objectiveLabel}
                </Badge>
              ) : null}
              {sharedCampaignKey ? (
                <ViewTransition name={`campaign-status-${sharedCampaignKey}`} share="morph" default="none">
                  <Badge
                    variant="outline"
                    className={cn(
                      'text-[10px] font-semibold uppercase tracking-wide',
                      campaignStatus === 'ACTIVE'
                        ? 'border-success/30 bg-success/10 text-success'
                        : 'border-warning/30 bg-warning/10 text-warning',
                    )}
                  >
                    {campaignStatus}
                  </Badge>
                </ViewTransition>
              ) : null}
            </div>

            {sharedCampaignKey ? (
              <ViewTransition name={`campaign-title-${sharedCampaignKey}`} share="text-morph" default="none">
                <h1 className={cn(DASHBOARD_THEME.layout.title, 'text-balance')}>{campaignName}</h1>
              </ViewTransition>
            ) : (
              <h1 className={cn(DASHBOARD_THEME.layout.title, 'text-balance')}>{campaign?.name}</h1>
            )}

            <p className="text-sm text-muted-foreground">
              {formatCampaignDateRange(campaign?.startTime, campaign?.stopTime)}
            </p>
          </div>
        )}
      </div>

      <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:justify-end">
        <DateRangePicker value={dateRange} onChange={onDateRangeChange} />
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={onRefresh}
          disabled={refreshing}
          aria-busy={refreshing}
        >
          <RefreshCw className={cn('h-4 w-4', refreshing && 'animate-spin')} aria-hidden />
          <span className="hidden sm:inline">{refreshing ? 'Refreshing…' : 'Refresh metrics'}</span>
          <span className="sm:hidden">{refreshing ? '…' : 'Refresh'}</span>
        </Button>
      </div>
    </header>
  )
}
