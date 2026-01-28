import type { PreviewAdsMetricRecord, PreviewAdsIntegrationStatus, PreviewCampaign, PreviewCampaignInsights } from './types'
import { isoDaysAgo } from './utils'

// Preview campaigns for each provider
export function getPreviewCampaigns(providerId: string): PreviewCampaign[] {
    const campaignsByProvider: Record<string, PreviewCampaign[]> = {
        facebook: [
            {
                id: 'preview-fb-campaign-1',
                name: 'Summer Sale 2024',
                providerId: 'facebook',
                status: 'ACTIVE',
                budget: 5000,
                budgetType: 'daily',
                currency: 'GBP',
                objective: 'CONVERSIONS',
                startTime: isoDaysAgo(30),
                stopTime: undefined,
            },
            {
                id: 'preview-fb-campaign-2',
                name: 'Brand Awareness Q4',
                providerId: 'facebook',
                status: 'ACTIVE',
                budget: 15000,
                budgetType: 'lifetime',
                currency: 'GBP',
                objective: 'BRAND_AWARENESS',
                startTime: isoDaysAgo(45),
                stopTime: isoDaysAgo(-15),
            },
            {
                id: 'preview-fb-campaign-3',
                name: 'Retargeting - Cart Abandoners',
                providerId: 'facebook',
                status: 'PAUSED',
                budget: 2500,
                budgetType: 'daily',
                currency: 'GBP',
                objective: 'CONVERSIONS',
                startTime: isoDaysAgo(60),
                stopTime: undefined,
            },
        ],
        google: [
            {
                id: 'preview-google-campaign-1',
                name: 'Search - Brand Terms',
                providerId: 'google',
                status: 'ENABLED',
                budget: 3000,
                budgetType: 'DAILY',
                currency: 'USD',
                objective: 'SEARCH',
                startTime: isoDaysAgo(90),
                stopTime: undefined,
            },
            {
                id: 'preview-google-campaign-2',
                name: 'Display - Remarketing',
                providerId: 'google',
                status: 'ENABLED',
                budget: 2000,
                budgetType: 'DAILY',
                currency: 'USD',
                objective: 'DISPLAY',
                startTime: isoDaysAgo(30),
                stopTime: undefined,
            },
        ],
        linkedin: [
            {
                id: 'preview-linkedin-campaign-1',
                name: 'B2B Lead Generation',
                providerId: 'linkedin',
                status: 'ACTIVE',
                budget: 5000,
                budgetType: 'daily',
                currency: 'USD',
                objective: 'LEAD_GENERATION',
                startTime: isoDaysAgo(20),
                stopTime: undefined,
            },
        ],
        tiktok: [
            {
                id: 'preview-tiktok-campaign-1',
                name: 'Viral Product Launch',
                providerId: 'tiktok',
                status: 'ENABLE',
                budget: 10000,
                budgetType: 'BUDGET_MODE_TOTAL',
                currency: 'USD',
                objective: 'TRAFFIC',
                startTime: isoDaysAgo(14),
                stopTime: isoDaysAgo(-7),
            },
        ],
    }

    return campaignsByProvider[providerId] || []
}

// Generate preview insights for a specific campaign
export function getPreviewCampaignInsights(
    providerId: string,
    campaignId: string,
    startDate: string,
    endDate: string
): PreviewCampaignInsights {
    // Generate series data between dates
    const start = new Date(startDate)
    const end = new Date(endDate)
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1

    const series: PreviewCampaignInsights['series'] = []
    let totalSpend = 0
    let totalImpressions = 0
    let totalClicks = 0
    let totalConversions = 0
    let totalRevenue = 0
    let maxReach = 0

    for (let i = 0; i < days; i++) {
        const date = new Date(start)
        date.setDate(date.getDate() + i)
        const dateStr = date.toISOString().split('T')[0]!

        // Generate realistic daily metrics with some variance
        const baseSpend = 150 + Math.random() * 100
        const impressions = Math.round((baseSpend / 0.005) * (0.8 + Math.random() * 0.4))
        const clicks = Math.round(impressions * 0.025 * (0.8 + Math.random() * 0.4))
        const conversions = Math.round(clicks * 0.035 * (0.7 + Math.random() * 0.6))
        const revenue = Math.round(baseSpend * 2.8 * (0.8 + Math.random() * 0.4))
        const reach = Math.round(impressions * 0.7 * (0.9 + Math.random() * 0.2))

        series.push({
            date: dateStr,
            spend: Math.round(baseSpend * 100) / 100,
            impressions,
            clicks,
            conversions,
            revenue,
            reach,
        })

        totalSpend += baseSpend
        totalImpressions += impressions
        totalClicks += clicks
        totalConversions += conversions
        totalRevenue += revenue
        maxReach = Math.max(maxReach, reach)
    }

    // Calculate derived metrics
    const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0
    const cpc = totalClicks > 0 ? totalSpend / totalClicks : 0
    const cpa = totalConversions > 0 ? totalSpend / totalConversions : 0
    const roas = totalSpend > 0 ? totalRevenue / totalSpend : 0

    return {
        providerId,
        campaignId,
        startDate,
        endDate,
        currency: 'GBP',
        totals: {
            spend: Math.round(totalSpend * 100) / 100,
            impressions: totalImpressions,
            clicks: totalClicks,
            conversions: totalConversions,
            revenue: totalRevenue,
            reach: maxReach,
        },
        series,
        insights: {
            providerId,
            calculatedMetrics: {
                ctr,
                cpc,
                cpa,
                roas,
                conversionRate: totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0,
            },
            insights: [
                {
                    type: 'performance',
                    level: roas > 2.5 ? 'success' : roas > 1.5 ? 'info' : 'warning',
                    metric: 'roas',
                    value: roas,
                    benchmark: 2.5,
                    message: roas > 2.5
                        ? 'ROAS is performing above benchmark'
                        : 'ROAS could be improved',
                    recommendation: roas > 2.5
                        ? 'Consider scaling budget to maximize returns'
                        : 'Review targeting and creative performance',
                },
                {
                    type: 'efficiency',
                    level: ctr > 2 ? 'success' : ctr > 1 ? 'info' : 'warning',
                    metric: 'ctr',
                    value: ctr,
                    benchmark: 2.0,
                    message: ctr > 2
                        ? 'Click-through rate is strong'
                        : 'CTR has room for improvement',
                    recommendation: ctr > 2
                        ? 'Maintain current creative strategy'
                        : 'Test new ad creatives and copy variations',
                },
            ],
            calculatedAt: new Date().toISOString(),
        },
    }
}

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
            const data = providerData[providerId]!
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
