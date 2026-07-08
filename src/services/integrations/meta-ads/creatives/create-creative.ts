import { asErrorMessage } from '@/lib/convex-errors';
import { appendMetaAuthParams, META_API_BASE } from '../client';
import { metaAdsClient } from '@/services/integrations/shared/base-client';
import { toMetaApiDestinationSpec } from './destination-spec';
import { applyInstagramPlacement, assetFeedSpecUsesCopyVariants, parseAssetFeedSpecForApi, parseCarouselChildAttachmentsOption, } from './spec-builders';
import type { CreateAdCreativeOptions } from './types';
export async function createMetaAdCreative(options: CreateAdCreativeOptions): Promise<{
    success: boolean;
    creativeId: string;
    error?: string;
}> {
    const { accessToken, adAccountId, name, objectType = 'IMAGE', title, body, description, callToActionType, linkUrl, imageUrl, imageHash, videoId, pageId, instagramActorId, instagramUserId, assetFeedSpec, carouselChildAttachments, destinationSpec, leadgenFormId, maxRetries, } = options;
    const formattedAccountId = adAccountId.startsWith('act_') ? adAccountId : `act_${adAccountId}`;
    const objectStorySpec: Record<string, unknown> = {};
    const carouselChildren = parseCarouselChildAttachmentsOption({ carouselChildAttachments, assetFeedSpec });
    const apiAssetFeedSpec = parseAssetFeedSpecForApi(assetFeedSpec);
    const usesAssetFeedCopy = assetFeedSpecUsesCopyVariants(assetFeedSpec);
    const instagramPlacement = { instagramActorId, instagramUserId };
    if (leadgenFormId) {
        objectStorySpec.page_id = pageId;
        applyInstagramPlacement(objectStorySpec, instagramPlacement);
        const linkData: Record<string, unknown> = {
            call_to_action: {
                type: callToActionType || 'SIGN_UP',
                value: { leadgen_form_id: leadgenFormId },
            },
            picture: imageUrl || undefined,
            image_hash: imageHash || undefined,
        };
        if (!usesAssetFeedCopy) {
            if (body)
                linkData.message = body;
            if (title)
                linkData.name = title;
        }
        objectStorySpec.link_data = linkData;
    }
    else if (objectType === 'IMAGE' || objectType === 'VIDEO') {
        objectStorySpec.page_id = pageId;
        applyInstagramPlacement(objectStorySpec, instagramPlacement);
        if (objectType === 'IMAGE') {
            const linkData: Record<string, unknown> = {
                call_to_action: callToActionType ? { type: callToActionType } : undefined,
                link: linkUrl,
                picture: imageUrl || undefined,
                image_hash: imageHash || undefined,
            };
            if (!usesAssetFeedCopy) {
                if (body)
                    linkData.message = body;
                if (title)
                    linkData.name = title;
                if (description)
                    linkData.caption = description;
            }
            objectStorySpec.link_data = linkData;
        }
        else if (objectType === 'VIDEO') {
            const videoData: Record<string, unknown> = {
                video_id: videoId,
            };
            if (imageHash) {
                videoData.image_hash = imageHash;
            }
            else if (imageUrl) {
                videoData.image_url = imageUrl;
            }
            if (linkUrl) {
                videoData.call_to_action = {
                    type: callToActionType || 'LEARN_MORE',
                    value: { link: linkUrl },
                };
            }
            if (!usesAssetFeedCopy) {
                if (body)
                    videoData.message = body;
                if (title)
                    videoData.title = title;
            }
            objectStorySpec.video_data = videoData;
        }
    }
    else if (objectType === 'CAROUSEL_IMAGE' || objectType === 'CAROUSEL_VIDEO') {
        objectStorySpec.page_id = pageId;
        applyInstagramPlacement(objectStorySpec, instagramPlacement);
        objectStorySpec.link_data = {
            call_to_action: callToActionType ? { type: callToActionType } : undefined,
            link: linkUrl,
            ...(carouselChildren && carouselChildren.length > 0 ? { child_attachments: carouselChildren } : {}),
        };
    }
    else if (objectType === 'DYNAMIC_CAROUSEL') {
        objectStorySpec.page_id = pageId;
        applyInstagramPlacement(objectStorySpec, instagramPlacement);
        objectStorySpec.link_data = {
            call_to_action: callToActionType ? { type: callToActionType } : undefined,
            link: linkUrl,
            ...(carouselChildren && carouselChildren.length > 0 ? { child_attachments: carouselChildren } : {}),
        };
    }
    const params = new URLSearchParams();
    await appendMetaAuthParams({ params, accessToken, appSecret: process.env.META_APP_SECRET });
    const url = `${META_API_BASE}/${formattedAccountId}/adcreatives`;
    const bodyData: Record<string, unknown> = {
        name,
        object_story_spec: objectStorySpec,
        access_token: accessToken,
    };
    const apiDestinationSpec = toMetaApiDestinationSpec(destinationSpec);
    if (apiDestinationSpec) {
        bodyData.destination_spec = apiDestinationSpec;
    }
    if (apiAssetFeedSpec) {
        bodyData.asset_feed_spec = apiAssetFeedSpec;
    }
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
            operation: 'createMetaAdCreative',
            maxRetries,
        });
        if (payload?.error || !payload?.id) {
            const metaError = payload?.error as {
                message?: string;
                error_user_msg?: string;
                error_user_title?: string;
            } | undefined;
            const errorMessage = metaError?.error_user_msg
                || metaError?.error_user_title
                || metaError?.message
                || 'Failed to create creative';
            return {
                success: false,
                creativeId: '',
                error: errorMessage,
            };
        }
        return {
            success: true,
            creativeId: payload.id,
        };
    }
    catch (error) {
        return {
            success: false,
            creativeId: '',
            error: asErrorMessage(error, 'Unknown error'),
        };
    }
}
