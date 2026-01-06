'use client'

import { CircleAlert } from 'lucide-react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

interface SetupAlertsProps {
  // Meta alerts
  metaSetupMessage: string | null
  metaNeedsAccountSelection: boolean
  initializingMeta: boolean
  onInitializeMeta: () => void
  // TikTok alerts
  tiktokSetupMessage: string | null
  tiktokNeedsAccountSelection: boolean
  initializingTikTok: boolean
  onInitializeTikTok: () => void
}

export function SetupAlerts({
  metaSetupMessage,
  metaNeedsAccountSelection,
  initializingMeta,
  onInitializeMeta,
  tiktokSetupMessage,
  tiktokNeedsAccountSelection,
  initializingTikTok,
  onInitializeTikTok,
}: SetupAlertsProps) {
  return (
    <>
      {metaSetupMessage && (
        <Alert className="border-amber-300 bg-amber-50 text-amber-900">
          <AlertTitle className="flex items-center gap-2 text-sm font-semibold">
            <CircleAlert className="h-4 w-4" /> Meta setup required
          </AlertTitle>
          <AlertDescription className="mt-1 text-xs leading-relaxed">
            {metaSetupMessage}
          </AlertDescription>
        </Alert>
      )}

      {metaNeedsAccountSelection && (
        <Alert className="border-primary/40 bg-primary/5">
          <AlertTitle className="flex items-center justify-between gap-3 text-sm font-semibold">
            <span className="flex items-center gap-2">
              <CircleAlert className="h-4 w-4 text-primary" /> Meta account selection
              pending
            </span>
            <Button size="sm" onClick={onInitializeMeta} disabled={initializingMeta}>
              {initializingMeta ? 'Finishing…' : 'Finish setup'}
            </Button>
          </AlertTitle>
          <AlertDescription className="mt-2 text-xs text-muted-foreground">
            Choose a default Meta ad account so Cohorts knows which campaigns to sync.
          </AlertDescription>
        </Alert>
      )}

      {tiktokSetupMessage && (
        <Alert className="border-amber-300 bg-amber-50 text-amber-900">
          <AlertTitle className="flex items-center gap-2 text-sm font-semibold">
            <CircleAlert className="h-4 w-4" /> TikTok setup required
          </AlertTitle>
          <AlertDescription className="mt-1 text-xs leading-relaxed">
            {tiktokSetupMessage}
          </AlertDescription>
        </Alert>
      )}

      {tiktokNeedsAccountSelection && (
        <Alert className="border-primary/40 bg-primary/5">
          <AlertTitle className="flex items-center justify-between gap-3 text-sm font-semibold">
            <span className="flex items-center gap-2">
              <CircleAlert className="h-4 w-4 text-primary" /> TikTok account selection
              pending
            </span>
            <Button size="sm" onClick={onInitializeTikTok} disabled={initializingTikTok}>
              {initializingTikTok ? 'Finishing…' : 'Finish setup'}
            </Button>
          </AlertTitle>
          <AlertDescription className="mt-2 text-xs text-muted-foreground">
            Choose a default TikTok advertiser account so Cohorts knows which campaigns
            to sync.
          </AlertDescription>
        </Alert>
      )}
    </>
  )
}
