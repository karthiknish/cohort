import { afterEach, describe, expect, it, vi } from 'vitest';
import { createMetaAdCreative, mergeMetaDestinationSpec, normalizeMetaObjectTypeForCreate, recreateMetaAdCreativeForEdit, sanitizeMetaDestinationSpec, toMetaApiDestinationSpec, } from './creatives';
import { metaAdsClient } from '../shared/base-client';
afterEach(() => {
    vi.restoreAllMocks();
});
describe('normalizeMetaObjectTypeForCreate', () => {
    it('maps Meta photo-like types to IMAGE', () => {
        expect(normalizeMetaObjectTypeForCreate(undefined)).toBe('IMAGE');
        expect(normalizeMetaObjectTypeForCreate('PHOTO')).toBe('IMAGE');
        expect(normalizeMetaObjectTypeForCreate('IMAGE')).toBe('IMAGE');
    });
    it('preserves supported carousel and video create types', () => {
        expect(normalizeMetaObjectTypeForCreate('VIDEO')).toBe('VIDEO');
        expect(normalizeMetaObjectTypeForCreate('CAROUSEL_IMAGE')).toBe('CAROUSEL_IMAGE');
        expect(normalizeMetaObjectTypeForCreate('CAROUSEL')).toBe('CAROUSEL_IMAGE');
        expect(normalizeMetaObjectTypeForCreate('DYNAMIC')).toBe('DYNAMIC_CAROUSEL');
    });
});
describe('sanitizeMetaDestinationSpec', () => {
    it('preserves website optimization for API round-trip', () => {
        expect(sanitizeMetaDestinationSpec({
            website: {
                optimization: { status: 'OPT_OUT', type: 'website_destination_optimization' },
            },
        })).toEqual({
            website: {
                optimization: { status: 'OPT_OUT', type: 'website_destination_optimization' },
            },
        });
    });
    it('keeps url fields for UI while stripping unknown keys', () => {
        expect(sanitizeMetaDestinationSpec({
            url: 'https://example.com/a',
            fallback_url: 'https://example.com/b',
            additional_urls: ['https://example.com/c', '  '],
            website: { optimization: { status: 'OPT_OUT' } },
            unknown_key: true,
        })).toEqual({
            url: 'https://example.com/a',
            fallback_url: 'https://example.com/b',
            additional_urls: ['https://example.com/c'],
            website: {
                optimization: { status: 'OPT_OUT' },
            },
        });
    });
});
describe('toMetaApiDestinationSpec', () => {
    it('returns only the website object for Meta create payloads', () => {
        expect(toMetaApiDestinationSpec({
            url: 'https://example.com/a',
            website: {
                optimization: { status: 'OPT_OUT', type: 'website_destination_optimization' },
            },
        })).toEqual({
            website: {
                optimization: { status: 'OPT_OUT', type: 'website_destination_optimization' },
            },
        });
    });
    it('returns undefined when no website block exists', () => {
        expect(toMetaApiDestinationSpec({
            url: 'https://example.com/a',
            fallback_url: 'https://example.com/b',
        })).toBeUndefined();
    });
});
describe('mergeMetaDestinationSpec', () => {
    it('does not inject url into destination_spec (landing page uses linkUrl)', () => {
        expect(mergeMetaDestinationSpec({
            website: {
                optimization: { status: 'OPT_OUT', type: 'website_destination_optimization' },
            },
        }, 'https://example.com/updated')).toEqual({
            website: {
                optimization: { status: 'OPT_OUT', type: 'website_destination_optimization' },
            },
        });
    });
    it('returns undefined when only legacy url fields are present', () => {
        expect(mergeMetaDestinationSpec({
            url: 'https://example.com/original',
            fallback_url: 'https://example.com/fallback',
        }, 'https://example.com/updated')).toBeUndefined();
    });
});
describe('createMetaAdCreative', () => {
    it('omits description from video_data and sends copy via asset_feed_spec', async () => {
        const executeRequest = vi.spyOn(metaAdsClient, 'executeRequest');
        executeRequest.mockResolvedValueOnce({
            response: {} as Response,
            payload: { id: 'creative_video' },
        });
        await createMetaAdCreative({
            accessToken: 'token',
            adAccountId: 'act_123',
            name: 'Video creative',
            objectType: 'VIDEO',
            pageId: 'page_123',
            videoId: 'video_123',
            imageUrl: 'https://www.facebook.com/ads/image/?d=thumb',
            linkUrl: 'https://example.com/landing',
            callToActionType: 'BOOK_NOW',
            title: 'Headline',
            body: 'Primary text',
            description: 'Should not be sent on video_data',
            assetFeedSpec: JSON.stringify({
                bodies: [{ text: 'Primary text' }],
                titles: [{ text: 'Headline' }],
                videos: [{ video_id: 'video_123' }],
            }),
        });
        const createRequest = executeRequest.mock.calls[0]?.[0];
        const body = JSON.parse(String(createRequest?.body)) as {
            object_story_spec?: {
                video_data?: Record<string, unknown>;
            };
            asset_feed_spec?: {
                bodies?: unknown[];
            };
        };
        expect(body.object_story_spec?.video_data).not.toHaveProperty('description');
        expect(body.object_story_spec?.video_data).not.toHaveProperty('message');
        expect(body.object_story_spec?.video_data).not.toHaveProperty('title');
        expect(body.object_story_spec?.video_data?.image_url).toBe('https://www.facebook.com/ads/image/?d=thumb');
        expect(body.asset_feed_spec?.bodies).toHaveLength(1);
    });
});
describe('recreateMetaAdCreativeForEdit', () => {
    it('recovers the current page and instagram actor from Meta when the edit payload does not include them', async () => {
        const executeRequest = vi.spyOn(metaAdsClient, 'executeRequest');
        executeRequest
            .mockResolvedValueOnce({
            response: {} as Response,
            payload: {
                object_story_spec: {
                    page_id: 'page_123',
                    instagram_actor_id: 'ig_456',
                },
            },
        })
            .mockResolvedValueOnce({
            response: {} as Response,
            payload: {
                id: 'creative_new',
            },
        })
            .mockResolvedValueOnce({
            response: {} as Response,
            payload: {
                success: true,
            },
        });
        const result = await recreateMetaAdCreativeForEdit({
            accessToken: 'token',
            adAccountId: 'act_123',
            adId: 'ad_123',
            creativeId: 'creative_existing',
            objectType: 'IMAGE',
            name: 'Updated creative',
            title: 'New headline',
            body: 'New body',
        });
        expect(result).toEqual({
            success: true,
            creativeId: 'creative_new',
        });
        expect(executeRequest).toHaveBeenCalledTimes(3);
        expect(executeRequest.mock.calls[0]?.[0]).toMatchObject({
            operation: 'readMetaCreativeForUpdate',
        });
        expect(executeRequest.mock.calls.find((call) => call[0]?.operation === 'createMetaAdCreative')?.[0]).toMatchObject({
            operation: 'createMetaAdCreative',
        });
    });
    it('passes website destination_spec when provided', async () => {
        const executeRequest = vi.spyOn(metaAdsClient, 'executeRequest');
        executeRequest
            .mockResolvedValueOnce({
            response: {} as Response,
            payload: {
                object_story_spec: { page_id: 'page_123', instagram_actor_id: 'ig_456' },
            },
        })
            .mockResolvedValueOnce({
            response: {} as Response,
            payload: { id: 'creative_new' },
        })
            .mockResolvedValueOnce({
            response: {} as Response,
            payload: { success: true },
        });
        await recreateMetaAdCreativeForEdit({
            accessToken: 'token',
            adAccountId: 'act_123',
            adId: 'ad_123',
            creativeId: 'creative_existing',
            objectType: 'IMAGE',
            pageId: 'page_123',
            instagramActorId: 'ig_456',
            linkUrl: 'https://example.com/landing',
            destinationSpec: {
                website: {
                    optimization: { status: 'OPT_OUT', type: 'website_destination_optimization' },
                },
            },
        });
        const createRequest = executeRequest.mock.calls.find((call) => call[0]?.operation === 'createMetaAdCreative')?.[0];
        expect(createRequest?.body).toBeTruthy();
        const body = JSON.parse(String(createRequest?.body)) as {
            destination_spec?: {
                website?: {
                    optimization?: {
                        status?: string;
                    };
                };
            };
        };
        expect(body.destination_spec).toEqual({
            website: {
                optimization: { status: 'OPT_OUT', type: 'website_destination_optimization' },
            },
        });
        expect(body.destination_spec).not.toHaveProperty('url');
    });
    it('uses instagram_user_id when the existing creative only has that field', async () => {
        const executeRequest = vi.spyOn(metaAdsClient, 'executeRequest');
        executeRequest
            .mockResolvedValueOnce({
            response: {} as Response,
            payload: {
                object_story_spec: {
                    page_id: 'page_123',
                    instagram_user_id: '17841460862993189',
                    video_data: {
                        video_id: 'video_123',
                        image_url: 'https://www.facebook.com/ads/image/?d=existing-thumb',
                    },
                },
            },
        })
            .mockResolvedValueOnce({
            response: {} as Response,
            payload: { id: 'creative_new' },
        })
            .mockResolvedValueOnce({
            response: {} as Response,
            payload: { success: true },
        });
        await recreateMetaAdCreativeForEdit({
            accessToken: 'token',
            adAccountId: 'act_123',
            adId: 'ad_123',
            creativeId: 'creative_existing',
            objectType: 'VIDEO',
            videoId: 'video_123',
            linkUrl: 'https://example.com/landing',
            assetFeedSpec: JSON.stringify({
                bodies: [{ text: 'Body' }],
                titles: [{ text: 'Title' }],
                videos: [{ video_id: 'video_123' }],
            }),
        });
        const createRequest = executeRequest.mock.calls.find((call) => call[0]?.operation === 'createMetaAdCreative')?.[0];
        const body = JSON.parse(String(createRequest?.body)) as {
            object_story_spec?: {
                instagram_actor_id?: string;
                instagram_user_id?: string;
            };
        };
        expect(body.object_story_spec?.instagram_user_id).toBe('17841460862993189');
        expect(body.object_story_spec?.instagram_actor_id).toBeUndefined();
    });
    it('reuses video thumbnail from the existing creative when recreating video ads', async () => {
        const executeRequest = vi.spyOn(metaAdsClient, 'executeRequest');
        executeRequest
            .mockResolvedValueOnce({
            response: {} as Response,
            payload: {
                object_story_spec: {
                    page_id: 'page_123',
                    instagram_user_id: '17841460862993189',
                    video_data: {
                        video_id: 'video_123',
                        image_url: 'https://www.facebook.com/ads/image/?d=existing-thumb',
                    },
                },
            },
        })
            .mockResolvedValueOnce({
            response: {} as Response,
            payload: { id: 'creative_new' },
        })
            .mockResolvedValueOnce({
            response: {} as Response,
            payload: { success: true },
        });
        const result = await recreateMetaAdCreativeForEdit({
            accessToken: 'token',
            adAccountId: 'act_123',
            adId: 'ad_123',
            creativeId: 'creative_existing',
            objectType: 'VIDEO',
            videoId: 'video_123',
            linkUrl: 'https://example.com/landing',
            callToActionType: 'BOOK_NOW',
            assetFeedSpec: JSON.stringify({
                bodies: [{ text: 'Updated body' }],
                titles: [{ text: 'Updated title' }],
                videos: [{ video_id: 'video_123' }],
            }),
        });
        expect(result).toEqual({ success: true, creativeId: 'creative_new' });
        const createRequest = executeRequest.mock.calls.find((call) => call[0]?.operation === 'createMetaAdCreative')?.[0];
        const body = JSON.parse(String(createRequest?.body)) as {
            object_story_spec?: {
                video_data?: Record<string, unknown>;
                instagram_user_id?: string;
            };
        };
        expect(body.object_story_spec?.video_data?.image_url).toBe('https://www.facebook.com/ads/image/?d=existing-thumb');
        expect(body.object_story_spec?.instagram_user_id).toBe('17841460862993189');
    });
});
