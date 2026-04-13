import { describe, expect, it } from 'vitest'

import { extractMetaCreativeContent, inferMetaDisplayAdType } from './creatives'

describe('extractMetaCreativeContent', () => {
  it('prefers Meta asset feed bodies and titles for dynamic creatives', () => {
    const result = extractMetaCreativeContent({
      body: 'Fallback body',
      title: 'Fallback title',
      link_url: 'https://example.com/fallback',
      call_to_action_type: 'LEARN_MORE',
      asset_feed_spec: {
        bodies: [{ text: 'Primary text variant A' }, { text: 'Primary text variant B' }],
        titles: [{ text: 'Headline A' }, { text: 'Headline B' }],
        descriptions: [{ text: 'Supporting description' }],
        link_urls: [{ website_url: 'https://example.com/landing' }],
      },
      object_story_spec: {
        link_data: {
          message: 'Fallback body',
          name: 'Fallback title',
        },
      },
    })

    expect(result.primaryTexts).toEqual([
      'Fallback body',
      'Primary text variant A',
      'Primary text variant B',
    ])
    expect(result.headlines).toEqual(['Fallback title', 'Headline A', 'Headline B'])
    expect(result.supportingDescriptions).toEqual(['Supporting description'])
    expect(result.landingPageUrl).toBe('https://example.com/fallback')
    expect(result.callToAction).toBe('LEARN_MORE')
  })

  it('falls back to classic object_story_spec values for standard creatives', () => {
    const result = extractMetaCreativeContent({
      object_story_spec: {
        video_data: {
          message: 'Video primary text',
          title: 'Video headline',
          call_to_action: {
            type: 'SIGN_UP',
            name: 'Sign Up',
            value: { link: 'https://example.com/signup' },
          },
        },
      },
    })

    expect(result.primaryText).toBe('Video primary text')
    expect(result.primaryTexts).toEqual(['Video primary text'])
    expect(result.headlines).toEqual(['Video headline'])
    expect(result.landingPageUrl).toBe('https://example.com/signup')
    expect(result.callToAction).toBe('Sign Up (SIGN_UP)')
  })

  it('merges carousel child_attachments into copy and landing URLs', () => {
    const result = extractMetaCreativeContent({
      object_story_spec: {
        link_data: {
          message: 'Root message',
          child_attachments: [
            { message: 'Card A', name: 'Title A', link: 'https://example.com/a' },
            { message: 'Card B', link: 'https://example.com/b' },
          ],
        },
      },
    })

    expect(result.primaryTexts).toEqual(['Root message', 'Card A', 'Card B'])
    expect(result.headlines).toEqual(['Title A'])
    expect(result.landingPageUrl).toBe('https://example.com/a')
  })
})

describe('inferMetaDisplayAdType', () => {
  it('returns carousel when two or more child attachments', () => {
    expect(
      inferMetaDisplayAdType({
        storySpec: {
          link_data: {
            child_attachments: [{ link: 'https://a.com' }, { link: 'https://b.com' }],
          },
        },
      })
    ).toBe('carousel')
  })

  it('returns lead_generation when form id present', () => {
    expect(inferMetaDisplayAdType({ leadgenFormId: '123' })).toBe('lead_generation')
  })

  it('returns boosted_post when object_story_id set and no inline story spec', () => {
    expect(
      inferMetaDisplayAdType({
        objectStoryId: '1234567890_9876543210',
        storySpec: {},
      })
    ).toBe('boosted_post')
  })

  it('returns dynamic_product when template_data has copy', () => {
    expect(
      inferMetaDisplayAdType({
        storySpec: {
          template_data: { message: 'Shop the collection', link: 'https://shop.example' },
        },
      })
    ).toBe('dynamic_product')
  })
})