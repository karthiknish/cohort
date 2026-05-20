'use client'

import {
  BarChart3,
  Calendar,
  CheckSquare,
  FolderKanban,
  Mail,
  MessageSquare,
  Smartphone,
} from 'lucide-react'

import {
  CATEGORY_LABELS,
  NOTIFICATION_CATEGORIES,
  type NotificationCategory,
  type NotificationChannel,
  type NotificationPreferencesV2,
} from '@/lib/notifications/preferences'
import { Badge } from '@/shared/ui/badge'
import { Switch } from '@/shared/ui/switch'
import { cn } from '@/lib/utils'

const CATEGORY_ICONS: Record<NotificationCategory, typeof CheckSquare> = {
  tasks: CheckSquare,
  collaboration: MessageSquare,
  ads: BarChart3,
  digest: Mail,
  projects: FolderKanban,
  meetings: Calendar,
}

type NotificationCategoryMatrixProps = {
  preferences: NotificationPreferencesV2
  disabled?: boolean
  onChannelChange: (
    category: NotificationCategory,
    channel: NotificationChannel,
    enabled: boolean,
  ) => void
}

export function NotificationCategoryMatrix({
  preferences,
  disabled = false,
  onChannelChange,
}: NotificationCategoryMatrixProps) {
  const globallyDisabled = disabled || preferences.pauseAll

  return (
    <div className="overflow-hidden rounded-xl border border-border/60">
      <div className="grid grid-cols-[1fr_4.5rem_4.5rem_4.5rem] items-center gap-2 border-b border-border/60 bg-muted/30 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:grid-cols-[1fr_5rem_5rem_5rem]">
        <span>Category</span>
        <span className="text-center">In-app</span>
        <span className="text-center">Email</span>
        <span className="text-center">Push</span>
      </div>

      {NOTIFICATION_CATEGORIES.map((category, index) => {
        const Icon = CATEGORY_ICONS[category]
        const meta = CATEGORY_LABELS[category]
        const channels = preferences.categories[category]

        return (
          <div
            key={category}
            className={cn(
              'grid grid-cols-[1fr_4.5rem_4.5rem_4.5rem] items-center gap-2 px-4 py-4 sm:grid-cols-[1fr_5rem_5rem_5rem]',
              index < NOTIFICATION_CATEGORIES.length - 1 && 'border-b border-border/60',
            )}
          >
            <div className="flex min-w-0 items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-background text-muted-foreground">
                <Icon className="h-4 w-4" aria-hidden />
              </div>
              <div className="min-w-0 space-y-0.5">
                <p className="text-sm font-medium text-foreground">{meta.title}</p>
                <p className="text-xs leading-relaxed text-muted-foreground">{meta.description}</p>
              </div>
            </div>

            <div className="flex justify-center">
              <Switch
                checked={channels.inApp}
                disabled={globallyDisabled}
                onCheckedChange={(checked) => onChannelChange(category, 'inApp', checked)}
                aria-label={`${meta.title} in-app notifications`}
              />
            </div>
            <div className="flex justify-center">
              <Switch
                checked={channels.email}
                disabled={globallyDisabled}
                onCheckedChange={(checked) => onChannelChange(category, 'email', checked)}
                aria-label={`${meta.title} email notifications`}
              />
            </div>
            <div className="flex flex-col items-center justify-center gap-1">
              <Switch checked={false} disabled aria-label={`${meta.title} push notifications`} />
              <Badge variant="secondary" className="px-1.5 py-0 text-[9px] font-semibold uppercase">
                Soon
              </Badge>
            </div>
          </div>
        )
      })}

      <div className="flex items-center gap-2 border-t border-border/60 bg-muted/20 px-4 py-2.5 text-xs text-muted-foreground">
        <Smartphone className="h-3.5 w-3.5 shrink-0" aria-hidden />
        Browser push notifications are coming soon.
      </div>
    </div>
  )
}
