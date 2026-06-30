import { formatProviderName } from '@/lib/themes';
import type { DeltaTone, MetricItem } from './types';
import { formatEnUsCurrency } from '@/lib/intl/formatters';
const AGENT_MESSAGE_WHOLE_NUMBER_FORMATTER = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
});
export function asRecord(value: unknown): Record<string, unknown> | null {
    return value && typeof value === 'object' && !Array.isArray(value)
        ? (value as Record<string, unknown>)
        : null;
}
export function asString(value: unknown): string | null {
    return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;
}
export function asNumber(value: unknown): number | null {
    return typeof value === 'number' && Number.isFinite(value) ? value : null;
}
export function asRecordArray(value: unknown): Record<string, unknown>[] {
    return Array.isArray(value)
        ? value.flatMap((item) => { const record = asRecord(item); return record !== null ? [record] : []; })
        : [];
}
export function compact<T>(items: Array<T | null>): T[] {
    return items.filter((item): item is T => item !== null);
}
export function resolveCurrencyCode(data: Record<string, unknown> | undefined): string {
    const code = asString(data?.currencyCode) ?? asString(data?.currency);
    if (!code)
        return 'USD';
    const normalized = code.toUpperCase();
    return /^[A-Z]{3}$/.test(normalized) ? normalized : 'USD';
}
export function formatCurrency(value: number, currencyCode = 'USD'): string {
    return formatEnUsCurrency(value, currencyCode, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
export function formatWholeNumber(value: number): string {
    return AGENT_MESSAGE_WHOLE_NUMBER_FORMATTER.format(value);
}
export function formatPercent(value: number): string {
    return `${value.toFixed(2)}%`;
}
export function formatCtrPercent(clicks: number | null, impressions: number | null, ctr: number | null): string | null {
    if (ctr === null)
        return null;
    if (impressions !== null && impressions > 0 && clicks !== null && clicks > impressions) {
        const normalized = Math.min(100, (Math.min(clicks, impressions) / impressions) * 100);
        return `${normalized.toFixed(2)}%`;
    }
    return formatPercent(ctr);
}
export function formatRatio(value: number): string {
    return `${value.toFixed(2)}x`;
}
export function formatLabel(value: string): string {
    return value
        .split(/[-_\s]+/)
        .flatMap((part) => (part ? [part.charAt(0).toUpperCase() + part.slice(1)] : []))
        .join(' ');
}
export function formatTaskDueDate(value: number | string | null): string | null {
    if (typeof value === 'number' && Number.isFinite(value)) {
        return new Date(value).toISOString().slice(0, 10);
    }
    if (typeof value === 'string' && value.trim().length > 0) {
        return value.trim();
    }
    return null;
}
export function formatDateValue(value: number | string | null): string | null {
    if (typeof value === 'number' && Number.isFinite(value)) {
        return new Date(value).toISOString().slice(0, 10);
    }
    if (typeof value === 'string' && value.trim().length > 0) {
        return value.trim();
    }
    return null;
}
export function formatDeltaPercent(value: number | null, digits = 1): string | null {
    if (value === null || !Number.isFinite(value) || Math.abs(value) < 0.01)
        return null;
    return `${value > 0 ? '+' : ''}${value.toFixed(digits)}%`;
}
export function getDeltaTone(value: number | null, invertTrend = false): DeltaTone {
    if (value === null || !Number.isFinite(value) || Math.abs(value) < 0.01)
        return 'neutral';
    const positive = value > 0;
    if (invertTrend)
        return positive ? 'negative' : 'positive';
    return positive ? 'positive' : 'negative';
}
export function buildMetricsFromAnalyticsTotals(totals: Record<string, unknown> | null, comparison: Record<string, unknown> | null, currencyCode = 'USD'): MetricItem[] {
    if (!totals)
        return [];
    const users = asNumber(totals.users);
    const sessions = asNumber(totals.sessions);
    const conversions = asNumber(totals.conversions);
    const revenue = asNumber(totals.revenue);
    const conversionRate = asNumber(totals.conversionRate);
    const revenuePerSession = asNumber(totals.revenuePerSession);
    const sessionsPerUser = asNumber(totals.sessionsPerUser);
    const deltaPercent = asRecord(comparison?.deltaPercent);
    return compact<MetricItem>([
        users !== null
            ? {
                label: 'Users',
                value: formatWholeNumber(users),
                numericValue: users,
                emphasis: 'primary',
                delta: formatDeltaPercent(asNumber(deltaPercent?.users)),
                deltaTone: getDeltaTone(asNumber(deltaPercent?.users)),
            }
            : null,
        sessions !== null
            ? {
                label: 'Sessions',
                value: formatWholeNumber(sessions),
                numericValue: sessions,
                emphasis: 'primary',
                delta: formatDeltaPercent(asNumber(deltaPercent?.sessions)),
                deltaTone: getDeltaTone(asNumber(deltaPercent?.sessions)),
            }
            : null,
        conversions !== null
            ? {
                label: 'Conversions',
                value: formatWholeNumber(conversions),
                numericValue: conversions,
                delta: formatDeltaPercent(asNumber(deltaPercent?.conversions)),
                deltaTone: getDeltaTone(asNumber(deltaPercent?.conversions)),
            }
            : null,
        revenue !== null
            ? {
                label: 'Revenue',
                value: formatCurrency(revenue, currencyCode),
                numericValue: revenue,
                emphasis: 'primary',
                delta: formatDeltaPercent(asNumber(deltaPercent?.revenue)),
                deltaTone: getDeltaTone(asNumber(deltaPercent?.revenue)),
            }
            : null,
        conversionRate !== null
            ? {
                label: 'Conversion Rate',
                value: formatPercent(conversionRate),
                numericValue: conversionRate,
                delta: formatDeltaPercent(asNumber(deltaPercent?.conversionRate)),
                deltaTone: getDeltaTone(asNumber(deltaPercent?.conversionRate)),
            }
            : null,
        revenuePerSession !== null && sessions !== null && sessions > 0
            ? {
                label: 'Revenue / Session',
                value: formatCurrency(revenuePerSession, currencyCode),
                numericValue: revenuePerSession,
            }
            : null,
        sessionsPerUser !== null && users !== null && users > 0
            ? {
                label: 'Sessions / User',
                value: sessionsPerUser.toFixed(2),
                numericValue: sessionsPerUser,
            }
            : null,
    ]);
}
export function buildMetricsFromTotals(totals: Record<string, unknown> | null, comparison: Record<string, unknown> | null, currencyCode = 'USD'): MetricItem[] {
    if (!totals)
        return [];
    const spend = asNumber(totals.spend);
    const revenue = asNumber(totals.revenue);
    const roas = asNumber(totals.roas);
    const impressions = asNumber(totals.impressions);
    const clicks = asNumber(totals.clicks);
    const ctr = asNumber(totals.ctr);
    const cpc = asNumber(totals.cpc);
    const cpa = asNumber(totals.cpa);
    const conversions = asNumber(totals.conversions);
    const deltaPercent = asRecord(comparison?.deltaPercent);
    return compact<MetricItem>([
        spend !== null
            ? {
                label: 'Spend',
                value: formatCurrency(spend, currencyCode),
                numericValue: spend,
                emphasis: 'primary',
                delta: formatDeltaPercent(asNumber(deltaPercent?.spend)),
                deltaTone: getDeltaTone(asNumber(deltaPercent?.spend), true),
            }
            : null,
        revenue !== null
            ? {
                label: 'Revenue',
                value: formatCurrency(revenue, currencyCode),
                numericValue: revenue,
                emphasis: 'primary',
                delta: formatDeltaPercent(asNumber(deltaPercent?.revenue)),
                deltaTone: getDeltaTone(asNumber(deltaPercent?.revenue)),
            }
            : null,
        roas !== null
            ? {
                label: 'ROAS',
                value: formatRatio(roas),
                numericValue: roas,
                emphasis: 'primary',
                delta: formatDeltaPercent(asNumber(deltaPercent?.roas)),
                deltaTone: getDeltaTone(asNumber(deltaPercent?.roas)),
            }
            : null,
        impressions !== null
            ? {
                label: 'Impressions',
                value: formatWholeNumber(impressions),
                numericValue: impressions,
                delta: formatDeltaPercent(asNumber(deltaPercent?.impressions)),
                deltaTone: getDeltaTone(asNumber(deltaPercent?.impressions)),
            }
            : null,
        clicks !== null
            ? {
                label: 'Clicks',
                value: formatWholeNumber(clicks),
                numericValue: clicks,
                delta: formatDeltaPercent(asNumber(deltaPercent?.clicks)),
                deltaTone: getDeltaTone(asNumber(deltaPercent?.clicks)),
            }
            : null,
        ctr !== null
            ? {
                label: 'CTR',
                value: formatCtrPercent(clicks, impressions, ctr) ?? formatPercent(ctr),
                numericValue: ctr,
                delta: formatDeltaPercent(asNumber(deltaPercent?.ctr)),
                deltaTone: getDeltaTone(asNumber(deltaPercent?.ctr)),
            }
            : null,
        cpc !== null && clicks !== null && clicks > 0
            ? {
                label: 'CPC',
                value: formatCurrency(cpc, currencyCode),
                numericValue: cpc,
            }
            : clicks !== null && clicks > 0
                ? { label: 'CPC', value: '—' }
                : null,
        cpa !== null && conversions !== null && conversions > 0
            ? {
                label: 'CPA',
                value: formatCurrency(cpa, currencyCode),
                numericValue: cpa,
            }
            : conversions !== null && conversions > 0
                ? { label: 'CPA', value: '—' }
                : null,
        conversions !== null
            ? {
                label: 'Conversions',
                value: formatWholeNumber(conversions),
                numericValue: conversions,
                delta: formatDeltaPercent(asNumber(deltaPercent?.conversions)),
                deltaTone: getDeltaTone(asNumber(deltaPercent?.conversions)),
            }
            : null,
    ]);
}
export function resolveTotals(data: Record<string, unknown>): Record<string, unknown> | null {
    const directTotals = asRecord(data.totals);
    if (directTotals)
        return directTotals;
    const metricsSummary = asRecord(data.metricsSummary);
    if (!metricsSummary)
        return null;
    return asRecord(metricsSummary.totals) ?? asRecord(asRecord(metricsSummary.summary)?.totals);
}
export function resolveMetricsAvailable(data: Record<string, unknown>): boolean | null {
    if (typeof data.metricsAvailable === 'boolean')
        return data.metricsAvailable;
    const count = asNumber(asRecord(data.metricsSummary)?.count);
    return count !== null ? count > 0 : null;
}
