// =============================================================================
// TARGETING - Audience targeting operations
// =============================================================================

import {
  appendMetaAuthParams,
  META_API_BASE,
} from '../client'
import { metaAdsClient } from '@/services/integrations/shared/base-client'
import { MetaAudienceTargeting } from '../types'

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
