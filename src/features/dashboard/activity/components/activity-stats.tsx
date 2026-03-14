'use client'

import { useMemo } from 'react'
import { isToday, isThisWeek } from 'date-fns'
import { cn } from '@/lib/utils'
import type { EnhancedActivity } from '../types'

interface ActivityStatsProps {
  activities: EnhancedActivity[]
  className?: string
}

export function ActivityStats({ activities, className }: ActivityStatsProps) {
  const stats = useMemo(() => {
    const todayActivities = activities.filter((a) => isToday(new Date(a.timestamp)))
    const weekActivities = activities.filter((a) => isThisWeek(new Date(a.timestamp)))
    const unreadCount = activities.filter((a) => !a.isRead).length
    const pinnedCount = activities.filter((a) => a.isPinned).length

    return {
      todayCount: todayActivities.length,
      weekCount: weekActivities.length,
      unreadCount,
      pinnedCount,
      totalCount: activities.length,
    }
  }, [activities])

  return (
    <div className={cn('grid grid-cols-2 gap-4 sm:grid-cols-5', className)}>
      <div className="space-y-1">
        <p className="text-xs text-muted-foreground">Today</p>
        <p className="text-2xl font-semibold">{stats.todayCount}</p>
      </div>
      <div className="space-y-1">
        <p className="text-xs text-muted-foreground">This Week</p>
        <p className="text-2xl font-semibold">{stats.weekCount}</p>
      </div>
      <div className="space-y-1">
        <p className="text-xs text-muted-foreground">Unread</p>
        <p className="text-2xl font-semibold">{stats.unreadCount}</p>
      </div>
      <div className="space-y-1">
        <p className="text-xs text-muted-foreground">Pinned</p>
        <p className="text-2xl font-semibold">{stats.pinnedCount}</p>
      </div>
      <div className="space-y-1 sm:col-span-1 col-span-2">
        <p className="text-xs text-muted-foreground">Total</p>
        <p className="text-2xl font-semibold">{stats.totalCount}</p>
      </div>
    </div>
  )
}
