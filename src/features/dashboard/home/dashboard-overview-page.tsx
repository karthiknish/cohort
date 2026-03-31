'use client'

import Link from 'next/link'
import { formatDistanceToNowStrict } from 'date-fns'
import { useConvexAuth, useQuery } from 'convex/react'
import {
  ArrowUpRight,
  BarChart3,
  Briefcase,
  CalendarClock,
  CheckSquare,
  FileText,
  LayoutDashboard,
  Megaphone,
  MessageSquare,
  Share2,
  Users,
  Video,
  type LucideIcon,
} from 'lucide-react'
import { useMemo } from 'react'

import { AnalyticsSummaryCards } from '@/features/dashboard/analytics/components/analytics-summary-cards'
import { ClientStatsGrid } from '@/features/dashboard/clients/components/client-stats-grid'
import { getPreviewGoogleWorkspaceStatus, getPreviewMeetings } from '@/features/dashboard/meetings/lib/preview-data'
import type { MeetingRecord } from '@/features/dashboard/meetings/types'
import { ProposalMetrics } from '@/features/dashboard/proposals/components/proposal-metrics'
import type { SocialOverview } from '@/features/dashboard/socials/hooks/use-socials-metrics'
import { TaskSummaryCards } from '@/features/dashboard/tasks/task-summary-cards'
import { analyticsIntegrationsApi, meetingIntegrationsApi, meetingsApi, projectsApi, socialMetricsApi, socialsIntegrationsApi } from '@/lib/convex-api'
import { getPreviewProjects } from '@/lib/preview-data'
import { formatCurrency, getWorkspaceId } from '@/lib/utils'
import { useAuth } from '@/shared/contexts/auth-context'
import { useClientContext } from '@/shared/contexts/client-context'
import { usePreview } from '@/shared/contexts/preview-context'
import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/alert'
import { Badge } from '@/shared/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Skeleton } from '@/shared/ui/skeleton'
import type { MetricRecord } from '@/types/dashboard'
import type { TaskRecord, TaskStatus } from '@/types/tasks'

import { DashboardPageHeader } from './components/dashboard-page-header'
import { DashboardRoleBanner } from './components/dashboard-role-banner'
import { QuickActions } from './components/quick-actions'
import { RelatedPages } from './components/related-pages'
import { StatsCards } from './components/stats-cards'
import { useDashboardData, useDashboardStats } from './hooks'

type AnalyticsStatusRow = {
  accountName: string | null
  lastSyncStatus: string | null
  lastSyncedAtMs: number | null
}

type SocialStatusRow = {
  connected: boolean
  accountName: string | null
  lastSyncStatus: 'never' | 'pending' | 'success' | 'error' | null
  lastSyncedAtMs: number | null
}

type MeetingWorkspaceStatusRow = {
  connected: boolean
  linkedAtMs: number | null
  scopes: string[]
}

type ProjectRow = {
  status?: unknown
}

type SnapshotMetric = {
  label: string
  value: string
  helper: string
}

type RelatedPageDefinition = {
  name: string
  href: string
  description: string
  icon: LucideIcon
  roles?: readonly ('admin' | 'team' | 'client')[]
}

const EMPTY_TASK_COUNTS: Record<TaskStatus, number> = {
  todo: 0,
  'in-progress': 0,
  review: 0,
  completed: 0,
  archived: 0,
}

const RELATED_PAGES: readonly RelatedPageDefinition[] = [
  {
    name: 'Clients',
    href: '/dashboard/clients',
    description: 'Client workloads, staffing, and delivery health.',
    icon: Users,
    roles: ['admin', 'team'] as const,
  },
  {
    name: 'Analytics',
    href: '/dashboard/analytics',
    description: 'Traffic, sessions, conversions, and GA sync status.',
    icon: BarChart3,
  },
  {
    name: 'Ads',
    href: '/dashboard/ads',
    description: 'Spend, clicks, conversions, and channel performance.',
    icon: Megaphone,
    roles: ['admin', 'team'] as const,
  },
  {
    name: 'Socials',
    href: '/dashboard/socials',
    description: 'Facebook and Instagram reach, engagement, and sync health.',
    icon: Share2,
    roles: ['admin', 'team'] as const,
  },
  {
    name: 'Meetings',
    href: '/dashboard/meetings',
    description: 'Upcoming rooms, schedule health, and workspace connection.',
    icon: Video,
  },
  {
    name: 'Tasks',
    href: '/dashboard/tasks',
    description: 'Task flow, due dates, and completion rate.',
    icon: CheckSquare,
  },
  {
    name: 'Proposals',
    href: '/dashboard/proposals',
    description: 'Pipeline, ready decks, and sent proposals.',
    icon: FileText,
    roles: ['admin', 'team', 'client'] as const,
  },
  {
    name: 'Collaboration',
    href: '/dashboard/collaboration',
    description: 'Team channels, client threads, and shared files.',
    icon: MessageSquare,
  },
  {
    name: 'Projects',
    href: '/dashboard/projects',
    description: 'Project status, milestones, and open delivery work.',
    icon: Briefcase,
  },
] as const

export function DashboardOverviewPage() {
  const { user } = useAuth()
  const { selectedClient, selectedClientId } = useClientContext()
  const { isPreviewMode } = usePreview()
  const { isAuthenticated, isLoading: convexAuthLoading } = useConvexAuth()

  const workspaceId = getWorkspaceId(user)
  const canQueryConvex = Boolean(workspaceId) && Boolean(user?.id) && isAuthenticated && !convexAuthLoading
  const userRole = user?.role ?? null

  const {
    metrics,
    metricsLoading,
    metricsError,
    rawTasks,
    taskSummary,
    tasksLoading,
    tasksError,
    proposals,
    proposalsLoading,
    proposalsError,
  } = useDashboardData({ selectedClientId })

  const { orderedStats } = useDashboardStats({
    metrics,
    taskSummary,
    userRole,
  })

  const analyticsStatus = useQuery(
    analyticsIntegrationsApi.getGoogleAnalyticsStatus,
    !isPreviewMode && canQueryConvex && workspaceId
      ? { workspaceId, clientId: selectedClientId ?? null }
      : 'skip',
  ) as AnalyticsStatusRow | null | undefined

  const projectRows = useQuery(
    projectsApi.list,
    !isPreviewMode && canQueryConvex && workspaceId
      ? {
          workspaceId,
          ...(selectedClientId ? { clientId: selectedClientId } : {}),
          limit: 200,
        }
      : 'skip',
  ) as ProjectRow[] | undefined

  const socialsStatus = useQuery(
    socialsIntegrationsApi.getStatus,
    !isPreviewMode && canQueryConvex && workspaceId
      ? { workspaceId, clientId: selectedClientId ?? null }
      : 'skip',
  ) as SocialStatusRow | null | undefined

  const socialRange = useMemo(() => {
    const end = new Date()
    const start = new Date(end)
    start.setDate(end.getDate() - 29)
    return {
      startDate: start.toISOString().split('T')[0] ?? '',
      endDate: end.toISOString().split('T')[0] ?? '',
    }
  }, [])

  const facebookOverview = useQuery(
    socialMetricsApi.listOverview,
    !isPreviewMode && canQueryConvex && workspaceId
      ? {
          workspaceId,
          clientId: selectedClientId ?? null,
          startDate: socialRange.startDate,
          endDate: socialRange.endDate,
          surface: 'facebook',
        }
      : 'skip',
  ) as SocialOverview | null | undefined

  const instagramOverview = useQuery(
    socialMetricsApi.listOverview,
    !isPreviewMode && canQueryConvex && workspaceId
      ? {
          workspaceId,
          clientId: selectedClientId ?? null,
          startDate: socialRange.startDate,
          endDate: socialRange.endDate,
          surface: 'instagram',
        }
      : 'skip',
  ) as SocialOverview | null | undefined

  const meetingWorkspaceStatus = useQuery(
    meetingIntegrationsApi.getGoogleWorkspaceStatus,
    !isPreviewMode && canQueryConvex && workspaceId
      ? { workspaceId }
      : 'skip',
  ) as MeetingWorkspaceStatusRow | undefined

  const meetings = useQuery(
    meetingsApi.list,
    !isPreviewMode && canQueryConvex && workspaceId
      ? {
          workspaceId,
          clientId: selectedClientId ?? null,
          includePast: false,
          limit: 30,
        }
      : 'skip',
  ) as MeetingRecord[] | undefined

  const dashboardErrors = [metricsError, tasksError, proposalsError].filter(
    (value): value is string => typeof value === 'string' && value.trim().length > 0,
  )

  const selectedClientLabel = selectedClient?.name ?? 'current workspace'
  const teamMembersCount = selectedClient?.teamMembers.length ?? 0
  const managersCount = selectedClient?.accountManager ? 1 : 0

  const analyticsMetrics = useMemo(
    () => metrics.filter((metric) => metric.providerId === 'google-analytics'),
    [metrics],
  )

  const analyticsTotals = useMemo(
    () =>
      analyticsMetrics.reduce(
        (accumulator, metric) => {
          accumulator.users += metric.impressions || 0
          accumulator.sessions += metric.clicks || 0
          accumulator.conversions += metric.conversions || 0
          accumulator.revenue += metric.revenue || 0
          return accumulator
        },
        { users: 0, sessions: 0, conversions: 0, revenue: 0 },
      ),
    [analyticsMetrics],
  )

  const analyticsConversionRate = analyticsTotals.sessions > 0
    ? (analyticsTotals.conversions / analyticsTotals.sessions) * 100
    : 0

  const adMetrics = useMemo(
    () => metrics.filter((metric) => metric.providerId !== 'google-analytics'),
    [metrics],
  )

  const adsSummary = useMemo(() => buildAdsSummary(adMetrics), [adMetrics])

  const taskCounts = useMemo(() => buildTaskCounts(rawTasks), [rawTasks])
  const taskCompletionRate = useMemo(() => {
    const trackedTotal = taskCounts.todo + taskCounts['in-progress'] + taskCounts.review + taskCounts.completed
    if (trackedTotal === 0) {
      return 0
    }
    return Math.round((taskCounts.completed / trackedTotal) * 100)
  }, [taskCounts])

  const projects = useMemo(() => {
    if (isPreviewMode) {
      return getPreviewProjects(selectedClientId ?? null)
    }
    return Array.isArray(projectRows) ? projectRows : []
  }, [isPreviewMode, projectRows, selectedClientId])

  const clientStats = useMemo(() => {
    const totalProjects = projects.length
    const activeProjects = projects.filter((project) => {
      const status = typeof project?.status === 'string' ? project.status : null
      return status === 'active' || status === 'in_progress'
    }).length
    const planningProjects = projects.filter((project) => {
      const status = typeof project?.status === 'string' ? project.status : null
      return status === 'planning'
    }).length
    const onHoldProjects = projects.filter((project) => {
      const status = typeof project?.status === 'string' ? project.status : null
      return status === 'on_hold'
    }).length
    const openTasks = rawTasks.filter((task) => task.status === 'todo' || task.status === 'in-progress').length
    const completedTasks = rawTasks.filter((task) => task.status === 'completed').length
    const pendingProposals = proposals.filter((proposal) => (
      proposal.status === 'draft' ||
      proposal.status === 'in_progress' ||
      proposal.status === 'ready' ||
      proposal.status === 'sent'
    )).length

    return {
      activeProjects,
      totalProjects,
      planningProjects,
      onHoldProjects,
      openTasks,
      completedTasks,
      pendingProposals,
    }
  }, [projects, rawTasks, proposals])

  const analyticsStatusLabel = useMemo(() => {
    if (isPreviewMode) return 'Preview sample'
    if (!analyticsStatus) return 'Setup required'
    switch (analyticsStatus.lastSyncStatus) {
      case 'success':
        return 'Synced'
      case 'pending':
        return 'Sync queued'
      case 'error':
        return 'Sync issue'
      default:
        return 'Connected'
    }
  }, [analyticsStatus, isPreviewMode])

  const analyticsStatusDetail = useMemo(() => {
    if (isPreviewMode) return 'Using preview dashboard metrics.'
    if (!analyticsStatus) return 'Connect Google Analytics to unlock traffic and revenue totals.'
    if (analyticsStatus.lastSyncedAtMs) {
      return `Last sync ${formatDistanceToNowStrict(analyticsStatus.lastSyncedAtMs, { addSuffix: true })}`
    }
    return analyticsStatus.accountName ? `Connected to ${analyticsStatus.accountName}` : 'Google Analytics is connected.'
  }, [analyticsStatus, isPreviewMode])

  const socialsLoading = !isPreviewMode && canQueryConvex && (
    socialsStatus === undefined || facebookOverview === undefined || instagramOverview === undefined
  )

  const socialsMetrics = useMemo<SnapshotMetric[]>(() => {
    const statusLabel = isPreviewMode
      ? 'Preview'
      : socialsStatus?.connected
        ? 'Connected'
        : 'Setup required'

    return [
      {
        label: 'Connection',
        value: statusLabel,
        helper: socialsStatus?.accountName || 'Meta surfaces for the selected workspace',
      },
      {
        label: 'Facebook reach',
        value: formatCompactNumber(facebookOverview?.reach ?? 0),
        helper: 'Rolling 30-day organic reach',
      },
      {
        label: 'Instagram engaged',
        value: formatCompactNumber(instagramOverview?.engagedUsers ?? 0),
        helper: 'Rolling 30-day engaged users',
      },
    ]
  }, [facebookOverview?.reach, instagramOverview?.engagedUsers, isPreviewMode, socialsStatus?.accountName, socialsStatus?.connected])

  const resolvedMeetingWorkspaceStatus = useMemo(() => {
    if (isPreviewMode) {
      return getPreviewGoogleWorkspaceStatus()
    }
    return meetingWorkspaceStatus ?? null
  }, [isPreviewMode, meetingWorkspaceStatus])

  const upcomingMeetings = useMemo(() => {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
    const source = isPreviewMode
      ? getPreviewMeetings(selectedClientId ?? null, timezone)
      : Array.isArray(meetings)
        ? meetings
        : []

    return [...source].sort((left, right) => left.startTimeMs - right.startTimeMs)
  }, [isPreviewMode, meetings, selectedClientId])

  const meetingsLoading = !isPreviewMode && canQueryConvex && (meetings === undefined || meetingWorkspaceStatus === undefined)
  const liveMeetingCount = upcomingMeetings.filter((meeting) => meeting.status === 'in_progress').length
  const nextMeeting = upcomingMeetings[0] ?? null

  const meetingMetrics = useMemo<SnapshotMetric[]>(() => [
    {
      label: 'Workspace',
      value: resolvedMeetingWorkspaceStatus?.connected ? 'Connected' : 'Setup required',
      helper: resolvedMeetingWorkspaceStatus?.connected ? 'Google Workspace scheduling ready' : 'Connect Workspace for calendar-backed rooms',
    },
    {
      label: 'Upcoming',
      value: String(upcomingMeetings.length),
      helper: nextMeeting ? formatMeetingTimestamp(nextMeeting.startTimeMs) : 'No meetings scheduled',
    },
    {
      label: 'Live rooms',
      value: String(liveMeetingCount),
      helper: liveMeetingCount > 0 ? 'An in-site room is active now' : 'No meetings currently in progress',
    },
  ], [liveMeetingCount, nextMeeting, resolvedMeetingWorkspaceStatus?.connected, upcomingMeetings.length])

  const projectMetrics = useMemo<SnapshotMetric[]>(() => [
    {
      label: 'Active projects',
      value: String(clientStats.activeProjects),
      helper: `${clientStats.totalProjects} total in ${selectedClientLabel}`,
    },
    {
      label: 'Planning',
      value: String(clientStats.planningProjects),
      helper: `${clientStats.onHoldProjects} on hold`,
    },
    {
      label: 'Open tasks',
      value: String(clientStats.openTasks),
      helper: `${clientStats.completedTasks} completed in delivery`,
    },
  ], [clientStats.activeProjects, clientStats.completedTasks, clientStats.onHoldProjects, clientStats.openTasks, clientStats.planningProjects, clientStats.totalProjects, selectedClientLabel])

  const adsMetricsList = useMemo<SnapshotMetric[]>(() => [
    {
      label: 'Ad spend',
      value: formatCurrency(adsSummary.spend),
      helper: adsSummary.providers.size > 0 ? `${adsSummary.providers.size} active channels` : 'Connect ad platforms to import spend',
    },
    {
      label: 'Clicks',
      value: formatCompactNumber(adsSummary.clicks),
      helper: `${formatCompactNumber(adsSummary.impressions)} impressions across ads`,
    },
    {
      label: 'Conversions',
      value: formatCompactNumber(adsSummary.conversions),
      helper: adsSummary.revenue > 0 ? `${formatCurrency(adsSummary.revenue)} revenue attributed` : 'Revenue attribution not available yet',
    },
  ], [adsSummary.clicks, adsSummary.conversions, adsSummary.impressions, adsSummary.providers, adsSummary.revenue, adsSummary.spend])

  const visibleRelatedPages = useMemo(() => {
    const role = userRole === 'admin' || userRole === 'team' || userRole === 'client' ? userRole : 'client'
    return RELATED_PAGES.filter((page) => !page.roles || page.roles.includes(role))
  }, [userRole])

  const statsLoading = metricsLoading || tasksLoading
  const clientStatsLoading = tasksLoading || proposalsLoading || (!isPreviewMode && canQueryConvex && projectRows === undefined)
  const analyticsLoading = metricsLoading && analyticsMetrics.length === 0
  const adsLoading = metricsLoading && adMetrics.length === 0
  const headerBadge = useMemo(() => ({
    label: selectedClient ? 'Selected client' : 'Workspace overview',
    variant: 'secondary' as const,
  }), [selectedClient])

  return (
    <div className="space-y-8 pb-10">
      <DashboardPageHeader
        title="Dashboard"
        description={`One overview for ${selectedClientLabel}, pulling the top-line stats from your core dashboard sections.`}
        icon={LayoutDashboard}
        badge={headerBadge}
      />

      <DashboardRoleBanner userRole={userRole} userDisplayName={user?.name ?? null} />

      {dashboardErrors.length > 0 && (
        <Alert variant="destructive">
          <AlertTitle>Some dashboard data is unavailable</AlertTitle>
          <AlertDescription>{dashboardErrors.join(' ')}</AlertDescription>
        </Alert>
      )}

      <section className="space-y-4">
        <SectionHeading
          title="Top summary"
          description="Primary KPI cards distilled from analytics, ads, and task flow."
        />
        <StatsCards stats={orderedStats} loading={statsLoading} primaryCount={4} />
      </section>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,0.95fr)]">
        <div className="space-y-8">
          <section className="space-y-4">
            <SectionHeading
              title="Clients"
              description={`The same account health summary surfaced on the clients page, scoped to ${selectedClientLabel}.`}
              href="/dashboard/clients"
              hrefLabel="Open clients"
            />
            <ClientStatsGrid
              stats={clientStats}
              statsLoading={clientStatsLoading}
              teamMembersCount={teamMembersCount}
              managersCount={managersCount}
            />
          </section>

          <section className="space-y-4">
            <SectionHeading
              title="Analytics"
              description={analyticsStatusDetail}
              href="/dashboard/analytics"
              hrefLabel="Open analytics"
              badgeLabel={analyticsStatusLabel}
            />
            <AnalyticsSummaryCards
              totals={analyticsTotals}
              conversionRate={analyticsConversionRate}
              isLoading={analyticsLoading}
            />
          </section>

          <section className="space-y-4">
            <SectionHeading
              title="Tasks"
              description="Current task volume and flow efficiency from the tasks workspace."
              href="/dashboard/tasks"
              hrefLabel="Open tasks"
            />
            <TaskSummaryCards taskCounts={taskCounts} completionRate={taskCompletionRate} />
          </section>

          <section className="space-y-4">
            <SectionHeading
              title="Proposals"
              description="Pipeline summary showing draft volume, ready decks, and proposals awaiting a client response."
              href="/dashboard/proposals"
              hrefLabel="Open proposals"
            />
            <ProposalMetrics proposals={proposals} isLoading={proposalsLoading} />
          </section>
        </div>

        <div className="space-y-6 xl:sticky xl:top-6 xl:self-start">
          <FeatureSnapshotCard
            title="Ads"
            description="Performance summary pulled from the Ads hub."
            href="/dashboard/ads"
            hrefLabel="Open ads"
            icon={Megaphone}
            loading={adsLoading}
            metrics={adsMetricsList}
          />

          <FeatureSnapshotCard
            title="Socials"
            description="Connection health plus the latest Facebook and Instagram overview KPIs."
            href="/dashboard/socials"
            hrefLabel="Open socials"
            icon={Share2}
            loading={socialsLoading}
            metrics={socialsMetrics}
          />

          <FeatureSnapshotCard
            title="Meetings"
            description="Scheduling and room readiness from the Meetings page."
            href="/dashboard/meetings"
            hrefLabel="Open meetings"
            icon={Video}
            loading={meetingsLoading}
            metrics={meetingMetrics}
          />

          <FeatureSnapshotCard
            title="Projects"
            description="A compact view of delivery volume and project stage distribution."
            href="/dashboard/projects"
            hrefLabel="Open projects"
            icon={Briefcase}
            loading={clientStatsLoading}
            metrics={projectMetrics}
          />

          <QuickActions />

          <RelatedPages
            title="More dashboard sections"
            description="Jump directly into the detailed workspaces behind this overview."
            pages={visibleRelatedPages.map((page) => ({
              name: page.name,
              href: page.href,
              description: page.description,
              icon: page.icon,
            }))}
          />
        </div>
      </div>
    </div>
  )
}

type SectionHeadingProps = {
  title: string
  description: string
  href?: string
  hrefLabel?: string
  badgeLabel?: string
}

function SectionHeading({ title, description, href, hrefLabel, badgeLabel }: SectionHeadingProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">{title}</h2>
          {badgeLabel ? <Badge variant="outline">{badgeLabel}</Badge> : null}
        </div>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      {href && hrefLabel ? (
        <Link
          href={href}
          className="inline-flex items-center gap-1 text-sm font-medium text-primary transition hover:text-primary/80"
        >
          {hrefLabel}
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      ) : null}
    </div>
  )
}

type FeatureSnapshotCardProps = {
  title: string
  description: string
  href: string
  hrefLabel: string
  icon: LucideIcon
  metrics: SnapshotMetric[]
  loading: boolean
}

function FeatureSnapshotCard({ title, description, href, hrefLabel, icon: Icon, metrics, loading }: FeatureSnapshotCardProps) {
  return (
    <Link href={href} className="group block rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40">
      <Card className="h-full border-muted/50 shadow-sm transition-[color,background-color,border-color,text-decoration-color,fill,stroke,opacity,box-shadow,transform,filter,backdrop-filter] group-hover:border-primary/40 group-hover:shadow-md">
        <CardHeader className="space-y-3 pb-4">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1.5">
              <CardTitle className="text-base">{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </div>
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Icon className="h-5 w-5" />
            </div>
          </div>
          <div className="inline-flex items-center gap-1 text-xs font-medium text-primary">
            {hrefLabel}
            <ArrowUpRight className="h-3.5 w-3.5" />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {metrics.map((metric) => (
            <div key={`${title}-${metric.label}`} className="rounded-xl border border-muted/50 bg-muted/20 p-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80">
                  {metric.label}
                </p>
                {loading ? (
                  <Skeleton className="h-5 w-16 rounded-md" />
                ) : (
                  <p className="text-sm font-semibold text-foreground">{metric.value}</p>
                )}
              </div>
              {loading ? (
                <Skeleton className="mt-2 h-3.5 w-36 rounded-md" />
              ) : (
                <p className="mt-1.5 text-xs text-muted-foreground">{metric.helper}</p>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </Link>
  )
}

function buildAdsSummary(metrics: MetricRecord[]) {
  return metrics.reduce(
    (accumulator, metric) => {
      accumulator.spend += metric.spend || 0
      accumulator.impressions += metric.impressions || 0
      accumulator.clicks += metric.clicks || 0
      accumulator.conversions += metric.conversions || 0
      accumulator.revenue += metric.revenue || 0
      accumulator.providers.add(metric.providerId)
      return accumulator
    },
    {
      spend: 0,
      impressions: 0,
      clicks: 0,
      conversions: 0,
      revenue: 0,
      providers: new Set<string>(),
    },
  )
}

function buildTaskCounts(tasks: TaskRecord[]): Record<TaskStatus, number> {
  return tasks.reduce((counts, task) => {
    if (task.status in counts) {
      counts[task.status] += 1
    }
    return counts
  }, { ...EMPTY_TASK_COUNTS })
}

function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value)
}

function formatMeetingTimestamp(startTimeMs: number): string {
  return new Date(startTimeMs).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}