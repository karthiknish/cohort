import type { ChartConfig } from '@/components/ui/chart'
import { CHART_COLORS } from '@/lib/colors'

export const revenueSpendChartConfig = {
    revenue: {
        label: 'Revenue',
        color: CHART_COLORS.hsl.emerald,
    },
    spend: {
        label: 'Spend',
        color: CHART_COLORS.hsl.red,
    },
} satisfies ChartConfig

export const roasChartConfig = {
    roas: {
        label: 'ROAS',
        color: CHART_COLORS.hsl.indigo,
    },
} satisfies ChartConfig

export const clicksChartConfig = {
    clicks: {
        label: 'Clicks',
        color: CHART_COLORS.hsl.amber,
    },
} satisfies ChartConfig

export const platformChartConfig = {
    google: {
        label: 'Google Ads',
        color: CHART_COLORS.hsl.blue,
    },
    facebook: {
        label: 'Meta Ads',
        color: CHART_COLORS.hsl.facebook,
    },
    linkedin: {
        label: 'LinkedIn Ads',
        color: CHART_COLORS.hsl.indigo,
    },
    tiktok: {
        label: 'TikTok Ads',
        color: CHART_COLORS.hsl.pink,
    },
} satisfies ChartConfig
