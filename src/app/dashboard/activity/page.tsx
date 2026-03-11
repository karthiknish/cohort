'use client'

import { useConvexAuth, useQuery } from 'convex/react'
import {
  ArrowUpRight,
  Clock,
  Download,
  RefreshCw,
  Sparkles,
} from 'lucide-react'
import Link from 'next/link'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/contexts/auth-context'
import { useClientContext } from '@/contexts/client-context'
import { usePreview } from '@/contexts/preview-context'
import { analyticsIntegrationsApi, meetingIntegrationsApi, meetingsApi, projectsApi } from '@/lib/convex-api'
import { DASHBOARD_THEME, getButtonClasses } from '@/lib/dashboard-theme'
import { getPreviewProjects } from '@/lib/preview-data'
import { cn, getWorkspaceId } from '@/lib/utils'
import type { ProjectRecord, ProjectStatus } from '@/types/projects'

import { useDashboardData } from '../hooks/use-dashboard-data'
import { useIntegrationStatusSummary } from '../hooks/use-integration-status-summary'
import { getPreviewGoogleWorkspaceStatus, getPreviewMeetings } from '../meetings/lib/preview-data'
import type { MeetingRecord } from '../meetings/types'
import { ActivityStats } from './components/activity-stats'
import { ActivityDetailsModal } from './components/activity-details-modal'
import { ActivityFilters } from './components/activity-filters'
import { ActivityList } from './components/activity-list'
import { buildActivityHubModel, type FeatureSpace, type GoogleAnalyticsStatusSummary, type HubTone, type SpotlightItem } from './for-you'
import { useRealtimeActivity } from './hooks/use-realtime-activity'
import type { ActivityType, DateRangeOption, EnhancedActivity, SortOption, StatusFilter } from './types'

const toneClasses: Record<HubTone, { badge: string; border: string }> = {
  neutral: {
    badge: 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-200',
    border: 'border-slate-200/80 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700',
  },
  success: {
    badge: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300',
    border: 'border-emerald-200/80 hover:border-emerald-300 dark:border-emerald-900/60 dark:hover:border-emerald-800',
  },
  warning: {
    badge: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300',
    border: 'border-amber-200/80 hover:border-amber-300 dark:border-amber-900/60 dark:hover:border-amber-800',
  },
  critical: {
    badge: 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300',
    border: 'border-rose-200/80 hover:border-rose-300 dark:border-rose-900/60 dark:hover:border-rose-800',
  },
}

function isProjectStatus(value: unknown): value is ProjectStatus {
  return value === 'planning' || value === 'active' || value === 'on_hold' || value === 'completed'
}

function mapProjectRows(rows: unknown[] | undefined): ProjectRecord[] {
  if (!Array.isArray(rows)) return []

  return rows.map((raw) => {
    const record = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : null
    const tags = Array.isArray(record?.tags)
      ? record.tags.filter((tag): tag is string => typeof tag === 'string')
      : []

    return {
      id: String(record?.legacyId ?? ''),
      name: String(record?.name ?? ''),
      description: typeof record?.description === 'string' ? record.description : null,
      status: isProjectStatus(record?.status) ? record.status : 'planning',
      clientId: typeof record?.clientId === 'string' ? record.clientId : null,
      clientName: typeof record?.clientName === 'string' ? record.clientName : null,
      startDate: typeof record?.startDateMs === 'number' ? new Date(record.startDateMs).toISOString() : null,
      endDate: typeof record?.endDateMs === 'number' ? new Date(record.endDateMs).toISOString() : null,
      tags,
      ownerId: typeof record?.ownerId === 'string' ? record.ownerId : null,
      createdAt: typeof record?.createdAtMs === 'number' ? new Date(record.createdAtMs).toISOString() : null,
      updatedAt: typeof record?.updatedAtMs === 'number' ? new Date(record.updatedAtMs).toISOString() : null,
      taskCount: 0,
      openTaskCount: 0,
      recentActivityAt: null,
      deletedAt: typeof record?.deletedAtMs === 'number' ? new Date(record.deletedAtMs).toISOString() : null,
    }
  })
}

function SpotlightList({ items }: { items: SpotlightItem[] }) {
  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-5 text-sm text-muted-foreground">
        Nothing urgent here yet — as live work lands, it will show up in this queue.
      </div>
    )
  }

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <Link
          key={item.id}
          href={item.href}
          className={cn(
            'group rounded-xl border bg-background/70 p-4 transition-colors',
            toneClasses[item.tone].border,
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-2">
              <Badge variant="outline" className={cn('rounded-full text-[11px] capitalize', toneClasses[item.tone].badge)}>
                {item.badge}
              </Badge>
              <div>
                <p className="text-sm font-semibold text-foreground">{item.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{item.detail}</p>
              </div>
            </div>
            <ArrowUpRight className="mt-0.5 h-4 w-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </div>
          <p className="mt-3 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{item.meta}</p>
        </Link>
      ))}
    </div>
  )
}

function FeatureSpaceCard({ space }: { space: FeatureSpace }) {
  return (
    <Link
      href={space.href}
      className={cn(
        'group rounded-2xl border bg-background/70 p-4 transition-colors',
        toneClasses[space.tone].border,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-foreground">{space.title}</p>
          <p className="text-xs text-muted-foreground">{space.subtitle}</p>
        </div>
        <Badge variant="outline" className={cn('rounded-full text-[11px]', toneClasses[space.tone].badge)}>
          {space.badge}
        </Badge>
      </div>

      <div className="mt-4 flex items-end justify-between gap-3">
        <div>
          <p className="text-2xl font-semibold tracking-tight text-foreground">{space.metric}</p>
          <p className="mt-1 text-xs text-muted-foreground">{space.secondary}</p>
        </div>
        <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </div>

      <p className="mt-4 text-xs text-muted-foreground">{space.hint}</p>
    </Link>
  )
}

function PinnedSectionCard({
  title,
  description,
  href,
  actionLabel,
  items,
  emptyMessage,
}: {
  title: string
  description: string
  href: string
  actionLabel: string
  items: SpotlightItem[]
  emptyMessage: string
}) {
  return (
    <Card className={DASHBOARD_THEME.cards.base}>
      <CardHeader className={DASHBOARD_THEME.cards.header}>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="text-base">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <Button asChild variant="ghost" size="sm" className="w-fit">
            <Link href={href}>{actionLabel}</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.length > 0 ? items.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className={cn('block rounded-xl border bg-background/80 p-4 transition-colors', toneClasses[item.tone].border)}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <Badge variant="outline" className={cn('rounded-full text-[11px]', toneClasses[item.tone].badge)}>
                  {item.badge}
                </Badge>
                <p className="mt-2 text-sm font-semibold text-foreground">{item.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{item.detail}</p>
                <p className="mt-3 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{item.meta}</p>
              </div>
              <ArrowUpRight className="mt-0.5 h-4 w-4 text-muted-foreground" />
            </div>
          </Link>
        )) : (
          <div className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
            {emptyMessage}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

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
  const selectedClientId = selectedClient?.id ?? null
  const { isAuthenticated: isConvexAuthenticated, isLoading: isConvexLoading } = useConvexAuth()
  const { isPreviewMode } = usePreview()
  const workspaceId = getWorkspaceId(user)
  const timezone = useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC', [])
  const canQueryConvex = isConvexAuthenticated && !isConvexLoading && !!user?.id && !!workspaceId
  const { metrics, rawTasks, taskSummary, proposals } = useDashboardData({ selectedClientId })
  const { summary: integrationSummary } = useIntegrationStatusSummary({ clientIds: selectedClientId ? [selectedClientId] : [] })

  const projectsRealtime = useQuery(
    projectsApi.list,
    isPreviewMode || !workspaceId || !canQueryConvex
      ? 'skip'
      : {
          workspaceId,
          clientId: selectedClientId ?? undefined,
          limit: 50,
        }
  ) as unknown[] | undefined

  const meetingsRealtime = useQuery(
    meetingsApi.list,
    isPreviewMode || !workspaceId || !canQueryConvex
      ? 'skip'
      : {
          workspaceId,
          clientId: selectedClientId ?? null,
          includePast: false,
          limit: 20,
        }
  ) as MeetingRecord[] | undefined

  const googleWorkspaceStatus = useQuery(
    meetingIntegrationsApi.getGoogleWorkspaceStatus,
    isPreviewMode || !workspaceId || !canQueryConvex ? 'skip' : { workspaceId }
  ) as { connected: boolean; linkedAtMs: number | null; scopes: string[] } | undefined

  const googleAnalyticsStatus = useQuery(
    analyticsIntegrationsApi.getGoogleAnalyticsStatus,
    isPreviewMode || !workspaceId || !canQueryConvex
      ? 'skip'
      : {
          workspaceId,
          clientId: selectedClientId ?? null,
        }
  ) as GoogleAnalyticsStatusSummary | null | undefined

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

  const projects = useMemo(() => {
    if (isPreviewMode) return getPreviewProjects(selectedClientId)
    return mapProjectRows(projectsRealtime)
  }, [isPreviewMode, projectsRealtime, selectedClientId])

  const meetings = useMemo(() => {
    if (isPreviewMode) return getPreviewMeetings(selectedClientId, timezone)
    return meetingsRealtime ?? []
  }, [isPreviewMode, meetingsRealtime, selectedClientId, timezone])

  const resolvedGoogleWorkspaceStatus = useMemo(() => {
    if (isPreviewMode) return getPreviewGoogleWorkspaceStatus()
    return googleWorkspaceStatus ?? { connected: false, linkedAtMs: null, scopes: [] }
  }, [googleWorkspaceStatus, isPreviewMode])

  const resolvedGoogleAnalyticsStatus = useMemo<GoogleAnalyticsStatusSummary | null>(() => {
    if (isPreviewMode) {
      const hasPreviewAnalytics = metrics.some((metric) => metric.providerId === 'google-analytics')
      if (!hasPreviewAnalytics) return null

      return {
        accountId: 'preview-property',
        accountName: 'Preview Google Analytics',
        linkedAtMs: Date.now() - 7 * 24 * 60 * 60 * 1000,
        lastSyncStatus: 'success',
        lastSyncMessage: null,
        lastSyncedAtMs: Date.now() - 2 * 60 * 60 * 1000,
        lastSyncRequestedAtMs: Date.now() - 2 * 60 * 60 * 1000,
      }
    }

    return googleAnalyticsStatus ?? null
  }, [googleAnalyticsStatus, isPreviewMode, metrics])

  const activityHub = useMemo(() => {
    return buildActivityHubModel({
      selectedClientName: selectedClient?.name ?? 'this client',
      activities: enhancedActivities,
      taskSummary,
      tasks: rawTasks,
      proposals,
      projects,
      meetings,
      metrics,
      integrationSummary,
      googleAnalyticsStatus: resolvedGoogleAnalyticsStatus,
      googleWorkspaceConnected: Boolean(resolvedGoogleWorkspaceStatus.connected),
    })
  }, [
    enhancedActivities,
    integrationSummary,
    meetings,
    metrics,
    projects,
    proposals,
    rawTasks,
    resolvedGoogleAnalyticsStatus,
    resolvedGoogleWorkspaceStatus.connected,
    selectedClient?.name,
    taskSummary,
  ])

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
      description: 'Syncing latest updates…',
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
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="rounded-full border-primary/20 bg-primary/5 text-primary">
              <Sparkles className="mr-1 h-3.5 w-3.5" />
              Live workspace
            </Badge>
            <Badge variant="outline" className="rounded-full">{selectedClient.name}</Badge>
          </div>
          <h1 className={cn(DASHBOARD_THEME.layout.title, 'mt-3')}>{activityHub.heroTitle}</h1>
          <p className={cn(DASHBOARD_THEME.layout.subtitle, 'mt-1')}>
            {activityHub.heroSummary}
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

      <div className="grid gap-6 xl:grid-cols-2">
        <PinnedSectionCard
          title="Upcoming meetings"
          description="Pinned to the top so the next live and scheduled conversations are always first."
          href="/dashboard/meetings"
          actionLabel="Open meetings"
          items={activityHub.pinnedMeetingItems}
          emptyMessage="No live or upcoming meetings yet for this workspace."
        />
        <PinnedSectionCard
          title="High-priority tasks"
          description="Urgent and high-priority tasks stay pinned near the top for fast follow-through."
          href="/dashboard/tasks"
          actionLabel="Open tasks"
          items={activityHub.pinnedTaskItems}
          emptyMessage="No urgent or high-priority tasks are active right now."
        />
      </div>

      {/* For You hero */}
      <Card className={DASHBOARD_THEME.cards.base}>
        <CardHeader className={cn(DASHBOARD_THEME.cards.header, 'pb-4')}>
          <CardTitle className="text-base">Workspace pulse</CardTitle>
          <CardDescription>
            A live overview across tasks, projects, meetings, proposals, collaboration, ads, and analytics.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          <div className="space-y-4">
            <ActivityStats activities={enhancedActivities} />
            <div className="grid gap-3 sm:grid-cols-3">
              {activityHub.featureSpaces.slice(0, 3).map((space) => (
                <div key={space.id} className={cn('rounded-xl border p-4', toneClasses[space.tone].border)}>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{space.title}</p>
                  <p className="mt-2 text-2xl font-semibold text-foreground">{space.metric}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{space.secondary}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border bg-muted/20 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-foreground">Needs attention</p>
                <p className="text-xs text-muted-foreground">Top actions and blockers for the selected workspace.</p>
              </div>
              <Badge variant="outline" className="rounded-full">{activityHub.priorityItems.length}</Badge>
            </div>

            <div className="mt-4 space-y-3">
              {activityHub.priorityItems.length > 0 ? activityHub.priorityItems.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className={cn('block rounded-xl border bg-background/80 p-3 transition-colors', toneClasses[item.tone].border)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Badge variant="outline" className={cn('rounded-full text-[11px]', toneClasses[item.tone].badge)}>
                        {item.badge}
                      </Badge>
                      <p className="mt-2 text-sm font-semibold text-foreground">{item.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{item.detail}</p>
                    </div>
                    <ArrowUpRight className="mt-0.5 h-4 w-4 text-muted-foreground" />
                  </div>
                </Link>
              )) : (
                <div className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
                  Everything looks calm right now — the most important updates will appear here automatically.
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className={DASHBOARD_THEME.cards.base}>
        <CardHeader className={DASHBOARD_THEME.cards.header}>
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle className="text-base">Recommended spaces</CardTitle>
              <CardDescription>Jump straight into the parts of the workspace that matter most right now.</CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm" className="w-fit">
              <Link href="/dashboard">Open main dashboard</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {activityHub.featureSpaces.map((space) => (
            <FeatureSpaceCard key={space.id} space={space} />
          ))}
        </CardContent>
      </Card>

      <Card className={DASHBOARD_THEME.cards.base}>
        <CardHeader className={DASHBOARD_THEME.cards.header}>
          <CardTitle className="text-base">Worked on</CardTitle>
          <CardDescription>Browse live work by priority, unread updates, deadlines, meetings, and performance.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="worked-on" className="w-full">
            <TabsList className="h-auto w-full flex-wrap justify-start gap-2 bg-transparent p-0">
              {activityHub.spotlightTabs.map((tab) => (
                <TabsTrigger key={tab.id} value={tab.id} className="rounded-full border bg-background px-3 py-1.5 text-xs">
                  {tab.label}
                  <span className="ml-2 rounded-full bg-muted px-1.5 py-0.5 text-[11px] leading-none">{tab.count}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {activityHub.spotlightTabs.map((tab) => (
              <TabsContent key={tab.id} value={tab.id}>
                <SpotlightList items={tab.items} />
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Main Activity Card */}
      <Card className={DASHBOARD_THEME.cards.base}>
        <CardHeader className={DASHBOARD_THEME.cards.header}>
          <div className="border-b px-6 py-4">
            <p className="text-base font-semibold text-foreground">Activity stream</p>
            <p className="mt-1 text-sm text-muted-foreground">
              The detailed live timeline stays here, with filters and bulk actions for triage.
            </p>
          </div>
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
