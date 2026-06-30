'use client';
import { useCallback, useState, type MouseEvent } from 'react';
import NextImage from '@/shared/ui/image';
import { RefreshCw, Image as ImageIcon, Video, FileText, Filter, Search, Layers, Play, Grid3X3, List, ChevronRight, Smartphone, MapPin, Link2, ExternalLink, } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { ADS_PAGE_THEME } from '@/features/dashboard/ads/components/ads-page-theme';
import { CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Input } from '@/shared/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from '@/shared/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from '@/shared/ui/table';
import { Switch } from '@/shared/ui/switch';
import { cn, formatCurrency } from '@/lib/utils';
import { resolveMetaSocialPermalink } from '@/services/integrations/meta-ads';
import { CreateCreativeDialog } from './create-creative-dialog';
import { getMetricsForAd, type CampaignAd, type CreativeInsightKind, type CreativePerformanceMetrics, } from './campaign-creative-metrics';
import type { ViewMode } from './campaign-ads-section-types';
import { CreativeInsightBadge, CreativeMetricsGrid, CreativeSpendShareBar, } from './campaign-creatives-performance';
import { isAdEnabled } from './campaign-ads-section-utils';
function getCreativeTypeIcon(type: string, className?: string) {
    const lowerType = type.toLowerCase();
    if (lowerType.includes('boosted') || lowerType.includes('page_post'))
        return <Link2 className={className || "size-4"}/>;
    if (lowerType.includes('video_responsive'))
        return <Video className={className || "size-4"}/>;
    if (lowerType.includes('shopping'))
        return <Layers className={className || "size-4"}/>;
    if (lowerType.includes('carousel') || lowerType.includes('product_ad'))
        return <Layers className={className || "size-4"}/>;
    if (lowerType.includes('video'))
        return <Video className={className || "size-4"}/>;
    if (lowerType.includes('image') || lowerType.includes('photo') || lowerType.includes('sponsored_status_update'))
        return <ImageIcon className={className || "size-4"}/>;
    if (lowerType.includes('text') || lowerType.includes('search'))
        return <FileText className={className || "size-4"}/>;
    if (lowerType.includes('app') || lowerType.includes('call') || lowerType.includes('sponsored_inmails'))
        return <Smartphone className={className || "size-4"}/>;
    if (lowerType.includes('hotel'))
        return <MapPin className={className || "size-4"}/>;
    return <Layers className={className || "size-4 text-muted-foreground/50"}/>;
}
function getStatusVariant(status: string): 'default' | 'secondary' | 'outline' | 'destructive' {
    const s = status.toLowerCase();
    if (s === 'enabled' || s === 'enable' || s === 'active')
        return 'default';
    if (s === 'paused' || s === 'disable')
        return 'secondary';
    if (s === 'deleted' || s === 'removed')
        return 'destructive';
    return 'outline';
}
function getNextAdStatus(providerId: string, checked: boolean) {
    if (providerId === 'google')
        return checked ? 'ENABLED' : 'PAUSED';
    if (providerId === 'tiktok')
        return checked ? 'ENABLE' : 'DISABLE';
    return checked ? 'ACTIVE' : 'PAUSED';
}
function stopNestedClickPropagation(event: MouseEvent) {
    event.stopPropagation();
}
function CreativeStatusToggle({ providerId, status, onChange, showLabel = false, className, disabled, }: {
    providerId: string;
    status: string;
    onChange: (nextStatus: string) => void;
    showLabel?: boolean;
    className?: string;
    disabled?: boolean;
}) {
    const handleCheckedChange = (checked: boolean) => {
        if (disabled)
            return;
        onChange(getNextAdStatus(providerId, checked));
    };
    return (<div className={className}>
      <Switch checked={isAdEnabled(status)} onCheckedChange={handleCheckedChange} disabled={disabled} className={showLabel ? undefined : 'h-3.5 w-7'}/>
      {showLabel ? (<span className="w-14 text-xs font-medium capitalize">{status.toLowerCase()}</span>) : (<span className="text-[10px] font-medium uppercase tracking-wider text-viewer-chrome">{status.toLowerCase()}</span>)}
    </div>);
}
export function CampaignAdsHeader({ availableAdSets, campaignId, campaignObjective, canLoad, clientId, convexProviderId, fetchAds, firstAdSetId, isMeta, isPreviewMode, loading, onCreateAdSet, setViewMode, summaryStats, viewMode, workspaceId, }: {
    availableAdSets: Array<{
        id: string;
        name: string;
    }>;
    campaignId: string;
    campaignObjective?: string | null;
    canLoad: boolean;
    clientId?: string | null;
    convexProviderId: string;
    fetchAds: () => Promise<void>;
    firstAdSetId?: string;
    isMeta?: boolean;
    isPreviewMode?: boolean;
    loading: boolean;
    onCreateAdSet?: () => void;
    setViewMode: (viewMode: ViewMode) => void;
    summaryStats: {
        total: number;
        totalTypes: number;
        activeCount: number;
    } | null;
    viewMode: ViewMode;
    workspaceId: string | null;
}) {
    const handleSetGridView = () => setViewMode('grid');
    const handleSetListView = () => setViewMode('list');
    const handleRefresh = () => { void fetchAds(); };
    return (<CardHeader className="border-b border-border/50 pb-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/15">
            <Layers className="size-5 text-primary" aria-hidden/>
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
          {isMeta && canLoad ? (<Button variant="outline" size="sm" onClick={onCreateAdSet}>
              New ad set
            </Button>) : null}
          <CreateCreativeDialog key={`creative-${campaignId}-${firstAdSetId ?? 'none'}`} workspaceId={workspaceId} providerId={convexProviderId} campaignId={campaignId} campaignObjective={campaignObjective} clientId={clientId} adSetId={firstAdSetId} availableAdSets={availableAdSets} onSuccess={fetchAds}/>
          <div className="flex items-center rounded-lg border p-1">
            <Button variant={viewMode === 'grid' ? 'secondary' : 'ghost'} size="icon" className="size-7" onClick={handleSetGridView} aria-label="Grid view">
              <Grid3X3 className="size-4"/>
            </Button>
            <Button variant={viewMode === 'list' ? 'secondary' : 'ghost'} size="icon" className="size-7" onClick={handleSetListView} aria-label="List view">
              <List className="size-4"/>
            </Button>
          </div>
          <Button variant="ghost" size="icon" onClick={handleRefresh} disabled={!canLoad || loading} aria-label="Refresh creatives">
            <RefreshCw className={cn('size-4', loading && 'animate-spin')}/>
          </Button>
        </div>
      </div>
    </CardHeader>);
}
export function CampaignAdsFilters({ searchQuery, setSearchQuery, statusFilter, setStatusFilter, typeFilter, setTypeFilter, uniqueStatuses, uniqueTypes, }: {
    searchQuery: string;
    setSearchQuery: (value: string) => void;
    statusFilter: string;
    setStatusFilter: (value: string) => void;
    typeFilter: string;
    setTypeFilter: (value: string) => void;
    uniqueStatuses: string[];
    uniqueTypes: string[];
}) {
    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(event.target.value);
    };
    return (<div className="flex flex-col gap-2 sm:flex-row">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"/>
        <Input placeholder="Search creatives…" value={searchQuery} onChange={handleSearchChange} className="pl-9"/>
      </div>
      <Select value={typeFilter} onValueChange={setTypeFilter}>
        <SelectTrigger className="w-full sm:w-[140px]">
          <Filter className="mr-2 size-4"/>
          <SelectValue placeholder="Type"/>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          {uniqueTypes.map((type) => (<SelectItem key={type} value={type} className="capitalize">
              {type.toLowerCase().replace(/_/g, ' ')}
            </SelectItem>))}
        </SelectContent>
      </Select>
      <Select value={statusFilter} onValueChange={setStatusFilter}>
        <SelectTrigger className="w-full sm:w-[140px]">
          <SelectValue placeholder="Status"/>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          {uniqueStatuses.map((status) => (<SelectItem key={status} value={status} className="capitalize">
              {status.toLowerCase()}
            </SelectItem>))}
        </SelectContent>
      </Select>
    </div>);
}
function AdGridItem({ ad, adMetrics, currency, insightKind, maxSpend, onCreativeClick, onToggleStatus, providerId, togglingAdId, }: {
    ad: CampaignAd;
    adMetrics: Record<string, CreativePerformanceMetrics | undefined>;
    currency: string;
    insightKind?: CreativeInsightKind;
    maxSpend: number;
    onCreativeClick: (creative: CampaignAd) => void;
    onToggleStatus: (ad: CampaignAd, nextStatus: string) => void;
    providerId: string;
    togglingAdId: string | null;
}) {
    const onOpenCreative = () => onCreativeClick(ad);
    const handleToggleStatus = (nextStatus: string) => onToggleStatus(ad, nextStatus);
    const metrics = getMetricsForAd(ad, adMetrics);
    const spendShare = metrics && maxSpend > 0 ? (metrics.spend / maxSpend) * 100 : 0;
    const [imageFailed, setImageFailed] = useState(false);
    const handleImageError = () => setImageFailed(true);
    const previewImageUrl = ad.thumbnailUrl || ad.imageUrl;
    const socialPermalink = resolveMetaSocialPermalink(ad);
    const isBoostedPost = ad.type.toLowerCase().includes('boosted');
    return (<div className="group relative overflow-hidden rounded-lg border bg-card text-left motion-chromatic hover:border-accent/50 hover:shadow-md">
      <button type="button" onClick={onOpenCreative} className="w-full text-left focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
        <div className="relative aspect-square overflow-hidden bg-muted">
          {previewImageUrl && !imageFailed ? (<NextImage src={previewImageUrl} alt={ad.name || 'Creative preview'} fill unoptimized sizes="(max-width: 1024px) 50vw, 240px" className="object-cover transition-transform group-hover:scale-105" onError={handleImageError}/>) : previewImageUrl && imageFailed ? (<div className="flex h-full flex-col items-center justify-center gap-1.5 px-3 text-center text-muted-foreground">
              <ImageIcon className="size-8 opacity-40" aria-hidden/>
              <span className="text-[10px] font-medium">Preview unavailable</span>
            </div>) : ad.videoUrl ? (<div className="flex h-full items-center justify-center bg-muted">
              <div className="flex flex-col items-center gap-1 text-muted-foreground">
                <Play className="size-10"/>
              </div>
            </div>) : (<div className="flex h-full items-center justify-center">
              <Layers className="size-10 text-muted-foreground/30"/>
            </div>)}

          {ad.videoUrl && previewImageUrl ? (<div className="absolute inset-0 flex items-center justify-center bg-black/35">
              <div className="flex size-12 items-center justify-center rounded-full bg-card/95 shadow-sm ring-1 ring-border/50">
                <Play className="ml-0.5 size-6 text-foreground"/>
              </div>
            </div>) : null}

          {isBoostedPost ? (<div className="absolute left-2 top-2">
              <Badge variant="secondary" className="h-5 gap-1 bg-card/95 px-1.5 text-[9px] font-semibold shadow-sm">
                <Link2 className="size-3" aria-hidden/>
                Boosted post
              </Badge>
            </div>) : null}

          <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-colors group-hover:bg-black/15 group-hover:opacity-100">
            <span className="rounded bg-primary px-2 py-1 text-xs font-medium text-primary-foreground shadow-sm">View Details</span>
          </div>
        </div>

        <div className="flex flex-col gap-1.5 border-t bg-card p-3">
          <div className="flex items-center justify-between gap-1">
            <span className="max-w-[60%] truncate text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              {isBoostedPost ? 'Boosted post' : ad.type}
            </span>
            <div className="flex items-center gap-1">
              {socialPermalink ? (<a href={socialPermalink} target="_blank" rel="noopener noreferrer" className="inline-flex size-6 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground" onClick={stopNestedClickPropagation} aria-label="Open on Facebook or Instagram">
                  <ExternalLink className="size-3.5"/>
                </a>) : null}
              <Badge variant={getStatusVariant(ad.status)} className="h-4 px-1 text-[8px] font-bold">
                {ad.status}
              </Badge>
            </div>
          </div>
          <div className="flex items-start justify-between gap-2">
            <h4 className="line-clamp-1 flex-1 text-xs font-semibold">{ad.name || ad.headlines?.[0] || 'Ad'}</h4>
            {insightKind ? <CreativeInsightBadge kind={insightKind}/> : null}
          </div>

          {metrics ? (<>
              <CreativeMetricsGrid metrics={metrics} currency={currency} compact/>
              {metrics.spend > 0 ? <CreativeSpendShareBar share={spendShare}/> : null}
            </>) : (<p className="mt-1 text-[10px] text-muted-foreground">No spend in selected period</p>)}
        </div>
      </button>

      <div className="absolute right-2 top-2">
        <div className="flex items-center gap-1.5 rounded-full border border-viewer-chrome/20 bg-black/40 px-2 py-1 backdrop-blur-sm">
          <CreativeStatusToggle providerId={providerId} status={ad.status} onChange={handleToggleStatus} disabled={togglingAdId === ad.creativeId}/>
        </div>
      </div>
    </div>);
}
export function CampaignAdsGrid({ adMetrics, ads, creativeInsights, currency, maxSpend, onCreativeClick, onToggleStatus, providerId, togglingAdId, }: {
    adMetrics: Record<string, CreativePerformanceMetrics | undefined>;
    ads: CampaignAd[];
    creativeInsights: Map<string, CreativeInsightKind>;
    currency: string;
    maxSpend: number;
    onCreativeClick: (creative: CampaignAd) => void;
    onToggleStatus: (ad: CampaignAd, nextStatus: string) => void;
    providerId: string;
    togglingAdId: string | null;
}) {
    return (<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {ads.map((ad) => (<AdGridItem key={ad.creativeId} ad={ad} adMetrics={adMetrics} currency={currency} insightKind={creativeInsights.get(ad.creativeId)} maxSpend={maxSpend} onCreativeClick={onCreativeClick} onToggleStatus={onToggleStatus} providerId={providerId} togglingAdId={togglingAdId}/>))}
    </div>);
}
function formatPercent(value: number): string {
    return `${value.toFixed(2)}%`;
}
function AdListRow({ ad, adMetrics, currency, insightKind, onCreativeClick, onToggleStatus, providerId, togglingAdId, }: {
    ad: CampaignAd;
    adMetrics: Record<string, CreativePerformanceMetrics | undefined>;
    currency: string;
    insightKind?: CreativeInsightKind;
    onCreativeClick: (creative: CampaignAd) => void;
    onToggleStatus: (ad: CampaignAd, nextStatus: string) => void;
    providerId: string;
    togglingAdId: string | null;
}) {
    const [listImageFailed, setListImageFailed] = useState(false);
    const onOpenCreative = () => onCreativeClick(ad);
    const handleToggleStatus = (nextStatus: string) => onToggleStatus(ad, nextStatus);
    const handleListImageError = () => setListImageFailed(true);
    const metrics = getMetricsForAd(ad, adMetrics);
    const permalink = providerId === 'facebook'
        ? resolveMetaSocialPermalink({
            instagramPermalinkUrl: ad.instagramPermalinkUrl,
            objectStoryId: ad.objectStoryId,
        })
        : undefined;
    return (<TableRow className="cursor-pointer hover:bg-muted/50" onClick={onOpenCreative}>
      <TableCell>
        <div className="relative flex size-14 items-center justify-center overflow-hidden rounded-lg border bg-muted">
          {ad.imageUrl && !listImageFailed ? (<NextImage src={ad.imageUrl} alt="" fill unoptimized sizes="56px" className="object-cover" onError={handleListImageError}/>) : ad.imageUrl && listImageFailed ? (<ImageIcon className="size-5 text-muted-foreground/50" aria-hidden/>) : ad.videoUrl ? (<Play className="size-5 text-muted-foreground"/>) : (getCreativeTypeIcon(ad.type, 'size-5 text-muted-foreground'))}
        </div>
      </TableCell>
      <TableCell>
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <p className="max-w-[220px] truncate font-medium">
              {ad.name || ad.headlines?.[0] || ad.descriptions?.[0] || ad.creativeId}
            </p>
            {insightKind ? <CreativeInsightBadge kind={insightKind}/> : null}
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[9px] font-bold uppercase text-muted-foreground">{ad.type}</span>
            {ad.pageName ? (<>
                <span className="text-[9px] text-muted-foreground">•</span>
                <span className="text-[9px] font-medium text-muted-foreground">{ad.pageName}</span>
              </>) : null}
          </div>
        </div>
      </TableCell>
      <TableCell onClick={stopNestedClickPropagation}>
        <div className="flex items-center gap-2">
          <CreativeStatusToggle providerId={providerId} status={ad.status} showLabel onChange={handleToggleStatus} disabled={togglingAdId === ad.creativeId}/>
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
      <TableCell onClick={stopNestedClickPropagation}>
        {permalink ? (<a href={permalink} target="_blank" rel="noopener noreferrer" className="inline-flex text-primary hover:opacity-90" title="Open Instagram or Facebook post" aria-label="Open social permalink">
            <ExternalLink className="size-4"/>
          </a>) : (<span className="text-muted-foreground">Unavailable</span>)}
      </TableCell>
      <TableCell>
        <ChevronRight className="size-4 text-muted-foreground"/>
      </TableCell>
    </TableRow>);
}
export function CampaignAdsList({ adMetrics, ads, creativeInsights, currency, onCreativeClick, onToggleStatus, providerId, togglingAdId, }: {
    adMetrics: Record<string, CreativePerformanceMetrics | undefined>;
    ads: CampaignAd[];
    creativeInsights: Map<string, CreativeInsightKind>;
    currency: string;
    onCreativeClick: (creative: CampaignAd) => void;
    onToggleStatus: (ad: CampaignAd, nextStatus: string) => void;
    providerId: string;
    togglingAdId: string | null;
}) {
    return (<div className="overflow-hidden rounded-xl border border-border/60">
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
          {ads.map((ad) => (<AdListRow key={ad.creativeId} ad={ad} adMetrics={adMetrics} currency={currency} insightKind={creativeInsights.get(ad.creativeId)} onCreativeClick={onCreativeClick} onToggleStatus={onToggleStatus} providerId={providerId} togglingAdId={togglingAdId}/>))}
        </TableBody>
      </Table>
    </div>);
}
