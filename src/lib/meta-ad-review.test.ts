import { describe, expect, it } from 'vitest'

import { summarizeMetaAdReview } from './meta-ad-review'

describe('summarizeMetaAdReview', () => {
  it('marks disapproved ads', () => {
    expect(summarizeMetaAdReview('DISAPPROVED')).toEqual({
      status: 'disapproved',
      messages: [],
    })
  })

  it('collects global feedback and issues', () => {
    const summary = summarizeMetaAdReview('ACTIVE', {
      global: { 'Policy violation': 'Landing page mismatch' },
    }, [
      { error_summary: 'Creative issue', error_message: 'Image text too dense' },
    ])
    expect(summary.status).toBe('issues')
    expect(summary.messages).toHaveLength(2)
  })

  it('marks pending review', () => {
    expect(summarizeMetaAdReview('PENDING_REVIEW').status).toBe('pending')
  })
})
