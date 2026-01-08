import type { Activity } from './types'
import { getPreviewClients } from './clients'
import { isoDaysAgo } from './utils'

export function getPreviewActivity(clientId: string | null): Activity[] {
    const clients = getPreviewClients()
    const targetClientIds = clientId ? [clientId] : clients.map((c) => c.id)

    const activities: Activity[] = [
        {
            id: 'preview-activity-1',
            type: 'task_completed',
            timestamp: isoDaysAgo(0),
            clientId: 'preview-tech-corp',
            entityId: 'preview-task-1',
            entityName: 'Review Q3 performance report',
            description: 'Task marked as completed by Alex Morgan',
            navigationUrl: '/dashboard/tasks?taskId=preview-task-1',
        },
        {
            id: 'preview-activity-2',
            type: 'message_posted',
            timestamp: isoDaysAgo(0),
            clientId: 'preview-tech-corp',
            entityId: 'preview-message-1',
            entityName: 'Q1 Brand Refresh Campaign',
            description: 'New comment on project discussion',
            navigationUrl: '/dashboard/collaboration?projectId=preview-project-1',
        },
        {
            id: 'preview-activity-3',
            type: 'project_updated',
            timestamp: isoDaysAgo(1),
            clientId: 'preview-startupxyz',
            entityId: 'preview-project-2',
            entityName: 'Product Launch Marketing',
            description: 'Project status changed to Planning',
            navigationUrl: '/dashboard/projects?projectId=preview-project-2',
        },
        {
            id: 'preview-activity-4',
            type: 'task_completed',
            timestamp: isoDaysAgo(1),
            clientId: 'preview-retail-store',
            entityId: 'preview-task-4',
            entityName: 'Finalize holiday creative assets',
            description: 'Task completed ahead of schedule',
            navigationUrl: '/dashboard/tasks?taskId=preview-task-4',
        },
        {
            id: 'preview-activity-5',
            type: 'message_posted',
            timestamp: isoDaysAgo(2),
            clientId: 'preview-startupxyz',
            entityId: 'preview-message-2',
            entityName: 'SEO Optimization Sprint',
            description: 'Priya Patel shared the technical audit results',
            navigationUrl: '/dashboard/collaboration?projectId=preview-project-5',
        },
        {
            id: 'preview-activity-6',
            type: 'project_updated',
            timestamp: isoDaysAgo(3),
            clientId: 'preview-tech-corp',
            entityId: 'preview-project-4',
            entityName: 'Social Media Management',
            description: 'New milestone added: Q2 Content Calendar',
            navigationUrl: '/dashboard/projects?projectId=preview-project-4',
        },
        {
            id: 'preview-activity-7',
            type: 'task_completed',
            timestamp: isoDaysAgo(4),
            clientId: 'preview-tech-corp',
            entityId: 'preview-task-5',
            entityName: 'Set up analytics tracking',
            description: 'Conversion tracking now live across all campaigns',
            navigationUrl: '/dashboard/tasks?taskId=preview-task-5',
        },
        {
            id: 'preview-activity-8',
            type: 'message_posted',
            timestamp: isoDaysAgo(5),
            clientId: 'preview-retail-store',
            entityId: 'preview-message-3',
            entityName: 'Holiday Sales Campaign',
            description: 'Final performance report shared with stakeholders',
            navigationUrl: '/dashboard/collaboration?projectId=preview-project-3',
        },
    ]

    if (!clientId) return activities
    return activities.filter((a) => a.clientId === clientId)
}
