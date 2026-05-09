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
    {
        id: 'preview-user-7',
        name: 'Mia Thompson',
        email: 'mia.thompson@preview.cohort',
        role: 'Brand Designer',
    },
    {
        id: 'preview-user-8',
        name: 'Noah Bennett',
        email: 'noah.bennett@preview.cohort',
        role: 'Lifecycle Specialist',
    },
    {
        id: 'preview-user-9',
        name: 'Lena Ortiz',
        email: 'lena.ortiz@preview.cohort',
        role: 'Lifecycle Strategist',
    },
]

const PREVIEW_DIRECT_CONVERSATIONS: PreviewDirectConversationSeed[] = [
    { legacyId: 'preview-dm-alex', otherParticipantId: 'preview-user-1' },
    { legacyId: 'preview-dm-sam', otherParticipantId: 'preview-user-4' },
    { legacyId: 'preview-dm-casey', otherParticipantId: 'preview-user-6' },
    { legacyId: 'preview-dm-priya', otherParticipantId: 'preview-user-3' },
    { legacyId: 'preview-dm-noah', otherParticipantId: 'preview-user-8' },
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
        {
            id: 'preview-dm-alex-4',
            senderId: PREVIEW_SELF_TOKEN,
            content: 'Uploading the final board-ready deck and pacing chart now.',
            createdAtMs: Date.parse(isoDaysAgo(0)) - 90 * 60 * 1000,
            attachments: [
                { name: 'board-deck-v5.pdf', url: '#', type: 'application/pdf', size: '3.2 MB' },
                { name: 'pacing-chart.png', url: '#', type: 'image/png', size: '420 KB' },
            ],
            sharedTo: ['email'],
            readBy: [PREVIEW_SELF_TOKEN],
            deliveredTo: ['preview-user-1', PREVIEW_SELF_TOKEN],
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
        {
            id: 'preview-dm-sam-3',
            senderId: PREVIEW_SELF_TOKEN,
            content: 'Great. Drop the crawl screenshot in here when it is ready so I can include it in the recap.',
            createdAtMs: Date.parse(isoDaysAgo(1)) - 30 * 60 * 1000,
            edited: true,
            editedAtMs: Date.parse(isoDaysAgo(1)) - 25 * 60 * 1000,
            readBy: [PREVIEW_SELF_TOKEN],
            deliveredTo: ['preview-user-4', PREVIEW_SELF_TOKEN],
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
        {
            id: 'preview-dm-casey-3',
            senderId: 'preview-user-6',
            content: 'Agreed. I also left comments in the Figma file for the CTA hierarchy.',
            createdAtMs: Date.parse(isoDaysAgo(2)) - 75 * 60 * 1000,
            attachments: [{ name: 'social-header-directions.fig', url: '#', type: 'application/octet-stream', size: '6.1 MB' }],
            readBy: [PREVIEW_SELF_TOKEN],
            deliveredTo: ['preview-user-6', PREVIEW_SELF_TOKEN],
            reactions: [{ emoji: '🔥', count: 2, userIds: ['preview-user-6', PREVIEW_SELF_TOKEN] }],
        },
    ],
    'preview-dm-priya': [
        {
            id: 'preview-dm-priya-1',
            senderId: 'preview-user-3',
            content: 'Can you confirm the launch-week moderation coverage before I lock the client note?',
            createdAtMs: Date.parse(isoDaysAgo(0)) - 7 * 60 * 60 * 1000,
            readBy: [],
            deliveredTo: ['preview-user-3', PREVIEW_SELF_TOKEN],
        },
        {
            id: 'preview-dm-priya-2',
            senderId: PREVIEW_SELF_TOKEN,
            content: 'Yes. Noah has email coverage, Casey owns creative QA, and I will monitor the launch thread during the first hour.',
            createdAtMs: Date.parse(isoDaysAgo(0)) - 6 * 60 * 60 * 1000,
            readBy: [PREVIEW_SELF_TOKEN, 'preview-user-3'],
            deliveredTo: ['preview-user-3', PREVIEW_SELF_TOKEN],
        },
    ],
    'preview-dm-noah': [
        {
            id: 'preview-dm-noah-1',
            senderId: 'preview-user-8',
            content: 'I deleted the outdated resend policy note so the sample inbox matches the current retail workflow.',
            createdAtMs: Date.parse(isoDaysAgo(3)) - 2 * 60 * 60 * 1000,
            deleted: true,
            deletedAtMs: Date.parse(isoDaysAgo(3)) - 90 * 60 * 1000,
            deletedBy: 'preview-user-8',
            readBy: [PREVIEW_SELF_TOKEN],
            deliveredTo: ['preview-user-8', PREVIEW_SELF_TOKEN],
        },
        {
            id: 'preview-dm-noah-2',
            senderId: PREVIEW_SELF_TOKEN,
            content: 'Perfect. I only need the final resend window and the suppressed segment count for the recap.',
            createdAtMs: Date.parse(isoDaysAgo(3)) - 70 * 60 * 1000,
            readBy: [PREVIEW_SELF_TOKEN],
            deliveredTo: ['preview-user-8', PREVIEW_SELF_TOKEN],
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
        isPinned: true,
        pinnedAt: isoDaysAgo(1),
        pinnedBy: 'preview-user-5',
    },
    {
        id: 'preview-collab-team-3',
        channelType: 'team',
        clientId: null,
        projectId: null,
        content: 'Ops handoff: meeting preview coverage now includes completed, cancelled, and post-processing states for demos.',
        senderId: 'preview-user-2',
        senderName: 'Jordan Lee',
        senderRole: 'Strategist',
        createdAt: isoDaysAgo(0),
        updatedAt: isoDaysAgo(0),
        isEdited: true,
        deletedAt: null,
        deletedBy: null,
        isDeleted: false,
        format: 'markdown',
        reactions: [
            { emoji: '✅', count: 3, userIds: ['preview-user-1', 'preview-user-4', 'preview-user-6'] },
            { emoji: '🚀', count: 2, userIds: ['preview-user-3', 'preview-user-7'] },
        ],
        readBy: [PREVIEW_SELF_TOKEN],
        deliveredTo: [PREVIEW_SELF_TOKEN, 'preview-user-1', 'preview-user-3', 'preview-user-4', 'preview-user-6', 'preview-user-7'],
        sharedTo: ['email'],
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
        threadReplyCount: 3,
        threadLastReplyAt: isoDaysAgo(0),
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
        threadReplyCount: 2,
        threadLastReplyAt: isoDaysAgo(0),
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
        sharedTo: ['email'],
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
    {
        id: 'preview-collab-project-4',
        channelType: 'project',
        clientId: 'preview-tech-corp',
        projectId: 'preview-project-4',
        content: 'Queued three revised motion cutdowns for tomorrow\'s approvals. The CTA timing is cleaner, but the headline frame still needs one pass.',
        senderId: 'preview-user-7',
        senderName: 'Mia Thompson',
        senderRole: 'Brand Designer',
        createdAt: isoDaysAgo(0),
        updatedAt: isoDaysAgo(0),
        isEdited: false,
        deletedAt: null,
        deletedBy: null,
        isDeleted: false,
        attachments: [
            { name: 'motion-cutdown-a.mp4', url: '#', type: 'video/mp4', size: '14.2 MB' },
            { name: 'motion-cutdown-b.mp4', url: '#', type: 'video/mp4', size: '13.8 MB' },
        ],
        format: 'markdown',
        reactions: [{ emoji: '👀', count: 2, userIds: ['preview-user-1', 'preview-user-2'] }],
        mentions: [{ slug: 'alex-morgan', name: 'Alex Morgan', role: 'Account Manager' }],
        readBy: [PREVIEW_SELF_TOKEN],
        deliveredTo: [PREVIEW_SELF_TOKEN, 'preview-user-1', 'preview-user-2', 'preview-user-7'],
    },
    {
        id: 'preview-collab-client-4',
        channelType: 'client',
        clientId: 'preview-startupxyz',
        projectId: null,
        content: 'Client approved the creator shortlist. Please send the final launch-day moderation matrix and escalation contacts.',
        senderId: 'preview-user-3',
        senderName: 'Priya Patel',
        senderRole: 'Account Manager',
        createdAt: isoDaysAgo(0),
        updatedAt: isoDaysAgo(0),
        isEdited: false,
        deletedAt: null,
        deletedBy: null,
        isDeleted: false,
        format: 'markdown',
        mentions: [{ slug: 'lena-ortiz', name: 'Lena Ortiz', role: 'Lifecycle Strategist' }],
        reactions: [{ emoji: '✅', count: 1, userIds: ['preview-user-9'] }],
        readBy: [],
        deliveredTo: [PREVIEW_SELF_TOKEN, 'preview-user-3', 'preview-user-9'],
        threadReplyCount: 2,
        threadLastReplyAt: isoDaysAgo(0),
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
    'preview-collab-client-1': [
        {
            id: 'preview-collab-client-1-reply-1',
            channelType: 'client',
            clientId: 'preview-tech-corp',
            projectId: null,
            content: 'I also added the landing-page heatmap note so the client sees why demo-request quality improved.',
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
            parentMessageId: 'preview-collab-client-1',
            threadRootId: 'preview-collab-client-1',
            reactions: [{ emoji: '👍', count: 1, userIds: ['preview-user-2'] }],
            readBy: [PREVIEW_SELF_TOKEN],
            deliveredTo: [PREVIEW_SELF_TOKEN, 'preview-user-1', 'preview-user-2'],
        },
        {
            id: 'preview-collab-client-1-reply-2',
            channelType: 'client',
            clientId: 'preview-tech-corp',
            projectId: null,
            content: 'Perfect. I will keep the summary client-safe and save the deeper pacing detail for the internal room.',
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
            parentMessageId: 'preview-collab-client-1',
            threadRootId: 'preview-collab-client-1',
            readBy: [],
            deliveredTo: [PREVIEW_SELF_TOKEN, 'preview-user-1', 'preview-user-2'],
        },
        {
            id: 'preview-collab-client-1-reply-3',
            channelType: 'client',
            clientId: 'preview-tech-corp',
            projectId: null,
            content: 'Board note exported. Dropping the PDF here for reference in case the client asks for it live.',
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
            attachments: [{ name: 'board-note.pdf', url: '#', type: 'application/pdf', size: '560 KB' }],
            parentMessageId: 'preview-collab-client-1',
            threadRootId: 'preview-collab-client-1',
            readBy: [PREVIEW_SELF_TOKEN],
            deliveredTo: [PREVIEW_SELF_TOKEN, 'preview-user-1', 'preview-user-2'],
        },
    ],
    'preview-collab-project-1': [
        {
            id: 'preview-collab-project-1-reply-1',
            channelType: 'project',
            clientId: 'preview-tech-corp',
            projectId: 'preview-project-1',
            content: 'Use the flat blue for sales one-pagers and keep the gradient only in social or keynote surfaces.',
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
            parentMessageId: 'preview-collab-project-1',
            threadRootId: 'preview-collab-project-1',
            readBy: [PREVIEW_SELF_TOKEN],
            deliveredTo: [PREVIEW_SELF_TOKEN, 'preview-user-1', 'preview-user-2'],
        },
        {
            id: 'preview-collab-project-1-reply-2',
            channelType: 'project',
            clientId: 'preview-tech-corp',
            projectId: 'preview-project-1',
            content: 'I\'ll export both header options and label them clearly so the handoff stays clean.',
            senderId: 'preview-user-7',
            senderName: 'Mia Thompson',
            senderRole: 'Brand Designer',
            createdAt: isoDaysAgo(0),
            updatedAt: isoDaysAgo(0),
            isEdited: false,
            deletedAt: null,
            deletedBy: null,
            isDeleted: false,
            format: 'markdown',
            parentMessageId: 'preview-collab-project-1',
            threadRootId: 'preview-collab-project-1',
            reactions: [{ emoji: '👌', count: 1, userIds: ['preview-user-2'] }],
            readBy: [],
            deliveredTo: [PREVIEW_SELF_TOKEN, 'preview-user-1', 'preview-user-2', 'preview-user-7'],
        },
    ],
    'preview-collab-client-4': [
        {
            id: 'preview-collab-client-4-reply-1',
            channelType: 'client',
            clientId: 'preview-startupxyz',
            projectId: null,
            content: 'I\'ll send the moderation matrix and escalation contacts within the hour. Noah is finalizing the lifecycle fallback paths too.',
            senderId: 'preview-user-9',
            senderName: 'Lena Ortiz',
            senderRole: 'Lifecycle Strategist',
            createdAt: isoDaysAgo(0),
            updatedAt: isoDaysAgo(0),
            isEdited: false,
            deletedAt: null,
            deletedBy: null,
            isDeleted: false,
            format: 'markdown',
            parentMessageId: 'preview-collab-client-4',
            threadRootId: 'preview-collab-client-4',
            readBy: [PREVIEW_SELF_TOKEN],
            deliveredTo: [PREVIEW_SELF_TOKEN, 'preview-user-3', 'preview-user-9'],
        },
        {
            id: 'preview-collab-client-4-reply-2',
            channelType: 'client',
            clientId: 'preview-startupxyz',
            projectId: null,
            content: 'Excellent. I\'ll keep the client note concise and link the matrix instead of pasting it inline.',
            senderId: 'preview-user-3',
            senderName: 'Priya Patel',
            senderRole: 'Account Manager',
            createdAt: isoDaysAgo(0),
            updatedAt: isoDaysAgo(0),
            isEdited: false,
            deletedAt: null,
            deletedBy: null,
            isDeleted: false,
            format: 'markdown',
            parentMessageId: 'preview-collab-client-4',
            threadRootId: 'preview-collab-client-4',
            readBy: [],
            deliveredTo: [PREVIEW_SELF_TOKEN, 'preview-user-3', 'preview-user-9'],
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

function selectPreviewChannelResponder(
    channelType: CollaborationChannelType,
    clientId: string | null,
    projectId: string | null,
    viewerId?: string | null,
): PreviewCollaborationParticipant {
    const preferredParticipantId =
        channelType === 'team'
            ? 'preview-user-5'
            : channelType === 'project' && projectId === 'preview-project-1'
                ? 'preview-user-2'
                : channelType === 'project' && projectId === 'preview-project-5'
                    ? 'preview-user-4'
                    : channelType === 'client' && clientId === 'preview-startupxyz'
                        ? 'preview-user-3'
                        : channelType === 'client' && clientId === 'preview-retail-store'
                            ? 'preview-user-5'
                            : 'preview-user-1'

    const preferred = PREVIEW_PARTICIPANTS.find((participant) => participant.id === preferredParticipantId)
    if (preferred && preferred.id !== viewerId) {
        return preferred
    }

    return PREVIEW_PARTICIPANTS.find((participant) => participant.id !== viewerId) ?? PREVIEW_PARTICIPANTS[0]!
}

function buildPreviewAutoReplyContent(content: string, responderName: string): string {
    const normalized = content.trim().toLowerCase()

    if (normalized.includes('timeline') || normalized.includes('schedule') || normalized.includes('when')) {
        return `${responderName}: for the sample timeline, kickoff stays on Monday, internal review lands mid-week, and the client-ready deck can go out Friday morning.`
    }

    if (normalized.includes('budget') || normalized.includes('spend') || normalized.includes('pacing')) {
        return `${responderName}: sample pacing still looks healthy. I would hold spend flat for now and push the next budget move after the retargeting review.`
    }

    if (normalized.includes('launch') || normalized.includes('ship') || normalized.includes('publish')) {
        return `${responderName}: for the demo flow, I would lock approvals today, QA tomorrow, and keep the post-launch recap draft ready before we publish.`
    }

    if (normalized.includes('approve') || normalized.includes('review') || normalized.includes('feedback')) {
        return `${responderName}: looks solid from the sample side. I would mark this ready for review and add one short stakeholder summary before sharing.`
    }

    return `${responderName}: received. I added a sample follow-up so the conversation stays active during the demo.`
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
        const lastMessage = messages.reduce<typeof messages[number] | null>((latest, message) => {
            if (latest === null || message.createdAtMs > latest.createdAtMs) {
                return message
            }

            return latest
        }, null)
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

export function getPreviewCollaborationAutoReply(params: {
    channelType: CollaborationChannelType
    clientId: string | null
    projectId: string | null
    content: string
    viewerId?: string | null
    parentMessageId?: string | null
    threadRootId?: string | null
    createdAt?: Date
}): CollaborationMessage {
    const responder = selectPreviewChannelResponder(
        params.channelType,
        params.clientId,
        params.projectId,
        params.viewerId,
    )
    const timestamp = params.createdAt ?? new Date()
    const createdAt = timestamp.toISOString()

    return {
        id: `preview-collab-reply-${timestamp.getTime()}`,
        channelType: params.channelType,
        clientId: params.clientId,
        projectId: params.projectId,
        content: buildPreviewAutoReplyContent(params.content, responder.name),
        senderId: responder.id,
        senderName: responder.name,
        senderRole: responder.role,
        createdAt,
        updatedAt: createdAt,
        isEdited: false,
        deletedAt: null,
        deletedBy: null,
        isDeleted: false,
        format: 'markdown',
        reactions: [],
        readBy: params.viewerId ? [params.viewerId] : undefined,
        deliveredTo: params.viewerId ? [params.viewerId, responder.id] : [responder.id],
        parentMessageId: params.parentMessageId ?? null,
        threadRootId: params.threadRootId ?? null,
    }
}

export function getPreviewDirectAutoReply(params: {
    conversationLegacyId: string
    otherParticipantId: string
    otherParticipantName: string
    otherParticipantRole?: string | null
    content: string
    currentUserId?: string | null
    createdAt?: number
}): DirectMessage {
    const timestamp = params.createdAt ?? Date.now()
    const responder = PREVIEW_PARTICIPANTS.find((participant) => participant.id === params.otherParticipantId)

    return {
        id: `preview-dm-auto-reply-${timestamp}`,
        legacyId: `preview-dm-auto-reply-${timestamp}`,
        senderId: params.otherParticipantId,
        senderName: responder?.name ?? params.otherParticipantName,
        senderRole: responder?.role ?? params.otherParticipantRole ?? null,
        content: buildPreviewAutoReplyContent(params.content, responder?.name ?? params.otherParticipantName),
        edited: false,
        editedAtMs: null,
        deleted: false,
        deletedAtMs: null,
        deletedBy: null,
        attachments: null,
        reactions: null,
        readBy: params.currentUserId ? [params.currentUserId] : [],
        deliveredTo: params.currentUserId ? [params.currentUserId, params.otherParticipantId] : [params.otherParticipantId],
        readAtMs: params.currentUserId ? timestamp : null,
        sharedTo: null,
        createdAtMs: timestamp,
        updatedAtMs: timestamp,
    }
}
