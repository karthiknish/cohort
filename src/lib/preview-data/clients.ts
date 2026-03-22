import type { ClientRecord, MetricRecord } from './types'
import { isoDaysAgo } from './utils'

export function getPreviewClients(): ClientRecord[] {
    // During SSR, use a fixed date to prevent hydration mismatches
    const now = typeof window === 'undefined'
        ? '2024-01-15T12:00:00.000Z'
        : new Date().toISOString()
    return [
        {
            id: 'preview-tech-corp',
            name: 'Tech Corp',
            accountManager: 'Alex Morgan',
            teamMembers: [
                { name: 'Alex Morgan', role: 'Account Manager' },
                { name: 'Jordan Lee', role: 'Strategist' },
            ],
            createdAt: now,
            updatedAt: now,
        },
        {
            id: 'preview-startupxyz',
            name: 'StartupXYZ',
            accountManager: 'Priya Patel',
            teamMembers: [
                { name: 'Priya Patel', role: 'Account Manager' },
                { name: 'Sam Chen', role: 'Performance Marketer' },
            ],
            createdAt: now,
            updatedAt: now,
        },
        {
            id: 'preview-retail-store',
            name: 'Retail Store',
            accountManager: 'Taylor Kim',
            teamMembers: [
                { name: 'Taylor Kim', role: 'Account Manager' },
                { name: 'Casey Rivera', role: 'Creative' },
            ],
            createdAt: now,
            updatedAt: now,
        },
    ]
}

export function getPreviewMetrics(clientId: string | null): MetricRecord[] {
    const clients = getPreviewClients()
    const activeIds = clientId ? [clientId] : clients.map((c) => c.id)

    const base: Array<{ spend: number; impressions: number; clicks: number; conversions: number; revenue: number }> = [
        { spend: 220, impressions: 42000, clicks: 820, conversions: 34, revenue: 3400 },
        { spend: 260, impressions: 47000, clicks: 880, conversions: 39, revenue: 3800 },
        { spend: 240, impressions: 45000, clicks: 860, conversions: 36, revenue: 3600 },
        { spend: 310, impressions: 52000, clicks: 990, conversions: 44, revenue: 4300 },
        { spend: 280, impressions: 50000, clicks: 940, conversions: 41, revenue: 4000 },
        { spend: 330, impressions: 56000, clicks: 1040, conversions: 48, revenue: 4700 },
        { spend: 300, impressions: 54000, clicks: 1010, conversions: 46, revenue: 4550 },
    ]

    const records: MetricRecord[] = []
    activeIds.forEach((id, clientIndex) => {
        base.forEach((day, idx) => {
            const multiplier = 1 + clientIndex * 0.12
            records.push({
                id: `preview-metric-${id}-${idx}`,
                providerId: 'preview',
                clientId: id,
                date: isoDaysAgo(6 - idx),
                createdAt: isoDaysAgo(6 - idx),
                spend: Math.round(day.spend * multiplier),
                impressions: Math.round(day.impressions * multiplier),
                clicks: Math.round(day.clicks * multiplier),
                conversions: Math.round(day.conversions * multiplier),
                revenue: Math.round(day.revenue * multiplier),
            })
        })
    })

    return records
}

export type PreviewClientSummary = {
    legacyId: string
    name: string
    accountManager: string
    teamMembersCount: number
    openTaskCount: number
    activeProjectCount: number
    nextMeetingMs: number | null
}

export function getPreviewClientSummaries(): PreviewClientSummary[] {
    const clients = getPreviewClients()
    const now = typeof window === 'undefined'
        ? new Date('2024-01-15T12:00:00.000Z')
        : new Date()

    return [
        {
            legacyId: clients[0]?.id ?? 'preview-tech-corp',
            name: clients[0]?.name ?? 'Tech Corp',
            accountManager: clients[0]?.accountManager ?? 'Alex Morgan',
            teamMembersCount: clients[0]?.teamMembers.length ?? 2,
            openTaskCount: 7,
            activeProjectCount: 2,
            nextMeetingMs: new Date(now.getTime() + 2 * 60 * 60 * 1000).getTime(),
        },
        {
            legacyId: clients[1]?.id ?? 'preview-startupxyz',
            name: clients[1]?.name ?? 'StartupXYZ',
            accountManager: clients[1]?.accountManager ?? 'Priya Patel',
            teamMembersCount: clients[1]?.teamMembers.length ?? 2,
            openTaskCount: 5,
            activeProjectCount: 1,
            nextMeetingMs: new Date(now.getTime() + 26 * 60 * 60 * 1000).getTime(),
        },
        {
            legacyId: clients[2]?.id ?? 'preview-retail-store',
            name: clients[2]?.name ?? 'Retail Store',
            accountManager: clients[2]?.accountManager ?? 'Taylor Kim',
            teamMembersCount: clients[2]?.teamMembers.length ?? 2,
            openTaskCount: 3,
            activeProjectCount: 1,
            nextMeetingMs: null,
        },
    ]
}
