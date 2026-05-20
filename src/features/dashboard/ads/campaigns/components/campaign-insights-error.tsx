'use client'

import { AlertCircle, RefreshCw } from 'lucide-react'

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
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-muted/60 bg-muted/10 px-6 py-14 text-center',
        className,
      )}
      role="alert"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <AlertCircle className="h-6 w-6" aria-hidden />
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
          className="gap-1.5"
          onClick={onRetry}
          disabled={retrying}
          aria-busy={retrying}
        >
          <RefreshCw className={cn('h-4 w-4', retrying && 'animate-spin')} aria-hidden />
          {retrying ? 'Retrying…' : 'Try again'}
        </Button>
      ) : null}
    </div>
  )
}
