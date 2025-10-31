import { NormalizedMetric } from '@/types/integrations'

export interface TikTokAdAccount {
  id: string
  name: string
  status?: string
  currency?: string
  timezone?: string
}

export async function fetchTikTokAdAccounts(options: {
  accessToken: string
  advertiserIds?: string[]
}): Promise<TikTokAdAccount[]> {
  const { accessToken, advertiserIds } = options

  if (!accessToken) {
    throw new Error('TikTok access token is required to load advertisers')
  }

  const response = await fetch('https://business-api.tiktok.com/open_api/v1.3/advertiser/info/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Access-Token': accessToken,
    },
    body: JSON.stringify({
      advertiser_ids: advertiserIds,
      page_size: 50,
    }),
  })

  if (!response.ok) {
    const errorPayload = await response.text()
    throw new Error(`TikTok advertiser info failed (${response.status}): ${errorPayload}`)
  }

  const payload = (await response.json()) as {
    code?: number
    message?: string
    data?: {
      list?: Array<{
        advertiser_id?: string
        name?: string
        status?: string
        currency?: string
        timezone?: string
      }>
    }
  }

  if (payload.code && payload.code !== 0) {
    throw new Error(payload.message || `TikTok advertiser info returned code ${payload.code}`)
  }

  const list = Array.isArray(payload?.data?.list) ? payload.data?.list ?? [] : []

  const accounts = list
    .map((candidate): TikTokAdAccount | null => {
      const id = typeof candidate?.advertiser_id === 'string' ? candidate.advertiser_id : null
      if (!id) return null
      return {
        id,
        name: typeof candidate?.name === 'string' && candidate.name.length > 0 ? candidate.name : `TikTok advertiser ${id}`,
        status: typeof candidate?.status === 'string' ? candidate.status : undefined,
        currency: typeof candidate?.currency === 'string' ? candidate.currency : undefined,
        timezone: typeof candidate?.timezone === 'string' ? candidate.timezone : undefined,
      }
    })
    .filter((account): account is TikTokAdAccount => Boolean(account))

  if (!accounts.length && Array.isArray(advertiserIds)) {
    return advertiserIds
      .filter((id): id is string => typeof id === 'string' && id.length > 0)
      .map((id) => ({ id, name: `TikTok advertiser ${id}` }))
  }

  return accounts
}

interface TikTokMetricsOptions {
  accessToken: string
  advertiserId: string
  timeframeDays: number
  maxPages?: number
  refreshAccessToken?: () => Promise<string>
}

type TikTokReportRow = {
  metrics?: Record<string, unknown>
  dimensions?: Record<string, unknown>
}

type TikTokReportResponse = {
  code?: number
  message?: string
  data?: {
    list?: TikTokReportRow[]
    page_info?: {
      page?: number
      page_size?: number
      total_number?: number
      total_page?: number
      has_more?: boolean
    }
    cursor?: string
  }
}

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10)
}

function coerceNumber(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }

  if (typeof value === 'string') {
    const parsed = parseFloat(value)
    return Number.isFinite(parsed) ? parsed : 0
  }

  return 0
}

export async function fetchTikTokAdsMetrics(options: TikTokMetricsOptions): Promise<NormalizedMetric[]> {
  const { accessToken, advertiserId, timeframeDays, maxPages = 20, refreshAccessToken } = options

  if (!accessToken) {
    throw new Error('TikTok access token is required to fetch metrics')
  }

  if (!advertiserId) {
    throw new Error('TikTok advertiser ID is required')
  }

  const metrics: NormalizedMetric[] = []
  const today = new Date()
  const start = new Date(today)
  start.setUTCDate(start.getUTCDate() - Math.max(0, timeframeDays - 1))

  let cursor: string | undefined
  let page = 0
  let activeToken = accessToken
  let attemptedRefresh = false

  while (page < maxPages) {
    page += 1

    const payload = {
      advertiser_id: advertiserId,
      data_level: 'AUCTION_CAMPAIGN',
      dimensions: ['campaign_id', 'campaign_name', 'stat_time_day'],
      metrics: ['spend', 'impressions', 'clicks', 'conversion', 'total_complete_payment'],
      start_date: formatDate(start),
      end_date: formatDate(today),
      page_size: 200,
      time_granularity: 'STAT_TIME_DAY',
      cursor,
      order_field: 'spend',
      order_type: 'DESC',
    }

    const response = await fetch('https://business-api.tiktok.com/open_api/v1.3/report/integrated/get/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Access-Token': activeToken,
      },
      body: JSON.stringify(payload),
    })

    if (response.status === 401 || response.status === 403) {
      if (refreshAccessToken && !attemptedRefresh) {
        attemptedRefresh = true
        activeToken = await refreshAccessToken()
        cursor = undefined
        page -= 1
        continue
      }
      const errorPayload = await response.text()
      throw new Error(`TikTok metrics request unauthorized (${response.status}): ${errorPayload}`)
    }

    if (!response.ok) {
      const errorPayload = await response.text()
      throw new Error(`TikTok metrics request failed (${response.status}): ${errorPayload}`)
    }

    const body = (await response.json()) as TikTokReportResponse

    if (body.code && body.code !== 0) {
      throw new Error(body.message || `TikTok metrics API returned code ${body.code}`)
    }

    const rows = Array.isArray(body?.data?.list) ? body.data?.list ?? [] : []

    rows.forEach((row) => {
      const dimensions = row?.dimensions ?? {}
      const metricsBlock = row?.metrics ?? {}

      const date = typeof dimensions?.stat_time_day === 'string' ? dimensions.stat_time_day : formatDate(today)
      const campaignId = typeof dimensions?.campaign_id === 'string' ? dimensions.campaign_id : undefined
      const campaignName = typeof dimensions?.campaign_name === 'string' ? dimensions.campaign_name : undefined

      const spend = coerceNumber(metricsBlock?.spend)
      const impressions = coerceNumber(metricsBlock?.impressions)
      const clicks = coerceNumber(metricsBlock?.clicks)
      const conversions = coerceNumber(metricsBlock?.conversion)
      const revenue = coerceNumber(metricsBlock?.total_complete_payment)

      metrics.push({
        providerId: 'tiktok',
        date,
        spend,
        impressions,
        clicks,
        conversions,
        revenue: revenue || null,
        campaignId,
        campaignName,
        rawPayload: row,
      })
    })

    const hasMore = Boolean(body?.data?.page_info?.has_more) || Boolean(body?.data?.cursor)
    cursor = typeof body?.data?.cursor === 'string' && body.data.cursor.length > 0 ? body.data.cursor : undefined

    if (!hasMore || !cursor) {
      break
    }
  }

  return metrics
}
