// =============================================================================
// AD PIXELS - List pixels for conversion ad sets
// =============================================================================

import { appendMetaAuthParams, META_API_BASE } from './client'
import { metaAdsClient } from '@/services/integrations/shared/base-client'

export type MetaAdPixel = {
  id: string
  name: string
  lastFiredTime?: string
  isUnavailable?: boolean
}

export type MetaPixelStatRow = {
  eventName: string
  count: number
  value?: number
}

export type MetaPixelDetails = {
  id: string
  name: string
  lastFiredTime?: string
  creationTime?: string
  isUnavailable?: boolean
  isCreatedByBusiness?: boolean
}

export async function listMetaAdPixels(options: {
  accessToken: string
  adAccountId: string
  maxRetries?: number
}): Promise<MetaAdPixel[]> {
  const { accessToken, adAccountId, maxRetries = 3 } = options
  const formattedAccountId = adAccountId.startsWith('act_') ? adAccountId : `act_${adAccountId}`

  const params = new URLSearchParams({
    fields: ['id', 'name', 'last_fired_time', 'is_unavailable'].join(','),
    limit: '100',
  })
  await appendMetaAuthParams({ params, accessToken, appSecret: process.env.META_APP_SECRET })

  const url = `${META_API_BASE}/${formattedAccountId}/adspixels?${params.toString()}`
  const { payload } = await metaAdsClient.executeRequest<{
    data?: Array<{
      id?: string
      name?: string
      last_fired_time?: string
      is_unavailable?: boolean
    }>
  }>({
    url,
    operation: 'listMetaAdPixels',
    maxRetries,
  })

  const rows = Array.isArray(payload?.data) ? payload.data : []
  return rows.flatMap((row) => {
    const id = row.id?.trim()
    if (!id) return []
    return [
      {
        id,
        name: row.name?.trim() || `Pixel ${id}`,
        lastFiredTime: row.last_fired_time,
        isUnavailable: row.is_unavailable,
      },
    ]
  })
}

export async function getMetaPixelDetails(options: {
  accessToken: string
  pixelId: string
  maxRetries?: number
}): Promise<MetaPixelDetails | null> {
  const { accessToken, pixelId, maxRetries = 3 } = options

  const params = new URLSearchParams({
    fields: ['id', 'name', 'last_fired_time', 'creation_time', 'is_unavailable', 'is_created_by_business'].join(
      ',',
    ),
  })
  await appendMetaAuthParams({ params, accessToken, appSecret: process.env.META_APP_SECRET })

  const url = `${META_API_BASE}/${pixelId}?${params.toString()}`
  const { payload } = await metaAdsClient.executeRequest<{
    id?: string
    name?: string
    last_fired_time?: string
    creation_time?: string
    is_unavailable?: boolean
    is_created_by_business?: boolean
  }>({
    url,
    operation: 'getMetaPixelDetails',
    maxRetries,
  })

  if (!payload?.id) return null

  return {
    id: payload.id,
    name: payload.name?.trim() || `Pixel ${payload.id}`,
    lastFiredTime: payload.last_fired_time,
    creationTime: payload.creation_time,
    isUnavailable: payload.is_unavailable,
    isCreatedByBusiness: payload.is_created_by_business,
  }
}

export async function getMetaPixelStats(options: {
  accessToken: string
  pixelId: string
  /** Days back from now (default 7). */
  days?: number
  maxRetries?: number
}): Promise<MetaPixelStatRow[]> {
  const { accessToken, pixelId, days = 7, maxRetries = 3 } = options

  const end = Math.floor(Date.now() / 1000)
  const start = end - Math.max(days, 1) * 24 * 60 * 60

  const params = new URLSearchParams({
    aggregation: 'event',
    start_time: String(start),
    end_time: String(end),
  })
  await appendMetaAuthParams({ params, accessToken, appSecret: process.env.META_APP_SECRET })

  const url = `${META_API_BASE}/${pixelId}/stats?${params.toString()}`
  const { payload } = await metaAdsClient.executeRequest<{
    data?: Array<{
      event?: string
      count?: number
      value?: number
    }>
  }>({
    url,
    operation: 'getMetaPixelStats',
    maxRetries,
  })

  const rows = Array.isArray(payload?.data) ? payload.data : []
  return rows.flatMap((row) => {
    const eventName = row.event?.trim()
    if (!eventName) return []
    return [
      {
        eventName,
        count: typeof row.count === 'number' ? row.count : 0,
        value: typeof row.value === 'number' ? row.value : undefined,
      },
    ]
  })
}
