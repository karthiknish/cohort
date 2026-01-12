'use client'

import { useState, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { MapPin, X, Search, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useGeocodeSearch, type GeocodeSearchResult } from '@/hooks/use-geocode'

export type LocationMarker = {
  id: string
  name: string
  lat: number
  lng: number
  type?: string
  radius?: number
}

type LocationMapProps = {
  locations?: LocationMarker[]
  selectedLocations?: LocationMarker[]
  onLocationSelect?: (location: LocationMarker) => void
  onLocationRemove?: (locationId: string) => void
  interactive?: boolean
  height?: string
  className?: string
  showSearch?: boolean
  showSelectedList?: boolean
}

const LeafletMap = dynamic(
  () => import('./leaflet-map').then((mod) => mod.LeafletMap),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center bg-muted/30 rounded-lg h-full w-full">
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="text-sm">Loading map...</span>
        </div>
      </div>
    )
  }
)

export function LocationMap({
  locations = [],
  selectedLocations = [],
  onLocationSelect,
  onLocationRemove,
  interactive = false,
  height = '300px',
  className,
  showSearch = false,
  showSelectedList = false,
}: LocationMapProps) {
  const [searchQuery, setSearchQuery] = useState('')

  // Use TanStack Query for geocoding search with built-in debouncing
  const { data: searchResults = [], isFetching: searching } = useGeocodeSearch(searchQuery, {
    enabled: showSearch,
  })

  const allLocations = useMemo(() => {
    return [...locations, ...selectedLocations]
  }, [locations, selectedLocations])

  const handleResultSelect = (result: GeocodeSearchResult) => {
    const location: LocationMarker = {
      id: `loc-${result.place_id}`,
      name: result.display_name.split(',')[0] || result.display_name,
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
      type: result.type,
    }
    
    setSearchQuery('')
    
    if (onLocationSelect) {
      onLocationSelect(location)
    }
  }

  return (
    <div className={cn("space-y-3", className)}>
      {showSearch && (
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search for a city, country, or region..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-9"
            />
            {searching && (
              <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
            )}
          </div>
          
          {searchResults.length > 0 && (
            <div className="absolute z-[1000] mt-1 w-full rounded-md border bg-popover p-1 shadow-lg">
              {searchResults.map((result) => (
                <button
                  key={result.place_id}
                  type="button"
                  className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent"
                  onClick={() => handleResultSelect(result)}
                >
                  <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="truncate">{result.display_name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="relative rounded-lg overflow-hidden border" style={{ height }}>
        <LeafletMap
          locations={allLocations}
          interactive={interactive}
          onMarkerClick={interactive ? onLocationSelect : undefined}
        />
      </div>

      {showSelectedList && selectedLocations.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Selected Locations ({selectedLocations.length})</p>
          <div className="flex flex-wrap gap-1.5">
            {selectedLocations.map((loc) => (
              <Badge key={loc.id} variant="secondary" className="gap-1 pr-1">
                <MapPin className="h-3 w-3" />
                {loc.name}
                {onLocationRemove && (
                  <button
                    type="button"
                    onClick={() => onLocationRemove(loc.id)}
                    className="ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export function LocationMapPreview({
  locations = [],
  height = '200px',
  className,
}: {
  locations: LocationMarker[]
  height?: string
  className?: string
}) {
  return (
    <LocationMap
      locations={locations}
      height={height}
      className={className}
      interactive={false}
      showSearch={false}
      showSelectedList={false}
    />
  )
}
