'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAction } from 'convex/react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  RefreshCw,
  Image,
  Video,
  FileText,
  Filter,
  Search,
  Layers,
  Play,
  Grid3X3,
  List,
  ChevronRight,
  Smartphone,
  MapPin
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { toast } from '@/components/ui/use-toast'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/auth-context'
import { adsAdMetricsApi, adsCreativesApi } from '@/lib/convex-api'

export type CampaignAd = {
  providerId: string
  creativeId: string
  adGroupId?: string
  campaignId: string
  campaignName?: string
  name?: string
  type: string
  status: string
  headlines?: string[]
  descriptions?: string[]
  imageUrl?: string
  videoUrl?: string
  landingPageUrl?: string
  callToAction?: string
  pageName?: string
  pageProfileImageUrl?: string
  metrics?: {
    spend: number
    impressions: number
    clicks: number
    conversions: number
    revenue: number
    ctr: number
    cpc: number
    roas: number
  }
}

type Summary = {
  total: number
  byType: Record<string, number>
  byStatus?: Record<string, number>
}

type Props = {
  providerId: string
  campaignId: string
  clientId?: string | null
  isPreviewMode?: boolean
}

type ViewMode = 'grid' | 'list'

function getCreativeTypeIcon(type: string, className?: string) {
  const lowerType = type.toLowerCase()
  if (lowerType.includes('video')) return <Video className={className || "h-4 w-4"} />
  if (lowerType.includes('image') || lowerType.includes('photo') || lowerType.includes('sponsored_status_update')) return <Image className={className || "h-4 w-4"} />
  if (lowerType.includes('text') || lowerType.includes('search')) return <FileText className={className || "h-4 w-4"} />
  if (lowerType.includes('app') || lowerType.includes('call') || lowerType.includes('sponsored_inmails')) return <Smartphone className={className || "h-4 w-4"} />
  if (lowerType.includes('hotel')) return <MapPin className={className || "h-4 w-4"} />
  return <Layers className={className || "h-4 w-4 text-muted-foreground/50"} />
}

function getStatusVariant(status: string): 'default' | 'secondary' | 'outline' | 'destructive' {
  const s = status.toLowerCase()
  if (s === 'enabled' || s === 'enable' || s === 'active') return 'default'
  if (s === 'paused' || s === 'disable') return 'secondary'
  if (s === 'deleted' || s === 'removed') return 'destructive'
  return 'outline'
}

export function CampaignAdsSection({ providerId, campaignId, clientId, isPreviewMode }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const workspaceId = user?.agencyId ? String(user.agencyId) : null

  const listCreatives = useAction(adsCreativesApi.listCreatives)
  const updateCreativeStatus = useAction(adsCreativesApi.updateCreativeStatus)
  const listAdMetrics = useAction(adsAdMetricsApi.listAdMetrics)
  const [ads, setAds] = useState<CampaignAd[]>([])
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState<Summary | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [hasLoaded, setHasLoaded] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [adMetrics, setAdMetrics] = useState<Record<string, any>>({})
  const [metricsLoading, setMetricsLoading] = useState(false)

  const canLoad = !isPreviewMode

  const fetchAds = useCallback(async () => {
    if (!canLoad) {
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      if (!workspaceId) {
        throw new Error('Sign in required')
      }

      const creatives = (await listCreatives({
        workspaceId,
        providerId: providerId as any,
        clientId: clientId ?? null,
        campaignId,
      })) as CampaignAd[]

      setAds(Array.isArray(creatives) ? creatives : [])
      setSummary(null)
      setHasLoaded(true)
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load ads',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [canLoad, campaignId, clientId, listCreatives, providerId, workspaceId])
 
  const fetchMetrics = useCallback(async () => {

    if (!canLoad) return
    setMetricsLoading(true)
    try {
      if (!workspaceId) {
        throw new Error('Sign in required')
      }

      const data = await listAdMetrics({
        workspaceId,
        providerId: providerId as any,
        clientId: clientId ?? null,
        campaignId,
        days: '30',
      })

      const metrics = Array.isArray((data as any)?.metrics) ? ((data as any).metrics as any[]) : []

      const aggregated: Record<string, any> = {}
      metrics.forEach((m: any) => {
        if (!aggregated[m.adId]) {
          aggregated[m.adId] = { spend: 0, impressions: 0, clicks: 0, conversions: 0, revenue: 0 }
        }
        aggregated[m.adId].spend += m.spend
        aggregated[m.adId].impressions += m.impressions
        aggregated[m.adId].clicks += m.clicks
        aggregated[m.adId].conversions += m.conversions
        aggregated[m.adId].revenue += m.revenue
      })
      setAdMetrics(aggregated)
    } catch (error) {
      console.error('[CampaignAdsSection] metrics error:', error)
    } finally {
      setMetricsLoading(false)
    }
  }, [canLoad, campaignId, clientId, listAdMetrics, providerId, workspaceId])
 
  useEffect(() => {

    void fetchAds()
    void fetchMetrics()
  }, [fetchAds, fetchMetrics])

  const uniqueTypes = useMemo(() => {
    const types = new Set(ads.map(ad => ad.type || 'Unknown'))
    return Array.from(types)
  }, [ads])

  const uniqueStatuses = useMemo(() => {
    const statuses = new Set(ads.map(ad => ad.status || 'Unknown'))
    return Array.from(statuses)
  }, [ads])

  const filteredAds = useMemo(() => {
    return ads.filter(ad => {
      const matchesSearch = !searchQuery ||
        (ad.name?.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (ad.headlines?.some((h: string) => h.toLowerCase().includes(searchQuery.toLowerCase())))
      const matchesType = typeFilter === 'all' || ad.type === typeFilter
      const matchesStatus = statusFilter === 'all' || ad.status === statusFilter
      return matchesSearch && matchesType && matchesStatus
    })
  }, [ads, searchQuery, typeFilter, statusFilter])

  const handleCreativeClick = (creative: CampaignAd) => {
    const params = new URLSearchParams(searchParams.toString())
    const cName = creative.name || creative.headlines?.[0] || creative.creativeId
    params.set('creativeName', cName)
    router.push(`/dashboard/ads/campaigns/${providerId}/${campaignId}/creative/${creative.creativeId}?${params.toString()}`)
  }

  const toggleAdStatus = async (ad: CampaignAd, newStatus: string) => {
    // Optimistic update
    const previousAds = [...ads]
    setAds(currentAds =>
      currentAds.map(a => a.creativeId === ad.creativeId ? { ...a, status: newStatus } : a)
    )

    try {
      if (!workspaceId) {
        throw new Error('Sign in required')
      }

      await updateCreativeStatus({
        workspaceId,
        providerId: providerId as any,
        clientId: clientId ?? null,
        creativeId: ad.creativeId,
        adGroupId: ad.adGroupId,
        status: newStatus as any,
      })

      toast({
        title: 'Status Updated',
        description: `Ad is now ${newStatus.toLowerCase()}`,
      })
    } catch (error) {
      // Revert on error
      setAds(previousAds)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update ad status',
        variant: 'destructive',
      })
    }
  }

  const summaryStats = useMemo(() => {
    if (!summary) return null
    const totalTypes = Object.keys(summary.byType).length
    const activeCount = summary.byStatus?.['ACTIVE'] ?? summary.byStatus?.['ENABLED'] ?? 0
    return { total: summary.total, totalTypes, activeCount }
  }, [summary])

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
              <Layers className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <CardTitle className="text-lg">Ad Creatives</CardTitle>
              <CardDescription>
                {isPreviewMode
                  ? 'Ads list is not available in preview mode.'
                  : loading
                    ? 'Loading creatives...'
                    : summaryStats
                      ? `${summaryStats.total} creatives`
                      : 'No creatives found'}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-lg border p-1">
              <Button
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                size="icon"
                className="h-7 w-7"
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                size="icon"
                className="h-7 w-7"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
            <Button variant="ghost" size="icon" onClick={fetchAds} disabled={!canLoad || loading}>
              <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {loading && !hasLoaded ? (
          <div className="space-y-4">
            <div className="flex gap-2">
              <Skeleton className="h-9 flex-1" />
              <Skeleton className="h-9 w-32" />
            </div>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="aspect-square rounded-lg" />
                ))}
              </div>
            ) : (
              <Skeleton className="h-64" />
            )}
          </div>
        ) : !canLoad ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-3">
              <Layers className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium">Preview Mode</p>
            <p className="text-xs text-muted-foreground mt-1">Enable live mode to view ad creatives</p>
          </div>
        ) : ads.length === 0 && hasLoaded ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-3">
              <FileText className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium">No Creatives Found</p>
            <p className="text-xs text-muted-foreground mt-1">This campaign doesn&apos;t have any ad creatives yet</p>
          </div>
        ) : (
          <>
            {/* Filters */}
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search creatives..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-[140px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {uniqueTypes.map(type => (
                    <SelectItem key={type} value={type} className="capitalize">
                      {type.toLowerCase().replace(/_/g, ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {uniqueStatuses.map(status => (
                    <SelectItem key={status} value={status} className="capitalize">
                      {status.toLowerCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {filteredAds.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <p className="text-sm text-muted-foreground">No creatives match your filters</p>
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => { setSearchQuery(''); setTypeFilter('all'); setStatusFilter('all'); }}
                >
                  Clear filters
                </Button>
              </div>
            ) : viewMode === 'grid' ? (
              <>
                {/* Grid View */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                  {filteredAds.map((ad) => (
                    <div
                      key={ad.creativeId}
                      role="button"
                      tabIndex={0}
                      onClick={() => handleCreativeClick(ad)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          handleCreativeClick(ad)
                        }
                      }}
                      className="group relative overflow-hidden rounded-lg border bg-card text-left transition-all hover:shadow-md hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 cursor-pointer"
                    >
                      {/* Thumbnail */}
                      <div className="aspect-square bg-muted relative overflow-hidden">
                        {ad.imageUrl ? (
                          <img
                            src={ad.imageUrl}
                            alt={ad.name || 'Creative preview'}
                            className="h-full w-full object-contain bg-muted/50 transition-transform group-hover:scale-105"
                            loading="lazy"
                            style={{ imageRendering: 'auto' }}
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.style.display = 'none'
                              const parent = target.parentElement
                              if (parent && !parent.querySelector('.fallback-icon')) {
                                const fallback = document.createElement('div')
                                fallback.className = 'fallback-icon flex items-center justify-center h-full'
                                fallback.innerHTML = '<svg class="h-10 w-10 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>'
                                parent.appendChild(fallback)
                              }
                            }}
                          />
                        ) : ad.videoUrl ? (
                          <div className="flex items-center justify-center h-full bg-muted">
                            <div className="flex flex-col items-center gap-1 text-muted-foreground">
                              <Play className="h-10 w-10" />
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <Layers className="h-10 w-10 text-muted-foreground/30" />
                          </div>
                        )}

                        {/* Video indicator overlay */}
                        {ad.videoUrl && ad.imageUrl && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90">
                              <Play className="h-6 w-6 text-black ml-0.5" />
                            </div>
                          </div>
                        )}

                        {/* Status toggle */}
                        <div className="absolute top-2 right-2" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-sm px-2 py-1 rounded-full border border-white/20">
                            <Switch
                              checked={ad.status.toUpperCase() === 'ACTIVE' || ad.status.toUpperCase() === 'ENABLED' || ad.status.toUpperCase() === 'ENABLE'}
                              onCheckedChange={(checked) => {
                                let nextStatus = ''
                                if (providerId === 'google') nextStatus = checked ? 'ENABLED' : 'PAUSED'
                                else if (providerId === 'tiktok') nextStatus = checked ? 'ENABLE' : 'DISABLE'
                                else nextStatus = checked ? 'ACTIVE' : 'PAUSED'
                                void toggleAdStatus(ad, nextStatus)
                              }}
                              className="h-3.5 w-7"
                            />
                            <span className="text-[10px] font-medium text-white uppercase tracking-wider">
                              {ad.status.toLowerCase()}
                            </span>
                          </div>
                        </div>

                        {/* Hover overlay */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <span className="text-xs font-medium text-white bg-black/60 px-2 py-1 rounded">View Details</span>
                        </div>
                      </div>

                      {/* Caption */}
                      <div className="p-3 bg-card flex flex-col gap-1.5 border-t">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground truncate max-w-[60%]">{ad.type}</span>
                          <Badge variant={getStatusVariant(ad.status)} className="h-4 px-1 text-[8px] font-bold">
                            {ad.status}
                          </Badge>
                        </div>
                        <h4 className="line-clamp-1 text-xs font-semibold">{ad.name || ad.headlines?.[0] || 'Ad'}</h4>

                        {adMetrics[ad.creativeId] && (
                          <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-1 pt-1.5 border-t border-muted">
                            <div className="flex flex-col">
                              <span className="text-[9px] text-muted-foreground uppercase leading-none mb-0.5">Spend</span>
                              <span className="text-[11px] font-mono font-bold leading-none">${adMetrics[ad.creativeId].spend.toFixed(2)}</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[9px] text-muted-foreground uppercase leading-none mb-0.5">Conv.</span>
                              <span className="text-[11px] font-mono font-bold leading-none">{adMetrics[ad.creativeId].conversions}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                {/* List View */}
                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-16">Preview</TableHead>
                        <TableHead>Creative Details</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Spend</TableHead>
                        <TableHead className="text-right">Clicks</TableHead>
                        <TableHead className="text-right">Conv.</TableHead>
                        <TableHead className="hidden lg:table-cell">Primary Text/Headline</TableHead>
                        <TableHead className="w-10"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAds.map((ad) => (
                        <TableRow
                          key={ad.creativeId}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => handleCreativeClick(ad)}
                        >
                          <TableCell>
                            <div className="h-14 w-14 rounded-lg overflow-hidden bg-muted flex items-center justify-center border">
                              {ad.imageUrl ? (
                                <img
                                  src={ad.imageUrl}
                                  alt=""
                                  className="h-full w-full object-contain"
                                  loading="lazy"
                                  style={{ imageRendering: 'auto' }}
                                />
                              ) : ad.videoUrl ? (
                                <Play className="h-5 w-5 text-muted-foreground" />
                              ) : (
                                getCreativeTypeIcon(ad.type, "h-5 w-5 text-muted-foreground")
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-0.5">
                              <p className="font-medium truncate max-w-[240px]">
                                {ad.name || ad.headlines?.[0] || ad.descriptions?.[0] || ad.creativeId}
                              </p>
                              <div className="flex items-center gap-1">
                                <span className="text-[9px] font-bold uppercase text-muted-foreground">{ad.type}</span>
                                {ad.pageName && (
                                  <>
                                    <span className="text-[9px] text-muted-foreground">•</span>
                                    <span className="text-[9px] font-medium text-muted-foreground">{ad.pageName}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={ad.status.toUpperCase() === 'ACTIVE' || ad.status.toUpperCase() === 'ENABLED' || ad.status.toUpperCase() === 'ENABLE'}
                                onCheckedChange={(checked) => {
                                  let nextStatus = ''
                                  if (providerId === 'google') nextStatus = checked ? 'ENABLED' : 'PAUSED'
                                  else if (providerId === 'tiktok') nextStatus = checked ? 'ENABLE' : 'DISABLE'
                                  else nextStatus = checked ? 'ACTIVE' : 'PAUSED'
                                  void toggleAdStatus(ad, nextStatus)
                                }}
                              />
                              <span className="text-xs font-medium capitalize w-14">
                                {ad.status.toLowerCase()}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-mono text-xs">
                            {adMetrics[ad.creativeId] ? `$${adMetrics[ad.creativeId].spend.toFixed(2)}` : '—'}
                          </TableCell>
                          <TableCell className="text-right font-mono text-xs">
                            {adMetrics[ad.creativeId] ? adMetrics[ad.creativeId].clicks.toLocaleString() : '—'}
                          </TableCell>
                          <TableCell className="text-right font-mono text-xs">
                            {adMetrics[ad.creativeId] ? adMetrics[ad.creativeId].conversions.toLocaleString() : '—'}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                              {ad.headlines?.[0] || ad.descriptions?.[0] || '-'}
                            </p>
                          </TableCell>
                          <TableCell>
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}

            <div className="text-xs text-muted-foreground text-center">
              Showing {filteredAds.length} of {ads.length} creatives
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
