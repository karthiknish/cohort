// =============================================================================
// AD SETS - Ad set CRUD operations
// =============================================================================

import {
  appendMetaAuthParams,
  META_API_BASE,
} from '../client'
import { metaAdsClient } from '@/services/integrations/shared/base-client'
import { MetaAdSet } from '../types'
import {
  CreateAdSetOptions,
  UpdateAdSetOptions,
} from './types'

// =============================================================================
// LIST AD SETS
// =============================================================================

export async function listMetaAdSets(options: {
  accessToken: string
  adAccountId: string
  campaignId?: string
  statusFilter?: ('ACTIVE' | 'PAUSED' | 'ARCHIVED')[]
  maxRetries?: number
}): Promise<MetaAdSet[]> {
  const {
    accessToken,
    adAccountId,
    campaignId,
    statusFilter = ['ACTIVE', 'PAUSED'],
    maxRetries = 3,
  } = options

  const params = new URLSearchParams({
    fields: ['id', 'name', 'campaign_id', 'status', 'effective_status', 'daily_budget', 'lifetime_budget', 'bid_amount', 'optimization_goal', 'targeting'].join(','),
    limit: '100',
  })

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

  let url: string
  if (campaignId) {
    url = `${META_API_BASE}/${campaignId}/adsets?${params.toString()}`
  } else {
    url = `${META_API_BASE}/${formattedAccountId}/adsets?${params.toString()}`
  }

  const { payload } = await metaAdsClient.executeRequest<{
    data?: Array<{
      id?: string
      name?: string
      campaign_id?: string
      status?: string
      effective_status?: string
      daily_budget?: string
      lifetime_budget?: string
      bid_amount?: string
      optimization_goal?: string
    }>
  }>({
    url,
    operation: 'listAdSets',
    maxRetries,
  })

  const adSets = Array.isArray(payload?.data) ? payload.data : []

  return adSets.map((a) => ({
    id: a.id ?? '',
    name: a.name ?? '',
    campaignId: a.campaign_id ?? '',
    status: (a.effective_status ?? a.status ?? 'PAUSED') as 'ACTIVE' | 'PAUSED' | 'DELETED' | 'ARCHIVED',
    dailyBudget: a.daily_budget ? parseInt(a.daily_budget, 10) / 100 : undefined,
    lifetimeBudget: a.lifetime_budget ? parseInt(a.lifetime_budget, 10) / 100 : undefined,
    bidAmount: a.bid_amount ? parseInt(a.bid_amount, 10) / 100 : undefined,
    optimization_goal: a.optimization_goal,
  }))
}

// =============================================================================
// CREATE AD SET
// =============================================================================

export async function createMetaAdSet(
  options: CreateAdSetOptions
): Promise<{ success: boolean; adSetId?: string; error?: string }> {
  const {
    accessToken,
    adAccountId,
    campaignId,
    name,
    status = 'PAUSED',
    dailyBudget,
    lifetimeBudget,
    optimizationGoal,
    billingEvent,
    bidAmount,
    targeting,
    promotedObject,
    placementSoftOptOut,
    maxRetries = 3,
  } = options

  const formattedAccountId = adAccountId.startsWith('act_') ? adAccountId : `act_${adAccountId}`

  const params = new URLSearchParams()
  params.set('name', name)
  params.set('campaign_id', campaignId)
  params.set('status', status)

  if (dailyBudget !== undefined) {
    params.set('daily_budget', String(Math.round(dailyBudget * 100)))
  }
  if (lifetimeBudget !== undefined) {
    params.set('lifetime_budget', String(Math.round(lifetimeBudget * 100)))
  }
  if (optimizationGoal) {
    params.set('optimization_goal', optimizationGoal)
  }
  if (billingEvent) {
    params.set('billing_event', billingEvent)
  }
  if (bidAmount !== undefined) {
    params.set('bid_amount', String(Math.round(bidAmount * 100)))
  }
  if (targeting) {
    params.set('targeting', JSON.stringify(targeting))
  }
  if (promotedObject) {
    params.set('promoted_object', JSON.stringify(promotedObject))
  }
  if (placementSoftOptOut) {
    params.set('placement_soft_opt_out', JSON.stringify(placementSoftOptOut))
  }

  await appendMetaAuthParams({ params, accessToken, appSecret: process.env.META_APP_SECRET })

  const url = `${META_API_BASE}/${formattedAccountId}/adsets?${params.toString()}`

  try {
    const { payload } = await metaAdsClient.executeRequest<{ id?: string; error?: { message?: string } }>({
      url,
      operation: 'createAdSet',
      method: 'POST',
      maxRetries,
    })

    if (payload?.error) {
      return {
        success: false,
        error: payload.error.message || 'Failed to create ad set',
      }
    }

    return {
      success: true,
      adSetId: payload?.id,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error creating ad set',
    }
  }
}

// =============================================================================
// UPDATE AD SET
// =============================================================================

export async function updateMetaAdSet(
  options: UpdateAdSetOptions
): Promise<{ success: boolean; error?: string }> {
  const {
    accessToken,
    adSetId,
    name,
    status,
    dailyBudget,
    lifetimeBudget,
    bidAmount,
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
  if (bidAmount !== undefined) {
    params.set('bid_amount', String(Math.round(bidAmount * 100)))
  }

  await appendMetaAuthParams({ params, accessToken, appSecret: process.env.META_APP_SECRET })

  const url = `${META_API_BASE}/${adSetId}?${params.toString()}`

  try {
    const { payload } = await metaAdsClient.executeRequest<{ success?: boolean; error?: { message?: string } }>({
      url,
      operation: 'updateAdSet',
      method: 'POST',
      maxRetries,
    })

    if (payload?.error) {
      return {
        success: false,
        error: payload.error.message || 'Failed to update ad set',
      }
    }

    return { success: payload?.success ?? true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error updating ad set',
    }
  }
}

// =============================================================================
// UPDATE AD SET STATUS
// =============================================================================

export async function updateMetaAdSetStatus(options: {
  accessToken: string
  adSetId: string
  status: 'ACTIVE' | 'PAUSED'
  maxRetries?: number
}): Promise<{ success: boolean }> {
  const {
    accessToken,
    adSetId,
    status,
    maxRetries = 3,
  } = options

  const params = new URLSearchParams()
  params.set('status', status)
  await appendMetaAuthParams({ params, accessToken, appSecret: process.env.META_APP_SECRET })

  const url = `${META_API_BASE}/${adSetId}?${params.toString()}`

  const { payload } = await metaAdsClient.executeRequest<{ success?: boolean }>({
    url,
    operation: 'updateAdSetStatus',
    method: 'POST',
    maxRetries,
  })

  return { success: payload?.success ?? true }
}
