import { describe, expect, it } from 'vitest'

import { formatSurfaceHeadline, toSocialOverviewSnapshot } from './socialSummary'

describe('toSocialOverviewSnapshot', () => {
  it('computes engagement rate from reach and engaged users', () => {
    const snapshot = toSocialOverviewSnapshot('instagram', {
      impressions: 12000,
      reach: 8000,
      engagedUsers: 400,
      rowCount: 14,
    })

    expect(snapshot?.engagementRate).toBe(5)
    expect(formatSurfaceHeadline('instagram', snapshot!)).toContain('8.0K reach')
  })
})
