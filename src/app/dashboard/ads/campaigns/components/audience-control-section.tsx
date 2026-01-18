'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { RefreshCw, Target, Users, Plus } from 'lucide-react'

import { useAction } from 'convex/react'

import { adsTargetingApi } from '@/lib/convex-api'
import { useAuth } from '@/contexts/auth-context'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'
import { AudienceBuilderDialog } from '@/app/dashboard/ads/components/audience-builder-dialog'
import { useGeocodeResolveBatch } from '@/hooks/use-geocode'
import type { LocationMarker } from '@/components/ui/location-map'

import { AudienceDisplaySection } from './audience-display-section'
import { AudienceEditorSection } from './audience-editor-section'
import { DemographicSection } from './demographic-section'
import { LocationTargetingSection } from './location-targeting-section'
import type { AggregatedTargetingData, TargetingData } from './audience-control-types'
import { findLocationCoordinates, LOCATION_COORDINATES } from './audience-control-utils'

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

export function AudienceControlSection({ providerId, campaignId, clientId, isPreviewMode }: Props) {
  const { user } = useAuth()

  const getTargeting = useAction(adsTargetingApi.getTargeting)

  const [targeting, setTargeting] = useState<TargetingData[]>([])
  const [insights, setInsights] = useState<Insights | null>(null)
  const [loading, setLoading] = useState(true)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['demographics', 'locations', 'interests', 'placements']))
  const [builderOpen, setBuilderOpen] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)
  const [editingSection, setEditingSection] = useState<string | null>(null)
  const [selectedTargetingId, setSelectedTargetingId] = useState<string>('all')

  const canLoad = !isPreviewMode

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
  const { data: resolvedCoordinates = {} } = useGeocodeResolveBatch(unknownLocationNames, {
    enabled: unknownLocationNames.length > 0 && hasLoaded,
  })

  const fetchTargeting = useCallback(async () => {
    if (!canLoad) {
      setLoading(false)
      return
    }

    const workspaceId = user?.agencyId ? String(user.agencyId) : null
    if (!workspaceId) {
      toast({
        title: 'Error',
        description: 'Missing workspace id',
        variant: 'destructive',
      })
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const data = await getTargeting({
        workspaceId,
        providerId: providerId as any,
        clientId: clientId ?? null,
        campaignId,
      })

       const nextTargetingRaw = (data as any)?.targeting
       const nextTargeting = Array.isArray(nextTargetingRaw) ? nextTargetingRaw : []
       setTargeting(nextTargeting)
      setInsights(((data as any)?.insights ?? null) as Insights | null)
      setHasLoaded(true)

      if (nextTargeting.length <= 1) {
        setSelectedTargetingId('all')
      } else if (selectedTargetingId === 'all') {
        const firstId = typeof nextTargeting[0]?.entityId === 'string' ? nextTargeting[0].entityId : null
        if (firstId) setSelectedTargetingId(firstId)
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load audience targeting'

      // Suppress toasts for non-actionable errors
      if (message.includes('Unknown Meta API error') || message.includes('INTERNAL_ERROR')) {
        // Silent failure - don't show toast for unknown errors
        console.warn('Meta API error (suppressed):', message)
      } else {
        toast({
          title: 'Error',
          description: message,
          variant: 'destructive',
        })
      }
    } finally {
      setLoading(false)
    }
  }, [campaignId, canLoad, clientId, getTargeting, providerId, selectedTargetingId, user?.agencyId])

  useEffect(() => {
    void fetchTargeting()
  }, [fetchTargeting])

  const toggleSection = (section: string) => {
    const next = new Set(expandedSections)
    if (next.has(section)) {
      next.delete(section)
    } else {
      next.add(section)
    }
    setExpandedSections(next)
  }

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

  if (loading && !hasLoaded) {
    return (
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-60" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Skeleton className="h-[300px] rounded-lg" />
            <div className="space-y-3">
              <Skeleton className="h-16" />
              <Skeleton className="h-16" />
              <Skeleton className="h-16" />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!canLoad) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
            <Target className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium">Preview Mode</p>
          <p className="text-xs text-muted-foreground mt-1">Enable live mode to view audience targeting</p>
        </CardContent>
      </Card>
    )
  }

  if (targeting.length === 0 && hasLoaded) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
            <Users className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium">No Targeting Data</p>
          <p className="text-xs text-muted-foreground mt-1 mb-4">Create an audience to start targeting</p>
          <Button variant="outline" onClick={() => setBuilderOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Audience
          </Button>
          <AudienceBuilderDialog isOpen={builderOpen} onOpenChange={setBuilderOpen} providerId={providerId} />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
              <Target className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <CardTitle className="text-lg">Audience Targeting</CardTitle>
              <CardDescription>
                {insights?.totalEntities || targeting.length} targeting configurations
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setBuilderOpen(true)}
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Create Audience
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={fetchTargeting}
              disabled={loading}
            >
              <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <LocationTargetingSection
            targeting={targeting}
            aggregatedData={aggregatedData}
            locationMarkers={locationMarkers}
            selectedTargetingId={selectedTargetingId}
            onTargetingChange={setSelectedTargetingId}
            editingSection={editingSection}
            onToggleEditing={(section) =>
              setEditingSection(editingSection === section ? null : section)
            }
          />

          <div className="space-y-3">
            <DemographicSection
              aggregatedData={aggregatedData}
              expandedSections={expandedSections}
              toggleSection={toggleSection}
            />
            <AudienceDisplaySection
              aggregatedData={aggregatedData}
              expandedSections={expandedSections}
              toggleSection={toggleSection}
              interestSection={(
                <AudienceEditorSection
                  aggregatedData={aggregatedData}
                  expandedSections={expandedSections}
                  toggleSection={toggleSection}
                  editingSection={editingSection}
                  onToggleEditing={(section) =>
                    setEditingSection(editingSection === section ? null : section)
                  }
                />
              )}
            />
          </div>
        </div>

        {aggregatedData.locations.excluded.length > 0 && (
          <div className="pt-4 border-t">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-muted-foreground">Excluded Locations</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {aggregatedData.locations.excluded.map((loc) => (
                <Badge key={loc.id} variant="destructive" className="text-xs">
                  {loc.name}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>

      <AudienceBuilderDialog isOpen={builderOpen} onOpenChange={setBuilderOpen} providerId={providerId} />
    </Card>
  )
}
