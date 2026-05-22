'use client'

import { useCallback, useMemo, useState, type MouseEvent } from 'react'
import { Edit2, Globe, MapPin, X } from 'lucide-react'

import { ADS_PAGE_THEME } from '@/features/dashboard/ads/components/ads-page-theme'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { LocationMap, type LocationMarker } from '@/shared/ui/location-map'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/shared/ui/tooltip'
import { toast } from '@/shared/ui/use-toast'
import { cn } from '@/lib/utils'

import { MetaTargetingSearchCombobox } from '@/features/dashboard/ads/components/meta-targeting-search-combobox'
import type { AggregatedTargetingData, TargetingData } from './audience-control-types'

type LocationTargetingSectionProps = {
  targeting: TargetingData[]
  aggregatedData: AggregatedTargetingData
  locationMarkers: LocationMarker[]
  selectedTargetingId: string
  onTargetingChange: (value: string) => void
  editingSection: string | null
  onToggleEditing: (section: string) => void
  workspaceId?: string | null
  clientId?: string | null
  canSearchGeo?: boolean
}

export function LocationTargetingSection({
  targeting,
  aggregatedData,
  locationMarkers,
  selectedTargetingId,
  onTargetingChange,
  editingSection,
  onToggleEditing,
  workspaceId,
  clientId,
  canSearchGeo,
}: LocationTargetingSectionProps) {
  const [selectedLocation, setSelectedLocation] = useState<LocationMarker | null>(null)
  const isEditing = editingSection === 'locations'

  const handleToggleEditing = useCallback(() => {
    onToggleEditing('locations')
  }, [onToggleEditing])

  const handleLocationSelect = useCallback((loc: LocationMarker) => {
    setSelectedLocation(loc)
    toast({
      title: 'Location selected',
      description: `${loc.name} — use the map search to add more when editing.`,
    })
  }, [])

  const handleGeoSelect = useCallback(
    (item: { id: string; name: string }) => {
      toast({
        title: 'Geo target found',
        description: `${item.name} (${item.id}) — add via Meta Ads Manager or ad set creation. Map pins here are for planning only.`,
      })
    },
    [],
  )

  const locationSelectHandlers = useMemo(
    () =>
      Object.fromEntries(
        aggregatedData.locations.included.map((loc) => [
          loc.id,
          () => {
            const marker = locationMarkers.find((item) => item.id === loc.id)
            if (marker) setSelectedLocation(marker)
          },
        ]),
      ) as Record<string, () => void>,
    [aggregatedData.locations.included, locationMarkers],
  )

  const locationRemoveHandlers = useMemo(
    () =>
      Object.fromEntries(
        aggregatedData.locations.included.map((loc) => [
          loc.id,
          (event: MouseEvent<HTMLButtonElement>) => {
            event.stopPropagation()
            toast({
              title: 'Read-only geography',
              description: `${loc.name} is synced from Meta. Edit locations in Ads Manager or when creating an ad set.`,
            })
          },
        ]),
      ) as Record<string, (event: MouseEvent<HTMLButtonElement>) => void>,
    [aggregatedData.locations.included],
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-info/10 ring-1 ring-info/20">
            <Globe className="size-4 text-info" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold tracking-tight text-foreground">Geography</p>
            <p className="text-xs text-muted-foreground">
              {aggregatedData.locations.included.length} included
              {aggregatedData.locations.excluded.length > 0
                ? ` · ${aggregatedData.locations.excluded.length} excluded`
                : ''}
            </p>
          </div>
        </div>

        {targeting.length > 1 ? (
          <Select value={selectedTargetingId} onValueChange={onTargetingChange}>
            <SelectTrigger className="h-9 w-full min-w-[200px] max-w-[240px] sm:w-[220px]">
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
        ) : null}

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={isEditing ? 'default' : 'outline'}
                size="sm"
                className="h-9 gap-1.5"
                onClick={handleToggleEditing}
                aria-pressed={isEditing}
                aria-label="Edit locations"
              >
                <Edit2 className="size-3.5" aria-hidden />
                {isEditing ? 'Done' : 'Edit'}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {isEditing ? 'Exit map editing' : 'Search and pin locations on the map'}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {isEditing && canSearchGeo && workspaceId ? (
        <MetaTargetingSearchCombobox
          workspaceId={workspaceId}
          clientId={clientId}
          mode="geolocations"
          placeholder="Search Meta geo targets (reference for Ads Manager)…"
          onSelect={handleGeoSelect}
        />
      ) : null}

      <div className={ADS_PAGE_THEME.controlMapFrame}>
        <LocationMap
          locations={locationMarkers}
          height="300px"
          interactive={isEditing}
          showSearch={isEditing}
          onLocationSelect={handleLocationSelect}
        />
      </div>

      {aggregatedData.locations.included.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {aggregatedData.locations.included.map((loc) => (
            <Badge
              key={loc.id}
              variant={selectedLocation?.id === loc.id ? 'default' : 'outline'}
              className={cn(
                'cursor-pointer text-xs transition-[box-shadow,opacity]',
                selectedLocation?.id === loc.id && 'ring-2 ring-primary ring-offset-1',
              )}
              onClick={locationSelectHandlers[loc.id]}
            >
              <MapPin className="mr-1 size-3 shrink-0" aria-hidden />
              {loc.name}
              {isEditing ? (
                <button
                  type="button"
                  onClick={locationRemoveHandlers[loc.id]}
                  className="ml-1 rounded-sm p-0.5 hover:bg-destructive/15 hover:text-destructive"
                  aria-label={`Remove ${loc.name}`}
                >
                  <X className="size-3" aria-hidden />
                </button>
              ) : null}
            </Badge>
          ))}
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-border/60 bg-muted/10 px-4 py-6 text-center text-xs text-muted-foreground">
          No location targeting configured for this view.
        </p>
      )}
    </div>
  )
}
