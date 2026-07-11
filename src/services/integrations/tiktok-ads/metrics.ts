// =============================================================================
// TIKTOK ADS METRICS - Fetching ad metrics from TikTok API
// =============================================================================
import { asErrorMessage } from '@/lib/convex-errors';
import { formatDate } from '@/lib/dates';
import { coerceNumber, DEFAULT_RETRY_CONFIG } from './client';
import { tiktokAdsClient } from '@/services/integrations/shared/base-client';
import type { TikTokMetricsOptions, TikTokAdAccount, TikTokReportResponse, TikTokApiErrorResponse, NormalizedMetric, } from './types';
// =============================================================================
// FETCH TIKTOK AD ACCOUNTS
// =============================================================================
export async function fetchTikTokAdAccounts(options: {
    accessToken: string;
    advertiserIds?: string[];
    maxRetries?: number;
}): Promise<TikTokAdAccount[]> {
    const { accessToken, advertiserIds, maxRetries = DEFAULT_RETRY_CONFIG.maxRetries } = options;
    if (!accessToken) {
        throw new Error('TikTok access token is required to load advertisers');
    }
    const url = 'https://business-api.tiktok.com/open_api/v1.3/advertiser/info/';
    const { payload } = await tiktokAdsClient.executeRequest<{
        code?: number;
        message?: string;
        request_id?: string;
        data?: {
            list?: Array<{
                advertiser_id?: string;
                name?: string;
                status?: string;
                currency?: string;
                timezone?: string;
            }>;
        };
    }>({
        url,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Access-Token': accessToken,
        },
        body: JSON.stringify({
            advertiser_ids: advertiserIds,
            page_size: 50,
        }),
        operation: 'fetchAdAccounts',
        maxRetries,
    });
    const list = Array.isArray(payload?.data?.list) ? payload.data?.list ?? [] : [];
    const accounts = list
        .flatMap((candidate): TikTokAdAccount[] => {
        const id = typeof candidate?.advertiser_id === 'string' ? candidate.advertiser_id : null;
        if (!id)
            return [];
        return [{
                id,
                name: typeof candidate?.name === 'string' && candidate.name.length > 0 ? candidate.name : `TikTok advertiser ${id}`,
                status: typeof candidate?.status === 'string' ? candidate.status : undefined,
                currency: typeof candidate?.currency === 'string' ? candidate.currency : undefined,
                timezone: typeof candidate?.timezone === 'string' ? candidate.timezone : undefined,
            }];
    });
    if (!accounts.length && Array.isArray(advertiserIds)) {
        return advertiserIds.flatMap((id) => typeof id === 'string' && id.length > 0 ? [{ id, name: `TikTok advertiser ${id}` }] : []);
    }
    return accounts;
}
// =============================================================================
// MAIN API: FETCH TIKTOK ADS METRICS
// =============================================================================
export async function fetchTikTokAdsMetrics(options: TikTokMetricsOptions): Promise<NormalizedMetric[]> {
    const { accessToken, advertiserId, timeframeDays, maxPages = 20, maxRetries = DEFAULT_RETRY_CONFIG.maxRetries, refreshAccessToken, onRateLimitHit, onTokenRefresh, } = options;
    if (!accessToken) {
        throw new Error('TikTok access token is required to fetch metrics');
    }
    if (!advertiserId) {
        throw new Error('TikTok advertiser ID is required');
    }
    const metrics: NormalizedMetric[] = [];
    const today = new Date();
    const start = new Date(today);
    start.setUTCDate(start.getUTCDate() - Math.max(0, timeframeDays - 1));
    let cursor: string | undefined;
    let page = 0;
    let activeToken = accessToken;
    let tokenRefreshAttempted = false;
    while (page < maxPages) {
        page += 1;
        const requestPayload = {
            advertiser_id: advertiserId,
            data_level: 'AUCTION_CAMPAIGN',
            dimensions: ['campaign_id', 'campaign_name', 'stat_time_day'],
            metrics: ['spend', 'impressions', 'clicks', 'conversion', 'total_complete_payment'],
            start_date: formatDate(start, 'yyyy-MM-dd'),
            end_date: formatDate(today, 'yyyy-MM-dd'),
            page_size: 200,
            time_granularity: 'STAT_TIME_DAY',
            cursor,
            order_field: 'spend',
            order_type: 'DESC',
        };
        const { payload: body } = await tiktokAdsClient.executeRequest<TikTokReportResponse>({
            url: 'https://business-api.tiktok.com/open_api/v1.3/report/integrated/get/',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Access-Token': activeToken,
            },
            body: JSON.stringify(requestPayload),
            operation: `fetchMetrics:page${page}`,
            maxRetries,
            onAuthError: async () => {
                if (refreshAccessToken && !tokenRefreshAttempted) {
                    tokenRefreshAttempted = true;
                    activeToken = await refreshAccessToken();
                    onTokenRefresh?.();
                    return { retry: true, newToken: activeToken };
                }
                return { retry: false };
            },
            onRateLimitHit,
        });
        const rows = Array.isArray(body?.data?.list) ? body.data?.list ?? [] : [];
        rows.forEach((row) => {
            const dimensions = row?.dimensions ?? {};
            const metricsBlock = row?.metrics ?? {};
            const date = typeof dimensions?.stat_time_day === 'string' ? dimensions.stat_time_day : formatDate(today, 'yyyy-MM-dd');
            const campaignId = typeof dimensions?.campaign_id === 'string' ? dimensions.campaign_id : undefined;
            const campaignName = typeof dimensions?.campaign_name === 'string' ? dimensions.campaign_name : undefined;
            const spend = coerceNumber(metricsBlock?.spend);
            const impressions = coerceNumber(metricsBlock?.impressions);
            const clicks = coerceNumber(metricsBlock?.clicks);
            const conversions = coerceNumber(metricsBlock?.conversion);
            const revenue = coerceNumber(metricsBlock?.total_complete_payment);
            metrics.push({
                providerId: 'tiktok',
                accountId: advertiserId,
                date,
                spend,
                impressions,
                clicks,
                conversions,
                revenue: revenue || null,
                campaignId,
                campaignName,
                rawPayload: row,
            });
        });
        const responseData = body?.data;
        const nextCursor = typeof responseData?.cursor === 'string' && responseData.cursor.length > 0
            ? responseData.cursor
            : undefined;
        const hasMore = Boolean(responseData?.page_info?.has_more) || Boolean(responseData?.cursor);
        cursor = nextCursor;
        if (!hasMore || !cursor) {
            break;
        }
    }
    return metrics;
}
// =============================================================================
// HEALTH CHECK
// =============================================================================
export async function checkTikTokIntegrationHealth(options: {
    accessToken: string;
    advertiserId?: string;
}): Promise<{
    healthy: boolean;
    tokenValid: boolean;
    accountAccessible: boolean;
    error?: string;
}> {
    const { accessToken, advertiserId } = options;
    try {
        const { payload: userPayload } = await tiktokAdsClient.executeRequest<TikTokApiErrorResponse>({
            url: 'https://business-api.tiktok.com/open_api/v1.3/user/info/',
            method: 'GET',
            headers: {
                'Access-Token': accessToken,
            },
            operation: 'checkTikTokIntegrationHealth:userInfo',
        });

        if (userPayload.code && userPayload.code !== 0) {
            return {
                healthy: false,
                tokenValid: false,
                accountAccessible: false,
                error: userPayload.message ?? `Token validation failed with code ${userPayload.code}`,
            };
        }

        if (advertiserId) {
            try {
                const { payload: accountPayload } = await tiktokAdsClient.executeRequest<{
                    code?: number;
                    message?: string;
                    data?: {
                        list?: Array<{
                            advertiser_id?: string;
                        }>;
                    };
                }>({
                    url: 'https://business-api.tiktok.com/open_api/v1.3/advertiser/info/',
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Token': accessToken,
                    },
                    body: JSON.stringify({
                        advertiser_ids: [advertiserId],
                    }),
                    operation: 'checkTikTokIntegrationHealth:advertiserInfo',
                });

                if (accountPayload.code && accountPayload.code !== 0) {
                    return {
                        healthy: false,
                        tokenValid: true,
                        accountAccessible: false,
                        error: accountPayload.message ?? `Advertiser check failed with code ${accountPayload.code}`,
                    };
                }

                const list = accountPayload.data?.list ?? [];
                if (!list.some(a => a.advertiser_id === advertiserId)) {
                    return {
                        healthy: false,
                        tokenValid: true,
                        accountAccessible: false,
                        error: 'Advertiser not found in accessible accounts',
                    };
                }
            } catch (error) {
                return {
                    healthy: false,
                    tokenValid: true,
                    accountAccessible: false,
                    error: asErrorMessage(error, 'Advertiser not accessible'),
                };
            }
        }

        return {
            healthy: true,
            tokenValid: true,
            accountAccessible: true,
        };
    }
    catch (error) {
        return {
            healthy: false,
            tokenValid: false,
            accountAccessible: false,
            error: asErrorMessage(error, 'Health check failed'),
        };
    }
}
