// =============================================================================
// LEADGEN FORMS - Page lead form list/create for lead campaigns
// =============================================================================
import { appendMetaAuthParams, META_API_BASE } from './client';
import { metaAdsClient } from '@/services/integrations/shared/base-client';
export type MetaLeadgenForm = {
    id: string;
    name: string;
    status?: string;
    locale?: string;
    leadsCount?: number;
};
export async function listMetaLeadgenForms(options: {
    accessToken: string;
    pageId: string;
    maxRetries?: number;
}): Promise<MetaLeadgenForm[]> {
    const { accessToken, pageId, maxRetries = 3 } = options;
    const params = new URLSearchParams({
        fields: ['id', 'name', 'status', 'locale', 'leads_count'].join(','),
        limit: '100',
    });
    await appendMetaAuthParams({ params, accessToken, appSecret: process.env.META_APP_SECRET });
    const url = `${META_API_BASE}/${pageId}/leadgen_forms?${params.toString()}`;
    const { payload } = await metaAdsClient.executeRequest<{
        data?: Array<{
            id?: string;
            name?: string;
            status?: string;
            locale?: string;
            leads_count?: number;
        }>;
    }>({
        url,
        operation: 'listMetaLeadgenForms',
        maxRetries,
    });
    const rows = Array.isArray(payload?.data) ? payload.data : [];
    return rows.map((row) => ({
        id: row.id ?? '',
        name: row.name ?? '',
        status: row.status,
        locale: row.locale,
        leadsCount: row.leads_count,
    }));
}
export async function createMetaLeadgenForm(options: {
    accessToken: string;
    pageId: string;
    name: string;
    locale?: string;
    privacyPolicyUrl: string;
    questions?: Array<{
        type: string;
        key: string;
        label?: string;
    }>;
    maxRetries?: number;
}): Promise<{
    success: boolean;
    formId?: string;
    error?: string;
}> {
    const { accessToken, pageId, name, locale = 'en_US', privacyPolicyUrl, questions = [{ type: 'FULL_NAME', key: 'full_name' }], maxRetries = 3, } = options;
    const params = new URLSearchParams();
    params.set('name', name);
    params.set('locale', locale);
    params.set('privacy_policy_url', privacyPolicyUrl);
    params.set('questions', JSON.stringify(questions));
    await appendMetaAuthParams({ params, accessToken, appSecret: process.env.META_APP_SECRET });
    const url = `${META_API_BASE}/${pageId}/leadgen_forms?${params.toString()}`;
    try {
        const { payload } = await metaAdsClient.executeRequest<{
            id?: string;
            error?: {
                message?: string;
            };
        }>({
            url,
            operation: 'createMetaLeadgenForm',
            method: 'POST',
            maxRetries,
        });
        if (payload?.error) {
            return { success: false, error: payload.error.message ?? 'Failed to create lead form' };
        }
        return { success: true, formId: payload?.id };
    }
    catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error creating lead form',
        };
    }
}
