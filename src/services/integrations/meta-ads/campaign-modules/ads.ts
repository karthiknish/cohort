// =============================================================================
// ADS - Ad operations and metrics
// =============================================================================

import {
  appendMetaAuthParams,
  buildTimeRange,
  coerceNumber,
  META_API_BASE,
} from '../client'
import { metaAdsClient } from '@/services/integrations/shared/base-client'
import { MetaAdMetric, MetaInsightsResponse } from '../types'

// =============================================================================
// LIST ADS
// =============================================================================

export async function listMetaAds(options: {
  accessToken: string
  adAccountId: string
  campaignId?: string
  adSetId?: string
  statusFilter?: ('ACTIVE' | 'PAUSED' | 'DELETED' | 'ARCHIVED')[]
  maxRetries?: number
}): Promise<Array<{
  id: string
  name: string
  status: 'ACTIVE' | 'PAUSED' | 'DELETED' | 'ARCHIVED'
  adSetId?: string
  campaignId?: string
  creativeId?: string
}>> {
  const {
    accessToken,
    adAccountId,
    campaignId,
    adSetId,
    statusFilter = ['ACTIVE', 'PAUSED'],
    maxRetries = 3,
  } = options

  const params = new URLSearchParams({
    fields: ['id', 'name', 'status', 'effective_status', 'adset_id', 'campaign_id', 'creative'].join(','),
    limit: '100',
  })

  const formattedAccountId = adAccountId.startsWith('act_') ? adAccountId : `act_${adAccountId}`

  if (statusFilter.length > 0) {
    const filtering = [{
      field: 'effective_status',
      operator: 'IN',
      value: statusFilter,
    }]
    params.set('filtering', JSON.stringify(filtering))
  }

  await appendMetaAuthParams({ params, accessToken, appSecret: process.env.META_APP_SECRET })

  let url: string
  if (campaignId) {
    url = `${META_API_BASE}/${campaignId}/ads?${params.toString()}`
  } else if (adSetId) {
    url = `${META_API_BASE}/${adSetId}/ads?${params.toString()}`
  } else {
    url = `${META_API_BASE}/${formattedAccountId}/ads?${params.toString()}`
  }

  const { payload } = await metaAdsClient.executeRequest<{
    data?: Array<{
      id?: string
      name?: string
      status?: string
      effective_status?: string
      adset_id?: string
      campaign_id?: string
      creative?: { id?: string }
    }>
  }>({
    url,
    operation: 'listAds',
    maxRetries,
  })

  const ads = Array.isArray(payload?.data) ? payload.data : []

  return ads.map((ad) => ({
    id: ad.id ?? '',
    name: ad.name ?? '',
    status: (ad.effective_status ?? ad.status ?? 'PAUSED') as 'ACTIVE' | 'PAUSED' | 'DELETED' | 'ARCHIVED',
    adSetId: ad.adset_id,
    campaignId: ad.campaign_id,
    creativeId: ad.creative?.id,
  }))
}

// =============================================================================
// UPDATE AD STATUS
// =============================================================================

export async function updateMetaAdStatus(options: {
  accessToken: string
  adId: string
  status: 'ACTIVE' | 'PAUSED'
  maxRetries?: number
}): Promise<{ success: boolean }> {
  const {
    accessToken,
    adId,
    status,
    maxRetries = 3,
  } = options

  const params = new URLSearchParams()
  params.set('status', status)
  await appendMetaAuthParams({ params, accessToken, appSecret: process.env.META_APP_SECRET })

  const url = `${META_API_BASE}/${adId}?${params.toString()}`

  const { payload } = await metaAdsClient.executeRequest<{ success?: boolean }>({
    url,
    operation: 'updateAdStatus',
    method: 'POST',
    maxRetries,
  })

  return { success: payload?.success ?? true }
}

// =============================================================================
// FETCH AD-LEVEL METRICS
// =============================================================================

export async function fetchMetaAdMetrics(options: {
  accessToken: string
  adAccountId: string
  campaignId?: string
  adSetId?: string
  timeframeDays: number
  maxRetries?: number
}): Promise<MetaAdMetric[]> {
  const {
    accessToken,
    adAccountId,
    campaignId,
    adSetId,
    timeframeDays,
    maxRetries = 3,
  } = options

  const timeRange = buildTimeRange(timeframeDays)
  const params = new URLSearchParams({
    level: 'ad',
    fields: [
      'date_start',
      'ad_id',
      'ad_name',
      'adset_id',
      'adset_name',
      'campaign_id',
      'campaign_name',
      'impressions',
      'clicks',
      'spend',
      'reach',
      'actions',
      'action_values',
    ].join(','),
    time_range: JSON.stringify(timeRange),
    time_increment: '1',
    limit: '500',
  })

  if (campaignId) {
    params.set('filtering', JSON.stringify([{ field: 'campaign.id', operator: 'EQUAL', value: campaignId }]))
  }
  if (adSetId) {
    params.set('filtering', JSON.stringify([{ field: 'adset.id', operator: 'EQUAL', value: adSetId }]))
  }

  await appendMetaAuthParams({ params, accessToken, appSecret: process.env.META_APP_SECRET })

  const url = `${META_API_BASE}/${adAccountId}/insights?${params.toString()}`

  const { payload } = await metaAdsClient.executeRequest<MetaInsightsResponse>({
    url,
    operation: 'fetchAdMetrics',
    maxRetries,
  })

  const rows = Array.isArray(payload?.data) ? payload.data : []

  return rows.map((row) => {
    const actions = Array.isArray(row?.actions) ? row.actions : []
    const conversions = actions.reduce((acc: number, action) => {
      if (action?.action_type === 'offsite_conversion' || action?.action_type === 'purchase') {
        return acc + coerceNumber(action?.value)
      }
      return acc
    }, 0)

    const actionValues = Array.isArray(row?.action_values) ? row.action_values : []
    const revenue = actionValues.reduce((acc: number, action) => {
      if (action?.action_type?.includes('purchase')) {
        return acc + coerceNumber(action?.value)
      }
      return acc
    }, 0)

    return {
      adId: row.ad_id ?? '',
      adSetId: row.adset_id ?? '',
      campaignId: row.campaign_id ?? '',
      adName: row.ad_name,
      adSetName: row.adset_name,
      campaignName: row.campaign_name,
      date: row.date_start ?? '',
      impressions: coerceNumber(row.impressions),
      clicks: coerceNumber(row.clicks),
      spend: coerceNumber(row.spend),
      conversions,
      revenue,
      reach: coerceNumber(row.reach),
    }
  })
}
