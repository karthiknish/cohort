import { asErrorMessage } from '@/lib/convex-errors';
import { appendMetaAuthParams, META_API_BASE } from '../client';
import { metaAdsClient } from '@/services/integrations/shared/base-client';
import { asRecord } from './shared';
import type { DeleteAdCreativeOptions, UpdateAdCreativeOptions } from './types';
export async function deleteMetaAdCreative(options: DeleteAdCreativeOptions): Promise<{
    success: boolean;
    error?: string;
}> {
    const { accessToken, creativeId, maxRetries } = options;
    const params = new URLSearchParams();
    await appendMetaAuthParams({ params, accessToken, appSecret: process.env.META_APP_SECRET });
    const url = `${META_API_BASE}/${creativeId}`;
    try {
        const { payload } = await metaAdsClient.executeRequest<{
            success?: boolean;
            error?: {
                message?: string;
                type?: string;
            };
        }>({
            url: `${url}?${params.toString()}`,
            method: 'DELETE',
            operation: 'deleteMetaAdCreative',
            maxRetries,
        });
        if (payload?.error) {
            return {
                success: false,
                error: payload.error.message || 'Failed to delete creative',
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
export async function updateMetaAdCreative(options: UpdateAdCreativeOptions): Promise<{
    success: boolean;
    error?: string;
}> {
    const { accessToken, creativeId, name, title, body, description, callToActionType, linkUrl, maxRetries, } = options;
    const params = new URLSearchParams();
    await appendMetaAuthParams({ params, accessToken, appSecret: process.env.META_APP_SECRET });
    const url = `${META_API_BASE}/${creativeId}`;
    const updateData: Record<string, unknown> = { access_token: accessToken };
    if (name !== undefined)
        updateData.name = name;
    const hasStoryUpdates = title !== undefined
        || body !== undefined
        || description !== undefined
        || callToActionType !== undefined
        || linkUrl !== undefined;
    if (hasStoryUpdates) {
        let existingStorySpec: Record<string, unknown> = {};
        try {
            const readParams = new URLSearchParams({ fields: 'object_story_spec' });
            await appendMetaAuthParams({ params: readParams, accessToken, appSecret: process.env.META_APP_SECRET });
            const { payload: readPayload } = await metaAdsClient.executeRequest<{
                object_story_spec?: Record<string, unknown>;
            }>({
                url: `${META_API_BASE}/${creativeId}?${readParams.toString()}`,
                operation: 'readMetaCreativeForUpdate',
                maxRetries,
            });
            const maybeStorySpec = asRecord(readPayload?.object_story_spec);
            if (maybeStorySpec) {
                existingStorySpec = { ...maybeStorySpec };
            }
        }
        catch {
            existingStorySpec = {};
        }
        const hasVideoData = Boolean(asRecord(existingStorySpec.video_data));
        const hasLinkData = Boolean(asRecord(existingStorySpec.link_data));
        const useVideoData = hasVideoData && !hasLinkData;
        if (useVideoData) {
            const videoData = { ...(asRecord(existingStorySpec.video_data) ?? {}) };
            if (title !== undefined)
                videoData.title = title;
            if (body !== undefined)
                videoData.message = body;
            if (description !== undefined)
                videoData.description = description;
            if (callToActionType !== undefined || linkUrl !== undefined) {
                const existingCta = asRecord(videoData.call_to_action) ?? {};
                const existingValue = asRecord(existingCta.value) ?? {};
                const ctaType = callToActionType ?? (typeof existingCta.type === 'string' ? existingCta.type : undefined);
                if (linkUrl !== undefined) {
                    existingValue.link = linkUrl;
                }
                if (ctaType) {
                    videoData.call_to_action = {
                        type: ctaType,
                        value: existingValue,
                    };
                }
            }
            existingStorySpec.video_data = videoData;
        }
        else {
            const linkData = { ...(asRecord(existingStorySpec.link_data) ?? {}) };
            if (title !== undefined)
                linkData.name = title;
            if (body !== undefined)
                linkData.message = body;
            if (description !== undefined)
                linkData.description = description;
            if (linkUrl !== undefined)
                linkData.link = linkUrl;
            if (callToActionType !== undefined || linkUrl !== undefined) {
                const existingCta = asRecord(linkData.call_to_action) ?? {};
                const existingValue = asRecord(existingCta.value) ?? {};
                const ctaType = callToActionType ?? (typeof existingCta.type === 'string' ? existingCta.type : undefined);
                if (linkUrl !== undefined) {
                    existingValue.link = linkUrl;
                }
                if (ctaType) {
                    linkData.call_to_action = {
                        type: ctaType,
                        value: existingValue,
                    };
                }
            }
            existingStorySpec.link_data = linkData;
        }
        if (Object.keys(existingStorySpec).length > 0) {
            updateData.object_story_spec = existingStorySpec;
        }
    }
    if (Object.keys(updateData).length === 1) {
        return { success: true };
    }
    try {
        const { payload } = await metaAdsClient.executeRequest<{
            success?: boolean;
            error?: {
                message?: string;
                type?: string;
            };
        }>({
            url: `${url}?${params.toString()}`,
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updateData),
            operation: 'updateMetaAdCreative',
            maxRetries,
        });
        if (payload?.error) {
            return {
                success: false,
                error: payload.error.message || 'Failed to update creative',
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
