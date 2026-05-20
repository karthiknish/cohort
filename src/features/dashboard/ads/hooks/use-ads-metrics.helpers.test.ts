import { describe, expect, it } from 'vitest'

import { endOfDay, startOfDay } from 'date-fns'

import {
  buildProviderSummariesFromServer,
  dedupeAndFilterMetrics,
  hasAdsMetricActivity,
  isAdsProviderId,
  isMetricDateInRange,
  mapRealtimeMetricRow,
  parseMetricDate,
} from './use-ads-metrics.helpers'
import type { MetricRecord } from '../components/types'

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

  it('parses YYYY-MM-DD as local calendar days (no UTC shift)', () => {
    const parsed = parseMetricDate('2026-03-11')
    expect(parsed?.getFullYear()).toBe(2026)
    expect(parsed?.getMonth()).toBe(2)
    expect(parsed?.getDate()).toBe(11)
  })

  it('keeps metrics in range when filtering by date', () => {
    const range = {
      start: startOfDay(new Date(2026, 2, 1)),
      end: endOfDay(new Date(2026, 2, 31)),
    }
    expect(isMetricDateInRange('2026-03-11', range)).toBe(true)

    const metrics: MetricRecord[] = [
      {
        id: '1',
        providerId: 'google',
        date: '2026-03-11',
        spend: 50,
        impressions: 100,
        clicks: 5,
        conversions: 0,
        revenue: null,
      },
    ]
    const filtered = dedupeAndFilterMetrics(metrics, range)
    expect(filtered).toHaveLength(1)
  })

  it('detects activity from server summary when row metrics are empty', () => {
    expect(
      hasAdsMetricActivity([], { totals: { spend: 282, impressions: 19417, clicks: 145, conversions: 0, revenue: 0 }, providers: {}, count: 1 }, null),
    ).toBe(true)
  })
})