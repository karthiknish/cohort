'use client'

import { useCallback } from 'react'
import { Edit2, Globe } from 'lucide-react'

import {
  META_AUDIENCE_NETWORK_POSITIONS,
  META_DEVICE_PLATFORMS,
  META_FACEBOOK_POSITIONS,
  META_INSTAGRAM_POSITIONS,
  META_MESSENGER_POSITIONS,
  type MetaPlacementDetailDraft,
  type MetaPlacementOption,
} from '@/lib/meta-placement-positions'
import { META_PUBLISHER_PLATFORMS } from '@/lib/meta-publisher-platforms'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/shared/ui/tooltip'
import { cn } from '@/lib/utils'

import type { AggregatedTargetingData } from './audience-control-types'
import { TargetingCollapsiblePanel } from './targeting-collapsible-panel'

type PlacementTargetingSectionProps = {
  aggregatedData: AggregatedTargetingData
  expandedSections: Set<string>
  toggleSection: (section: string) => void
  editingSection?: string | null
  onToggleEditing?: (section: string) => void
  canEdit?: boolean
  draftPublisherPlatforms?: string[] | null
  draftPlacementDetail?: MetaPlacementDetailDraft | null
  onTogglePlatform?: (platformId: string) => void
  onTogglePlacementPosition?: (
    field: keyof MetaPlacementDetailDraft,
    positionId: string,
  ) => void
  onSavePlacements?: () => void | Promise<void>
  savingTargeting?: boolean
}

function PositionToggleGroup({
  label,
  options,
  selected,
  onToggle,
}: {
  label: string
  options: MetaPlacementOption[]
  selected: string[]
  onToggle: (id: string) => void
}) {
  if (options.length === 0) return null

  return (
    <div className="space-y-1.5">
      <p className="text-xs font-medium text-foreground">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {options.map((option) => {
          const active = selected.includes(option.id)
          return (
            <Button
              key={option.id}
              type="button"
              size="sm"
              variant={active ? 'default' : 'outline'}
              className="h-7 text-xs"
              onClick={() => onToggle(option.id)}
            >
              {option.label}
            </Button>
          )
        })}
      </div>
      {selected.length === 0 ? (
        <p className="text-[11px] text-muted-foreground">No restriction — Meta uses all positions for this surface.</p>
      ) : null}
    </div>
  )
}

export function PlacementTargetingSection({
  aggregatedData,
  expandedSections,
  toggleSection,
  editingSection,
  onToggleEditing,
  canEdit,
  draftPublisherPlatforms,
  draftPlacementDetail,
  onTogglePlatform,
  onTogglePlacementPosition,
  onSavePlacements,
  savingTargeting,
}: PlacementTargetingSectionProps) {
  const isEditing = editingSection === 'placements'
  const displayPlatforms =
    draftPublisherPlatforms ??
    (aggregatedData.placements.length > 0 ? aggregatedData.placements : [])
  const displayDetail = draftPlacementDetail ?? {
    facebookPositions: aggregatedData.metaPlacements.facebook,
    instagramPositions: aggregatedData.metaPlacements.instagram,
    audienceNetworkPositions: aggregatedData.metaPlacements.audienceNetwork,
    messengerPositions: aggregatedData.metaPlacements.messenger,
    devicePlatforms: aggregatedData.devices,
  }

  const positionCount =
    displayDetail.facebookPositions.length +
    displayDetail.instagramPositions.length +
    displayDetail.audienceNetworkPositions.length +
    displayDetail.messengerPositions.length +
    displayDetail.devicePlatforms.length

  const handleToggle = useCallback(() => {
    toggleSection('placements')
  }, [toggleSection])

  const handleEdit = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation()
      onToggleEditing?.('placements')
    },
    [onToggleEditing],
  )

  const handleSaveClick = useCallback(() => {
    void onSavePlacements?.()
  }, [onSavePlacements])

  const showPanel =
    displayPlatforms.length > 0 || positionCount > 0 || Boolean(canEdit)

  if (!showPanel) return null

  const editButton =
    canEdit && onToggleEditing ? (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={isEditing ? 'default' : 'ghost'}
              size="icon"
              className="size-8"
              onClick={handleEdit}
              aria-pressed={isEditing}
              aria-label="Edit placements"
            >
              <Edit2 className="size-3.5" aria-hidden />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{isEditing ? 'Exit placement editing' : 'Edit placements'}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    ) : null

  const showFacebook = displayPlatforms.includes('facebook')
  const showInstagram = displayPlatforms.includes('instagram')
  const showAudienceNetwork = displayPlatforms.includes('audience_network')
  const showMessenger = displayPlatforms.includes('messenger')

  return (
    <TargetingCollapsiblePanel
      sectionId="placements"
      icon={Globe}
      title="Placements"
      count={isEditing ? undefined : displayPlatforms.length + (positionCount > 0 ? positionCount : 0)}
      expanded={expandedSections.has('placements')}
      onToggle={handleToggle}
      headerActions={editButton}
    >
      <div className="space-y-3">
        {isEditing && onTogglePlatform ? (
          <>
            <p className="text-xs text-muted-foreground">
              Choose publisher platforms, optional positions per surface, and device types. At least one platform is required.
            </p>
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-foreground">Publisher platforms</p>
              <div className="flex flex-wrap gap-2">
                {META_PUBLISHER_PLATFORMS.map((platform) => {
                  const active = displayPlatforms.includes(platform.id)
                  return (
                    <Button
                      key={platform.id}
                      type="button"
                      size="sm"
                      variant={active ? 'default' : 'outline'}
                      className="h-8"
                      onClick={() => onTogglePlatform(platform.id)}
                    >
                      {platform.label}
                    </Button>
                  )
                })}
              </div>
            </div>
            {onTogglePlacementPosition ? (
              <div className="space-y-3 border-t border-border/60 pt-3">
                {showFacebook ? (
                  <PositionToggleGroup
                    label="Facebook positions"
                    options={META_FACEBOOK_POSITIONS}
                    selected={displayDetail.facebookPositions}
                    onToggle={(id) => onTogglePlacementPosition('facebookPositions', id)}
                  />
                ) : null}
                {showInstagram ? (
                  <PositionToggleGroup
                    label="Instagram positions"
                    options={META_INSTAGRAM_POSITIONS}
                    selected={displayDetail.instagramPositions}
                    onToggle={(id) => onTogglePlacementPosition('instagramPositions', id)}
                  />
                ) : null}
                {showAudienceNetwork ? (
                  <PositionToggleGroup
                    label="Audience Network positions"
                    options={META_AUDIENCE_NETWORK_POSITIONS}
                    selected={displayDetail.audienceNetworkPositions}
                    onToggle={(id) => onTogglePlacementPosition('audienceNetworkPositions', id)}
                  />
                ) : null}
                {showMessenger ? (
                  <PositionToggleGroup
                    label="Messenger positions"
                    options={META_MESSENGER_POSITIONS}
                    selected={displayDetail.messengerPositions}
                    onToggle={(id) => onTogglePlacementPosition('messengerPositions', id)}
                  />
                ) : null}
                <PositionToggleGroup
                  label="Devices"
                  options={META_DEVICE_PLATFORMS}
                  selected={displayDetail.devicePlatforms}
                  onToggle={(id) => onTogglePlacementPosition('devicePlatforms', id)}
                />
              </div>
            ) : null}
            {onSavePlacements ? (
              <Button
                size="sm"
                className="w-full sm:w-auto"
                disabled={savingTargeting || displayPlatforms.length === 0}
                onClick={handleSaveClick}
              >
                {savingTargeting ? 'Saving…' : 'Save to ad set'}
              </Button>
            ) : null}
          </>
        ) : displayPlatforms.length > 0 || positionCount > 0 ? (
          <div className="space-y-2">
            {displayPlatforms.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {displayPlatforms.map((placement) => (
                  <Badge key={placement} variant="secondary" className="text-xs capitalize">
                    {placement.replace(/_/g, ' ')}
                  </Badge>
                ))}
              </div>
            ) : null}
            {displayDetail.facebookPositions.length > 0 ? (
              <p className="text-xs text-muted-foreground">
                Facebook: {displayDetail.facebookPositions.join(', ')}
              </p>
            ) : null}
            {displayDetail.instagramPositions.length > 0 ? (
              <p className="text-xs text-muted-foreground">
                Instagram: {displayDetail.instagramPositions.join(', ')}
              </p>
            ) : null}
            {displayDetail.devicePlatforms.length > 0 ? (
              <p className="text-xs text-muted-foreground">
                Devices: {displayDetail.devicePlatforms.join(', ')}
              </p>
            ) : null}
          </div>
        ) : (
          <p className={cn('text-center text-xs text-muted-foreground')}>
            No placements configured.{canEdit ? ' Use Edit to select platforms.' : ''}
          </p>
        )}
      </div>
    </TargetingCollapsiblePanel>
  )
}
