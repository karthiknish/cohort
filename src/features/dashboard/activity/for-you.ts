import type { MetricRecord } from '@/types/dashboard'
import type { ProjectRecord } from '@/types/projects'
import type { ProposalDraft } from '@/types/proposals'
import type { TaskRecord } from '@/types/tasks'
import type { TaskSummary } from '../home/components/utils'
import type { IntegrationStatusSummary } from '../home/hooks/use-integration-status-summary'
import type { MeetingRecord } from '../meetings/types'
import type { EnhancedActivity } from './types'

export type HubTone = 'neutral' | 'success' | 'warning' | 'critical'

export type GoogleAnalyticsStatusSummary = {
  accountId: string | null
  accountName: string | null
  linkedAtMs: number | null
  lastSyncStatus: string | null
  lastSyncMessage: string | null
  lastSyncedAtMs: number | null
  lastSyncRequestedAtMs: number | null
}

export type FeatureSpace = {
  id: string
  title: string
  subtitle: string
  href: string
  metric: string
  secondary: string
  hint: string
  badge: string
  tone: HubTone
}

export type PriorityItem = {
  id: string
  title: string
  detail: string
  href: string
  badge: string
  tone: HubTone
}

export type SpotlightItem = {
  id: string
  title: string
  detail: string
  meta: string
  href: string
  badge: string
  tone: HubTone
}

export type SpotlightTab = {
  id: string
  label: string
  count: number
  items: SpotlightItem[]
}

export type ActivityHubModel = {
  heroTitle: string
  heroSummary: string
  pinnedMeetingItems: SpotlightItem[]
  pinnedTaskItems: SpotlightItem[]
  featureSpaces: FeatureSpace[]
  priorityItems: PriorityItem[]
  spotlightTabs: SpotlightTab[]
}

type BuildActivityHubModelArgs = {
  selectedClientName: string
  activities: EnhancedActivity[]
  taskSummary: TaskSummary
  tasks: TaskRecord[]
  proposals: ProposalDraft[]
  projects: ProjectRecord[]
  meetings: MeetingRecord[]
  metrics: MetricRecord[]
  integrationSummary: Pick<IntegrationStatusSummary, 'failedCount' | 'pendingCount' | 'neverCount' | 'totalIntegrations'>
  googleAnalyticsStatus: GoogleAnalyticsStatusSummary | null
  googleWorkspaceConnected: boolean
  nowMs?: number
}

const DAY_IN_MS = 24 * 60 * 60 * 1000

function parseMs(value: string | null | undefined): number | null {
  if (!value) return null
  const ms = Date.parse(value)
  return Number.isFinite(ms) ? ms : null
}

function describeRelativeTime(timestamp: string, nowMs: number): string {
  const eventMs = parseMs(timestamp)
  if (!eventMs) return 'Recently'
  const diffMs = Math.max(0, nowMs - eventMs)
  const diffMinutes = Math.floor(diffMs / 60_000)
  if (diffMinutes < 1) return 'Just now'
  if (diffMinutes < 60) return `${diffMinutes}m ago`
  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays}d ago`
}

function describeDueDate(dueDate: string | null | undefined, nowMs: number): string {
  const dueMs = parseMs(dueDate)
  if (!dueMs) return 'No due date'
  const diffDays = Math.floor((startOfDay(dueMs) - startOfDay(nowMs)) / DAY_IN_MS)
  if (diffDays < 0) return `${Math.abs(diffDays)}d overdue`
  if (diffDays === 0) return 'Due today'
  if (diffDays === 1) return 'Due tomorrow'
  return `Due in ${diffDays}d`
}

function describeMeetingTime(startTimeMs: number, nowMs: number, status: MeetingRecord['status']): string {
  if (status === 'in_progress') return 'Live now'
  const diffDays = Math.floor((startOfDay(startTimeMs) - startOfDay(nowMs)) / DAY_IN_MS)
  if (diffDays < 0) return 'Recently updated'
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Tomorrow'
  return `In ${diffDays}d`
}

function startOfDay(ms: number): number {
  const date = new Date(ms)
  date.setHours(0, 0, 0, 0)
  return date.getTime()
}

function taskPriorityWeight(priority: TaskRecord['priority']): number {
  switch (priority) {
    case 'urgent': return 4
    case 'high': return 3
    case 'medium': return 2
    default: return 1
  }
}

function getTaskHref(task: TaskRecord): string {
  return `/dashboard/tasks?taskId=${encodeURIComponent(task.id)}`
}

function getMeetingHref(meeting: MeetingRecord): string {
  return meeting.roomName ? `/dashboard/meetings?room=${encodeURIComponent(meeting.roomName)}` : '/dashboard/meetings'
}

function getProposalHref(proposal: ProposalDraft): string {
  return proposal.status === 'ready' ? `/dashboard/proposals/${encodeURIComponent(proposal.id)}/deck` : '/dashboard/proposals'
}

function isHighPriorityTask(task: TaskRecord): boolean {
  return task.priority === 'high' || task.priority === 'urgent'
}

function isUpcomingMeeting(meeting: MeetingRecord, nowMs: number): boolean {
  return meeting.status === 'in_progress' || (meeting.status === 'scheduled' && meeting.startTimeMs >= nowMs)
}

export function buildActivityHubModel({
  selectedClientName,
  activities,
  taskSummary,
  tasks,
  proposals,
  projects,
  meetings,
  metrics,
  integrationSummary,
  googleAnalyticsStatus,
  googleWorkspaceConnected,
  nowMs = Date.now(),
}: BuildActivityHubModelArgs): ActivityHubModel {
  const recentActivities = [...activities].sort((left, right) => {
    return (parseMs(right.timestamp) ?? 0) - (parseMs(left.timestamp) ?? 0)
  })
  const unreadActivities = recentActivities.filter((activity) => !activity.isRead)
  const collaborationUpdates = recentActivities.filter((activity) => activity.type === 'message_posted')
  const openTasks = tasks.filter((task) => task.status !== 'completed' && task.status !== 'archived')
  const taskFocus = [...openTasks].sort((left, right) => {
    const leftDue = parseMs(left.dueDate) ?? Number.MAX_SAFE_INTEGER
    const rightDue = parseMs(right.dueDate) ?? Number.MAX_SAFE_INTEGER
    if (leftDue !== rightDue) return leftDue - rightDue
    return taskPriorityWeight(right.priority) - taskPriorityWeight(left.priority)
  })
  const pinnedTasks = taskFocus.filter(isHighPriorityTask)
  const proposalCounts = proposals.reduce(
    (acc, proposal) => {
      acc.total += 1
      if (proposal.status === 'ready') acc.ready += 1
      if (proposal.status === 'sent') acc.sent += 1
      if (proposal.status === 'draft' || proposal.status === 'in_progress') acc.drafting += 1
      return acc
    },
    { total: 0, ready: 0, sent: 0, drafting: 0 }
  )
  const projectCounts = projects.reduce(
    (acc, project) => {
      acc.total += 1
      acc[project.status] += 1
      return acc
    },
    { total: 0, planning: 0, active: 0, on_hold: 0, completed: 0 }
  )
  const sortedMeetings = [...meetings].sort((left, right) => left.startTimeMs - right.startTimeMs)
  const liveMeetings = sortedMeetings.filter((meeting) => meeting.status === 'in_progress')
  const upcomingMeetings = sortedMeetings.filter((meeting) => isUpcomingMeeting(meeting, nowMs))
  const nextMeeting = upcomingMeetings[0] ?? null
  const adsMetrics = metrics.filter((metric) => metric.providerId !== 'google-analytics')
  const analyticsMetrics = metrics.filter((metric) => metric.providerId === 'google-analytics')
  const adsSpend = adsMetrics.reduce((sum, metric) => sum + metric.spend, 0)
  const adsRevenue = adsMetrics.reduce((sum, metric) => sum + (metric.revenue ?? 0), 0)
  const adChannels = new Set(adsMetrics.map((metric) => metric.providerId)).size
  const gaConnected = Boolean(googleAnalyticsStatus?.linkedAtMs)
  const gaNeedsSetup = gaConnected && !googleAnalyticsStatus?.accountId
  const gaSyncError = googleAnalyticsStatus?.lastSyncStatus === 'error'
  const gaBadge = !gaConnected ? 'Connect' : gaNeedsSetup ? 'Setup' : gaSyncError ? 'Action needed' : 'Live'

  const heroSummary = taskSummary.overdue > 0
    ? `${taskSummary.overdue} overdue task${taskSummary.overdue === 1 ? '' : 's'} and ${unreadActivities.length} unread update${unreadActivities.length === 1 ? '' : 's'} need attention.`
    : liveMeetings.length > 0
      ? `${liveMeetings.length} meeting${liveMeetings.length === 1 ? '' : 's'} live right now, with ${unreadActivities.length} unread update${unreadActivities.length === 1 ? '' : 's'} across the workspace.`
      : nextMeeting
        ? `Next up: ${nextMeeting.title} ${describeMeetingTime(nextMeeting.startTimeMs, nowMs, nextMeeting.status).toLowerCase()} for ${selectedClientName}.`
        : `Stay on top of ${selectedClientName} with live work updates, deadlines, and performance signals.`

  const featureSpaces: FeatureSpace[] = [
    {
      id: 'tasks', title: 'Tasks', subtitle: 'Task space', href: '/dashboard/tasks',
      metric: `${taskSummary.total}`, secondary: `${taskSummary.overdue} overdue · ${taskSummary.dueSoon} due soon`,
      hint: taskSummary.highPriority > 0 ? `${taskSummary.highPriority} high-priority item${taskSummary.highPriority === 1 ? '' : 's'}` : 'All active work items',
      badge: taskSummary.overdue > 0 ? 'Needs focus' : 'On track', tone: taskSummary.overdue > 0 ? 'critical' : taskSummary.dueSoon > 0 ? 'warning' : 'success',
    },
    {
      id: 'projects', title: 'Projects', subtitle: 'Project space', href: '/dashboard/projects',
      metric: `${projectCounts.active}`, secondary: `${projectCounts.on_hold} on hold · ${projectCounts.completed} completed`,
      hint: projectCounts.total > 0 ? `${projectCounts.total} total project${projectCounts.total === 1 ? '' : 's'}` : 'No projects yet',
      badge: projectCounts.on_hold > 0 ? 'Watchlist' : 'Healthy', tone: projectCounts.on_hold > 0 ? 'warning' : 'success',
    },
    {
      id: 'meetings', title: 'Meetings', subtitle: 'Meeting space', href: '/dashboard/meetings',
      metric: liveMeetings.length > 0 ? `${liveMeetings.length} live` : `${upcomingMeetings.length}`,
      secondary: nextMeeting ? `${nextMeeting.title} · ${describeMeetingTime(nextMeeting.startTimeMs, nowMs, nextMeeting.status)}` : 'No meetings scheduled',
      hint: googleWorkspaceConnected ? 'Calendar connected' : 'Calendar connection recommended',
      badge: liveMeetings.length > 0 ? 'Live' : googleWorkspaceConnected ? 'Ready' : 'Setup', tone: liveMeetings.length > 0 ? 'success' : googleWorkspaceConnected ? 'neutral' : 'warning',
    },
    {
      id: 'collaboration', title: 'Collaboration', subtitle: 'Team space', href: '/dashboard/collaboration',
      metric: `${collaborationUpdates.length}`, secondary: `${unreadActivities.filter((activity) => activity.type === 'message_posted').length} unread conversations`,
      hint: collaborationUpdates[0]?.description ?? 'Jump into the latest discussion',
      badge: collaborationUpdates.length > 0 ? 'Active' : 'Quiet', tone: unreadActivities.some((activity) => activity.type === 'message_posted') ? 'warning' : 'neutral',
    },
    {
      id: 'proposals', title: 'Proposals', subtitle: 'Proposal space', href: '/dashboard/proposals',
      metric: `${proposalCounts.ready}`, secondary: `${proposalCounts.drafting} drafting · ${proposalCounts.sent} sent`,
      hint: proposalCounts.total > 0 ? `${proposalCounts.total} total proposal${proposalCounts.total === 1 ? '' : 's'}` : 'No proposals yet',
      badge: proposalCounts.ready > 0 ? 'Ready to review' : 'Pipeline', tone: proposalCounts.ready > 0 ? 'success' : 'neutral',
    },
    {
      id: 'ads', title: 'Ads', subtitle: 'Ads space', href: '/dashboard/ads',
      metric: `${adChannels}`, secondary: adChannels > 0 ? `${adsSpend.toLocaleString('en-US', { maximumFractionDigits: 0 })} spend · ${adsRevenue.toLocaleString('en-US', { maximumFractionDigits: 0 })} revenue` : 'No ad metrics yet',
      hint: integrationSummary.failedCount > 0 ? `${integrationSummary.failedCount} sync issue${integrationSummary.failedCount === 1 ? '' : 's'}` : `${integrationSummary.pendingCount} sync job${integrationSummary.pendingCount === 1 ? '' : 's'} pending`,
      badge: integrationSummary.failedCount > 0 ? 'Attention' : adChannels > 0 ? 'Connected' : 'Setup', tone: integrationSummary.failedCount > 0 ? 'critical' : adChannels > 0 ? 'success' : 'warning',
    },
    {
      id: 'analytics', title: 'Analytics', subtitle: 'Analytics space', href: '/dashboard/analytics',
      metric: gaConnected ? 'Connected' : 'Not linked', secondary: gaConnected ? `${analyticsMetrics.length} synced metric row${analyticsMetrics.length === 1 ? '' : 's'}` : 'Connect Google Analytics',
      hint: gaSyncError ? (googleAnalyticsStatus?.lastSyncMessage ?? 'Last sync failed') : gaNeedsSetup ? 'Select a property to finish setup' : 'Review live performance trends',
      badge: gaBadge, tone: !gaConnected || gaNeedsSetup ? 'warning' : gaSyncError ? 'critical' : 'success',
    },
  ]

  const priorityItems: PriorityItem[] = []
  if (taskSummary.overdue > 0) {
    priorityItems.push({
      id: 'priority-overdue-tasks', title: 'Overdue tasks need attention',
      detail: `${taskSummary.overdue} overdue and ${taskSummary.highPriority} high-priority item${taskSummary.highPriority === 1 ? '' : 's'} are open.`,
      href: '/dashboard/tasks', badge: 'Tasks', tone: 'critical',
    })
  }
  if (liveMeetings.length > 0 || nextMeeting) {
    const meeting = liveMeetings[0] ?? nextMeeting
    if (meeting) {
      priorityItems.push({
        id: `priority-meeting-${meeting.legacyId}`,
        title: meeting.status === 'in_progress' ? `${meeting.title} is live now` : `${meeting.title} is coming up`,
        detail: googleWorkspaceConnected ? `${describeMeetingTime(meeting.startTimeMs, nowMs, meeting.status)} · ${meeting.attendeeEmails.length} attendee${meeting.attendeeEmails.length === 1 ? '' : 's'}` : 'Connect Google Workspace for smoother scheduling.',
        href: getMeetingHref(meeting), badge: 'Meetings', tone: meeting.status === 'in_progress' ? 'success' : 'warning',
      })
    }
  }
  if (integrationSummary.failedCount > 0 || integrationSummary.pendingCount > 0) {
    priorityItems.push({
      id: 'priority-ads-sync', title: 'Ad syncs need a review',
      detail: integrationSummary.failedCount > 0 ? `${integrationSummary.failedCount} sync issue${integrationSummary.failedCount === 1 ? '' : 's'} detected.` : `${integrationSummary.pendingCount} sync job${integrationSummary.pendingCount === 1 ? '' : 's'} waiting to run.`,
      href: '/dashboard/ads', badge: 'Ads', tone: integrationSummary.failedCount > 0 ? 'critical' : 'warning',
    })
  }
  if (!gaConnected || gaNeedsSetup || gaSyncError) {
    priorityItems.push({
      id: 'priority-analytics', title: !gaConnected ? 'Connect Google Analytics' : gaNeedsSetup ? 'Finish Google Analytics setup' : 'Analytics sync needs attention',
      detail: !gaConnected ? 'Link a property so the workspace can surface users, sessions, and conversion trends.' : gaNeedsSetup ? 'Select a property before the next sync can run.' : (googleAnalyticsStatus?.lastSyncMessage ?? 'Review the latest sync error and retry.'),
      href: '/dashboard/analytics', badge: 'Analytics', tone: gaSyncError ? 'critical' : 'warning',
    })
  }
  if (unreadActivities.length > 0) {
    priorityItems.push({
      id: 'priority-unread', title: 'Unread workspace updates',
      detail: `${unreadActivities.length} unread update${unreadActivities.length === 1 ? '' : 's'} across tasks, projects, and collaboration.`,
      href: '/dashboard/for-you', badge: 'For you', tone: unreadActivities.length > 5 ? 'warning' : 'neutral',
    })
  }
  if (proposalCounts.ready > 0) {
    priorityItems.push({
      id: 'priority-proposals', title: 'Proposal decks ready to send',
      detail: `${proposalCounts.ready} proposal${proposalCounts.ready === 1 ? '' : 's'} ready for review or sharing.`,
      href: '/dashboard/proposals', badge: 'Proposals', tone: 'success',
    })
  }

  const workedOnItems = recentActivities.slice(0, 6).map<SpotlightItem>((activity) => ({
    id: `worked-on-${activity.id}`,
    title: activity.entityName,
    detail: activity.description,
    meta: describeRelativeTime(activity.timestamp, nowMs),
    href: activity.navigationUrl,
    badge: activity.type.replace('_', ' '),
    tone: activity.isPinned ? 'warning' : !activity.isRead ? 'critical' : 'neutral',
  }))

  const unreadItems = unreadActivities.slice(0, 6).map<SpotlightItem>((activity) => ({
    id: `unread-${activity.id}`,
    title: activity.entityName,
    detail: activity.description,
    meta: describeRelativeTime(activity.timestamp, nowMs),
    href: activity.navigationUrl,
    badge: 'Unread',
    tone: 'critical',
  }))

  const deadlineItems = taskFocus.slice(0, 6).map<SpotlightItem>((task) => ({
    id: `deadline-${task.id}`,
    title: task.title,
    detail: task.projectName ?? task.client ?? 'Task management',
    meta: `${describeDueDate(task.dueDate, nowMs)} · ${task.priority} priority`,
    href: getTaskHref(task),
    badge: 'Task',
    tone: describeDueDate(task.dueDate, nowMs).includes('overdue') ? 'critical' : task.priority === 'urgent' || task.priority === 'high' ? 'warning' : 'neutral',
  }))

  const pinnedTaskItems = pinnedTasks.slice(0, 4).map<SpotlightItem>((task) => ({
    id: `pinned-task-${task.id}`,
    title: task.title,
    detail: task.projectName ?? task.client ?? 'Task management',
    meta: `${describeDueDate(task.dueDate, nowMs)} · ${task.priority} priority`,
    href: getTaskHref(task),
    badge: task.priority === 'urgent' ? 'Urgent' : 'High priority',
    tone: describeDueDate(task.dueDate, nowMs).includes('overdue') ? 'critical' : 'warning',
  }))

  const meetingItems = upcomingMeetings.slice(0, 6).map<SpotlightItem>((meeting) => ({
    id: `meeting-${meeting.legacyId}`,
    title: meeting.title,
    detail: meeting.description ?? 'Meeting workspace',
    meta: `${describeMeetingTime(meeting.startTimeMs, nowMs, meeting.status)} · ${meeting.attendeeEmails.length} attendee${meeting.attendeeEmails.length === 1 ? '' : 's'}`,
    href: getMeetingHref(meeting),
    badge: meeting.status === 'in_progress' ? 'Live' : 'Meeting',
    tone: meeting.status === 'in_progress' ? 'success' : 'neutral',
  }))

  const pinnedMeetingItems = upcomingMeetings.slice(0, 4).map<SpotlightItem>((meeting) => ({
    id: `pinned-meeting-${meeting.legacyId}`,
    title: meeting.title,
    detail: meeting.description ?? 'Meeting workspace',
    meta: `${describeMeetingTime(meeting.startTimeMs, nowMs, meeting.status)} · ${meeting.attendeeEmails.length} attendee${meeting.attendeeEmails.length === 1 ? '' : 's'}`,
    href: getMeetingHref(meeting),
    badge: meeting.status === 'in_progress' ? 'Live' : 'Upcoming',
    tone: meeting.status === 'in_progress' ? 'success' : 'warning',
  }))

  const performanceItems: SpotlightItem[] = [
    {
      id: 'performance-ads', title: adChannels > 0 ? `${adChannels} ad channel${adChannels === 1 ? '' : 's'} reporting` : 'Ads need a connection',
      detail: adChannels > 0 ? `${adsSpend.toLocaleString('en-US', { maximumFractionDigits: 0 })} spend tracked across active channels.` : 'Connect ad accounts and sync data to unlock performance monitoring.',
      meta: integrationSummary.failedCount > 0 ? `${integrationSummary.failedCount} sync issue${integrationSummary.failedCount === 1 ? '' : 's'}` : `${integrationSummary.pendingCount} pending sync job${integrationSummary.pendingCount === 1 ? '' : 's'}`,
      href: '/dashboard/ads', badge: 'Ads', tone: integrationSummary.failedCount > 0 ? 'critical' : adChannels > 0 ? 'success' : 'warning',
    },
    {
      id: 'performance-analytics', title: gaConnected ? 'Google Analytics linked' : 'Google Analytics not linked',
      detail: gaConnected ? `${analyticsMetrics.length} synced analytics row${analyticsMetrics.length === 1 ? '' : 's'} available for the selected client.` : 'Connect Google Analytics to surface live traffic and conversion signals.',
      meta: gaNeedsSetup ? 'Property setup required' : gaSyncError ? 'Last sync failed' : gaConnected ? 'Ready to inspect' : 'Setup required',
      href: '/dashboard/analytics', badge: 'Analytics', tone: gaSyncError ? 'critical' : gaConnected && !gaNeedsSetup ? 'success' : 'warning',
    },
  ]

  if (proposalCounts.ready > 0) {
    const firstReadyProposal = proposals.find((proposal) => proposal.status === 'ready')
    if (firstReadyProposal) {
      performanceItems.push({
        id: `performance-proposal-${firstReadyProposal.id}`,
        title: 'Proposal deck ready for review',
        detail: firstReadyProposal.formData.company.name || firstReadyProposal.clientName || 'Proposal delivery workspace',
        meta: `${proposalCounts.ready} ready · ${proposalCounts.sent} sent`,
        href: getProposalHref(firstReadyProposal), badge: 'Proposals', tone: 'success',
      })
    }
  }

  return {
    heroTitle: 'For you',
    heroSummary,
    pinnedMeetingItems,
    pinnedTaskItems,
    featureSpaces,
    priorityItems: priorityItems.slice(0, 5),
    spotlightTabs: [
      { id: 'worked-on', label: 'Worked on', count: workedOnItems.length, items: workedOnItems },
      { id: 'unread', label: 'Unread', count: unreadItems.length, items: unreadItems },
      { id: 'deadlines', label: 'Deadlines', count: deadlineItems.length, items: deadlineItems },
      { id: 'meetings', label: 'Meetings', count: meetingItems.length, items: meetingItems },
      { id: 'performance', label: 'Performance', count: performanceItems.length, items: performanceItems },
    ],
  }
}
