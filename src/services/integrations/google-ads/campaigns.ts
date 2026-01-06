// =============================================================================
// GOOGLE ADS CAMPAIGNS - Campaign CRUD and ad-level metrics
// =============================================================================

import { googleAdsSearch, DEFAULT_RETRY_CONFIG } from './client'
import { GoogleAdsApiError } from './errors'
import {
  GOOGLE_API_BASE,
  GoogleCampaign,
  GoogleAdMetric,
  GoogleAdsApiErrorResponse,
} from './types'

// =============================================================================
// LIST CAMPAIGNS
// =============================================================================

export async function listGoogleCampaigns(options: {
  accessToken: string
  developerToken: string
  customerId: string
  loginCustomerId?: string | null
  statusFilter?: ('ENABLED' | 'PAUSED' | 'REMOVED')[]
  maxRetries?: number
}): Promise<GoogleCampaign[]> {
  const {
    accessToken,
    developerToken,
    customerId,
    loginCustomerId,
    statusFilter = ['ENABLED', 'PAUSED'],
    maxRetries = 3,
  } = options

  const statusCondition = statusFilter.length > 0
    ? `WHERE campaign.status IN (${statusFilter.map(s => `'${s}'`).join(', ')})`
    : ''

  const query = `
    SELECT
      campaign.id,
      campaign.name,
      campaign.status,
      campaign.start_date,
      campaign.end_date,
      campaign.advertising_channel_type,
      campaign.bidding_strategy_type,
      campaign_budget.amount_micros,
      campaign_budget.id
    FROM campaign
    ${statusCondition}
    ORDER BY campaign.name
    LIMIT 500
  `.replace(/\s+/g, ' ').trim()

  const rows = await googleAdsSearch({
    accessToken,
    developerToken,
    customerId,
    loginCustomerId,
    query,
    pageSize: 500,
    maxPages: 1,
    maxRetries,
  })

  return rows.map((row) => {
    const campaign = row.campaign as {
      id?: string
      name?: string
      status?: string
      startDate?: string
      endDate?: string
      advertisingChannelType?: string
      biddingStrategyType?: string
    } | undefined

    const budget = row.campaignBudget as {
      id?: string
      amountMicros?: string
    } | undefined

    return {
      id: campaign?.id ?? '',
      name: campaign?.name ?? '',
      status: (campaign?.status ?? 'PAUSED') as 'ENABLED' | 'PAUSED' | 'REMOVED',
      budgetAmountMicros: budget?.amountMicros ? parseInt(budget.amountMicros, 10) : undefined,
      budgetId: budget?.id,
      biddingStrategyType: campaign?.biddingStrategyType,
      startDate: campaign?.startDate,
      endDate: campaign?.endDate,
      advertisingChannelType: campaign?.advertisingChannelType,
    }
  })
}

// =============================================================================
// UPDATE CAMPAIGN STATUS
// =============================================================================

export async function updateGoogleCampaignStatus(options: {
  accessToken: string
  developerToken: string
  customerId: string
  campaignId: string
  status: 'ENABLED' | 'PAUSED'
  loginCustomerId?: string | null
}): Promise<{ success: boolean; message?: string }> {
  const {
    accessToken,
    developerToken,
    customerId,
    campaignId,
    status,
    loginCustomerId,
  } = options

  const url = `${GOOGLE_API_BASE}/customers/${customerId}/campaigns:mutate`
  
  const headers: Record<string, string> = {
    Authorization: `Bearer ${accessToken}`,
    'developer-token': developerToken,
    'Content-Type': 'application/json',
  }

  if (loginCustomerId) {
    headers['login-customer-id'] = loginCustomerId
  }

  const mutation = {
    operations: [{
      update: {
        resourceName: `customers/${customerId}/campaigns/${campaignId}`,
        status,
      },
      updateMask: 'status',
    }],
  }

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(mutation),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({})) as GoogleAdsApiErrorResponse
    throw new GoogleAdsApiError({
      message: errorData?.error?.message ?? 'Campaign update failed',
      httpStatus: response.status,
      errorCode: 'MUTATION_ERROR',
    })
  }

  return { success: true, message: `Campaign ${status.toLowerCase()}` }
}

// =============================================================================
// UPDATE CAMPAIGN BUDGET
// =============================================================================

export async function updateGoogleCampaignBudget(options: {
  accessToken: string
  developerToken: string
  customerId: string
  budgetId: string
  amountMicros: number
  loginCustomerId?: string | null
}): Promise<{ success: boolean }> {
  const {
    accessToken,
    developerToken,
    customerId,
    budgetId,
    amountMicros,
    loginCustomerId,
  } = options

  const url = `${GOOGLE_API_BASE}/customers/${customerId}/campaignBudgets:mutate`
  
  const headers: Record<string, string> = {
    Authorization: `Bearer ${accessToken}`,
    'developer-token': developerToken,
    'Content-Type': 'application/json',
  }

  if (loginCustomerId) {
    headers['login-customer-id'] = loginCustomerId
  }

  const mutation = {
    operations: [{
      update: {
        resourceName: `customers/${customerId}/campaignBudgets/${budgetId}`,
        amountMicros: amountMicros.toString(),
      },
      updateMask: 'amount_micros',
    }],
  }

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(mutation),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({})) as GoogleAdsApiErrorResponse
    throw new GoogleAdsApiError({
      message: errorData?.error?.message ?? 'Budget update failed',
      httpStatus: response.status,
      errorCode: 'MUTATION_ERROR',
    })
  }

  return { success: true }
}

// =============================================================================
// GET BUDGET ID FROM CAMPAIGN
// =============================================================================

export async function getGoogleCampaignBudgetId(options: {
  accessToken: string
  developerToken: string
  customerId: string
  campaignId: string
  loginCustomerId?: string | null
  maxRetries?: number
}): Promise<string | null> {
  const {
    accessToken,
    developerToken,
    customerId,
    campaignId,
    loginCustomerId,
    maxRetries = 3,
  } = options

  const query = `
    SELECT
      campaign.id,
      campaign_budget.id
    FROM campaign
    WHERE campaign.id = ${campaignId}
    LIMIT 1
  `.replace(/\s+/g, ' ').trim()

  const rows = await googleAdsSearch({
    accessToken,
    developerToken,
    customerId,
    loginCustomerId,
    query,
    pageSize: 1,
    maxPages: 1,
    maxRetries,
  })

  if (rows.length === 0) return null

  const budget = rows[0].campaignBudget as { id?: string } | undefined
  return budget?.id ?? null
}

// =============================================================================
// UPDATE CAMPAIGN BUDGET BY CAMPAIGN ID (auto-fetches budgetId)
// =============================================================================

export async function updateGoogleCampaignBudgetByCampaign(options: {
  accessToken: string
  developerToken: string
  customerId: string
  campaignId: string
  amountMicros: number
  loginCustomerId?: string | null
}): Promise<{ success: boolean }> {
  const {
    accessToken,
    developerToken,
    customerId,
    campaignId,
    amountMicros,
    loginCustomerId,
  } = options

  // First, get the budget ID for this campaign
  const budgetId = await getGoogleCampaignBudgetId({
    accessToken,
    developerToken,
    customerId,
    campaignId,
    loginCustomerId,
  })

  if (!budgetId) {
    throw new GoogleAdsApiError({
      message: 'Campaign budget not found',
      httpStatus: 404,
      errorCode: 'BUDGET_NOT_FOUND',
    })
  }

  // Now update the budget
  return updateGoogleCampaignBudget({
    accessToken,
    developerToken,
    customerId,
    budgetId,
    amountMicros,
    loginCustomerId,
  })
}

// =============================================================================
// DELETE (REMOVE) CAMPAIGN

// =============================================================================

export async function removeGoogleCampaign(options: {
  accessToken: string
  developerToken: string
  customerId: string
  campaignId: string
  loginCustomerId?: string | null
}): Promise<{ success: boolean }> {
  return updateGoogleCampaignStatus({
    ...options,
    status: 'PAUSED',
  }) as Promise<{ success: boolean }>
}

// =============================================================================
// FETCH AD GROUP METRICS
// =============================================================================

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

// =============================================================================
// FETCH AD METRICS
// =============================================================================

export async function fetchGoogleAdMetrics(options: {
  accessToken: string
  developerToken: string
  customerId: string
  campaignId?: string
  adGroupId?: string
  loginCustomerId?: string | null
  timeframeDays: number
  maxRetries?: number
}): Promise<GoogleAdMetric[]> {
  const {
    accessToken,
    developerToken,
    customerId,
    campaignId,
    adGroupId,
    loginCustomerId,
    timeframeDays,
    maxRetries = 3,
  } = options

  const days = Math.max(timeframeDays, 1)
  let filters = ''
  if (campaignId) filters += ` AND campaign.id = ${campaignId}`
  if (adGroupId) filters += ` AND ad_group.id = ${adGroupId}`

  const query = `
    SELECT
      segments.date,
      ad_group_ad.ad.id,
      ad_group_ad.ad.final_urls,
      ad_group_ad.ad.responsive_search_ad.headlines,
      ad_group_ad.ad.responsive_search_ad.descriptions,
      ad_group.id,
      ad_group.name,
      campaign.id,
      campaign.name,
      metrics.impressions,
      metrics.clicks,
      metrics.cost_micros,
      metrics.conversions,
      metrics.conversions_value
    FROM ad_group_ad
    WHERE segments.date DURING LAST_${days}_DAYS
    ${filters}
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
    const adGroupAd = row.adGroupAd as {
      ad?: {
        id?: string
        finalUrls?: string[]
        responsiveSearchAd?: {
          headlines?: Array<{ text?: string }>
          descriptions?: Array<{ text?: string }>
        }
      }
    } | undefined
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

    const ad = adGroupAd?.ad
    const costMicros = metrics?.costMicros ?? metrics?.cost_micros
    const convValue = metrics?.conversionsValue ?? metrics?.conversions_value

    return {
      adId: ad?.id ?? '',
      adGroupId: adGroup?.id ?? '',
      campaignId: campaign?.id ?? '',
      headline: ad?.responsiveSearchAd?.headlines?.[0]?.text,
      description: ad?.responsiveSearchAd?.descriptions?.[0]?.text,
      finalUrl: ad?.finalUrls?.[0],
      date: segments?.date ?? '',
      impressions: parseInt(metrics?.impressions ?? '0', 10),
      clicks: parseInt(metrics?.clicks ?? '0', 10),
      spend: costMicros ? parseInt(costMicros, 10) / 1_000_000 : 0,
      conversions: parseFloat(metrics?.conversions ?? '0'),
      revenue: convValue ? parseFloat(convValue) : 0,
    }
  })
}

// =============================================================================
// FETCH CREATIVES
// =============================================================================

import { GoogleCreative } from './types'

export async function fetchGoogleCreatives(options: {
  accessToken: string
  developerToken: string
  customerId: string
  campaignId?: string
  adGroupId?: string
  loginCustomerId?: string | null
  statusFilter?: ('ENABLED' | 'PAUSED')[]
  maxRetries?: number
}): Promise<GoogleCreative[]> {
  const {
    accessToken,
    developerToken,
    customerId,
    campaignId,
    adGroupId,
    loginCustomerId,
    statusFilter = ['ENABLED', 'PAUSED'],
    maxRetries = 3,
  } = options

  let filters = ''
  if (campaignId) filters += ` AND campaign.id = ${campaignId}`
  if (adGroupId) filters += ` AND ad_group.id = ${adGroupId}`
  if (statusFilter.length > 0) {
    filters += ` AND ad_group_ad.status IN (${statusFilter.map(s => `'${s}'`).join(', ')})`
  }

  const query = `
    SELECT
      ad_group_ad.ad.id,
      ad_group_ad.ad.type,
      ad_group_ad.status,
      ad_group_ad.ad.final_urls,
      ad_group_ad.ad.display_url,
      ad_group_ad.ad.responsive_search_ad.headlines,
      ad_group_ad.ad.responsive_search_ad.descriptions,
      ad_group_ad.ad.responsive_display_ad.headlines,
      ad_group_ad.ad.responsive_display_ad.descriptions,
      ad_group_ad.ad.responsive_display_ad.marketing_images,
      ad_group_ad.ad.responsive_display_ad.business_name,
      ad_group_ad.ad.responsive_display_ad.call_to_action_text,
      ad_group_ad.ad.image_ad.image_url,
      ad_group_ad.ad.video_ad.video.id,
      ad_group.id,
      ad_group.name,
      campaign.id,
      campaign.name
    FROM ad_group_ad
    WHERE ad_group_ad.status != 'REMOVED'
    ${filters}
    ORDER BY campaign.name, ad_group.name
    LIMIT 500
  `.replace(/\s+/g, ' ').trim()

  const rows = await googleAdsSearch({
    accessToken,
    developerToken,
    customerId,
    loginCustomerId,
    query,
    pageSize: 500,
    maxPages: 1,
    maxRetries,
  })

  return rows.map((row) => {
    const adGroupAd = row.adGroupAd as {
      ad?: {
        id?: string
        type?: string
        finalUrls?: string[]
        displayUrl?: string
        responsiveSearchAd?: {
          headlines?: Array<{ text?: string }>
          descriptions?: Array<{ text?: string }>
        }
        responsiveDisplayAd?: {
          headlines?: Array<{ text?: string }>
          descriptions?: Array<{ text?: string }>
          marketingImages?: Array<{ asset?: string }>
          businessName?: string
          callToActionText?: string
        }
        imageAd?: {
          imageUrl?: string
        }
        videoAd?: {
          video?: { id?: string }
        }
      }
      status?: string
    } | undefined

    const adGroup = row.adGroup as { id?: string; name?: string } | undefined
    const campaign = row.campaign as { id?: string; name?: string } | undefined
    const ad = adGroupAd?.ad

    // Determine ad type
    let type: GoogleCreative['type'] = 'OTHER'
    if (ad?.type === 'RESPONSIVE_SEARCH_AD' || ad?.responsiveSearchAd) {
      type = 'RESPONSIVE_SEARCH_AD'
    } else if (ad?.type === 'RESPONSIVE_DISPLAY_AD' || ad?.responsiveDisplayAd) {
      type = 'RESPONSIVE_DISPLAY_AD'
    } else if (ad?.type === 'IMAGE_AD' || ad?.imageAd) {
      type = 'IMAGE_AD'
    } else if (ad?.type === 'VIDEO_AD' || ad?.videoAd) {
      type = 'VIDEO_AD'
    }

    // Extract headlines and descriptions based on ad type
    let headlines: string[] = []
    let descriptions: string[] = []
    
    if (type === 'RESPONSIVE_SEARCH_AD' && ad?.responsiveSearchAd) {
      headlines = ad.responsiveSearchAd.headlines?.map(h => h.text ?? '').filter(Boolean) ?? []
      descriptions = ad.responsiveSearchAd.descriptions?.map(d => d.text ?? '').filter(Boolean) ?? []
    } else if (type === 'RESPONSIVE_DISPLAY_AD' && ad?.responsiveDisplayAd) {
      headlines = ad.responsiveDisplayAd.headlines?.map(h => h.text ?? '').filter(Boolean) ?? []
      descriptions = ad.responsiveDisplayAd.descriptions?.map(d => d.text ?? '').filter(Boolean) ?? []
    }

    return {
      adId: ad?.id ?? '',
      adGroupId: adGroup?.id ?? '',
      campaignId: campaign?.id ?? '',
      adGroupName: adGroup?.name,
      campaignName: campaign?.name,
      type,
      status: (adGroupAd?.status ?? 'PAUSED') as 'ENABLED' | 'PAUSED' | 'REMOVED',
      headlines,
      descriptions,
      finalUrls: ad?.finalUrls ?? [],
      displayUrl: ad?.displayUrl,
      imageUrl: ad?.imageAd?.imageUrl,
      videoId: ad?.videoAd?.video?.id,
      businessName: ad?.responsiveDisplayAd?.businessName,
      callToAction: ad?.responsiveDisplayAd?.callToActionText,
    }
  })
}

// =============================================================================
// FETCH AUDIENCE TARGETING
// =============================================================================

import { GoogleAudienceTargeting } from './types'

export async function fetchGoogleAudienceTargeting(options: {
  accessToken: string
  developerToken: string
  customerId: string
  campaignId?: string
  adGroupId?: string
  loginCustomerId?: string | null
  maxRetries?: number
}): Promise<GoogleAudienceTargeting[]> {
  const {
    accessToken,
    developerToken,
    customerId,
    campaignId,
    adGroupId,
    loginCustomerId,
    maxRetries = 3,
  } = options

  let filters = ''
  if (campaignId) filters += ` AND campaign.id = ${campaignId}`
  if (adGroupId) filters += ` AND ad_group.id = ${adGroupId}`

  // Query ad group criteria for targeting
  const query = `
    SELECT
      ad_group.id,
      ad_group.name,
      campaign.id,
      campaign.name,
      ad_group_criterion.criterion_id,
      ad_group_criterion.type,
      ad_group_criterion.status,
      ad_group_criterion.negative,
      ad_group_criterion.age_range.type,
      ad_group_criterion.gender.type,
      ad_group_criterion.parental_status.type,
      ad_group_criterion.income_range.type,
      ad_group_criterion.user_interest.user_interest_category,
      ad_group_criterion.user_list.user_list,
      ad_group_criterion.keyword.text,
      ad_group_criterion.keyword.match_type,
      ad_group_criterion.placement.url,
      ad_group_criterion.topic.path,
      ad_group_criterion.language.language_constant
    FROM ad_group_criterion
    WHERE ad_group_criterion.status != 'REMOVED'
    ${filters}
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

  // Group by ad group
  const targetingMap = new Map<string, GoogleAudienceTargeting>()

  for (const row of rows) {
    const adGroup = row.adGroup as { id?: string; name?: string } | undefined
    const campaign = row.campaign as { id?: string; name?: string } | undefined
    const criterion = row.adGroupCriterion as {
      criterionId?: string
      type?: string
      status?: string
      negative?: boolean
      ageRange?: { type?: string }
      gender?: { type?: string }
      parentalStatus?: { type?: string }
      incomeRange?: { type?: string }
      userInterest?: { userInterestCategory?: string }
      userList?: { userList?: string }
      keyword?: { text?: string; matchType?: string }
      placement?: { url?: string }
      topic?: { path?: string[] }
      language?: { languageConstant?: string }
    } | undefined

    const adGroupId = adGroup?.id ?? ''
    if (!adGroupId) continue

    if (!targetingMap.has(adGroupId)) {
      targetingMap.set(adGroupId, {
        adGroupId,
        adGroupName: adGroup?.name,
        campaignId: campaign?.id ?? '',
        campaignName: campaign?.name,
        ageRanges: [],
        genders: [],
        parentalStatus: [],
        incomeRanges: [],
        affinityAudiences: [],
        inMarketAudiences: [],
        customAudiences: [],
        remarketingLists: [],
        locations: [],
        excludedLocations: [],
        languages: [],
        devices: [],
        platforms: [],
        keywords: [],
        topics: [],
        placements: [],
      })
    }

    const targeting = targetingMap.get(adGroupId)!
    const type = criterion?.type

    if (type === 'AGE_RANGE' && criterion?.ageRange?.type) {
      targeting.ageRanges.push(criterion.ageRange.type)
    } else if (type === 'GENDER' && criterion?.gender?.type) {
      targeting.genders.push(criterion.gender.type)
    } else if (type === 'PARENTAL_STATUS' && criterion?.parentalStatus?.type) {
      targeting.parentalStatus.push(criterion.parentalStatus.type)
    } else if (type === 'INCOME_RANGE' && criterion?.incomeRange?.type) {
      targeting.incomeRanges.push(criterion.incomeRange.type)
    } else if (type === 'USER_INTEREST' && criterion?.userInterest?.userInterestCategory) {
      const category = criterion.userInterest.userInterestCategory
      // Affinity vs In-Market determined by category prefix
      if (category.includes('AFFINITY')) {
        targeting.affinityAudiences.push({ id: category, name: category })
      } else {
        targeting.inMarketAudiences.push({ id: category, name: category })
      }
    } else if (type === 'USER_LIST' && criterion?.userList?.userList) {
      targeting.remarketingLists.push({ 
        id: criterion.userList.userList, 
        name: criterion.userList.userList 
      })
    } else if (type === 'KEYWORD' && criterion?.keyword?.text) {
      targeting.keywords.push({
        text: criterion.keyword.text,
        matchType: criterion.keyword.matchType ?? 'BROAD',
      })
    } else if (type === 'PLACEMENT' && criterion?.placement?.url) {
      targeting.placements.push({
        url: criterion.placement.url,
        type: 'WEBSITE',
      })
    } else if (type === 'TOPIC' && criterion?.topic?.path) {
      targeting.topics.push({
        id: criterion.topic.path.join('/'),
        name: criterion.topic.path.join(' > '),
      })
    } else if (type === 'LANGUAGE' && criterion?.language?.languageConstant) {
      targeting.languages.push(criterion.language.languageConstant)
    }
  }

  return Array.from(targetingMap.values())
}
