import type { ChartConfig } from '@/components/ui/chart'

export const revenueSpendChartConfig = {
    revenue: {
        label: 'Revenue',
        color: 'hsl(160 84% 39%)', // Emerald-500
    },
    spend: {
        label: 'Spend',
        color: 'hsl(0 84% 60%)', // Red-500
    },
} satisfies ChartConfig

export const roasChartConfig = {
    roas: {
        label: 'ROAS',
        color: 'hsl(239 84% 67%)', // Indigo-500
    },
} satisfies ChartConfig

export const clicksChartConfig = {
    clicks: {
        label: 'Clicks',
        color: 'hsl(38 92% 50%)', // Amber-500
    },
} satisfies ChartConfig

export const platformChartConfig = {
    google: {
        label: 'Google Ads',
        color: 'hsl(217 91% 60%)', // Blue
    },
    facebook: {
        label: 'Meta Ads',
        color: 'hsl(214 89% 52%)', // Facebook Blue
    },
    linkedin: {
        label: 'LinkedIn Ads',
        color: 'hsl(239 84% 67%)', // Indigo
    },
    tiktok: {
        label: 'TikTok Ads',
        color: 'hsl(339 80% 55%)', // Pink
    },
} satisfies ChartConfig
