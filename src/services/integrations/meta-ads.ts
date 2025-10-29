import { createHmac } from 'node:crypto'

import { NormalizedMetric } from '@/types/integrations'

interface MetaAdsOptions {
  accessToken: string
  adAccountId: string
  timeframeDays: number
  maxPages?: number
  refreshAccessToken?: () => Promise<string>
}

type MetaInsightAction = {
  action_type?: string
  value?: unknown
}

type MetaInsightsRow = {
  date_start?: string
  date_stop?: string
  campaign_id?: string
  campaign_name?: string
  spend?: unknown
  impressions?: unknown
  clicks?: unknown
  actions?: MetaInsightAction[]
  action_values?: MetaInsightAction[]
}

type MetaInsightsResponse = {
  data?: MetaInsightsRow[]
  paging?: {
    cursors?: {
      before?: string
      after?: string
    }
    next?: string
  }
}

type MetaAdCreative = {
  id?: string
  name?: string
  thumbnail_url?: string
}

type MetaAdInsight = {
  actions?: MetaInsightAction[]
  action_values?: MetaInsightAction[]
  spend?: unknown
  impressions?: unknown
  clicks?: unknown
}

type MetaAdData = {
  id?: string
  name?: string
  status?: string
  effective_status?: string
  adcreatives?: {
    data?: MetaAdCreative[]
  }
  insights?: {
    data?: MetaAdInsight[]
  }
}

type MetaAdsListResponse = {
  data?: MetaAdData[]
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

type MetaPagingState = {
  after?: string
  next?: string
}

function coerceNumber(value: unknown): number {
  const parsed = typeof value === 'string' ? parseFloat(value) : Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function isRetryableStatus(status: number): boolean {
  return status === 429 || status >= 500
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function fetchMetaAdsMetrics(options: MetaAdsOptions): Promise<NormalizedMetric[]> {
  const { accessToken, adAccountId, timeframeDays, maxPages = 10, refreshAccessToken } = options

  if (!accessToken) {
    throw new Error('Missing Meta access token')
  }

  if (!adAccountId) {
    throw new Error('Missing Meta ad account ID on integration')
  }

  const timeRange = buildTimeRange(timeframeDays)
  let paging: MetaPagingState | undefined
  let activeAccessToken = accessToken
  let attemptedRefresh = false
  const metrics: NormalizedMetric[] = []
  const appSecret = process.env.META_APP_SECRET

  for (let page = 0; page < maxPages; page += 1) {
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
      breakdowns: 'publisher_platform',
      limit: '500',
    })

    appendMetaAuthParams({ params, accessToken: activeAccessToken, appSecret })

    if (paging?.after) {
      params.set('after', paging.after)
    }

    const url = `https://graph.facebook.com/v18.0/${adAccountId}/insights?${params.toString()}`
    let response: Response | null = null
    let attempt = 0

    while (attempt < 3) {
      response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${activeAccessToken}`,
        },
      })

      if ((response.status === 401 || response.status === 403) && refreshAccessToken && !attemptedRefresh) {
        attemptedRefresh = true
        activeAccessToken = await refreshAccessToken()
        attempt = 0
        continue
      }

      if (!response.ok && isRetryableStatus(response.status) && attempt < 2) {
        attempt += 1
        await sleep(200 * 2 ** attempt)
        continue
      }

      break
    }

    if (!response) {
      throw new Error('Meta Ads API request failed without a response')
    }

    if (!response.ok) {
      const errorPayload = await response.text()
      throw new Error(`Meta Ads API error (${response.status}): ${errorPayload}`)
    }

    const payload = (await response.json()) as MetaInsightsResponse
    const rows: MetaInsightsRow[] = Array.isArray(payload?.data) ? payload.data : []

    const creativesMap = await fetchCampaignCreatives({
      accessToken: activeAccessToken,
      campaignIds: rows
        .map((row) => row?.campaign_id)
        .filter((id): id is string => typeof id === 'string' && id.length > 0),
      appSecret,
    })

    rows.forEach((row) => {
      const spend = coerceNumber(row?.spend)
      const impressions = coerceNumber(row?.impressions)
      const clicks = coerceNumber(row?.clicks)

      const actions = Array.isArray(row?.actions) ? row.actions : []
      const conversions = actions.reduce((acc: number, action) => {
        if (action?.action_type === 'offsite_conversion' || action?.action_type === 'purchase') {
          return acc + coerceNumber(action?.value)
        }
        return acc
      }, 0)

      const actionValues = Array.isArray(row?.action_values) ? row.action_values : []
      const revenue = actionValues.reduce((acc: number, action) => {
        if (action?.action_type === 'offsite_conversion.purchase' || action?.action_type === 'omni_purchase') {
          return acc + coerceNumber(action?.value)
        }
        return acc
      }, 0)

      const campaignId = typeof row?.campaign_id === 'string' && row.campaign_id.length > 0 ? row.campaign_id : undefined
      const campaignName = typeof row?.campaign_name === 'string' && row.campaign_name.length > 0 ? row.campaign_name : undefined
      const creatives = campaignId ? creativesMap.get(campaignId) : undefined

      metrics.push({
        providerId: 'facebook',
        date: row?.date_start ?? row?.date_stop ?? new Date().toISOString().slice(0, 10),
        spend,
        impressions,
        clicks,
        conversions,
        revenue,
        campaignId,
        campaignName,
        creatives,
        rawPayload: row,
      })
    })

    const nextCursor = payload?.paging?.cursors?.after ?? null
    const nextLink = payload?.paging?.next ?? null
    paging = nextCursor ? { after: nextCursor, next: nextLink ?? undefined } : undefined

    if (!paging?.after) {
      break
    }
  }

  return metrics
}

async function fetchCampaignCreatives(options: {
  accessToken: string
  campaignIds: string[]
  appSecret?: string | null
}): Promise<Map<string, NormalizedMetric['creatives']>> {
  const { accessToken, campaignIds, appSecret } = options
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

        appendMetaAuthParams({ params, accessToken, appSecret })

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

        const payload = (await response.json()) as MetaAdsListResponse
        const ads: MetaAdData[] = Array.isArray(payload?.data) ? payload.data : []

        const creatives: NonNullable<NormalizedMetric['creatives']> = []

        ads.forEach((ad) => {
          const adCreative = Array.isArray(ad?.adcreatives?.data) ? ad.adcreatives?.data[0] : undefined
          const insight = Array.isArray(ad?.insights?.data) ? ad.insights.data[0] : undefined

          if (!adCreative && !insight) {
            return
          }

          const actions = Array.isArray(insight?.actions) ? insight.actions : []
          const actionValues = Array.isArray(insight?.action_values) ? insight.action_values : []

          const conversions = actions.reduce((acc: number, action) => {
            if (typeof action?.action_type === 'string' && (action.action_type.includes('purchase') || action.action_type === 'offsite_conversion')) {
              return acc + coerceNumber(action?.value)
            }
            return acc
          }, 0)

          const revenue = actionValues.reduce((acc: number, action) => {
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

function appendMetaAuthParams(options: { params: URLSearchParams; accessToken: string; appSecret?: string | null }) {
  const { params, accessToken, appSecret } = options
  params.set('access_token', accessToken)

  if (!appSecret) {
    return
  }

  try {
    const proof = createHmac('sha256', appSecret).update(accessToken).digest('hex')
    params.set('appsecret_proof', proof)
  } catch (error) {
    console.warn('Failed to compute Meta appsecret_proof', error)
  }
}

export type MetaAdAccount = {
  id: string
  name: string
  account_status?: number
  currency?: string
}

export async function fetchMetaAdAccounts(options: {
  accessToken: string
  appSecret?: string | null
  limit?: number
}): Promise<MetaAdAccount[]> {
  const { accessToken, appSecret = process.env.META_APP_SECRET, limit = 25 } = options

  if (!accessToken) {
    throw new Error('Missing Meta access token')
  }

  const params = new URLSearchParams({
    fields: ['id', 'name', 'account_status', 'currency'].join(','),
    limit: String(limit),
  })

  appendMetaAuthParams({ params, accessToken, appSecret })

  const url = `https://graph.facebook.com/v18.0/me/adaccounts?${params.toString()}`
  const response = await fetch(url)

  if (!response.ok) {
    const errorPayload = await response.text()
    throw new Error(`Meta ad accounts request failed (${response.status}): ${errorPayload}`)
  }

  const payload = (await response.json()) as {
    data?: Array<{
      id?: unknown
      name?: unknown
      account_status?: unknown
      currency?: unknown
    }>
  }

  const accounts = Array.isArray(payload?.data) ? payload.data : []

  return (accounts ?? [])
    .map((candidate): MetaAdAccount | null => {
      const id = typeof candidate?.id === 'string' ? candidate.id : null
      const name = typeof candidate?.name === 'string' ? candidate.name : 'Meta ad account'
      const accountStatusRaw = candidate?.account_status
      const accountStatus = typeof accountStatusRaw === 'number' ? accountStatusRaw : Number(accountStatusRaw)
      const currency = typeof candidate?.currency === 'string' ? candidate.currency : undefined

      if (!id) {
        return null
      }

      return {
        id,
        name,
        account_status: Number.isFinite(accountStatus) ? Number(accountStatus) : undefined,
        currency,
      } satisfies MetaAdAccount
    })
    .filter((account): account is MetaAdAccount => Boolean(account))
}
