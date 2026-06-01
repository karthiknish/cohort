import type { ChartConfig } from '@/shared/ui/chart';
import { CHART_COLORS } from '@/lib/colors';
export const CHART_MARGIN = { left: 12, right: 12, top: 8, bottom: 8 };
export const TICK_STYLE = { fontSize: 12 };
export const AREA_CURSOR = { strokeDasharray: '3 3' };
export const AREA_ACTIVE_DOT = { r: 5, strokeWidth: 0 };
export const BAR_REACH_CURSOR = { fill: 'var(--color-reach)', opacity: 0.1 };
export const engagementChartConfig = {
    clicks: {
        label: 'Clicks',
        color: CHART_COLORS.hsl.blue,
    },
    ctr: {
        label: 'CTR',
        color: CHART_COLORS.hsl.emerald,
    },
} satisfies ChartConfig;
export const conversionsChartConfig = {
    conversions: {
        label: 'Conversions',
        color: CHART_COLORS.hsl.emerald,
    },
    revenue: {
        label: 'Revenue',
        color: CHART_COLORS.hsl.indigo,
    },
} satisfies ChartConfig;
export const costChartConfig = {
    cpc: {
        label: 'CPC',
        color: CHART_COLORS.hsl.amber,
    },
    cpa: {
        label: 'CPA',
        color: CHART_COLORS.hsl.red,
    },
} satisfies ChartConfig;
export const reachChartConfig = {
    reach: {
        label: 'Reach',
        color: CHART_COLORS.hsl.blue,
    },
    impressions: {
        label: 'Impressions',
        color: CHART_COLORS.hsl.blue,
    },
} satisfies ChartConfig;
export type PerformanceMetricPoint = {
    date: string;
    spend: number;
    revenue: number;
};
export type EngagementChartPoint = {
    date: string;
    dateFormatted: string;
    clicks: number;
    impressions: number;
    ctr: number;
};
export type ConversionChartPoint = {
    date: string;
    dateFormatted: string;
    conversions: number;
    revenue: number;
    cpc: number;
    cpa: number;
};
export type ReachChartPoint = {
    date: string;
    dateFormatted: string;
    reach: number;
    impressions: number;
};
export type InsightsChartsSectionProps = {
    chartMetrics: PerformanceMetricPoint[];
    engagementChartData: EngagementChartPoint[];
    conversionsChartData: ConversionChartPoint[];
    reachChartData?: ReachChartPoint[];
    insightsLoading: boolean;
    currency?: string;
};
