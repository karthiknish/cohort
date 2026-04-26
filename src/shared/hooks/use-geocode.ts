'use client'

import { useQuery } from '@tanstack/react-query'
import { useDebouncedValue } from './use-debounce'

export type GeocodeSearchResult = {
  place_id: number
  display_name: string
  lat: string
  lon: string
  type: string
  address?: {
    city?: string
    country?: string
    state?: string
  }
}

export type GeocodeCoordinates = {
  lat: number
  lng: number
}

async function searchLocations(query: string): Promise<GeocodeSearchResult[]> {
  if (!query || query.length < 2) {
    return []
  }

  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`
  )
  
  if (!response.ok) {
    throw new Error('Failed to search locations')
  }
  
  return response.json()
}

async function resolveCoordinates(name: string): Promise<GeocodeCoordinates | null> {
  if (!name) {
    return null
  }

  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(name)}&limit=1`
  )
  
  if (!response.ok) {
    throw new Error('Failed to resolve coordinates')
  }
  
  const data = await response.json()
  
  if (data && data[0]) {
    return {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon)
    }
  }
  
  return null
}

/**
 * Hook for searching locations using the Nominatim geocoding API
 * Includes automatic debouncing to avoid excessive API calls
 */
export function useGeocodeSearch(query: string, options?: { debounceMs?: number; enabled?: boolean }) {
  const { debounceMs = 300, enabled = true } = options ?? {}
  const debouncedQuery = useDebouncedValue(query, debounceMs)

  return useQuery({
    queryKey: ['geocode', 'search', debouncedQuery],
    queryFn: () => searchLocations(debouncedQuery),
    enabled: enabled && debouncedQuery.length >= 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes (formerly cacheTime)
    retry: 2,
    retryDelay: 1000,
  })
}

/**
 * Hook for resolving coordinates from a location name
 * Useful for mapping location names to lat/lng coordinates
 */
export function useGeocodeResolve(name: string, options?: { enabled?: boolean }) {
  const { enabled = true } = options ?? {}

  return useQuery({
    queryKey: ['geocode', 'resolve', name],
    queryFn: () => resolveCoordinates(name),
    enabled: enabled && Boolean(name),
    staleTime: 60 * 60 * 1000, // 1 hour - coordinates rarely change
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
    retry: 2,
    retryDelay: 1000,
  })
}

export type GeocodeBatchResult = {
  coordinates: Record<string, GeocodeCoordinates>
  /** Location names that could not be resolved (API error or no match). */
  failedNames: string[]
}

/**
 * Hook for resolving multiple location names to coordinates in batch.
 * Returns coordinates plus `failedNames` for locations that could not be resolved.
 */
export function useGeocodeResolveBatch(names: string[], options?: { enabled?: boolean }) {
  const { enabled = true } = options ?? {}

  return useQuery({
    queryKey: ['geocode', 'resolve-batch', names.sort().join(',')],
    queryFn: async (): Promise<GeocodeBatchResult> => {
      const coordinates: Record<string, GeocodeCoordinates> = {}
      const failedNames: string[] = []

      // Process sequentially to avoid rate limiting
      for (const name of names) {
        if (!name) continue

        try {
          const coords = await resolveCoordinates(name)
          if (coords) {
            coordinates[name.toLowerCase().trim()] = coords
          } else {
            failedNames.push(name)
          }
        } catch (e) {
          console.error(`Failed to geocode location: ${name}`, e)
          failedNames.push(name)
        }

        // Small delay between requests to respect rate limits
        if (names.indexOf(name) < names.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 100))
        }
      }

      return { coordinates, failedNames }
    },
    enabled: enabled && names.length > 0,
    staleTime: 60 * 60 * 1000, // 1 hour
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
    retry: 1,
  })
}
