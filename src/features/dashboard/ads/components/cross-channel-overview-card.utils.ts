import { aggregateMetricFinancials, formatAggregatedMoney, type MetricFinancialRow, } from '@/domain/ads/aggregate-financials';
import { normalizeAdsProviderId, type CanonicalAdsProviderId } from '@/domain/ads/provider';
import { formatCurrency } from '@/lib/utils';
import type { MetricRecord, MetricsSummary, SummaryCard, Totals } from './types';
import type { AdsMetricsDisplayState } from './ads-metrics-display-state';
const EMPTY_TOTALS: Totals = {
    spend: 0,
    impressions: 0,
    clicks: 0,
    conversions: 0,
    revenue: 0,
};
export function totalsHaveDeliveryActivity(totals: Totals): boolean {
    return (totals.spend > 0 ||
        totals.impressions > 0 ||
        totals.clicks > 0 ||
        totals.conversions > 0);
}
/** Sum server summary to connected (and optionally selected) providers only. */
export function totalsFromServerSummary(summary: MetricsSummary | null | undefined, connectedIds: CanonicalAdsProviderId[], selectedProviderIds: string[] = []): Totals | null {
    if (!summary)
        return null;
    const providers = summary.providers ?? {};
    const providerKeys = Object.keys(providers);
    const selected = new Set(selectedProviderIds.map((id) => normalizeAdsProviderId(id) ?? id));
    const connected = new Set(connectedIds);
    const keysToSum = (() => {
        if (selected.size > 0) {
            return providerKeys.filter((key) => selected.has(normalizeAdsProviderId(key) ?? key));
        }
        if (connected.size > 0) {
            return providerKeys.filter((key) => {
                const canonical = normalizeAdsProviderId(key);
                return canonical !== null && connected.has(canonical);
            });
        }
        return providerKeys;
    })();
    if (keysToSum.length === 0) {
        if (connected.size === 0 && selected.size === 0 && summary.totals) {
            return summary.totals;
        }
        return null;
    }
    return keysToSum.reduce<Totals>((acc, key) => {
        const row = providers[key];
        if (!row)
            return acc;
        acc.spend += Number(row.spend ?? 0);
        acc.impressions += Number(row.impressions ?? 0);
        acc.clicks += Number(row.clicks ?? 0);
        acc.conversions += Number(row.conversions ?? 0);
        acc.revenue += Number(row.revenue ?? 0);
        return acc;
    }, { ...EMPTY_TOTALS });
}
/** Prefer daily rows; fall back to one synthetic row from server summary for KPI cards. */
export function metricsForOverviewDisplay(dailyMetrics: MetricRecord[], summary: MetricsSummary | null | undefined, connectedIds: CanonicalAdsProviderId[], selectedProviderIds: string[], defaultCurrency?: string | null): MetricRecord[] {
    if (dailyMetrics.length > 0) {
        return dailyMetrics;
    }
    const totals = totalsFromServerSummary(summary, connectedIds, selectedProviderIds);
    if (!totals || !totalsHaveDeliveryActivity(totals)) {
        return [];
    }
    const providerId = (selectedProviderIds[0] ? normalizeAdsProviderId(selectedProviderIds[0]) : null) ??
        connectedIds[0] ??
        'unknown';
    return [
        {
            id: 'overview-summary',
            providerId,
            date: 'summary',
            spend: totals.spend,
            impressions: totals.impressions,
            clicks: totals.clicks,
            conversions: totals.conversions,
            revenue: totals.revenue,
            currency: defaultCurrency ?? null,
        },
    ];
}
export function buildCanonicalConnectedIds(rawIds: string[]): CanonicalAdsProviderId[] {
    const ids = rawIds.flatMap((id) => {
        const normalized = normalizeAdsProviderId(id);
        return normalized !== null ? [normalized] : [];
    });
    return [...new Set(ids)].toSorted();
}
export function filterMetricsToConnected(metrics: MetricRecord[], connectedIds: CanonicalAdsProviderId[]): MetricRecord[] {
    if (connectedIds.length === 0) {
        return metrics;
    }
    const connected = new Set(connectedIds);
    return metrics.filter((metric) => {
        const canonical = normalizeAdsProviderId(metric.providerId);
        return canonical !== null && connected.has(canonical);
    });
}
export function filterMetricsByProviders(metrics: MetricRecord[], selectedProviderIds: string[]): MetricRecord[] {
    if (selectedProviderIds.length === 0) {
        return metrics;
    }
    const selected = new Set(selectedProviderIds.map((id) => normalizeAdsProviderId(id) ?? id));
    return metrics.filter((metric) => {
        const canonical = normalizeAdsProviderId(metric.providerId) ?? metric.providerId;
        return selected.has(canonical);
    });
}
export function metricRowsForAggregation(metrics: MetricRecord[]): MetricFinancialRow[] {
    return metrics.map((metric) => ({
        spend: metric.spend,
        revenue: metric.revenue,
        currency: metric.currency,
        impressions: metric.impressions,
        clicks: metric.clicks,
        conversions: metric.conversions,
    }));
}
export function computeCtrParts(clicks: number, impressions: number): {
    rate: number;
    clicksExceedImpressions: boolean;
} {
    if (impressions <= 0) {
        return { rate: 0, clicksExceedImpressions: false };
    }
    const raw = clicks / impressions;
    return {
        rate: Math.min(raw, 1),
        clicksExceedImpressions: clicks > impressions,
    };
}
export function buildCrossChannelSummaryCards(metrics: MetricRecord[], displayState: AdsMetricsDisplayState = 'has_delivery'): {
    cards: SummaryCard[];
    chartCurrency?: string;
} {
    const aggregate = aggregateMetricFinancials(metricRowsForAggregation(metrics));
    const delivery = aggregate.deliveryTotals;
    const financial = aggregate.financialTotals;
    const spend = financial.spend ?? 0;
    const revenue = financial.revenue ?? 0;
    const fmtMoney = (amount: number) => formatAggregatedMoney(amount, financial, formatCurrency);
    const hasDeliveryData = metrics.length > 0 &&
        (delivery.impressions > 0 ||
            delivery.clicks > 0 ||
            spend > 0 ||
            delivery.conversions > 0);
    const showSyncedEmptyState = displayState === 'synced_no_delivery';
    const showNeedsSyncState = displayState === 'needs_sync';
    const showNeedsConnectionState = displayState === 'needs_connection';
    const hasData = hasDeliveryData || showSyncedEmptyState;
    const { rate: ctr, clicksExceedImpressions } = computeCtrParts(delivery.clicks, delivery.impressions);
    const averageCpc = delivery.clicks > 0 && spend > 0 ? spend / delivery.clicks : 0;
    const roas = spend > 0 && revenue > 0 ? revenue / spend : 0;
    const conversionRate = delivery.clicks > 0 ? delivery.conversions / delivery.clicks : 0;
    const cpa = delivery.conversions > 0 && spend > 0 ? spend / delivery.conversions : 0;
    const spendHelper = (() => {
        if (showSyncedEmptyState) {
            return 'No spend recorded in this date range — campaigns may be paused or inactive';
        }
        if (showNeedsSyncState) {
            return 'Run a sync to pull spend for the selected date range';
        }
        if (showNeedsConnectionState) {
            return 'Connect a platform to populate';
        }
        if (hasDeliveryData) {
            return metrics.length > 1 || metrics[0]?.date !== 'summary'
                ? 'Connected platforms in this date range'
                : 'Totals from your latest sync — run sync again for daily trends';
        }
        return 'Connect a platform to populate';
    })();
    const impressionsHelper = (() => {
        if (showSyncedEmptyState) {
            return 'Account synced, but no impressions were returned for these dates';
        }
        if (showNeedsSyncState) {
            return 'Run a sync to populate delivery metrics';
        }
        if (showNeedsConnectionState) {
            return 'Awaiting your first sync';
        }
        return hasDeliveryData ? 'Total times ads were served' : 'Awaiting your first sync';
    })();
    const cards: SummaryCard[] = [
        {
            id: 'spend',
            label: 'Total Spend',
            value: spend > 0 ? fmtMoney(spend) : showSyncedEmptyState ? fmtMoney(0) : hasData ? fmtMoney(0) : '—',
            helper: spendHelper,
        },
        {
            id: 'impressions',
            label: 'Impressions',
            value: delivery.impressions > 0
                ? delivery.impressions.toLocaleString()
                : showSyncedEmptyState
                    ? '0'
                    : '—',
            helper: impressionsHelper,
        },
        {
            id: 'ctr',
            label: 'CTR',
            value: ctr > 0 ? `${(ctr * 100).toFixed(2)}%` : showSyncedEmptyState ? '0.00%' : '—',
            helper: clicksExceedImpressions
                ? 'Clicks exceed impressions in synced data — CTR capped at 100%'
                : ctr > 0
                    ? 'Clicks ÷ impressions'
                    : showSyncedEmptyState
                        ? 'No clicks or impressions in this date range'
                        : 'Needs impressions and clicks data',
        },
        {
            id: 'avg-cpc',
            label: 'Avg CPC',
            value: delivery.clicks > 0 && spend > 0 ? fmtMoney(averageCpc) : showSyncedEmptyState ? fmtMoney(0) : '—',
            helper: delivery.clicks > 0
                ? 'What each click cost on average'
                : showSyncedEmptyState
                    ? 'No clicks recorded in this date range'
                    : 'Need click data to calculate',
        },
        {
            id: 'cpa',
            label: 'CPA',
            value: cpa > 0 ? fmtMoney(cpa) : showSyncedEmptyState ? '—' : '—',
            helper: cpa > 0
                ? 'Spend ÷ conversions (lower is better)'
                : showSyncedEmptyState
                    ? 'No conversions recorded in this date range'
                    : 'Needs spend and conversions data',
        },
        {
            id: 'conv-rate',
            label: 'Conv. Rate',
            value: conversionRate > 0 ? `${(conversionRate * 100).toFixed(2)}%` : showSyncedEmptyState ? '0.00%' : '—',
            helper: conversionRate > 0
                ? 'Conversions ÷ clicks'
                : showSyncedEmptyState
                    ? 'No conversions in this date range'
                    : 'Needs clicks and conversions data',
        },
        {
            id: 'roas',
            label: 'ROAS',
            value: roas > 0 ? `${roas.toFixed(2)}x` : showSyncedEmptyState ? '0.00x' : '—',
            helper: roas > 0
                ? 'Revenue ÷ spend (higher is better)'
                : showSyncedEmptyState
                    ? 'No attributed revenue in this date range'
                    : 'Needs revenue and spend data',
        },
    ];
    const chartCurrency = financial.comparability === 'single_currency' && financial.primaryCurrency
        ? financial.primaryCurrency
        : undefined;
    return { cards, chartCurrency };
}
