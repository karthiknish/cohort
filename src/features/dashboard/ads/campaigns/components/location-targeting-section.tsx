'use client';
import { useCallback, useMemo, useState, type MouseEvent } from 'react';
import { Edit2, Globe, Loader2, MapPin, X } from 'lucide-react';
import type { MetaTargetingSearchResult } from '@/features/dashboard/ads/hooks/use-meta-targeting-search';
import { ADS_PAGE_THEME } from '@/features/dashboard/ads/components/ads-page-theme';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { LocationMap, type LocationMarker } from '@/shared/ui/location-map';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from '@/shared/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, } from '@/shared/ui/tooltip';
import { notifySuccess } from '@/lib/notifications';
import { cn } from '@/lib/utils';
import { MetaTargetingSearchCombobox } from '@/features/dashboard/ads/components/meta-targeting-search-combobox';
import type { AggregatedTargetingData, TargetingData } from './audience-control-types';
type LocationTargetingSectionProps = {
    targeting: TargetingData[];
    aggregatedData: AggregatedTargetingData;
    locationMarkers: LocationMarker[];
    selectedTargetingId: string;
    onTargetingChange: (value: string) => void;
    editingSection: string | null;
    onToggleEditing: (section: string) => void;
    workspaceId?: string | null;
    clientId?: string | null;
    canSearchGeo?: boolean;
    onAddLocation?: (item: MetaTargetingSearchResult) => void;
    onRemoveLocation?: (locationId: string) => void;
    onSaveLocations?: () => void;
    savingTargeting?: boolean;
};
export function LocationTargetingSection({ targeting, aggregatedData, locationMarkers, selectedTargetingId, onTargetingChange, editingSection, onToggleEditing, workspaceId, clientId, canSearchGeo, onAddLocation, onRemoveLocation, onSaveLocations, savingTargeting, }: LocationTargetingSectionProps) {
    const [selectedLocation, setSelectedLocation] = useState<LocationMarker | null>(null);
    const isEditing = editingSection === 'locations';
    const canEditLocations = Boolean(onAddLocation && onRemoveLocation);
    const handleToggleEditing = () => {
        onToggleEditing('locations');
    };
    const handleLocationSelect = (loc: LocationMarker) => {
        setSelectedLocation(loc);
    };
    const handleGeoSelect = (item: MetaTargetingSearchResult) => {
        if (!onAddLocation) {
            notifySuccess({
                title: 'Geo target found',
                message: `${item.name} (${item.id}) — enable editing to add locations.`,
            });
            return;
        }
        onAddLocation(item);
    };
    const locationSelectHandlers = Object.fromEntries(aggregatedData.locations.included.map((loc) => [
        loc.id,
        () => {
            const marker = locationMarkers.find((item) => item.id === loc.id);
            if (marker)
                setSelectedLocation(marker);
        },
    ])) as Record<string, () => void>;
    const locationRemoveHandlers = Object.fromEntries(aggregatedData.locations.included.map((loc) => [
        loc.id,
        (event: MouseEvent<HTMLButtonElement>) => {
            event.stopPropagation();
            if (isEditing && onRemoveLocation) {
                onRemoveLocation(loc.id);
                return;
            }
            notifySuccess({
                title: 'Read-only geography',
                message: 'Click Edit to remove locations from this ad set.',
            });
        },
    ])) as Record<string, (event: MouseEvent<HTMLButtonElement>) => void>;
    const handleSaveLocationsClick = () => {
        onSaveLocations?.();
    };
    return (<div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-info/10 ring-1 ring-info/20">
            <Globe className="size-4 text-info" aria-hidden/>
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

        {targeting.length > 1 ? (<Select value={selectedTargetingId} onValueChange={onTargetingChange}>
            <SelectTrigger className="h-9 w-full min-w-[200px] max-w-[240px] sm:w-[220px]">
              <SelectValue placeholder="Select ad set"/>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All ad sets</SelectItem>
              {targeting.map((item) => (<SelectItem key={item.entityId} value={item.entityId}>
                  {item.entityName ?? item.entityId}
                </SelectItem>))}
            </SelectContent>
          </Select>) : null}

        {canEditLocations ? (<TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant={isEditing ? 'default' : 'outline'} size="sm" className="h-9 gap-1.5" onClick={handleToggleEditing} aria-pressed={isEditing} aria-label="Edit locations">
                  <Edit2 className="size-3.5" aria-hidden/>
                  {isEditing ? 'Done' : 'Edit'}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isEditing ? 'Exit location editing' : 'Search and save geo targets to Meta'}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>) : null}
      </div>

      {isEditing && canSearchGeo && workspaceId ? (<MetaTargetingSearchCombobox workspaceId={workspaceId} clientId={clientId} mode="geolocations" placeholder="Search countries, regions, cities…" disabled={savingTargeting} onSelect={handleGeoSelect}/>) : null}

      <div className={ADS_PAGE_THEME.controlMapFrame}>
        <LocationMap locations={locationMarkers} height="300px" interactive={isEditing} showSearch={isEditing} onLocationSelect={handleLocationSelect}/>
      </div>

      {aggregatedData.locations.included.length > 0 ? (<div className="flex flex-wrap gap-1.5">
          {aggregatedData.locations.included.map((loc) => (<Badge key={loc.id} variant={selectedLocation?.id === loc.id ? 'default' : 'outline'} className={cn('cursor-pointer text-xs transition-[box-shadow,opacity]', selectedLocation?.id === loc.id && 'ring-2 ring-primary ring-offset-1')} onClick={locationSelectHandlers[loc.id]}>
              <MapPin className="mr-1 size-3 shrink-0" aria-hidden/>
              {loc.name}
              {isEditing && onRemoveLocation ? (<button type="button" onClick={locationRemoveHandlers[loc.id]} className="ml-1 rounded-sm p-0.5 hover:bg-destructive/15 hover:text-destructive" aria-label={`Remove ${loc.name}`}>
                  <X className="size-3" aria-hidden/>
                </button>) : null}
            </Badge>))}
        </div>) : (<p className="rounded-xl border border-dashed border-border/60 bg-muted/10 px-4 py-6 text-center text-xs text-muted-foreground">
          {isEditing
                ? 'Search above to add countries, regions, or cities, then save to Meta.'
                : 'No location targeting configured for this view.'}
        </p>)}

      {isEditing && onSaveLocations ? (<div className="flex justify-end border-t border-border/60 pt-3">
          <Button size="sm" onClick={handleSaveLocationsClick} disabled={savingTargeting}>
            {savingTargeting ? (<>
                <Loader2 className="mr-2 size-4 animate-spin" aria-hidden/>
                Saving…
              </>) : ('Save locations to Meta')}
          </Button>
        </div>) : null}
    </div>);
}
