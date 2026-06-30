// =============================================================================
// BUSINESS MANAGER — businesses and linked ad accounts
// =============================================================================
import { appendMetaAuthParams, META_API_BASE } from './client';
import { metaAdsClient } from '@/services/integrations/shared/base-client';
export type MetaBusiness = {
    id: string;
    name: string;
};
export type MetaBusinessAdAccount = {
    id: string;
    name: string;
    accountId: string;
    currency?: string;
    accountStatus?: number;
};
export async function listMetaBusinesses(options: {
    accessToken: string;
    maxRetries?: number;
}): Promise<MetaBusiness[]> {
    const { accessToken, maxRetries = 3 } = options;
    const params = new URLSearchParams({
        fields: ['id', 'name'].join(','),
        limit: '100',
    });
    await appendMetaAuthParams({ params, accessToken, appSecret: process.env.META_APP_SECRET });
    const url = `${META_API_BASE}/me/businesses?${params.toString()}`;
    const { payload } = await metaAdsClient.executeRequest<{
        data?: Array<{
            id?: string;
            name?: string;
        }>;
    }>({
        url,
        operation: 'listMetaBusinesses',
        maxRetries,
    });
    const rows = Array.isArray(payload?.data) ? payload.data : [];
    return rows.flatMap((row) => {
        const id = row.id?.trim();
        if (!id)
            return [];
        return [{ id, name: row.name?.trim() || `Business ${id}` }];
    });
}
async function fetchBusinessAdAccounts(options: {
    accessToken: string;
    businessId: string;
    edge: 'owned_ad_accounts' | 'client_ad_accounts';
    maxRetries?: number;
}): Promise<MetaBusinessAdAccount[]> {
    const { accessToken, businessId, edge, maxRetries = 3 } = options;
    const params = new URLSearchParams({
        fields: ['id', 'name', 'account_id', 'currency', 'account_status'].join(','),
        limit: '100',
    });
    await appendMetaAuthParams({ params, accessToken, appSecret: process.env.META_APP_SECRET });
    const url = `${META_API_BASE}/${businessId}/${edge}?${params.toString()}`;
    const { payload } = await metaAdsClient.executeRequest<{
        data?: Array<{
            id?: string;
            name?: string;
            account_id?: string;
            currency?: string;
            account_status?: number;
        }>;
    }>({
        url,
        operation: `listMetaBusinessAdAccounts:${edge}`,
        maxRetries,
    });
    const rows = Array.isArray(payload?.data) ? payload.data : [];
    return rows.flatMap((row) => {
        const id = row.id?.trim();
        if (!id)
            return [];
        return [
            {
                id,
                name: row.name?.trim() || id,
                accountId: row.account_id?.trim() || id.replace(/^act_/, ''),
                currency: row.currency,
                accountStatus: row.account_status,
            },
        ];
    });
}
export async function listMetaBusinessAdAccounts(options: {
    accessToken: string;
    businessId: string;
    maxRetries?: number;
}): Promise<MetaBusinessAdAccount[]> {
    const [owned, client] = await Promise.all([
        fetchBusinessAdAccounts({
            accessToken: options.accessToken,
            businessId: options.businessId,
            edge: 'owned_ad_accounts',
            maxRetries: options.maxRetries,
        }),
        fetchBusinessAdAccounts({
            accessToken: options.accessToken,
            businessId: options.businessId,
            edge: 'client_ad_accounts',
            maxRetries: options.maxRetries,
        }),
    ]);
    const seen = new Set<string>();
    return [...owned, ...client].filter((row) => {
        if (seen.has(row.id))
            return false;
        seen.add(row.id);
        return true;
    });
}
