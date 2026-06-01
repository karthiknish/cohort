import type { FinancialComparability, FinancialTotals } from './types';
import { assessComparability, cleanCurrency } from './money';
export type MetricFinancialRow = {
    spend: number;
    revenue?: number | null;
    currency?: string | null;
    impressions?: number;
    clicks?: number;
    conversions?: number;
};
export type DeliveryTotals = {
    impressions: number;
    clicks: number;
    conversions: number;
};
export type DashboardMetricsAggregate = {
    deliveryTotals: DeliveryTotals;
    financialTotals: FinancialTotals;
};
/**
 * Aggregate delivery + financial totals from metric rows using the same
 * comparability rules as the Convex V2 read model.
 */
export function aggregateMetricFinancials(rows: MetricFinancialRow[]): DashboardMetricsAggregate {
    const deliveryTotals: DeliveryTotals = { impressions: 0, clicks: 0, conversions: 0 };
    const byCurrency: Record<string, {
        spend: number;
        revenue: number;
    }> = {};
    const currencyList: Array<string | null> = [];
    for (const row of rows) {
        deliveryTotals.impressions += Number(row.impressions ?? 0);
        deliveryTotals.clicks += Number(row.clicks ?? 0);
        deliveryTotals.conversions += Number(row.conversions ?? 0);
        const currency = cleanCurrency(row.currency);
        currencyList.push(currency);
        const bucketKey = currency ?? '__unknown__';
        const bucket = byCurrency[bucketKey] ?? { spend: 0, revenue: 0 };
        bucket.spend += Number(row.spend ?? 0);
        bucket.revenue += Number(row.revenue ?? 0);
        byCurrency[bucketKey] = bucket;
    }
    const comparability = assessComparability(currencyList);
    const visibleByCurrency = Object.fromEntries(Object.entries(byCurrency).filter(([key]) => key !== '__unknown__'));
    const knownCurrencies = Object.keys(visibleByCurrency);
    const primaryCurrency: string | null = knownCurrencies.length === 1 ? knownCurrencies[0]! : null;
    const financialTotals: FinancialTotals = {
        comparability,
        totalsByCurrency: visibleByCurrency,
        primaryCurrency,
        spend: comparability === 'single_currency' && primaryCurrency
            ? (visibleByCurrency[primaryCurrency]?.spend ?? 0)
            : null,
        revenue: comparability === 'single_currency' && primaryCurrency
            ? (visibleByCurrency[primaryCurrency]?.revenue ?? 0)
            : null,
    };
    return { deliveryTotals, financialTotals };
}
export function formatAggregatedMoney(amount: number | null | undefined, financial: Pick<FinancialTotals, 'comparability' | 'primaryCurrency'>, format: (value: number, currency: string) => string): string {
    if (amount === null || amount === undefined) {
        return '—';
    }
    if (financial.comparability === 'single_currency' && financial.primaryCurrency) {
        return format(amount, financial.primaryCurrency);
    }
    if (financial.comparability === 'mixed_currency') {
        return 'Multi-currency';
    }
    return '—';
}
export function financialTotalsHelper(financial: Pick<FinancialTotals, 'comparability' | 'primaryCurrency' | 'totalsByCurrency'>, fallback: string): string {
    if (financial.comparability === 'single_currency' && financial.primaryCurrency) {
        return fallback;
    }
    if (financial.comparability === 'mixed_currency') {
        const codes = Object.keys(financial.totalsByCurrency);
        return codes.length > 0
            ? `Totals split across ${codes.join(', ')} — not combined`
            : 'Multiple currencies — totals are not combined';
    }
    if (financial.comparability === 'unknown_currency') {
        return 'Currency unknown for synced rows';
    }
    return fallback;
}
export function isFinancialComparable(comparability: FinancialComparability): comparability is 'single_currency' {
    return comparability === 'single_currency';
}
