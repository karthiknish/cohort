import { describe, expect, it } from 'vitest'

import {
  buildProviderSummariesFromServer,
  isAdsProviderId,
  mapRealtimeMetricRow,
} from './use-ads-metrics.helpers'

describe('useAdsMetrics helpers', () => {
  it('filters analytics-only providers from ads processing', () => {
    expect(isAdsProviderId('meta')).toBe(true)
    expect(isAdsProviderId('facebook_ads')).toBe(true)
    expect(isAdsProviderId('google-analytics')).toBe(false)
    expect(isAdsProviderId('ga4')).toBe(false)
  })

  it('maps realtime rows with campaign-aware ids and meta normalization', () => {
    const mapped = mapRealtimeMetricRow({
      providerId: 'meta_ads',
      accountId: 'act_123',
      publisherPlatform: 'instagram',
      campaignId: 'cmp_456',
      date: '2026-03-11',
      spend: 42.5,
      impressions: 1000,
      clicks: 50,
      conversions: 3,
      revenue: 120,
      createdAtMs: 1710000000000,
    })

    expect(mapped.providerId).toBe('facebook')
    expect(mapped.campaignId).toBe('cmp_456')
    expect(mapped.id).toContain('instagram')
    expect(mapped.id).toContain('cmp_456')
    expect(mapped.spend).toBe(42.5)
  })

  it('builds provider summaries without analytics bleed-through', () => {
    const summaries = buildProviderSummariesFromServer({
      meta_ads: { spend: 100, impressions: 1000, clicks: 50, conversions: 4, revenue: 250 },
      'google-analytics': { spend: 0, impressions: 500, clicks: 10, conversions: 1, revenue: 0 },
    })

    expect(summaries).toEqual({
      facebook: { spend: 100, impressions: 1000, clicks: 50, conversions: 4, revenue: 250 },
    })
  })
})