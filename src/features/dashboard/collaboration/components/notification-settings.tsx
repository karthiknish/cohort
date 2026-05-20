'use client'

/**
 * @deprecated Use global notification settings at /settings?tab=notifications.
 * This entry opens the workspace notification preferences panel.
 */
import Link from 'next/link'
import { Bell } from 'lucide-react'

import { Button } from '@/shared/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/dialog'

type NotificationSettingsProps = {
  trigger?: React.ReactNode
}

export function NotificationSettings({ trigger }: NotificationSettingsProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs">
            <Bell className="h-3.5 w-3.5" aria-hidden />
            Notifications
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Notification preferences</DialogTitle>
          <DialogDescription>
            Collaboration alerts are managed in your workspace notification settings alongside
            tasks, ads, and meetings.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button asChild className="w-full">
            <Link href="/settings?tab=notifications">Open notification settings</Link>
          </Button>
          <Button variant="outline" asChild className="w-full">
            <Link href="/dashboard/notifications">Open notification center</Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
