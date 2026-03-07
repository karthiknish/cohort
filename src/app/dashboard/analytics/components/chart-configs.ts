import type { ChartConfig } from '@/components/ui/chart'
import { CHART_COLORS } from '@/lib/colors'

export const usersSessionsChartConfig = {
    users: {
        label: 'Users',
        color: CHART_COLORS.hsl.blue,
    },
    sessions: {
        label: 'Sessions',
        color: CHART_COLORS.hsl.indigo,
    },
} satisfies ChartConfig

export const revenueChartConfig = {
    revenue: {
        label: 'Revenue',
        color: CHART_COLORS.hsl.emerald,
    },
} satisfies ChartConfig

export const conversionsChartConfig = {
    conversions: {
        label: 'Conversions',
        color: CHART_COLORS.hsl.amber,
    },
} satisfies ChartConfig

export const conversionRateChartConfig = {
    conversionRate: {
        label: 'Conversion rate',
        color: CHART_COLORS.hsl.indigo,
    },
} satisfies ChartConfig
