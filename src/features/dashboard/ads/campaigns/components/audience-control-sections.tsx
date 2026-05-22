'use client'

import { createElement, type ComponentProps, type ReactNode } from 'react'

import {
  AudienceControlHeaderActionsSlot,
  AudienceControlInterestSectionSlot,
} from './audience-control-section-slots'
import { AlertTriangle, MapPin, Plus, RefreshCw, Sparkles, Target, Users } from 'lucide-react'

import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/alert'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { ADS_PAGE_THEME } from '@/features/dashboard/ads/components/ads-page-theme'
import { CardContent } from '@/shared/ui/card'
import { MotionCard } from '@/shared/ui/motion-primitives'
import { Skeleton } from '@/shared/ui/skeleton'
import { cn } from '@/lib/utils'
import { AudienceBuilderDialog } from '@/features/dashboard/ads/components/audience-builder-dialog'
import type { LocationMarker } from '@/shared/ui/location-map'

import { AudienceDisplaySection } from './audience-display-section'
import { AudienceEditorSection } from './audience-editor-section'
import { CampaignControlHeader } from './campaign-control-header'
import { DemographicSection } from './demographic-section'
import { LocationTargetingSection } from './location-targeting-section'
import type { TargetingData } from './audience-control-types'
import type { Insights } from './audience-control-section-state'

export function AudienceControlHeaderActions({
  loading,
  onOpenBuilder,
  onRefresh,
}: {
  loading: boolean
  onOpenBuilder: () => void
  onRefresh: () => void
}) {
  return (
    <>
      <Button variant="outline" size="sm" className="gap-1.5" onClick={onOpenBuilder}>
        <Plus className="size-4" aria-hidden />
        Create audience
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="size-9"
        onClick={onRefresh}
        disabled={loading}
        aria-label="Refresh audience targeting"
      >
        <RefreshCw className={cn('size-4', loading && 'animate-spin')} aria-hidden />
      </Button>
    </>
  )
}

export function AudienceControlLoadingCard() {
  return (
    <MotionCard className={ADS_PAGE_THEME.surfaceCard}>
      <CampaignControlHeader
        icon={Target}
        title="Audience targeting"
        description="Loading targeting from the ad platform…"
      />
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <Skeleton className={cn(ADS_PAGE_THEME.controlMapFrame, 'h-[300px]')} />
          <div className="space-y-3">
            <Skeleton className="h-14 rounded-xl" />
            <Skeleton className="h-14 rounded-xl" />
            <Skeleton className="h-14 rounded-xl" />
          </div>
        </div>
      </CardContent>
    </MotionCard>
  )
}

export function AudienceControlPreviewCard() {
  return (
    <MotionCard className={ADS_PAGE_THEME.surfaceCard}>
      <CampaignControlHeader icon={Target} title="Audience targeting" />
      <CardContent className="pt-2">
        <div className={cn(ADS_PAGE_THEME.emptyState, 'py-14')}>
          <div className={ADS_PAGE_THEME.controlHeaderIcon}>
            <Sparkles className="size-5 text-muted-foreground" aria-hidden />
          </div>
          <p className="text-sm font-medium">Preview mode</p>
          <p className="max-w-sm text-xs text-muted-foreground">
            Enable live mode to load geography, demographics, and audiences from your ad account.
          </p>
        </div>
      </CardContent>
    </MotionCard>
  )
}

export function AudienceControlEmptyCard({
  builderOpen,
  headerActionsProps,
  onBuilderOpenChange,
  providerId,
}: {
  builderOpen: boolean
  headerActionsProps: ComponentProps<typeof AudienceControlHeaderActionsSlot>
  onBuilderOpenChange: (open: boolean) => void
  providerId: string
}) {
  return (
    <MotionCard className={ADS_PAGE_THEME.surfaceCard}>
      <CampaignControlHeader
        icon={Target}
        title="Audience targeting"
        description="No targeting data returned for this campaign yet."
        actions={createElement(AudienceControlHeaderActionsSlot, headerActionsProps)}
      />
      <CardContent className="pt-2">
        <div className={cn(ADS_PAGE_THEME.emptyState, 'py-14')}>
          <div className={ADS_PAGE_THEME.controlHeaderIcon}>
            <Users className="size-5 text-primary" aria-hidden />
          </div>
          <p className="text-sm font-medium">No targeting configured</p>
          <p className="max-w-sm text-xs text-muted-foreground">
            Create a custom audience or confirm ad sets have location and interest criteria on the
            platform.
          </p>
        </div>
        <AudienceBuilderDialog isOpen={builderOpen} onOpenChange={onBuilderOpenChange} providerId={providerId} />
      </CardContent>
    </MotionCard>
  )
}

type AggregatedTargetingData = {
  demographics: {
    ageRanges: string[]
    genders: string[]
    languages: string[]
  }
  audiences: {
    included: Array<{ id: string; name: string; type: string }>
    excluded: Array<{ id: string; name: string }>
  }
  locations: {
    included: Array<{ id: string; name: string; type: string }>
    excluded: Array<{ id: string; name: string }>
  }
  interests: Array<{ id: string; name: string; category?: string }>
  keywords: Array<{ text: string; matchType?: string }>
  devices: string[]
  placements: string[]
  metaPlacements: {
    facebook: string[]
    instagram: string[]
    audienceNetwork: string[]
    messenger: string[]
  }
  professional: {
    industries: Array<{ id: string; name: string }>
    jobTitles: Array<{ id: string; name: string }>
  }
}

export function AudienceControlExcludedLocations({
  excludedLocations,
}: {
  excludedLocations: AggregatedTargetingData['locations']['excluded']
}) {
  if (excludedLocations.length === 0) {
    return null
  }

  return (
    <div className="rounded-2xl border border-destructive/20 bg-destructive/[0.04] px-5 py-4">
      <div className="mb-3 flex items-center gap-2">
        <MapPin className="size-4 text-destructive" aria-hidden />
        <span className="text-sm font-medium text-foreground">Excluded locations</span>
        <Badge variant="outline" className="border-destructive/30 text-xs text-destructive">
          {excludedLocations.length}
        </Badge>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {excludedLocations.map((loc) => (
          <Badge key={loc.id} variant="destructive" className="text-xs">
            {loc.name}
          </Badge>
        ))}
      </div>
    </div>
  )
}

export function AudienceControlMainCard({
  targeting,
  insights,
  aggregatedData,
  locationMarkers,
  selectedTargetingId,
  expandedSections,
  geocodeFailedNames,
  audienceStats,
  headerActionsProps,
  interestSectionProps,
  builderOpen,
  providerId,
  workspaceId,
  clientId,
  canEditMetaTargeting,
  editingSection,
  onTargetingChange,
  onToggleEditing,
  onToggleSection,
  onBuilderOpenChange,
}: {
  targeting: TargetingData[]
  insights: Insights | null
  aggregatedData: AggregatedTargetingData
  locationMarkers: LocationMarker[]
  selectedTargetingId: string
  expandedSections: Set<string>
  geocodeFailedNames: string[]
  audienceStats: Array<{ label: string; value: number }>
  headerActionsProps: ComponentProps<typeof AudienceControlHeaderActionsSlot>
  interestSectionProps: AudienceControlInterestEditorSectionProps
  builderOpen: boolean
  providerId: string
  workspaceId: string | null
  clientId?: string | null
  canEditMetaTargeting: boolean
  editingSection: string | null
  onTargetingChange: (value: string) => void
  onToggleEditing: (section: string) => void
  onToggleSection: (section: string) => void
  onBuilderOpenChange: (open: boolean) => void
}) {
  const entityCount = insights?.totalEntities ?? targeting.length

  return (
    <MotionCard className={ADS_PAGE_THEME.surfaceCard}>
      <CampaignControlHeader
        icon={Target}
        title="Audience targeting"
        description={
          <>
            {entityCount} configuration
            {entityCount === 1 ? '' : 's'} across ad sets - map, demographics, and segments in one view.
          </>
        }
        actions={createElement(AudienceControlHeaderActionsSlot, headerActionsProps)}
        stats={audienceStats}
      />

      <CardContent className="space-y-6 pt-6">
        {geocodeFailedNames.length > 0 ? (
          <Alert variant="default" className="border-warning/40 bg-warning/10">
            <AlertTriangle className="size-4 text-warning" />
            <AlertTitle>Some locations could not be placed on the map</AlertTitle>
            <AlertDescription>
              The map may be incomplete for: {geocodeFailedNames.join(', ')}. Check spelling or try a broader place
              name.
            </AlertDescription>
          </Alert>
        ) : null}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
          <div className={cn(ADS_PAGE_THEME.controlFormPanel, 'p-5')}>
            <LocationTargetingSection
              targeting={targeting}
              aggregatedData={aggregatedData}
              locationMarkers={locationMarkers}
              selectedTargetingId={selectedTargetingId}
              onTargetingChange={onTargetingChange}
              editingSection={editingSection}
              onToggleEditing={onToggleEditing}
              workspaceId={workspaceId}
              clientId={clientId}
              canSearchGeo={canEditMetaTargeting}
            />
          </div>

          <div className="space-y-2.5">
            <p className={cn(ADS_PAGE_THEME.controlSectionLabel, 'px-0.5')}>Segments & criteria</p>
            <DemographicSection
              aggregatedData={aggregatedData}
              expandedSections={expandedSections}
              toggleSection={onToggleSection}
            />
            <AudienceDisplaySection
              aggregatedData={aggregatedData}
              expandedSections={expandedSections}
              toggleSection={onToggleSection}
              interestSection={createElement(AudienceControlInterestSectionSlot, interestSectionProps)}
            />
          </div>
        </div>

        <AudienceControlExcludedLocations excludedLocations={aggregatedData.locations.excluded} />
      </CardContent>

      <AudienceBuilderDialog isOpen={builderOpen} onOpenChange={onBuilderOpenChange} providerId={providerId} />
    </MotionCard>
  )
}

export type AudienceControlInterestEditorSectionProps = {
  aggregatedData: AggregatedTargetingData
  expandedSections: Set<string>
  toggleSection: (section: string) => void
  editingSection: string | null
  onToggleEditing: (section: string) => void
  canEditMetaTargeting: boolean
  workspaceId: string | null
  clientId?: string | null
  onAddInterest?: (interest: { id: string; name: string }) => void
  onRemoveInterest?: (interestName: string) => void
  onSaveTargeting?: () => void
  savingTargeting: boolean
}

export function AudienceControlInterestEditorSection({
  aggregatedData,
  expandedSections,
  toggleSection,
  editingSection,
  onToggleEditing,
  canEditMetaTargeting,
  workspaceId,
  clientId,
  onAddInterest,
  onRemoveInterest,
  onSaveTargeting,
  savingTargeting,
}: AudienceControlInterestEditorSectionProps) {
  return (
    <AudienceEditorSection
      aggregatedData={aggregatedData}
      expandedSections={expandedSections}
      toggleSection={toggleSection}
      editingSection={editingSection}
      onToggleEditing={onToggleEditing}
      canEditTargeting={canEditMetaTargeting}
      workspaceId={workspaceId}
      clientId={clientId}
      onAddInterest={onAddInterest}
      onRemoveInterest={onRemoveInterest}
      onSaveTargeting={onSaveTargeting}
      savingTargeting={savingTargeting}
    />
  )
}
