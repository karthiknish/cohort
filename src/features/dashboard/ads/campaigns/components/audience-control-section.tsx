'use client'

import { notifyFailure } from '@/lib/notifications'
import { useCallback, useEffect, useMemo, useReducer } from 'react'
import { AlertTriangle, MapPin, RefreshCw, Sparkles, Target, Users, Plus } from 'lucide-react'

import { useAction } from 'convex/react'

import { adsAdSetsApi, adsTargetingApi } from '@/lib/convex-api'
import { buildMetaTargetingFromNormalized } from '@/services/integrations/meta-ads/meta-targeting-serialize'
import { logError } from '@/lib/convex-errors'
import { useAuth } from '@/shared/contexts/auth-context'

import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/alert'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { ADS_PAGE_THEME } from '@/features/dashboard/ads/components/ads-page-theme'
import { CardContent } from '@/shared/ui/card'
import { MotionCard } from '@/shared/ui/motion-primitives'
import { CampaignControlHeader } from './campaign-control-header'
import { Skeleton } from '@/shared/ui/skeleton'
import { toast } from '@/shared/ui/use-toast'
import { cn } from '@/lib/utils'
import { AudienceBuilderDialog } from '@/features/dashboard/ads/components/audience-builder-dialog'
import { useGeocodeResolveBatch } from '@/shared/hooks/use-geocode'
import type { LocationMarker } from '@/shared/ui/location-map'

import { AudienceDisplaySection } from './audience-display-section'
import { AudienceEditorSection } from './audience-editor-section'
import { DemographicSection } from './demographic-section'
import { LocationTargetingSection } from './location-targeting-section'
import type { TargetingData } from './audience-control-types'
import { findLocationCoordinates, LOCATION_COORDINATES } from './audience-control-utils'
import { toAdsProviderId } from '@/features/dashboard/ads/components/utils'

type Insights = {
  totalEntities: number
  demographicCoverage: {
    hasAgeTargeting: boolean
    hasGenderTargeting: boolean
    hasLocationTargeting: boolean
  }
  audienceStats: {
    totalAudiences: number
    hasCustomAudiences: boolean
    hasRemarketingLists: boolean
  }
  interestStats: {
    totalInterests: number
    totalKeywords: number
  }
}

type Props = {
  providerId: string
  campaignId: string
  clientId?: string | null
  isPreviewMode?: boolean
}

type AudienceTargetingResponse = {
  targeting?: TargetingData[]
  insights?: Insights | null
}

type AudienceControlSectionState = {
  targeting: TargetingData[]
  insights: Insights | null
  loading: boolean
  expandedSections: Set<string>
  builderOpen: boolean
  hasLoaded: boolean
  editingSection: string | null
  selectedTargetingId: string
  draftInterests: Array<{ id: string; name: string }> | null
  savingTargeting: boolean
}

type AudienceControlSectionAction =
  | { type: 'setTargeting'; value: TargetingData[] }
  | { type: 'setInsights'; value: Insights | null }
  | { type: 'setLoading'; value: boolean }
  | { type: 'setExpandedSections'; value: Set<string> }
  | { type: 'toggleSection'; section: string }
  | { type: 'setBuilderOpen'; value: boolean }
  | { type: 'setHasLoaded'; value: boolean }
  | { type: 'setEditingSection'; value: string | null }
  | { type: 'toggleEditing'; section: string }
  | { type: 'setSelectedTargetingId'; value: string }
  | { type: 'setDraftInterests'; value: Array<{ id: string; name: string }> | null }
  | { type: 'updateDraftInterests'; updater: (prev: Array<{ id: string; name: string }> | null) => Array<{ id: string; name: string }> | null }
  | { type: 'setSavingTargeting'; value: boolean }
  | { type: 'applyTargetingFetch'; targeting: TargetingData[]; insights: Insights | null }

const DEFAULT_EXPANDED_SECTIONS = new Set(['demographics', 'locations', 'interests', 'placements'])

function createInitialAudienceControlSectionState(): AudienceControlSectionState {
  return {
    targeting: [],
    insights: null,
    loading: true,
    expandedSections: DEFAULT_EXPANDED_SECTIONS,
    builderOpen: false,
    hasLoaded: false,
    editingSection: null,
    selectedTargetingId: 'all',
    draftInterests: null,
    savingTargeting: false,
  }
}

function audienceControlSectionReducer(
  state: AudienceControlSectionState,
  action: AudienceControlSectionAction,
): AudienceControlSectionState {
  switch (action.type) {
    case 'setTargeting':
      return { ...state, targeting: action.value }
    case 'setInsights':
      return { ...state, insights: action.value }
    case 'setLoading':
      return { ...state, loading: action.value }
    case 'setExpandedSections':
      return { ...state, expandedSections: action.value }
    case 'toggleSection': {
      const next = new Set(state.expandedSections)
      if (next.has(action.section)) {
        next.delete(action.section)
      } else {
        next.add(action.section)
      }
      return { ...state, expandedSections: next }
    }
    case 'setBuilderOpen':
      return { ...state, builderOpen: action.value }
    case 'setHasLoaded':
      return { ...state, hasLoaded: action.value }
    case 'setEditingSection':
      return { ...state, editingSection: action.value }
    case 'toggleEditing':
      return {
        ...state,
        editingSection: state.editingSection === action.section ? null : action.section,
      }
    case 'setSelectedTargetingId':
      return { ...state, selectedTargetingId: action.value }
    case 'setDraftInterests':
      return { ...state, draftInterests: action.value }
    case 'updateDraftInterests':
      return { ...state, draftInterests: action.updater(state.draftInterests) }
    case 'setSavingTargeting':
      return { ...state, savingTargeting: action.value }
    case 'applyTargetingFetch': {
      const nextTargeting = action.targeting
      let selectedTargetingId = state.selectedTargetingId
      if (nextTargeting.length <= 1) {
        selectedTargetingId = 'all'
      } else if (selectedTargetingId === 'all') {
        const firstId = typeof nextTargeting[0]?.entityId === 'string' ? nextTargeting[0].entityId : null
        selectedTargetingId = firstId ?? selectedTargetingId
      }
      return {
        ...state,
        targeting: nextTargeting,
        insights: action.insights,
        hasLoaded: true,
        selectedTargetingId,
      }
    }
    default:
      return state
  }
}

export function AudienceControlSection({ providerId, campaignId, clientId, isPreviewMode }: Props) {
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

  // Collect unknown location names for batch geocoding
  const unknownLocationNames = useMemo(() => {
    const unknowns: string[] = []
    targeting.forEach(t => {
      t.locations.included.forEach(loc => {
        const name = loc.name.toLowerCase().trim()
        // Only add if not in static coordinates and doesn't already have lat/lng
        if (!LOCATION_COORDINATES[name] && !findLocationCoordinates(loc.name) && !(loc.lat && loc.lng)) {
          unknowns.push(loc.name)
        }
      })
    })
    return [...new Set(unknowns)] // Deduplicate
  }, [targeting])

  // Use TanStack Query for batch geocoding unknown locations
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

        // Suppress toasts for non-actionable errors
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
        t.metaPlacements.facebook?.forEach(p => metaPlacements.facebook.add(p))
        t.metaPlacements.instagram?.forEach(p => metaPlacements.instagram.add(p))
        t.metaPlacements.audienceNetwork?.forEach(p => metaPlacements.audienceNetwork.add(p))
        t.metaPlacements.messenger?.forEach(p => metaPlacements.messenger.add(p))
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

  const audienceEditorSection = useMemo(() => (
    <AudienceEditorSection
      aggregatedData={editorAggregatedData}
      expandedSections={expandedSections}
      toggleSection={toggleSection}
      editingSection={editingSection}
      onToggleEditing={handleToggleEditing}
      canEditTargeting={canEditMetaTargeting}
      workspaceId={workspaceId}
      clientId={clientId}
      onAddInterest={canEditMetaTargeting ? handleAddInterestDraft : undefined}
      onRemoveInterest={canEditMetaTargeting ? handleRemoveInterestDraft : undefined}
      onSaveTargeting={canEditMetaTargeting && editingSection === 'interests' ? handlePersistInterests : undefined}
      savingTargeting={savingTargeting}
    />
  ), [
    editorAggregatedData,
    canEditMetaTargeting,
    clientId,
    editingSection,
    expandedSections,
    handleAddInterestDraft,
    handlePersistInterests,
    handleRemoveInterestDraft,
    handleToggleEditing,
    savingTargeting,
    toggleSection,
    workspaceId,
  ])

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

  const headerActions = (
    <>
      <Button variant="outline" size="sm" className="gap-1.5" onClick={handleOpenBuilder}>
        <Plus className="size-4" aria-hidden />
        Create audience
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="size-9"
        onClick={fetchTargeting}
        disabled={loading}
        aria-label="Refresh audience targeting"
      >
        <RefreshCw className={cn('size-4', loading && 'animate-spin')} aria-hidden />
      </Button>
    </>
  )

  if (loading && !hasLoaded) {
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

  if (!canLoad) {
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

  if (targeting.length === 0 && hasLoaded) {
    return (
      <MotionCard className={ADS_PAGE_THEME.surfaceCard}>
        <CampaignControlHeader
          icon={Target}
          title="Audience targeting"
          description="No targeting data returned for this campaign yet."
          actions={headerActions}
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
          <AudienceBuilderDialog isOpen={builderOpen} onOpenChange={handleBuilderOpenChange} providerId={providerId} />
        </CardContent>
      </MotionCard>
    )
  }

  return (
    <MotionCard className={ADS_PAGE_THEME.surfaceCard}>
      <CampaignControlHeader
        icon={Target}
        title="Audience targeting"
        description={
          <>
            {insights?.totalEntities ?? targeting.length} configuration
            {(insights?.totalEntities ?? targeting.length) === 1 ? '' : 's'} across ad sets — map,
            demographics, and segments in one view.
          </>
        }
        actions={headerActions}
        stats={audienceStats}
      />

      <CardContent className="space-y-6 pt-6">
        {geocodeFailedNames.length > 0 ? (
          <Alert variant="default" className="border-amber-500/40 bg-amber-500/10">
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
            onTargetingChange={handleSelectedTargetingIdChange}
            editingSection={editingSection}
              onToggleEditing={handleToggleEditing}
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
              toggleSection={toggleSection}
            />
            <AudienceDisplaySection
              aggregatedData={aggregatedData}
              expandedSections={expandedSections}
              toggleSection={toggleSection}
                interestSection={audienceEditorSection}
            />
          </div>
        </div>

        {aggregatedData.locations.excluded.length > 0 ? (
          <div className="rounded-2xl border border-destructive/20 bg-destructive/[0.04] px-5 py-4">
            <div className="mb-3 flex items-center gap-2">
              <MapPin className="size-4 text-destructive" aria-hidden />
              <span className="text-sm font-medium text-foreground">Excluded locations</span>
              <Badge variant="outline" className="border-destructive/30 text-xs text-destructive">
                {aggregatedData.locations.excluded.length}
              </Badge>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {aggregatedData.locations.excluded.map((loc) => (
                <Badge key={loc.id} variant="destructive" className="text-xs">
                  {loc.name}
                </Badge>
              ))}
            </div>
          </div>
        ) : null}
      </CardContent>

      <AudienceBuilderDialog isOpen={builderOpen} onOpenChange={handleBuilderOpenChange} providerId={providerId} />
    </MotionCard>
  )
}
