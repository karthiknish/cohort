export interface IntegrationStatusResponse {
    statuses: Array<{
        providerId: string
        status: string
        lastSyncedAt?: string | null
        lastSyncRequestedAt?: string | null
        message?: string | null
        linkedAt?: string | null
        accountId?: string | null
        autoSyncEnabled?: boolean | null
        syncFrequencyMinutes?: number | null
        scheduledTimeframeDays?: number | null
    }>
}

export interface MetricRecord {
    id: string
    providerId: string
    date: string
    spend: number
    impressions: number
    clicks: number
    conversions: number
    revenue?: number | null
    createdAt?: string | null
}

export interface MetricsResponse {
    metrics: MetricRecord[]
    nextCursor: string | null
}

export type ProviderSummary = {
    spend: number
    impressions: number
    clicks: number
    conversions: number
    revenue: number
}

export type Totals = {
    spend: number
    impressions: number
    clicks: number
    conversions: number
    revenue: number
}

export type ProviderAutomationFormState = {
    autoSyncEnabled: boolean
    syncFrequencyMinutes: number
    scheduledTimeframeDays: number
}
