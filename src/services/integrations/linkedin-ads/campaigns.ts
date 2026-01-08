// =============================================================================
// LINKEDIN ADS CAMPAIGNS - Campaign CRUD and creative-level metrics
// =============================================================================

import {
  normalizeCurrency,
  coerceNumber,
  buildTimeRange,
  formatDate,
} from './client'
import { linkedinAdsClient } from '@/services/integrations/shared/base-client'
import { LinkedInApiError } from './errors'
import {
  LinkedInCampaign,
  LinkedInCreativeMetric,
  LinkedInApiErrorResponse,
} from './types'

// =============================================================================
// LIST CAMPAIGNS
// =============================================================================

export async function listLinkedInCampaigns(options: {
  accessToken: string
  accountId: string
  statusFilter?: ('ACTIVE' | 'PAUSED' | 'ARCHIVED')[]
  maxRetries?: number
}): Promise<LinkedInCampaign[]> {
  const {
    accessToken,
    accountId,
    statusFilter = ['ACTIVE', 'PAUSED'],
    maxRetries = 3,
  } = options

  const params = new URLSearchParams({
    q: 'search',
    'search.account.values[0]': `urn:li:sponsoredAccount:${accountId}`,
    count: '100',
  })

  statusFilter.forEach((status, index) => {
    params.set(`search.status.values[${index}]`, status)
  })

  const url = `https://api.linkedin.com/v2/adCampaignsV2?${params.toString()}`

  const { payload } = await linkedinAdsClient.executeRequest<{
    elements?: Array<{
      id?: string
      name?: string
      status?: string
      dailyBudget?: { amount?: string; currencyCode?: string }
      totalBudget?: { amount?: string; currencyCode?: string }
      costType?: string
      objectiveType?: string
    }>
  }>({
    url,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'X-Restli-Protocol-Version': '2.0.0',
      'Linkedin-Version': '202310',
    },
    operation: 'listCampaigns',
    maxRetries,
  })

  const elements = Array.isArray(payload?.elements) ? payload.elements : []

  return elements.map((item) => {
    const id = typeof item.id === 'string' ? item.id.replace('urn:li:sponsoredCampaign:', '') : ''

    return {
      id,
      name: item.name ?? '',
      status: (item.status ?? 'PAUSED') as 'ACTIVE' | 'PAUSED' | 'ARCHIVED' | 'DRAFT' | 'CANCELED',
      dailyBudget: item.dailyBudget?.amount ? parseFloat(item.dailyBudget.amount) : undefined,
      totalBudget: item.totalBudget?.amount ? parseFloat(item.totalBudget.amount) : undefined,
      costType: item.costType,
      objectiveType: item.objectiveType,
    }
  })
}

// =============================================================================
// UPDATE CAMPAIGN STATUS
// =============================================================================

export async function updateLinkedInCampaignStatus(options: {
  accessToken: string
  campaignId: string
  status: 'ACTIVE' | 'PAUSED' | 'ARCHIVED'
  maxRetries?: number
}): Promise<{ success: boolean }> {
  const {
    accessToken,
    campaignId,
    status,
    maxRetries = 3,
  } = options

  const url = `https://api.linkedin.com/v2/adCampaignsV2/urn:li:sponsoredCampaign:${campaignId}`

  const { payload } = await linkedinAdsClient.executeRequest<LinkedInApiErrorResponse>({
    url,
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Restli-Protocol-Version': '2.0.0',
      'Linkedin-Version': '202310',
      'X-HTTP-Method-Override': 'PATCH',
    },
    body: JSON.stringify({ patch: { $set: { status } } }),
    operation: 'updateCampaignStatus',
    maxRetries,
  })

  if (payload.status && payload.status >= 400) {
    throw new LinkedInApiError({
      message: payload.message ?? 'Campaign status update failed',
      httpStatus: payload.status,
    })
  }

  return { success: true }
}

// =============================================================================
// UPDATE CAMPAIGN BUDGET
// =============================================================================

export async function updateLinkedInCampaignBudget(options: {
  accessToken: string
  campaignId: string
  dailyBudget?: number
  totalBudget?: number
  currencyCode?: string
  maxRetries?: number
}): Promise<{ success: boolean }> {
  const {
    accessToken,
    campaignId,
    dailyBudget,
    totalBudget,
    currencyCode = 'USD',
    maxRetries = 3,
  } = options

  const url = `https://api.linkedin.com/v2/adCampaignsV2/urn:li:sponsoredCampaign:${campaignId}`

  const patchData: Record<string, unknown> = {}
  if (dailyBudget !== undefined) {
    patchData.dailyBudget = { amount: dailyBudget.toString(), currencyCode }
  }
  if (totalBudget !== undefined) {
    patchData.totalBudget = { amount: totalBudget.toString(), currencyCode }
  }

  const { payload } = await linkedinAdsClient.executeRequest<LinkedInApiErrorResponse>({
    url,
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Restli-Protocol-Version': '2.0.0',
      'Linkedin-Version': '202310',
      'X-HTTP-Method-Override': 'PATCH',
    },
    body: JSON.stringify({ patch: { $set: patchData } }),
    operation: 'updateCampaignBudget',
    maxRetries,
  })

  if (payload.status && payload.status >= 400) {
    throw new LinkedInApiError({
      message: payload.message ?? 'Campaign budget update failed',
      httpStatus: payload.status,
    })
  }

  return { success: true }
}

// =============================================================================
// ARCHIVE (DELETE) CAMPAIGN
// =============================================================================

export async function removeLinkedInCampaign(options: {
  accessToken: string
  campaignId: string
  maxRetries?: number
}): Promise<{ success: boolean }> {
  return updateLinkedInCampaignStatus({
    ...options,
    status: 'ARCHIVED',
  })
}

// =============================================================================
// FETCH CREATIVE-LEVEL METRICS
// =============================================================================

export async function fetchLinkedInCreativeMetrics(options: {
  accessToken: string
  accountId: string
  campaignId?: string
  timeframeDays: number
  maxRetries?: number
}): Promise<LinkedInCreativeMetric[]> {
  const {
    accessToken,
    accountId,
    campaignId,
    timeframeDays,
    maxRetries = 3,
  } = options

  const timeRange = buildTimeRange(timeframeDays)

  const params = new URLSearchParams({
    q: 'statistics',
    accounts: `urn:li:sponsoredAccount:${accountId}`,
    pivot: 'CREATIVE',
    timeGranularity: 'DAILY',
    start: timeRange.start,
    end: timeRange.end,
  })

  if (campaignId) {
    params.set('campaigns', `urn:li:sponsoredCampaign:${campaignId}`)
  }

  const url = `https://api.linkedin.com/v2/adAnalytics?${params.toString()}`

  const { payload } = await linkedinAdsClient.executeRequest<{
    elements?: Array<{
      creative?: string
      campaignGroup?: string
      campaign?: string
      timeRange?: { start?: string }
      costInLocalCurrency?: unknown
      impressions?: unknown
      clicks?: unknown
      conversions?: unknown
      externalWebsiteConversionsValue?: unknown
    }>
  }>({
    url,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'X-Restli-Protocol-Version': '2.0.0',
    },
    operation: 'fetchCreativeMetrics',
    maxRetries,
  })

  const elements = Array.isArray(payload?.elements) ? payload.elements : []

  return elements.map((row) => {
    const creativeId = row.creative?.replace('urn:li:sponsoredCreative:', '') ?? ''
    const campaignIdFromRow = row.campaign?.replace('urn:li:sponsoredCampaign:', '') ?? ''
    const campaignGroupId = row.campaignGroup?.replace('urn:li:sponsoredCampaignGroup:', '')
    const date = row.timeRange?.start ? formatDate(row.timeRange.start, 'yyyy-MM-dd') : ''

    return {
      creativeId,
      campaignId: campaignIdFromRow,
      campaignGroupId,
      date,
      impressions: coerceNumber(row.impressions),
      clicks: coerceNumber(row.clicks),
      spend: normalizeCurrency(row.costInLocalCurrency),
      conversions: coerceNumber(row.conversions),
      revenue: normalizeCurrency(row.externalWebsiteConversionsValue),
    }
  })
}

// =============================================================================
// FETCH CREATIVES
// =============================================================================

import { LinkedInCreative } from './types'

export async function fetchLinkedInCreatives(options: {
  accessToken: string
  accountId: string
  campaignId?: string
  statusFilter?: ('ACTIVE' | 'PAUSED' | 'DRAFT')[]
  maxRetries?: number
}): Promise<LinkedInCreative[]> {
  const {
    accessToken,
    accountId,
    campaignId,
    statusFilter = ['ACTIVE', 'PAUSED'],
    maxRetries = 3,
  } = options

  const params = new URLSearchParams({
    q: 'search',
    'search.account.values[0]': `urn:li:sponsoredAccount:${accountId}`,
    count: '100',
  })

  statusFilter.forEach((status, index) => {
    params.set(`search.status.values[${index}]`, status)
  })

  if (campaignId) {
    params.set('search.campaign.values[0]', `urn:li:sponsoredCampaign:${campaignId}`)
  }

  const url = `https://api.linkedin.com/v2/adCreativesV2?${params.toString()}`

  const { payload } = await linkedinAdsClient.executeRequest<{
    elements?: Array<{
      id?: string
      campaign?: string
      campaignGroup?: string
      status?: string
      type?: string
      reference?: string
      variables?: {
        data?: {
          'com.linkedin.ads.SponsoredUpdateCreativeVariables'?: {
            activity?: string
          }
          'com.linkedin.ads.TextAdCreativeVariables'?: {
            title?: string
            text?: string
            vectorImage?: string
          }
          'com.linkedin.ads.VideoCreativeVariables'?: {
            videoUrn?: string
          }
        }
      }
      callToAction?: {
        labelType?: string
        target?: string
      }
    }>
  }>({
    url,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'X-Restli-Protocol-Version': '2.0.0',
      'LinkedIn-Version': '202310',
    },
    operation: 'fetchCreatives',
    maxRetries,
  })

  const elements = Array.isArray(payload?.elements) ? payload.elements : []

  return elements.map((item) => {
    const creativeId = item.id?.replace('urn:li:sponsoredCreative:', '') ?? ''
    const campaignIdFromItem = item.campaign?.replace('urn:li:sponsoredCampaign:', '') ?? ''
    const campaignGroupId = item.campaignGroup?.replace('urn:li:sponsoredCampaignGroup:', '')

    // Determine creative type
    let type: LinkedInCreative['type'] = 'OTHER'
    if (item.type === 'SPONSORED_STATUS_UPDATE') {
      type = 'SPONSORED_STATUS_UPDATE'
    } else if (item.type === 'TEXT_AD') {
      type = 'TEXT_AD'
    } else if (item.type === 'VIDEO') {
      type = 'VIDEO'
    } else if (item.type === 'SPONSORED_INMAILS') {
      type = 'SPONSORED_INMAILS'
    } else if (item.type === 'DYNAMIC') {
      type = 'DYNAMIC'
    }

    // Extract content based on type
    const textAdVars = item.variables?.data?.['com.linkedin.ads.TextAdCreativeVariables']
    const videoVars = item.variables?.data?.['com.linkedin.ads.VideoCreativeVariables']

    return {
      creativeId,
      campaignId: campaignIdFromItem,
      campaignGroupId,
      status: (item.status ?? 'PAUSED') as 'ACTIVE' | 'PAUSED' | 'ARCHIVED' | 'DRAFT',
      type,
      title: textAdVars?.title,
      description: textAdVars?.text,
      headline: textAdVars?.title,
      callToAction: item.callToAction?.labelType,
      landingPageUrl: item.callToAction?.target,
      imageUrl: textAdVars?.vectorImage,
      videoUrl: videoVars?.videoUrn,
    }
  })
}

// =============================================================================
// FETCH AUDIENCE TARGETING
// =============================================================================

import { LinkedInAudienceTargeting } from './types'

type TargetingFacet = {
  type?: string
  values?: string[]
  excluded?: boolean
}

export async function fetchLinkedInAudienceTargeting(options: {
  accessToken: string
  accountId: string
  campaignId?: string
  maxRetries?: number
}): Promise<LinkedInAudienceTargeting[]> {
  const {
    accessToken,
    accountId,
    campaignId,
    maxRetries = 3,
  } = options

  const params = new URLSearchParams({
    q: 'search',
    'search.account.values[0]': `urn:li:sponsoredAccount:${accountId}`,
    count: '100',
  })

  if (campaignId) {
    params.set('ids[0]', `urn:li:sponsoredCampaign:${campaignId}`)
  }

  const url = `https://api.linkedin.com/v2/adCampaignsV2?${params.toString()}`

  const { payload } = await linkedinAdsClient.executeRequest<{
    elements?: Array<{
      id?: string
      name?: string
      targetingCriteria?: {
        include?: {
          and?: Array<{
            or?: TargetingFacet
          }>
        }
        exclude?: {
          or?: TargetingFacet
        }
      }
    }>
  }>({
    url,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'X-Restli-Protocol-Version': '2.0.0',
      'LinkedIn-Version': '202310',
    },
    operation: 'fetchAudienceTargeting',
    maxRetries,
  })

  const elements = Array.isArray(payload?.elements) ? payload.elements : []

  return elements.map((item) => {
    const campaignIdValue = item.id?.replace('urn:li:sponsoredCampaign:', '') ?? ''
    const criteria = item.targetingCriteria

    const targeting: LinkedInAudienceTargeting = {
      campaignId: campaignIdValue,
      campaignName: item.name,
      ageRanges: [],
      genders: [],
      industries: [],
      companySizes: [],
      jobTitles: [],
      jobFunctions: [],
      jobSeniorities: [],
      skills: [],
      degrees: [],
      fieldsOfStudy: [],
      memberSchools: [],
      companyNames: [],
      companyFollowers: false,
      companyConnections: [],
      locations: [],
      excludedLocations: [],
      matchedAudiences: [],
      excludedAudiences: [],
      memberInterests: [],
      memberTraits: [],
      memberGroups: [],
    }

    // Parse include criteria
    const includeCriteria = criteria?.include?.and ?? []
    for (const criterionGroup of includeCriteria) {
      const facet = criterionGroup.or
      if (!facet?.type || !facet?.values) continue

      const type = facet.type
      const values = facet.values

      if (type.includes('ageRange')) {
        targeting.ageRanges.push(...values)
      } else if (type.includes('gender')) {
        targeting.genders.push(...values)
      } else if (type.includes('industry')) {
        values.forEach(v => targeting.industries.push({ id: v, name: v }))
      } else if (type.includes('companySize')) {
        targeting.companySizes.push(...values)
      } else if (type.includes('title')) {
        values.forEach(v => targeting.jobTitles.push({ id: v, name: v }))
      } else if (type.includes('function')) {
        values.forEach(v => targeting.jobFunctions.push({ id: v, name: v }))
      } else if (type.includes('seniority')) {
        targeting.jobSeniorities.push(...values)
      } else if (type.includes('skill')) {
        values.forEach(v => targeting.skills.push({ id: v, name: v }))
      } else if (type.includes('location')) {
        values.forEach(v => targeting.locations.push({ id: v, name: v, type: 'LOCATION' }))
      } else if (type.includes('interest')) {
        values.forEach(v => targeting.memberInterests.push({ id: v, name: v }))
      } else if (type.includes('audience')) {
        values.forEach(v => targeting.matchedAudiences.push({ id: v, name: v, type: 'matched' }))
      }
    }

    // Parse exclude criteria
    const excludeFacet = criteria?.exclude?.or
    if (excludeFacet?.type?.includes('audience') && excludeFacet?.values) {
      excludeFacet.values.forEach(v => targeting.excludedAudiences.push({ id: v, name: v }))
    }

    return targeting
  })
}

// =============================================================================
// CREATE AUDIENCE (AD SEGMENT)
// =============================================================================

export async function createLinkedInAudience(options: {
  accessToken: string
  accountId: string
  name: string
  description?: string
  segments: string[]
  maxRetries?: number
}): Promise<{ success: boolean; id: string }> {
  const {
    accessToken,
    accountId,
    name,
    description,
    maxRetries = 3,
  } = options

  const url = `https://api.linkedin.com/v2/adSegments`

  const body = {
    account: `urn:li:sponsoredAccount:${accountId}`,
    name,
    description: description || `Created via Cohort Ads Hub`,
    type: 'MATCHED_AUDIENCE',
    status: 'ACTIVE'
  }

  const { payload } = await linkedinAdsClient.executeRequest<{ id?: string }>({
    url,
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Restli-Protocol-Version': '2.0.0',
      'Linkedin-Version': '202310',
    },
    body: JSON.stringify(body),
    operation: 'createAudience',
    maxRetries,
  })

  return {
    success: true,
    id: payload.id || ''
  }
}

// =============================================================================
// UPDATE CAMPAIGN BIDDING
// =============================================================================

export async function updateLinkedInCampaignBidding(options: {
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

  const url = `https://api.linkedin.com/v2/adCampaignsV2/urn:li:sponsoredCampaign:${campaignId}`

  // LinkedIn's bidding is often part of the costType and unitCost
  // For this generic update, we'll assume updating the unitCost amount
  const patchData = {
    unitCost: {
      amount: biddingValue.toString(),
      currencyCode: 'USD'
    }
  }

  const { payload } = await linkedinAdsClient.executeRequest<LinkedInApiErrorResponse>({
    url,
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Restli-Protocol-Version': '2.0.0',
      'Linkedin-Version': '202310',
      'X-HTTP-Method-Override': 'PATCH',
    },
    body: JSON.stringify({ patch: { $set: patchData } }),
    operation: 'updateCampaignBidding',
    maxRetries,
  })

  if (payload.status && payload.status >= 400) {
    throw new LinkedInApiError({
      message: payload.message ?? 'Campaign bidding update failed',
      httpStatus: payload.status,
    })
  }

  return { success: true }
}
