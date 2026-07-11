// =============================================================================
// GOOGLE ADS API CLIENT - Core request execution with retry logic
// =============================================================================
import { GOOGLE_API_BASE, } from './types';
import type { GoogleAdsSearchResponse, GoogleAdsResult, } from './types';
import { googleAdsClient } from '../shared/base-client';
import { executeIntegrationRequest } from '../shared/execute-integration-request';
import { DEFAULT_RETRY_CONFIG } from '../shared/retry';
export { DEFAULT_RETRY_CONFIG };
// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================
export function normalizeCost(costMicros?: string | number | null): number {
    if (costMicros == null)
        return 0;
    const value = typeof costMicros === 'string' ? parseFloat(costMicros) : costMicros;
    return Number.isFinite(value) ? value / 1000000 : 0;
}
export function extractNumber(value: unknown): number | null {
    if (typeof value === 'number' && Number.isFinite(value)) {
        return value;
    }
    if (typeof value === 'string') {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : null;
    }
    return null;
}
export function buildGoogleHeaders(options: {
    accessToken: string;
    developerToken: string;
    loginCustomerId?: string | null;
    contentType?: string;
}): Record<string, string> {
    const headers: Record<string, string> = {
        Authorization: `Bearer ${options.accessToken}`,
        'developer-token': options.developerToken,
    };
    if (options.contentType) {
        headers['Content-Type'] = options.contentType;
    }
    if (options.loginCustomerId) {
        headers['login-customer-id'] = options.loginCustomerId;
    }
    return headers;
}
// =============================================================================
// EXECUTE GOOGLE ADS API REQUEST WITH RETRY LOGIC
// =============================================================================
interface ExecuteRequestOptions {
    url: string;
    method: 'GET' | 'POST';
    headers: Record<string, string>;
    body?: string;
    operation: string;
    maxRetries?: number;
    onAuthError?: () => Promise<{
        retry: boolean;
        newToken?: string;
    }>;
    onRateLimitHit?: (retryAfterMs: number, details?: import('@/lib/retry-utils').RateLimitDetails) => void;
    onRateLimitTelemetry?: (details: import('@/lib/retry-utils').RateLimitDetails) => void;
}
export async function executeGoogleAdsApiRequest<T>(options: ExecuteRequestOptions): Promise<{
    response: Response;
    payload: T;
}> {
    return executeIntegrationRequest<T>(googleAdsClient, options);
}
// =============================================================================
// GOOGLE ADS SEARCH
// =============================================================================
export async function googleAdsSearch(options: {
    accessToken: string;
    developerToken: string;
    customerId: string;
    query: string;
    loginCustomerId?: string | null;
    pageSize?: number;
    maxPages?: number;
    maxRetries?: number;
    onAuthError?: () => Promise<{
        retry: boolean;
        newToken?: string;
    }>;
    onRateLimitHit?: (retryAfterMs: number, details?: import('@/lib/retry-utils').RateLimitDetails) => void;
    onRateLimitTelemetry?: (details: import('@/lib/retry-utils').RateLimitDetails) => void;
}): Promise<GoogleAdsResult[]> {
    const { accessToken, developerToken, customerId, query, loginCustomerId, pageSize = 1000, maxPages = 1, maxRetries = DEFAULT_RETRY_CONFIG.maxRetries, onAuthError, onRateLimitHit, onRateLimitTelemetry, } = options;
    let currentAccessToken = accessToken;
    const fetchPage = async (page: number, pageToken?: string): Promise<GoogleAdsResult[]> => {
        const url = `${GOOGLE_API_BASE}/customers/${customerId}/googleAds:search`;
        const headers: Record<string, string> = {
            Authorization: `Bearer ${currentAccessToken}`,
            'developer-token': developerToken,
            'Content-Type': 'application/json',
        };
        if (loginCustomerId) {
            headers['login-customer-id'] = loginCustomerId;
        }
        const body = JSON.stringify({
            query,
            pageSize,
            pageToken,
            returnTotalResultsCount: false,
        });
        const { payload } = await executeGoogleAdsApiRequest<GoogleAdsSearchResponse>({
            url,
            method: 'POST',
            headers,
            body,
            operation: `search:page${page}`,
            maxRetries,
            onAuthError: async () => {
                if (onAuthError) {
                    const result = await onAuthError();
                    if (result.newToken) {
                        currentAccessToken = result.newToken;
                    }
                    return result;
                }
                return { retry: false };
            },
            onRateLimitHit,
            onRateLimitTelemetry,
        });
        const pageResults = Array.isArray(payload.results) ? payload.results : [];
        const nextPageToken = payload.nextPageToken ?? undefined;
        if (!nextPageToken || page + 1 >= maxPages) {
            return pageResults;
        }
        const nextPageResults = await fetchPage(page + 1, nextPageToken);
        return [...pageResults, ...nextPageResults];
    };
    return fetchPage(0);
}
