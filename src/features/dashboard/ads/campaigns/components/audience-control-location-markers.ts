import type { LocationMarker } from '@/shared/ui/location-map'

import { findLocationCoordinates, LOCATION_COORDINATES } from './audience-control-utils'
import type { TargetingData } from './audience-control-types'

export function buildAudienceLocationMarkers(
  visibleTargeting: TargetingData[],
  resolvedCoordinates: Record<string, { lat: number; lng: number }>,
): LocationMarker[] {
  const markers: LocationMarker[] = []
  visibleTargeting.forEach((t) => {
    t.locations.included.forEach((loc) => {
      const nameKey = loc.name.toLowerCase().trim()
      const coords =
        loc.lat && loc.lng
          ? { lat: loc.lat, lng: loc.lng }
          : LOCATION_COORDINATES[nameKey] || resolvedCoordinates[nameKey] || findLocationCoordinates(loc.name)

      if (coords) {
        markers.push({
          id: loc.id,
          name: loc.name,
          lat: coords.lat,
          lng: coords.lng,
          type: loc.type,
        })
      }
    })
  })
  return markers
}
