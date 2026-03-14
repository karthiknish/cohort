'use client'

import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

export type LocationMarker = {
  id: string
  name: string
  lat: number
  lng: number
  type?: string
  radius?: number
}

type LeafletMapProps = {
  locations: LocationMarker[]
  interactive?: boolean
  onMarkerClick?: (location: LocationMarker) => void
}

function getZoomForLocation(location: LocationMarker) {
  const type = location.type?.toLowerCase() ?? ''

  if (type.includes('country')) return 5
  if (type.includes('state') || type.includes('region') || type.includes('province')) return 7
  if (type.includes('city') || type.includes('town') || type.includes('village')) return 10
  if (type.includes('neighborhood') || type.includes('suburb') || type.includes('borough') || type.includes('district')) return 12

  return 9
}

export function LeafletMap({ locations, interactive = false, onMarkerClick }: LeafletMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const markersRef = useRef<L.Marker[]>([])
  const [mapReady, setMapReady] = useState(false)
  const initialViewRef = useRef<{ center: L.LatLngTuple; zoom: number }>(
    locations.length === 1
      ? { center: [locations[0]!.lat, locations[0]!.lng], zoom: getZoomForLocation(locations[0]!) }
      : locations.length > 1
        ? { center: [locations[0]!.lat, locations[0]!.lng], zoom: 4 }
        : { center: [20, 0], zoom: 2 }
  )

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    })

    const map = L.map(mapRef.current, {
      center: initialViewRef.current.center,
      zoom: initialViewRef.current.zoom,
      scrollWheelZoom: interactive,
      dragging: interactive,
      zoomControl: interactive,
    })

    if (interactive) {
      L.control.zoom({ position: 'topright' }).addTo(map)
    }

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map)

    mapInstanceRef.current = map
    
    map.whenReady(() => {
      setMapReady(true)
    })

    return () => {
      map.remove()
      mapInstanceRef.current = null
      setMapReady(false)
    }
  }, [interactive])

   useEffect(() => {
     const map = mapInstanceRef.current
     if (!map || !mapReady) return

     markersRef.current.forEach((marker) => marker.remove())
     markersRef.current = []

     const validLocations = locations.filter(
       (loc) => Number.isFinite(loc.lat) && Number.isFinite(loc.lng) && !(loc.lat === 0 && loc.lng === 0)
     )

     if (validLocations.length === 0) {
       map.setView([20, 0], 2)
       return
     }

     validLocations.forEach((loc) => {
       const marker = L.marker([loc.lat, loc.lng])
         .addTo(map)
         .bindPopup(
           `<div class="text-sm"><p class="font-medium">${loc.name}</p>${loc.type ? `<p class="text-xs opacity-70 capitalize">${loc.type}</p>` : ''}</div>`
         )

       marker.on('add', () => {
         // no-op; ensures marker is attached before bounds fit
       })

       if (onMarkerClick) {
         marker.on('click', () => onMarkerClick(loc))
       }

       markersRef.current.push(marker)
     })

     // Ensure the map has a real size before fitting/centering.
     requestAnimationFrame(() => {
       map.invalidateSize()

       if (validLocations.length === 1) {
         const zoomLevel = getZoomForLocation(validLocations[0]!)
         map.setView([validLocations[0]!.lat, validLocations[0]!.lng], zoomLevel, { animate: false })
         return
       }

       const bounds = L.latLngBounds(validLocations.map((loc) => [loc.lat, loc.lng] as L.LatLngTuple))

       // If all coordinates are nearly identical, fitBounds can look like it "didn't zoom".
       // Expand the bounds slightly to force a sensible zoom.
       if (bounds.isValid()) {
         const northEast = bounds.getNorthEast()
         const southWest = bounds.getSouthWest()
         const latSpan = Math.abs(northEast.lat - southWest.lat)
         const lngSpan = Math.abs(northEast.lng - southWest.lng)

         if (latSpan < 0.01 && lngSpan < 0.01) {
           bounds.extend([northEast.lat + 0.05, northEast.lng + 0.05])
           bounds.extend([southWest.lat - 0.05, southWest.lng - 0.05])
         }
       }

       map.fitBounds(bounds, { padding: [50, 50], animate: false, maxZoom: 12 })
     })
   }, [locations, onMarkerClick, mapReady])

  return <div ref={mapRef} className="h-full w-full" />
}
