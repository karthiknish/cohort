// =============================================================================
// PAGE ENGAGEMENT RESOURCES - Posts and events for engagement ad sets
// =============================================================================
import { appendMetaAuthParams, META_API_BASE } from './client';
import { metaAdsClient } from '@/services/integrations/shared/base-client';
export type MetaPagePost = {
    id: string;
    message?: string;
    createdTime?: string;
    permalinkUrl?: string;
    isPublished?: boolean;
};
export type MetaPageEvent = {
    id: string;
    name: string;
    startTime?: string;
    endTime?: string;
    coverUrl?: string;
};
export async function listMetaPagePosts(options: {
    accessToken: string;
    pageId: string;
    limit?: number;
    maxRetries?: number;
}): Promise<MetaPagePost[]> {
    const { accessToken, pageId, limit = 50, maxRetries = 3 } = options;
    const params = new URLSearchParams({
        fields: ['id', 'message', 'created_time', 'permalink_url', 'is_published'].join(','),
        limit: String(limit),
    });
    await appendMetaAuthParams({ params, accessToken, appSecret: process.env.META_APP_SECRET });
    const url = `${META_API_BASE}/${pageId}/published_posts?${params.toString()}`;
    const { payload } = await metaAdsClient.executeRequest<{
        data?: Array<{
            id?: string;
            message?: string;
            created_time?: string;
            permalink_url?: string;
            is_published?: boolean;
        }>;
    }>({
        url,
        operation: 'listMetaPagePosts',
        maxRetries,
    });
    const rows = Array.isArray(payload?.data) ? payload.data : [];
    return rows.flatMap((row) => {
        const id = row.id?.trim();
        if (!id)
            return [];
        return [{
                id,
                message: row.message,
                createdTime: row.created_time,
                permalinkUrl: row.permalink_url,
                isPublished: row.is_published,
            }];
    });
}
export async function listMetaPageEvents(options: {
    accessToken: string;
    pageId: string;
    limit?: number;
    maxRetries?: number;
}): Promise<MetaPageEvent[]> {
    const { accessToken, pageId, limit = 50, maxRetries = 3 } = options;
    const params = new URLSearchParams({
        fields: ['id', 'name', 'start_time', 'end_time', 'cover'].join(','),
        limit: String(limit),
    });
    await appendMetaAuthParams({ params, accessToken, appSecret: process.env.META_APP_SECRET });
    const url = `${META_API_BASE}/${pageId}/events?${params.toString()}`;
    const { payload } = await metaAdsClient.executeRequest<{
        data?: Array<{
            id?: string;
            name?: string;
            start_time?: string;
            end_time?: string;
            cover?: {
                source?: string;
            } | string;
        }>;
    }>({
        url,
        operation: 'listMetaPageEvents',
        maxRetries,
    });
    const rows = Array.isArray(payload?.data) ? payload.data : [];
    return rows.flatMap((row) => {
        const id = row.id?.trim();
        const name = row.name?.trim();
        if (!id || !name)
            return [];
        const cover = typeof row.cover === 'string'
            ? row.cover
            : typeof row.cover?.source === 'string'
                ? row.cover.source
                : undefined;
        return [{
                id,
                name,
                startTime: row.start_time,
                endTime: row.end_time,
                coverUrl: cover,
            }];
    });
}
