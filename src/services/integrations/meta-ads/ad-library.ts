// =============================================================================
// AD LIBRARY API — public ads archive search
// =============================================================================

import { appendMetaAuthParams, META_API_BASE } from './client'
import { metaAdsClient } from '@/services/integrations/shared/base-client'

export type MetaAdLibraryAd = {
  id: string
  pageId?: string
  pageName?: string
  adSnapshotUrl?: string
  adCreativeBodies?: string[]
  adDeliveryStartTime?: string
  adDeliveryStopTime?: string
  currency?: string
  spendLower?: string
  spendUpper?: string
}

export async function searchMetaAdLibrary(options: {
  accessToken: string
  searchTerms: string
  /** ISO country codes, e.g. ['US']. */
  adReachedCountries: string[]
  limit?: number
  maxRetries?: number
}): Promise<MetaAdLibraryAd[]> {
  const { accessToken, searchTerms, adReachedCountries, limit = 25, maxRetries = 3 } = options

  const countries = adReachedCountries.map((code) => code.trim().toUpperCase()).filter(Boolean)
  if (countries.length === 0) {
    return []
  }

  const params = new URLSearchParams({
    search_terms: searchTerms.trim(),
    ad_reached_countries: JSON.stringify(countries),
    ad_active_status: 'ALL',
    fields: [
      'id',
      'page_id',
      'page_name',
      'ad_snapshot_url',
      'ad_creative_bodies',
      'ad_delivery_start_time',
      'ad_delivery_stop_time',
      'currency',
      'spend',
    ].join(','),
    limit: String(Math.min(Math.max(limit, 1), 50)),
  })
  await appendMetaAuthParams({ params, accessToken, appSecret: process.env.META_APP_SECRET })

  const url = `${META_API_BASE}/ads_archive?${params.toString()}`
  const { payload } = await metaAdsClient.executeRequest<{
    data?: Array<{
      id?: string
      page_id?: string
      page_name?: string
      ad_snapshot_url?: string
      ad_creative_bodies?: string[]
      ad_delivery_start_time?: string
      ad_delivery_stop_time?: string
      currency?: string
      spend?: { lower_bound?: string; upper_bound?: string }
    }>
    error?: { message?: string }
  }>({
    url,
    operation: 'searchMetaAdLibrary',
    maxRetries,
  })

  if (payload?.error?.message) {
    throw new Error(payload.error.message)
  }

  const rows = Array.isArray(payload?.data) ? payload.data : []
  return rows.flatMap((row) => {
    const id = row.id?.trim()
    if (!id) return []
    return [
      {
        id,
        pageId: row.page_id,
        pageName: row.page_name,
        adSnapshotUrl: row.ad_snapshot_url,
        adCreativeBodies: row.ad_creative_bodies,
        adDeliveryStartTime: row.ad_delivery_start_time,
        adDeliveryStopTime: row.ad_delivery_stop_time,
        currency: row.currency,
        spendLower: row.spend?.lower_bound,
        spendUpper: row.spend?.upper_bound,
      },
    ]
  })
}
