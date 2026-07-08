import { asErrorMessage } from '@/lib/convex-errors';
import { META_API_BASE } from '../client';
import { inferUploadMimeType, isVideoMimeType } from './shared';
import type { UploadMediaOptions } from './types';
export async function uploadVideoToMeta(options: UploadMediaOptions): Promise<{
    success: boolean;
    videoId?: string;
    error?: string;
}> {
    const { accessToken, adAccountId, fileName, fileData, mimeType } = options;
    const formattedAccountId = adAccountId.startsWith('act_') ? adAccountId : `act_${adAccountId}`;
    const resolvedMime = inferUploadMimeType(fileName, mimeType);
    const buffer = new ArrayBuffer(fileData.length);
    const view = new Uint8Array(buffer);
    view.set(fileData);
    const blob = new Blob([buffer], { type: resolvedMime });
    const formData = new FormData();
    formData.append('source', blob, fileName);
    formData.append('access_token', accessToken);
    const url = `${META_API_BASE}/${formattedAccountId}/advideos`;
    try {
        const response = await fetch(url, { method: 'POST', body: formData });
        const result = (await response.json()) as {
            id?: string;
            error?: {
                message?: string;
            };
        };
        if (result?.error) {
            return { success: false, error: result.error.message || 'Failed to upload video' };
        }
        return { success: true, videoId: result.id };
    }
    catch (error) {
        return {
            success: false,
            error: asErrorMessage(error, 'Unknown error'),
        };
    }
}
export async function uploadMediaToMeta(options: UploadMediaOptions): Promise<{
    success: boolean;
    creativeSpec?: string;
    videoId?: string;
    mediaType?: 'image' | 'video';
    error?: string;
}> {
    const resolvedMime = inferUploadMimeType(options.fileName, options.mimeType);
    if (isVideoMimeType(resolvedMime)) {
        const videoResult = await uploadVideoToMeta(options);
        return {
            success: videoResult.success,
            videoId: videoResult.videoId,
            mediaType: 'video',
            error: videoResult.error,
        };
    }
    const { accessToken, adAccountId, fileName, fileData } = options;
    const formattedAccountId = adAccountId.startsWith('act_') ? adAccountId : `act_${adAccountId}`;
    const formData = new FormData();
    const buffer = new ArrayBuffer(fileData.length);
    const view = new Uint8Array(buffer);
    view.set(fileData);
    const blob = new Blob([buffer], { type: resolvedMime });
    formData.append('source', blob, fileName);
    formData.append('access_token', accessToken);
    const url = `${META_API_BASE}/${formattedAccountId}/adimages`;
    try {
        const response = await fetch(url, {
            method: 'POST',
            body: formData,
        });
        const result = (await response.json()) as {
            images?: Record<string, {
                hash?: string;
                url?: string;
            }>;
            error?: {
                message?: string;
            };
        };
        if (result?.error) {
            return {
                success: false,
                error: result.error.message || 'Failed to upload media',
            };
        }
        const firstImage = result?.images ? Object.values(result.images)[0] : undefined;
        const creativeSpec = firstImage?.hash ?? firstImage?.url;
        return {
            success: true,
            creativeSpec,
            mediaType: 'image',
        };
    }
    catch (error) {
        return {
            success: false,
            error: asErrorMessage(error, 'Unknown error'),
        };
    }
}
