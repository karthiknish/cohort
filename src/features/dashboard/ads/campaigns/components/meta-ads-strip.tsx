'use client'

import { useCallback } from 'react'
import { AlertTriangle, Loader2, Pause, Play } from 'lucide-react'

import { metaAdReviewStatusLabel, type MetaAdReviewStatus } from '@/lib/meta-ad-review'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/shared/ui/tooltip'
import { cn } from '@/lib/utils'

export type MetaAdRow = {
  id: string
  name: string
  status: string
  adSetId?: string
  reviewStatus?: MetaAdReviewStatus
  reviewMessages?: string[]
}

type MetaAdsStripProps = {
  ads: MetaAdRow[]
  togglingId: string | null
  onToggleStatus: (ad: MetaAdRow) => void
}

function isAdActive(status: string): boolean {
  const normalized = status.toUpperCase()
  return normalized === 'ACTIVE' || normalized === 'ENABLED'
}

function reviewBadgeVariant(
  reviewStatus: MetaAdReviewStatus | undefined,
): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (reviewStatus) {
    case 'disapproved':
      return 'destructive'
    case 'pending':
      return 'secondary'
    case 'issues':
      return 'outline'
    default:
      return 'outline'
  }
}

export function MetaAdsStrip({ ads, togglingId, onToggleStatus }: MetaAdsStripProps) {
  const handleToggle = useCallback(
    (ad: MetaAdRow) => () => {
      onToggleStatus(ad)
    },
    [onToggleStatus],
  )

  if (ads.length === 0) return null

  return (
    <div className="border-b border-border/50 px-6 py-3">
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        Ads (Meta)
      </p>
      <ul className="flex flex-wrap gap-2">
        {ads.map((ad) => {
          const active = isAdActive(ad.status)
          const busy = togglingId === ad.id
          const showReview = ad.reviewStatus && ad.reviewStatus !== 'approved'
          const reviewLabel = metaAdReviewStatusLabel(ad.reviewStatus ?? 'unknown')
          const reviewTooltip =
            ad.reviewMessages && ad.reviewMessages.length > 0
              ? ad.reviewMessages.join('\n')
              : reviewLabel

          return (
            <li
              key={ad.id}
              className="flex items-center gap-2 rounded-lg border border-border/60 bg-muted/15 px-2.5 py-1.5"
            >
              <span className="max-w-[10rem] truncate text-sm font-medium" title={ad.name}>
                {ad.name}
              </span>
              {ad.adSetId ? (
                <span className="max-w-[5rem] truncate text-[10px] text-muted-foreground" title={ad.adSetId}>
                  …{ad.adSetId.slice(-6)}
                </span>
              ) : null}
              <Badge variant={active ? 'default' : 'secondary'} className="text-[10px] capitalize">
                {ad.status.toLowerCase().replace(/_/g, ' ')}
              </Badge>
              {showReview ? (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge
                        variant={reviewBadgeVariant(ad.reviewStatus)}
                        className="gap-0.5 text-[10px]"
                      >
                        <AlertTriangle className="size-3" aria-hidden />
                        {reviewLabel}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs whitespace-pre-wrap text-xs">
                      {reviewTooltip}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : null}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className={cn('size-7 shrink-0', busy && 'pointer-events-none opacity-60')}
                disabled={busy || ad.reviewStatus === 'disapproved'}
                onClick={handleToggle(ad)}
                aria-label={active ? `Pause ${ad.name}` : `Activate ${ad.name}`}
              >
                {busy ? (
                  <Loader2 className="size-3.5 animate-spin" aria-hidden />
                ) : active ? (
                  <Pause className="size-3.5" aria-hidden />
                ) : (
                  <Play className="size-3.5" aria-hidden />
                )}
              </Button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
