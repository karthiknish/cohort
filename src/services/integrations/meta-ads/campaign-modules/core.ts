// =============================================================================
// CAMPAIGNS CORE - Basic campaign CRUD operations
// =============================================================================

import {
  appendMetaAuthParams,
  META_API_BASE,
} from '../client'
import { metaAdsClient } from '@/services/integrations/shared/base-client'
import { MetaCampaign } from '../types'
import {
  CreateCampaignOptions,
  UpdateCampaignOptions,
  UpdateCampaignBiddingOptions,
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
    fields: ['id', 'name', 'status', 'effective_status', 'objective', 'daily_budget', 'lifetime_budget', 'start_time', 'stop_time', 'bid_strategy'].join(','),
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
      effective_status?: string
      objective?: string
      daily_budget?: string
      lifetime_budget?: string
      start_time?: string
      stop_time?: string
      bid_strategy?: string
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
    status: (c.effective_status ?? c.status ?? 'PAUSED') as 'ACTIVE' | 'PAUSED' | 'DELETED' | 'ARCHIVED',
    objective: c.objective,
    dailyBudget: c.daily_budget ? parseInt(c.daily_budget, 10) / 100 : undefined,
    lifetimeBudget: c.lifetime_budget ? parseInt(c.lifetime_budget, 10) / 100 : undefined,
    startTime: c.start_time,
    stopTime: c.stop_time,
    bidStrategy: c.bid_strategy,
  }))
}

// =============================================================================
// CREATE CAMPAIGN
// =============================================================================

export async function createMetaCampaign(
  options: CreateCampaignOptions
): Promise<{ success: boolean; campaignId?: string; error?: string }> {
  const {
    accessToken,
    adAccountId,
    name,
    objective,
    status = 'PAUSED',
    dailyBudget,
    lifetimeBudget,
    startTime,
    stopTime,
    specialAdCategories,
    advantageState,
    isAdsetBudgetSharingEnabled,
    maxRetries = 3,
  } = options

  const formattedAccountId = adAccountId.startsWith('act_') ? adAccountId : `act_${adAccountId}`

  const params = new URLSearchParams()
  params.set('name', name)
  params.set('objective', objective)
  params.set('status', status)

  if (dailyBudget !== undefined) {
    params.set('daily_budget', String(Math.round(dailyBudget * 100)))
  }
  if (lifetimeBudget !== undefined) {
    params.set('lifetime_budget', String(Math.round(lifetimeBudget * 100)))
  }
  if (startTime) {
    params.set('start_time', startTime)
  }
  if (stopTime) {
    params.set('stop_time', stopTime)
  }
  if (specialAdCategories && specialAdCategories.length > 0) {
    params.set('special_ad_categories', JSON.stringify(specialAdCategories))
  }
  // v24.0 Advantage+ fields
  if (advantageState) {
    params.set('advantage_state', advantageState)
  }
  if (isAdsetBudgetSharingEnabled !== undefined) {
    params.set('is_adset_budget_sharing_enabled', String(isAdsetBudgetSharingEnabled))
  }

  await appendMetaAuthParams({ params, accessToken, appSecret: process.env.META_APP_SECRET })

  const url = `${META_API_BASE}/${formattedAccountId}/campaigns?${params.toString()}`

  try {
    const { payload } = await metaAdsClient.executeRequest<{ id?: string; error?: { message?: string } }>({
      url,
      operation: 'createCampaign',
      method: 'POST',
      maxRetries,
    })

    if (payload?.error) {
      return {
        success: false,
        error: payload.error.message || 'Failed to create campaign',
      }
    }

    return {
      success: true,
      campaignId: payload?.id,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error creating campaign',
    }
  }
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
// UPDATE CAMPAIGN
// =============================================================================

export async function updateMetaCampaign(
  options: UpdateCampaignOptions
): Promise<{ success: boolean; error?: string }> {
  const {
    accessToken,
    campaignId,
    name,
    status,
    dailyBudget,
    lifetimeBudget,
    maxRetries = 3,
  } = options

  const params = new URLSearchParams()

  if (name !== undefined) {
    params.set('name', name)
  }
  if (status !== undefined) {
    params.set('status', status)
  }
  if (dailyBudget !== undefined) {
    params.set('daily_budget', String(Math.round(dailyBudget * 100)))
  }
  if (lifetimeBudget !== undefined) {
    params.set('lifetime_budget', String(Math.round(lifetimeBudget * 100)))
  }

  await appendMetaAuthParams({ params, accessToken, appSecret: process.env.META_APP_SECRET })

  const url = `${META_API_BASE}/${campaignId}?${params.toString()}`

  try {
    const { payload } = await metaAdsClient.executeRequest<{ success?: boolean; error?: { message?: string } }>({
      url,
      operation: 'updateCampaign',
      method: 'POST',
      maxRetries,
    })

    if (payload?.error) {
      return {
        success: false,
        error: payload.error.message || 'Failed to update campaign',
      }
    }

    return { success: payload?.success ?? true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error updating campaign',
    }
  }
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
// UPDATE CAMPAIGN BIDDING
// =============================================================================

export async function updateMetaCampaignBidding(options: UpdateCampaignBiddingOptions): Promise<{ success: boolean }> {
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

    try {
      await metaAdsClient.executeRequest({
        url: updateUrl,
        operation: 'updateAdSetBid',
        method: 'POST',
        maxRetries: 1, // Don't retry individual failures too much
      })
      return { success: true, adSetId: adSet.id }
    } catch {
      return { success: false, adSetId: adSet.id }
    }
  })

  const results = await Promise.all(updatePromises)
  const allSucceeded = results.every((r) => r.success)

  return { success: allSucceeded }
}
