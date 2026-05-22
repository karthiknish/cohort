'use client'

import { AlertCircle, RefreshCw } from 'lucide-react'

import { ADS_PAGE_THEME } from '@/features/dashboard/ads/components/ads-page-theme'
import { Button } from '@/shared/ui/button'
import { cn } from '@/lib/utils'

type CampaignInsightsErrorProps = {
  message: string
  onRetry?: () => void
  retrying?: boolean
  className?: string
}

export function CampaignInsightsError({
  message,
  onRetry,
  retrying = false,
  className,
}: CampaignInsightsErrorProps) {
  return (
    <div className={cn(ADS_PAGE_THEME.emptyState, 'px-6 py-14', className)} role="alert">
      <div className="flex size-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive ring-1 ring-destructive/20">
        <AlertCircle className="size-6" aria-hidden />
      </div>
      <div className="max-w-md space-y-1">
        <p className="text-sm font-semibold text-foreground">Could not load performance data</p>
        <p className="text-sm text-muted-foreground text-pretty">{message}</p>
      </div>
      {onRetry ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-1.5 rounded-full"
          onClick={onRetry}
          disabled={retrying}
          aria-busy={retrying}
        >
          <RefreshCw className={cn('size-4', retrying && 'animate-spin')} aria-hidden />
          {retrying ? 'Retrying…' : 'Try again'}
        </Button>
      ) : null}
    </div>
  )
}
