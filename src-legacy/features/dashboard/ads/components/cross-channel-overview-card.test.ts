import { describe, expect, it } from 'vitest';
import type { MetricRecord } from './types';
import { buildCanonicalConnectedIds, buildCrossChannelSummaryCards, computeCtrParts, filterMetricsToConnected, } from './cross-channel-overview-card.utils';
const metaRow = (overrides: Partial<MetricRecord> = {}): MetricRecord => ({
    id: '1',
    providerId: 'facebook',
    date: '2024-01-01',
    spend: 100,
    impressions: 1000,
    clicks: 50,
    conversions: 2,
    revenue: 200,
    currency: 'GBP',
    ...overrides,
});
describe('cross-channel overview card utils', () => {
    it('normalizes connected provider ids', () => {
        expect(buildCanonicalConnectedIds(['meta', 'google_ads'])).toEqual(['facebook', 'google']);
    });
    it('scopes metrics to connected platforms only', () => {
        const metrics = [
            metaRow(),
            metaRow({ id: '2', providerId: 'google', spend: 999, impressions: 10, clicks: 20 }),
        ];
        expect(filterMetricsToConnected(metrics, ['facebook'])).toHaveLength(1);
        expect(filterMetricsToConnected(metrics, ['facebook'])[0]?.providerId).toBe('facebook');
    });
    it('caps CTR when clicks exceed impressions', () => {
        expect(computeCtrParts(5000, 4160)).toEqual({ rate: 1, clicksExceedImpressions: true });
    });
    it('formats dormant synced accounts with explicit zeros', () => {
        const { cards } = buildCrossChannelSummaryCards([], 'synced_no_delivery');
        const spend = cards.find((card) => card.id === 'spend');
        const impressions = cards.find((card) => card.id === 'impressions');
        expect(spend?.helper).toContain('No spend recorded');
        expect(impressions?.value).toBe('0');
    });
    it('formats money in a single currency for connected meta-only data', () => {
        const { cards } = buildCrossChannelSummaryCards([metaRow()]);
        const spend = cards.find((card) => card.id === 'spend');
        const ctr = cards.find((card) => card.id === 'ctr');
        expect(spend?.value).toContain('£');
        expect(ctr?.value).toBe('5.00%');
    });
    it('does not include stale google rows when scoped to facebook', () => {
        const metrics = [
            metaRow({ impressions: 1000, clicks: 50 }),
            metaRow({
                id: '2',
                providerId: 'google',
                impressions: 3160,
                clicks: 4574,
                spend: 0,
                currency: 'USD',
            }),
        ];
        const scoped = filterMetricsToConnected(metrics, ['facebook']);
        const { cards } = buildCrossChannelSummaryCards(scoped);
        const ctr = cards.find((card) => card.id === 'ctr');
        expect(ctr?.value).toBe('5.00%');
        expect(ctr?.helper).toBe('Clicks ÷ impressions');
    });
});
