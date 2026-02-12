'use client'

import { useEffect, useMemo, useState, useCallback } from 'react'
import {
  Clock,
  Download,
  RefreshCw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useRealtimeActivity } from './hooks/use-realtime-activity'
import { useClientContext } from '@/contexts/client-context'
import { useAuth } from '@/contexts/auth-context'
import { useToast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'
import { DASHBOARD_THEME, PAGE_TITLES, getButtonClasses } from '@/lib/dashboard-theme'
import { ActivityStats } from './components/activity-stats'
import { ActivityFilters } from './components/activity-filters'
import { ActivityList } from './components/activity-list'
import { ActivityDetailsModal } from './components/activity-details-modal'
import type { EnhancedActivity, ActivityType, SortOption, DateRangeOption, StatusFilter } from './types'

export default function ActivityPage() {
  const { selectedClient } = useClientContext()
  const { toast } = useToast()
  const { activities, loading, error, retry, hasMore, loadMore, markAsRead } = useRealtimeActivity(20)

  // Local state for enhanced features
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<ActivityType | 'all'>('all')
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [dateRange, setDateRange] = useState<DateRangeOption>('all')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [selectedActivities, setSelectedActivities] = useState<Set<string>>(new Set())
  const [pinnedActivities, setPinnedActivities] = useState<Set<string>>(new Set())
  const [activityReactions, setActivityReactions] = useState<
    Record<string, Array<{ emoji: string; count: number; users: string[] }>>
  >({})
  const [activityComments, setActivityComments] = useState<
    Record<string, Array<{ id: string; userId: string; userName: string; text: string; timestamp: string }>>
  >({})
  const [selectedActivity, setSelectedActivity] = useState<EnhancedActivity | null>(null)
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)

  // Get current user name for comments
  const { user } = useAuth()
  const currentUserName = user?.name || 'You'

  // Convert basic activities to enhanced activities
  const enhancedActivities: EnhancedActivity[] = useMemo(() => {
    return activities.map((a) => ({
      ...a,
      type: a.type as ActivityType,
      isRead: a.isRead ?? false,
      isPinned: pinnedActivities.has(a.id),
      reactions: activityReactions[a.id] || [],
    }))
  }, [activities, pinnedActivities, activityReactions])

  // Apply date range filter (in addition to other filters)
  const dateFilteredActivities = useMemo(() => {
    if (dateRange === 'all') return enhancedActivities
    // Date filtering is handled within ActivityList for simplicity
    return enhancedActivities
  }, [enhancedActivities, dateRange])

  // Handlers
  const handleRetry = useCallback(() => {
    toast({
      title: 'Refreshing activity',
      description: 'Syncing latest updates...',
    })
    retry()
  }, [toast, retry])

  const handleMarkAsRead = useCallback((id: string) => {
    void markAsRead([id])
    toast({
      title: 'Activity marked as read',
      description: 'This activity has been marked as read.',
    })
  }, [toast, markAsRead])

  const handleMarkAllAsRead = useCallback(() => {
    const unreadIds = enhancedActivities.filter((a) => !a.isRead).map((a) => a.id)
    if (unreadIds.length === 0) return
    void markAsRead(unreadIds)
    toast({
      title: 'All activities marked as read',
      description: `${unreadIds.length} activities marked as read.`,
    })
  }, [enhancedActivities, toast, markAsRead])

  const handleTogglePin = useCallback((id: string) => {
    setPinnedActivities((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
        toast({
          title: 'Activity unpinned',
          description: 'The activity has been removed from your pinned items.',
        })
      } else {
        newSet.add(id)
        toast({
          title: 'Activity pinned',
          description: 'The activity has been pinned to the top of your feed.',
        })
      }
      return newSet
    })
  }, [toast])

  const handleSelectAll = useCallback(() => {
    setSelectedActivities((prev) => {
      if (prev.size === enhancedActivities.length) {
        return new Set()
      }
      return new Set(enhancedActivities.map((a) => a.id))
    })
  }, [enhancedActivities])

  const handleSelectionChange = useCallback((id: string, checked: boolean) => {
    setSelectedActivities((prev) => {
      const next = new Set(prev)
      if (checked) {
        next.add(id)
      } else {
        next.delete(id)
      }
      return next
    })
  }, [])

  const handleBulkDismiss = useCallback(() => {
    setSelectedActivities(new Set())
    toast({
      title: 'Activities dismissed',
      description: `${selectedActivities.size} activities have been dismissed.`,
    })
  }, [selectedActivities.size, toast])

  const handleClearAllPins = useCallback(() => {
    setPinnedActivities(new Set())
    toast({
      title: 'All pins cleared',
      description: 'All pinned activities have been unpinned.',
    })
  }, [toast])

  const handleExport = useCallback(async () => {
    const dataToExport = enhancedActivities.map((a) => ({
      type: a.type,
      description: a.description,
      entity: a.entityName,
      timestamp: a.timestamp,
      user: a.userName || 'System',
    }))

    const csvContent = [
      ['Type', 'Description', 'Entity', 'Timestamp', 'User'].join(','),
      ...dataToExport.map((row) =>
        [
          row.type,
          `"${row.description}"`,
          `"${row.entity}"`,
          row.timestamp,
          row.user,
        ].join(',')
      ),
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `activity-export-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)

    toast({
      title: 'Export successful',
      description: 'Activity data has been downloaded.',
    })
  }, [enhancedActivities, toast])

  const handleAddReaction = useCallback((id: string, emoji: string) => {
    setActivityReactions((prev) => {
      const existing = prev[id] || []
      const existingReaction = existing.find((r) => r.emoji === emoji)

      if (existingReaction) {
        return {
          ...prev,
          [id]: existing.filter((r) => r.emoji !== emoji),
        }
      }

      return {
        ...prev,
        [id]: [...existing, { emoji, count: 1, users: ['currentUser'] }],
      }
    })
  }, [])

  const handleAddComment = useCallback((activityId: string, text: string) => {
    const newComment = {
      id: `comment-${Date.now()}`,
      userId: user?.id || 'current',
      userName: user?.name || 'You',
      text,
      timestamp: new Date().toISOString(),
    }
    setActivityComments((prev) => ({
      ...prev,
      [activityId]: [...(prev[activityId] || []), newComment],
    }))
    toast({
      title: 'Comment added',
      description: 'Your comment has been added.',
    })
  }, [toast, user])

  const handleActivityClick = useCallback((activity: EnhancedActivity, e: React.MouseEvent) => {
    const target = e.target as HTMLElement
    if (target.closest('button') || target.closest('a')) {
      return
    }

    setSelectedActivity(activity)
    setDetailsModalOpen(true)
  }, [])

  const handleViewDetails = useCallback((activity: EnhancedActivity) => {
    setSelectedActivity(activity)
    setDetailsModalOpen(true)
  }, [])

  const handleClearAllFilters = useCallback(() => {
    setSearchQuery('')
    setTypeFilter('all')
    setDateRange('all')
    setStatusFilter('all')
  }, [])

  // Listen for custom event to clear filters
  useEffect(() => {
    const handler = () => handleClearAllFilters()
    window.addEventListener('clear-activity-filters', handler)
    return () => window.removeEventListener('clear-activity-filters', handler)
  }, [handleClearAllFilters])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        document.getElementById('activity-search')?.focus()
      }
      if (e.key === 'Escape') {
        setSearchQuery('')
        setTypeFilter('all')
        setStatusFilter('all')
        setDateRange('all')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Error handling
  useEffect(() => {
    if (error) {
      toast({
        title: 'Activity sync failed',
        description: `${error}. Please try again.`,
        variant: 'destructive',
      })
    }
  }, [error, toast])

  if (!selectedClient) {
    return (
      <div className="flex min-h-[400px] items-center justify-center rounded-lg border border-dashed p-8 text-center">
        <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
          <div className={DASHBOARD_THEME.icons.container}>
            <Clock className={DASHBOARD_THEME.icons.medium} />
          </div>
          <h3 className="mt-4 text-lg font-semibold">No client selected</h3>
          <p className="mb-4 mt-2 text-sm text-muted-foreground">
            Select a client workspace to view their activity log.
          </p>
        </div>
      </div>
    )
  }

  const unreadCount = enhancedActivities.filter((a) => !a.isRead).length

  return (
    <div className={DASHBOARD_THEME.layout.container}>
      {/* Header */}
      <div className={DASHBOARD_THEME.layout.header}>
        <div>
          <h1 className={DASHBOARD_THEME.layout.title}>{PAGE_TITLES.activity?.title ?? 'Activity Log'}</h1>
          <p className={cn(DASHBOARD_THEME.layout.subtitle, 'mt-1')}>
            {PAGE_TITLES.activity?.description ?? 'Real-time timeline of updates, tasks, and collaboration across the workspace.'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Badge variant="default" className="text-xs">{unreadCount} unread</Badge>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleRetry}
            disabled={loading}
            title="Refresh (Cmd+R)"
            className={getButtonClasses('outline')}
          >
            <RefreshCw className={cn('mr-2 h-4 w-4', loading && DASHBOARD_THEME.animations.spin)} />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport} title="Export activity data" className={getButtonClasses('outline')}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Summary */}
      <Card className={DASHBOARD_THEME.cards.base}>
        <CardHeader className={cn(DASHBOARD_THEME.cards.header, 'pb-3')}>
          <CardTitle className="text-base">Activity Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <ActivityStats activities={enhancedActivities} />
        </CardContent>
      </Card>

      {/* Main Activity Card */}
      <Card className={DASHBOARD_THEME.cards.base}>
        <CardHeader className={DASHBOARD_THEME.cards.header}>
          <ActivityFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            typeFilter={typeFilter}
            onTypeFilterChange={setTypeFilter}
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            sortBy={sortBy}
            onSortChange={setSortBy}
            selectedCount={selectedActivities.size}
            totalCount={enhancedActivities.length}
            onSelectAll={handleSelectAll}
            onClearSelection={() => setSelectedActivities(new Set())}
            onBulkDismiss={handleBulkDismiss}
            onMarkAllAsRead={handleMarkAllAsRead}
            onClearAllPins={handleClearAllPins}
          />
        </CardHeader>

        <CardContent className="p-0">
          <ActivityList
            activities={dateFilteredActivities}
            loading={loading}
            error={error}
            hasMore={hasMore}
            searchQuery={searchQuery}
            typeFilter={typeFilter}
            dateRange={dateRange}
            statusFilter={statusFilter}
            sortBy={sortBy}
            onRetry={handleRetry}
            onLoadMore={loadMore}
            onTogglePin={handleTogglePin}
            onMarkAsRead={handleMarkAsRead}
            onAddReaction={handleAddReaction}
            onAddComment={handleAddComment}
            onActivityClick={handleActivityClick}
            onViewDetails={handleViewDetails}
            selectedActivities={selectedActivities}
            onSelectionChange={handleSelectionChange}
            onSelectAll={handleSelectAll}
            comments={activityComments}
            currentUserName={currentUserName}
          />
        </CardContent>
      </Card>

      {/* Activity Details Modal */}
      <ActivityDetailsModal
        activity={selectedActivity}
        open={detailsModalOpen}
        onOpenChange={setDetailsModalOpen}
        onMarkAsRead={handleMarkAsRead}
        onTogglePin={handleTogglePin}
      />

      {/* Keyboard shortcuts hint */}
      <div className="text-xs text-muted-foreground flex flex-wrap items-center gap-4">
        <span className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">⌘K</kbd>
          <span>Focus search</span>
        </span>
        <span className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">Esc</kbd>
          <span>Clear filters</span>
        </span>
      </div>
    </div>
  )
}
