import { describe, expect, it } from 'vitest';
import { computeCreativeTotals, deriveCreativeMetrics, resolveCreativeInsights, sortCreativesByMetric, type CampaignAd, } from './campaign-creative-metrics';
const baseAd = (id: string, spend: number): CampaignAd => ({
    providerId: 'facebook',
    creativeId: id,
    campaignId: 'camp-1',
    type: 'IMAGE',
    status: 'ACTIVE',
    name: `Ad ${id}`,
});
describe('campaign-creative-metrics', () => {
    it('derives ctr, cpc, and roas from raw totals', () => {
        const metrics = deriveCreativeMetrics({
            spend: 100,
            impressions: 1000,
            clicks: 50,
            conversions: 5,
            revenue: 250,
        });
        expect(metrics?.ctr).toBe(5);
        expect(metrics?.cpc).toBe(2);
        expect(metrics?.roas).toBe(2.5);
    });
    it('sorts creatives by spend descending', () => {
        const ads = [baseAd('a', 0), baseAd('b', 0), baseAd('c', 0)];
        const adMetrics = {
            a: deriveCreativeMetrics({ spend: 10, impressions: 100, clicks: 5, conversions: 1, revenue: 0 })!,
            b: deriveCreativeMetrics({ spend: 50, impressions: 100, clicks: 5, conversions: 1, revenue: 0 })!,
            c: deriveCreativeMetrics({ spend: 25, impressions: 100, clicks: 5, conversions: 1, revenue: 0 })!,
        };
        const sorted = sortCreativesByMetric(ads, adMetrics, 'spend');
        expect(sorted.map((ad) => ad.creativeId)).toEqual(['b', 'c', 'a']);
    });
    it('flags top spend and needs-review insights', () => {
        const ads = [baseAd('high', 0), baseAd('low', 0)];
        const adMetrics = {
            high: deriveCreativeMetrics({ spend: 80, impressions: 2000, clicks: 10, conversions: 0, revenue: 0 })!,
            low: deriveCreativeMetrics({ spend: 5, impressions: 500, clicks: 20, conversions: 2, revenue: 10 })!,
        };
        const insights = resolveCreativeInsights(ads, adMetrics);
        expect(insights.get('high')).toBe('top-spend');
    });
    it('aggregates campaign creative totals', () => {
        const ads = [baseAd('a', 0), baseAd('b', 0)];
        const adMetrics = {
            a: deriveCreativeMetrics({ spend: 40, impressions: 400, clicks: 20, conversions: 2, revenue: 80 })!,
            b: deriveCreativeMetrics({ spend: 60, impressions: 600, clicks: 30, conversions: 3, revenue: 120 })!,
        };
        const totals = computeCreativeTotals(ads, adMetrics);
        expect(totals.spend).toBe(100);
        expect(totals.adsWithSpend).toBe(2);
        expect(totals.roas).toBe(2);
    });
});
