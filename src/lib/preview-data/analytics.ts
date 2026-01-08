import type {
    PreviewAnalyticsMetric,
    PreviewProviderInsight,
    PreviewAlgorithmicInsight,
} from './types'
import { isoDaysAgo } from './utils'

export function getPreviewAnalyticsMetrics(): PreviewAnalyticsMetric[] {
    const providers = ['google', 'facebook', 'linkedin']

    const baseData: Record<string, Array<{ spend: number; impressions: number; clicks: number; conversions: number; revenue: number }>> = {
        google: [
            { spend: 850, impressions: 125000, clicks: 2800, conversions: 95, revenue: 9500 },
            { spend: 920, impressions: 132000, clicks: 3100, conversions: 108, revenue: 10800 },
            { spend: 780, impressions: 118000, clicks: 2650, conversions: 88, revenue: 8800 },
            { spend: 1050, impressions: 145000, clicks: 3400, conversions: 125, revenue: 12500 },
            { spend: 940, impressions: 138000, clicks: 3200, conversions: 112, revenue: 11200 },
            { spend: 1100, impressions: 152000, clicks: 3600, conversions: 135, revenue: 13500 },
            { spend: 980, impressions: 142000, clicks: 3300, conversions: 118, revenue: 11800 },
        ],
        facebook: [
            { spend: 620, impressions: 185000, clicks: 4200, conversions: 72, revenue: 7200 },
            { spend: 680, impressions: 198000, clicks: 4600, conversions: 82, revenue: 8200 },
            { spend: 590, impressions: 175000, clicks: 3900, conversions: 65, revenue: 6500 },
            { spend: 750, impressions: 215000, clicks: 5100, conversions: 95, revenue: 9500 },
            { spend: 710, impressions: 205000, clicks: 4800, conversions: 88, revenue: 8800 },
            { spend: 820, impressions: 228000, clicks: 5400, conversions: 105, revenue: 10500 },
            { spend: 760, impressions: 218000, clicks: 5200, conversions: 98, revenue: 9800 },
        ],
        linkedin: [
            { spend: 420, impressions: 32000, clicks: 680, conversions: 28, revenue: 5600 },
            { spend: 480, impressions: 36000, clicks: 780, conversions: 35, revenue: 7000 },
            { spend: 380, impressions: 28000, clicks: 590, conversions: 22, revenue: 4400 },
            { spend: 520, impressions: 42000, clicks: 890, conversions: 42, revenue: 8400 },
            { spend: 460, impressions: 38000, clicks: 820, conversions: 38, revenue: 7600 },
            { spend: 550, impressions: 45000, clicks: 950, conversions: 48, revenue: 9600 },
            { spend: 500, impressions: 40000, clicks: 860, conversions: 42, revenue: 8400 },
        ],
    }

    const records: PreviewAnalyticsMetric[] = []

    providers.forEach((provider) => {
        const providerData = baseData[provider]
        providerData.forEach((day, idx) => {
            const metric: PreviewAnalyticsMetric = {
                id: `preview-analytics-${provider}-${idx}`,
                providerId: provider,
                date: isoDaysAgo(6 - idx).split('T')[0],
                spend: day.spend,
                impressions: day.impressions,
                clicks: day.clicks,
                conversions: day.conversions,
                revenue: day.revenue,
            }

            // Add creatives for Facebook metrics
            if (provider === 'facebook') {
                metric.creatives = [
                    {
                        id: `creative-${provider}-${idx}-1`,
                        name: 'Summer Sale Banner',
                        type: 'image',
                        spend: Math.round(day.spend * 0.4),
                        impressions: Math.round(day.impressions * 0.4),
                        clicks: Math.round(day.clicks * 0.4),
                        conversions: Math.round(day.conversions * 0.4),
                        revenue: Math.round(day.revenue * 0.4),
                    },
                    {
                        id: `creative-${provider}-${idx}-2`,
                        name: 'Product Showcase Video',
                        type: 'video',
                        spend: Math.round(day.spend * 0.35),
                        impressions: Math.round(day.impressions * 0.35),
                        clicks: Math.round(day.clicks * 0.35),
                        conversions: Math.round(day.conversions * 0.35),
                        revenue: Math.round(day.revenue * 0.35),
                    },
                    {
                        id: `creative-${provider}-${idx}-3`,
                        name: 'Carousel Collection',
                        type: 'carousel',
                        spend: Math.round(day.spend * 0.25),
                        impressions: Math.round(day.impressions * 0.25),
                        clicks: Math.round(day.clicks * 0.25),
                        conversions: Math.round(day.conversions * 0.25),
                        revenue: Math.round(day.revenue * 0.25),
                    },
                ]
            }

            records.push(metric)
        })
    })

    return records
}

export function getPreviewAnalyticsInsights(): {
    insights: PreviewProviderInsight[]
    algorithmic: PreviewAlgorithmicInsight[]
} {
    const insights: PreviewProviderInsight[] = [
        {
            providerId: 'google',
            summary: 'Google Ads is performing exceptionally well with a 12.5x ROAS. Your search campaigns are driving high-intent traffic with a 3.5% conversion rate. Consider increasing budget allocation to capture more market share during peak hours.',
        },
        {
            providerId: 'facebook',
            summary: 'Meta Ads shows strong engagement metrics with video content outperforming static images by 45%. Your retargeting audiences are converting at 2.8x the rate of cold traffic. Lookalike audiences based on recent converters could expand reach efficiently.',
        },
        {
            providerId: 'linkedin',
            summary: 'LinkedIn Ads delivers the highest quality leads with a $185 average deal value. B2B targeting is precise, though CPCs remain elevated. Consider testing Sponsored InMail for decision-maker outreach.',
        },
    ]

    const algorithmic: PreviewAlgorithmicInsight[] = [
        {
            providerId: 'google',
            suggestions: [
                {
                    type: 'efficiency',
                    level: 'success',
                    title: 'Strong ROAS Performance',
                    message: 'Your Google Ads campaigns are generating $12.50 for every $1 spent, well above the industry benchmark of $4.',
                    suggestion: 'Increase daily budget by 20% to capture additional high-converting traffic.',
                    score: 92,
                },
                {
                    type: 'audience',
                    level: 'info',
                    title: 'Audience Expansion Opportunity',
                    message: 'Similar audiences to your top converters show 85% match rate.',
                    suggestion: 'Test expanding to in-market audiences for related product categories.',
                },
            ],
        },
        {
            providerId: 'facebook',
            suggestions: [
                {
                    type: 'creative',
                    level: 'warning',
                    title: 'Creative Fatigue Detected',
                    message: 'Top performing creatives have been running for 14+ days with declining CTR.',
                    suggestion: 'Refresh ad creative with new variants to maintain engagement rates.',
                    score: 68,
                },
                {
                    type: 'budget',
                    level: 'success',
                    title: 'Efficient Spend Allocation',
                    message: 'Your CPA of $8.43 is 32% below your target of $12.50.',
                    suggestion: 'Reallocate budget from underperforming ad sets to top performers.',
                    score: 85,
                },
            ],
        },
        {
            providerId: 'global',
            suggestions: [
                {
                    type: 'budget',
                    level: 'info',
                    title: 'Cross-Platform Optimization',
                    message: 'Google drives 48% of conversions with 35% of spend, while LinkedIn has highest CPL.',
                    suggestion: 'Shift 10% of LinkedIn budget to Google for better overall efficiency.',
                    score: 78,
                },
            ],
        },
    ]

    return { insights, algorithmic }
}
