import type { ClientRecord } from '@/types/clients'
import type { FinanceSummaryResponse } from '@/types/finance'
import type { MetricRecord } from '@/types/dashboard'
import type { TaskRecord } from '@/types/tasks'
import type { ProjectRecord } from '@/types/projects'
import type { CollaborationMessage } from '@/types/collaboration'
import type { WorkspaceNotification } from '@/types/notifications'
import type { Activity } from '@/types/activity'

// Re-export imported types for convenience
export type {
    ClientRecord,
    FinanceSummaryResponse,
    MetricRecord,
    TaskRecord,
    ProjectRecord,
    CollaborationMessage,
    WorkspaceNotification,
    Activity,
}

/**
 * Analytics-specific preview metrics with real provider IDs for platform filtering
 */
export interface PreviewAnalyticsMetric {
    id: string
    providerId: string
    date: string
    spend: number
    impressions: number
    clicks: number
    conversions: number
    revenue: number | null
    creatives?: Array<{
        id: string
        name: string
        type: string
        url?: string
        spend?: number
        impressions?: number
        clicks?: number
        conversions?: number
        revenue?: number
    }>
}

export interface PreviewProviderInsight {
    providerId: string
    summary: string
}

export interface PreviewAlgorithmicSuggestion {
    type: 'efficiency' | 'budget' | 'creative' | 'audience'
    level: 'success' | 'warning' | 'info' | 'critical'
    title: string
    message: string
    suggestion: string
    score?: number
}

export interface PreviewAlgorithmicInsight {
    providerId: string
    suggestions: PreviewAlgorithmicSuggestion[]
}

export type PreviewProposalDraft = {
    id: string
    clientId: string | null
    clientName: string | null
    status: 'draft' | 'ready'
    stepProgress: number
    formData: Record<string, unknown>
    aiSuggestions: string | null
    presentationDeck: { storageUrl: string | null; pptxUrl: string | null; shareUrl: string | null } | null
    pptUrl: string | null
    createdAt: string
    updatedAt: string
}

// Ads preview data types
export type PreviewAdsMetricRecord = {
    id: string
    providerId: string
    date: string
    spend: number
    impressions: number
    clicks: number
    conversions: number
    revenue: number | null
    createdAt: string | null
}

export type PreviewAdsIntegrationStatus = {
    providerId: string
    status: string
    lastSyncedAt: string | null
    lastSyncRequestedAt: string | null
    message: string | null
    linkedAt: string | null
    accountId: string | null
    autoSyncEnabled: boolean
    syncFrequencyMinutes: number
    scheduledTimeframeDays: number
}

export type PreviewCampaign = {
    id: string
    name: string
    providerId: string
    status: string
    budget?: number
    budgetType?: string
    currency?: string
    objective?: string
    startTime?: string
    stopTime?: string
}

export type PreviewCampaignInsights = {
    providerId: string
    campaignId: string
    startDate: string
    endDate: string
    currency?: string
    totals: {
        spend: number
        impressions: number
        clicks: number
        conversions: number
        revenue: number
        reach: number | null
    }
    series: Array<{
        date: string
        spend: number
        impressions: number
        clicks: number
        conversions: number
        revenue: number
        reach: number | null
    }>
    insights: {
        providerId: string
        calculatedMetrics: Record<string, number | null>
        insights: Array<{
            type: string
            level: 'success' | 'info' | 'warning' | 'error'
            metric: string
            value?: number | null
            benchmark?: number | null
            message: string
            recommendation?: string
        }>
        calculatedAt: string
    }
}
