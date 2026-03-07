import { describe, expect, it } from 'vitest'

import { extractMetaCreativeContent } from './creatives'

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
})