'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { format, isToday, isYesterday } from 'date-fns'
import { Calendar, Search, RefreshCw, X } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Checkbox } from '@/shared/ui/checkbox'
import { Badge } from '@/shared/ui/badge'
import { Skeleton } from '@/shared/ui/skeleton'
import { cn } from '@/lib/utils'
import { ActivityItem } from './activity-item'
import type { EnhancedActivity, SortOption, DateRangeOption, ActivityType, StatusFilter } from '../types'

const VIRTUAL_ACTIVITY_ROW_THRESHOLD = 48

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

    return undefined
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

      const group = groups[key] ?? []
      group.push(activity)
      groups[key] = group
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

  const handleClearFilters = useCallback(() => {
    // This would be handled by parent
    window.dispatchEvent(new CustomEvent('clear-activity-filters'))
  }, [])

  const activityFlatRows = useMemo(() => {
    const rows: Array<
      | { type: 'header'; key: string; dateLabel: string; count: number }
      | { type: 'item'; key: string; activity: EnhancedActivity }
    > = []
    for (const dateGroup of groupKeys) {
      const dateGroupActivities = groupedActivities[dateGroup] ?? []
      rows.push({
        type: 'header',
        key: `h-${dateGroup}`,
        dateLabel: dateGroup,
        count: dateGroupActivities.length,
      })
      for (const activity of dateGroupActivities) {
        rows.push({ type: 'item', key: activity.id, activity })
      }
    }
    return rows
  }, [groupKeys, groupedActivities])

  const shouldVirtualizeActivity = activityFlatRows.length > VIRTUAL_ACTIVITY_ROW_THRESHOLD
  const activityScrollRef = useRef<HTMLDivElement | null>(null)
  const activityVirtualizer = useVirtualizer({
    count: shouldVirtualizeActivity ? activityFlatRows.length : 0,
    getScrollElement: () => activityScrollRef.current,
    estimateSize: () => 120,
    overscan: 5,
  })

  useEffect(() => {
    if (!shouldVirtualizeActivity) {
      return
    }
    activityVirtualizer.measure()
  }, [activityFlatRows, activityVirtualizer, shouldVirtualizeActivity, sortedActivities.length])

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
      <div
        ref={shouldVirtualizeActivity ? activityScrollRef : undefined}
        className="h-[500px] sm:h-[600px] overflow-y-auto"
      >
        <div className="p-4 sm:p-6">
          {loading && sortedActivities.length === 0 ? (
            <div className="space-y-8">
              {[1, 2, 3].map((groupSlot) => (
                <div key={`activity-group-skeleton-${groupSlot}`} className="space-y-4">
                  <Skeleton className="h-6 w-32" />
                  <div className="space-y-4 pl-4 border-l-2 border-muted">
                    {[1, 2].map((itemSlot) => (
                      <div key={`activity-item-skeleton-${groupSlot}-${itemSlot}`} className="flex gap-4">
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
          ) : shouldVirtualizeActivity ? (
            <div
              className="relative w-full"
              style={{ height: activityVirtualizer.getTotalSize() }}
            >
              {activityVirtualizer.getVirtualItems().map((vi) => {
                const row = activityFlatRows[vi.index]
                if (!row) {
                  return null
                }
                if (row.type === 'header') {
                  return (
                    <div
                      key={row.key}
                      data-index={vi.index}
                      ref={activityVirtualizer.measureElement}
                      className="absolute left-0 top-0 w-full border-b bg-background/95 py-2 pr-2 backdrop-blur"
                      style={{ transform: `translateY(${vi.start}px)` }}
                    >
                      <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {row.dateLabel}
                        <Badge variant="secondary" className="ml-1 rounded-full">
                          {row.count}
                        </Badge>
                      </h3>
                    </div>
                  )
                }
                return (
                  <div
                    key={row.key}
                    data-index={vi.index}
                    ref={activityVirtualizer.measureElement}
                    className="absolute left-0 top-0 w-full ml-2 border-l-2 border-muted pl-4 sm:pl-6"
                    style={{ transform: `translateY(${vi.start}px)` }}
                  >
                    <div className="cv-scroll-item-activity pt-2 sm:pt-3">
                      <ActivityItem
                        activity={row.activity}
                        isSelected={selectedActivities.has(row.activity.id)}
                        showReactions={showReactions}
                        comments={comments[row.activity.id] || []}
                        onSelectionChange={onSelectionChange}
                        onTogglePin={onTogglePin}
                        onMarkAsRead={onMarkAsRead}
                        onAddReaction={onAddReaction}
                        onAddComment={onAddComment}
                        onShowReactionsChange={setShowReactions}
                        onViewDetails={onViewDetails}
                        currentUserName={currentUserName}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="space-y-8">
              {groupKeys.map((dateGroup) => {
                const dateGroupActivities = groupedActivities[dateGroup] ?? []

                return (
                <div key={dateGroup} className="relative">
                  <div className="sticky top-0 z-10 bg-background/95 backdrop-blur py-2 border-b">
                    <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {dateGroup}
                      <Badge variant="secondary" className="ml-1 rounded-full">
                        {dateGroupActivities.length}
                      </Badge>
                    </h3>
                  </div>
                  <div className="ml-2 space-y-4 sm:space-y-6 border-l-2 border-muted pl-4 sm:pl-6 pb-2">
                    {dateGroupActivities.map((activity) => (
                      <ActivityItem
                        key={activity.id}
                        activity={activity}
                        isSelected={selectedActivities.has(activity.id)}
                        showReactions={showReactions}
                        comments={comments[activity.id] || []}
                        onSelectionChange={onSelectionChange}
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
              )})}
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
              You&apos;ve reached the end of the activity log
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
