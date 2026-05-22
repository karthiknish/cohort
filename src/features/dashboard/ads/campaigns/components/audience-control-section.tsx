'use client'

import {
  AudienceControlEmptyCard,
  AudienceControlLoadingCard,
  AudienceControlMainCard,
  AudienceControlPreviewCard,
} from './audience-control-sections'
import { useAudienceControlSection } from './audience-control-section-controller'

type Props = {
  providerId: string
  campaignId: string
  clientId?: string | null
  isPreviewMode?: boolean
}

export function AudienceControlSection({ providerId, campaignId, clientId, isPreviewMode }: Props) {
  const view = useAudienceControlSection({ providerId, campaignId, clientId, isPreviewMode })

  if (view.loading && !view.hasLoaded) {
    return <AudienceControlLoadingCard />
  }

  if (!view.canLoad) {
    return <AudienceControlPreviewCard />
  }

  if (view.targeting.length === 0 && view.hasLoaded) {
    return (
      <AudienceControlEmptyCard
        builderOpen={view.builderOpen}
        headerActionsProps={view.headerActionsProps}
        onBuilderOpenChange={view.handleBuilderOpenChange}
        providerId={view.providerId}
      />
    )
  }

  return (
    <AudienceControlMainCard
      targeting={view.targeting}
      insights={view.insights}
      aggregatedData={view.aggregatedData}
      locationMarkers={view.locationMarkers}
      selectedTargetingId={view.selectedTargetingId}
      expandedSections={view.expandedSections}
      geocodeFailedNames={view.geocodeFailedNames}
      audienceStats={view.audienceStats}
      headerActionsProps={view.headerActionsProps}
      interestSectionProps={view.interestSectionProps}
      builderOpen={view.builderOpen}
      providerId={view.providerId}
      workspaceId={view.workspaceId}
      clientId={view.clientId}
      canEditMetaTargeting={view.canEditMetaTargeting}
      editingSection={view.editingSection}
      onTargetingChange={view.handleSelectedTargetingIdChange}
      onToggleEditing={view.handleToggleEditing}
      onToggleSection={view.toggleSection}
      onBuilderOpenChange={view.handleBuilderOpenChange}
    />
  )
}
