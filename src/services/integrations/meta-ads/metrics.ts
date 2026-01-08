// =============================================================================
// META ADS METRICS - Account discovery, metrics fetching, health checks
// =============================================================================

import { formatDate } from '@/lib/dates'

import {
  appendMetaAuthParams,
  buildTimeRange,
  coerceNumber,
  DEFAULT_RETRY_CONFIG,
  META_API_BASE,
} from './client'
import { metaAdsClient } from '@/services/integrations/shared/base-client'
import {
  MetaAdsOptions,
  MetaAdAccount,
  MetaInsightsResponse,
  MetaInsightsRow,
  MetaPagingState,
  MetaApiErrorResponse,
  NormalizedMetric,
  MetaAdsListResponse,
  MetaAdData,
} from './types'

// =============================================================================
// FETCH META AD ACCOUNTS
// =============================================================================

export async function fetchMetaAdAccounts(options: {
  accessToken: string
  appSecret?: string | null
  limit?: number
  maxPages?: number
  maxRetries?: number
}): Promise<MetaAdAccount[]> {
  const {
    accessToken,
    appSecret = process.env.META_APP_SECRET,
    limit = 100, // Increased from 25 to fetch more accounts per page
    maxPages = 10, // Limit total pages to prevent runaway pagination
    maxRetries = DEFAULT_RETRY_CONFIG.maxRetries,
  } = options

  if (!accessToken) {
    throw new Error('Missing Meta access token')
  }

  const allAccounts: MetaAdAccount[] = []
  let nextUrl: string | null = null

  for (let page = 0; page < maxPages; page++) {
    let url: string

    if (page === 0) {
      const params = new URLSearchParams({
        fields: ['id', 'name', 'account_status', 'currency'].join(','),
        limit: String(limit),
      })

      await appendMetaAuthParams({ params, accessToken, appSecret })
      url = `${META_API_BASE}/me/adaccounts?${params.toString()}`
    } else if (nextUrl) {
      url = nextUrl
    } else {
      break
    }

    const { payload } = await metaAdsClient.executeRequest<{
      data?: Array<{
        id?: unknown
        name?: unknown
        account_status?: unknown
        currency?: unknown
      }>
      paging?: {
        next?: string
        cursors?: {
          after?: string
        }
      }
    }>({
      url,
      operation: `fetchAdAccounts:page${page}`,
      maxRetries,
    })

    const accounts = Array.isArray(payload?.data) ? payload.data : []

    const parsedAccounts = accounts
      .map((candidate): MetaAdAccount | null => {
        const id = typeof candidate?.id === 'string' ? candidate.id : null
        const name = typeof candidate?.name === 'string' ? candidate.name : 'Meta ad account'
        const accountStatusRaw = candidate?.account_status
        const accountStatus = typeof accountStatusRaw === 'number' ? accountStatusRaw : Number(accountStatusRaw)
        const currency = typeof candidate?.currency === 'string' ? candidate.currency : undefined

        if (!id) return null

        return {
          id,
          name,
          account_status: Number.isFinite(accountStatus) ? Number(accountStatus) : undefined,
          currency,
        } satisfies MetaAdAccount
      })
      .filter((account): account is MetaAdAccount => Boolean(account))

    allAccounts.push(...parsedAccounts)

    // Check if there's a next page
    nextUrl = payload?.paging?.next ?? null
    if (!nextUrl) break
  }

  return allAccounts
}

// =============================================================================
// FETCH META ADS METRICS
// =============================================================================

export async function fetchMetaAdsMetrics(options: MetaAdsOptions): Promise<NormalizedMetric[]> {
  const { 
    accessToken, 
    adAccountId, 
    timeframeDays, 
    maxPages = 10, 
    maxRetries = DEFAULT_RETRY_CONFIG.maxRetries,
    refreshAccessToken,
    onRateLimitHit,
    onTokenRefresh,
  } = options

  if (!accessToken) throw new Error('Missing Meta access token')
  if (!adAccountId) throw new Error('Missing Meta ad account ID on integration')

  const timeRange = buildTimeRange(timeframeDays)
  let paging: MetaPagingState | undefined
  let activeAccessToken = accessToken
  let tokenRefreshAttempted = false
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

    await appendMetaAuthParams({ params, accessToken: activeAccessToken, appSecret })

    if (paging?.after) {
      params.set('after', paging.after)
    }

    const url = `${META_API_BASE}/${adAccountId}/insights?${params.toString()}`
    
    const { payload } = await metaAdsClient.executeRequest<MetaInsightsResponse>({
      url,
      operation: `fetchInsights:page${page}`,
      maxRetries,
      onAuthError: async () => {
        if (refreshAccessToken && !tokenRefreshAttempted) {
          tokenRefreshAttempted = true
          activeAccessToken = await refreshAccessToken()
          onTokenRefresh?.()
          return { retry: true, newToken: activeAccessToken }
        }
        return { retry: false }
      },
      onRateLimitHit,
    })

    const rows: MetaInsightsRow[] = Array.isArray(payload?.data) ? payload.data : []

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

      metrics.push({
        providerId: 'facebook',
        date: row?.date_start ?? row?.date_stop ?? formatDate(new Date(), 'yyyy-MM-dd'),
        spend,
        impressions,
        clicks,
        conversions,
        revenue,
        campaignId,
        campaignName,
        rawPayload: row,
      })
    })

    const nextCursor = payload?.paging?.cursors?.after ?? null
    const nextLink = payload?.paging?.next ?? null
    paging = nextCursor ? { after: nextCursor, next: nextLink ?? undefined } : undefined

    if (!paging?.after) break
  }

  return metrics
}

// =============================================================================
// HEALTH CHECK FOR META INTEGRATION
// =============================================================================

export async function checkMetaIntegrationHealth(options: {
  accessToken: string
  adAccountId?: string
}): Promise<{
  healthy: boolean
  tokenValid: boolean
  accountAccessible: boolean
  error?: string
}> {
  const { accessToken, adAccountId } = options
  
  try {
    const userParams = new URLSearchParams({
      fields: 'id,name',
      access_token: accessToken,
    })
    
    const userUrl = `${META_API_BASE}/me?${userParams.toString()}`
    const userResponse = await fetch(userUrl)
    
    if (!userResponse.ok) {
      const errorData = await userResponse.json() as MetaApiErrorResponse
      return {
        healthy: false,
        tokenValid: false,
        accountAccessible: false,
        error: errorData?.error?.message ?? 'Token validation failed',
      }
    }
    
    if (adAccountId) {
      const accountParams = new URLSearchParams({
        fields: 'id,account_status',
        access_token: accessToken,
      })
      
      const accountUrl = `${META_API_BASE}/${adAccountId}?${accountParams.toString()}`
      const accountResponse = await fetch(accountUrl)
      
      if (!accountResponse.ok) {
        const errorData = await accountResponse.json() as MetaApiErrorResponse
        return {
          healthy: false,
          tokenValid: true,
          accountAccessible: false,
          error: errorData?.error?.message ?? 'Ad account not accessible',
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
