import { describe, expect, it } from 'vitest'

import { assertOrganicMetricRow, buildOrganicMetricRow } from '../types'

describe('organic social metric guardrails', () => {
  it('rejects paid/ad fields', () => {
    expect(() => assertOrganicMetricRow({ spend: 12, impressions: 1 })).toThrow(/paid field/)
    expect(() => assertOrganicMetricRow({ campaign_id: '123', reach: 1 })).toThrow(/paid field/)
  })

  it('maps FB-style daily row without spend', () => {
    const row = buildOrganicMetricRow({
      surface: 'facebook',
      entityId: 'page_1',
      entityName: 'Test Page',
      date: '2026-05-01',
      impressions: 100,
      reach: 80,
      engagedUsers: 10,
      reactions: 4,
      comments: 2,
      shares: 1,
    })

    expect(row.engagementRate).toBeCloseTo(0.125)
    expect(row).not.toHaveProperty('spend')
  })

  it('maps IG-style daily row', () => {
    const row = buildOrganicMetricRow({
      surface: 'instagram',
      entityId: 'ig_1',
      entityName: 'brand',
      date: '2026-05-02',
      impressions: 200,
      reach: 150,
      engagedUsers: 20,
      saves: 3,
    })

    expect(row.surface).toBe('instagram')
    expect(row.saves).toBe(3)
  })
})
