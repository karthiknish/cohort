'use client'

import Link from 'next/link'
import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { Clock, CircleCheck, MessageSquare, Briefcase, RefreshCw, MoreHorizontal, Filter } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useClientContext } from '@/contexts/client-context'
import { useRealtimeActivity } from '@/app/dashboard/activity/hooks/use-realtime-activity'
import { useActivityNotifications } from '@/app/dashboard/activity/hooks/use-activity-notifications'
import type { Activity } from '@/types/activity'

const ACTIVITY_ICONS = {
  project_updated: Briefcase,
  task_completed: CircleCheck,
  message_posted: MessageSquare,
}

const ACTIVITY_COLORS = {
  project_updated: 'text-blue-600',
  task_completed: 'text-green-600', 
  message_posted: 'text-purple-600',
}

function formatRelativeTime(timestamp: string): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMinutes = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMinutes < 1) return 'Just now'
  if (diffMinutes < 60) return `${diffMinutes}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

function formatLastUpdated(date: Date | null): string {
  if (!date) return ''
  const now = new Date()
  const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (diffSeconds < 60) return 'Updated just now'
  if (diffSeconds < 3600) return `Updated ${Math.floor(diffSeconds / 60)}m ago`
  if (diffSeconds < 86400) return `Updated ${Math.floor(diffSeconds / 3600)}h ago`
  
  return `Updated ${Math.floor(diffSeconds / 86400)}d ago`
}

interface ActivityItemProps {
  activity: Activity
}

function ActivityItem({ activity }: ActivityItemProps) {
  const Icon = ACTIVITY_ICONS[activity.type]
  const colorClass = ACTIVITY_COLORS[activity.type]

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
      <div className={`mt-0.5 ${colorClass}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {activity.description}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-muted-foreground">
            {formatRelativeTime(activity.timestamp)}
          </span>
          {activity.navigationUrl && (
            <>
              <span className="text-xs text-muted-foreground">•</span>
              <Link 
                href={activity.navigationUrl}
                className="text-xs text-primary hover:underline"
              >
                View
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export function ActivityWidget() {
  const { selectedClient } = useClientContext()
  const { activities, loading, error, retry, isRealTime } = useRealtimeActivity()
  const { config, updateConfig } = useActivityNotifications(activities)
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  // Get filter values from URL params
  const activityType = searchParams.get('activityType') || 'all'
  const dateRange = searchParams.get('dateRange') || '7d'

  // Filter activities based on URL params
  const filteredActivities = useMemo(() => {
    let filtered = [...activities]

    // Filter by activity type
    if (activityType !== 'all') {
      filtered = filtered.filter(activity => activity.type === activityType)
    }

    // Filter by date range
    const now = new Date()
    const cutoffDate = new Date()
    
    switch (dateRange) {
      case '1d':
        cutoffDate.setDate(now.getDate() - 1)
        break
      case '7d':
        cutoffDate.setDate(now.getDate() - 7)
        break
      case '30d':
        cutoffDate.setDate(now.getDate() - 30)
        break
      case '90d':
        cutoffDate.setDate(now.getDate() - 90)
        break
      default:
        cutoffDate.setDate(now.getDate() - 7)
    }

    filtered = filtered.filter(activity => 
      new Date(activity.timestamp) >= cutoffDate
    )

    return filtered
  }, [activities, activityType, dateRange])

  // Update URL params when filters change
  const updateFilters = useCallback((newActivityType: string, newDateRange: string) => {
    const newParams = new URLSearchParams(searchParams.toString())
    
    if (newActivityType === 'all') {
      newParams.delete('activityType')
    } else {
      newParams.set('activityType', newActivityType)
    }
    
    if (newDateRange === '7d') {
      newParams.delete('dateRange')
    } else {
      newParams.set('dateRange', newDateRange)
    }

    const queryString = newParams.toString()
    const newUrl = queryString ? `${pathname}?${queryString}` : pathname
    router.push(newUrl)
  }, [searchParams, pathname, router])

  const handleRefresh = () => {
    retry()
  }

  if (!selectedClient?.id) {
    return (
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">Recent Activity</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">
              Select a client to view activity
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-sm h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <div className="flex items-center gap-2">
          <CardTitle className="text-base">Recent Activity</CardTitle>
          {isRealTime && (
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
          )}
        </div>
        
        {/* Filter Controls */}
        <div className="flex items-center gap-1">
          <Select value={activityType} onValueChange={(value) => updateFilters(value, dateRange)}>
            <SelectTrigger className="h-7 w-[28px] px-0 border-0 hover:bg-muted focus:ring-0 data-[state=open]:bg-muted">
              <Filter className="h-4 w-4 text-muted-foreground mx-auto" />
              <span className="sr-only">Filter type</span>
            </SelectTrigger>
            <SelectContent align="end">
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="task_completed">Tasks</SelectItem>
              <SelectItem value="message_posted">Messages</SelectItem>
              <SelectItem value="project_updated">Projects</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={dateRange} onValueChange={(value) => updateFilters(activityType, value)}>
            <SelectTrigger className="h-7 text-xs border-0 hover:bg-muted focus:ring-0 data-[state=open]:bg-muted gap-1 px-2">
              <span className="text-muted-foreground">
                {dateRange === '1d' ? '24h' : dateRange === '7d' ? '7d' : dateRange === '30d' ? '30d' : '90d'}
              </span>
            </SelectTrigger>
            <SelectContent align="end">
              <SelectItem value="1d">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        {error ? (
          <div className="flex h-full flex-col items-center justify-center py-8 text-center">
            <p className="text-sm text-destructive mb-2">{error}</p>
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              Try again
            </Button>
          </div>
        ) : filteredActivities.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center py-8 text-center">
            <div className="rounded-full bg-muted/50 p-3 mb-3">
              <Clock className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">No activity found</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-[180px]">
              {activities.length === 0 
                ? 'No recent updates for this client'
                : 'Try adjusting your filters'
              }
            </p>
            {(activityType !== 'all' || dateRange !== '7d') && (
              <Button variant="ghost" size="sm" className="mt-2 h-8 text-xs" onClick={() => updateFilters('all', '7d')}>
                Clear filters
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-0.5 -mx-2">
            {filteredActivities.map((activity) => (
              <ActivityItem key={activity.id} activity={activity} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
