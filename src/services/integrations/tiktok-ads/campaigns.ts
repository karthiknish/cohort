// =============================================================================
// TIKTOK ADS CAMPAIGNS - Campaign CRUD and ad-level metrics
// =============================================================================

import { formatDate } from '@/lib/dates'
import { coerceNumber } from './client'
import { tiktokAdsClient } from '@/services/integrations/shared/base-client'
import { TikTokApiError } from './errors'
import {
  TikTokCampaign,
  TikTokAdMetric,
  TikTokApiErrorResponse,
  TikTokReportResponse,
} from './types'

// =============================================================================
// LIST CAMPAIGNS
// =============================================================================

export async function listTikTokCampaigns(options: {
  accessToken: string
  advertiserId: string
  statusFilter?: ('ENABLE' | 'DISABLE')[]
  maxRetries?: number
}): Promise<TikTokCampaign[]> {
  const {
    accessToken,
    advertiserId,
    statusFilter,
    maxRetries = 3,
  } = options

  const requestPayload: Record<string, unknown> = {
    advertiser_id: advertiserId,
    page_size: 100,
  }

  if (statusFilter && statusFilter.length > 0) {
    requestPayload.primary_status = statusFilter[0]
  }

  const { payload } = await tiktokAdsClient.executeRequest<{
    code?: number
    message?: string
    request_id?: string
    data?: {
      list?: Array<{
        campaign_id?: string
        campaign_name?: string
        status?: string
        budget_mode?: string
        budget?: number
        objective_type?: string
      }>
    }
  }>({
    url: 'https://business-api.tiktok.com/open_api/v1.3/campaign/get/',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Access-Token': accessToken,
    },
    body: JSON.stringify(requestPayload),
    operation: 'listCampaigns',
    maxRetries,
  })

  const list = Array.isArray(payload?.data?.list) ? payload.data?.list ?? [] : []

  return list.map((item) => ({
    id: item.campaign_id ?? '',
    name: item.campaign_name ?? '',
    status: (item.status ?? 'DISABLE') as 'ENABLE' | 'DISABLE' | 'DELETE',
    budgetMode: (item.budget_mode ?? 'BUDGET_MODE_INFINITE') as 'BUDGET_MODE_DAY' | 'BUDGET_MODE_TOTAL' | 'BUDGET_MODE_INFINITE',
    budget: item.budget,
    objective: item.objective_type,
  }))
}

// =============================================================================
// UPDATE CAMPAIGN STATUS
// =============================================================================

export async function updateTikTokCampaignStatus(options: {
  accessToken: string
  advertiserId: string
  campaignId: string
  status: 'ENABLE' | 'DISABLE'
  maxRetries?: number
}): Promise<{ success: boolean }> {
  const {
    accessToken,
    advertiserId,
    campaignId,
    status,
    maxRetries = 3,
  } = options

  const { payload } = await tiktokAdsClient.executeRequest<TikTokApiErrorResponse>({
    url: 'https://business-api.tiktok.com/open_api/v1.3/campaign/status/update/',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Access-Token': accessToken,
    },
    body: JSON.stringify({
      advertiser_id: advertiserId,
      campaign_ids: [campaignId],
      opt_status: status,
    }),
    operation: 'updateCampaignStatus',
    maxRetries,
  })

  if (payload.code && payload.code !== 0) {
    throw new TikTokApiError({
      message: payload.message ?? 'Campaign status update failed',
      httpStatus: 400,
      errorCode: payload.code,
    })
  }

  return { success: true }
}

// =============================================================================
// UPDATE CAMPAIGN BUDGET
// =============================================================================

export async function updateTikTokCampaignBudget(options: {
  accessToken: string
  advertiserId: string
  campaignId: string
  budget: number
  budgetMode?: 'BUDGET_MODE_DAY' | 'BUDGET_MODE_TOTAL'
  maxRetries?: number
}): Promise<{ success: boolean }> {
  const {
    accessToken,
    advertiserId,
    campaignId,
    budget,
    budgetMode = 'BUDGET_MODE_DAY',
    maxRetries = 3,
  } = options

  const { payload } = await tiktokAdsClient.executeRequest<TikTokApiErrorResponse>({
    url: 'https://business-api.tiktok.com/open_api/v1.3/campaign/update/',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Access-Token': accessToken,
    },
    body: JSON.stringify({
      advertiser_id: advertiserId,
      campaign_id: campaignId,
      budget_mode: budgetMode,
      budget,
    }),
    operation: 'updateCampaignBudget',
    maxRetries,
  })

  if (payload.code && payload.code !== 0) {
    throw new TikTokApiError({
      message: payload.message ?? 'Campaign budget update failed',
      httpStatus: 400,
      errorCode: payload.code,
    })
  }

  return { success: true }
}

// =============================================================================
// DELETE/DISABLE CAMPAIGN
// =============================================================================

export async function removeTikTokCampaign(options: {
  accessToken: string
  advertiserId: string
  campaignId: string
  maxRetries?: number
}): Promise<{ success: boolean }> {
  return updateTikTokCampaignStatus({
    ...options,
    status: 'DISABLE',
  })
}

// =============================================================================
// FETCH AD-LEVEL METRICS
// =============================================================================

export async function fetchTikTokAdMetrics(options: {
  accessToken: string
  advertiserId: string
  campaignId?: string
  timeframeDays: number
  maxRetries?: number
}): Promise<TikTokAdMetric[]> {
  const {
    accessToken,
    advertiserId,
    campaignId,
    timeframeDays,
    maxRetries = 3,
  } = options

  const today = new Date()
  const start = new Date(today)
  start.setUTCDate(start.getUTCDate() - Math.max(0, timeframeDays - 1))

  const dimensions = ['ad_id', 'ad_name', 'adgroup_id', 'adgroup_name', 'campaign_id', 'campaign_name', 'stat_time_day']

  const requestPayload: Record<string, unknown> = {
    advertiser_id: advertiserId,
    data_level: 'AUCTION_AD',
    dimensions,
    metrics: ['spend', 'impressions', 'clicks', 'conversion', 'total_complete_payment'],
    start_date: formatDate(start, 'yyyy-MM-dd'),
    end_date: formatDate(today, 'yyyy-MM-dd'),
    page_size: 500,
    time_granularity: 'STAT_TIME_DAY',
  }

  if (campaignId) {
    requestPayload.filters = [{ field_name: 'campaign_id', filter_type: 'IN', filter_value: [campaignId] }]
  }

  const { payload } = await tiktokAdsClient.executeRequest<TikTokReportResponse>({
    url: 'https://business-api.tiktok.com/open_api/v1.3/report/integrated/get/',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Access-Token': accessToken,
    },
    body: JSON.stringify(requestPayload),
    operation: 'fetchAdMetrics',
    maxRetries,
  })

  const rows = Array.isArray(payload?.data?.list) ? payload.data?.list ?? [] : []

  return rows.map((row) => {
    const dims = row?.dimensions ?? {}
    const mets = row?.metrics ?? {}

    return {
      adId: String(dims.ad_id ?? ''),
      adGroupId: String(dims.adgroup_id ?? ''),
      campaignId: String(dims.campaign_id ?? ''),
      adName: String(dims.ad_name ?? ''),
      adGroupName: String(dims.adgroup_name ?? ''),
      campaignName: String(dims.campaign_name ?? ''),
      date: String(dims.stat_time_day ?? ''),
      impressions: coerceNumber(mets.impressions),
      clicks: coerceNumber(mets.clicks),
      spend: coerceNumber(mets.spend),
      conversions: coerceNumber(mets.conversion),
      revenue: coerceNumber(mets.total_complete_payment),
    }
  })
}

// =============================================================================
// FETCH CREATIVES
// =============================================================================

import { TikTokCreative } from './types'

export async function fetchTikTokCreatives(options: {
  accessToken: string
  advertiserId: string
  campaignId?: string
  adGroupId?: string
  statusFilter?: ('ENABLE' | 'DISABLE')[]
  maxRetries?: number
}): Promise<TikTokCreative[]> {
  const {
    accessToken,
    advertiserId,
    campaignId,
    adGroupId,
    statusFilter,
    maxRetries = 3,
  } = options

  const requestPayload: Record<string, unknown> = {
    advertiser_id: advertiserId,
    page_size: 100,
  }

  if (statusFilter && statusFilter.length > 0) {
    requestPayload.primary_status = statusFilter[0]
  }

  // If campaign or adgroup filter, use filtering
  const filters: Array<{ field_name: string; filter_type: string; filter_value: string[] }> = []
  if (campaignId) {
    filters.push({ field_name: 'campaign_id', filter_type: 'IN', filter_value: [campaignId] })
  }
  if (adGroupId) {
    filters.push({ field_name: 'adgroup_id', filter_type: 'IN', filter_value: [adGroupId] })
  }
  if (filters.length > 0) {
    requestPayload.filtering = { ad_ids: [], campaign_ids: campaignId ? [campaignId] : [], adgroup_ids: adGroupId ? [adGroupId] : [] }
  }

  const { payload } = await tiktokAdsClient.executeRequest<{
    code?: number
    message?: string
    request_id?: string
    data?: {
      list?: Array<{
        ad_id?: string
        ad_name?: string
        adgroup_id?: string
        adgroup_name?: string
        campaign_id?: string
        campaign_name?: string
        status?: string
        ad_format?: string
        image_ids?: string[]
        video_id?: string
        landing_page_url?: string
        call_to_action?: string
        ad_text?: string
        display_name?: string
        profile_image?: string
        image_mode?: string
      }>
    }
  }>({
    url: 'https://business-api.tiktok.com/open_api/v1.3/ad/get/',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Access-Token': accessToken,
    },
    body: JSON.stringify(requestPayload),
    operation: 'fetchCreatives',
    maxRetries,
  })

  const list = Array.isArray(payload?.data?.list) ? payload.data?.list ?? [] : []

  return list.map((item) => ({
    adId: item.ad_id ?? '',
    adGroupId: item.adgroup_id ?? '',
    campaignId: item.campaign_id ?? '',
    adName: item.ad_name,
    adGroupName: item.adgroup_name,
    campaignName: item.campaign_name,
    status: (item.status ?? 'DISABLE') as 'ENABLE' | 'DISABLE' | 'DELETE',
    format: item.ad_format ?? item.image_mode,
    videoId: item.video_id,
    title: item.ad_text,
    description: item.ad_text,
    callToAction: item.call_to_action,
    landingPageUrl: item.landing_page_url,
    displayName: item.display_name,
    profileImage: item.profile_image,
  }))
}

// =============================================================================
// FETCH AUDIENCE TARGETING
// =============================================================================

import { TikTokAudienceTargeting } from './types'

export async function fetchTikTokAudienceTargeting(options: {
  accessToken: string
  advertiserId: string
  campaignId?: string
  adGroupIds?: string[]
  maxRetries?: number
}): Promise<TikTokAudienceTargeting[]> {
  const {
    accessToken,
    advertiserId,
    campaignId,
    adGroupIds,
    maxRetries = 3,
  } = options

  const requestPayload: Record<string, unknown> = {
    advertiser_id: advertiserId,
    page_size: 100,
  }

  if (campaignId) {
    requestPayload.filtering = { campaign_ids: [campaignId] }
  }
  if (adGroupIds && adGroupIds.length > 0) {
    requestPayload.filtering = { ...(requestPayload.filtering as object || {}), adgroup_ids: adGroupIds }
  }

  const { payload } = await tiktokAdsClient.executeRequest<{
    code?: number
    message?: string
    data?: {
      list?: Array<{
        adgroup_id?: string
        adgroup_name?: string
        campaign_id?: string
        campaign_name?: string
        targeting?: {
          age?: string[]
          gender?: string
          languages?: string[]
          location?: Array<{ id?: string; name?: string }>
          excluded_custom_actions?: Array<{ code?: string }>
          interest_category_ids?: string[]
          interest_keywords?: string[]
          behavior_ids?: string[]
          audience_ids?: string[]
          excluded_audience_ids?: string[]
          operating_systems?: string[]
          device_models?: string[]
          network_types?: string[]
          carriers?: string[]
          placements?: string[]
        }
        schedule_type?: string
        dayparting?: string
      }>
    }
  }>({
    url: 'https://business-api.tiktok.com/open_api/v1.3/adgroup/get/',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Access-Token': accessToken,
    },
    body: JSON.stringify(requestPayload),
    operation: 'fetchAudienceTargeting',
    maxRetries,
  })

  const list = Array.isArray(payload?.data?.list) ? payload.data?.list ?? [] : []

  return list.map((item) => {
    const targeting = item.targeting ?? {}

    return {
      adGroupId: item.adgroup_id ?? '',
      adGroupName: item.adgroup_name,
      campaignId: item.campaign_id ?? '',
      campaignName: item.campaign_name,
      ageGroups: targeting.age ?? [],
      genders: targeting.gender ? [targeting.gender] : [],
      languages: targeting.languages ?? [],
      locations: (targeting.location ?? []).map((loc) => ({
        id: loc.id ?? '',
        name: loc.name ?? '',
        type: 'LOCATION',
      })),
      excludedLocations: [],
      interestCategories: (targeting.interest_category_ids ?? []).map((id) => ({
        id,
        name: id,
      })),
      interestKeywords: targeting.interest_keywords ?? [],
      behaviors: (targeting.behavior_ids ?? []).map((id) => ({
        id,
        name: id,
        category: 'behavior',
      })),
      customAudiences: (targeting.audience_ids ?? []).map((id) => ({
        id,
        name: id,
        type: 'custom',
      })),
      lookalikAudiences: [],
      operatingSystems: targeting.operating_systems ?? [],
      deviceModels: targeting.device_models ?? [],
      networkTypes: targeting.network_types ?? [],
      carriers: targeting.carriers ?? [],
      placements: targeting.placements ?? [],
    }
  })
}

// =============================================================================
// CREATE AUDIENCE (CUSTOM AUDIENCE)
// =============================================================================

export async function createTikTokAudience(options: {
  accessToken: string
  advertiserId: string
  name: string
  description?: string
  segments: string[]
  maxRetries?: number
}): Promise<{ success: boolean; id: string }> {
  const {
    accessToken,
    advertiserId,
    name,
    maxRetries = 3,
  } = options

  const { payload } = await tiktokAdsClient.executeRequest<{
    code?: number
    data?: { custom_audience_id?: string }
  }>({
    url: 'https://business-api.tiktok.com/open_api/v1.3/dmp/custom_audience/create/',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Access-Token': accessToken,
    },
    body: JSON.stringify({
      advertiser_id: advertiserId,
      custom_audience_name: name,
      type: 'REMARKETING',
    }),
    operation: 'createAudience',
    maxRetries,
  })

  return { 
    success: true, 
    id: String(payload?.data?.custom_audience_id ?? '') 
  }
}

// =============================================================================
// UPDATE CAMPAIGN BIDDING (Placeholder)
// =============================================================================

export async function updateTikTokCampaignBidding(options: {
  accessToken: string
  advertiserId: string
  campaignId: string
  biddingType: string
  biddingValue: number
  maxRetries?: number
}): Promise<{ success: boolean }> {
  // TikTok bidding is often at the adgroup level.
  void options
  return { success: true }
}
