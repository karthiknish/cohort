// =============================================================================
// TARGETING SEARCH - Interest and geo typeahead via Marketing API search
// =============================================================================
import { appendMetaAuthParams, META_API_BASE } from './client';
import { metaAdsClient } from '@/services/integrations/shared/base-client';
export type MetaTargetingSearchResult = {
    id: string;
    name: string;
    type: string;
    audienceSize?: number;
    path?: string[];
};
export async function searchMetaAdInterests(options: {
    accessToken: string;
    query: string;
    limit?: number;
    maxRetries?: number;
}): Promise<MetaTargetingSearchResult[]> {
    const { accessToken, query, limit = 25, maxRetries = 3 } = options;
    const trimmed = query.trim();
    if (!trimmed)
        return [];
    const params = new URLSearchParams({
        type: 'adinterest',
        q: trimmed,
        limit: String(limit),
    });
    await appendMetaAuthParams({ params, accessToken, appSecret: process.env.META_APP_SECRET });
    const url = `${META_API_BASE}/search?${params.toString()}`;
    const { payload } = await metaAdsClient.executeRequest<{
        data?: Array<{
            id?: string;
            name?: string;
            audience_size?: number;
            path?: string[];
        }>;
    }>({
        url,
        operation: 'searchMetaAdInterests',
        maxRetries,
    });
    const rows = Array.isArray(payload?.data) ? payload.data : [];
    return rows.map((row) => ({
        id: row.id ?? '',
        name: row.name ?? '',
        type: 'adinterest',
        audienceSize: row.audience_size,
        path: row.path,
    }));
}
export async function searchMetaAdGeolocations(options: {
    accessToken: string;
    query: string;
    locationTypes?: Array<'country' | 'region' | 'city' | 'zip'>;
    limit?: number;
    maxRetries?: number;
}): Promise<MetaTargetingSearchResult[]> {
    const { accessToken, query, locationTypes = ['country', 'region', 'city'], limit = 25, maxRetries = 3 } = options;
    const trimmed = query.trim();
    if (!trimmed)
        return [];
    const params = new URLSearchParams({
        type: 'adgeolocation',
        q: trimmed,
        limit: String(limit),
        location_types: JSON.stringify(locationTypes),
    });
    await appendMetaAuthParams({ params, accessToken, appSecret: process.env.META_APP_SECRET });
    const url = `${META_API_BASE}/search?${params.toString()}`;
    const { payload } = await metaAdsClient.executeRequest<{
        data?: Array<{
            key?: string;
            name?: string;
            type?: string;
            country_code?: string;
        }>;
    }>({
        url,
        operation: 'searchMetaAdGeolocations',
        maxRetries,
    });
    const rows = Array.isArray(payload?.data) ? payload.data : [];
    return rows.map((row) => ({
        id: row.key ?? '',
        name: row.name ?? '',
        type: row.type ?? 'adgeolocation',
        path: row.country_code ? [row.country_code] : undefined,
    }));
}
