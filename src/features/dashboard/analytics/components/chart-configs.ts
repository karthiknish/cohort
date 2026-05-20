import type { ChartConfig } from '@/shared/ui/chart'

/** Site theme chart palette (--chart-1 … --chart-5 in globals.css) */
const CHART_1 = 'var(--chart-1)'
const CHART_2 = 'var(--chart-2)'
const CHART_3 = 'var(--chart-3)'
const CHART_4 = 'var(--chart-4)'

export const usersSessionsChartConfig = {
  users: {
    label: 'Users',
    color: CHART_1,
  },
  sessions: {
    label: 'Sessions',
    color: CHART_2,
  },
} satisfies ChartConfig

export const revenueChartConfig = {
  revenue: {
    label: 'Revenue',
    color: CHART_4,
  },
} satisfies ChartConfig

export const conversionsChartConfig = {
  conversions: {
    label: 'Conversions',
    color: CHART_3,
  },
} satisfies ChartConfig

export const conversionRateChartConfig = {
  conversionRate: {
    label: 'Conversion rate',
    color: CHART_2,
  },
} satisfies ChartConfig
