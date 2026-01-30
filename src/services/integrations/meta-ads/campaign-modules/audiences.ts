// =============================================================================
// AUDIENCES - Custom audience creation and management
// =============================================================================

import {
  appendMetaAuthParams,
  META_API_BASE,
} from '../client'
import { metaAdsClient } from '@/services/integrations/shared/base-client'
import { CreateAudienceOptions } from './types'

// =============================================================================
// CREATE CUSTOM AUDIENCE
// =============================================================================

export async function createMetaAudience(
  options: CreateAudienceOptions
): Promise<{ success: boolean; id: string }> {
  const {
    accessToken,
    adAccountId,
    name,
    description,
    maxRetries = 3,
  } = options

  const formattedAccountId = adAccountId.startsWith('act_') ? adAccountId : `act_${adAccountId}`

  const params = new URLSearchParams({
    name,
    description: description || `Created via Cohort Ads Hub`,
    subtype: 'CUSTOM',
    customer_file_source: 'BOTH_USER_AND_PARTNER_PROVIDED',
  })

  await appendMetaAuthParams({ params, accessToken, appSecret: process.env.META_APP_SECRET })

  const url = `${META_API_BASE}/${formattedAccountId}/customaudiences?${params.toString()}`

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
// LIST CUSTOM AUDIENCES
// =============================================================================

export async function listMetaAudiences(options: {
  accessToken: string
  adAccountId: string
  maxRetries?: number
}): Promise<Array<{
  id: string
  name: string
  description?: string
  approximateCount?: number
  status?: string
}>> {
  const {
    accessToken,
    adAccountId,
    maxRetries = 3,
  } = options

  const formattedAccountId = adAccountId.startsWith('act_') ? adAccountId : `act_${adAccountId}`

  const params = new URLSearchParams({
    fields: ['id', 'name', 'description', 'approximate_count', 'delivery_status'].join(','),
    limit: '100',
  })

  await appendMetaAuthParams({ params, accessToken, appSecret: process.env.META_APP_SECRET })

  const url = `${META_API_BASE}/${formattedAccountId}/customaudiences?${params.toString()}`

  const { payload } = await metaAdsClient.executeRequest<{
    data?: Array<{
      id?: string
      name?: string
      description?: string
      approximate_count?: number
      delivery_status?: { code?: number; description?: string }
    }>
  }>({
    url,
    operation: 'listAudiences',
    maxRetries,
  })

  const audiences = Array.isArray(payload?.data) ? payload.data : []

  return audiences.map((a) => ({
    id: a.id ?? '',
    name: a.name ?? '',
    description: a.description,
    approximateCount: a.approximate_count,
    status: a.delivery_status?.description,
  }))
}

// =============================================================================
// DELETE CUSTOM AUDIENCE
// =============================================================================

export async function deleteMetaAudience(options: {
  accessToken: string
  audienceId: string
  maxRetries?: number
}): Promise<{ success: boolean }> {
  const {
    accessToken,
    audienceId,
    maxRetries = 3,
  } = options

  const params = new URLSearchParams()
  await appendMetaAuthParams({ params, accessToken, appSecret: process.env.META_APP_SECRET })

  const url = `${META_API_BASE}/${audienceId}?${params.toString()}`

  try {
    await metaAdsClient.executeRequest({
      url,
      operation: 'deleteAudience',
      method: 'DELETE',
      maxRetries,
    })
    return { success: true }
  } catch {
    return { success: false }
  }
}
