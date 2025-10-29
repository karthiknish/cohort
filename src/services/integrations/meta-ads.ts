import { NormalizedMetric } from '@/types/integrations'

interface MetaAdsOptions {
  accessToken: string
  adAccountId: string
  timeframeDays: number
}

function buildTimeRange(timeframeDays: number) {
  const today = new Date()
  const since = new Date(today)
  since.setUTCDate(since.getUTCDate() - Math.max(timeframeDays - 1, 0))

  const format = (date: Date) => date.toISOString().slice(0, 10)

  return {
    since: format(since),
    until: format(today),
  }
}

function coerceNumber(value: unknown): number {
  const parsed = typeof value === 'string' ? parseFloat(value) : Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

export async function fetchMetaAdsMetrics(options: MetaAdsOptions): Promise<NormalizedMetric[]> {
  const { accessToken, adAccountId, timeframeDays } = options

  if (!accessToken) {
    throw new Error('Missing Meta access token')
  }

  if (!adAccountId) {
    throw new Error('Missing Meta ad account ID on integration')
  }

  const timeRange = buildTimeRange(timeframeDays)

  const params = new URLSearchParams({
    level: 'campaign',
    fields: [
      'date_start',
      'date_stop',
      'campaign_id',
      'campaign_name',
      'impressions',
      'clicks',
      'spend',
      'actions',
      'action_values',
    ].join(','),
    time_range: JSON.stringify(timeRange),
    time_increment: '1',
    breakdowns: ['publisher_platform'].join(','),
  })

  const response = await fetch(`https://graph.facebook.com/v18.0/${adAccountId}/insights?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    const errorPayload = await response.text()
    throw new Error(`Meta Ads API error (${response.status}): ${errorPayload}`)
  }

  const payload = await response.json()
  const rows: any[] = Array.isArray(payload?.data) ? payload.data : []

  const creativesMap = await fetchCampaignCreatives({ accessToken, adAccountId, campaignIds: rows.map((row) => row?.campaign_id).filter(Boolean) })

  const metrics: NormalizedMetric[] = rows.map((row) => {
    const spend = coerceNumber(row?.spend)
    const impressions = coerceNumber(row?.impressions)
    const clicks = coerceNumber(row?.clicks)

    const actions = Array.isArray(row?.actions) ? row.actions : []
    const conversions = actions.reduce((acc: number, action: any) => {
      if (action?.action_type === 'offsite_conversion' || action?.action_type === 'purchase') {
        return acc + coerceNumber(action?.value)
      }
      return acc
    }, 0)

    const actionValues = Array.isArray(row?.action_values) ? row.action_values : []
    const revenue = actionValues.reduce((acc: number, action: any) => {
      if (action?.action_type === 'offsite_conversion.purchase' || action?.action_type === 'omni_purchase') {
        return acc + coerceNumber(action?.value)
      }
      return acc
    }, 0)

    const creatives = creativesMap.get(row?.campaign_id)

    return {
      providerId: 'facebook',
      date: row?.date_start ?? row?.date_stop ?? new Date().toISOString().slice(0, 10),
      spend,
      impressions,
      clicks,
      conversions,
      revenue,
      creatives,
      rawPayload: row,
    }
  })

  return metrics
}

async function fetchCampaignCreatives(options: {
  accessToken: string
  adAccountId: string
  campaignIds: string[]
}): Promise<Map<string, NormalizedMetric['creatives']>> {
  const { accessToken, adAccountId, campaignIds } = options
  const creativeMap = new Map<string, NormalizedMetric['creatives']>()

  if (!campaignIds.length) {
    return creativeMap
  }

  // Meta recommends batching via async job, but for simplicity we page small sets of creative stats per campaign
  await Promise.all(
    campaignIds.slice(0, 20).map(async (campaignId) => {
      if (!campaignId) return
      try {
        const timeRange = buildTimeRange(30)
        const timeRangeLiteral = `{"since":"${timeRange.since}","until":"${timeRange.until}"}`
        const params = new URLSearchParams()
        params.set(
          'fields',
          [
            'name',
            'objective',
            'status',
            `ads{adcreatives{name,object_story_spec},insights.time_range(${timeRangeLiteral}){spend,impressions,clicks,actions,action_values}}`,
          ].join(',')
        )
        params.set('limit', '25')

        const url = `https://graph.facebook.com/v18.0/${campaignId}/ads?${params.toString()}`
        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })

        if (!response.ok) {
          const errorPayload = await response.text()
          throw new Error(`Meta Ads API error (${response.status}): ${errorPayload}`)
        }

        const payload = await response.json()
        const ads: any[] = Array.isArray(payload?.data) ? payload.data : []

        const creatives: NonNullable<NormalizedMetric['creatives']> = []

        ads.forEach((ad) => {
          const adCreative = ad?.adcreatives?.data?.[0]
          const insight = Array.isArray(ad?.insights?.data) ? ad.insights.data[0] : undefined

          if (!adCreative && !insight) {
            return
          }

          const actions = Array.isArray(insight?.actions) ? insight.actions : []
          const actionValues = Array.isArray(insight?.action_values) ? insight.action_values : []

          const conversions = actions.reduce((acc: number, action: any) => {
            if (typeof action?.action_type === 'string' && (action.action_type.includes('purchase') || action.action_type === 'offsite_conversion')) {
              return acc + coerceNumber(action?.value)
            }
            return acc
          }, 0)

          const revenue = actionValues.reduce((acc: number, action: any) => {
            if (typeof action?.action_type === 'string' && action.action_type.includes('purchase')) {
              return acc + coerceNumber(action?.value)
            }
            return acc
          }, 0)

          creatives.push({
            id: adCreative?.id ?? ad?.id ?? `${campaignId}-${creatives.length}`,
            name: adCreative?.name || ad?.name || 'Meta ad creative',
            type: ad?.status || ad?.effective_status || 'active',
            url: adCreative?.thumbnail_url,
            spend: insight ? coerceNumber(insight.spend) : undefined,
            impressions: insight ? coerceNumber(insight.impressions) : undefined,
            clicks: insight ? coerceNumber(insight.clicks) : undefined,
            conversions,
            revenue,
          })
        })

        if (creatives.length) {
          creativeMap.set(campaignId, creatives)
        }
      } catch (error) {
        console.error(`Error fetching creatives for campaign ${campaignId}:`, error)
      }
    })
  )

  return creativeMap
}
