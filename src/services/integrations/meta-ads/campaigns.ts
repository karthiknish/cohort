// =============================================================================
// META ADS CAMPAIGNS - Campaign CRUD, ad-level metrics, creatives, targeting
// =============================================================================

import {
  appendMetaAuthParams,
  buildTimeRange,
  coerceNumber,
  META_API_BASE,
} from './client'
import { metaAdsClient } from '@/services/integrations/shared/base-client'
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

  // Ensure adAccountId has act_ prefix if it's just a number
  const formattedAccountId = adAccountId.startsWith('act_') ? adAccountId : `act_${adAccountId}`

  if (statusFilter.length > 0) {
    const filtering = [
      {
        field: 'effective_status',
        operator: 'IN',
        value: statusFilter,
      },
    ]
    params.set('filtering', JSON.stringify(filtering))
  }

  await appendMetaAuthParams({ params, accessToken, appSecret: process.env.META_APP_SECRET })

  const url = `${META_API_BASE}/${formattedAccountId}/campaigns?${params.toString()}`

  const { payload } = await metaAdsClient.executeRequest<{
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

  const { payload } = await metaAdsClient.executeRequest<{ success?: boolean }>({
    url,
    operation: 'updateCampaignStatus',
    method: 'POST',
    maxRetries,
  })

  return { success: payload?.success ?? true }
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

  const { payload } = await metaAdsClient.executeRequest<{ success?: boolean }>({
    url,
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

// =============================================================================
// FETCH CREATIVES
// =============================================================================

export async function fetchMetaCreatives(options: {
  accessToken: string
  adAccountId: string
  campaignId?: string
  adSetId?: string
  statusFilter?: ('ACTIVE' | 'PAUSED' | 'DELETED' | 'ARCHIVED')[]
  maxRetries?: number
  includeVideoMedia?: boolean
  videoLookupLimit?: number
}): Promise<MetaCreative[]> {
  const {
    accessToken,
    adAccountId,
    campaignId,
    adSetId,
    statusFilter = ['ACTIVE', 'PAUSED', 'DELETED', 'ARCHIVED'],
    maxRetries = 3,
    includeVideoMedia = false,
    videoLookupLimit = 20,
  } = options

  // Ensure adAccountId has act_ prefix if it's just a number
  const formattedAccountId = adAccountId.startsWith('act_') ? adAccountId : `act_${adAccountId}`

  const params = new URLSearchParams({
    fields: [
      'id',
      'name',
      'status',
      'effective_status',
      'adset_id',
      'campaign_id',
      'adcreatives{id,name,thumbnail_url,image_url,object_story_spec{page_id,instagram_actor_id,link_data{link,message,picture,image_hash,call_to_action,name,caption,description},video_data{video_id,message,title,call_to_action}}}',
    ].join(','),
    limit: '100',
  })

  const filtering: Array<{ field: string; operator: string; value: string | string[] }> = []

  if (statusFilter.length > 0) {
    filtering.push({
      field: 'effective_status',
      operator: 'IN',
      value: statusFilter,
    })
  }

  if (campaignId) {
    filtering.push({
      field: 'campaign.id',
      operator: 'EQUAL',
      value: campaignId,
    })
  }

  if (adSetId) {
    filtering.push({
      field: 'adset.id',
      operator: 'EQUAL',
      value: adSetId,
    })
  }

  if (filtering.length > 0) {
    params.set('filtering', JSON.stringify(filtering))
  }

  await appendMetaAuthParams({ params, accessToken, appSecret: process.env.META_APP_SECRET })

  const url = `${META_API_BASE}/${formattedAccountId}/ads?${params.toString()}`

  const { payload } = await metaAdsClient.executeRequest<MetaAdsListResponse>({
    url,
    operation: 'fetchCreatives',
    maxRetries,
  })

  const ads: MetaAdData[] = Array.isArray(payload?.data) ? payload.data : []

  // Collect unique Page and Instagram Actor IDs
  const accountIds = Array.from(
    new Set(
      ads.flatMap((ad) => {
        const creative = ad.adcreatives?.data?.[0]
        const spec = creative?.object_story_spec
        return [spec?.page_id, spec?.instagram_actor_id].filter((id): id is string => typeof id === 'string' && id.length > 0)
      })
    )
  )

  let accountDetails: Record<string, { name: string; picture?: string }> = {}
  if (accountIds.length > 0) {
    const accountParams = new URLSearchParams({
      ids: accountIds.join(','),
      fields: 'name,picture.type(large)',
    })
    await appendMetaAuthParams({ params: accountParams, accessToken, appSecret: process.env.META_APP_SECRET })
    const accountUrl = `${META_API_BASE}/?${accountParams.toString()}`

    const { payload: accountPayload } = await metaAdsClient.executeRequest<Record<string, { name?: string; picture?: { data?: { url?: string } } }>>({
      url: accountUrl,
      operation: 'fetchAccountDetails',
      maxRetries,
    })

    if (accountPayload) {
      accountDetails = Object.fromEntries(
        Object.entries(accountPayload).map(([id, data]) => [
          id,
          {
            name: data.name ?? 'Unknown Account',
            picture: data.picture?.data?.url,
          },
        ])
      )
    }
  }

  // Base mapping first
  const baseCreatives = ads.map((ad) => {
    const creative = Array.isArray(ad.adcreatives?.data) ? ad.adcreatives.data[0] : undefined
    const storySpec = creative?.object_story_spec

    // Determine which account to use (prefer Instagram if available, fallback to Page)
    const accountId = storySpec?.instagram_actor_id || storySpec?.page_id
    const account = accountId ? accountDetails[accountId] : undefined

    return {
      adId: ad.id ?? '',
      adSetId: ad.adset_id ?? '',
      campaignId: ad.campaign_id ?? '',
      adName: ad.name,
      status: (ad.effective_status ?? ad.status ?? 'PAUSED') as 'ACTIVE' | 'PAUSED' | 'DELETED' | 'ARCHIVED',
      creativeId: creative?.id,
      creativeName: creative?.name,
      thumbnailUrl: creative?.thumbnail_url,
      imageUrl: creative?.image_url ?? storySpec?.link_data?.picture,
      callToAction: storySpec?.link_data?.call_to_action?.type ?? storySpec?.video_data?.call_to_action?.type,
      landingPageUrl: storySpec?.link_data?.link ?? storySpec?.video_data?.call_to_action?.value?.link,
      videoId: storySpec?.video_data?.video_id,
      message: storySpec?.link_data?.message ?? storySpec?.video_data?.message,
      pageName: account?.name,
      pageProfileImageUrl: account?.picture,
      headlines: [
        storySpec?.link_data?.name,
        storySpec?.video_data?.title,
        storySpec?.link_data?.caption,
        storySpec?.link_data?.description,
      ].filter((h): h is string => typeof h === 'string' && h.length > 0),
    }
  })

  if (!includeVideoMedia) {
    return baseCreatives
  }

  const videoIds = Array.from(
    new Set(
      baseCreatives
        .map((c) => c.videoId)
        .filter((id): id is string => typeof id === 'string' && id.length > 0)
    )
  ).slice(0, Math.max(0, videoLookupLimit))

  if (videoIds.length === 0) {
    return baseCreatives
  }

  type MetaVideoResponse = {
    source?: string
    picture?: {
      data?: {
        url?: string
      }
    }
  }

  const videoInfoEntries = await Promise.all(
    videoIds.map(async (videoId) => {
      const videoParams = new URLSearchParams({
        fields: 'source,picture,thumbnails{uri,width,height}',
      })
      await appendMetaAuthParams({ params: videoParams, accessToken, appSecret: process.env.META_APP_SECRET })
      const videoUrl = `${META_API_BASE}/${videoId}?${videoParams.toString()}`

      const { payload: videoPayload } = await metaAdsClient.executeRequest<{
        source?: string
        picture?: string
        thumbnails?: { data?: Array<{ uri?: string; width?: number; height?: number }> }
      }>({
        url: videoUrl,
        operation: 'fetchVideoMedia',
        maxRetries,
      })

      // Select the largest thumbnail if available
      let picture = videoPayload?.picture
      const thumbnails = videoPayload?.thumbnails?.data
      if (Array.isArray(thumbnails) && thumbnails.length > 0) {
        const sorted = [...thumbnails].sort((a, b) => ((b.width || 0) * (b.height || 0)) - ((a.width || 0) * (a.height || 0)))
        if (sorted[0]?.uri) {
          picture = sorted[0].uri
        }
      }

      return [videoId, {
        source: videoPayload?.source,
        picture,
      }] as const
    })
  )

  const videoInfoById = Object.fromEntries(videoInfoEntries) as Record<string, { source?: string; picture?: string }>

  return baseCreatives.map((creative) => {
    const id = creative.videoId
    if (!id) return creative

    const info = videoInfoById[id]
    if (!info) return creative

    return {
      ...creative,
      videoSourceUrl: info.source,
      videoThumbnailUrl: info.picture,
      // If the creative is a video, prefer the high-quality video thumbnail for the image preview.
      imageUrl: info.picture || creative.imageUrl,
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

  const { payload } = await metaAdsClient.executeRequest<{
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
        facebook_positions?: string[]
        instagram_positions?: string[]
        audience_network_positions?: string[]
        messenger_positions?: string[]
        flexible_spec?: Array<{
          interests?: Array<{ id: string; name: string }>
          behaviors?: Array<{ id: string; name: string }>
          demographics?: Array<{ id: string; name: string }>
          life_events?: Array<{ id: string; name: string }>
          industries?: Array<{ id: string; name: string }>
          work_positions?: Array<{ id: string; name: string }>
          work_employers?: Array<{ id: string; name: string }>
        }>
        exclusions?: {
          interests?: Array<{ id: string; name: string }>
          behaviors?: Array<{ id: string; name: string }>
        }
      }
    }>
  }>({
    url,
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
      facebookPositions: targeting.facebook_positions,
      instagramPositions: targeting.instagram_positions,
      audienceNetworkPositions: targeting.audience_network_positions,
      messengerPositions: targeting.messenger_positions,
      flexible_spec: targeting.flexible_spec,
      exclusions: targeting.exclusions,
    }
  })
}

// =============================================================================
// CREATE AUDIENCE (CUSTOM AUDIENCE)
// =============================================================================

export async function createMetaAudience(options: {
  accessToken: string
  adAccountId: string
  name: string
  description?: string
  segments: string[]
  maxRetries?: number
}): Promise<{ success: boolean; id: string }> {
  const {
    accessToken,
    adAccountId,
    name,
    description,
    maxRetries = 3,
  } = options

  const params = new URLSearchParams({
    name,
    description: description || `Created via Cohort Ads Hub`,
    subtype: 'CUSTOM',
    customer_file_source: 'BOTH_USER_AND_PARTNER_PROVIDED',
  })

  await appendMetaAuthParams({ params, accessToken, appSecret: process.env.META_APP_SECRET })

  const url = `${META_API_BASE}/${adAccountId}/customaudiences?${params.toString()}`

  const { payload } = await metaAdsClient.executeRequest<{ id?: string }>({
    url,
    operation: 'createAudience',
    method: 'POST',
    maxRetries,
  })

  return {
    success: true,
    id: payload?.id ?? ''
  }
}

// =============================================================================
// UPDATE CAMPAIGN BIDDING (Placeholder)
// =============================================================================

export async function updateMetaCampaignBidding(options: {
  accessToken: string
  campaignId: string
  biddingType: string
  biddingValue: number
  maxRetries?: number
}): Promise<{ success: boolean }> {
  const {
    accessToken,
    campaignId,
    biddingValue,
    maxRetries = 3,
  } = options

  // 1. Fetch all ad sets for this campaign
  const params = new URLSearchParams({
    fields: 'id',
    limit: '100',
  })
  await appendMetaAuthParams({ params, accessToken, appSecret: process.env.META_APP_SECRET })

  const listUrl = `${META_API_BASE}/${campaignId}/adsets?${params.toString()}`
  const { payload } = await metaAdsClient.executeRequest<{ data?: Array<{ id: string }> }>({
    url: listUrl,
    operation: 'listAdSetsForBidding',
    maxRetries,
  })

  const adSets = payload?.data ?? []
  if (adSets.length === 0) {
    return { success: true } // No ad sets to update
  }

  // 2. Update each ad set's bid amount
  // Meta uses "bid_amount" in cents (like budgets) if the strategy allows it.
  // Note: Some bidding strategies don't support manual bids.
  const updatePromises = adSets.map(async (adSet) => {
    const updateParams = new URLSearchParams()
    updateParams.set('bid_amount', String(Math.round(biddingValue * 100)))
    await appendMetaAuthParams({ params: updateParams, accessToken, appSecret: process.env.META_APP_SECRET })

    const updateUrl = `${META_API_BASE}/${adSet.id}?${updateParams.toString()}`
    return metaAdsClient.executeRequest<{ success: boolean }>({
      url: updateUrl,
      operation: 'updateAdSetBidding',
      method: 'POST',
      maxRetries,
    })
  })

  await Promise.all(updatePromises)
  return { success: true }
}
