import { describe, expect, it } from 'vitest';
import type { MetricsSummary } from './types';
import { metricsForOverviewDisplay, totalsFromServerSummary, } from './cross-channel-overview-card.utils';
const summary: MetricsSummary = {
    totals: { spend: 500, impressions: 1000, clicks: 50, conversions: 5, revenue: 0 },
    providers: {
        facebook: { spend: 500, impressions: 1000, clicks: 50, conversions: 5, revenue: 0 },
        google: { spend: 999, impressions: 9000, clicks: 900, conversions: 0, revenue: 0 },
    },
    count: 2,
};
describe('cross-channel overview server summary fallback', () => {
    it('sums only connected providers from server summary', () => {
        const totals = totalsFromServerSummary(summary, ['facebook']);
        expect(totals?.spend).toBe(500);
        expect(totals?.impressions).toBe(1000);
    });
    it('builds synthetic overview metrics when daily rows are empty', () => {
        const rows = metricsForOverviewDisplay([], summary, ['facebook'], [], 'INR');
        expect(rows).toHaveLength(1);
        expect(rows[0]?.spend).toBe(500);
        expect(rows[0]?.currency).toBe('INR');
    });
});
