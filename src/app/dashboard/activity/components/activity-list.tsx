'use client'

import { useMemo, useState, useCallback, useEffect, useRef } from 'react'
import { format, isToday, isYesterday } from 'date-fns'
import { Calendar, Search, RefreshCw, X, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { ActivityItem } from './activity-item'
import type { EnhancedActivity, SortOption, DateRangeOption, ActivityType, StatusFilter } from '../types'

interface ActivityListProps {
  activities: EnhancedActivity[]
  loading: boolean
  error: string | null
  hasMore: boolean
  searchQuery: string
  typeFilter: ActivityType | 'all'
  dateRange: DateRangeOption
  statusFilter: StatusFilter
  sortBy: SortOption
  onRetry: () => void
  onLoadMore: () => void
  onTogglePin: (id: string) => void
  onMarkAsRead: (id: string) => void
  onAddReaction: (id: string, emoji: string) => void
  onAddComment: (activityId: string, text: string) => void
  onActivityClick: (activity: EnhancedActivity, e: React.MouseEvent) => void
  onViewDetails: (activity: EnhancedActivity) => void
  selectedActivities: Set<string>
  onSelectionChange: (id: string, checked: boolean) => void
  onSelectAll: () => void
  comments: Record<string, Array<{ id: string; userId: string; userName: string; text: string; timestamp: string }>>
  currentUserName?: string
  className?: string
}

export function ActivityList({
  activities,
  loading,
  error,
  hasMore,
  searchQuery,
  typeFilter,
  dateRange,
  statusFilter,
  sortBy,
  onRetry,
  onLoadMore,
  onTogglePin,
  onMarkAsRead,
  onAddReaction,
  onAddComment,
  onActivityClick,
  onViewDetails,
  selectedActivities,
  onSelectionChange,
  onSelectAll,
  comments,
  currentUserName,
  className,
}: ActivityListProps) {
  const [showReactions, setShowReactions] = useState<string | null>(null)
  const observerTargetRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const node = observerTargetRef.current
    if (node) {
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0]?.isIntersecting && hasMore && !loading) {
            onLoadMore()
          }
        },
        { threshold: 0.1 }
      )
      observer.observe(node)
      return () => observer.disconnect()
    }
  }, [hasMore, loading, onLoadMore])

  // Filter activities
  const filteredActivities = useMemo(() => {
    return activities.filter((activity) => {
      const matchesType = typeFilter === 'all' || activity.type === typeFilter
      const matchesSearch =
        searchQuery === '' ||
        activity.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.entityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.userName?.toLowerCase().includes(searchQuery.toLowerCase())

      // Status filter
      let matchesStatus = true
      switch (statusFilter) {
        case 'read':
          matchesStatus = activity.isRead === true
          break
        case 'unread':
          matchesStatus = activity.isRead !== true
          break
        case 'pinned':
          matchesStatus = activity.isPinned === true
          break
        case 'all':
        default:
          matchesStatus = true
      }

      return matchesType && matchesSearch && matchesStatus
    })
  }, [activities, typeFilter, searchQuery, statusFilter])

  // Sort activities
  const sortedActivities = useMemo(() => {
    const sorted = [...filteredActivities]

    sorted.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1
      if (!a.isPinned && b.isPinned) return 1
      return 0
    })

    sorted.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        case 'oldest':
          return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        case 'type':
          return a.type.localeCompare(b.type)
        case 'entity':
          return a.entityName.localeCompare(b.entityName)
        default:
          return 0
      }
    })

    return sorted
  }, [filteredActivities, sortBy])

  // Group activities by date
  const groupedActivities = useMemo(() => {
    const groups: Record<string, EnhancedActivity[]> = {}

    sortedActivities.forEach((activity) => {
      const date = new Date(activity.timestamp)
      let key = format(date, 'MMMM d, yyyy')

      if (isToday(date)) key = 'Today'
      else if (isYesterday(date)) key = 'Yesterday'

      if (!groups[key]) {
        groups[key] = []
      }
      groups[key]!.push(activity)
    })

    return groups
  }, [sortedActivities])

  const groupKeys = Object.keys(groupedActivities).sort((a, b) => {
    if (a === 'Today') return -1
    if (b === 'Today') return 1
    if (a === 'Yesterday') return -1
    if (b === 'Yesterday') return 1
    return new Date(b).getTime() - new Date(a).getTime()
  })

  const handleClearFilters = () => {
    // This would be handled by parent
    window.dispatchEvent(new CustomEvent('clear-activity-filters'))
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Select all checkbox header */}
      {sortedActivities.length > 0 && (
        <div className="flex items-center gap-2 px-4 py-2 border-b bg-muted/30">
          <Checkbox
            id="select-all-activities"
            checked={selectedActivities.size === sortedActivities.length}
            onCheckedChange={onSelectAll}
            aria-label="Select all activities"
          />
          <label
            htmlFor="select-all-activities"
            className="text-sm text-muted-foreground cursor-pointer select-none"
          >
            {selectedActivities.size > 0
              ? `${selectedActivities.size} selected`
              : `Select all (${sortedActivities.length})`}
          </label>
        </div>
      )}

      {/* Activity list */}
      <ScrollArea className="h-[500px] sm:h-[600px]">
        <div className="p-4 sm:p-6">
          {loading && sortedActivities.length === 0 ? (
            <div className="space-y-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="h-6 w-32" />
                  <div className="space-y-4 pl-4 border-l-2 border-muted">
                    {[1, 2].map((j) => (
                      <div key={j} className="flex gap-4">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-2 flex-1">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 mb-4">
                <X className="h-8 w-8 text-destructive" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Failed to load activities</h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <div className="flex gap-2">
                <Button onClick={onRetry}>
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Try Again
                </Button>
              </div>
            </div>
          ) : sortedActivities.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted mb-4">
                <Search className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-1">No activities found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {searchQuery || typeFilter !== 'all' || dateRange !== 'all' || statusFilter !== 'all'
                  ? 'Try adjusting your filters or search query.'
                  : 'No activity recorded yet for this workspace.'}
              </p>
              {(searchQuery || typeFilter !== 'all' || dateRange !== 'all') && (
                <Button variant="outline" onClick={handleClearFilters}>
                  Clear all filters
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-8">
              {groupKeys.map((dateGroup) => (
                <div key={dateGroup} className="relative">
                  <div className="sticky top-0 z-10 bg-background/95 backdrop-blur py-2 border-b">
                    <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {dateGroup}
                      <Badge variant="outline" className="ml-1">
                        {groupedActivities[dateGroup]!.length}
                      </Badge>
                    </h3>
                  </div>
                  <div className="ml-2 space-y-4 sm:space-y-6 border-l-2 border-muted pl-4 sm:pl-6 pb-2">
                    {groupedActivities[dateGroup]!.map((activity) => (
                      <ActivityItem
                        key={activity.id}
                        activity={activity}
                        isSelected={selectedActivities.has(activity.id)}
                        showReactions={showReactions}
                        comments={comments[activity.id] || []}
                        onSelectionChange={onSelectionChange}
                        onClick={onActivityClick}
                        onTogglePin={onTogglePin}
                        onMarkAsRead={onMarkAsRead}
                        onAddReaction={onAddReaction}
                        onAddComment={onAddComment}
                        onShowReactionsChange={setShowReactions}
                        onViewDetails={onViewDetails}
                        currentUserName={currentUserName}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Load more indicator for infinite scroll */}
          {hasMore && (
            <div ref={observerTargetRef} className="py-8 text-center">
              {loading ? (
                <div className="flex justify-center">
                  <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <Button variant="outline" size="sm" onClick={onLoadMore}>
                  Load more
                </Button>
              )}
            </div>
          )}

          {!hasMore && sortedActivities.length > 0 && (
            <div className="py-8 text-center text-sm text-muted-foreground">
              You've reached the end of the activity log
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
