import { describe, expect, it } from 'vitest'

import { extractLeadGenFormId, isLeadGenAd } from './leads'

describe('extractLeadGenFormId', () => {
  it('reads form id from ad level', () => {
    expect(extractLeadGenFormId({ leadgen_form_id: 'ad_form' }, null)).toBe('ad_form')
  })

  it('reads form id from video_data CTA', () => {
    expect(
      extractLeadGenFormId(null, {
        object_story_spec: {
          video_data: {
            call_to_action: { value: { leadgen_form_id: 'vid_form' } },
          },
        },
      })
    ).toBe('vid_form')
  })

  it('reads form id from carousel child attachment CTA', () => {
    expect(
      extractLeadGenFormId(null, {
        object_story_spec: {
          link_data: {
            child_attachments: [
              { call_to_action: { value: { link: 'https://x.com' } } },
              { call_to_action: { value: { leadgen_form_id: 'card_form' } } },
            ],
          },
        },
      })
    ).toBe('card_form')
  })

  it('reads form id from template_data CTA', () => {
    expect(
      extractLeadGenFormId(null, {
        object_story_spec: {
          template_data: {
            call_to_action: { value: { leadgen_form_id: 'tpl_form' } },
          },
        },
      })
    ).toBe('tpl_form')
  })

  it('reads creative root leadgen_form_id when present', () => {
    expect(extractLeadGenFormId(null, { leadgen_form_id: 'root_form' })).toBe('root_form')
  })
})

describe('isLeadGenAd', () => {
  it('returns true when ad has leadgen_form_id', () => {
    expect(isLeadGenAd(null, { leadgen_form_id: 'x' })).toBe(true)
  })

  it('returns true for video lead CTA', () => {
    expect(
      isLeadGenAd({
        object_story_spec: {
          video_data: {
            call_to_action: { value: { leadgen_form_id: 'v' } },
          },
        },
      })
    ).toBe(true)
  })
})
