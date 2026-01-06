// =============================================================================
// TIKTOK ADS METRICS - Fetching ad metrics from TikTok API
// =============================================================================

import { formatDate } from '@/lib/dates'
import { executeTikTokApiRequest, coerceNumber, DEFAULT_RETRY_CONFIG } from './client'
import {
  TikTokMetricsOptions,
  TikTokAdAccount,
  TikTokReportResponse,
  TikTokApiErrorResponse,
  NormalizedMetric,
} from './types'

// =============================================================================
// FETCH TIKTOK AD ACCOUNTS
// =============================================================================

export async function fetchTikTokAdAccounts(options: {
  accessToken: string
  advertiserIds?: string[]
  maxRetries?: number
}): Promise<TikTokAdAccount[]> {
  const { accessToken, advertiserIds, maxRetries = DEFAULT_RETRY_CONFIG.maxRetries } = options

  if (!accessToken) {
    throw new Error('TikTok access token is required to load advertisers')
  }

  const url = 'https://business-api.tiktok.com/open_api/v1.3/advertiser/info/'
  
  const { payload } = await executeTikTokApiRequest<{
    code?: number
    message?: string
    request_id?: string
    data?: {
      list?: Array<{
        advertiser_id?: string
        name?: string
        status?: string
        currency?: string
        timezone?: string
      }>
    }
  }>({
    url,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Access-Token': accessToken,
    },
    body: JSON.stringify({
      advertiser_ids: advertiserIds,
      page_size: 50,
    }),
    operation: 'fetchAdAccounts',
    maxRetries,
  })

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

// =============================================================================
// MAIN API: FETCH TIKTOK ADS METRICS
// =============================================================================

export async function fetchTikTokAdsMetrics(options: TikTokMetricsOptions): Promise<NormalizedMetric[]> {
  const { 
    accessToken, 
    advertiserId, 
    timeframeDays, 
    maxPages = 20, 
    maxRetries = DEFAULT_RETRY_CONFIG.maxRetries,
    refreshAccessToken,
    onRateLimitHit,
    onTokenRefresh,
  } = options

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
  let tokenRefreshAttempted = false

  while (page < maxPages) {
    page += 1

    const requestPayload = {
      advertiser_id: advertiserId,
      data_level: 'AUCTION_CAMPAIGN',
      dimensions: ['campaign_id', 'campaign_name', 'stat_time_day'],
      metrics: ['spend', 'impressions', 'clicks', 'conversion', 'total_complete_payment'],
      start_date: formatDate(start, 'yyyy-MM-dd'),
      end_date: formatDate(today, 'yyyy-MM-dd'),
      page_size: 200,
      time_granularity: 'STAT_TIME_DAY',
      cursor,
      order_field: 'spend',
      order_type: 'DESC',
    }

    const { payload: body } = await executeTikTokApiRequest<TikTokReportResponse>({
      url: 'https://business-api.tiktok.com/open_api/v1.3/report/integrated/get/',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Access-Token': activeToken,
      },
      body: JSON.stringify(requestPayload),
      operation: `fetchMetrics:page${page}`,
      advertiserId,
      maxRetries,
      onAuthError: async () => {
        if (refreshAccessToken && !tokenRefreshAttempted) {
          tokenRefreshAttempted = true
          activeToken = await refreshAccessToken()
          onTokenRefresh?.()
          return { retry: true, newToken: activeToken }
        }
        return { retry: false }
      },
      onRateLimitHit,
    })

    const rows = Array.isArray(body?.data?.list) ? body.data?.list ?? [] : []

    rows.forEach((row) => {
      const dimensions = row?.dimensions ?? {}
      const metricsBlock = row?.metrics ?? {}

      const date = typeof dimensions?.stat_time_day === 'string' ? dimensions.stat_time_day : formatDate(today, 'yyyy-MM-dd')
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

// =============================================================================
// HEALTH CHECK
// =============================================================================

export async function checkTikTokIntegrationHealth(options: {
  accessToken: string
  advertiserId?: string
}): Promise<{
  healthy: boolean
  tokenValid: boolean
  accountAccessible: boolean
  error?: string
}> {
  const { accessToken, advertiserId } = options
  
  try {
    const userUrl = 'https://business-api.tiktok.com/open_api/v1.3/user/info/'
    const userResponse = await fetch(userUrl, {
      method: 'GET',
      headers: {
        'Access-Token': accessToken,
      },
    })
    
    if (!userResponse.ok) {
      const errorData = await userResponse.json().catch(() => ({})) as TikTokApiErrorResponse
      return {
        healthy: false,
        tokenValid: false,
        accountAccessible: false,
        error: errorData?.message ?? 'Token validation failed',
      }
    }
    
    const userData = await userResponse.json() as TikTokApiErrorResponse
    if (userData.code && userData.code !== 0) {
      return {
        healthy: false,
        tokenValid: false,
        accountAccessible: false,
        error: userData.message ?? `Token validation failed with code ${userData.code}`,
      }
    }
    
    if (advertiserId) {
      const accountResponse = await fetch('https://business-api.tiktok.com/open_api/v1.3/advertiser/info/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Access-Token': accessToken,
        },
        body: JSON.stringify({
          advertiser_ids: [advertiserId],
        }),
      })
      
      if (!accountResponse.ok) {
        const errorData = await accountResponse.json().catch(() => ({})) as TikTokApiErrorResponse
        return {
          healthy: false,
          tokenValid: true,
          accountAccessible: false,
          error: errorData?.message ?? 'Advertiser not accessible',
        }
      }
      
      const accountData = await accountResponse.json() as TikTokApiErrorResponse & {
        data?: { list?: Array<{ advertiser_id?: string }> }
      }
      
      if (accountData.code && accountData.code !== 0) {
        return {
          healthy: false,
          tokenValid: true,
          accountAccessible: false,
          error: accountData.message ?? `Advertiser check failed with code ${accountData.code}`,
        }
      }
      
      const list = accountData.data?.list ?? []
      if (!list.some(a => a.advertiser_id === advertiserId)) {
        return {
          healthy: false,
          tokenValid: true,
          accountAccessible: false,
          error: 'Advertiser not found in accessible accounts',
        }
      }
    }
    
    return {
      healthy: true,
      tokenValid: true,
      accountAccessible: true,
    }
  } catch (error) {
    return {
      healthy: false,
      tokenValid: false,
      accountAccessible: false,
      error: error instanceof Error ? error.message : 'Health check failed',
    }
  }
}
