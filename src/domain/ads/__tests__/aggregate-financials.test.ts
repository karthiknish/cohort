import { describe, expect, it } from 'vitest';
import { aggregateMetricFinancials, formatAggregatedMoney, financialTotalsHelper, } from '../aggregate-financials';
describe('aggregateMetricFinancials', () => {
    it('aggregates spend and revenue for a single currency', () => {
        const result = aggregateMetricFinancials([
            { spend: 100, revenue: 400, currency: 'EUR' },
            { spend: 50, revenue: 200, currency: 'EUR' },
        ]);
        expect(result.financialTotals.comparability).toBe('single_currency');
        expect(result.financialTotals.primaryCurrency).toBe('EUR');
        expect(result.financialTotals.spend).toBe(150);
        expect(result.financialTotals.revenue).toBe(600);
    });
    it('marks mixed currencies and avoids combined totals', () => {
        const result = aggregateMetricFinancials([
            { spend: 100, revenue: 400, currency: 'USD' },
            { spend: 50, revenue: 200, currency: 'GBP' },
        ]);
        expect(result.financialTotals.comparability).toBe('mixed_currency');
        expect(result.financialTotals.primaryCurrency).toBeNull();
        expect(result.financialTotals.spend).toBeNull();
        expect(result.financialTotals.totalsByCurrency).toEqual({
            USD: { spend: 100, revenue: 400 },
            GBP: { spend: 50, revenue: 200 },
        });
    });
});
describe('formatAggregatedMoney', () => {
    const format = (value: number, currency: string) => `${currency}:${value}`;
    it('formats with primary currency when comparable', () => {
        expect(formatAggregatedMoney(120, { comparability: 'single_currency', primaryCurrency: 'GBP' }, format)).toBe('GBP:120');
    });
    it('returns multi-currency label when not comparable', () => {
        expect(formatAggregatedMoney(120, { comparability: 'mixed_currency', primaryCurrency: null }, format)).toBe('Multi-currency');
    });
});
describe('financialTotalsHelper', () => {
    it('describes mixed currency breakdown', () => {
        expect(financialTotalsHelper({
            comparability: 'mixed_currency',
            primaryCurrency: null,
            totalsByCurrency: { USD: { spend: 1, revenue: 2 }, EUR: { spend: 3, revenue: 4 } },
        }, 'fallback')).toContain('USD');
        expect(financialTotalsHelper({
            comparability: 'mixed_currency',
            primaryCurrency: null,
            totalsByCurrency: { USD: { spend: 1, revenue: 2 }, EUR: { spend: 3, revenue: 4 } },
        }, 'fallback')).toContain('EUR');
    });
});
