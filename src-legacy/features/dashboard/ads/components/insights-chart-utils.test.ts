import { describe, expect, it } from 'vitest';
import { buildProviderCurrencyMapFromMetrics, pickDefaultInsightsTab, providerSummariesToSyntheticMetrics, resolveAdsDisplayCurrency, resolveChartProviderKey, resolveCurrencyFromProcessedMetrics, resolveInsightsChartCurrency, tabHasChartData, } from './insights-chart-utils';
import type { MetricRecord } from './types';
describe('insights-chart-utils', () => {
    it('resolves meta selection to facebook chart keys', () => {
        expect(resolveChartProviderKey('meta', ['facebook', 'google'])).toBe('facebook');
        expect(resolveChartProviderKey('all', ['all', 'google'])).toBe('all');
    });
    it('resolves chart currency from provider map for meta selection', () => {
        expect(resolveInsightsChartCurrency('meta', 'USD', { facebook: 'GBP' })).toBe('GBP');
    });
    it('uses sole provider currency when all platforms selected', () => {
        expect(resolveInsightsChartCurrency('all', undefined, { facebook: 'EUR' })).toBe('EUR');
    });
    it('falls back to display currency when multiple provider currencies are selected', () => {
        expect(resolveInsightsChartCurrency('all', 'GBP', { facebook: 'EUR', google: 'USD' })).toBe('GBP');
    });
    it('resolves ads display currency from provider map when summary currency is absent', () => {
        expect(resolveAdsDisplayCurrency(undefined, [], { facebook: 'GBP', google: 'GBP' })).toBe('GBP');
        expect(resolveAdsDisplayCurrency(undefined, [], { facebook: 'GBP', google: 'USD' })).toBeUndefined();
    });
    it('builds provider currency map from metric rows', () => {
        const rows: MetricRecord[] = [
            {
                id: '1',
                providerId: 'facebook',
                date: '2026-05-01',
                spend: 10,
                impressions: 100,
                clicks: 5,
                conversions: 1,
                revenue: 20,
                currency: 'GBP',
            },
        ];
        expect(buildProviderCurrencyMapFromMetrics(rows)).toEqual({ facebook: 'GBP' });
        expect(resolveCurrencyFromProcessedMetrics(rows)).toBe('GBP');
    });
    it('builds synthetic metrics from provider summaries', () => {
        const rows = providerSummariesToSyntheticMetrics({
            meta_ads: { spend: 100, impressions: 1000, clicks: 40, conversions: 2, revenue: 0 },
        });
        expect(rows).toHaveLength(1);
        expect(rows[0]?.providerId).toBe('facebook');
        expect(rows[0]?.impressions).toBe(1000);
    });
    it('picks funnel tab when comparison has no spend', () => {
        const tab = pickDefaultInsightsTab({
            providerComparison: [{ metrics: { spend: 0, revenue: 0 } }],
            funnelCharts: { facebook: [{ value: 1000 }] },
            trendCharts: {},
            efficiencyBreakdown: {},
            benchmarkCharts: {},
        });
        expect(tab).toBe('funnel');
    });
    it('detects funnel tab data for a provider', () => {
        expect(tabHasChartData('funnel', {
            providerComparison: [],
            funnelCharts: { facebook: [{ value: 500 }, { value: 10 }] },
            trendCharts: {},
            efficiencyBreakdown: {},
            benchmarkCharts: {},
        }, 'facebook')).toBe(true);
    });
});
