// =============================================================================
// PRODUCT CATALOGS - DPA / catalog sales ad sets
// =============================================================================
import { appendMetaAuthParams, META_API_BASE } from './client';
import { metaAdsClient } from '@/services/integrations/shared/base-client';
export type MetaProductCatalog = {
    id: string;
    name: string;
    productCount?: number;
};
export type MetaProductSet = {
    id: string;
    name: string;
    productCount?: number;
};
export async function listMetaProductCatalogs(options: {
    accessToken: string;
    adAccountId: string;
    maxRetries?: number;
}): Promise<MetaProductCatalog[]> {
    const { accessToken, adAccountId, maxRetries = 3 } = options;
    const formattedAccountId = adAccountId.startsWith('act_') ? adAccountId : `act_${adAccountId}`;
    const params = new URLSearchParams({
        fields: ['id', 'name', 'product_count'].join(','),
        limit: '100',
    });
    await appendMetaAuthParams({ params, accessToken, appSecret: process.env.META_APP_SECRET });
    const url = `${META_API_BASE}/${formattedAccountId}/product_catalogs?${params.toString()}`;
    const { payload } = await metaAdsClient.executeRequest<{
        data?: Array<{
            id?: string;
            name?: string;
            product_count?: number;
        }>;
    }>({
        url,
        operation: 'listMetaProductCatalogs',
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
                name: row.name?.trim() || `Catalog ${id}`,
                productCount: row.product_count,
            },
        ];
    });
}
export async function listMetaProductSets(options: {
    accessToken: string;
    catalogId: string;
    maxRetries?: number;
}): Promise<MetaProductSet[]> {
    const { accessToken, catalogId, maxRetries = 3 } = options;
    const params = new URLSearchParams({
        fields: ['id', 'name', 'product_count'].join(','),
        limit: '100',
    });
    await appendMetaAuthParams({ params, accessToken, appSecret: process.env.META_APP_SECRET });
    const url = `${META_API_BASE}/${catalogId}/product_sets?${params.toString()}`;
    const { payload } = await metaAdsClient.executeRequest<{
        data?: Array<{
            id?: string;
            name?: string;
            product_count?: number;
        }>;
    }>({
        url,
        operation: 'listMetaProductSets',
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
                name: row.name?.trim() || `Product set ${id}`,
                productCount: row.product_count,
            },
        ];
    });
}
