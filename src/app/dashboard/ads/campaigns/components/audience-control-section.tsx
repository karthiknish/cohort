'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  RefreshCw,
  Target,
  Users,
  MapPin,
  Briefcase,
  Globe,
  Smartphone,
  Heart,
  Tag,
  UserCheck,
  Plus,
  ChevronDown,
  Edit2,
  X,
  Check,
  Trash2,
  ZoomIn,
  Facebook,
  Instagram,
  MessageCircle,
  Zap
} from 'lucide-react'

import { useAction } from 'convex/react'

import { adsTargetingApi } from '@/lib/convex-api'
import { useAuth } from '@/contexts/auth-context'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { toast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'
import { AudienceBuilderDialog } from '@/app/dashboard/ads/components/audience-builder-dialog'
import { LocationMap, type LocationMarker } from '@/components/ui/location-map'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useGeocodeResolveBatch } from '@/hooks/use-geocode'

type TargetingData = {
  providerId: string
  entityId: string
  entityName?: string
  entityType: 'adGroup' | 'campaign'
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
    included: Array<{ id: string; name: string; type: string; lat?: number; lng?: number }>
    excluded: Array<{ id: string; name: string }>
  }
  interests: Array<{ id: string; name: string; category?: string }>
  keywords: Array<{ text: string; matchType?: string }>
  devices: string[]
  placements: string[]
  professional?: {
    industries: Array<{ id: string; name: string }>
    jobTitles: Array<{ id: string; name: string }>
    companySizes: string[]
    seniorities: string[]
  }
  metaPlacements?: {
    facebook?: string[]
    instagram?: string[]
    audienceNetwork?: string[]
    messenger?: string[]
  }
}

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

function formatAgeRange(range: string) {
  return range.replace(/_/g, '-').replace('AGE', '').replace('RANGE', '').trim()
}

const LOCATION_COORDINATES: Record<string, { lat: number; lng: number }> = {
  'united states': { lat: 39.8283, lng: -98.5795 },
  'usa': { lat: 39.8283, lng: -98.5795 },
  'us': { lat: 39.8283, lng: -98.5795 },
  'united kingdom': { lat: 55.3781, lng: -3.436 },
  'uk': { lat: 55.3781, lng: -3.436 },
  'great britain': { lat: 55.3781, lng: -3.436 },
  'canada': { lat: 56.1304, lng: -106.3468 },
  'australia': { lat: -25.2744, lng: 133.7751 },
  'germany': { lat: 51.1657, lng: 10.4515 },
  'france': { lat: 46.2276, lng: 2.2137 },
  'spain': { lat: 40.4637, lng: -3.7492 },
  'italy': { lat: 41.8719, lng: 12.5674 },
  'india': { lat: 20.5937, lng: 78.9629 },
  'japan': { lat: 36.2048, lng: 138.2529 },
  'brazil': { lat: -14.235, lng: -51.9253 },
  'mexico': { lat: 23.6345, lng: -102.5528 },
  'china': { lat: 35.8617, lng: 104.1954 },
  'new york': { lat: 40.7128, lng: -74.006 },
  'los angeles': { lat: 34.0522, lng: -118.2437 },
  'london': { lat: 51.5074, lng: -0.1278 },
  'paris': { lat: 48.8566, lng: 2.3522 },
  'tokyo': { lat: 35.6762, lng: 139.6503 },
  'sydney': { lat: -33.8688, lng: 151.2093 },
  'berlin': { lat: 52.52, lng: 13.405 },
  'singapore': { lat: 1.3521, lng: 103.8198 },
  'dubai': { lat: 25.2048, lng: 55.2708 },
  'hong kong': { lat: 22.3193, lng: 114.1694 },
  'netherlands': { lat: 52.1326, lng: 5.2913 },
  'beijing': { lat: 39.9042, lng: 116.4074 },
  'sweden': { lat: 60.1282, lng: 18.6435 },
  'belgium': { lat: 50.5039, lng: 4.4699 },
  'austria': { lat: 47.5162, lng: 14.5501 },
  'denmark': { lat: 56.2639, lng: 9.5018 },
  'finland': { lat: 61.9241, lng: 25.7482 },
  'norway': { lat: 60.472, lng: 8.4689 },
  'portugal': { lat: 39.3999, lng: -8.2245 },
  'greece': { lat: 39.0742, lng: 21.8243 },
  'mexico city': { lat: 19.4326, lng: -99.1332 },
  'sao paulo': { lat: -23.5505, lng: -46.6333 },
  'buenos aires': { lat: -34.6037, lng: -58.3816 },
  'bangkok': { lat: 13.7563, lng: 100.5018 },
  'jakarta': { lat: -6.2088, lng: 106.8456 },
  'manila': { lat: 14.5995, lng: 120.9842 },
  'uae': { lat: 23.4241, lng: 53.8478 },
  'vietnam': { lat: 14.0583, lng: 108.2772 },
  'nigeria': { lat: 9.0820, lng: 8.6753 },
  'egypt': { lat: 26.8206, lng: 30.8025 },
  'saudi arabia': { lat: 23.8859, lng: 45.0792 },
  'south africa': { lat: -30.5595, lng: 22.9375 },
  'russia': { lat: 61.524, lng: 105.3188 },
  'south korea': { lat: 35.9078, lng: 127.7669 },
  'turkey': { lat: 38.9637, lng: 35.2433 },
  'colombia': { lat: 4.5709, lng: -74.2973 },
  'thailand': { lat: 15.87, lng: 100.9925 },
  'malaysia': { lat: 4.2105, lng: 101.9758 },
  'new zealand': { lat: -40.9006, lng: 174.886 },
  'liverpool': { lat: 53.4084, lng: -2.9916 },
  'manchester': { lat: 53.4808, lng: -2.2426 },
  'birmingham': { lat: 52.4862, lng: -1.8904 },
}

function findLocationCoordinates(name: string): { lat: number; lng: number } | null {
  const normalizedName = name.toLowerCase().trim()

  if (LOCATION_COORDINATES[normalizedName]) {
    return LOCATION_COORDINATES[normalizedName]
  }

  // Common abbreviation mappings
  const commonMaps: Record<string, string> = {
    'emirates': 'uae',
    'united arab emirates': 'uae',
    'kingdom of saudi arabia': 'saudi arabia',
    'republic of korea': 'south korea',
    'korea, south': 'south korea',
    'british': 'united kingdom',
    'england': 'united kingdom',
  }

  const mapped = commonMaps[normalizedName]
  if (mapped && LOCATION_COORDINATES[mapped]) {
    return LOCATION_COORDINATES[mapped]
  }

  for (const [key, coords] of Object.entries(LOCATION_COORDINATES)) {
    if (normalizedName.includes(key) || key.includes(normalizedName)) {
      return coords
    }
  }

  return null
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
  const [newInterest, setNewInterest] = useState('')
  const [selectedLocation, setSelectedLocation] = useState<LocationMarker | null>(null)
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
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load audience targeting',
        variant: 'destructive',
      })
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
          {/* Map Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Target Locations</span>
              {targeting.length > 1 && (
                <Select value={selectedTargetingId} onValueChange={setSelectedTargetingId}>
                  <SelectTrigger className="h-8 w-[220px]">
                    <SelectValue placeholder="Select ad set" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All ad sets</SelectItem>
                    {Array.isArray(targeting)
                      ? targeting.map((t) => (
                          <SelectItem key={t.entityId} value={t.entityId}>
                            {t.entityName ?? t.entityId}
                          </SelectItem>
                        ))
                      : null}
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
                      onClick={() => setEditingSection(editingSection === 'locations' ? null : 'locations')}
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
                      "text-xs cursor-pointer transition-colors",
                      selectedLocation?.id === loc.id && "ring-2 ring-primary"
                    )}
                    onClick={() => {
                      const marker = locationMarkers.find(m => m.id === loc.id)
                      if (marker) setSelectedLocation(marker)
                    }}
                  >
                    <MapPin className="h-3 w-3 mr-1" />
                    {loc.name}
                    {editingSection === 'locations' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
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

          {/* Targeting Details */}
          <div className="space-y-3">
            {/* Demographics */}
            {(aggregatedData.demographics.ageRanges.length > 0 || aggregatedData.demographics.genders.length > 0) && (
              <Collapsible
                open={expandedSections.has('demographics')}
                onOpenChange={() => toggleSection('demographics')}
              >
                <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Demographics</span>
                  </div>
                  <ChevronDown className={cn(
                    "h-4 w-4 text-muted-foreground transition-transform",
                    expandedSections.has('demographics') && "rotate-180"
                  )} />
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-2">
                  <div className="flex flex-wrap gap-1.5 p-3 rounded-lg border bg-muted/20">
                    {aggregatedData.demographics.ageRanges.map((age, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {formatAgeRange(age)}
                      </Badge>
                    ))}
                    {aggregatedData.demographics.genders.map((g, i) => (
                      <Badge key={i} variant="outline" className="text-xs capitalize">
                        {g.toLowerCase()}
                      </Badge>
                    ))}
                    {aggregatedData.demographics.languages.map((lang, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {lang}
                      </Badge>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}

            {/* Audiences */}
            {aggregatedData.audiences.included.length > 0 && (
              <Collapsible
                open={expandedSections.has('audiences')}
                onOpenChange={() => toggleSection('audiences')}
              >
                <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Audiences</span>
                    <Badge variant="secondary" className="text-xs">
                      {aggregatedData.audiences.included.length}
                    </Badge>
                  </div>
                  <ChevronDown className={cn(
                    "h-4 w-4 text-muted-foreground transition-transform",
                    expandedSections.has('audiences') && "rotate-180"
                  )} />
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-2">
                  <div className="flex flex-wrap gap-1.5 p-3 rounded-lg border bg-muted/20">
                    {aggregatedData.audiences.included.map((aud) => (
                      <Badge key={aud.id} variant="secondary" className="text-xs">
                        {aud.name}
                      </Badge>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}

            {/* Interests */}
            <Collapsible
              open={expandedSections.has('interests')}
              onOpenChange={() => toggleSection('interests')}
            >
              <div className="flex w-full items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors">
                <CollapsibleTrigger asChild>
                  <div className="flex flex-1 items-center gap-2 cursor-pointer">
                    <Heart className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Interests</span>
                    <Badge variant="secondary" className="text-xs">
                      {aggregatedData.interests.length}
                    </Badge>
                  </div>
                </CollapsibleTrigger>
                <div className="flex items-center gap-1">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={(e) => {
                            e.stopPropagation()
                            setEditingSection(editingSection === 'interests' ? null : 'interests')
                          }}
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Edit interests</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                      <ChevronDown className={cn(
                        "h-4 w-4 text-muted-foreground transition-transform",
                        expandedSections.has('interests') && "rotate-180"
                      )} />
                    </Button>
                  </CollapsibleTrigger>
                </div>
              </div>
              <CollapsibleContent className="pt-2">
                <div className="p-3 rounded-lg border bg-muted/20 space-y-3">
                  {editingSection === 'interests' && (
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add new interest..."
                        value={newInterest}
                        onChange={(e) => setNewInterest(e.target.value)}
                        className="flex-1 h-8 text-sm"
                      />
                      <Button
                        size="sm"
                        className="h-8"
                        onClick={() => {
                          if (newInterest.trim()) {
                            toast({
                              title: 'Interest would be added',
                              description: `"${newInterest}" - Requires API integration`,
                            })
                            setNewInterest('')
                          }
                        }}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  {aggregatedData.interests.length > 0 ? (
                    <>
                      {/* Group interests by category */}
                      {(() => {
                        const categorized = aggregatedData.interests.reduce((acc, int) => {
                          const cat = int.category || 'General'
                          if (!acc[cat]) acc[cat] = []
                          acc[cat].push(int)
                          return acc
                        }, {} as Record<string, typeof aggregatedData.interests>)

                        const categories = Object.keys(categorized).sort((a, b) => {
                          if (a === 'interest') return -1
                          if (b === 'interest') return 1
                          if (a === 'behavior') return -1
                          if (b === 'behavior') return 1
                          return a.localeCompare(b)
                        })

                        if (categories.length === 1 && (categories[0] === 'General' || categories[0] === 'interest')) {
                          return (
                            <div className="flex flex-wrap gap-1.5">
                              {aggregatedData.interests.map((int) => (
                                <Badge key={int.id} variant="outline" className="text-xs group">
                                  <Heart className="h-3 w-3 mr-1 text-pink-500" />
                                  {int.name}
                                  {editingSection === 'interests' && (
                                    <button
                                      onClick={() => {
                                        toast({
                                          title: 'Interest would be removed',
                                          description: `"${int.name}" removal requires API integration`,
                                        })
                                      }}
                                      className="ml-1 opacity-0 group-hover:opacity-100 hover:text-destructive transition-opacity"
                                    >
                                      <X className="h-3 w-3" />
                                    </button>
                                  )}
                                </Badge>
                              ))}
                            </div>
                          )
                        }

                        return (
                          <div className="space-y-2">
                            {categories.map((category) => (
                              <div key={category}>
                                <p className="text-xs font-medium text-muted-foreground mb-1.5">{category}</p>
                                <div className="flex flex-wrap gap-1.5">
                                  {categorized[category].map((int) => (
                                    <Badge key={int.id} variant="outline" className="text-xs group">
                                      <Heart className="h-3 w-3 mr-1 text-pink-500" />
                                      {int.name}
                                      {editingSection === 'interests' && (
                                        <button
                                          onClick={() => {
                                            toast({
                                              title: 'Interest would be removed',
                                              description: `"${int.name}" removal requires API integration`,
                                            })
                                          }}
                                          className="ml-1 opacity-0 group-hover:opacity-100 hover:text-destructive transition-opacity"
                                        >
                                          <X className="h-3 w-3" />
                                        </button>
                                      )}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        )
                      })()}
                    </>
                  ) : (
                    <p className="text-xs text-muted-foreground text-center py-2">No interests configured. {editingSection === 'interests' && 'Add one above.'}</p>
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Keywords */}
            {aggregatedData.keywords.length > 0 && (
              <Collapsible
                open={expandedSections.has('keywords')}
                onOpenChange={() => toggleSection('keywords')}
              >
                <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Keywords</span>
                    <Badge variant="secondary" className="text-xs">
                      {aggregatedData.keywords.length}
                    </Badge>
                  </div>
                  <ChevronDown className={cn(
                    "h-4 w-4 text-muted-foreground transition-transform",
                    expandedSections.has('keywords') && "rotate-180"
                  )} />
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-2">
                  <div className="flex flex-wrap gap-1.5 p-3 rounded-lg border bg-muted/20">
                    {aggregatedData.keywords.map((kw, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {kw.text}
                        {kw.matchType && (
                          <span className="ml-1 opacity-60">({kw.matchType})</span>
                        )}
                      </Badge>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}

            {/* Devices */}
            {aggregatedData.devices.length > 0 && (
              <Collapsible
                open={expandedSections.has('devices')}
                onOpenChange={() => toggleSection('devices')}
              >
                <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Devices</span>
                    <Badge variant="secondary" className="text-xs">
                      {aggregatedData.devices.length}
                    </Badge>
                  </div>
                  <ChevronDown className={cn(
                    "h-4 w-4 text-muted-foreground transition-transform",
                    expandedSections.has('devices') && "rotate-180"
                  )} />
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-2">
                  <div className="flex flex-wrap gap-1.5 p-3 rounded-lg border bg-muted/20">
                    {aggregatedData.devices.map((device, i) => (
                      <Badge key={i} variant="outline" className="text-xs capitalize">
                        {device.toLowerCase()}
                      </Badge>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}

            {/* Placements */}
            {aggregatedData.placements.length > 0 && (
              <Collapsible
                open={expandedSections.has('placements')}
                onOpenChange={() => toggleSection('placements')}
              >
                <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Placements & Platforms</span>
                    <Badge variant="secondary" className="text-xs">
                      {aggregatedData.placements.length}
                    </Badge>
                  </div>
                  <ChevronDown className={cn(
                    "h-4 w-4 text-muted-foreground transition-transform",
                    expandedSections.has('placements') && "rotate-180"
                  )} />
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-2">
                  <div className="space-y-4 p-4 rounded-lg border bg-muted/20">
                    {/* Facebook */}
                    {aggregatedData.metaPlacements.facebook.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-blue-600">
                          <Facebook className="h-4 w-4" />
                          <span className="text-xs font-semibold uppercase tracking-wider">Facebook</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 pl-6">
                          {aggregatedData.metaPlacements.facebook.map((p, i) => (
                            <Badge key={i} variant="outline" className="text-[10px] capitalize bg-background/50 py-0.5 px-2">
                              {p.replace(/_/g, ' ')}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Instagram */}
                    {aggregatedData.metaPlacements.instagram.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-pink-600">
                          <Instagram className="h-4 w-4" />
                          <span className="text-xs font-semibold uppercase tracking-wider">Instagram</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 pl-6">
                          {aggregatedData.metaPlacements.instagram.map((p, i) => (
                            <Badge key={i} variant="outline" className="text-[10px] capitalize bg-background/50 py-0.5 px-2">
                              {p.replace(/_/g, ' ')}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Messenger */}
                    {aggregatedData.metaPlacements.messenger.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-blue-400">
                          <MessageCircle className="h-4 w-4" />
                          <span className="text-xs font-semibold uppercase tracking-wider">Messenger</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 pl-6">
                          {aggregatedData.metaPlacements.messenger.map((p, i) => (
                            <Badge key={i} variant="outline" className="text-[10px] capitalize bg-background/50 py-0.5 px-2">
                              {p.replace(/_/g, ' ')}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Audience Network */}
                    {aggregatedData.metaPlacements.audienceNetwork.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Zap className="h-4 w-4" />
                          <span className="text-xs font-semibold uppercase tracking-wider">Audience Network</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 pl-6">
                          {aggregatedData.metaPlacements.audienceNetwork.map((p, i) => (
                            <Badge key={i} variant="outline" className="text-[10px] capitalize bg-background/50 py-0.5 px-2">
                              {p.replace(/_/g, ' ')}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Fallback for other platforms */}
                    {aggregatedData.placements.filter(p =>
                      !['facebook', 'instagram', 'audience_network', 'messenger'].includes(p.toLowerCase())
                    ).length > 0 && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Globe className="h-4 w-4" />
                            <span className="text-xs font-semibold uppercase tracking-wider">Other Platforms</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5 pl-6">
                            {aggregatedData.placements.filter(p =>
                              !['facebook', 'instagram', 'audience_network', 'messenger'].includes(p.toLowerCase())
                            ).map((p, i) => (
                              <Badge key={i} variant="secondary" className="text-[10px] capitalize">
                                {p.replace(/_/g, ' ')}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}

            {/* Professional */}
            {(aggregatedData.professional.industries.length > 0 || aggregatedData.professional.jobTitles.length > 0) && (
              <Collapsible
                open={expandedSections.has('professional')}
                onOpenChange={() => toggleSection('professional')}
              >
                <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Professional</span>
                    <Badge variant="secondary" className="text-xs">
                      {aggregatedData.professional.industries.length + aggregatedData.professional.jobTitles.length}
                    </Badge>
                  </div>
                  <ChevronDown className={cn(
                    "h-4 w-4 text-muted-foreground transition-transform",
                    expandedSections.has('professional') && "rotate-180"
                  )} />
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-2 space-y-2">
                  {aggregatedData.professional.industries.length > 0 && (
                    <div className="p-3 rounded-lg border bg-muted/20">
                      <p className="text-xs text-muted-foreground mb-2">Industries</p>
                      <div className="flex flex-wrap gap-1.5">
                        {aggregatedData.professional.industries.map((ind) => (
                          <Badge key={ind.id} variant="outline" className="text-xs">
                            {ind.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {aggregatedData.professional.jobTitles.length > 0 && (
                    <div className="p-3 rounded-lg border bg-muted/20">
                      <p className="text-xs text-muted-foreground mb-2">Job Titles</p>
                      <div className="flex flex-wrap gap-1.5">
                        {aggregatedData.professional.jobTitles.map((job) => (
                          <Badge key={job.id} variant="outline" className="text-xs">
                            {job.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CollapsibleContent>
              </Collapsible>
            )}
          </div>
        </div>

        {/* Excluded Locations */}
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
