import { assertGoogleApiOk } from '@/lib/errors/google-api-error';
/** ISO 4217 code from GA4 Admin API `properties/{id}.currencyCode`. */
export function normalizeGoogleAnalyticsCurrencyCode(raw: unknown): string | null {
    if (typeof raw !== 'string')
        return null;
    const code = raw.trim().toUpperCase();
    return /^[A-Z]{3}$/.test(code) ? code : null;
}
type Ga4PropertyResponse = {
    currencyCode?: unknown;
    account?: string;
};
type Ga4AccountResponse = {
    currencyCode?: unknown;
};
/**
 * Fetch the reporting currency configured on the GA4 property.
 * Falls back to the account-level currency if the property doesn't have one set.
 * @see https://developers.google.com/analytics/devguides/config/admin/v1/rest/v1beta/properties
 */
export async function fetchGoogleAnalyticsPropertyCurrency(options: {
    accessToken: string;
    propertyId: string;
}): Promise<string | null> {
    const propertyId = options.propertyId.trim();
    if (!propertyId)
        return null;
    const response = await fetch(`https://analyticsadmin.googleapis.com/v1beta/properties/${encodeURIComponent(propertyId)}`, {
        headers: {
            Authorization: `Bearer ${options.accessToken}`,
        },
    });
    await assertGoogleApiOk(response, 'Failed to fetch Google Analytics property');
    const payload = (await response.json()) as Ga4PropertyResponse;
    const propertyCurrency = normalizeGoogleAnalyticsCurrencyCode(payload.currencyCode);
    if (propertyCurrency)
        return propertyCurrency;
    // Fallback: fetch the account-level currency if the property doesn't have one
    const accountResourceName = typeof payload.account === 'string' && payload.account.length > 0
        ? payload.account
        : null;
    if (!accountResourceName)
        return null;
    try {
        const accountResponse = await fetch(`https://analyticsadmin.googleapis.com/v1beta/${accountResourceName}`, {
            headers: {
                Authorization: `Bearer ${options.accessToken}`,
            },
        });
        await assertGoogleApiOk(accountResponse, 'Failed to fetch Google Analytics account');
        const accountPayload = (await accountResponse.json()) as Ga4AccountResponse;
        return normalizeGoogleAnalyticsCurrencyCode(accountPayload.currencyCode);
    }
    catch {
        // If the account fetch fails, return null and let the caller fall back to preference currency
        return null;
    }
}
