import { asErrorMessage } from '@/lib/convex-errors';
import { appendMetaAuthParams, META_API_BASE } from '../client';
import { metaAdsClient } from '@/services/integrations/shared/base-client';
import type { CreateAdOptions, UpdateAdOptions } from './types';
export async function createMetaAd(options: CreateAdOptions): Promise<{
    success: boolean;
    adId: string;
    error?: string;
}> {
    const { accessToken, adAccountId, adSetId, creativeId, name = `Ad - ${new Date().toISOString()}`, status = 'PAUSED', maxRetries, } = options;
    const formattedAccountId = adAccountId.startsWith('act_') ? adAccountId : `act_${adAccountId}`;
    const params = new URLSearchParams();
    await appendMetaAuthParams({ params, accessToken, appSecret: process.env.META_APP_SECRET });
    const url = `${META_API_BASE}/${formattedAccountId}/ads`;
    const bodyData = {
        name,
        adset_id: adSetId,
        creative: { creative_id: creativeId },
        status,
        access_token: accessToken,
    };
    try {
        const { payload } = await metaAdsClient.executeRequest<{
            id?: string;
            error?: {
                message?: string;
                type?: string;
            };
        }>({
            url: `${url}?${params.toString()}`,
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bodyData),
            operation: 'createMetaAd',
            maxRetries,
        });
        if (payload?.error || !payload?.id) {
            return {
                success: false,
                adId: '',
                error: payload?.error?.message || 'Failed to create ad',
            };
        }
        return {
            success: true,
            adId: payload.id,
        };
    }
    catch (error) {
        return {
            success: false,
            adId: '',
            error: asErrorMessage(error, 'Unknown error'),
        };
    }
}
export async function updateMetaAd(options: UpdateAdOptions): Promise<{
    success: boolean;
    error?: string;
}> {
    const { accessToken, adId, creativeId, name, status, maxRetries } = options;
    const params = new URLSearchParams();
    await appendMetaAuthParams({ params, accessToken, appSecret: process.env.META_APP_SECRET });
    const bodyData: Record<string, unknown> = {
        creative: { creative_id: creativeId },
        access_token: accessToken,
    };
    if (name !== undefined) {
        bodyData.name = name;
    }
    if (status !== undefined) {
        bodyData.status = status;
    }
    try {
        const { payload } = await metaAdsClient.executeRequest<{
            success?: boolean;
            error?: {
                message?: string;
                type?: string;
            };
        }>({
            url: `${META_API_BASE}/${adId}?${params.toString()}`,
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bodyData),
            operation: 'updateMetaAd',
            maxRetries,
        });
        if (payload?.error) {
            return {
                success: false,
                error: payload.error.message || 'Failed to update ad',
            };
        }
        return { success: payload?.success ?? true };
    }
    catch (error) {
        return {
            success: false,
            error: asErrorMessage(error, 'Unknown error'),
        };
    }
}
