// =============================================================================
// LINKEDIN ADS CAMPAIGNS - Update Operations
// =============================================================================

import { linkedinAdsClient } from '@/services/integrations/shared/base-client'
import { LinkedInApiError } from '../errors'
import { LinkedInApiErrorResponse } from '../types'

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
// UPDATE AD STATUS
// =============================================================================

export async function updateLinkedInAdStatus(options: {
  accessToken: string
  creativeId: string
  status: 'ACTIVE' | 'PAUSED' | 'ARCHIVED'
  maxRetries?: number
}): Promise<{ success: boolean }> {
  const {
    accessToken,
    creativeId,
    status,
    maxRetries = 3,
  } = options

  const url = `https://api.linkedin.com/v2/adCreativesV2/urn:li:sponsoredCreative:${creativeId}`

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
    operation: 'updateAdStatus',
    maxRetries,
  })

  if (payload.status && payload.status >= 400) {
    throw new LinkedInApiError({
      message: payload.message ?? 'Ad status update failed',
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
// UPDATE CAMPAIGN GROUP STATUS
// =============================================================================

export async function updateLinkedInCampaignGroupStatus(options: {
  accessToken: string
  campaignGroupId: string
  status: 'ACTIVE' | 'PAUSED' | 'ARCHIVED'
  maxRetries?: number
}): Promise<{ success: boolean }> {
  const {
    accessToken,
    campaignGroupId,
    status,
    maxRetries = 3,
  } = options

  const url = `https://api.linkedin.com/v2/adCampaignGroupsV2/urn:li:sponsoredCampaignGroup:${campaignGroupId}`

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
    operation: 'updateCampaignGroupStatus',
    maxRetries,
  })

  if (payload.status && payload.status >= 400) {
    throw new LinkedInApiError({
      message: payload.message ?? 'Campaign Group status update failed',
      httpStatus: payload.status,
    })
  }

  return { success: true }
}

// =============================================================================
// UPDATE CAMPAIGN GROUP BUDGET
// =============================================================================

export async function updateLinkedInCampaignGroupBudget(options: {
  accessToken: string
  campaignGroupId: string
  totalBudget?: number
  currencyCode?: string
  maxRetries?: number
}): Promise<{ success: boolean }> {
  const {
    accessToken,
    campaignGroupId,
    totalBudget,
    currencyCode = 'USD',
    maxRetries = 3,
  } = options

  const url = `https://api.linkedin.com/v2/adCampaignGroupsV2/urn:li:sponsoredCampaignGroup:${campaignGroupId}`

  const patchData: Record<string, unknown> = {}
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
    operation: 'updateCampaignGroupBudget',
    maxRetries,
  })

  if (payload.status && payload.status >= 400) {
    throw new LinkedInApiError({
      message: payload.message ?? 'Campaign Group budget update failed',
      httpStatus: payload.status,
    })
  }

  return { success: true }
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
