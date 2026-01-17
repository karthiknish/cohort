'use client'

import { useState } from 'react'
import { Edit2, Globe, MapPin, X } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { LocationMap, type LocationMarker } from '@/components/ui/location-map'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { toast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'

import type { AggregatedTargetingData, TargetingData } from './audience-control-types'

type LocationTargetingSectionProps = {
  targeting: TargetingData[]
  aggregatedData: AggregatedTargetingData
  locationMarkers: LocationMarker[]
  selectedTargetingId: string
  onTargetingChange: (value: string) => void
  editingSection: string | null
  onToggleEditing: (section: string) => void
}

export function LocationTargetingSection({
  targeting,
  aggregatedData,
  locationMarkers,
  selectedTargetingId,
  onTargetingChange,
  editingSection,
  onToggleEditing,
}: LocationTargetingSectionProps) {
  const [selectedLocation, setSelectedLocation] = useState<LocationMarker | null>(null)

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Globe className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Target Locations</span>
        {targeting.length > 1 && (
          <Select value={selectedTargetingId} onValueChange={onTargetingChange}>
            <SelectTrigger className="h-8 w-[220px]">
              <SelectValue placeholder="Select ad set" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All ad sets</SelectItem>
              {targeting.map((item) => (
                <SelectItem key={item.entityId} value={item.entityId}>
                  {item.entityName ?? item.entityId}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        {aggregatedData.locations.included.length > 0 && (
          <Badge variant="secondary" className="ml-auto">
            {aggregatedData.locations.included.length}
          </Badge>
        )}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => onToggleEditing('locations')}
              >
                <Edit2 className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Edit locations</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <div className="rounded-lg border overflow-hidden">
        <LocationMap
          locations={locationMarkers}
          height="280px"
          interactive={editingSection === 'locations'}
          showSearch={editingSection === 'locations'}
          onLocationSelect={(loc) => {
            setSelectedLocation(loc)
            toast({
              title: 'Location selected',
              description: `${loc.name} - Click on the map to add more locations`,
            })
          }}
        />
      </div>
      {aggregatedData.locations.included.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {aggregatedData.locations.included.map((loc) => (
            <Badge
              key={loc.id}
              variant={selectedLocation?.id === loc.id ? 'default' : 'outline'}
              className={cn(
                'text-xs cursor-pointer transition-colors',
                selectedLocation?.id === loc.id && 'ring-2 ring-primary'
              )}
              onClick={() => {
                const marker = locationMarkers.find((item) => item.id === loc.id)
                if (marker) setSelectedLocation(marker)
              }}
            >
              <MapPin className="h-3 w-3 mr-1" />
              {loc.name}
              {editingSection === 'locations' && (
                <button
                  onClick={(event) => {
                    event.stopPropagation()
                    toast({
                      title: 'Location would be removed',
                      description: `${loc.name} removal requires API integration`,
                    })
                  }}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </Badge>
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">No location targeting configured</p>
      )}
    </div>
  )
}
