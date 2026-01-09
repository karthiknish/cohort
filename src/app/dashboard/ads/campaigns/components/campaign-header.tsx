'use client'

import { ArrowRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { DateRangePicker, type DateRange } from '@/app/dashboard/ads/components/date-range-picker'
import { cn } from '@/lib/utils'
import { formatDate, DATE_FORMATS } from '@/lib/dates'
import { SiFacebook, SiGoogleads, SiTiktok, SiLinkedin } from 'react-icons/si'

interface Campaign {
  id: string
  name: string
  providerId: string
  status: string
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
  const providerDisplay = campaign?.providerId === 'facebook' ? 'Meta Ads' :
    campaign?.providerId === 'google' ? 'Google Ads' :
      campaign?.providerId === 'tiktok' ? 'TikTok Ads' :
        campaign?.providerId === 'linkedin' ? 'LinkedIn Ads' :
          campaign?.providerId

  const getProviderIcon = () => {
    switch (campaign?.providerId) {
      case 'facebook': return <SiFacebook className="h-3 w-3 text-[#1877F2]" />
      case 'google': return <SiGoogleads className="h-3 w-3 text-[#4285F4]" />
      case 'tiktok': return <SiTiktok className="h-3 w-3" />
      case 'linkedin': return <SiLinkedin className="h-3 w-3 text-[#0A66C2]" />
      default: return null
    }
  }

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
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                {campaign?.accountLogoUrl ? (
                  <Avatar className="h-6 w-6 ring-1 ring-border">
                    <AvatarImage src={campaign.accountLogoUrl} alt={campaign.accountName} />
                    <AvatarFallback className="text-[10px]">{campaign.accountName?.[0] || '?'}</AvatarFallback>
                  </Avatar>
                ) : campaign?.providerId === 'facebook' && (
                  <div className="h-6 w-6 rounded-full bg-blue-500/10 flex items-center justify-center ring-1 ring-blue-500/20 text-blue-600">
                    <span className="text-[10px] font-bold">M</span>
                  </div>
                )}
                <span className="text-xs font-bold text-muted-foreground/70 uppercase tracking-widest">
                  {campaign?.accountName}
                </span>
                <Badge
                  variant="outline"
                  className="flex items-center gap-1.5 px-2 py-0 text-[10px] font-bold uppercase tracking-tight bg-muted/30 border-muted-foreground/20"
                >
                  {getProviderIcon()}
                  {providerDisplay}
                </Badge>
                <Badge
                  variant="outline"
                  className={cn(
                    'ml-1 px-1.5 py-0 text-[9px] font-black uppercase tracking-tight opacity-70',
                    campaign?.status === 'ACTIVE'
                      ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600'
                      : 'border-yellow-500/30 bg-yellow-500/10 text-yellow-600'
                  )}
                >
                  {campaign?.status}
                </Badge>
              </div>
              <h1 className="text-4xl font-black tracking-tighter whitespace-pre-wrap">
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
