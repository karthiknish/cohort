import { describe, expect, it } from 'vitest'

import {
  pickDefaultInsightsTab,
  providerSummariesToSyntheticMetrics,
  resolveChartProviderKey,
  tabHasChartData,
} from './insights-chart-utils'

describe('insights-chart-utils', () => {
  it('resolves meta selection to facebook chart keys', () => {
    expect(resolveChartProviderKey('meta', ['facebook', 'google'])).toBe('facebook')
    expect(resolveChartProviderKey('all', ['all', 'google'])).toBe('all')
  })

  it('builds synthetic metrics from provider summaries', () => {
    const rows = providerSummariesToSyntheticMetrics({
      meta_ads: { spend: 100, impressions: 1000, clicks: 40, conversions: 2, revenue: 0 },
    })
    expect(rows).toHaveLength(1)
    expect(rows[0]?.providerId).toBe('facebook')
    expect(rows[0]?.impressions).toBe(1000)
  })

  it('picks funnel tab when comparison has no spend', () => {
    const tab = pickDefaultInsightsTab({
      providerComparison: [{ metrics: { spend: 0, revenue: 0 } }],
      funnelCharts: { facebook: [{ value: 1000 }] },
      trendCharts: {},
      efficiencyBreakdown: {},
      benchmarkCharts: {},
    })
    expect(tab).toBe('funnel')
  })

  it('detects funnel tab data for a provider', () => {
    expect(
      tabHasChartData(
        'funnel',
        {
          providerComparison: [],
          funnelCharts: { facebook: [{ value: 500 }, { value: 10 }] },
          trendCharts: {},
          efficiencyBreakdown: {},
          benchmarkCharts: {},
        },
        'facebook',
      ),
    ).toBe(true)
  })
})
