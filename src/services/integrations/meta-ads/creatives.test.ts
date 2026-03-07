import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  mergeMetaDestinationSpec,
  normalizeMetaObjectTypeForCreate,
  recreateMetaAdCreativeForEdit,
} from './creatives'
import { metaAdsClient } from '../shared/base-client'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('normalizeMetaObjectTypeForCreate', () => {
  it('maps Meta photo-like types to IMAGE', () => {
    expect(normalizeMetaObjectTypeForCreate(undefined)).toBe('IMAGE')
    expect(normalizeMetaObjectTypeForCreate('PHOTO')).toBe('IMAGE')
    expect(normalizeMetaObjectTypeForCreate('IMAGE')).toBe('IMAGE')
  })

  it('preserves supported carousel and video create types', () => {
    expect(normalizeMetaObjectTypeForCreate('VIDEO')).toBe('VIDEO')
    expect(normalizeMetaObjectTypeForCreate('CAROUSEL_IMAGE')).toBe('CAROUSEL_IMAGE')
    expect(normalizeMetaObjectTypeForCreate('CAROUSEL')).toBe('CAROUSEL_IMAGE')
    expect(normalizeMetaObjectTypeForCreate('DYNAMIC')).toBe('DYNAMIC_CAROUSEL')
  })
})

describe('mergeMetaDestinationSpec', () => {
  it('returns the original spec when no landing page override is provided', () => {
    const spec = {
      url: 'https://example.com/original',
      fallback_url: 'https://example.com/fallback',
      additional_urls: ['https://example.com/extra'],
    }

    expect(mergeMetaDestinationSpec(spec)).toEqual(spec)
  })

  it('overrides the primary url while preserving fallback and additional urls', () => {
    expect(mergeMetaDestinationSpec({
      fallback_url: 'https://example.com/fallback',
      additional_urls: ['https://example.com/extra'],
    }, ' https://example.com/updated ')).toEqual({
      url: 'https://example.com/updated',
      fallback_url: 'https://example.com/fallback',
      additional_urls: ['https://example.com/extra'],
    })
  })

  it('creates a new destination spec from the landing page when none exists', () => {
    expect(mergeMetaDestinationSpec(undefined, 'https://example.com/new')).toEqual({
      url: 'https://example.com/new',
      fallback_url: 'https://example.com/new',
    })
  })
})

describe('recreateMetaAdCreativeForEdit', () => {
  it('recovers the current page and instagram actor from Meta when the edit payload does not include them', async () => {
    const executeRequest = vi.spyOn(metaAdsClient, 'executeRequest')

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
      })

    const result = await recreateMetaAdCreativeForEdit({
      accessToken: 'token',
      adAccountId: 'act_123',
      adId: 'ad_123',
      creativeId: 'creative_existing',
      name: 'Updated creative',
      title: 'New headline',
      body: 'New body',
    })

    expect(result).toEqual({
      success: true,
      creativeId: 'creative_new',
    })

    expect(executeRequest).toHaveBeenCalledTimes(3)
    expect(executeRequest.mock.calls[0]?.[0]).toMatchObject({
      operation: 'readMetaCreativeForUpdate',
    })
    expect(executeRequest.mock.calls[1]?.[0]).toMatchObject({
      operation: 'createMetaAdCreative',
    })
    expect(executeRequest.mock.calls[2]?.[0]).toMatchObject({
      operation: 'updateMetaAd',
    })

    const createRequest = executeRequest.mock.calls[1]?.[0]
    const body = JSON.parse(String(createRequest?.body)) as {
      object_story_spec?: {
        page_id?: string
        instagram_actor_id?: string
      }
    }

    expect(body.object_story_spec?.page_id).toBe('page_123')
    expect(body.object_story_spec?.instagram_actor_id).toBe('ig_456')
  })
})
