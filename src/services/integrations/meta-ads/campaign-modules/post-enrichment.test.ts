import { describe, expect, it, vi, afterEach } from 'vitest'

import type { MetaCreative } from '../types'
import * as postEnrichment from './post-enrichment'
import {
  enrichMetaCreativesWithObjectStoryMedia,
  needsObjectStoryMediaEnrichment,
} from './post-enrichment'

function creative(overrides: Partial<MetaCreative> = {}): MetaCreative {
  return {
    adId: 'ad_1',
    adSetId: 'adset_1',
    campaignId: 'camp_1',
    status: 'ACTIVE',
    type: 'boosted_post',
    objectStoryId: '111_222',
    ...overrides,
  }
}

describe('needsObjectStoryMediaEnrichment', () => {
  it('returns true for boosted_post without media', () => {
    expect(needsObjectStoryMediaEnrichment(creative())).toBe(true)
  })

  it('returns false when imageUrl is present', () => {
    expect(needsObjectStoryMediaEnrichment(creative({ imageUrl: 'https://cdn.example/img.jpg' }))).toBe(
      false,
    )
  })

  it('still enriches boosted posts when only videoId is present', () => {
    expect(needsObjectStoryMediaEnrichment(creative({ videoId: '999' }))).toBe(true)
  })
})

describe('enrichMetaCreativesWithObjectStoryMedia', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('enriches boosted video posts with thumbnail from page post', async () => {
    vi.spyOn(postEnrichment, 'fetchMetaObjectStoryMedia').mockResolvedValue({
      imageUrl: 'https://cdn.example/post-thumb.jpg',
      videoUrl: 'https://cdn.example/post-video.mp4',
      permalinkUrl: 'https://www.facebook.com/page/posts/456',
      message: 'Boosted caption',
    })

    const result = await enrichMetaCreativesWithObjectStoryMedia('token', [creative()])

    expect(postEnrichment.fetchMetaObjectStoryMedia).toHaveBeenCalledWith(
      expect.objectContaining({ objectStoryId: '111_222', accessToken: 'token' }),
    )
    expect(result[0]?.imageUrl).toBe('https://cdn.example/post-thumb.jpg')
    expect(result[0]?.videoUrl).toBe('https://cdn.example/post-video.mp4')
    expect(result[0]?.landingPageUrl).toBe('https://www.facebook.com/page/posts/456')
    expect(result[0]?.descriptions).toEqual(['Boosted caption'])
  })
})
