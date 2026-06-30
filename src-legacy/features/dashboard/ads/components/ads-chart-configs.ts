import type { ChartConfig } from '@/shared/ui/chart';
/** Site theme palette (--chart-1 … --chart-5 in globals.css) */
const C1 = 'var(--chart-1)';
const C2 = 'var(--chart-2)';
const C3 = 'var(--chart-3)';
const C4 = 'var(--chart-4)';
const C5 = 'var(--chart-5)';
export const providerComparisonChartConfig = {
    spend: {
        label: 'Spend',
        color: C1,
    },
    revenue: {
        label: 'Revenue',
        color: C4,
    },
} satisfies ChartConfig;
export const spendTrendChartConfig = {
    actual: {
        label: 'Actual spend',
        color: C1,
    },
    trend: {
        label: 'Trend (EMA)',
        color: C2,
    },
} satisfies ChartConfig;
export const efficiencyRadarChartConfig = {
    score: {
        label: 'Efficiency score',
        color: C3,
    },
} satisfies ChartConfig;
export const funnelVolumeChartConfig = {
    impressions: {
        label: 'Impressions',
        color: C1,
    },
    clicks: {
        label: 'Clicks',
        color: C2,
    },
    conversions: {
        label: 'Conversions',
        color: C3,
    },
} satisfies ChartConfig;
export const benchmarkChartConfig = {
    percentile: {
        label: 'Your performance',
        color: C3,
    },
    benchmark: {
        label: 'Industry average',
        color: C5,
    },
} satisfies ChartConfig;
export const FUNNEL_STAGE_THEME_KEYS = ['impressions', 'clicks', 'conversions'] as const;
export type FunnelStageThemeKey = (typeof FUNNEL_STAGE_THEME_KEYS)[number];
export function funnelStageThemeKey(index: number): FunnelStageThemeKey {
    return FUNNEL_STAGE_THEME_KEYS[index] ?? 'impressions';
}
export function funnelStageThemeColor(index: number): string {
    const key = funnelStageThemeKey(index);
    return funnelVolumeChartConfig[key].color ?? C1;
}
/** Resolved hex fills for SVG trapezoids (CSS variables are unreliable inside Recharts paths). */
export const FUNNEL_STAGE_HEX_FILLS = ['#2563eb', '#0ea5e9', '#3b82f6'] as const;
export function funnelStageHexFill(index: number): string {
    return FUNNEL_STAGE_HEX_FILLS[index] ?? FUNNEL_STAGE_HEX_FILLS[0];
}
