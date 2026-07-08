// =============================================================================
// AUDIENCES - Custom audience creation and management
// =============================================================================
import { asErrorMessage } from '@/lib/convex-errors';
import { appendMetaAuthParams, META_API_BASE, } from '../client';
import { metaAdsClient } from '@/services/integrations/shared/base-client';
import { buildMetaLookalikeSpec } from '@/lib/meta-lookalike-spec';
import type { CreateAudienceOptions, CreateLookalikeAudienceOptions } from './types';
// =============================================================================
// CREATE CUSTOM AUDIENCE
// =============================================================================
// This only provisions an empty Custom Audience container via Meta Marketing
// API. It does not upload customer match rows or invoke any Data Manager-style
// ingestion service.
export async function createMetaAudience(options: CreateAudienceOptions): Promise<{
    success: boolean;
    id: string;
}> {
    const { accessToken, adAccountId, name, description, maxRetries = 3, } = options;
    const formattedAccountId = adAccountId.startsWith('act_') ? adAccountId : `act_${adAccountId}`;
    const params = new URLSearchParams({
        name,
        description: description || `Created via Cohort Ads Hub`,
        subtype: 'CUSTOM',
        customer_file_source: 'BOTH_USER_AND_PARTNER_PROVIDED',
    });
    await appendMetaAuthParams({ params, accessToken, appSecret: process.env.META_APP_SECRET });
    const url = `${META_API_BASE}/${formattedAccountId}/customaudiences?${params.toString()}`;
    const { payload } = await metaAdsClient.executeRequest<{
        id?: string;
    }>({
        url,
        operation: 'createAudience',
        method: 'POST',
        maxRetries,
    });
    return {
        success: true,
        id: payload?.id ?? ''
    };
}
// =============================================================================
// LIST CUSTOM AUDIENCES
// =============================================================================
export async function listMetaAudiences(options: {
    accessToken: string;
    adAccountId: string;
    maxRetries?: number;
}): Promise<Array<{
    id: string;
    name: string;
    description?: string;
    approximateCount?: number;
    status?: string;
    subtype?: string;
}>> {
    const { accessToken, adAccountId, maxRetries = 3, } = options;
    const formattedAccountId = adAccountId.startsWith('act_') ? adAccountId : `act_${adAccountId}`;
    const params = new URLSearchParams({
        fields: ['id', 'name', 'description', 'approximate_count', 'delivery_status', 'subtype'].join(','),
        limit: '100',
    });
    await appendMetaAuthParams({ params, accessToken, appSecret: process.env.META_APP_SECRET });
    const url = `${META_API_BASE}/${formattedAccountId}/customaudiences?${params.toString()}`;
    const { payload } = await metaAdsClient.executeRequest<{
        data?: Array<{
            id?: string;
            name?: string;
            description?: string;
            approximate_count?: number;
            delivery_status?: {
                code?: number;
                description?: string;
            };
            subtype?: string;
        }>;
    }>({
        url,
        operation: 'listAudiences',
        maxRetries,
    });
    const audiences = Array.isArray(payload?.data) ? payload.data : [];
    return audiences.map((a) => ({
        id: a.id ?? '',
        name: a.name ?? '',
        description: a.description,
        approximateCount: a.approximate_count,
        status: a.delivery_status?.description,
        subtype: a.subtype,
    }));
}
// =============================================================================
// CREATE LOOKALIKE AUDIENCE
// =============================================================================
export async function createMetaLookalikeAudience(options: CreateLookalikeAudienceOptions): Promise<{
    success: boolean;
    id: string;
}> {
    const { accessToken, adAccountId, name, originAudienceId, country, ratio, description, maxRetries = 3, } = options;
    const formattedAccountId = adAccountId.startsWith('act_') ? adAccountId : `act_${adAccountId}`;
    const lookalikeSpec = buildMetaLookalikeSpec(country, ratio);
    const params = new URLSearchParams({
        name,
        subtype: 'LOOKALIKE',
        origin_audience_id: originAudienceId,
        lookalike_spec: JSON.stringify(lookalikeSpec),
    });
    if (description) {
        params.set('description', description);
    }
    await appendMetaAuthParams({ params, accessToken, appSecret: process.env.META_APP_SECRET });
    const url = `${META_API_BASE}/${formattedAccountId}/customaudiences?${params.toString()}`;
    const { payload } = await metaAdsClient.executeRequest<{
        id?: string;
    }>({
        url,
        operation: 'createLookalikeAudience',
        method: 'POST',
        maxRetries,
    });
    return {
        success: true,
        id: payload?.id ?? '',
    };
}
// =============================================================================
// UPLOAD CUSTOM AUDIENCE USERS (customer file)
// =============================================================================
export async function uploadMetaAudienceUsers(options: {
    accessToken: string;
    audienceId: string;
    /** SHA-256 hashes of normalized emails (see hashMetaCustomerEmail). */
    emailHashes: string[];
    maxRetries?: number;
}): Promise<{
    success: boolean;
    numReceived?: number;
    error?: string;
}> {
    const { accessToken, audienceId, emailHashes, maxRetries = 3 } = options;
    if (emailHashes.length === 0) {
        return { success: false, error: 'No valid emails to upload' };
    }
    const sessionId = `${Date.now()}`;
    const payload = {
        schema: ['EMAIL'],
        data: emailHashes.map((hash) => [hash]),
    };
    const params = new URLSearchParams();
    params.set('session', JSON.stringify({
        session_id: sessionId,
        batch_seq: 1,
        last_batch_flag: true,
        estimated_num_total: emailHashes.length,
    }));
    params.set('payload', JSON.stringify(payload));
    await appendMetaAuthParams({ params, accessToken, appSecret: process.env.META_APP_SECRET });
    const url = `${META_API_BASE}/${audienceId}/users?${params.toString()}`;
    try {
        const { payload: response } = await metaAdsClient.executeRequest<{
            audience_id?: string;
            num_received?: number;
            num_invalid_entries?: number;
            error?: {
                message?: string;
            };
        }>({
            url,
            operation: 'uploadAudienceUsers',
            method: 'POST',
            maxRetries,
        });
        if (response?.error) {
            return { success: false, error: response.error.message ?? 'Upload failed' };
        }
        return {
            success: true,
            numReceived: response?.num_received ?? emailHashes.length,
        };
    }
    catch (error) {
        const message = asErrorMessage(error, 'Upload failed');
        return { success: false, error: message };
    }
}
// =============================================================================
// DELETE CUSTOM AUDIENCE
// =============================================================================
export async function deleteMetaAudience(options: {
    accessToken: string;
    audienceId: string;
    maxRetries?: number;
}): Promise<{
    success: boolean;
}> {
    const { accessToken, audienceId, maxRetries = 3, } = options;
    const params = new URLSearchParams();
    await appendMetaAuthParams({ params, accessToken, appSecret: process.env.META_APP_SECRET });
    const url = `${META_API_BASE}/${audienceId}?${params.toString()}`;
    try {
        await metaAdsClient.executeRequest({
            url,
            operation: 'deleteAudience',
            method: 'DELETE',
            maxRetries,
        });
        return { success: true };
    }
    catch {
        return { success: false };
    }
}
