'use client'

import { useCallback } from 'react'

import {
  buildPlacementDetailDraftFromSource,
  togglePlacementDraftValue,
  type MetaPlacementDetailDraft,
} from '@/lib/meta-placement-positions'
import { DEFAULT_META_PUBLISHER_PLATFORMS } from '@/lib/meta-publisher-platforms'
import { buildMetaTargetingFromNormalized, normalizeMetaGeoLocationType } from '@/services/integrations/meta-ads/meta-targeting-serialize'
import type { MetaTargetingSearchResult } from '@/features/dashboard/ads/hooks/use-meta-targeting-search'
import { notifyFailure } from '@/lib/notifications'

import type { AggregatedAudienceData } from './audience-control-aggregate'
import {
  buildBaseMetaTargetingPayload,
  persistAdSetTargeting,
  type AudienceControlDispatch,
} from './audience-control-targeting-persist'

type DraftState = {
  draftInterests: AggregatedAudienceData['interests'] | null
  draftLocations: AggregatedAudienceData['locations'] | null
  draftAudiences: AggregatedAudienceData['audiences'] | null
  draftDemographics: { ageMin: number; ageMax: number; genders: string[] } | null
  draftPlacements: string[] | null
  draftPlacementDetail: MetaPlacementDetailDraft | null
  editingSection: string | null
}

type UseAudienceControlTargetingHandlersArgs = {
  dispatch: AudienceControlDispatch
  aggregatedData: AggregatedAudienceData
  drafts: DraftState
  canEditMetaTargeting: boolean
  workspaceId: string | null
  activeAdSetId: string | undefined
  clientId: string | null | undefined
  updateAdSetTargeting: Parameters<typeof persistAdSetTargeting>[0]['updateAdSetTargeting']
  fetchTargeting: () => Promise<void>
}

export function useAudienceControlTargetingHandlers({
  dispatch,
  aggregatedData,
  drafts: {
    draftInterests,
    draftLocations,
    draftAudiences,
    draftDemographics,
    draftPlacements,
    draftPlacementDetail,
    editingSection,
  },
  canEditMetaTargeting,
  workspaceId,
  activeAdSetId,
  clientId,
  updateAdSetTargeting,
  fetchTargeting,
}: UseAudienceControlTargetingHandlersArgs) {
  const audiencesForPayload = draftAudiences ?? aggregatedData.audiences

  const handleToggleEditing = useCallback(
    (section: string) => {
      if (section === 'demographics' && editingSection !== 'demographics' && !draftDemographics) {
        dispatch({
          type: 'setDraftDemographics',
          value: {
            ageMin: 18,
            ageMax: 65,
            genders: aggregatedData.demographics.genders.map((gender) => gender.toLowerCase()),
          },
        })
      }
      if (section === 'placements' && editingSection !== 'placements' && !draftPlacements) {
        dispatch({
          type: 'setDraftPlacements',
          value:
            aggregatedData.placements.length > 0
              ? [...aggregatedData.placements]
              : [...DEFAULT_META_PUBLISHER_PLATFORMS],
        })
      }
      if (section === 'placements' && editingSection !== 'placements' && !draftPlacementDetail) {
        dispatch({
          type: 'setDraftPlacementDetail',
          value: buildPlacementDetailDraftFromSource(aggregatedData),
        })
      }
      dispatch({ type: 'toggleEditing', section })
    },
    [aggregatedData, draftDemographics, draftPlacementDetail, draftPlacements, dispatch, editingSection],
  )

  const handlePersistInterests = useCallback(async () => {
    await persistAdSetTargeting({
      canEditMetaTargeting,
      workspaceId,
      activeAdSetId,
      clientId,
      updateAdSetTargeting,
      fetchTargeting,
      dispatch,
      selectAdSetDescription: 'Choose a single ad set before saving interest targeting.',
      successDescription: 'Interests updated on the ad set in Meta.',
      logContext: 'AudienceControlSection:saveTargeting',
      targeting: buildMetaTargetingFromNormalized({
        ...buildBaseMetaTargetingPayload(aggregatedData, audiencesForPayload),
        interests: draftInterests ?? aggregatedData.interests,
      }),
      clearDrafts: () => {
        dispatch({ type: 'setDraftInterests', value: null })
      },
    })
  }, [
    activeAdSetId,
    aggregatedData,
    audiencesForPayload,
    canEditMetaTargeting,
    clientId,
    dispatch,
    draftInterests,
    fetchTargeting,
    updateAdSetTargeting,
    workspaceId,
  ])

  const handleAddInterestDraft = useCallback(
    (interest: { id: string; name: string }) => {
      dispatch({
        type: 'updateDraftInterests',
        updater: (prev) => {
          const base = prev ?? aggregatedData.interests
          if (base.some((item) => item.id === interest.id || item.name === interest.name)) return base
          return [...base, interest]
        },
      })
    },
    [aggregatedData.interests, dispatch],
  )

  const handleRemoveInterestDraft = useCallback(
    (interestName: string) => {
      dispatch({
        type: 'updateDraftInterests',
        updater: (prev) => {
          const base = prev ?? aggregatedData.interests
          return base.filter((item) => item.name !== interestName)
        },
      })
    },
    [aggregatedData.interests, dispatch],
  )

  const handleAddLocationDraft = useCallback(
    (item: MetaTargetingSearchResult) => {
      dispatch({
        type: 'updateDraftLocations',
        updater: (prev) => {
          const base = prev ?? {
            included: aggregatedData.locations.included,
            excluded: aggregatedData.locations.excluded,
          }
          if (base.included.some((loc) => loc.id === item.id)) return base
          return {
            ...base,
            included: [
              ...base.included,
              {
                id: item.id,
                name: item.name,
                type: normalizeMetaGeoLocationType(item.type),
              },
            ],
          }
        },
      })
    },
    [aggregatedData.locations.excluded, aggregatedData.locations.included, dispatch],
  )

  const handleRemoveLocationDraft = useCallback(
    (locationId: string) => {
      dispatch({
        type: 'updateDraftLocations',
        updater: (prev) => {
          const base = prev ?? {
            included: aggregatedData.locations.included,
            excluded: aggregatedData.locations.excluded,
          }
          return {
            ...base,
            included: base.included.filter((loc) => loc.id !== locationId),
          }
        },
      })
    },
    [aggregatedData.locations.excluded, aggregatedData.locations.included, dispatch],
  )

  const handlePersistLocations = useCallback(async () => {
    const nextLocations = draftLocations ?? aggregatedData.locations
    await persistAdSetTargeting({
      canEditMetaTargeting,
      workspaceId,
      activeAdSetId,
      clientId,
      updateAdSetTargeting,
      fetchTargeting,
      dispatch,
      selectAdSetDescription: 'Choose a single ad set before saving location targeting.',
      successDescription: 'Locations updated on the ad set in Meta.',
      logContext: 'AudienceControlSection:saveLocations',
      targeting: buildMetaTargetingFromNormalized({
        ...buildBaseMetaTargetingPayload(aggregatedData, audiencesForPayload),
        locations: {
          included: nextLocations.included,
          excluded: nextLocations.excluded.map((loc) => ({
            id: loc.id,
            name: loc.name,
            type: 'country',
          })),
        },
      }),
      clearDrafts: () => {
        dispatch({ type: 'setDraftLocations', value: null })
      },
    })
  }, [
    activeAdSetId,
    aggregatedData,
    audiencesForPayload,
    canEditMetaTargeting,
    clientId,
    dispatch,
    draftLocations,
    fetchTargeting,
    updateAdSetTargeting,
    workspaceId,
  ])

  const handleAddAudienceDraft = useCallback(
    (audience: { id: string; name: string }) => {
      dispatch({
        type: 'updateDraftAudiences',
        updater: (prev) => {
          const base = prev ?? aggregatedData.audiences
          if (base.included.some((item) => item.id === audience.id)) return base
          return {
            ...base,
            included: [...base.included, { ...audience, type: 'custom' }],
          }
        },
      })
    },
    [aggregatedData.audiences, dispatch],
  )

  const handleRemoveAudienceDraft = useCallback(
    (audienceId: string) => {
      dispatch({
        type: 'updateDraftAudiences',
        updater: (prev) => {
          const base = prev ?? aggregatedData.audiences
          return {
            ...base,
            included: base.included.filter((item) => item.id !== audienceId),
          }
        },
      })
    },
    [aggregatedData.audiences, dispatch],
  )

  const handlePersistAudiences = useCallback(async () => {
    const nextAudiences = draftAudiences ?? aggregatedData.audiences
    await persistAdSetTargeting({
      canEditMetaTargeting,
      workspaceId,
      activeAdSetId,
      clientId,
      updateAdSetTargeting,
      fetchTargeting,
      dispatch,
      selectAdSetDescription: 'Choose a single ad set before saving custom audiences.',
      successDescription: 'Custom audiences updated on the ad set in Meta.',
      logContext: 'AudienceControlSection:saveAudiences',
      targeting: buildMetaTargetingFromNormalized({
        ...buildBaseMetaTargetingPayload(aggregatedData, nextAudiences),
      }),
      clearDrafts: () => {
        dispatch({ type: 'setDraftAudiences', value: null })
      },
    })
  }, [
    activeAdSetId,
    aggregatedData,
    canEditMetaTargeting,
    clientId,
    dispatch,
    draftAudiences,
    fetchTargeting,
    updateAdSetTargeting,
    workspaceId,
  ])

  const handlePersistDemographics = useCallback(async () => {
    const next = draftDemographics ?? {
      ageMin: 18,
      ageMax: 65,
      genders: aggregatedData.demographics.genders.map((gender) => gender.toLowerCase()),
    }

    await persistAdSetTargeting({
      canEditMetaTargeting,
      workspaceId,
      activeAdSetId,
      clientId,
      updateAdSetTargeting,
      fetchTargeting,
      dispatch,
      selectAdSetDescription: 'Choose a single ad set before saving demographic targeting.',
      successDescription: 'Demographics updated on the ad set in Meta.',
      logContext: 'AudienceControlSection:saveDemographics',
      targeting: buildMetaTargetingFromNormalized({
        ...buildBaseMetaTargetingPayload(aggregatedData, audiencesForPayload),
        demographics: {
          ageRanges: aggregatedData.demographics.ageRanges,
          genders: next.genders,
          ageMin: Math.min(next.ageMin, next.ageMax),
          ageMax: Math.max(next.ageMin, next.ageMax),
        },
      }),
      clearDrafts: () => {
        dispatch({ type: 'setDraftDemographics', value: null })
      },
    })
  }, [
    activeAdSetId,
    aggregatedData,
    audiencesForPayload,
    canEditMetaTargeting,
    clientId,
    dispatch,
    draftDemographics,
    fetchTargeting,
    updateAdSetTargeting,
    workspaceId,
  ])

  const handlePersistPlacements = useCallback(async () => {
    const nextPlatforms =
      draftPlacements ??
      (aggregatedData.placements.length > 0
        ? aggregatedData.placements
        : [...DEFAULT_META_PUBLISHER_PLATFORMS])
    const nextPlacementDetail =
      draftPlacementDetail ?? buildPlacementDetailDraftFromSource(aggregatedData)

    if (nextPlatforms.length === 0) {
      notifyFailure({ title: 'Select at least one platform', message: 'Meta requires one publisher platform.' })
      return
    }

    await persistAdSetTargeting({
      canEditMetaTargeting,
      workspaceId,
      activeAdSetId,
      clientId,
      updateAdSetTargeting,
      fetchTargeting,
      dispatch,
      selectAdSetDescription: 'Choose a single ad set before saving placement targeting.',
      successDescription: 'Placements updated on the ad set in Meta.',
      logContext: 'AudienceControlSection:savePlacements',
      targeting: buildMetaTargetingFromNormalized({
        ...buildBaseMetaTargetingPayload(aggregatedData, audiencesForPayload),
        demographics: {
          ageRanges: aggregatedData.demographics.ageRanges,
          genders: aggregatedData.demographics.genders,
        },
        publisherPlatforms: nextPlatforms,
        placementDetail: nextPlacementDetail,
      }),
      clearDrafts: () => {
        dispatch({ type: 'setDraftPlacements', value: null })
        dispatch({ type: 'setDraftPlacementDetail', value: null })
      },
    })
  }, [
    activeAdSetId,
    aggregatedData,
    audiencesForPayload,
    canEditMetaTargeting,
    clientId,
    dispatch,
    draftPlacementDetail,
    draftPlacements,
    fetchTargeting,
    updateAdSetTargeting,
    workspaceId,
  ])

  const handleTogglePlatformDraft = useCallback(
    (platformId: string) => {
      dispatch({
        type: 'updateDraftPlacements',
        updater: (prev) => {
          const base =
            prev ??
            (aggregatedData.placements.length > 0
              ? aggregatedData.placements
              : [...DEFAULT_META_PUBLISHER_PLATFORMS])
          const has = base.includes(platformId)
          const next = has ? base.filter((item) => item !== platformId) : [...base, platformId]
          return next.length > 0 ? next : base
        },
      })
    },
    [aggregatedData.placements, dispatch],
  )

  const handleTogglePlacementPositionDraft = useCallback(
    (field: keyof MetaPlacementDetailDraft, positionId: string) => {
      dispatch({
        type: 'updateDraftPlacementDetail',
        updater: (prev) => {
          const base = prev ?? buildPlacementDetailDraftFromSource(aggregatedData)
          return {
            ...base,
            [field]: togglePlacementDraftValue(base[field], positionId),
          }
        },
      })
    },
    [aggregatedData, dispatch],
  )

  const handleDraftDemographicsChange = useCallback(
    (updater: (prev: { ageMin: number; ageMax: number; genders: string[] }) => {
      ageMin: number
      ageMax: number
      genders: string[]
    }) => {
      dispatch({
        type: 'updateDraftDemographics',
        updater: (prev) => {
          const base =
            prev ??
            ({
              ageMin: 18,
              ageMax: 65,
              genders: aggregatedData.demographics.genders.map((gender) => gender.toLowerCase()),
            } as const)
          return updater(base)
        },
      })
    },
    [aggregatedData.demographics.genders, dispatch],
  )

  return {
    handleToggleEditing,
    handlePersistInterests,
    handleAddInterestDraft,
    handleRemoveInterestDraft,
    handleAddLocationDraft,
    handleRemoveLocationDraft,
    handlePersistLocations,
    handleAddAudienceDraft,
    handleRemoveAudienceDraft,
    handlePersistAudiences,
    handlePersistDemographics,
    handlePersistPlacements,
    handleTogglePlatformDraft,
    handleTogglePlacementPositionDraft,
    handleDraftDemographicsChange,
  }
}
