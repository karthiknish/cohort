import type { WorkspaceNotification } from './types'
import { isoDaysAgo } from './utils'

export function getPreviewNotifications(clientId: string | null = null): WorkspaceNotification[] {
    const notifications: WorkspaceNotification[] = [
        {
            id: 'preview-notif-1',
            kind: 'task.updated',
            title: 'Task assigned to you',
            body: 'You have been assigned to "Review Q3 performance report"',
            actor: { id: 'preview-user-1', name: 'Alex Morgan' },
            resource: { type: 'task', id: 'preview-task-1' },
            recipients: { roles: ['team'], clientId: 'preview-tech-corp', clientIds: ['preview-tech-corp'] },
            navigationUrl: '/dashboard/tasks?taskId=preview-task-1',
            createdAt: isoDaysAgo(0),
            updatedAt: isoDaysAgo(0),
            read: false,
            acknowledged: false,
        },
        {
            id: 'preview-notif-2',
            kind: 'collaboration.mention',
            title: 'You were mentioned',
            body: 'Priya Patel mentioned you in "Product Launch Marketing"',
            actor: { id: 'preview-user-2', name: 'Priya Patel' },
            resource: { type: 'collaboration', id: 'preview-message-1' },
            recipients: { roles: ['team'], clientId: 'preview-startupxyz', clientIds: ['preview-startupxyz'] },
            navigationUrl: '/dashboard/collaboration?projectId=preview-project-2',
            createdAt: isoDaysAgo(1),
            updatedAt: isoDaysAgo(1),
            read: false,
            acknowledged: false,
        },
        {
            id: 'preview-notif-3',
            kind: 'proposal.deck.ready',
            title: 'Proposal deck ready',
            body: 'Your presentation for Tech Corp is ready to download',
            actor: { id: null, name: 'System' },
            resource: { type: 'proposal', id: 'preview-proposal-1' },
            recipients: { roles: ['team'], clientId: 'preview-tech-corp', clientIds: ['preview-tech-corp'] },
            navigationUrl: '/dashboard/proposals/preview-proposal-1/deck',
            createdAt: isoDaysAgo(2),
            updatedAt: isoDaysAgo(2),
            read: true,
            acknowledged: false,
        },
        {
            id: 'preview-notif-4',
            kind: 'task.mention',
            title: 'Mentioned in a task comment',
            body: 'Jordan Lee asked for revised KPI targets on the growth sprint task.',
            actor: { id: 'preview-user-3', name: 'Jordan Lee' },
            resource: { type: 'task', id: 'preview-task-2' },
            recipients: { roles: ['team'], clientId: 'preview-tech-corp', clientIds: ['preview-tech-corp'] },
            navigationUrl: '/dashboard/tasks?taskId=preview-task-2',
            createdAt: isoDaysAgo(3),
            updatedAt: isoDaysAgo(3),
            read: false,
            acknowledged: false,
        },
        {
            id: 'preview-notif-5',
            kind: 'project.created',
            title: 'New project created',
            body: 'Social Media Management project has been set up for Tech Corp',
            actor: { id: 'preview-user-1', name: 'Alex Morgan' },
            resource: { type: 'project', id: 'preview-project-4' },
            recipients: { roles: ['team'], clientId: 'preview-tech-corp', clientIds: ['preview-tech-corp'] },
            navigationUrl: '/dashboard/projects?projectId=preview-project-4',
            createdAt: isoDaysAgo(5),
            updatedAt: isoDaysAgo(5),
            read: true,
            acknowledged: true,
        },
    ]

    if (!clientId) {
        return notifications
    }

    return notifications.filter((notification) => {
        const recipientIds = [
            notification.recipients.clientId ?? null,
            ...(notification.recipients.clientIds ?? []),
        ].filter((value): value is string => typeof value === 'string' && value.length > 0)

        return recipientIds.length === 0 || recipientIds.includes(clientId)
    })
}
