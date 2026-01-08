import type { PreviewAdsMetricRecord, PreviewAdsIntegrationStatus } from './types'
import { isoDaysAgo } from './utils'

export function getPreviewAdsMetrics(): PreviewAdsMetricRecord[] {
    const providers = ['google', 'facebook', 'linkedin', 'tiktok']
    const metrics: PreviewAdsMetricRecord[] = []

    // Base metrics for different providers with varying performance
    const providerData: Record<string, { spendMultiplier: number; ctr: number; convRate: number; roasMultiplier: number }> = {
        google: { spendMultiplier: 1.0, ctr: 0.032, convRate: 0.045, roasMultiplier: 3.2 },
        facebook: { spendMultiplier: 0.8, ctr: 0.018, convRate: 0.028, roasMultiplier: 2.8 },
        linkedin: { spendMultiplier: 0.5, ctr: 0.008, convRate: 0.015, roasMultiplier: 4.1 },
        tiktok: { spendMultiplier: 0.6, ctr: 0.022, convRate: 0.022, roasMultiplier: 2.4 },
    }

    // Generate 30 days of data for each provider
    for (let day = 0; day < 30; day++) {
        providers.forEach((providerId) => {
            const data = providerData[providerId]
            const baseSpend = (150 + Math.random() * 100) * data.spendMultiplier
            const impressions = Math.round((baseSpend / 0.005) * (0.8 + Math.random() * 0.4))
            const clicks = Math.round(impressions * data.ctr * (0.8 + Math.random() * 0.4))
            const conversions = Math.round(clicks * data.convRate * (0.7 + Math.random() * 0.6))
            const revenue = Math.round(baseSpend * data.roasMultiplier * (0.8 + Math.random() * 0.4))

            metrics.push({
                id: `preview-ads-${providerId}-${day}`,
                providerId,
                date: isoDaysAgo(day),
                spend: Math.round(baseSpend * 100) / 100,
                impressions,
                clicks,
                conversions,
                revenue,
                createdAt: isoDaysAgo(day),
            })
        })
    }

    return metrics.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export function getPreviewAdsIntegrationStatuses(): PreviewAdsIntegrationStatus[] {
    return [
        {
            providerId: 'google',
            status: 'success',
            lastSyncedAt: isoDaysAgo(0),
            lastSyncRequestedAt: isoDaysAgo(0),
            message: null,
            linkedAt: isoDaysAgo(45),
            accountId: 'preview-google-123',
            autoSyncEnabled: true,
            syncFrequencyMinutes: 360,
            scheduledTimeframeDays: 30,
        },
        {
            providerId: 'facebook',
            status: 'success',
            lastSyncedAt: isoDaysAgo(0),
            lastSyncRequestedAt: isoDaysAgo(0),
            message: null,
            linkedAt: isoDaysAgo(30),
            accountId: 'preview-meta-456',
            autoSyncEnabled: true,
            syncFrequencyMinutes: 360,
            scheduledTimeframeDays: 30,
        },
        {
            providerId: 'linkedin',
            status: 'success',
            lastSyncedAt: isoDaysAgo(1),
            lastSyncRequestedAt: isoDaysAgo(1),
            message: null,
            linkedAt: isoDaysAgo(20),
            accountId: 'preview-linkedin-789',
            autoSyncEnabled: true,
            syncFrequencyMinutes: 720,
            scheduledTimeframeDays: 30,
        },
        {
            providerId: 'tiktok',
            status: 'success',
            lastSyncedAt: isoDaysAgo(0),
            lastSyncRequestedAt: isoDaysAgo(0),
            message: null,
            linkedAt: isoDaysAgo(15),
            accountId: 'preview-tiktok-012',
            autoSyncEnabled: true,
            syncFrequencyMinutes: 360,
            scheduledTimeframeDays: 30,
        },
    ]
}
