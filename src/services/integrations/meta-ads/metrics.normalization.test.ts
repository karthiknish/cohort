import { describe, expect, it } from 'vitest'

import { metaInsightRowsToNormalizedMetrics } from './metrics'

describe('metaInsightRowsToNormalizedMetrics', () => {
  it('maps spend and publisher breakdown', () => {
    const rows = [
      {
        date_start: '2026-04-01',
        campaign_id: 'c1',
        campaign_name: 'Test',
        impressions: '1000',
        clicks: '50',
        spend: '12.34',
        publisher_platform: 'facebook',
        account_currency: 'usd',
        actions: [{ action_type: 'purchase', value: '2' }],
        action_values: [{ action_type: 'offsite_conversion.purchase', value: '99' }],
      },
    ]

    const out = metaInsightRowsToNormalizedMetrics('act_999', rows)
    expect(out).toHaveLength(1)
    expect(out[0]?.providerId).toBe('facebook')
    expect(out[0]?.accountId).toBe('act_999')
    expect(out[0]?.spend).toBeCloseTo(12.34)
    expect(out[0]?.impressions).toBe(1000)
    expect(out[0]?.clicks).toBe(50)
    expect(out[0]?.publisherPlatform).toBe('facebook')
    expect(out[0]?.currency).toBe('USD')
    expect(out[0]?.conversions).toBe(2)
    expect(out[0]?.revenue).toBe(99)
  })
})
