// =============================================================================
// GOOGLE ADS AD GROUP METRICS - Fetch ad group level performance data
// =============================================================================

import { googleAdsSearch } from './client'
import { GoogleAdMetric } from './types'

export async function fetchGoogleAdGroupMetrics(options: {
    accessToken: string
    developerToken: string
    customerId: string
    campaignId?: string
    loginCustomerId?: string | null
    timeframeDays: number
    maxRetries?: number
}): Promise<GoogleAdMetric[]> {
    const {
        accessToken,
        developerToken,
        customerId,
        campaignId,
        loginCustomerId,
        timeframeDays,
        maxRetries = 3,
    } = options

    const days = Math.max(timeframeDays, 1)
    const campaignFilter = campaignId ? `AND campaign.id = ${campaignId}` : ''

    const query = `
    SELECT
      segments.date,
      ad_group.id,
      ad_group.name,
      campaign.id,
      campaign.name,
      metrics.impressions,
      metrics.clicks,
      metrics.cost_micros,
      metrics.conversions,
      metrics.conversions_value
    FROM ad_group
    WHERE segments.date DURING LAST_${days}_DAYS
    ${campaignFilter}
    ORDER BY segments.date DESC
    LIMIT 1000
  `.replace(/\s+/g, ' ').trim()

    const rows = await googleAdsSearch({
        accessToken,
        developerToken,
        customerId,
        loginCustomerId,
        query,
        pageSize: 1000,
        maxPages: 1,
        maxRetries,
    })

    return rows.map((row) => {
        const segments = row.segments as { date?: string } | undefined
        const adGroup = row.adGroup as { id?: string; name?: string } | undefined
        const campaign = row.campaign as { id?: string; name?: string } | undefined
        const metrics = row.metrics as {
            impressions?: string
            clicks?: string
            costMicros?: string
            cost_micros?: string
            conversions?: string
            conversionsValue?: string
            conversions_value?: string
        } | undefined

        const costMicros = metrics?.costMicros ?? metrics?.cost_micros
        const convValue = metrics?.conversionsValue ?? metrics?.conversions_value

        return {
            adId: adGroup?.id ?? '',
            adGroupId: adGroup?.id ?? '',
            campaignId: campaign?.id ?? '',
            headline: adGroup?.name,
            description: undefined,
            finalUrl: undefined,
            date: segments?.date ?? '',
            impressions: parseInt(metrics?.impressions ?? '0', 10),
            clicks: parseInt(metrics?.clicks ?? '0', 10),
            spend: costMicros ? parseInt(costMicros, 10) / 1_000_000 : 0,
            conversions: parseFloat(metrics?.conversions ?? '0'),
            revenue: convValue ? parseFloat(convValue) : 0,
        }
    })
}
