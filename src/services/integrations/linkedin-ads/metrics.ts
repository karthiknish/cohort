// =============================================================================
// LINKEDIN ADS METRICS - Fetching ad metrics from LinkedIn API
// =============================================================================
import { asErrorMessage } from '@/lib/convex-errors';
import { normalizeCurrency, coerceNumber, buildTimeRange, formatDate, DEFAULT_RETRY_CONFIG, } from './client';
import { linkedinAdsClient } from '@/services/integrations/shared/base-client';
import type { LinkedInAdsOptions, LinkedInAdAccount, LinkedInAnalyticsRow, NormalizedMetric, } from './types';
// =============================================================================
// FETCH LINKEDIN AD ACCOUNTS
// =============================================================================
export async function fetchLinkedInAdAccounts(options: {
    accessToken: string;
    maxRetries?: number;
}): Promise<LinkedInAdAccount[]> {
    const { accessToken, maxRetries = DEFAULT_RETRY_CONFIG.maxRetries } = options;
    if (!accessToken) {
        throw new Error('LinkedIn access token is required to load ad accounts');
    }
    const url = 'https://api.linkedin.com/v2/adAccountsV2?q=search&sort.field=ID&sort.order=DESCENDING&count=100';
    const { payload } = await linkedinAdsClient.executeRequest<{
        elements?: Array<{
            id?: string;
            name?: string;
            status?: string;
            currency?: string;
        }>;
    }>({
        url,
        method: 'GET',
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'X-Restli-Protocol-Version': '2.0.0',
        },
        operation: 'fetchAdAccounts',
        maxRetries,
    });
    const elements = Array.isArray(payload?.elements) ? payload.elements : [];
    return elements.flatMap((account): LinkedInAdAccount[] => {
        const id = typeof account.id === 'string' ? account.id.replace('urn:li:sponsoredAccount:', '') : null;
        if (!id)
            return [];
        return [{
                id,
                name: account.name ?? `LinkedIn Account ${id}`,
                status: account.status,
                currency: account.currency,
            }];
    });
}
// =============================================================================
// MAIN API: FETCH LINKEDIN ADS METRICS
// =============================================================================
export async function fetchLinkedInAdsMetrics(options: LinkedInAdsOptions): Promise<NormalizedMetric[]> {
    const { accessToken, accountId, timeframeDays, maxRetries = DEFAULT_RETRY_CONFIG.maxRetries, refreshAccessToken, onRateLimitHit, onTokenRefresh, } = options;
    if (!accessToken) {
        throw new Error('LinkedIn access token is required to fetch metrics');
    }
    if (!accountId) {
        throw new Error('Missing LinkedIn ad account ID on integration');
    }
    let activeAccessToken = accessToken;
    let tokenRefreshAttempted = false;
    const timeRange = buildTimeRange(timeframeDays);
    const params = new URLSearchParams({
        q: 'statistics',
        accounts: `urn:li:sponsoredAccount:${accountId}`,
        timeGranularity: 'DAILY',
        start: timeRange.start,
        end: timeRange.end,
    });
    const url = `https://api.linkedin.com/v2/adAnalytics?${params.toString()}`;
    const { payload } = await linkedinAdsClient.executeRequest<{
        elements?: LinkedInAnalyticsRow[];
    }>({
        url,
        method: 'GET',
        headers: {
            Authorization: `Bearer ${activeAccessToken}`,
            'X-Restli-Protocol-Version': '2.0.0',
        },
        operation: 'fetchMetrics',
        maxRetries,
        onAuthError: async () => {
            if (refreshAccessToken && !tokenRefreshAttempted) {
                tokenRefreshAttempted = true;
                activeAccessToken = await refreshAccessToken();
                onTokenRefresh?.();
                return { retry: true, newToken: activeAccessToken };
            }
            return { retry: false };
        },
        onRateLimitHit,
    });
    const rows: LinkedInAnalyticsRow[] = Array.isArray(payload?.elements) ? payload.elements : [];
    const metrics: NormalizedMetric[] = rows.map((row) => {
        const date = row?.timeRange?.start ? formatDate(row.timeRange.start, 'yyyy-MM-dd') : formatDate(new Date(), 'yyyy-MM-dd');
        const spend = normalizeCurrency(row?.costInLocalCurrency);
        const impressions = coerceNumber(row?.impressions);
        const clicks = coerceNumber(row?.clicks);
        const conversions = coerceNumber(row?.conversions);
        const revenue = normalizeCurrency(row?.externalWebsiteConversionsValue);
        return {
            providerId: 'linkedin',
            accountId,
            date,
            spend,
            impressions,
            clicks,
            conversions,
            revenue: revenue > 0 ? revenue : undefined,
            creatives: undefined,
            rawPayload: row,
        };
    });
    return metrics;
}
// =============================================================================
// HEALTH CHECK
// =============================================================================
export async function checkLinkedInIntegrationHealth(options: {
    accessToken: string;
    accountId?: string;
}): Promise<{
    healthy: boolean;
    tokenValid: boolean;
    accountAccessible: boolean;
    error?: string;
}> {
    const { accessToken, accountId } = options;
    try {
        await linkedinAdsClient.executeRequest<unknown>({
            url: '/me',
            method: 'GET',
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
            operation: 'healthProfile',
            maxRetries: 1,
        });
        if (accountId) {
            await linkedinAdsClient.executeRequest<unknown>({
                url: `/adAccountsV2/urn:li:sponsoredAccount:${accountId}`,
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'X-Restli-Protocol-Version': '2.0.0',
                },
                operation: 'healthAccount',
                maxRetries: 1,
            });
        }
        return {
            healthy: true,
            tokenValid: true,
            accountAccessible: true,
        };
    }
    catch (error) {
        const errorMessage = asErrorMessage(error, 'Health check failed');
        const tokenValid = !/unauthorized|forbidden|invalid|missing|token/i.test(errorMessage);
        return {
            healthy: false,
            tokenValid,
            accountAccessible: false,
            error: errorMessage,
        };
    }
}
