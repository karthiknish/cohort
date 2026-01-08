import type { WorkspaceNotification } from './types'
import { isoDaysAgo } from './utils'

export function getPreviewNotifications(): WorkspaceNotification[] {
    const notifications: WorkspaceNotification[] = [
        {
            id: 'preview-notif-1',
            kind: 'task.updated',
            title: 'Task assigned to you',
            body: 'You have been assigned to "Review Q3 performance report"',
            actor: { id: 'preview-user-1', name: 'Alex Morgan' },
            resource: { type: 'task', id: 'preview-task-1' },
            recipients: { roles: ['team'], clientIds: ['preview-tech-corp'] },
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
            recipients: { roles: ['team'], clientIds: ['preview-startupxyz'] },
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
            recipients: { roles: ['team'], clientIds: ['preview-tech-corp'] },
            createdAt: isoDaysAgo(2),
            updatedAt: isoDaysAgo(2),
            read: true,
            acknowledged: false,
        },
        {
            id: 'preview-notif-4',
            kind: 'invoice.paid',
            title: 'Invoice paid',
            body: 'StartupXYZ paid invoice INV-0992 ($5,200)',
            actor: { id: null, name: 'System' },
            resource: { type: 'invoice', id: 'preview-inv-2' },
            recipients: { roles: ['admin', 'team'], clientIds: ['preview-startupxyz'] },
            createdAt: isoDaysAgo(3),
            updatedAt: isoDaysAgo(3),
            read: true,
            acknowledged: true,
        },
        {
            id: 'preview-notif-5',
            kind: 'project.created',
            title: 'New project created',
            body: 'Social Media Management project has been set up for Tech Corp',
            actor: { id: 'preview-user-1', name: 'Alex Morgan' },
            resource: { type: 'project', id: 'preview-project-4' },
            recipients: { roles: ['team'], clientIds: ['preview-tech-corp'] },
            createdAt: isoDaysAgo(5),
            updatedAt: isoDaysAgo(5),
            read: true,
            acknowledged: true,
        },
    ]

    return notifications
}
