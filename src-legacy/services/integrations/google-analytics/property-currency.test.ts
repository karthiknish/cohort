import { describe, expect, it, vi } from 'vitest';
import { fetchGoogleAnalyticsPropertyCurrency, normalizeGoogleAnalyticsCurrencyCode, } from './property-currency';
describe('google analytics property currency', () => {
    it('normalizes ISO 4217 codes', () => {
        expect(normalizeGoogleAnalyticsCurrencyCode('gbp')).toBe('GBP');
        expect(normalizeGoogleAnalyticsCurrencyCode('US')).toBeNull();
    });
    it('reads currencyCode from the Admin API property resource', async () => {
        const fetchMock = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ currencyCode: 'EUR' }),
        });
        vi.stubGlobal('fetch', fetchMock);
        const currency = await fetchGoogleAnalyticsPropertyCurrency({
            accessToken: 'token',
            propertyId: '123456789',
        });
        expect(currency).toBe('EUR');
        expect(fetchMock).toHaveBeenCalledWith('https://analyticsadmin.googleapis.com/v1beta/properties/123456789', expect.objectContaining({
            headers: { Authorization: 'Bearer token' },
        }));
        vi.unstubAllGlobals();
    });
});
