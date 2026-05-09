'use client'

import { ScrollArea } from '@/shared/ui/scroll-area'
import { Skeleton } from '@/shared/ui/skeleton'
import { Badge } from '@/shared/ui/badge'
import { cn, formatRelativeTime } from '@/lib/utils'
import { Clock, Edit, Trash2, UserPlus, CheckCircle, MessageCircle, Timer } from 'lucide-react'
import type { TaskActivity } from '@/types/tasks'

type TaskActivityLogProps = {
  activities: TaskActivity[]
  loading?: boolean
  className?: string
  maxItems?: number
}

const ACTIVITY_ICONS: Record<TaskActivity['action'], React.ElementType> = {
  created: CheckCircle,
  updated: Edit,
  deleted: Trash2,
  status_changed: CheckCircle,
  assigned: UserPlus,
  comment_added: MessageCircle,
  time_logged: Timer,
}

const ACTIVITY_COLORS: Record<TaskActivity['action'], string> = {
  created: 'bg-success/10 text-success dark:bg-success/15 dark:text-success',
  updated: 'bg-info/10 text-info dark:bg-info/15 dark:text-info',
  deleted: 'bg-destructive/10 text-destructive dark:bg-destructive/15 dark:text-destructive',
  status_changed: 'bg-warning/10 text-warning dark:bg-warning/15 dark:text-warning',
  assigned: 'bg-primary/10 text-primary dark:bg-primary/15 dark:text-primary',
  comment_added: 'bg-info/10 text-info dark:bg-info/15 dark:text-info',
  time_logged: 'bg-warning/10 text-warning dark:bg-warning/15 dark:text-warning',
}

function formatActivityMessage(activity: TaskActivity): string {
  const { action, field, oldValue, newValue } = activity

  switch (action) {
    case 'created':
      return 'created this task'
    case 'deleted':
      return 'deleted this task'
    case 'status_changed':
      return `changed status from "${oldValue}" to "${newValue}"`
    case 'assigned':
      return `assigned to ${newValue || 'unassigned'}`
    case 'comment_added':
      return 'added a comment'
    case 'time_logged':
      return `logged ${newValue || 'time'}`
    case 'updated':
      if (field) {
        if (oldValue && newValue) {
          return `changed ${field} from "${oldValue}" to "${newValue}"`
        }
        if (newValue) {
          return `set ${field} to "${newValue}"`
        }
        return `updated ${field}`
      }
      return 'made changes'
    default:
      return 'performed an action'
  }
}

export function TaskActivityLog({ activities, loading, className, maxItems = 20 }: TaskActivityLogProps) {
  const displayedActivities = activities.slice(0, maxItems)

  if (loading) {
    const loadingSlots = ['loading-1', 'loading-2', 'loading-3']

    return (
      <div className={cn('space-y-4', className)}>
        {loadingSlots.map((slot) => (
          <div key={slot} className="flex gap-3">
            <Skeleton className="h-8 w-8 rounded-full shrink-0" />
            <div className="flex-1 space-y-1">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (activities.length === 0) {
    return (
      <div className={cn('text-center py-8 text-muted-foreground', className)}>
        <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No activity yet</p>
      </div>
    )
  }

  return (
    <div className={cn('space-y-0', className)}>
      <ScrollArea className="h-[300px] pr-4">
        <div className="space-y-4">
          {displayedActivities.map((activity, index) => {
            const Icon = ACTIVITY_ICONS[activity.action] || Edit
            const isLast = index === displayedActivities.length - 1

            return (
              <div key={activity.id} className="flex gap-3">
                {/* Timeline connector line */}
                <div className="flex flex-col items-center">
                  <div className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border',
                    ACTIVITY_COLORS[activity.action]
                  )}>
                    <Icon className="h-4 w-4" />
                  </div>
                  {!isLast && (
                    <div className="w-px flex-1 bg-muted min-h-[2rem] mt-1" />
                  )}
                </div>

                {/* Activity content */}
                <div className="flex-1 min-w-0 pb-4">
                  <p className="text-sm">
                    <span className="font-medium text-foreground">{activity.userName}</span>
                    <span className="text-muted-foreground"> {formatActivityMessage(activity)}</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5" suppressHydrationWarning>
                    {formatRelativeTime(new Date(activity.timestamp))}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </ScrollArea>

      {activities.length > maxItems && (
        <div className="pt-2 text-center">
          <Badge variant="outline" className="text-xs">
            +{activities.length - maxItems} more activities
          </Badge>
        </div>
      )}
    </div>
  )
}

// Activity summary badge
export function ActivitySummary({ activities }: { activities: TaskActivity[] }) {
  if (activities.length === 0) return null

  const lastActivity = activities[0]
  if (!lastActivity) return null

  const timeAgo = formatRelativeTime(new Date(lastActivity.timestamp))

  return (
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <Clock className="h-3 w-3" />
      <span>Last activity {timeAgo}</span>
    </div>
  )
}
