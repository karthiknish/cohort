'use client'

import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { cn, formatRelativeTime } from '@/lib/utils'
import { Clock, Edit, Trash2, UserPlus, CheckCircle, MessageCircle, Timer } from 'lucide-react'
import { TaskActivity } from '@/types/tasks'

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
  created: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
  updated: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  deleted: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
  status_changed: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
  assigned: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
  comment_added: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400',
  time_logged: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
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
    return (
      <div className={cn('space-y-4', className)}>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex gap-3">
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
                  <p className="text-xs text-muted-foreground mt-0.5">
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
