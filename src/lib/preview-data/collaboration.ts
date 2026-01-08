import type { CollaborationMessage } from './types'
import { isoDaysAgo } from './utils'

export function getPreviewCollaborationMessages(clientId: string | null, projectId: string | null): CollaborationMessage[] {
    const messages: CollaborationMessage[] = [
        {
            id: 'preview-collab-1',
            channelType: 'project',
            clientId: 'preview-tech-corp',
            projectId: 'preview-project-1',
            content: 'Just uploaded the revised brand guidelines. Let me know if the color palette works for the digital assets.',
            senderId: 'preview-user-1',
            senderName: 'Alex Morgan',
            senderRole: 'Account Manager',
            createdAt: isoDaysAgo(0),
            updatedAt: isoDaysAgo(0),
            isEdited: false,
            deletedAt: null,
            deletedBy: null,
            isDeleted: false,
            attachments: [{ name: 'brand-guidelines-v2.pdf', url: '#', type: 'application/pdf', size: '2.4 MB' }],
            format: 'markdown',
            reactions: [{ emoji: '👍', count: 2, userIds: ['preview-user-2', 'preview-user-3'] }],
        },
        {
            id: 'preview-collab-2',
            channelType: 'project',
            clientId: 'preview-tech-corp',
            projectId: 'preview-project-1',
            content: 'Looks great! The primary blue is perfect. Quick question - should we use the gradient version for social headers?',
            senderId: 'preview-user-2',
            senderName: 'Jordan Lee',
            senderRole: 'Strategist',
            createdAt: isoDaysAgo(0),
            updatedAt: isoDaysAgo(0),
            isEdited: false,
            deletedAt: null,
            deletedBy: null,
            isDeleted: false,
            format: 'markdown',
        },
        {
            id: 'preview-collab-3',
            channelType: 'client',
            clientId: 'preview-startupxyz',
            projectId: null,
            content: 'Team sync: Product launch is confirmed for March 15th. We need to finalize the influencer list by EOW.',
            senderId: 'preview-user-3',
            senderName: 'Priya Patel',
            senderRole: 'Account Manager',
            createdAt: isoDaysAgo(1),
            updatedAt: isoDaysAgo(1),
            isEdited: false,
            deletedAt: null,
            deletedBy: null,
            isDeleted: false,
            format: 'markdown',
            mentions: [{ slug: 'sam-chen', name: 'Sam Chen', role: 'Performance Marketer' }],
        },
        {
            id: 'preview-collab-4',
            channelType: 'project',
            clientId: 'preview-startupxyz',
            projectId: 'preview-project-5',
            content: 'SEO audit complete! Found 23 high-priority issues. Top 3:\n\n1. Missing meta descriptions on 40% of pages\n2. Slow page load times (avg 4.2s)\n3. Duplicate content on product pages\n\nFull report attached.',
            senderId: 'preview-user-4',
            senderName: 'Sam Chen',
            senderRole: 'Performance Marketer',
            createdAt: isoDaysAgo(2),
            updatedAt: isoDaysAgo(2),
            isEdited: false,
            deletedAt: null,
            deletedBy: null,
            isDeleted: false,
            attachments: [{ name: 'seo-audit-report.xlsx', url: '#', type: 'application/vnd.ms-excel', size: '1.1 MB' }],
            format: 'markdown',
            reactions: [{ emoji: '🔥', count: 1, userIds: ['preview-user-3'] }],
        },
        {
            id: 'preview-collab-5',
            channelType: 'client',
            clientId: 'preview-retail-store',
            projectId: null,
            content: 'Holiday campaign wrap-up: 127% of revenue target achieved! Great work everyone. Client is thrilled with the results.',
            senderId: 'preview-user-5',
            senderName: 'Taylor Kim',
            senderRole: 'Account Manager',
            createdAt: isoDaysAgo(5),
            updatedAt: isoDaysAgo(5),
            isEdited: false,
            deletedAt: null,
            deletedBy: null,
            isDeleted: false,
            format: 'markdown',
            reactions: [
                { emoji: '🎉', count: 3, userIds: ['preview-user-1', 'preview-user-2', 'preview-user-6'] },
                { emoji: '💪', count: 2, userIds: ['preview-user-3', 'preview-user-4'] },
            ],
        },
    ]

    let filtered = messages
    if (clientId) {
        filtered = filtered.filter((m) => m.clientId === clientId)
    }
    if (projectId) {
        filtered = filtered.filter((m) => m.projectId === projectId)
    }
    return filtered
}
