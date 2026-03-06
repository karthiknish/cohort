import type { CollaborationChannelType, CollaborationMessage, DirectConversation, DirectMessage } from '@/types/collaboration'

import { isoDaysAgo } from './utils'

export type PreviewCollaborationParticipant = {
    id: string
    name: string
    email: string
    role: string | null
}

type PreviewSelfContext = {
    id?: string | null
    name?: string | null
    role?: string | null
}

type PreviewThreadMap = Record<string, CollaborationMessage[]>

type PreviewDirectConversationSeed = {
    legacyId: string
    otherParticipantId: string
}

type PreviewDirectMessageSeed = {
    id: string
    senderId: string
    content: string
    createdAtMs: number
    edited?: boolean
    editedAtMs?: number | null
    deleted?: boolean
    deletedAtMs?: number | null
    deletedBy?: string | null
    attachments?: DirectMessage['attachments']
    reactions?: DirectMessage['reactions']
    readBy?: string[]
    deliveredTo?: string[]
    readAtMs?: number | null
    sharedTo?: Array<'email'> | null
    updatedAtMs?: number | null
}

const PREVIEW_SELF_TOKEN = '__preview_self__'

const PREVIEW_PARTICIPANTS: PreviewCollaborationParticipant[] = [
    {
        id: 'preview-user-1',
        name: 'Alex Morgan',
        email: 'alex.morgan@preview.cohort',
        role: 'Account Manager',
    },
    {
        id: 'preview-user-2',
        name: 'Jordan Lee',
        email: 'jordan.lee@preview.cohort',
        role: 'Strategist',
    },
    {
        id: 'preview-user-3',
        name: 'Priya Patel',
        email: 'priya.patel@preview.cohort',
        role: 'Account Manager',
    },
    {
        id: 'preview-user-4',
        name: 'Sam Chen',
        email: 'sam.chen@preview.cohort',
        role: 'Performance Marketer',
    },
    {
        id: 'preview-user-5',
        name: 'Taylor Kim',
        email: 'taylor.kim@preview.cohort',
        role: 'Account Manager',
    },
    {
        id: 'preview-user-6',
        name: 'Casey Rivera',
        email: 'casey.rivera@preview.cohort',
        role: 'Creative',
    },
]

const PREVIEW_DIRECT_CONVERSATIONS: PreviewDirectConversationSeed[] = [
    { legacyId: 'preview-dm-alex', otherParticipantId: 'preview-user-1' },
    { legacyId: 'preview-dm-sam', otherParticipantId: 'preview-user-4' },
    { legacyId: 'preview-dm-casey', otherParticipantId: 'preview-user-6' },
]

const PREVIEW_DIRECT_MESSAGES: Record<string, PreviewDirectMessageSeed[]> = {
    'preview-dm-alex': [
        {
            id: 'preview-dm-alex-1',
            senderId: 'preview-user-1',
            content: 'Can you sanity-check the client-ready recap before I send it out?',
            createdAtMs: Date.parse(isoDaysAgo(0)) - 5 * 60 * 60 * 1000,
            readBy: [PREVIEW_SELF_TOKEN],
            deliveredTo: ['preview-user-1', PREVIEW_SELF_TOKEN],
            readAtMs: Date.parse(isoDaysAgo(0)) - 4 * 60 * 60 * 1000,
        },
        {
            id: 'preview-dm-alex-2',
            senderId: PREVIEW_SELF_TOKEN,
            content: 'Yes. Tighten the scope paragraph a bit and it is ready to go.',
            createdAtMs: Date.parse(isoDaysAgo(0)) - 4 * 60 * 60 * 1000,
            readBy: [PREVIEW_SELF_TOKEN, 'preview-user-1'],
            deliveredTo: ['preview-user-1', PREVIEW_SELF_TOKEN],
            readAtMs: Date.parse(isoDaysAgo(0)) - 4 * 60 * 60 * 1000,
        },
        {
            id: 'preview-dm-alex-3',
            senderId: 'preview-user-1',
            content: 'Perfect. I will send the final version after standup.',
            createdAtMs: Date.parse(isoDaysAgo(0)) - 3 * 60 * 60 * 1000,
            readBy: [PREVIEW_SELF_TOKEN],
            deliveredTo: ['preview-user-1', PREVIEW_SELF_TOKEN],
            readAtMs: Date.parse(isoDaysAgo(0)) - 2 * 60 * 60 * 1000,
        },
    ],
    'preview-dm-sam': [
        {
            id: 'preview-dm-sam-1',
            senderId: PREVIEW_SELF_TOKEN,
            content: 'Did the SEO crawl finish cleanly after the redirect fixes?',
            createdAtMs: Date.parse(isoDaysAgo(1)) - 2 * 60 * 60 * 1000,
            readBy: [PREVIEW_SELF_TOKEN, 'preview-user-4'],
            deliveredTo: ['preview-user-4', PREVIEW_SELF_TOKEN],
            readAtMs: Date.parse(isoDaysAgo(1)) - 2 * 60 * 60 * 1000,
        },
        {
            id: 'preview-dm-sam-2',
            senderId: 'preview-user-4',
            content: 'Yes. Only two canonical issues left and I have them queued for today.',
            createdAtMs: Date.parse(isoDaysAgo(1)) - 60 * 60 * 1000,
            readBy: [],
            deliveredTo: ['preview-user-4', PREVIEW_SELF_TOKEN],
            reactions: [{ emoji: '✅', count: 1, userIds: ['preview-user-4'] }],
        },
    ],
    'preview-dm-casey': [
        {
            id: 'preview-dm-casey-1',
            senderId: 'preview-user-6',
            content: 'Dropped three revised holiday concepts into the asset folder.',
            createdAtMs: Date.parse(isoDaysAgo(2)) - 3 * 60 * 60 * 1000,
            readBy: [PREVIEW_SELF_TOKEN],
            deliveredTo: ['preview-user-6', PREVIEW_SELF_TOKEN],
        },
        {
            id: 'preview-dm-casey-2',
            senderId: PREVIEW_SELF_TOKEN,
            content: 'Nice. The second direction feels strongest for paid social.',
            createdAtMs: Date.parse(isoDaysAgo(2)) - 2 * 60 * 60 * 1000,
            readBy: [PREVIEW_SELF_TOKEN, 'preview-user-6'],
            deliveredTo: ['preview-user-6', PREVIEW_SELF_TOKEN],
        },
    ],
}

const PREVIEW_CHANNEL_MESSAGES: CollaborationMessage[] = [
    {
        id: 'preview-collab-team-1',
        channelType: 'team',
        clientId: null,
        projectId: null,
        content: 'Morning ops note: the proposal preview rollout is live in staging. Please use preview mode when demoing flows to clients today.',
        senderId: 'preview-user-1',
        senderName: 'Alex Morgan',
        senderRole: 'Account Manager',
        createdAt: isoDaysAgo(0),
        updatedAt: isoDaysAgo(0),
        isEdited: false,
        deletedAt: null,
        deletedBy: null,
        isDeleted: false,
        format: 'markdown',
        reactions: [{ emoji: '👍', count: 3, userIds: ['preview-user-2', 'preview-user-4', 'preview-user-6'] }],
        readBy: [PREVIEW_SELF_TOKEN],
        deliveredTo: [PREVIEW_SELF_TOKEN, 'preview-user-2', 'preview-user-4', 'preview-user-6'],
        threadReplyCount: 2,
        threadLastReplyAt: isoDaysAgo(0),
    },
    {
        id: 'preview-collab-team-2',
        channelType: 'team',
        clientId: null,
        projectId: null,
        content: 'Reminder: keep all creative approvals in-channel so the shared files panel stays useful for handoffs.',
        senderId: 'preview-user-5',
        senderName: 'Taylor Kim',
        senderRole: 'Account Manager',
        createdAt: isoDaysAgo(1),
        updatedAt: isoDaysAgo(1),
        isEdited: false,
        deletedAt: null,
        deletedBy: null,
        isDeleted: false,
        format: 'markdown',
        attachments: [{ name: 'approval-checklist.pdf', url: '#', type: 'application/pdf', size: '420 KB' }],
        readBy: [PREVIEW_SELF_TOKEN],
        deliveredTo: [PREVIEW_SELF_TOKEN, 'preview-user-1', 'preview-user-6'],
    },
    {
        id: 'preview-collab-client-1',
        channelType: 'client',
        clientId: 'preview-tech-corp',
        projectId: null,
        content: 'Weekly client summary is ready. Main win: demo request volume climbed 18% week over week after the landing page revision.',
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
        mentions: [{ slug: 'alex-morgan', name: 'Alex Morgan', role: 'Account Manager' }],
        readBy: [],
        deliveredTo: [PREVIEW_SELF_TOKEN, 'preview-user-1', 'preview-user-2'],
    },
    {
        id: 'preview-collab-project-1',
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
        readBy: [PREVIEW_SELF_TOKEN],
        deliveredTo: [PREVIEW_SELF_TOKEN, 'preview-user-1', 'preview-user-2'],
    },
    {
        id: 'preview-collab-project-2',
        channelType: 'project',
        clientId: 'preview-tech-corp',
        projectId: 'preview-project-1',
        content: 'Looks great. The primary blue is perfect. Quick question: should we use the gradient version for social headers?',
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
        readBy: [],
        deliveredTo: [PREVIEW_SELF_TOKEN, 'preview-user-1', 'preview-user-2'],
    },
    {
        id: 'preview-collab-client-2',
        channelType: 'client',
        clientId: 'preview-startupxyz',
        projectId: null,
        content: 'Team sync: product launch is confirmed for March 15th. We need the influencer shortlist finalized by Friday.',
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
        readBy: [],
        deliveredTo: [PREVIEW_SELF_TOKEN, 'preview-user-3', 'preview-user-4'],
    },
    {
        id: 'preview-collab-project-3',
        channelType: 'project',
        clientId: 'preview-startupxyz',
        projectId: 'preview-project-5',
        content: 'SEO audit complete. Top issues are missing meta descriptions, slow page load times, and duplicate product copy. Full report attached.',
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
        readBy: [],
        deliveredTo: [PREVIEW_SELF_TOKEN, 'preview-user-3', 'preview-user-4'],
    },
    {
        id: 'preview-collab-client-3',
        channelType: 'client',
        clientId: 'preview-retail-store',
        projectId: null,
        content: 'Holiday campaign wrap-up: 127% of revenue target achieved. Client is thrilled with the final reporting deck.',
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
        readBy: [PREVIEW_SELF_TOKEN],
        deliveredTo: [PREVIEW_SELF_TOKEN, 'preview-user-5', 'preview-user-6'],
    },
]

const PREVIEW_THREAD_REPLIES: PreviewThreadMap = {
    'preview-collab-team-1': [
        {
            id: 'preview-collab-team-1-reply-1',
            channelType: 'team',
            clientId: null,
            projectId: null,
            content: 'I used it in the analytics review this morning. The preview coverage is finally consistent enough for demos.',
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
            parentMessageId: 'preview-collab-team-1',
            threadRootId: 'preview-collab-team-1',
            readBy: [PREVIEW_SELF_TOKEN],
            deliveredTo: [PREVIEW_SELF_TOKEN, 'preview-user-2'],
        },
        {
            id: 'preview-collab-team-1-reply-2',
            channelType: 'team',
            clientId: null,
            projectId: null,
            content: 'Good. I will use the collaboration route in the client walkthrough too.',
            senderId: 'preview-user-6',
            senderName: 'Casey Rivera',
            senderRole: 'Creative',
            createdAt: isoDaysAgo(0),
            updatedAt: isoDaysAgo(0),
            isEdited: false,
            deletedAt: null,
            deletedBy: null,
            isDeleted: false,
            format: 'markdown',
            parentMessageId: 'preview-collab-team-1',
            threadRootId: 'preview-collab-team-1',
            readBy: [],
            deliveredTo: [PREVIEW_SELF_TOKEN, 'preview-user-6'],
        },
    ],
}

function resolveSelfContext(self?: PreviewSelfContext) {
    return {
        id: self?.id?.trim() || 'preview-current-user',
        name: self?.name?.trim() || 'You',
        role: self?.role ?? 'Account Owner',
    }
}

function maybeReplaceSelfToken(value: string, self: ReturnType<typeof resolveSelfContext>) {
    return value === PREVIEW_SELF_TOKEN ? self.id : value
}

function mapDirectMessage(message: PreviewDirectMessageSeed, self?: PreviewSelfContext): DirectMessage {
    const resolvedSelf = resolveSelfContext(self)
    const senderParticipant =
        message.senderId === PREVIEW_SELF_TOKEN
            ? { id: resolvedSelf.id, name: resolvedSelf.name, role: resolvedSelf.role }
            : PREVIEW_PARTICIPANTS.find((participant) => participant.id === message.senderId) ?? {
                id: message.senderId,
                name: 'Unknown teammate',
                role: null,
            }

    return {
        id: message.id,
        legacyId: message.id,
        senderId: senderParticipant.id,
        senderName: senderParticipant.name,
        senderRole: senderParticipant.role,
        content: message.content,
        edited: Boolean(message.edited),
        editedAtMs: message.editedAtMs ?? null,
        deleted: Boolean(message.deleted),
        deletedAtMs: message.deletedAtMs ?? null,
        deletedBy: message.deletedBy ?? null,
        attachments: message.attachments ?? null,
        reactions: message.reactions ?? null,
        readBy: (message.readBy ?? []).map((entry) => maybeReplaceSelfToken(entry, resolvedSelf)),
        deliveredTo: (message.deliveredTo ?? []).map((entry) => maybeReplaceSelfToken(entry, resolvedSelf)),
        readAtMs: message.readAtMs ?? null,
        sharedTo: message.sharedTo ?? null,
        createdAtMs: message.createdAtMs,
        updatedAtMs: message.updatedAtMs ?? message.createdAtMs,
    }
}

function mapCollaborationMessage(message: CollaborationMessage, viewerId?: string | null): CollaborationMessage {
    const resolvedViewerId = viewerId?.trim() || 'preview-current-user'
    return {
        ...message,
        readBy: Array.isArray(message.readBy)
            ? message.readBy.map((entry) => (entry === PREVIEW_SELF_TOKEN ? resolvedViewerId : entry))
            : undefined,
        deliveredTo: Array.isArray(message.deliveredTo)
            ? message.deliveredTo.map((entry) => (entry === PREVIEW_SELF_TOKEN ? resolvedViewerId : entry))
            : undefined,
        reactions: Array.isArray(message.reactions)
            ? message.reactions.map((reaction) => ({
                ...reaction,
                userIds: reaction.userIds.map((entry) => (entry === PREVIEW_SELF_TOKEN ? resolvedViewerId : entry)),
            }))
            : undefined,
    }
}

export function getPreviewCollaborationParticipants(): PreviewCollaborationParticipant[] {
    return PREVIEW_PARTICIPANTS.map((participant) => ({ ...participant }))
}

export function getPreviewCollaborationMessages(
    channelType: CollaborationChannelType,
    clientId: string | null,
    projectId: string | null,
    viewerId?: string | null,
): CollaborationMessage[] {
    return PREVIEW_CHANNEL_MESSAGES
        .filter((message) => {
            if (message.channelType !== channelType) {
                return false
            }
            if (channelType === 'client') {
                return message.clientId === clientId
            }
            if (channelType === 'project') {
                return message.projectId === projectId
            }
            return true
        })
        .map((message) => mapCollaborationMessage(message, viewerId))
        .sort((a, b) => new Date(a.createdAt ?? 0).getTime() - new Date(b.createdAt ?? 0).getTime())
}

export function getPreviewCollaborationThreadReplies(threadRootId: string, viewerId?: string | null): CollaborationMessage[] {
    const replies = PREVIEW_THREAD_REPLIES[threadRootId] ?? []
    return replies
        .map((message) => mapCollaborationMessage(message, viewerId))
        .sort((a, b) => new Date(a.createdAt ?? 0).getTime() - new Date(b.createdAt ?? 0).getTime())
}

export function getPreviewDirectConversations(self?: PreviewSelfContext): DirectConversation[] {
    const resolvedSelf = resolveSelfContext(self)

    return PREVIEW_DIRECT_CONVERSATIONS.map((seed) => {
        const otherParticipant = PREVIEW_PARTICIPANTS.find((participant) => participant.id === seed.otherParticipantId)
        const messages = getPreviewDirectMessages(seed.legacyId, resolvedSelf)
        const lastMessage = [...messages].sort((a, b) => b.createdAtMs - a.createdAtMs)[0] ?? null
        const isRead = !messages.some(
            (message) => message.senderId !== resolvedSelf.id && !message.readBy.includes(resolvedSelf.id)
        )

        return {
            id: seed.legacyId,
            legacyId: seed.legacyId,
            otherParticipantId: seed.otherParticipantId,
            otherParticipantName: otherParticipant?.name ?? 'Unknown teammate',
            otherParticipantRole: otherParticipant?.role ?? null,
            lastMessageSnippet: lastMessage?.deleted ? 'Message deleted' : (lastMessage?.content ?? null),
            lastMessageAtMs: lastMessage?.createdAtMs ?? null,
            lastMessageSenderId: lastMessage?.senderId ?? null,
            isRead,
            isArchived: seed.legacyId === 'preview-dm-casey',
            isMuted: seed.legacyId === 'preview-dm-sam',
            createdAtMs: messages[0]?.createdAtMs ?? Date.now(),
            updatedAtMs: lastMessage?.createdAtMs ?? Date.now(),
        } satisfies DirectConversation
    }).sort((a, b) => (b.lastMessageAtMs ?? 0) - (a.lastMessageAtMs ?? 0))
}

export function getPreviewDirectMessages(conversationLegacyId: string, self?: PreviewSelfContext): DirectMessage[] {
    const seeds = PREVIEW_DIRECT_MESSAGES[conversationLegacyId] ?? []
    return seeds
        .map((message) => mapDirectMessage(message, self))
        .sort((a, b) => b.createdAtMs - a.createdAtMs)
}
