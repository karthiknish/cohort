import { getPreviewClients } from './clients'
import { getPreviewCollaborationParticipants } from './collaboration'
import { getPreviewAdsMetrics, getPreviewCampaigns } from './ads'
import { getPreviewProjects, getPreviewTasks } from './projects'
import { getPreviewProposals } from './projects'
import { withPreviewModeSearchParam } from './utils'
import { getPreviewMeetingWorkspaceMembers } from '@/features/dashboard/meetings/lib/preview-data'

type PreviewAgentContext = {
    activeClientId?: string | null
    activeProjectId?: string | null
    activeProposalId?: string | null
}

export type PreviewAgentResponse = {
    action: 'navigate' | 'execute' | 'response'
    message: string
    route?: string | null
    operation?: string
    success?: boolean
    data?: Record<string, unknown>
}

function buildProjectRoute(projectId: string, projectName: string): string {
    return withPreviewModeSearchParam(`/dashboard/projects?projectId=${encodeURIComponent(projectId)}&projectName=${encodeURIComponent(projectName)}`)
}

function buildTasksRoute(taskId?: string): string {
    const suffix = taskId ? `?taskId=${encodeURIComponent(taskId)}` : ''
    return withPreviewModeSearchParam(`/dashboard/tasks${suffix}`)
}

function buildMeetingsRoute(meetingId?: string): string {
    const suffix = meetingId ? `?meetingId=${encodeURIComponent(meetingId)}` : ''
    return withPreviewModeSearchParam(`/dashboard/meetings${suffix}`)
}

function buildCollaborationRoute(conversationId?: string): string {
    const suffix = conversationId ? `?conversationId=${encodeURIComponent(conversationId)}` : ''
    return withPreviewModeSearchParam(`/dashboard/collaboration${suffix}`)
}

function buildAnalyticsRoute(): string {
    return withPreviewModeSearchParam('/dashboard/analytics')
}

function buildReportRoute(): string {
    return withPreviewModeSearchParam('/dashboard/ads')
}

function getFallbackClient(context: PreviewAgentContext) {
    return getPreviewClients().find((client) => client.id === context.activeClientId) ?? getPreviewClients()[0]
}

function extractNamedValue(input: string, prefixes: string[]): string | null {
    const trimmed = input.trim()
    for (const prefix of prefixes) {
        if (!trimmed.toLowerCase().startsWith(prefix)) continue
        const value = trimmed.slice(prefix.length).trim()
        return value.length > 0 ? value : null
    }
    return null
}

function capitalizeLabel(value: string): string {
    return value
        .split(/\s+/)
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
        .join(' ')
}

function buildSampleProjectAction(context: PreviewAgentContext): PreviewAgentResponse {
    const previewProjects = getPreviewProjects(context.activeClientId ?? null)
    const fallbackProject = previewProjects[0]
    const fallbackClient = getFallbackClient(context)
    const projectName = 'Launch Readiness Sprint'
    const projectId = 'preview-project-sample-action'
    const clientName = fallbackClient?.name ?? fallbackProject?.clientName ?? 'Tech Corp'

    return {
        action: 'execute',
        operation: 'createProject',
        success: true,
        route: buildProjectRoute(projectId, projectName),
        message: `Created a sample project card for ${clientName}. Opening the portfolio view so you can demo the result.`,
        data: {
            projectId,
            name: projectName,
            status: 'planning',
            clientName,
            startDate: '2026-04-03',
            endDate: '2026-05-15',
            tags: ['sample', 'launch', 'recording'],
        },
    }
}

function buildProjectCreateAction(input: string, context: PreviewAgentContext): PreviewAgentResponse {
    const requestedName = extractNamedValue(input, ['create project ', 'create a project '])
    const fallbackClient = getFallbackClient(context)
    const projectName = requestedName ? capitalizeLabel(requestedName) : 'Website Refresh'
    const projectId = `preview-project-${projectName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'new'}`
    const clientName = fallbackClient?.name ?? 'Tech Corp'

    return {
        action: 'execute',
        operation: 'createProject',
        success: true,
        route: buildProjectRoute(projectId, projectName),
        message: `Created a sample project named ${projectName} for ${clientName}. Opening the projects view so you can demo the result.`,
        data: {
            projectId,
            name: projectName,
            status: 'planning',
            clientName,
            startDate: '2026-04-03',
            endDate: '2026-05-15',
            tags: ['sample', 'agent', 'preview'],
        },
    }
}

function buildProjectUpdateAction(input: string, context: PreviewAgentContext): PreviewAgentResponse {
    const previewProjects = getPreviewProjects(context.activeClientId ?? null)
    const activeProject = previewProjects.find((project) => project.id === context.activeProjectId) ?? previewProjects[0]
    const normalized = input.toLowerCase()
    const nextStatus = normalized.includes('complete')
        ? 'completed'
        : normalized.includes('hold')
            ? 'on_hold'
            : 'active'

    return {
        action: 'execute',
        operation: 'updateProject',
        success: true,
        route: buildProjectRoute(activeProject?.id ?? 'preview-project-1', activeProject?.name ?? 'Website Refresh'),
        message: `Updated ${(activeProject?.name ?? 'the current project')} to ${nextStatus.replace('_', ' ')} in preview mode.`,
        data: {
            projectId: activeProject?.id ?? 'preview-project-1',
            name: activeProject?.name ?? 'Website Refresh',
            clientName: activeProject?.clientName ?? getFallbackClient(context)?.name ?? 'Tech Corp',
            status: nextStatus,
            tags: activeProject?.tags ?? ['sample', 'preview'],
            updatedFields: ['status'],
        },
    }
}

function buildSampleTaskSummary(context: PreviewAgentContext): PreviewAgentResponse {
    const tasks = getPreviewTasks(context.activeClientId ?? null)
    const clientName = getFallbackClient(context)?.name ?? null
    const totalTasks = tasks.length
    const openTasks = tasks.filter((task) => task.status !== 'completed' && task.status !== 'archived').length
    const completedTasks = tasks.filter((task) => task.status === 'completed').length
    const highPriorityTasks = tasks.filter((task) => task.priority === 'high').length
    const dueSoonTasks = tasks.filter((task) => typeof task.dueDate === 'string').length
    const statusBreakdown = Array.from(tasks.reduce((map, task) => {
        const key = task.status ?? 'unknown'
        map.set(key, (map.get(key) ?? 0) + 1)
        return map
    }, new Map<string, number>()).entries()).map(([status, count]) => ({ status, count }))

    return {
        action: 'execute',
        operation: 'summarizeClientTasks',
        success: true,
        message: 'Here is a sample task summary for the current demo workspace.',
        data: {
            clientName,
            totalTasks,
            openTasks,
            completedTasks,
            overdueTasks: 0,
            dueSoonTasks,
            highPriorityTasks,
            statusBreakdown,
            tasks: tasks.map((task) => ({
                title: task.title,
                status: task.status,
                priority: task.priority,
                dueDate: task.dueDate,
                assignedTo: task.assignedTo,
            })),
        },
    }
}

function buildTaskCreateAction(input: string, context: PreviewAgentContext): PreviewAgentResponse {
    const previewTasks = getPreviewTasks(context.activeClientId ?? null)
    const previewProjects = getPreviewProjects(context.activeClientId ?? null)
    const requestedTitle = extractNamedValue(input, ['create task ', 'create a task ', 'add task ', 'add a task '])
    const title = requestedTitle ? capitalizeLabel(requestedTitle) : 'Follow up on launch approvals'
    const taskId = `preview-task-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'new'}`
    const project = previewProjects.find((item) => item.id === context.activeProjectId) ?? previewProjects[0]
    const fallbackTask = previewTasks[0]

    return {
        action: 'execute',
        operation: 'createTask',
        success: true,
        route: buildTasksRoute(taskId),
        message: `Created a sample task called ${title} and queued it in the task list for preview.`,
        data: {
            title,
            taskId,
            projectId: project?.id ?? fallbackTask?.projectId ?? null,
            clientId: context.activeClientId ?? fallbackTask?.clientId ?? null,
            status: 'todo',
            action: 'Created in preview mode',
        },
    }
}

function buildMeetingScheduleAction(input: string, context: PreviewAgentContext): PreviewAgentResponse {
    const attendees = getPreviewMeetingWorkspaceMembers().slice(0, 3)
    const requestedTitle = extractNamedValue(input, ['schedule a meeting ', 'schedule meeting ', 'book a meeting ', 'set up a meeting '])
    const title = requestedTitle ? capitalizeLabel(requestedTitle) : 'Strategy Sync'
    const meetingId = `preview-meeting-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'new'}`

    return {
        action: 'execute',
        operation: 'createMeeting',
        success: true,
        route: buildMeetingsRoute(meetingId),
        message: `Scheduled a sample meeting titled ${title}. Opening meetings so you can show the created event.`,
        data: {
            title,
            status: 'scheduled',
            action: `Attendees: ${attendees.map((attendee) => attendee.name).join(', ')}`,
        },
    }
}

function buildDirectMessageAction(input: string): PreviewAgentResponse {
    const participants = getPreviewCollaborationParticipants()
    const normalized = input.toLowerCase()
    const recipient = participants.find((participant) => normalized.includes(participant.name.toLowerCase().split(' ')[0] ?? '')) ?? participants[0]
    const preview = normalized.includes('about')
        ? input.slice(Math.max(input.toLowerCase().indexOf('about') + 'about'.length, 0)).trim() || 'Quick update from preview mode.'
        : 'Quick update from preview mode.'

    return {
        action: 'execute',
        operation: 'sendDirectMessage',
        success: true,
        route: buildCollaborationRoute('preview-dm-alex'),
        message: `Queued a sample direct message to ${recipient?.name ?? 'Alex Morgan'} in preview mode.`,
        data: {
            recipientName: recipient?.name ?? 'Alex Morgan',
            preview,
        },
    }
}

function summarizeProviderMetrics(providerId: string) {
    const metrics = getPreviewAdsMetrics().filter((metric) => metric.providerId === providerId).slice(0, 7)
    const totals = metrics.reduce((accumulator, metric) => {
        accumulator.spend += metric.spend
        accumulator.revenue += metric.revenue ?? 0
        accumulator.impressions += metric.impressions
        accumulator.clicks += metric.clicks
        accumulator.conversions += metric.conversions
        return accumulator
    }, { spend: 0, revenue: 0, impressions: 0, clicks: 0, conversions: 0 })

    const ctr = totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0
    const roas = totals.spend > 0 ? totals.revenue / totals.spend : 0

    return {
        totals: { ...totals, ctr, roas },
        startDate: metrics.at(-1)?.date?.split('T')[0] ?? '2026-03-25',
        endDate: metrics[0]?.date?.split('T')[0] ?? '2026-03-31',
    }
}

function buildAdsSnapshotAction(input: string): PreviewAgentResponse {
    const normalized = input.toLowerCase()
    const providerId = normalized.includes('meta') || normalized.includes('facebook')
        ? 'facebook'
        : normalized.includes('linkedin')
            ? 'linkedin'
            : 'google'
    const providerLabel = providerId === 'facebook' ? 'Meta Ads' : providerId === 'linkedin' ? 'LinkedIn Ads' : 'Google Ads'
    const { totals, startDate, endDate } = summarizeProviderMetrics(providerId)
    const activeCampaigns = getPreviewCampaigns(providerId).slice(0, 3).map((campaign) => ({
        name: campaign.name,
        providerId,
        route: buildReportRoute(),
    }))
    const topCampaigns = activeCampaigns.slice(0, 2).map((campaign, index) => ({
        name: campaign.name,
        spend: Number((totals.spend / Math.max(activeCampaigns.length, 1) * (1 + index * 0.08)).toFixed(2)),
        roas: Number((totals.roas + index * 0.2).toFixed(2)),
        conversions: Math.max(1, Math.round(totals.conversions / Math.max(activeCampaigns.length, 1) + index)),
        route: campaign.route,
    }))

    return {
        action: 'execute',
        operation: 'summarizeAdsPerformance',
        success: true,
        route: buildAnalyticsRoute(),
        message: `Prepared a preview ${providerLabel} snapshot for the past week. Opening analytics so you can walk through it.`,
        data: {
            periodLabel: 'Past 7 days',
            startDate,
            endDate,
            providerLabel,
            campaignCounts: { total: activeCampaigns.length, active: activeCampaigns.length, paused: 0 },
            totals,
            activeCampaigns,
            topCampaigns,
            providerBreakdown: [{ providerId, label: providerLabel, totals }],
        },
    }
}

function buildPerformanceReportAction(): PreviewAgentResponse {
    const googleSnapshot = summarizeProviderMetrics('google')
    const metaSnapshot = summarizeProviderMetrics('facebook')
    const proposals = getPreviewProposals(null)

    return {
        action: 'execute',
        operation: 'generatePerformanceReport',
        success: true,
        route: buildReportRoute(),
        message: 'Generated a sample weekly report using preview ads and proposal metrics. Opening the ads workspace for the handoff view.',
        data: {
            periodLabel: 'Weekly',
            startDate: googleSnapshot.startDate,
            endDate: googleSnapshot.endDate,
            metricsSummary: { totals: googleSnapshot.totals },
            providerBreakdown: [
                { providerId: 'google', label: 'Google Ads', totals: googleSnapshot.totals },
                { providerId: 'facebook', label: 'Meta Ads', totals: metaSnapshot.totals },
            ],
            proposalSummary: {
                totalSubmitted: proposals.filter((proposal) => proposal.status === 'ready' || proposal.status === 'sent').length,
                aiSuccessRate: 92.4,
            },
            delivery: { inApp: true },
        },
    }
}

export function getPreviewAgentModeResponse(input: string, context: PreviewAgentContext): PreviewAgentResponse {
    const normalized = input.trim().toLowerCase()

    if (normalized.includes('create sample project') || normalized.includes('run sample project action')) {
        return buildSampleProjectAction(context)
    }

    if (
        normalized.includes('create project')
        || normalized.includes('create a project')
    ) {
        return buildProjectCreateAction(input, context)
    }

    if (
        normalized.includes('update this project status')
        || normalized.includes('mark this project')
        || normalized.includes('set this project')
    ) {
        return buildProjectUpdateAction(input, context)
    }

    if (
        normalized.includes('summarize sample tasks')
        || normalized.includes('show sample task summary')
        || normalized.includes('show my tasks')
        || normalized.includes('show tasks')
    ) {
        return buildSampleTaskSummary(context)
    }

    if (
        normalized.includes('create task')
        || normalized.includes('create a task')
        || normalized.includes('add task')
        || normalized.includes('add a task')
    ) {
        return buildTaskCreateAction(input, context)
    }

    if (
        normalized.includes('schedule a meeting')
        || normalized.includes('schedule meeting')
        || normalized.includes('book a meeting')
        || normalized.includes('set up a meeting')
    ) {
        return buildMeetingScheduleAction(input, context)
    }

    if (
        normalized.includes('send message')
        || normalized.includes('send a message')
        || normalized.includes('dm ')
        || normalized.includes('message alex')
    ) {
        return buildDirectMessageAction(input)
    }

    if (
        normalized.includes('meta ads')
        || normalized.includes('facebook ads')
        || normalized.includes('google ads')
        || normalized.includes('linkedin ads')
        || normalized.includes('ads doing')
    ) {
        return buildAdsSnapshotAction(input)
    }

    if (
        normalized.includes('generate weekly report')
        || normalized.includes('weekly report')
        || normalized.includes('performance report')
    ) {
        return buildPerformanceReportAction()
    }

    if (normalized.includes('open sample analytics')) {
        return {
            action: 'navigate',
            route: buildAnalyticsRoute(),
            message: 'Opening the sample analytics workspace.',
        }
    }

    return {
        action: 'response',
        message: 'Sample agent mode is active. Try “Schedule a meeting”, “Create project Website Refresh”, “Update this project status to active”, “How are my Meta ads doing this week?”, “Generate weekly report”, or “Show my Tasks”.',
    }
}