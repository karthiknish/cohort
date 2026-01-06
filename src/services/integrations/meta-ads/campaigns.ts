// =============================================================================
// META ADS CAMPAIGNS - Campaign CRUD, ad-level metrics, creatives, targeting
// =============================================================================

import {
  executeMetaApiRequest,
  appendMetaAuthParams,
  buildTimeRange,
  coerceNumber,
  DEFAULT_RETRY_CONFIG,
  META_API_BASE,
  sleep,
} from './client'
import { MetaApiError } from './errors'
import {
  MetaCampaign,
  MetaAdMetric,
  MetaCreative,
  MetaAudienceTargeting,
  MetaAdsListResponse,
  MetaAdData,
  MetaInsightsResponse,
} from './types'

// =============================================================================
// LIST CAMPAIGNS
// =============================================================================

export async function listMetaCampaigns(options: {
  accessToken: string
  adAccountId: string
  statusFilter?: ('ACTIVE' | 'PAUSED' | 'ARCHIVED')[]
  maxRetries?: number
}): Promise<MetaCampaign[]> {
  const {
    accessToken,
    adAccountId,
    statusFilter = ['ACTIVE', 'PAUSED'],
    maxRetries = 3,
  } = options

  const params = new URLSearchParams({
    fields: ['id', 'name', 'status', 'objective', 'daily_budget', 'lifetime_budget', 'start_time', 'stop_time'].join(','),
    limit: '100',
  })

  if (statusFilter.length > 0) {
    params.set('effective_status', JSON.stringify(statusFilter))
  }

  await appendMetaAuthParams({ params, accessToken, appSecret: process.env.META_APP_SECRET })

  const url = `${META_API_BASE}/${adAccountId}/campaigns?${params.toString()}`

  const { payload } = await executeMetaApiRequest<{
    data?: Array<{
      id?: string
      name?: string
      status?: string
      objective?: string
      daily_budget?: string
      lifetime_budget?: string
      start_time?: string
      stop_time?: string
    }>
  }>({
    url,
    accessToken,
    operation: 'listCampaigns',
    maxRetries,
  })

  const campaigns = Array.isArray(payload?.data) ? payload.data : []

  return campaigns.map((c) => ({
    id: c.id ?? '',
    name: c.name ?? '',
    status: (c.status ?? 'PAUSED') as 'ACTIVE' | 'PAUSED' | 'DELETED' | 'ARCHIVED',
    objective: c.objective,
    dailyBudget: c.daily_budget ? parseInt(c.daily_budget, 10) / 100 : undefined,
    lifetimeBudget: c.lifetime_budget ? parseInt(c.lifetime_budget, 10) / 100 : undefined,
    startTime: c.start_time,
    stopTime: c.stop_time,
  }))
}

// =============================================================================
// UPDATE CAMPAIGN STATUS
// =============================================================================

export async function updateMetaCampaignStatus(options: {
  accessToken: string
  campaignId: string
  status: 'ACTIVE' | 'PAUSED'
  maxRetries?: number
}): Promise<{ success: boolean }> {
  const {
    accessToken,
    campaignId,
    status,
    maxRetries = 3,
  } = options

  const params = new URLSearchParams()
  params.set('status', status)
  await appendMetaAuthParams({ params, accessToken, appSecret: process.env.META_APP_SECRET })

  const url = `${META_API_BASE}/${campaignId}?${params.toString()}`

  const { payload } = await executeMetaApiRequest<{ success?: boolean }>({
    url,
    accessToken,
    operation: 'updateCampaignStatus',
    method: 'POST',
    maxRetries,
  })

  return { success: payload?.success ?? true }
}

// =============================================================================
// UPDATE CAMPAIGN BUDGET
// =============================================================================

export async function updateMetaCampaignBudget(options: {
  accessToken: string
  campaignId: string
  dailyBudget?: number
  lifetimeBudget?: number
  maxRetries?: number
}): Promise<{ success: boolean }> {
  const {
    accessToken,
    campaignId,
    dailyBudget,
    lifetimeBudget,
    maxRetries = 3,
  } = options

  const params = new URLSearchParams()
  
  // Meta uses cents for budget
  if (dailyBudget !== undefined) {
    params.set('daily_budget', String(Math.round(dailyBudget * 100)))
  }
  if (lifetimeBudget !== undefined) {
    params.set('lifetime_budget', String(Math.round(lifetimeBudget * 100)))
  }

  await appendMetaAuthParams({ params, accessToken, appSecret: process.env.META_APP_SECRET })

  const url = `${META_API_BASE}/${campaignId}?${params.toString()}`

  const { payload } = await executeMetaApiRequest<{ success?: boolean }>({
    url,
    accessToken,
    operation: 'updateCampaignBudget',
    method: 'POST',
    maxRetries,
  })

  return { success: payload?.success ?? true }
}

// =============================================================================
// ARCHIVE (DELETE) CAMPAIGN
// =============================================================================

export async function removeMetaCampaign(options: {
  accessToken: string
  campaignId: string
  maxRetries?: number
}): Promise<{ success: boolean }> {
  return updateMetaCampaignStatus({
    ...options,
    status: 'PAUSED', // Meta doesn't truly delete, we pause instead
  })
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

  const { payload } = await executeMetaApiRequest<MetaInsightsResponse>({
    url,
    accessToken,
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
    }
  })
}

// =============================================================================
// FETCH CREATIVES
// =============================================================================

export async function fetchMetaCreatives(options: {
  accessToken: string
  adAccountId: string
  campaignId?: string
  adSetId?: string
  statusFilter?: ('ACTIVE' | 'PAUSED')[]
  maxRetries?: number
}): Promise<MetaCreative[]> {
  const {
    accessToken,
    adAccountId,
    campaignId,
    statusFilter = ['ACTIVE', 'PAUSED'],
    maxRetries = 3,
  } = options

  const params = new URLSearchParams({
    fields: [
      'id',
      'name',
      'status',
      'effective_status',
      'adset_id',
      'campaign_id',
      'adcreatives{id,name,thumbnail_url,object_story_spec}',
    ].join(','),
    limit: '100',
  })

  if (statusFilter.length > 0) {
    params.set('effective_status', JSON.stringify(statusFilter))
  }

  await appendMetaAuthParams({ params, accessToken, appSecret: process.env.META_APP_SECRET })

  let url = `${META_API_BASE}/${adAccountId}/ads?${params.toString()}`
  if (campaignId) {
    url = `${META_API_BASE}/${campaignId}/ads?${params.toString()}`
  }

  const { payload } = await executeMetaApiRequest<MetaAdsListResponse>({
    url,
    accessToken,
    operation: 'fetchCreatives',
    maxRetries,
  })

  const ads: MetaAdData[] = Array.isArray(payload?.data) ? payload.data : []

  return ads.map((ad) => {
    const creative = Array.isArray(ad.adcreatives?.data) ? ad.adcreatives.data[0] : undefined
    const storySpec = creative?.object_story_spec

    return {
      adId: ad.id ?? '',
      adSetId: '', // Would need separate call to get adset
      campaignId: '', // Would need separate call to get campaign
      adName: ad.name,
      status: (ad.effective_status ?? ad.status ?? 'PAUSED') as 'ACTIVE' | 'PAUSED' | 'DELETED' | 'ARCHIVED',
      creativeId: creative?.id,
      creativeName: creative?.name,
      thumbnailUrl: creative?.thumbnail_url,
      callToAction: storySpec?.link_data?.call_to_action?.type,
      landingPageUrl: storySpec?.link_data?.link,
      videoId: storySpec?.video_data?.video_id,
      message: storySpec?.link_data?.message ?? storySpec?.video_data?.message,
    }
  })
}

// =============================================================================
// FETCH AUDIENCE TARGETING
// =============================================================================

export async function fetchMetaAudienceTargeting(options: {
  accessToken: string
  adAccountId: string
  campaignId?: string
  maxRetries?: number
}): Promise<MetaAudienceTargeting[]> {
  const {
    accessToken,
    adAccountId,
    campaignId,
    maxRetries = 3,
  } = options

  const params = new URLSearchParams({
    fields: [
      'id',
      'name',
      'campaign_id',
      'targeting',
    ].join(','),
    limit: '100',
  })

  await appendMetaAuthParams({ params, accessToken, appSecret: process.env.META_APP_SECRET })

  let url = `${META_API_BASE}/${adAccountId}/adsets?${params.toString()}`
  if (campaignId) {
    url = `${META_API_BASE}/${campaignId}/adsets?${params.toString()}`
  }

  const { payload } = await executeMetaApiRequest<{
    data?: Array<{
      id?: string
      name?: string
      campaign_id?: string
      targeting?: {
        age_min?: number
        age_max?: number
        genders?: number[]
        geo_locations?: {
          countries?: string[]
          regions?: Array<{ key: string; name: string }>
          cities?: Array<{ key: string; name: string }>
        }
        excluded_geo_locations?: {
          countries?: string[]
        }
        interests?: Array<{ id: string; name: string }>
        behaviors?: Array<{ id: string; name: string }>
        custom_audiences?: Array<{ id: string; name: string }>
        excluded_custom_audiences?: Array<{ id: string; name: string }>
        publisher_platforms?: string[]
        device_platforms?: string[]
      }
    }>
  }>({
    url,
    accessToken,
    operation: 'fetchAudienceTargeting',
    maxRetries,
  })

  const adSets = Array.isArray(payload?.data) ? payload.data : []

  return adSets.map((adSet) => {
    const targeting = adSet.targeting ?? {}

    const geoLocations: Array<{ name: string; type: string; key: string }> = []
    
    targeting.geo_locations?.countries?.forEach(c => {
      geoLocations.push({ name: c, type: 'country', key: c })
    })
    targeting.geo_locations?.regions?.forEach(r => {
      geoLocations.push({ name: r.name, type: 'region', key: r.key })
    })
    targeting.geo_locations?.cities?.forEach(c => {
      geoLocations.push({ name: c.name, type: 'city', key: c.key })
    })

    return {
      adSetId: adSet.id ?? '',
      adSetName: adSet.name,
      campaignId: adSet.campaign_id ?? '',
      campaignName: undefined,
      ageMin: targeting.age_min,
      ageMax: targeting.age_max,
      genders: targeting.genders ?? [],
      geoLocations,
      excludedGeoLocations: (targeting.excluded_geo_locations?.countries ?? []).map(c => ({ name: c, type: 'country' })),
      interests: targeting.interests ?? [],
      behaviors: targeting.behaviors ?? [],
      customAudiences: targeting.custom_audiences ?? [],
      excludedCustomAudiences: targeting.excluded_custom_audiences ?? [],
      lookalikeAudiences: [],
      connections: [],
      excludedConnections: [],
      publisherPlatforms: targeting.publisher_platforms ?? [],
      devicePlatforms: targeting.device_platforms ?? [],
    }
  })
}
