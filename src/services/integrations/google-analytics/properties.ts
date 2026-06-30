import { assertGoogleApiOk } from '@/lib/errors/google-api-error';
import { fetchGoogleAnalyticsPropertyCurrency } from './property-currency';
export type GoogleAnalyticsPropertyOption = {
    id: string;
    name: string;
    resourceName: string;
    /** ISO 4217 reporting currency when resolved from the Admin API. */
    currencyCode?: string | null;
};
export { fetchGoogleAnalyticsPropertyCurrency, normalizeGoogleAnalyticsCurrencyCode } from './property-currency';
type GoogleAnalyticsAccountSummariesResponse = {
    accountSummaries?: Array<{
        propertySummaries?: Array<{
            property?: string;
            displayName?: string;
        }>;
    }>;
    nextPageToken?: string;
};
const DEFAULT_PAGE_SIZE = 200;
const MAX_PROPERTY_LIST_PAGES = 50;
function normalizePropertyId(resourceName: string): string {
    const trimmed = resourceName.trim();
    if (trimmed.startsWith('properties/')) {
        const extracted = trimmed.split('/')[1];
        return typeof extracted === 'string' && extracted.length > 0 ? extracted : trimmed;
    }
    return trimmed;
}
export async function fetchGoogleAnalyticsProperties(options: {
    accessToken: string;
    pageSize?: number;
    maxPages?: number;
}): Promise<GoogleAnalyticsPropertyOption[]> {
    const { accessToken, pageSize = DEFAULT_PAGE_SIZE, maxPages = MAX_PROPERTY_LIST_PAGES } = options;
    const unique = new Map<string, GoogleAnalyticsPropertyOption>();
    const fetchPage = async (page: number, nextPageToken?: string): Promise<void> => {
        const url = new URL('https://analyticsadmin.googleapis.com/v1beta/accountSummaries');
        url.searchParams.set('pageSize', String(pageSize));
        if (typeof nextPageToken === 'string' && nextPageToken.length > 0) {
            url.searchParams.set('pageToken', nextPageToken);
        }
        const response = await fetch(url.toString(), {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
        await assertGoogleApiOk(response, 'Failed to list Google Analytics properties');
        const payload = (await response.json()) as GoogleAnalyticsAccountSummariesResponse;
        for (const accountSummary of payload.accountSummaries ?? []) {
            for (const property of accountSummary.propertySummaries ?? []) {
                if (typeof property.property !== 'string' || property.property.length === 0) {
                    continue;
                }
                const id = normalizePropertyId(property.property);
                const name = typeof property.displayName === 'string' && property.displayName.length > 0
                    ? property.displayName
                    : property.property;
                unique.set(id, {
                    id,
                    name,
                    resourceName: property.property,
                });
            }
        }
        const token = payload.nextPageToken;
        if (token && page + 1 < maxPages) {
            await fetchPage(page + 1, token);
        }
    };
    await fetchPage(0);
    return Array.from(unique.values()).toSorted((a, b) => a.name.localeCompare(b.name));
}
