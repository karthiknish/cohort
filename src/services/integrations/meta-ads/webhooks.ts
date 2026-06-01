// =============================================================================
// AD ACCOUNT WEBHOOKS — subscribed_apps on ad account
// =============================================================================
import { appendMetaAuthParams, executeMetaApiRequest, META_API_BASE } from './client';
import { metaAdsClient } from '@/services/integrations/shared/base-client';
export async function listMetaAdAccountWebhookSubscriptions(options: {
    accessToken: string;
    adAccountId: string;
    maxRetries?: number;
}): Promise<{
    subscribedFields: string[];
}> {
    const { accessToken, adAccountId, maxRetries = 3 } = options;
    const formattedAccountId = adAccountId.startsWith('act_') ? adAccountId : `act_${adAccountId}`;
    const params = new URLSearchParams();
    await appendMetaAuthParams({ params, accessToken, appSecret: process.env.META_APP_SECRET });
    const url = `${META_API_BASE}/${formattedAccountId}/subscribed_apps?${params.toString()}`;
    const { payload } = await executeMetaApiRequest<{
        data?: Array<{
            subscribed_fields?: string[];
        }>;
    }>({
        url,
        accessToken,
        operation: 'listAdAccountWebhooks',
        maxRetries,
    });
    const rows = Array.isArray(payload?.data) ? payload.data : [];
    const subscribedFields = rows.flatMap((row) => Array.isArray(row.subscribed_fields) ? row.subscribed_fields : []);
    return { subscribedFields: [...new Set(subscribedFields)] };
}
export async function updateMetaAdAccountWebhookSubscriptions(options: {
    accessToken: string;
    adAccountId: string;
    subscribedFields: string[];
    maxRetries?: number;
}): Promise<{
    success: boolean;
    subscribedFields: string[];
}> {
    const { accessToken, adAccountId, subscribedFields, maxRetries = 3 } = options;
    const formattedAccountId = adAccountId.startsWith('act_') ? adAccountId : `act_${adAccountId}`;
    const params = new URLSearchParams();
    params.set('subscribed_fields', JSON.stringify(subscribedFields));
    await appendMetaAuthParams({ params, accessToken, appSecret: process.env.META_APP_SECRET });
    const url = `${META_API_BASE}/${formattedAccountId}/subscribed_apps?${params.toString()}`;
    const { payload } = await executeMetaApiRequest<{
        success?: boolean;
    }>({
        url,
        accessToken,
        operation: 'updateAdAccountWebhooks',
        method: 'POST',
        maxRetries,
    });
    return {
        success: payload?.success !== false,
        subscribedFields,
    };
}
export async function clearMetaAdAccountWebhookSubscriptions(options: {
    accessToken: string;
    adAccountId: string;
    maxRetries?: number;
}): Promise<{
    success: boolean;
}> {
    const { accessToken, adAccountId, maxRetries = 3 } = options;
    const formattedAccountId = adAccountId.startsWith('act_') ? adAccountId : `act_${adAccountId}`;
    const params = new URLSearchParams();
    await appendMetaAuthParams({ params, accessToken, appSecret: process.env.META_APP_SECRET });
    const url = `${META_API_BASE}/${formattedAccountId}/subscribed_apps?${params.toString()}`;
    const { payload } = await metaAdsClient.executeRequest<{
        success?: boolean;
    }>({
        url,
        operation: 'clearAdAccountWebhooks',
        method: 'DELETE',
        maxRetries,
    });
    return { success: payload?.success !== false };
}
