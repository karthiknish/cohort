'use client'

import Link from 'next/link'
import { BellOff, Settings2 } from 'lucide-react'

import { Button } from '@/shared/ui/button'

type NotificationEmptyStateProps = {
  filterLabel?: string
  className?: string
}

export function NotificationEmptyState({ filterLabel, className }: NotificationEmptyStateProps) {
  const title = filterLabel ? `No ${filterLabel} notifications` : 'You’re all caught up'

  return (
    <div
      className={className ?? 'flex flex-col items-center justify-center gap-4 px-6 py-16 text-center'}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-border/60 bg-muted/30 text-muted-foreground">
        <BellOff className="h-7 w-7" aria-hidden />
      </div>
      <div className="space-y-1.5">
        <p className="text-base font-medium text-foreground">{title}</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          When something needs your attention, it will show up here and in the bell menu.
        </p>
      </div>
      <Button variant="outline" size="sm" asChild>
        <Link href="/settings?tab=notifications">
          <Settings2 className="mr-2 h-4 w-4" aria-hidden />
          Notification settings
        </Link>
      </Button>
    </div>
  )
}
