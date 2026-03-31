import type { AdminUserRecord, AdminUserRole } from '@/types/admin'
import type { ClientRecord } from '@/types/clients'
import type { FeatureItem, FeaturePriority, FeatureStatus } from '@/types/features'

import { getPreviewClients } from './clients'
import { isoDaysAgo } from './utils'

const PREVIEW_ADMIN_WORKSPACE_ID = 'preview-agency'
const PREVIEW_ADMIN_USER_ID = 'preview-admin-1'

function isoHoursAgo(hoursAgo: number): string {
    const base = typeof window === 'undefined'
        ? new Date('2024-01-15T12:00:00.000Z')
        : new Date()
    base.setHours(base.getHours() - hoursAgo)
    return base.toISOString()
}

function isoDateDaysAgo(daysAgo: number): string {
    return (isoDaysAgo(daysAgo).split('T')[0] ?? isoDaysAgo(daysAgo))
}

function clonePreviewClients(): ClientRecord[] {
    return getPreviewClients().map((client) => ({
        ...client,
        teamMembers: client.teamMembers.map((member) => ({ ...member })),
    }))
}

export type PreviewAdminInvitation = {
    id: string
    email: string
    role: AdminUserRole
    name: string | null
    message: string | null
    status: 'pending' | 'accepted' | 'expired' | 'revoked'
    effectiveStatus: 'pending' | 'accepted' | 'expired' | 'revoked'
    invitedBy: string
    invitedByName: string | null
    expiresAtMs: number
    createdAtMs: number
    acceptedAtMs: number | null
}

export type PreviewAdminProblemReport = {
    id: string
    userId: string | null
    userEmail: string | null
    userName: string | null
    workspaceId: string | null
    title: string
    description: string
    severity: string
    status: string
    fixed: boolean | null
    resolution: string | null
    createdAt: string
    updatedAt: string
}

export type PreviewAdminHealthCheck = {
    status: 'ok' | 'warning' | 'error'
    message?: string
    responseTime?: number
    metadata?: Record<string, unknown>
}

export type PreviewAdminHealthData = {
    status: 'healthy' | 'degraded' | 'unhealthy'
    timestamp: string
    uptime: number
    responseTime: number
    checks: Record<string, PreviewAdminHealthCheck>
    version: string
}

export type PreviewAdminUsageStats = {
    totalUsers: number
    activeUsersToday: number
    activeUsersWeek: number
    activeUsersMonth: number
    newUsersToday: number
    newUsersWeek: number
    totalProjects: number
    projectsThisWeek: number
    totalTasks: number
    tasksCompletedThisWeek: number
    totalClients: number
    activeClientsWeek: number
    agentConversations: number
    agentActionsThisWeek: number
    dailyActiveUsers: Array<{ date: string; count: number }>
    featureUsage: Array<{ feature: string; count: number; trend: number }>
}

export type PreviewAdminRecentActivity = {
    id: string
    type: 'user_joined' | 'client_created' | 'lead_received' | 'sync_completed' | 'error' | 'new_user_signup'
    title: string
    description: string
    timestamp: string
}

export type PreviewAdminDashboardData = {
    stats: {
        totalUsers: number
        activeUsers: number
        totalClients: number
        activeClients: number
        schedulerHealth: 'healthy' | 'warning' | 'error'
        lastSyncTime: string | null
        recentErrors: number
    }
    usageStats: PreviewAdminUsageStats
    activities: PreviewAdminRecentActivity[]
}

export function getPreviewAdminUsers(): AdminUserRecord[] {
    return [
        {
            id: PREVIEW_ADMIN_USER_ID,
            name: 'Avery Stone',
            email: 'avery@cohorts.app',
            role: 'admin',
            status: 'active',
            agencyId: PREVIEW_ADMIN_WORKSPACE_ID,
            createdAt: isoDaysAgo(180),
            updatedAt: isoHoursAgo(2),
            lastLoginAt: isoHoursAgo(1),
        },
        {
            id: 'preview-team-alex',
            name: 'Alex Morgan',
            email: 'alex@cohorts.app',
            role: 'team',
            status: 'active',
            agencyId: PREVIEW_ADMIN_WORKSPACE_ID,
            createdAt: isoDaysAgo(120),
            updatedAt: isoHoursAgo(4),
            lastLoginAt: isoHoursAgo(5),
        },
        {
            id: 'preview-team-jordan',
            name: 'Jordan Lee',
            email: 'jordan@cohorts.app',
            role: 'team',
            status: 'active',
            agencyId: PREVIEW_ADMIN_WORKSPACE_ID,
            createdAt: isoDaysAgo(98),
            updatedAt: isoHoursAgo(6),
            lastLoginAt: isoHoursAgo(8),
        },
        {
            id: 'preview-team-priya',
            name: 'Priya Patel',
            email: 'priya@cohorts.app',
            role: 'team',
            status: 'active',
            agencyId: PREVIEW_ADMIN_WORKSPACE_ID,
            createdAt: isoDaysAgo(91),
            updatedAt: isoHoursAgo(3),
            lastLoginAt: isoHoursAgo(2),
        },
        {
            id: 'preview-team-sam',
            name: 'Sam Chen',
            email: 'sam@cohorts.app',
            role: 'team',
            status: 'active',
            agencyId: PREVIEW_ADMIN_WORKSPACE_ID,
            createdAt: isoDaysAgo(76),
            updatedAt: isoHoursAgo(12),
            lastLoginAt: isoHoursAgo(12),
        },
        {
            id: 'preview-team-taylor',
            name: 'Taylor Kim',
            email: 'taylor@cohorts.app',
            role: 'team',
            status: 'active',
            agencyId: PREVIEW_ADMIN_WORKSPACE_ID,
            createdAt: isoDaysAgo(64),
            updatedAt: isoHoursAgo(7),
            lastLoginAt: isoHoursAgo(9),
        },
        {
            id: 'preview-team-casey',
            name: 'Casey Rivera',
            email: 'casey@cohorts.app',
            role: 'team',
            status: 'pending',
            agencyId: PREVIEW_ADMIN_WORKSPACE_ID,
            createdAt: isoDaysAgo(12),
            updatedAt: isoHoursAgo(14),
            lastLoginAt: null,
        },
        {
            id: 'preview-client-mia',
            name: 'Mia Lopez',
            email: 'mia@techcorp.example',
            role: 'client',
            status: 'active',
            agencyId: PREVIEW_ADMIN_WORKSPACE_ID,
            createdAt: isoDaysAgo(55),
            updatedAt: isoHoursAgo(18),
            lastLoginAt: isoDaysAgo(1),
        },
        {
            id: 'preview-client-noah',
            name: 'Noah Brooks',
            email: 'noah@retailstore.example',
            role: 'client',
            status: 'invited',
            agencyId: PREVIEW_ADMIN_WORKSPACE_ID,
            createdAt: isoDaysAgo(3),
            updatedAt: isoHoursAgo(22),
            lastLoginAt: null,
        },
    ]
}

export function getPreviewAdminClients(): ClientRecord[] {
    return clonePreviewClients()
}

export function getPreviewAdminInvitations(): PreviewAdminInvitation[] {
    const nowMs = typeof window === 'undefined'
        ? new Date('2024-01-15T12:00:00.000Z').getTime()
        : Date.now()

    return [
        {
            id: 'preview-invite-1',
            email: 'logan@techcorp.example',
            role: 'client',
            name: 'Logan Price',
            message: 'Client-side reporting access for the Q2 launch room.',
            status: 'pending',
            effectiveStatus: 'pending',
            invitedBy: PREVIEW_ADMIN_USER_ID,
            invitedByName: 'Avery Stone',
            createdAtMs: nowMs - 2 * 60 * 60 * 1000,
            expiresAtMs: nowMs + 5 * 24 * 60 * 60 * 1000,
            acceptedAtMs: null,
        },
        {
            id: 'preview-invite-2',
            email: 'nina@cohorts.app',
            role: 'team',
            name: 'Nina Hart',
            message: 'Join the paid media pod this week.',
            status: 'accepted',
            effectiveStatus: 'accepted',
            invitedBy: PREVIEW_ADMIN_USER_ID,
            invitedByName: 'Avery Stone',
            createdAtMs: nowMs - 6 * 24 * 60 * 60 * 1000,
            expiresAtMs: nowMs + 24 * 60 * 60 * 1000,
            acceptedAtMs: nowMs - 5 * 24 * 60 * 60 * 1000,
        },
        {
            id: 'preview-invite-3',
            email: 'ops@retailstore.example',
            role: 'client',
            name: null,
            message: null,
            status: 'expired',
            effectiveStatus: 'expired',
            invitedBy: PREVIEW_ADMIN_USER_ID,
            invitedByName: 'Avery Stone',
            createdAtMs: nowMs - 12 * 24 * 60 * 60 * 1000,
            expiresAtMs: nowMs - 5 * 24 * 60 * 60 * 1000,
            acceptedAtMs: null,
        },
        {
            id: 'preview-invite-4',
            email: 'former@startupxyz.example',
            role: 'client',
            name: 'Former Contact',
            message: 'Superseded by the new stakeholder invite.',
            status: 'revoked',
            effectiveStatus: 'revoked',
            invitedBy: PREVIEW_ADMIN_USER_ID,
            invitedByName: 'Avery Stone',
            createdAtMs: nowMs - 8 * 24 * 60 * 60 * 1000,
            expiresAtMs: nowMs + 2 * 24 * 60 * 60 * 1000,
            acceptedAtMs: null,
        },
    ]
}

export function getPreviewAdminProblemReports(): PreviewAdminProblemReport[] {
    return [
        {
            id: 'preview-report-1',
            userId: 'preview-client-mia',
            userEmail: 'mia@techcorp.example',
            userName: 'Mia Lopez',
            workspaceId: PREVIEW_ADMIN_WORKSPACE_ID,
            title: 'Proposal deck export stalled',
            description: 'The deck viewer loaded, but the export button never returned a file on Safari.',
            severity: 'high',
            status: 'open',
            fixed: false,
            resolution: null,
            createdAt: isoHoursAgo(7),
            updatedAt: isoHoursAgo(6),
        },
        {
            id: 'preview-report-2',
            userId: 'preview-team-jordan',
            userEmail: 'jordan@cohorts.app',
            userName: 'Jordan Lee',
            workspaceId: PREVIEW_ADMIN_WORKSPACE_ID,
            title: 'Meta reconnect flow needs clearer copy',
            description: 'The reconnect button worked, but the OAuth status message looked like an error state.',
            severity: 'medium',
            status: 'in-progress',
            fixed: false,
            resolution: 'Updated copy queued with the integrations refresh.',
            createdAt: isoHoursAgo(19),
            updatedAt: isoHoursAgo(4),
        },
        {
            id: 'preview-report-3',
            userId: 'preview-team-priya',
            userEmail: 'priya@cohorts.app',
            userName: 'Priya Patel',
            workspaceId: PREVIEW_ADMIN_WORKSPACE_ID,
            title: 'Task board filter mismatch resolved',
            description: 'Completed tasks stayed visible after switching clients until the query refreshed.',
            severity: 'low',
            status: 'resolved',
            fixed: true,
            resolution: 'Patched list invalidation after client changes.',
            createdAt: isoDaysAgo(2),
            updatedAt: isoHoursAgo(10),
        },
    ]
}

function buildFeature(id: string, title: string, status: FeatureStatus, priority: FeaturePriority, description: string): FeatureItem {
    return {
        id,
        title,
        description,
        status,
        priority,
        imageUrl: null,
        references: [
            {
                label: 'Demo brief',
                url: 'https://example.com/demo-brief',
            },
        ],
        createdAt: isoDaysAgo(14),
        updatedAt: isoHoursAgo(5),
    }
}

export function getPreviewAdminFeatures(): FeatureItem[] {
    return [
        buildFeature('preview-feature-1', 'Campaign pacing drill-down', 'backlog', 'high', 'Add a top-level pacing anomaly strip to the ads overview.'),
        buildFeature('preview-feature-2', 'Workspace tour checkpoints', 'planned', 'medium', 'Guide first-time users through integrations, tasks, and proposals in one flow.'),
        buildFeature('preview-feature-3', 'Meeting recap publishing', 'in_progress', 'high', 'Turn meeting transcripts into a structured recap with action items and owners.'),
        buildFeature('preview-feature-4', 'Client-ready export themes', 'completed', 'medium', 'Provide branded export themes for decks and PDF summaries.'),
    ]
}

export function getPreviewAdminDashboardData(): PreviewAdminDashboardData {
    const users = getPreviewAdminUsers()
    const clients = getPreviewAdminClients()

    return {
        stats: {
            totalUsers: users.length,
            activeUsers: users.filter((user) => user.status === 'active').length,
            totalClients: clients.length,
            activeClients: clients.length,
            schedulerHealth: 'warning',
            lastSyncTime: isoHoursAgo(1),
            recentErrors: 1,
        },
        usageStats: {
            totalUsers: users.length,
            activeUsersToday: 6,
            activeUsersWeek: 7,
            activeUsersMonth: 9,
            newUsersToday: 1,
            newUsersWeek: 2,
            totalProjects: 11,
            projectsThisWeek: 3,
            totalTasks: 42,
            tasksCompletedThisWeek: 18,
            totalClients: clients.length,
            activeClientsWeek: clients.length,
            agentConversations: 24,
            agentActionsThisWeek: 61,
            dailyActiveUsers: [
                { date: isoDateDaysAgo(6), count: 3 },
                { date: isoDateDaysAgo(5), count: 4 },
                { date: isoDateDaysAgo(4), count: 6 },
                { date: isoDateDaysAgo(3), count: 5 },
                { date: isoDateDaysAgo(2), count: 7 },
                { date: isoDateDaysAgo(1), count: 6 },
                { date: isoDateDaysAgo(0), count: 6 },
            ],
            featureUsage: [
                { feature: 'Proposals', count: 34, trend: 12 },
                { feature: 'Tasks', count: 29, trend: 8 },
                { feature: 'Meetings', count: 21, trend: 15 },
                { feature: 'Ads', count: 18, trend: -4 },
                { feature: 'Agent Mode', count: 14, trend: 19 },
            ],
        },
        activities: [
            {
                id: 'preview-activity-1',
                type: 'new_user_signup',
                title: 'New strategist joined',
                description: 'Nina Hart accepted her invite and opened the team workspace.',
                timestamp: isoHoursAgo(2),
            },
            {
                id: 'preview-activity-2',
                type: 'client_created',
                title: 'Retail Store workspace refreshed',
                description: 'The client roster and account owner were updated for the spring campaign cycle.',
                timestamp: isoHoursAgo(6),
            },
            {
                id: 'preview-activity-3',
                type: 'sync_completed',
                title: 'Nightly sync completed',
                description: 'Ads, analytics, and meeting integrations finished with one warning.',
                timestamp: isoHoursAgo(9),
            },
            {
                id: 'preview-activity-4',
                type: 'error',
                title: 'One retry queued',
                description: 'Meta OAuth refresh needs a second attempt for one workspace.',
                timestamp: isoHoursAgo(13),
            },
        ],
    }
}

export function getPreviewAdminHealthData(): PreviewAdminHealthData {
    return {
        status: 'degraded',
        timestamp: isoHoursAgo(0),
        uptime: 5 * 24 * 60 * 60 + 6 * 60 * 60,
        responseTime: 182,
        version: 'preview-demo',
        checks: {
            convex: {
                status: 'ok',
                responseTime: 42,
                metadata: { deployment: 'preview', region: 'local-demo' },
            },
            betterauth: {
                status: 'ok',
                responseTime: 24,
            },
            gemini: {
                status: 'warning',
                message: 'Preview mode is using simulated AI responses for demos.',
                responseTime: 88,
            },
            posthog: {
                status: 'ok',
                responseTime: 31,
            },
            brevo: {
                status: 'ok',
                responseTime: 36,
            },
            googleads: {
                status: 'ok',
                responseTime: 53,
            },
            googleanalytics: {
                status: 'ok',
                responseTime: 48,
            },
            metaads: {
                status: 'warning',
                message: 'One workspace needs a token refresh before the next scheduled sync.',
                responseTime: 96,
                metadata: { workspacesAffected: 1 },
            },
            linkedinads: {
                status: 'ok',
                responseTime: 44,
            },
            tiktokads: {
                status: 'ok',
                responseTime: 51,
            },
            googleworkspace: {
                status: 'ok',
                responseTime: 29,
            },
            livekit: {
                status: 'ok',
                responseTime: 33,
            },
            environment: {
                status: 'ok',
                metadata: { mode: 'preview', nodeEnv: 'development' },
            },
        },
    }
}