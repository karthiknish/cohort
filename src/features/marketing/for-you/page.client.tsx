'use client'

import { useConvexAuth, useQuery } from 'convex/react'
import {
  ArrowUpRight,
  Calendar,
  LayoutDashboard,
  ListTodo,
  RefreshCw,
  Zap,
  type LucideIcon,
} from 'lucide-react'
import Link from 'next/link'
import { useCallback, useMemo } from 'react'

import { Badge } from '@/shared/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/alert'
import { Button } from '@/shared/ui/button'
import { BoneyardSkeletonBoundary } from '@/shared/ui/boneyard-skeleton-boundary'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { FadeIn } from '@/shared/ui/animate-in'
import { Separator } from '@/shared/ui/separator'
import { useAuth } from '@/shared/contexts/auth-context'
import { useClientContext } from '@/shared/contexts/client-context'
import { usePreview } from '@/shared/contexts/preview-context'
import { analyticsIntegrationsApi, meetingIntegrationsApi, meetingsApi, projectsApi } from '@/lib/convex-api'
import { DASHBOARD_THEME, getButtonClasses } from '@/lib/dashboard-theme'
import { getPreviewClients, getPreviewProjects } from '@/lib/preview-data'
import { cn, getWorkspaceId } from '@/lib/utils'
import type { ProjectRecord, ProjectStatus } from '@/types/projects'

import { useDashboardData } from '@/features/dashboard/home/hooks/use-dashboard-data'
import { useIntegrationStatusSummary } from '@/features/dashboard/home/hooks/use-integration-status-summary'
import { getPreviewGoogleWorkspaceStatus, getPreviewMeetings } from '@/features/dashboard/meetings/lib/preview-data'
import type { MeetingRecord } from '@/features/dashboard/meetings/types'
import { buildActivityHubModel, type GoogleAnalyticsStatusSummary, type HubTone, type SpotlightItem } from '@/features/dashboard/activity/for-you'
import { useRealtimeActivity } from '@/features/dashboard/activity/hooks/use-realtime-activity'
import type { ActivityType, EnhancedActivity } from '@/features/dashboard/activity/types'
import { ClientsSummarySection } from '@/features/dashboard/home/components/clients-summary-section'
import { MyTasksSection } from '@/features/dashboard/home/components/my-tasks-section'
import { ForYouPageSkeleton } from './components/for-you-page-skeleton'

type BadgeVariant = 'secondary' | 'success' | 'warning' | 'destructive' | 'info' | 'default'

const toneToVariant: Record<HubTone, BadgeVariant> = {
  neutral: 'secondary',
  success: 'success',
  warning: 'warning',
  critical: 'destructive',
}

const toneAccent: Record<HubTone, string> = {
  neutral: 'border-l-muted-foreground/45',
  success: 'border-l-primary',
  warning: 'border-l-warning',
  critical: 'border-l-destructive',
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

function PinnedSectionCard({
  title,
  description,
  href,
  actionLabel,
  items,
  emptyMessage,
  icon: Icon,
}: {
  title: string
  description: string
  href: string
  actionLabel: string
  items: SpotlightItem[]
  emptyMessage: string
  icon: LucideIcon
}) {
  return (
    <Card className={cn(DASHBOARD_THEME.cards.base, 'overflow-hidden transition-shadow hover:shadow-md')}>
      <CardHeader className={cn(DASHBOARD_THEME.cards.header, 'space-y-0 pb-5')}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 flex-1 gap-3.5">
            <div
              className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary/15 bg-primary/10 text-primary shadow-sm"
              aria-hidden
            >
              <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <CardTitle className="text-base font-semibold leading-snug text-balance">{title}</CardTitle>
              <CardDescription className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {description}
              </CardDescription>
            </div>
          </div>
          <Button
            asChild
            variant="outline"
            size="sm"
            className={cn('w-full shrink-0 bg-background shadow-sm sm:w-fit', getButtonClasses('outline'))}
          >
            <Link href={href}>{actionLabel}</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-5 pt-0 sm:px-5 sm:pb-5">
        {items.length > 0 ? (
          <div className="overflow-hidden rounded-xl border border-border/60 bg-muted/5">
            <ul className="divide-y divide-border/60" role="list">
              {items.map((item) => (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    className={cn(
                      'group flex items-start gap-3 border-l-[3px] px-3.5 py-3.5 outline-none transition-[background-color,transform] sm:px-4 sm:py-4',
                      'hover:bg-muted/40 focus-visible:bg-muted/40',
                      'focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2',
                      toneAccent[item.tone],
                      'active:scale-[0.995]',
                    )}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant={toneToVariant[item.tone]} className="rounded-full text-[11px] font-medium">
                          {item.badge}
                        </Badge>
                      </div>
                      <p className="mt-2 text-sm font-semibold leading-snug text-foreground">{item.title}</p>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{item.detail}</p>
                      <p className="mt-2.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground/90">
                        {item.meta}
                      </p>
                    </div>
                    <ArrowUpRight
                      aria-hidden="true"
                      className="mt-1 h-4 w-4 shrink-0 text-muted-foreground/70 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border/60 bg-muted/15 px-4 py-12 text-center sm:px-8">
            <p className="mx-auto max-w-sm text-sm leading-relaxed text-muted-foreground">{emptyMessage}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function ForYouPage() {
  const { clients, loading: clientsLoading } = useClientContext()

  const { user } = useAuth()
  const { isAuthenticated: isConvexAuthenticated, isLoading: isConvexLoading } = useConvexAuth()
  const { isPreviewMode } = usePreview()
  const workspaceId = getWorkspaceId(user)
  const timezone = useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC', [])
  const canQueryConvex = isConvexAuthenticated && !isConvexLoading && !!user?.id && !!workspaceId
  const shouldUseSampleData = isPreviewMode || (!clientsLoading && clients.length === 0) || !canQueryConvex
  const resolvedClients = useMemo(
    () => (shouldUseSampleData ? getPreviewClients() : clients),
    [shouldUseSampleData, clients]
  )
  const { activities, loading, retry } = useRealtimeActivity(20, shouldUseSampleData)
  const workspaceClientIds = useMemo(() => resolvedClients.map((client) => client.id), [resolvedClients])
  const workspaceScopeName = resolvedClients.length === 1 ? (resolvedClients[0]?.name ?? 'your workspace') : 'your workspace'
  const { metrics, metricsError, rawTasks, taskSummary, tasksError, proposals, proposalsError } = useDashboardData({ selectedClientId: null, preferPreviewData: shouldUseSampleData })
  const { summary: integrationSummary } = useIntegrationStatusSummary({ clientIds: workspaceClientIds })

  const projectsRealtime = useQuery(
    projectsApi.list,
    isPreviewMode || !workspaceId || !canQueryConvex
      ? 'skip'
      : {
          workspaceId,
          clientId: undefined,
          limit: 50,
        }
  ) as unknown[] | undefined

  const meetingsRealtime = useQuery(
    meetingsApi.list,
    isPreviewMode || !workspaceId || !canQueryConvex
      ? 'skip'
      : {
          workspaceId,
          clientId: null,
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
          clientId: null,
        }
  ) as GoogleAnalyticsStatusSummary | null | undefined

  // Convert basic activities to enhanced activities
  const enhancedActivities: EnhancedActivity[] = useMemo(() => {
    return activities.map((a) => ({
      ...a,
      type: a.type as ActivityType,
      isRead: a.isRead ?? false,
      isPinned: false,
      reactions: [],
    }))
  }, [activities])

  const projects = useMemo(() => {
    if (shouldUseSampleData) return getPreviewProjects(null)
    return mapProjectRows(projectsRealtime)
  }, [shouldUseSampleData, projectsRealtime])

  const meetings = useMemo(() => {
    if (shouldUseSampleData) return getPreviewMeetings(null, timezone)
    return meetingsRealtime ?? []
  }, [shouldUseSampleData, meetingsRealtime, timezone])

  const resolvedGoogleWorkspaceStatus = useMemo(() => {
    if (shouldUseSampleData) return getPreviewGoogleWorkspaceStatus()
    return googleWorkspaceStatus ?? { connected: false, linkedAtMs: null, scopes: [] }
  }, [googleWorkspaceStatus, shouldUseSampleData])

  const resolvedGoogleAnalyticsStatus = useMemo<GoogleAnalyticsStatusSummary | null>(() => {
    if (shouldUseSampleData) {
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
  }, [googleAnalyticsStatus, shouldUseSampleData, metrics])

  const activityHub = useMemo(() => {
    return buildActivityHubModel({
      selectedClientName: workspaceScopeName,
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
    workspaceScopeName,
    taskSummary,
  ])

  const handleRetry = useCallback(() => {
    retry()
  }, [retry])

  const unreadCount = enhancedActivities.filter((a) => !a.isRead).length
  const dashboardErrors = [metricsError, tasksError, proposalsError].filter(Boolean) as string[]
  const isInitialLoading = !shouldUseSampleData && loading && enhancedActivities.length === 0
  const loadingContent = useMemo(() => <ForYouPageSkeleton />, [])

  return (
    <BoneyardSkeletonBoundary
      name="for-you-page"
      loading={isInitialLoading}
      loadingContent={loadingContent}
    >
    <main id="for-you-page" aria-labelledby="for-you-heading" className={cn(DASHBOARD_THEME.layout.container, 'w-full')}>
      {dashboardErrors.length > 0 ? (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Workspace data is partially unavailable</AlertTitle>
          <AlertDescription className="space-y-1">
            {dashboardErrors.map((message) => (
              <p key={message}>{message}</p>
            ))}
          </AlertDescription>
        </Alert>
      ) : null}

      <div className={DASHBOARD_THEME.layout.header}>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="rounded-full border-primary/20 bg-primary/5 text-primary">
              <Zap aria-hidden="true" className="mr-1 h-3.5 w-3.5" />
              Personal summary
            </Badge>
            <Badge variant="secondary" className="rounded-full">
              {resolvedClients.length > 0 ? `${resolvedClients.length} client${resolvedClients.length === 1 ? '' : 's'}` : 'Workspace-wide'}
            </Badge>
          </div>
          <h1 id="for-you-heading" className={cn(DASHBOARD_THEME.layout.title, 'mt-3 text-balance sm:text-4xl')}>
            {activityHub.heroTitle}
          </h1>
          <p className={cn(DASHBOARD_THEME.layout.subtitle, 'mt-2 max-w-[65ch] text-base leading-relaxed')}>
            {activityHub.heroSummary}
          </p>
        </div>
        <div className="flex w-full shrink-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-end md:w-auto">
          {unreadCount > 0 && (
            <Badge variant="default" className="w-fit text-xs">
              {unreadCount} unread
            </Badge>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleRetry}
            disabled={loading}
            title="Reload activity and summary"
            className={cn('w-full sm:w-auto', getButtonClasses('outline'))}
          >
            <RefreshCw className={cn('mr-2 h-4 w-4', loading && DASHBOARD_THEME.animations.spin)} />
            Refresh
          </Button>
          <Button asChild variant="default" size="sm" className={cn('w-full sm:w-auto', getButtonClasses('primary'))}>
            <Link href="/dashboard">
              <LayoutDashboard aria-hidden="true" className="mr-2 h-4 w-4" />
              Go to Dashboard
            </Link>
          </Button>
        </div>
      </div>

      <FadeIn as="div" className="space-y-10" delay={0.06}>
        <section aria-labelledby="for-you-priorities-heading" className="space-y-5">
          <div className="max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/90">Focus</p>
            <h2
              id="for-you-priorities-heading"
              className="mt-1 text-xl font-semibold tracking-tight text-foreground sm:text-2xl"
            >
              What needs you first
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Next meetings plus urgent or high-priority tasks, surfaced before the rest of the page.
            </p>
          </div>
          <div className="grid gap-5 lg:gap-6 xl:grid-cols-2">
            <PinnedSectionCard
              icon={Calendar}
              title="Upcoming meetings"
              description="Live and scheduled conversations, ordered so the next touchpoint is obvious."
              href="/dashboard/meetings"
              actionLabel="Open meetings"
              items={activityHub.pinnedMeetingItems}
              emptyMessage="No live or upcoming meetings yet for this workspace."
            />
            <PinnedSectionCard
              icon={ListTodo}
              title="High-priority tasks"
              description="Urgent and high-priority work stays visible so nothing time-sensitive slips."
              href="/dashboard/tasks"
              actionLabel="Open tasks"
              items={activityHub.pinnedTaskItems}
              emptyMessage="No urgent or high-priority tasks are active right now."
            />
          </div>
        </section>

        <Separator className="bg-border/80" />

        <section aria-labelledby="for-you-workspace-heading" className="space-y-5">
          <div className="max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/90">Workspace</p>
            <h2
              id="for-you-workspace-heading"
              className="mt-1 text-xl font-semibold tracking-tight text-foreground sm:text-2xl"
            >
              Clients and your tasks
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Scan every account, then open work assigned to you across all clients.
            </p>
          </div>
          <div className="space-y-5">
            <ClientsSummarySection />
            <MyTasksSection />
          </div>
        </section>
      </FadeIn>
    </main>
    </BoneyardSkeletonBoundary>
  )
}
