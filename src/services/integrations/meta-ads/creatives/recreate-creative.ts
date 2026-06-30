import { updateMetaAd } from './ads';
import { createMetaAdCreative } from './create-creative';
import { deleteMetaAdCreative } from './creative-mutations';
import { mergeMetaDestinationSpec } from './destination-spec';
import { resolveMetaCreativeContextForEdit } from './creative-context';
import { extractVideoThumbnailFromAssetFeed, normalizeMetaObjectTypeForCreate, } from './spec-builders';
import type { RecreateMetaAdCreativeOptions } from './types';
export async function recreateMetaAdCreativeForEdit(options: RecreateMetaAdCreativeOptions): Promise<{
    success: boolean;
    creativeId: string;
    error?: string;
}> {
    const { accessToken, adAccountId, adId, creativeId, name, title, body, description, callToActionType, linkUrl, objectType, imageUrl, imageHash, videoId, pageId, instagramActorId, assetFeedSpec, carouselChildAttachments, destinationSpec, maxRetries, } = options;
    const normalizedObjectType = normalizeMetaObjectTypeForCreate(objectType);
    const storyContext = await resolveMetaCreativeContextForEdit({
        accessToken,
        adId,
        creativeId,
        pageId,
        instagramActorId,
        maxRetries,
    });
    if (!storyContext.pageId) {
        return {
            success: false,
            creativeId: '',
            error: 'Meta creative update requires a Facebook Page ID',
        };
    }
    const assetFeedThumbnail = extractVideoThumbnailFromAssetFeed(assetFeedSpec);
    const resolvedVideoId = videoId ?? storyContext.videoId;
    const resolvedImageUrl = imageUrl ?? storyContext.videoImageUrl ?? assetFeedThumbnail.imageUrl;
    const resolvedImageHash = imageHash ?? storyContext.videoImageHash ?? assetFeedThumbnail.imageHash;
    if (normalizedObjectType === 'VIDEO' && !resolvedVideoId) {
        return {
            success: false,
            creativeId: '',
            error: 'Meta video creative update requires a video ID',
        };
    }
    if (normalizedObjectType === 'VIDEO' && !resolvedImageUrl && !resolvedImageHash) {
        return {
            success: false,
            creativeId: '',
            error: 'Meta video creative update requires a video thumbnail (image_url or image_hash).',
        };
    }
    const createdCreative = await createMetaAdCreative({
        accessToken,
        adAccountId,
        name: name?.trim() || `Updated Creative ${adId}`,
        objectType: normalizedObjectType,
        title,
        body,
        description,
        callToActionType,
        linkUrl,
        imageUrl: resolvedImageUrl,
        imageHash: resolvedImageHash,
        videoId: resolvedVideoId,
        pageId: storyContext.pageId,
        instagramActorId: storyContext.instagramActorId,
        instagramUserId: storyContext.instagramUserId,
        assetFeedSpec,
        carouselChildAttachments,
        destinationSpec: mergeMetaDestinationSpec(destinationSpec, linkUrl),
        maxRetries,
    });
    if (!createdCreative.success) {
        return createdCreative;
    }
    const updateResult = await updateMetaAd({
        accessToken,
        adId,
        creativeId: createdCreative.creativeId,
        name,
        maxRetries,
    });
    if (updateResult.success) {
        return {
            success: true,
            creativeId: createdCreative.creativeId,
        };
    }
    await deleteMetaAdCreative({
        accessToken,
        creativeId: createdCreative.creativeId,
        maxRetries,
    }).catch(() => undefined);
    return {
        success: false,
        creativeId: '',
        error: updateResult.error || 'Failed to update ad creative reference',
    };
}
