import { getPreviewClients } from './clients'
import { getPreviewProjects, getPreviewTasks } from './projects'

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
    return `/dashboard/projects?projectId=${encodeURIComponent(projectId)}&projectName=${encodeURIComponent(projectName)}`
}

function buildSampleProjectAction(context: PreviewAgentContext): PreviewAgentResponse {
    const previewProjects = getPreviewProjects(context.activeClientId ?? null)
    const fallbackProject = previewProjects[0]
    const fallbackClient = getPreviewClients().find((client) => client.id === context.activeClientId) ?? getPreviewClients()[0]
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

function buildSampleTaskSummary(context: PreviewAgentContext): PreviewAgentResponse {
    const tasks = getPreviewTasks(context.activeClientId ?? null)
    const totalTasks = tasks.length
    const openTasks = tasks.filter((task) => task.status !== 'completed' && task.status !== 'archived').length
    const completedTasks = tasks.filter((task) => task.status === 'completed').length
    const highPriorityTasks = tasks.filter((task) => task.priority === 'high').length
    const dueSoonTasks = tasks.filter((task) => typeof task.dueDate === 'string').length

    return {
        action: 'execute',
        operation: 'summarizeClientTasks',
        success: true,
        message: 'Here is a sample task summary for the current demo workspace.',
        data: {
            totalTasks,
            openTasks,
            completedTasks,
            overdueTasks: 0,
            dueSoonTasks,
            highPriorityTasks,
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

export function getPreviewAgentModeResponse(input: string, context: PreviewAgentContext): PreviewAgentResponse {
    const normalized = input.trim().toLowerCase()

    if (normalized.includes('create sample project') || normalized.includes('run sample project action')) {
        return buildSampleProjectAction(context)
    }

    if (normalized.includes('summarize sample tasks') || normalized.includes('show sample task summary')) {
        return buildSampleTaskSummary(context)
    }

    if (normalized.includes('open sample analytics')) {
        return {
            action: 'navigate',
            route: '/dashboard/analytics',
            message: 'Opening the sample analytics workspace.',
        }
    }

    return {
        action: 'response',
        message: 'Sample agent mode is active. Try “create sample project”, “summarize sample tasks”, or “open sample analytics”.',
    }
}