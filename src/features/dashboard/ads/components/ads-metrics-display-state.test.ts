import { describe, expect, it } from 'vitest'

import {
  adsMetricsEmptyCopy,
  resolveAdsMetricsDisplayState,
} from './ads-metrics-display-state'

describe('resolveAdsMetricsDisplayState', () => {
  it('returns loading while metrics are loading', () => {
    expect(
      resolveAdsMetricsDisplayState({
        metricsLoading: true,
        connectedAccountCount: 1,
        hasSuccessfulSync: true,
        hasMetricData: false,
      }),
    ).toBe('loading')
  })

  it('returns synced_no_delivery when connected and synced but empty', () => {
    expect(
      resolveAdsMetricsDisplayState({
        metricsLoading: false,
        connectedAccountCount: 1,
        hasSuccessfulSync: true,
        hasMetricData: false,
      }),
    ).toBe('synced_no_delivery')
  })

  it('returns needs_sync when connected but never synced successfully', () => {
    expect(
      resolveAdsMetricsDisplayState({
        metricsLoading: false,
        connectedAccountCount: 1,
        hasSuccessfulSync: false,
        hasMetricData: false,
      }),
    ).toBe('needs_sync')
  })
})

describe('adsMetricsEmptyCopy', () => {
  it('describes dormant accounts clearly', () => {
    const copy = adsMetricsEmptyCopy('synced_no_delivery')
    expect(copy.title).toContain('No ad activity')
    expect(copy.description).toContain('dormant')
  })
})
