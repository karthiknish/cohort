// Converts normalized targeting (UI) into Meta Graph `targeting` object for ad set updates.

type TargetingLocation = { id: string; name: string; type: string }
type TargetingInterest = { id: string; name: string; category?: string }

export type MetaTargetingSource = {
  demographics: {
    ageRanges: string[]
    genders: string[]
  }
  locations: {
    included: TargetingLocation[]
    excluded: TargetingLocation[]
  }
  interests: TargetingInterest[]
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

  for (const loc of source.locations.included) {
    if (loc.type === 'country') {
      countries.push(loc.id || loc.name)
    } else if (loc.type === 'region') {
      regions.push({ key: loc.id, name: loc.name })
    } else if (loc.type === 'city') {
      cities.push({ key: loc.id, name: loc.name })
    }
  }

  if (countries.length > 0) geo_locations.countries = countries
  if (regions.length > 0) geo_locations.regions = regions
  if (cities.length > 0) geo_locations.cities = cities

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
  const ageMin = ages.length > 0 ? Math.min(...ages.map((a) => a.min ?? 18)) : undefined
  const ageMax = ages.length > 0 ? Math.max(...ages.map((a) => a.max ?? 65)) : undefined

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

  return targeting
}
