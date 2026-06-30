import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { useMetricsComparison, type UseMetricsComparisonReturn } from './use-metrics-comparison';
describe('useMetricsComparison', () => {
    it('keeps local calendar-day metric rows inside the selected range', () => {
        let comparison: UseMetricsComparisonReturn | null = null;
        function HookHarness() {
            comparison = useMetricsComparison({
                metrics: [
                    {
                        id: 'metric-1',
                        providerId: 'google_ads',
                        date: '2026-03-11',
                        spend: 125,
                        impressions: 1000,
                        clicks: 50,
                        conversions: 4,
                        revenue: 300,
                    },
                ],
                dateRange: {
                    start: new Date(2026, 2, 11, 0, 0, 0),
                    end: new Date(2026, 2, 11, 23, 59, 59),
                },
            });
            return null;
        }
        renderToStaticMarkup(createElement(HookHarness));
        expect(comparison?.periodComparison?.current.spend).toBe(125);
        expect(comparison?.providerComparison).toHaveLength(1);
        expect(comparison?.providerComparison[0]?.metrics.spend).toBe(125);
    });
});
