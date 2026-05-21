import { describe, expect, it } from 'vitest'

import { buildGoogleCampaignInsightsGaql } from './campaign-insights'

describe('buildGoogleCampaignInsightsGaql', () => {
  it('filters by campaign id and date range', () => {
    const query = buildGoogleCampaignInsightsGaql({
      campaignId: '12345',
      startDate: '2026-03-01',
      endDate: '2026-03-07',
    })

    expect(query).toContain('campaign.id = 12345')
    expect(query).toContain("segments.date BETWEEN '2026-03-01' AND '2026-03-07'")
    expect(query).toContain('metrics.impressions')
    expect(query).toContain('metrics.cost_micros')
  })

  it('strips non-numeric characters from campaign id', () => {
    const query = buildGoogleCampaignInsightsGaql({
      campaignId: 'campaign-99',
      startDate: '2026-01-01',
      endDate: '2026-01-31',
    })

    expect(query).toContain('campaign.id = 99')
  })
})
