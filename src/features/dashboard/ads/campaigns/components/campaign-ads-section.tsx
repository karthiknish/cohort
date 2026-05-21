'use client'

import { notifyFailure } from '@/lib/notifications'
import { reportConvexFailure } from '@/lib/handle-convex-error'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAction } from 'convex/react'
import NextImage from 'next/image'
import { useRouter } from 'next/navigation'
import {
  RefreshCw,
  Image as ImageIcon,
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
  MapPin,
  Link2,
  ExternalLink,
} from 'lucide-react'

import { Button } from '@/shared/ui/button'
import { ADS_PAGE_THEME } from '@/features/dashboard/ads/components/ads-page-theme'
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { MotionCard } from '@/shared/ui/motion-primitives'
import { Badge } from '@/shared/ui/badge'
import { Input } from '@/shared/ui/input'
import { Skeleton } from '@/shared/ui/skeleton'
import { isPreviewModeEnabled, withPreviewModeSearchParamIfEnabled } from '@/lib/preview-data'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table'
import { toast } from '@/shared/ui/use-toast'
import { Switch } from '@/shared/ui/switch'
import { normalizeCurrencyCode } from '@/constants/currencies'
import { cn, formatCurrency } from '@/lib/utils'
import { resolveMetaSocialPermalink } from '@/services/integrations/meta-ads'
import { useAuth } from '@/shared/contexts/auth-context'
import { asErrorMessage, logError } from '@/lib/convex-errors'
import { toAdsProviderId } from '@/features/dashboard/ads/components/utils'
import { adsAdMetricsApi, adsCreativesApi } from '@/lib/convex-api'
import { CreateCreativeDialog } from './create-creative-dialog'
import {
  computeCreativeTotals,
  deriveCreativeMetrics,
  getMetricsForAd,
  resolveCreativeInsights,
  sortCreativesByMetric,
  type CampaignAd,
  type CreativePerformanceMetrics,
  type CreativeInsightKind,
  type CreativeSortKey,
} from './campaign-creative-metrics'
import {
  CampaignCreativesPerformanceStrip,
  CreativeInsightBadge,
  CreativeMetricsGrid,
  CreativeSpendShareBar,
} from './campaign-creatives-performance'

export type { CampaignAd } from './campaign-creative-metrics'

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
  currency?: string | null
}

type ViewMode = 'grid' | 'list'
type SupportedProviderId = 'google' | 'tiktok' | 'linkedin' | 'facebook'


type AdMetricRow = {
  adId?: string
  spend?: number
  impressions?: number
  clicks?: number
  conversions?: number
  revenue?: number
}

function getCreativeTypeIcon(type: string, className?: string) {
  const lowerType = type.toLowerCase()
  if (lowerType.includes('boosted') || lowerType.includes('page_post')) return <Link2 className={className || "h-4 w-4"} />
  if (lowerType.includes('video_responsive')) return <Video className={className || "h-4 w-4"} />
  if (lowerType.includes('shopping')) return <Layers className={className || "h-4 w-4"} />
  if (lowerType.includes('carousel') || lowerType.includes('product_ad')) return <Layers className={className || "h-4 w-4"} />
  if (lowerType.includes('video')) return <Video className={className || "h-4 w-4"} />
  if (lowerType.includes('image') || lowerType.includes('photo') || lowerType.includes('sponsored_status_update')) return <ImageIcon className={className || "h-4 w-4"} />
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

function isAdEnabled(status: string) {
  const normalizedStatus = status.toUpperCase()
  return normalizedStatus === 'ACTIVE' || normalizedStatus === 'ENABLED' || normalizedStatus === 'ENABLE'
}

function getNextAdStatus(providerId: string, checked: boolean) {
  if (providerId === 'google') return checked ? 'ENABLED' : 'PAUSED'
  if (providerId === 'tiktok') return checked ? 'ENABLE' : 'DISABLE'
  return checked ? 'ACTIVE' : 'PAUSED'
}

function CreativeStatusToggle({
  providerId,
  status,
  onChange,
  showLabel = false,
  className,
}: {
  providerId: string
  status: string
  onChange: (nextStatus: string) => void
  showLabel?: boolean
  className?: string
}) {
  const handleCheckedChange = useCallback((checked: boolean) => {
    onChange(getNextAdStatus(providerId, checked))
  }, [onChange, providerId])

  return (
    <div className={className}>
      <Switch
        checked={isAdEnabled(status)}
        onCheckedChange={handleCheckedChange}
        className={showLabel ? undefined : 'h-3.5 w-7'}
      />
      {showLabel ? (
        <span className="w-14 text-xs font-medium capitalize">{status.toLowerCase()}</span>
      ) : (
        <span className="text-[10px] font-medium uppercase tracking-wider text-viewer-chrome">{status.toLowerCase()}</span>
      )}
    </div>
  )
}

function CampaignAdsHeader({
  availableAdSets,
  campaignId,
  canLoad,
  clientId,
  convexProviderId,
  fetchAds,
  firstAdSetId,
  isPreviewMode,
  loading,
  setViewMode,
  summaryStats,
  viewMode,
  workspaceId,
}: {
  availableAdSets: Array<{ id: string; name: string }>
  campaignId: string
  canLoad: boolean
  clientId?: string | null
  convexProviderId: string
  fetchAds: () => Promise<void>
  firstAdSetId?: string
  isPreviewMode?: boolean
  loading: boolean
  setViewMode: (viewMode: ViewMode) => void
  summaryStats: { total: number; totalTypes: number; activeCount: number } | null
  viewMode: ViewMode
  workspaceId: string | null
}) {
  const handleSetGridView = useCallback(() => setViewMode('grid'), [setViewMode])
  const handleSetListView = useCallback(() => setViewMode('list'), [setViewMode])
  const handleRefresh = useCallback(() => { void fetchAds() }, [fetchAds])

  return (
    <CardHeader className="border-b border-border/50 pb-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/15">
            <Layers className="h-5 w-5 text-primary" aria-hidden />
          </div>
          <div className="space-y-0.5">
            <p className={ADS_PAGE_THEME.sectionEyebrow}>Creative library</p>
            <CardTitle className="text-lg font-semibold tracking-tight">Ad creatives</CardTitle>
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
          <CreateCreativeDialog
            key={`creative-${campaignId}-${firstAdSetId ?? 'none'}`}
            workspaceId={workspaceId}
            providerId={convexProviderId}
            campaignId={campaignId}
            clientId={clientId}
            adSetId={firstAdSetId}
            availableAdSets={availableAdSets}
            onSuccess={fetchAds}
          />
          <div className="flex items-center rounded-lg border p-1">
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-7 w-7"
              onClick={handleSetGridView}
              aria-label="Grid view"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-7 w-7"
              onClick={handleSetListView}
              aria-label="List view"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            disabled={!canLoad || loading}
            aria-label="Refresh creatives"
          >
            <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
          </Button>
        </div>
      </div>
    </CardHeader>
  )
}

function CampaignAdsFilters({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  typeFilter,
  setTypeFilter,
  uniqueStatuses,
  uniqueTypes,
}: {
  searchQuery: string
  setSearchQuery: (value: string) => void
  statusFilter: string
  setStatusFilter: (value: string) => void
  typeFilter: string
  setTypeFilter: (value: string) => void
  uniqueStatuses: string[]
  uniqueTypes: string[]
}) {
  const handleSearchChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value)
  }, [setSearchQuery])

  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search creatives…"
          value={searchQuery}
          onChange={handleSearchChange}
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
          {uniqueTypes.map((type) => (
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
          {uniqueStatuses.map((status) => (
            <SelectItem key={status} value={status} className="capitalize">
              {status.toLowerCase()}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

function AdGridItem({
  ad,
  adMetrics,
  currency,
  insightKind,
  maxSpend,
  onCreativeClick,
  onToggleStatus,
  providerId,
}: {
  ad: CampaignAd
  adMetrics: Record<string, CreativePerformanceMetrics | undefined>
  currency: string
  insightKind?: CreativeInsightKind
  maxSpend: number
  onCreativeClick: (creative: CampaignAd) => void
  onToggleStatus: (ad: CampaignAd, nextStatus: string) => void
  providerId: string
}) {
  const handleClick = useCallback(() => onCreativeClick(ad), [onCreativeClick, ad])
  const handleToggleStatus = useCallback((nextStatus: string) => onToggleStatus(ad, nextStatus), [onToggleStatus, ad])
  const metrics = getMetricsForAd(ad, adMetrics)
  const spendShare = metrics && maxSpend > 0 ? (metrics.spend / maxSpend) * 100 : 0
  const handleImageError = useCallback((event: React.SyntheticEvent<HTMLImageElement>) => {
    const target = event.target as HTMLImageElement
    target.style.display = 'none'
    const parent = target.parentElement
    if (parent && !parent.querySelector('.fallback-icon')) {
      const fallback = document.createElement('div')
      fallback.className = 'fallback-icon flex h-full items-center justify-center'
      fallback.innerHTML = '<svg class="h-10 w-10 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>'
      parent.appendChild(fallback)
    }
  }, [])

  return (
    <div
      className="group relative overflow-hidden rounded-lg border bg-card text-left motion-chromatic hover:border-accent/50 hover:shadow-md"
    >
      <button
        type="button"
        onClick={handleClick}
        className="w-full text-left focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      >
        <div className="relative aspect-square overflow-hidden bg-muted">
          {ad.imageUrl ? (
            <NextImage
              src={ad.imageUrl}
              alt={ad.name || 'Creative preview'}
              fill
              unoptimized
              sizes="(max-width: 1024px) 50vw, 240px"
              className="object-cover transition-transform group-hover:scale-105"
              onError={handleImageError}
            />
          ) : ad.videoUrl ? (
            <div className="flex h-full items-center justify-center bg-muted">
              <div className="flex flex-col items-center gap-1 text-muted-foreground">
                <Play className="h-10 w-10" />
              </div>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center">
              <Layers className="h-10 w-10 text-muted-foreground/30" />
            </div>
          )}

          {ad.videoUrl && ad.imageUrl ? (
            <div className="absolute inset-0 flex items-center justify-center bg-black/35">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-card/95 shadow-sm ring-1 ring-border/50">
                <Play className="ml-0.5 h-6 w-6 text-foreground" />
              </div>
            </div>
          ) : null}

          <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-colors group-hover:bg-black/15 group-hover:opacity-100">
            <span className="rounded bg-primary px-2 py-1 text-xs font-medium text-primary-foreground shadow-sm">View Details</span>
          </div>
        </div>

        <div className="flex flex-col gap-1.5 border-t bg-card p-3">
          <div className="flex items-center justify-between">
            <span className="max-w-[60%] truncate text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{ad.type}</span>
            <Badge variant={getStatusVariant(ad.status)} className="h-4 px-1 text-[8px] font-bold">
              {ad.status}
            </Badge>
          </div>
          <div className="flex items-start justify-between gap-2">
            <h4 className="line-clamp-1 flex-1 text-xs font-semibold">{ad.name || ad.headlines?.[0] || 'Ad'}</h4>
            {insightKind ? <CreativeInsightBadge kind={insightKind} /> : null}
          </div>

          {metrics ? (
            <>
              <CreativeMetricsGrid metrics={metrics} currency={currency} compact />
              {metrics.spend > 0 ? <CreativeSpendShareBar share={spendShare} /> : null}
            </>
          ) : (
            <p className="mt-1 text-[10px] text-muted-foreground">No spend in selected period</p>
          )}
        </div>
      </button>

      <div className="absolute right-2 top-2">
        <div className="flex items-center gap-1.5 rounded-full border border-viewer-chrome/20 bg-black/40 px-2 py-1 backdrop-blur-sm">
          <CreativeStatusToggle
            providerId={providerId}
            status={ad.status}
            onChange={handleToggleStatus}
          />
        </div>
      </div>
    </div>
  )
}

function CampaignAdsGrid({
  adMetrics,
  ads,
  creativeInsights,
  currency,
  maxSpend,
  onCreativeClick,
  onToggleStatus,
  providerId,
}: {
  adMetrics: Record<string, CreativePerformanceMetrics | undefined>
  ads: CampaignAd[]
  creativeInsights: Map<string, CreativeInsightKind>
  currency: string
  maxSpend: number
  onCreativeClick: (creative: CampaignAd) => void
  onToggleStatus: (ad: CampaignAd, nextStatus: string) => void
  providerId: string
}) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {ads.map((ad) => (
        <AdGridItem
          key={ad.creativeId}
          ad={ad}
          adMetrics={adMetrics}
          currency={currency}
          insightKind={creativeInsights.get(ad.creativeId)}
          maxSpend={maxSpend}
          onCreativeClick={onCreativeClick}
          onToggleStatus={onToggleStatus}
          providerId={providerId}
        />
      ))}
    </div>
  )
}

function formatPercent(value: number): string {
  return `${value.toFixed(2)}%`
}

function AdListRow({
  ad,
  adMetrics,
  currency,
  insightKind,
  onCreativeClick,
  onToggleStatus,
  providerId,
}: {
  ad: CampaignAd
  adMetrics: Record<string, CreativePerformanceMetrics | undefined>
  currency: string
  insightKind?: CreativeInsightKind
  onCreativeClick: (creative: CampaignAd) => void
  onToggleStatus: (ad: CampaignAd, nextStatus: string) => void
  providerId: string
}) {
  const handleClick = useCallback(() => onCreativeClick(ad), [onCreativeClick, ad])
  const handleStopPropagation = useCallback((event: React.MouseEvent) => event.stopPropagation(), [])
  const handleToggleStatus = useCallback((nextStatus: string) => onToggleStatus(ad, nextStatus), [onToggleStatus, ad])
  const metrics = getMetricsForAd(ad, adMetrics)
  const permalink =
    providerId === 'facebook'
      ? resolveMetaSocialPermalink({
          instagramPermalinkUrl: ad.instagramPermalinkUrl,
          objectStoryId: ad.objectStoryId,
        })
      : undefined

  return (
    <TableRow
      className="cursor-pointer hover:bg-muted/50"
      onClick={handleClick}
    >
      <TableCell>
        <div className="relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-lg border bg-muted">
          {ad.imageUrl ? (
            <NextImage
              src={ad.imageUrl}
              alt=""
              fill
              unoptimized
              sizes="56px"
              className="object-cover"
            />
          ) : ad.videoUrl ? (
            <Play className="h-5 w-5 text-muted-foreground" />
          ) : (
            getCreativeTypeIcon(ad.type, 'h-5 w-5 text-muted-foreground')
          )}
        </div>
      </TableCell>
      <TableCell>
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <p className="max-w-[220px] truncate font-medium">
              {ad.name || ad.headlines?.[0] || ad.descriptions?.[0] || ad.creativeId}
            </p>
            {insightKind ? <CreativeInsightBadge kind={insightKind} /> : null}
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[9px] font-bold uppercase text-muted-foreground">{ad.type}</span>
            {ad.pageName ? (
              <>
                <span className="text-[9px] text-muted-foreground">•</span>
                <span className="text-[9px] font-medium text-muted-foreground">{ad.pageName}</span>
              </>
            ) : null}
          </div>
        </div>
      </TableCell>
      <TableCell onClick={handleStopPropagation}>
        <div className="flex items-center gap-2">
          <CreativeStatusToggle
            providerId={providerId}
            status={ad.status}
            showLabel
            onChange={handleToggleStatus}
          />
        </div>
      </TableCell>
      <TableCell className="text-right font-mono text-xs tabular-nums">
        {metrics ? formatCurrency(metrics.spend, currency) : '—'}
      </TableCell>
      <TableCell className="text-right font-mono text-xs tabular-nums hidden md:table-cell">
        {metrics ? metrics.impressions.toLocaleString() : '—'}
      </TableCell>
      <TableCell className="text-right font-mono text-xs tabular-nums">
        {metrics ? metrics.clicks.toLocaleString() : '—'}
      </TableCell>
      <TableCell className="text-right font-mono text-xs tabular-nums hidden lg:table-cell">
        {metrics ? formatPercent(metrics.ctr) : '—'}
      </TableCell>
      <TableCell className="text-right font-mono text-xs tabular-nums">
        {metrics ? metrics.conversions.toLocaleString() : '—'}
      </TableCell>
      <TableCell className="text-right font-mono text-xs tabular-nums hidden lg:table-cell">
        {metrics && metrics.roas > 0 ? `${metrics.roas.toFixed(2)}×` : '—'}
      </TableCell>
      <TableCell className="hidden xl:table-cell">
        <p className="max-w-[180px] truncate text-sm text-muted-foreground">
          {ad.headlines?.[0] || ad.descriptions?.[0] || '—'}
        </p>
      </TableCell>
      <TableCell onClick={handleStopPropagation}>
        {permalink ? (
          <a
            href={permalink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex text-primary hover:opacity-90"
            title="Open Instagram or Facebook post"
            aria-label="Open social permalink"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        ) : (
          <span className="text-muted-foreground">Unavailable</span>
        )}
      </TableCell>
      <TableCell>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </TableCell>
    </TableRow>
  )
}

function CampaignAdsList({
  adMetrics,
  ads,
  creativeInsights,
  currency,
  onCreativeClick,
  onToggleStatus,
  providerId,
}: {
  adMetrics: Record<string, CreativePerformanceMetrics | undefined>
  ads: CampaignAd[]
  creativeInsights: Map<string, CreativeInsightKind>
  currency: string
  onCreativeClick: (creative: CampaignAd) => void
  onToggleStatus: (ad: CampaignAd, nextStatus: string) => void
  providerId: string
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-border/60">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30 hover:bg-muted/30">
            <TableHead className="w-16">Preview</TableHead>
            <TableHead>Creative</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Spend</TableHead>
            <TableHead className="text-right hidden md:table-cell">Impr.</TableHead>
            <TableHead className="text-right">Clicks</TableHead>
            <TableHead className="text-right hidden lg:table-cell">CTR</TableHead>
            <TableHead className="text-right">Conv.</TableHead>
            <TableHead className="text-right hidden lg:table-cell">ROAS</TableHead>
            <TableHead className="hidden xl:table-cell">Copy</TableHead>
            <TableHead className="w-10 text-center">Link</TableHead>
            <TableHead className="w-10"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ads.map((ad) => (
            <AdListRow
              key={ad.creativeId}
              ad={ad}
              adMetrics={adMetrics}
              currency={currency}
              insightKind={creativeInsights.get(ad.creativeId)}
              onCreativeClick={onCreativeClick}
              onToggleStatus={onToggleStatus}
              providerId={providerId}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export function CampaignAdsSection({ providerId, campaignId, clientId, isPreviewMode, currency }: Props) {
  const { push } = useRouter()
  const { user } = useAuth()
  const workspaceId = user?.agencyId ? String(user.agencyId) : null
  const displayCurrency = normalizeCurrencyCode(currency)
  const convexProviderId = useMemo(() => toAdsProviderId(providerId), [providerId])
  const isMeta = convexProviderId === 'facebook'

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
  const [adMetrics, setAdMetrics] = useState<Record<string, CreativePerformanceMetrics | undefined>>({})
  const [metricsLoading, setMetricsLoading] = useState(false)
  const [periodDays, setPeriodDays] = useState('30')
  const [sortKey, setSortKey] = useState<CreativeSortKey>('spend')

  const canLoad = !isPreviewMode

  const fetchAds = useCallback(async () => {
    if (!canLoad) {
      setLoading(false)
      return
    }

    setLoading(true)

    if (!workspaceId) {
      setLoading(false)
      return
    }

    await listCreatives({
      workspaceId,
      providerId: convexProviderId as SupportedProviderId,
      clientId: clientId ?? null,
      campaignId,
      maxMetaCreativePages: convexProviderId === 'facebook' ? 50 : undefined,
      maxGoogleAdsSearchPages: convexProviderId === 'google' ? 20 : undefined,
    })
      .then((creatives) => {
        const mapped = creatives as CampaignAd[]
        setAds(Array.isArray(mapped) ? mapped : [])
        setSummary(null)
        setHasLoaded(true)
      })
      .catch((error) => {
        reportConvexFailure({
        error: error,
        context: 'CampaignAdsSection:fetchAds',
        title: 'Error',
        fallbackMessage: 'Error',
        })
      })
      .finally(() => {
        setLoading(false)
      })
  }, [canLoad, campaignId, clientId, convexProviderId, listCreatives, workspaceId])

  const fetchMetrics = useCallback(async () => {
    if (!canLoad) return
    setMetricsLoading(true)

    if (!workspaceId) {
      setMetricsLoading(false)
      return
    }

    await listAdMetrics({
      workspaceId,
      providerId: convexProviderId as SupportedProviderId,
      clientId: clientId ?? null,
      campaignId,
      days: periodDays,
    })
      .then((data) => {
        const metrics = Array.isArray((data as { metrics?: AdMetricRow[] } | null | undefined)?.metrics)
          ? (data as { metrics?: AdMetricRow[] }).metrics ?? []
          : []

        const aggregated: Record<string, CreativePerformanceMetrics | undefined> = {}
        metrics.forEach((m) => {
          if (!m.adId) return
          const current = aggregated[m.adId] ?? {
            spend: 0,
            impressions: 0,
            clicks: 0,
            conversions: 0,
            revenue: 0,
            ctr: 0,
            cpc: 0,
            cpa: 0,
            roas: 0,
          }
          current.spend += m.spend ?? 0
          current.impressions += m.impressions ?? 0
          current.clicks += m.clicks ?? 0
          current.conversions += m.conversions ?? 0
          current.revenue += m.revenue ?? 0
          aggregated[m.adId] = deriveCreativeMetrics(current) ?? current
        })
        setAdMetrics(aggregated)
      })
      .catch((error) => {
        logError(error, 'CampaignAdsSection:fetchMetrics')
      })
      .finally(() => {
        setMetricsLoading(false)
      })
  }, [canLoad, campaignId, clientId, convexProviderId, listAdMetrics, periodDays, workspaceId])

  useEffect(() => {
    if (!canLoad || !workspaceId) return
    void fetchAds()
  }, [canLoad, campaignId, clientId, convexProviderId, fetchAds, workspaceId])

  useEffect(() => {
    if (!hasLoaded) return
    void fetchMetrics()
  }, [fetchMetrics, hasLoaded, periodDays])

  const uniqueTypes = useMemo(() => {
    const types = new Set(ads.map(ad => ad.type || 'Unknown'))
    return Array.from(types)
  }, [ads])

  const uniqueStatuses = useMemo(() => {
    const statuses = new Set(ads.map(ad => ad.status || 'Unknown'))
    return Array.from(statuses)
  }, [ads])

  const availableAdSets = useMemo(() => {
    const adSetMap = new Map<string, string>()
    ads.forEach(ad => {
      if (ad.adGroupId && !adSetMap.has(ad.adGroupId)) {
        adSetMap.set(ad.adGroupId, ad.adGroupId)
      }
    })
    return Array.from(adSetMap.values()).map(id => ({
      id,
      name: `Ad Set ${id.slice(-6)}`,
    }))
  }, [ads])

  const firstAdSetId = useMemo(() => {
    return availableAdSets[0]?.id
  }, [availableAdSets])

  const filteredAds = useMemo(() => {
    return ads.filter((ad) => {
      const matchesSearch =
        !searchQuery ||
        ad.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ad.headlines?.some((h: string) => h.toLowerCase().includes(searchQuery.toLowerCase()))
      const matchesType = typeFilter === 'all' || ad.type === typeFilter
      const matchesStatus = statusFilter === 'all' || ad.status === statusFilter
      return matchesSearch && matchesType && matchesStatus
    })
  }, [ads, searchQuery, typeFilter, statusFilter])

  const sortedFilteredAds = useMemo(
    () => sortCreativesByMetric(filteredAds, adMetrics, sortKey),
    [adMetrics, filteredAds, sortKey],
  )

  const performanceTotals = useMemo(
    () => (filteredAds.length > 0 ? computeCreativeTotals(filteredAds, adMetrics) : null),
    [adMetrics, filteredAds],
  )

  const creativeInsights = useMemo(
    () => resolveCreativeInsights(sortedFilteredAds, adMetrics),
    [adMetrics, sortedFilteredAds],
  )

  const maxSpend = useMemo(() => {
    let max = 0
    for (const ad of sortedFilteredAds) {
      const spend = getMetricsForAd(ad, adMetrics)?.spend ?? 0
      if (spend > max) max = spend
    }
    return max
  }, [adMetrics, sortedFilteredAds])

  const handleCreativeClick = useCallback((creative: CampaignAd) => {
    const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '')
    const cName = creative.name || creative.headlines?.[0] || creative.creativeId
    params.set('creativeName', cName)
    params.set('currency', displayCurrency)
    push(withPreviewModeSearchParamIfEnabled(
      `/dashboard/ads/campaigns/${providerId}/${campaignId}/creative/${creative.creativeId}?${params.toString()}`,
      isPreviewModeEnabled(),
    ))
  }, [campaignId, displayCurrency, providerId, push])

  const toggleAdStatus = useCallback((ad: CampaignAd, newStatus: string) => {
    // Optimistic update
    const previousAds = [...ads]
    setAds(currentAds =>
      currentAds.map(a => a.creativeId === ad.creativeId ? { ...a, status: newStatus } : a)
    )

    if (!workspaceId) {
      setAds(previousAds)
      notifyFailure({
        title: 'Error',
        message: 'Sign in required',
      })
      return
    }

    void updateCreativeStatus({
        workspaceId,
        providerId: convexProviderId as SupportedProviderId,
        clientId: clientId ?? null,
        creativeId: ad.creativeId,
        adGroupId: ad.adGroupId,
        status: newStatus as 'ACTIVE' | 'PAUSED' | 'ENABLED' | 'DISABLED' | 'ENABLE' | 'DISABLE',
      })

      .then(() => {
        toast({
          title: 'Status Updated',
          description: `Ad is now ${newStatus.toLowerCase()}`,
        })
      })
      .catch((error) => {
        // Revert on error
        setAds(previousAds)
        reportConvexFailure({
        error: error,
        context: 'CampaignAdsSection:toggleAdStatus',
        title: 'Error',
        fallbackMessage: 'Error',
        })
      })
  }, [ads, clientId, convexProviderId, updateCreativeStatus, workspaceId])

  const handleToggleAdStatus = useCallback((ad: CampaignAd, nextStatus: string) => {
    void toggleAdStatus(ad, nextStatus)
  }, [toggleAdStatus])

  const summaryStats = useMemo(() => {
    if (!hasLoaded && ads.length === 0) return null
    const total = summary?.total ?? ads.length
    const totalTypes = summary ? Object.keys(summary.byType).length : new Set(ads.map((ad) => ad.type)).size
    const activeCount =
      summary?.byStatus?.ACTIVE ??
      summary?.byStatus?.ENABLED ??
      ads.filter((ad) => isAdEnabled(ad.status)).length
    return { total, totalTypes, activeCount }
  }, [ads, hasLoaded, summary])

  const handleClearFilters = useCallback(() => {
    setSearchQuery('')
    setTypeFilter('all')
    setStatusFilter('all')
  }, [])

  const handleRefreshAll = useCallback(async () => {
    await Promise.all([fetchAds(), fetchMetrics()])
  }, [fetchAds, fetchMetrics])

  return (
    <MotionCard className={ADS_PAGE_THEME.surfaceCard}>
      <CampaignAdsHeader
        availableAdSets={availableAdSets}
        campaignId={campaignId}
        canLoad={canLoad}
        clientId={clientId}
        convexProviderId={convexProviderId}
        fetchAds={handleRefreshAll}
        firstAdSetId={firstAdSetId}
        isPreviewMode={isPreviewMode}
        loading={loading}
        setViewMode={setViewMode}
        summaryStats={summaryStats}
        viewMode={viewMode}
        workspaceId={workspaceId}
      />

      <CardContent className="space-y-4 pt-6">
        {loading && !hasLoaded ? (
          <div className="space-y-4">
            <div className="flex gap-2">
              <Skeleton className="h-9 flex-1" />
              <Skeleton className="h-9 w-32" />
            </div>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {['skeleton-a', 'skeleton-b', 'skeleton-c', 'skeleton-d'].map((skeletonId) => (
                  <Skeleton key={skeletonId} className="aspect-square rounded-lg" />
                ))}
              </div>
            ) : (
              <Skeleton className="h-64" />
            )}
          </div>
        ) : !canLoad ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Layers className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium">Preview Mode</p>
            <p className="mt-1 text-xs text-muted-foreground">Enable live mode to view ad creatives</p>
          </div>
        ) : ads.length === 0 && hasLoaded ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <FileText className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium">No Creatives Found</p>
            <p className="mt-1 text-xs text-muted-foreground">This campaign doesn&apos;t have ad creatives yet</p>
          </div>
        ) : (
          <>
            <CampaignCreativesPerformanceStrip
              totals={performanceTotals}
              currency={displayCurrency}
              periodDays={periodDays}
              onPeriodChange={setPeriodDays}
              sortKey={sortKey}
              onSortChange={setSortKey}
              metricsLoading={metricsLoading}
              isMeta={isMeta}
            />

            <CampaignAdsFilters
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              typeFilter={typeFilter}
              setTypeFilter={setTypeFilter}
              uniqueStatuses={uniqueStatuses}
              uniqueTypes={uniqueTypes}
            />

            {filteredAds.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <p className="text-sm text-muted-foreground">No creatives match your filters</p>
                <Button
                  variant="link"
                  size="sm"
                  onClick={handleClearFilters}
                >
                  Clear filters
                </Button>
              </div>
            ) : viewMode === 'grid' ? (
              <CampaignAdsGrid
                adMetrics={adMetrics}
                ads={sortedFilteredAds}
                creativeInsights={creativeInsights}
                currency={displayCurrency}
                maxSpend={maxSpend}
                onCreativeClick={handleCreativeClick}
                onToggleStatus={handleToggleAdStatus}
                providerId={convexProviderId}
              />
            ) : (
              <CampaignAdsList
                adMetrics={adMetrics}
                ads={sortedFilteredAds}
                creativeInsights={creativeInsights}
                currency={displayCurrency}
                onCreativeClick={handleCreativeClick}
                onToggleStatus={handleToggleAdStatus}
                providerId={convexProviderId}
              />
            )}

            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
              <span>
                Showing {sortedFilteredAds.length} of {ads.length} creatives
                {metricsLoading ? ' · refreshing metrics…' : ''}
              </span>
              {isMeta ? (
                <span>Metrics are per Meta ad (last {periodDays} days)</span>
              ) : null}
            </div>
          </>
        )}
      </CardContent>
    </MotionCard>
  )
}
