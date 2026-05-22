'use client'

import { notifyFailure } from '@/lib/notifications'
import { useCallback, useEffect, useMemo, useReducer } from 'react'

import { useAction } from 'convex/react'

import { adsAdSetsApi, adsTargetingApi } from '@/lib/convex-api'
import { buildMetaTargetingFromNormalized } from '@/services/integrations/meta-ads/meta-targeting-serialize'
import { logError } from '@/lib/convex-errors'
import { useAuth } from '@/shared/contexts/auth-context'

import { toast } from '@/shared/ui/use-toast'
import type { LocationMarker } from '@/shared/ui/location-map'

import { useGeocodeResolveBatch } from '@/shared/hooks/use-geocode'
import { findLocationCoordinates, LOCATION_COORDINATES } from './audience-control-utils'
import type { TargetingData } from './audience-control-types'
import { toAdsProviderId } from '@/features/dashboard/ads/components/utils'
import {
  audienceControlSectionReducer,
  createInitialAudienceControlSectionState,
  type Insights,
} from './audience-control-section-state'
import type { AudienceControlInterestEditorSectionProps } from './audience-control-sections'

type AudienceControlSectionArgs = {
  providerId: string
  campaignId: string
  clientId?: string | null
  isPreviewMode?: boolean
}

type AudienceTargetingResponse = {
  targeting?: TargetingData[]
  insights?: Insights | null
}

export function useAudienceControlSection({
  providerId,
  campaignId,
  clientId,
  isPreviewMode,
}: AudienceControlSectionArgs) {
  const { user } = useAuth()

  const getTargeting = useAction(adsTargetingApi.getTargeting)
  const updateAdSetTargeting = useAction(adsAdSetsApi.updateAdSetTargeting)
  const convexProviderId = toAdsProviderId(providerId)
  const canEditMetaTargeting = convexProviderId === 'facebook' && !isPreviewMode

  const [state, dispatch] = useReducer(
    audienceControlSectionReducer,
    undefined,
    createInitialAudienceControlSectionState,
  )
  const {
    targeting,
    insights,
    loading,
    expandedSections,
    builderOpen,
    hasLoaded,
    editingSection,
    selectedTargetingId,
    draftInterests,
    savingTargeting,
  } = state

  const canLoad = !isPreviewMode
  const workspaceId = user?.agencyId ? String(user.agencyId) : null

  const unknownLocationNames = useMemo(() => {
    const unknowns: string[] = []
    targeting.forEach((t) => {
      t.locations.included.forEach((loc) => {
        const name = loc.name.toLowerCase().trim()
        if (!LOCATION_COORDINATES[name] && !findLocationCoordinates(loc.name) && !(loc.lat && loc.lng)) {
          unknowns.push(loc.name)
        }
      })
    })
    return [...new Set(unknowns)]
  }, [targeting])

  const { data: geocodeBatch } = useGeocodeResolveBatch(unknownLocationNames, {
    enabled: unknownLocationNames.length > 0 && hasLoaded,
  })
  const resolvedCoordinates = useMemo(
    () => geocodeBatch?.coordinates ?? {},
    [geocodeBatch?.coordinates],
  )
  const geocodeFailedNames = geocodeBatch?.failedNames ?? []

  const fetchTargeting = useCallback(async () => {
    if (!canLoad) {
      dispatch({ type: 'setLoading', value: false })
      return
    }

    if (!workspaceId) {
      notifyFailure({
        title: 'Error',
        message: 'Missing workspace id',
      })
      dispatch({ type: 'setLoading', value: false })
      return
    }

    dispatch({ type: 'setLoading', value: true })

    void getTargeting({
      workspaceId,
      providerId: toAdsProviderId(providerId),
      clientId: clientId ?? null,
      campaignId,
    })
      .then((data) => {
        const payload = data as AudienceTargetingResponse | null | undefined
        const nextTargetingRaw = payload?.targeting
        const nextTargeting = Array.isArray(nextTargetingRaw) ? nextTargetingRaw : []
        dispatch({
          type: 'applyTargetingFetch',
          targeting: nextTargeting,
          insights: payload?.insights ?? null,
        })
      })
      .catch((error) => {
        const message = error instanceof Error ? error.message : 'Failed to load audience targeting'

        if (message.includes('Unknown Meta API error') || message.includes('INTERNAL_ERROR')) {
          logError(new Error(message), 'AudienceControl:fetchTargeting:suppressedMeta')
        } else {
          notifyFailure({
            title: 'Error',
            message: message,
          })
        }
      })
      .finally(() => {
        dispatch({ type: 'setLoading', value: false })
      })
  }, [campaignId, canLoad, clientId, getTargeting, providerId, workspaceId])

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      void fetchTargeting()
    })

    return () => {
      cancelAnimationFrame(frame)
    }
  }, [fetchTargeting])

  const toggleSection = useCallback((section: string) => {
    dispatch({ type: 'toggleSection', section })
  }, [])

  const handleOpenBuilder = useCallback(() => {
    dispatch({ type: 'setBuilderOpen', value: true })
  }, [])

  const handleToggleEditing = useCallback((section: string) => {
    dispatch({ type: 'toggleEditing', section })
  }, [])

  const handleBuilderOpenChange = useCallback((value: boolean) => {
    dispatch({ type: 'setBuilderOpen', value })
  }, [])

  const handleSelectedTargetingIdChange = useCallback((value: string) => {
    dispatch({ type: 'setSelectedTargetingId', value })
  }, [])

  const visibleTargeting = useMemo(() => {
    if (targeting.length <= 1) return targeting
    if (selectedTargetingId === 'all') return targeting
    return targeting.filter((t) => t.entityId === selectedTargetingId)
  }, [selectedTargetingId, targeting])

  const locationMarkers: LocationMarker[] = useMemo(() => {
    const markers: LocationMarker[] = []
    visibleTargeting.forEach((t) => {
      t.locations.included.forEach((loc) => {
        const nameKey = loc.name.toLowerCase().trim()
        const coords = loc.lat && loc.lng
          ? { lat: loc.lat, lng: loc.lng }
          : LOCATION_COORDINATES[nameKey] || resolvedCoordinates[nameKey] || findLocationCoordinates(loc.name)

        if (coords) {
          markers.push({
            id: loc.id,
            name: loc.name,
            lat: coords.lat,
            lng: coords.lng,
            type: loc.type,
          })
        }
      })
    })
    return markers
  }, [resolvedCoordinates, visibleTargeting])

  const aggregatedData = useMemo(() => {
    const demographics = { ageRanges: new Set<string>(), genders: new Set<string>(), languages: new Set<string>() }
    const audiences = { included: new Map<string, { id: string; name: string; type: string }>(), excluded: new Map<string, { id: string; name: string }>() }
    const locations = { included: new Map<string, { id: string; name: string; type: string }>(), excluded: new Map<string, { id: string; name: string }>() }
    const interests = new Map<string, { id: string; name: string; category?: string }>()
    const keywords = new Map<string, { text: string; matchType?: string }>()
    const devices = new Set<string>()
    const placements = new Set<string>()
    const metaPlacements = {
      facebook: new Set<string>(),
      instagram: new Set<string>(),
      audienceNetwork: new Set<string>(),
      messenger: new Set<string>(),
    }
    const professional = { industries: new Map<string, { id: string; name: string }>(), jobTitles: new Map<string, { id: string; name: string }>() }

    visibleTargeting.forEach((t) => {
      t.demographics.ageRanges.forEach((a) => demographics.ageRanges.add(a))
      t.demographics.genders.forEach((g) => demographics.genders.add(g))
      t.demographics.languages.forEach((l) => demographics.languages.add(l))
      t.audiences.included.forEach((a) => audiences.included.set(a.id, a))
      t.audiences.excluded.forEach((a) => audiences.excluded.set(a.id, a))
      t.locations.included.forEach((l) => locations.included.set(l.id, l))
      t.locations.excluded.forEach((l) => locations.excluded.set(l.id, l))
      t.interests.forEach((i) => interests.set(i.id, i))
      t.keywords.forEach((k) => keywords.set(k.text, k))
      t.devices.forEach((d) => devices.add(d))
      t.placements.forEach((p) => placements.add(p))
      if (t.metaPlacements) {
        t.metaPlacements.facebook?.forEach((p) => metaPlacements.facebook.add(p))
        t.metaPlacements.instagram?.forEach((p) => metaPlacements.instagram.add(p))
        t.metaPlacements.audienceNetwork?.forEach((p) => metaPlacements.audienceNetwork.add(p))
        t.metaPlacements.messenger?.forEach((p) => metaPlacements.messenger.add(p))
      }
      if (t.professional) {
        t.professional.industries.forEach((i) => professional.industries.set(i.id, i))
        t.professional.jobTitles.forEach((j) => professional.jobTitles.set(j.id, j))
      }
    })

    return {
      demographics: {
        ageRanges: Array.from(demographics.ageRanges),
        genders: Array.from(demographics.genders),
        languages: Array.from(demographics.languages),
      },
      audiences: {
        included: Array.from(audiences.included.values()),
        excluded: Array.from(audiences.excluded.values()),
      },
      locations: {
        included: Array.from(locations.included.values()),
        excluded: Array.from(locations.excluded.values()),
      },
      interests: Array.from(interests.values()),
      keywords: Array.from(keywords.values()),
      devices: Array.from(devices),
      placements: Array.from(placements),
      metaPlacements: {
        facebook: Array.from(metaPlacements.facebook),
        instagram: Array.from(metaPlacements.instagram),
        audienceNetwork: Array.from(metaPlacements.audienceNetwork),
        messenger: Array.from(metaPlacements.messenger),
      },
      professional: {
        industries: Array.from(professional.industries.values()),
        jobTitles: Array.from(professional.jobTitles.values()),
      },
    }
  }, [visibleTargeting])

  const activeAdSetId = useMemo(() => {
    if (selectedTargetingId !== 'all') return selectedTargetingId
    return targeting[0]?.entityId
  }, [selectedTargetingId, targeting])

  const handlePersistInterests = useCallback(async () => {
    if (!canEditMetaTargeting || !workspaceId || !activeAdSetId) {
      toast({
        title: 'Select an ad set',
        description: 'Choose a single ad set before saving interest targeting.',
      })
      return
    }

    const nextInterests = draftInterests ?? aggregatedData.interests
    dispatch({ type: 'setSavingTargeting', value: true })
    try {
      const payload = buildMetaTargetingFromNormalized({
        demographics: aggregatedData.demographics,
        locations: {
          included: aggregatedData.locations.included,
          excluded: aggregatedData.locations.excluded.map((loc) => ({
            id: loc.id,
            name: loc.name,
            type: 'country',
          })),
        },
        interests: nextInterests,
      })
      await updateAdSetTargeting({
        workspaceId,
        providerId: 'facebook',
        clientId: clientId ?? null,
        adSetId: activeAdSetId,
        targeting: payload,
      })
      toast({ title: 'Targeting saved', description: 'Interests updated on the ad set in Meta.' })
      dispatch({ type: 'setDraftInterests', value: null })
      dispatch({ type: 'setEditingSection', value: null })
      await fetchTargeting()
    } catch (error) {
      logError(error, 'AudienceControlSection:saveTargeting')
      notifyFailure({ title: 'Could not save targeting', message: 'Check Meta permissions and try again.' })
    } finally {
      dispatch({ type: 'setSavingTargeting', value: false })
    }
  }, [
    activeAdSetId,
    aggregatedData.demographics,
    aggregatedData.interests,
    aggregatedData.locations,
    canEditMetaTargeting,
    clientId,
    draftInterests,
    fetchTargeting,
    updateAdSetTargeting,
    workspaceId,
  ])

  const handleAddInterestDraft = useCallback((interest: { id: string; name: string }) => {
    dispatch({
      type: 'updateDraftInterests',
      updater: (prev) => {
        const base = prev ?? aggregatedData.interests
        if (base.some((item) => item.id === interest.id || item.name === interest.name)) return base
        return [...base, interest]
      },
    })
  }, [aggregatedData.interests])

  const handleRemoveInterestDraft = useCallback((interestName: string) => {
    dispatch({
      type: 'updateDraftInterests',
      updater: (prev) => {
        const base = prev ?? aggregatedData.interests
        return base.filter((item) => item.name !== interestName)
      },
    })
  }, [aggregatedData.interests])

  const displayInterests = draftInterests ?? aggregatedData.interests

  const editorAggregatedData = useMemo(
    () => ({ ...aggregatedData, interests: displayInterests }),
    [aggregatedData, displayInterests],
  )

  const audienceStats = useMemo(
    () => [
      {
        label: 'Configs',
        value: insights?.totalEntities ?? targeting.length,
      },
      {
        label: 'Locations',
        value: aggregatedData.locations.included.length,
      },
      {
        label: 'Interests',
        value: aggregatedData.interests.length,
      },
      {
        label: 'Audiences',
        value: aggregatedData.audiences.included.length,
      },
    ],
    [
      aggregatedData.audiences.included.length,
      aggregatedData.interests.length,
      aggregatedData.locations.included.length,
      insights?.totalEntities,
      targeting.length,
    ],
  )

  const headerActionsProps = useMemo(
    () => ({
      loading,
      onOpenBuilder: handleOpenBuilder,
      onRefresh: fetchTargeting,
    }),
    [fetchTargeting, handleOpenBuilder, loading],
  )

  const interestSectionProps = useMemo<AudienceControlInterestEditorSectionProps>(
    () => ({
      aggregatedData: editorAggregatedData,
      expandedSections,
      toggleSection,
      editingSection,
      onToggleEditing: handleToggleEditing,
      canEditMetaTargeting,
      workspaceId,
      clientId,
      onAddInterest: canEditMetaTargeting ? handleAddInterestDraft : undefined,
      onRemoveInterest: canEditMetaTargeting ? handleRemoveInterestDraft : undefined,
      onSaveTargeting:
        canEditMetaTargeting && editingSection === 'interests' ? handlePersistInterests : undefined,
      savingTargeting,
    }),
    [
      canEditMetaTargeting,
      clientId,
      editingSection,
      editorAggregatedData,
      expandedSections,
      handleAddInterestDraft,
      handlePersistInterests,
      handleRemoveInterestDraft,
      handleToggleEditing,
      savingTargeting,
      toggleSection,
      workspaceId,
    ],
  )

  return {
    providerId,
    canLoad,
    loading,
    hasLoaded,
    targeting,
    insights,
    builderOpen,
    expandedSections,
    selectedTargetingId,
    editingSection,
    canEditMetaTargeting,
    workspaceId,
    clientId,
    aggregatedData,
    locationMarkers,
    geocodeFailedNames,
    audienceStats,
    headerActionsProps,
    interestSectionProps,
    handleBuilderOpenChange,
    handleSelectedTargetingIdChange,
    handleToggleEditing,
    toggleSection,
  }
}
