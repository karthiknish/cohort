'use client'

import { ViewTransition } from 'react'
import { Megaphone, RefreshCw } from 'lucide-react'

import { SvglBrandLogo, type SvglBrandSlug } from '@/shared/components/svgl-brand-logo'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Skeleton } from '@/shared/ui/skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar'
import { DateRangePicker, type DateRange } from '@/features/dashboard/ads/components/date-range-picker'
import { ADS_PAGE_THEME } from '@/features/dashboard/ads/components/ads-page-theme'
import { cn } from '@/lib/utils'
import { formatDate, DATE_FORMATS } from '@/lib/dates'
import { DASHBOARD_THEME, getIconContainerClasses } from '@/lib/dashboard-theme'
import { formatProviderName } from '@/lib/themes'
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

  if (!hasStart && !hasStop) return 'Schedule not available'
  if (hasStart && !hasStop) return `Started ${formatDate(start, DATE_FORMATS.SHORT)}`
  if (!hasStart && hasStop) return `Ends ${formatDate(stop, DATE_FORMATS.SHORT)}`
  return `${formatDate(start, DATE_FORMATS.SHORT)} — ${formatDate(stop, DATE_FORMATS.SHORT)}`
}

function getCampaignLifetimeRange(startTime?: string, stopTime?: string): DateRange | null {
  const now = new Date()
  const start = startTime ? new Date(startTime) : null
  const stop = stopTime ? new Date(stopTime) : null

  const hasStart = Boolean(start && !Number.isNaN(start.getTime()))
  const hasStop = Boolean(stop && !Number.isNaN(stop.getTime()))

  if (!hasStart && !hasStop) {
    return null
  }

  const end = hasStop && stop <= now ? stop : now
  const rangeStart = hasStart && start ? start : new Date(new Date(end).setDate(end.getDate() - 30))

  return {
    start: rangeStart,
    end,
  }
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
  const campaignLifetimeRange = getCampaignLifetimeRange(campaign?.startTime, campaign?.stopTime)

  const getProviderIcon = () => {
    if (!campaign?.providerId) return null

    const svglBrand: SvglBrandSlug | null =
      campaign.providerId === 'facebook' || campaign.providerId === 'meta'
        ? 'meta'
        : campaign.providerId === 'google'
          ? 'google'
          : campaign.providerId === 'tiktok'
            ? 'tiktok'
            : campaign.providerId === 'linkedin'
              ? 'linkedin'
              : null

    if (!svglBrand) return null
    return <SvglBrandLogo brand={svglBrand} className="size-3" labeled={false} />
  }

  const objectiveLabel = formatObjectiveLabel(campaign?.objective)
  const isActive = campaignStatus === 'ACTIVE'

  return (
    <header className={ADS_PAGE_THEME.innerHero}>
      <div className={ADS_PAGE_THEME.innerHeroGlow} aria-hidden />
      <div className="relative space-y-5">
        <BackLink label="Back to ads" href="/dashboard/ads" transitionTypes={['nav-back']} />

        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0 flex-1 space-y-3">
            {loading ? (
              <div className="space-y-3">
                <Skeleton className="size-10 rounded-xl" />
                <Skeleton className="h-8 w-72 max-w-full rounded-lg" />
                <Skeleton className="h-4 w-48 rounded-lg" />
              </div>
            ) : (
              <>
                <div className="flex flex-wrap items-center gap-2">
                  <div className={getIconContainerClasses('medium')}>
                    <Megaphone className="size-6 text-primary" aria-hidden />
                  </div>
                  {campaign?.accountLogoUrl ? (
                    <Avatar className="size-8 ring-1 ring-border/60">
                      <AvatarImage src={campaign.accountLogoUrl} alt={campaign.accountName} />
                      <AvatarFallback className="text-[10px]">
                        {campaign.accountName?.[0] || '?'}
                      </AvatarFallback>
                    </Avatar>
                  ) : null}
                  {campaign?.accountName ? (
                    <span className="text-xs font-medium text-muted-foreground">{campaign.accountName}</span>
                  ) : null}
                  <Badge
                    variant="outline"
                    className="flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-medium capitalize"
                  >
                    {getProviderIcon()}
                    {providerDisplay}
                  </Badge>
                  {objectiveLabel ? (
                    <Badge variant="secondary" className="rounded-full text-[10px] font-medium capitalize">
                      {objectiveLabel}
                    </Badge>
                  ) : null}
                  {sharedCampaignKey ? (
                    <ViewTransition name={`campaign-status-${sharedCampaignKey}`} share="morph" default="none">
                      <Badge
                        variant="outline"
                        className={cn(
                          'rounded-full text-[10px] font-semibold uppercase tracking-wide',
                          isActive
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
              </>
            )}
          </div>

          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:justify-end">
            <DateRangePicker
              value={dateRange}
              onChange={onDateRangeChange}
              lifetimeRange={campaignLifetimeRange}
              className="w-full sm:w-auto [&_button]:h-10 [&_button]:rounded-xl [&_button]:border-border/70 [&_button]:bg-background/90"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-10 gap-1.5 rounded-xl border-border/70"
              onClick={onRefresh}
              disabled={refreshing}
              aria-busy={refreshing}
            >
              <RefreshCw className={cn('size-4', refreshing && 'animate-spin')} aria-hidden />
              <span className="hidden sm:inline">{refreshing ? 'Refreshing…' : 'Refresh metrics'}</span>
              <span className="sm:hidden">{refreshing ? '…' : 'Refresh'}</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
