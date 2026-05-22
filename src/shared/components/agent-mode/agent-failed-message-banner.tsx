'use client'

import { RefreshCw, WifiOff } from 'lucide-react'

import { Button } from '@/shared/ui/button'

export function FailedMessageBanner({
  lastFailedMessage,
  onRetry,
}: {
  lastFailedMessage: string | null
  onRetry: () => void
}) {
  if (!lastFailedMessage) return null

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="flex items-center justify-between gap-3 border-t border-destructive/20 bg-destructive/[0.07] px-4 py-2.5"
    >
      <div className="flex items-center gap-2 text-sm text-destructive">
        <WifiOff className="size-4 shrink-0" aria-hidden />
        <span className="font-medium">Message failed to send</span>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={onRetry}
        className="h-8 gap-1.5 rounded-full border-destructive/25 text-destructive hover:bg-destructive/10"
        aria-label="Retry sending failed message"
      >
        <RefreshCw className="size-3.5" aria-hidden />
        Retry
      </Button>
    </div>
  )
}
