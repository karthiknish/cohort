import { format, isToday, isYesterday, parseISO } from 'date-fns'

import type { WorkspaceNotification } from '@/types/notifications'

export type NotificationTimeGroup = 'today' | 'yesterday' | 'earlier'

export type GroupedNotifications = {
  key: NotificationTimeGroup
  label: string
  items: WorkspaceNotification[]
}[]

function parseNotificationDate(value: string | null): Date | null {
  if (!value) return null
  const date = parseISO(value)
  return Number.isNaN(date.getTime()) ? null : date
}

export function getNotificationTimeGroup(createdAt: string | null): NotificationTimeGroup {
  const date = parseNotificationDate(createdAt)
  if (!date) return 'earlier'
  if (isToday(date)) return 'today'
  if (isYesterday(date)) return 'yesterday'
  return 'earlier'
}

const GROUP_LABELS: Record<NotificationTimeGroup, string> = {
  today: 'Today',
  yesterday: 'Yesterday',
  earlier: 'Earlier',
}

export function groupNotificationsByDate(
  notifications: WorkspaceNotification[],
): GroupedNotifications {
  const buckets: Record<NotificationTimeGroup, WorkspaceNotification[]> = {
    today: [],
    yesterday: [],
    earlier: [],
  }

  for (const notification of notifications) {
    const group = getNotificationTimeGroup(notification.createdAt)
    buckets[group].push(notification)
  }

  return (['today', 'yesterday', 'earlier'] as const)
    .filter((key) => buckets[key].length > 0)
    .map((key) => ({
      key,
      label: GROUP_LABELS[key],
      items: buckets[key],
    }))
}

export function formatNotificationTimestamp(createdAt: string | null): string {
  const date = parseNotificationDate(createdAt)
  if (!date) return 'Just now'
  if (isToday(date)) return format(date, 'h:mm a')
  if (isYesterday(date)) return `Yesterday ${format(date, 'h:mm a')}`
  return format(date, 'MMM d, h:mm a')
}
