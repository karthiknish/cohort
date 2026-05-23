// Converts normalized targeting (UI) into Meta Graph `targeting` object for ad set updates.

import { placementDetailToMetaTargetingFields } from '@/lib/meta-placement-positions'
import type { MetaPlacementDetailDraft } from '@/lib/meta-placement-positions'

type TargetingLocation = { id: string; name: string; type: string }
type TargetingInterest = { id: string; name: string; category?: string }

export function normalizeMetaGeoLocationType(metaType: string): 'country' | 'region' | 'city' | 'zip' {
  const normalized = metaType.toLowerCase()
  if (normalized.includes('country')) return 'country'
  if (normalized.includes('region') || normalized.includes('state')) return 'region'
  if (normalized.includes('zip') || normalized.includes('postal')) return 'zip'
  if (normalized.includes('city')) return 'city'
  return 'country'
}

type TargetingAudience = { id: string; name: string }

export type MetaTargetingSource = {
  demographics: {
    ageRanges: string[]
    genders: string[]
    ageMin?: number
    ageMax?: number
  }
  locations: {
    included: TargetingLocation[]
    excluded: TargetingLocation[]
  }
  interests: TargetingInterest[]
  audiences?: {
    included: TargetingAudience[]
    excluded?: TargetingAudience[]
  }
  publisherPlatforms?: string[]
  placementDetail?: MetaPlacementDetailDraft
}

function parseAgeRange(range: string): { min?: number; max?: number } {
  const match = range.match(/(\d+)\s*-\s*(\d+)/)
  if (match) {
    return { min: Number(match[1]), max: Number(match[2]) }
  }
  const plus = range.match(/(\d+)\+/)
  if (plus) return { min: Number(plus[1]), max: 65 }
  return {}
}

export function buildMetaTargetingFromNormalized(source: MetaTargetingSource): Record<string, unknown> {
  const geo_locations: Record<string, unknown> = {}
  const countries: string[] = []
  const regions: Array<{ key: string; name: string }> = []
  const cities: Array<{ key: string; name: string }> = []
  const zips: Array<{ key: string }> = []

  for (const loc of source.locations.included) {
    const locType = normalizeMetaGeoLocationType(loc.type)
    if (locType === 'country') {
      countries.push(loc.id || loc.name)
    } else if (locType === 'region') {
      regions.push({ key: loc.id, name: loc.name })
    } else if (locType === 'city') {
      cities.push({ key: loc.id, name: loc.name })
    } else if (locType === 'zip') {
      zips.push({ key: loc.id })
    }
  }

  if (countries.length > 0) geo_locations.countries = countries
  if (regions.length > 0) geo_locations.regions = regions
  if (cities.length > 0) geo_locations.cities = cities
  if (zips.length > 0) geo_locations.zips = zips

  const excluded_geo_locations: Record<string, unknown> = {}
  const excludedCountries = source.locations.excluded
    .flatMap((loc) => (loc.type === 'country' ? [loc.id || loc.name] : []))
  if (excludedCountries.length > 0) {
    excluded_geo_locations.countries = excludedCountries
  }

  const ages = source.demographics.ageRanges.flatMap((range) => {
    const parsed = parseAgeRange(range)
    return parsed.min !== undefined ? [parsed] : []
  })
  const ageMin =
    source.demographics.ageMin ??
    (ages.length > 0 ? Math.min(...ages.map((a) => a.min ?? 18)) : undefined)
  const ageMax =
    source.demographics.ageMax ??
    (ages.length > 0 ? Math.max(...ages.map((a) => a.max ?? 65)) : undefined)

  const genderMap: Record<string, number> = { male: 1, female: 2, all: 0 }
  const genders = source.demographics.genders.flatMap((g) => {
    const value = genderMap[g.toLowerCase()]
    return typeof value === 'number' && value > 0 ? [value] : []
  })

  const targeting: Record<string, unknown> = {
    geo_locations,
    interests: source.interests.map((interest) => ({
      id: interest.id,
      name: interest.name,
    })),
  }

  if (Object.keys(excluded_geo_locations).length > 0) {
    targeting.excluded_geo_locations = excluded_geo_locations
  }
  if (ageMin !== undefined) targeting.age_min = ageMin
  if (ageMax !== undefined) targeting.age_max = ageMax
  if (genders.length > 0) targeting.genders = genders

  const includedAudiences = source.audiences?.included ?? []
  if (includedAudiences.length > 0) {
    targeting.custom_audiences = includedAudiences.map((audience) => ({
      id: audience.id,
      name: audience.name,
    }))
  }

  const excludedAudiences = source.audiences?.excluded ?? []
  if (excludedAudiences.length > 0) {
    targeting.excluded_custom_audiences = excludedAudiences.map((audience) => ({
      id: audience.id,
      name: audience.name,
    }))
  }

  if (source.publisherPlatforms && source.publisherPlatforms.length > 0) {
    targeting.publisher_platforms = source.publisherPlatforms
  }

  if (source.placementDetail) {
    Object.assign(targeting, placementDetailToMetaTargetingFields(source.placementDetail))
  }

  return targeting
}

const PRESERVE_TARGETING_KEYS_IF_ABSENT = [
  'custom_audiences',
  'excluded_custom_audiences',
  'flexible_spec',
  'publisher_platforms',
  'facebook_positions',
  'instagram_positions',
  'audience_network_positions',
  'messenger_positions',
  'device_platforms',
  'user_os',
  'user_device',
] as const

/** Merge a partial targeting patch onto existing Meta ad set targeting without dropping audiences/placements. */
export function mergeMetaTargetingWithExisting(
  existing: Record<string, unknown> | null | undefined,
  patch: Record<string, unknown>,
): Record<string, unknown> {
  const merged: Record<string, unknown> = { ...(existing ?? {}) }

  for (const [key, value] of Object.entries(patch)) {
    if (value !== undefined) {
      merged[key] = value
    }
  }

  for (const key of PRESERVE_TARGETING_KEYS_IF_ABSENT) {
    if (!(key in patch) && existing?.[key] !== undefined) {
      merged[key] = existing[key]
    }
  }

  if (!('excluded_geo_locations' in patch) && existing?.excluded_geo_locations !== undefined) {
    merged.excluded_geo_locations = existing.excluded_geo_locations
  }

  return merged
}
