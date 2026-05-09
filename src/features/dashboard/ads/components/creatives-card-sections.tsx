'use client'

import NextImage from 'next/image'
import { useCallback, useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import { BarChart2, CheckSquare, ExternalLink, FileText, GalleryHorizontal, Image as ImageIcon, ImageOff, Layers, Link2, ShoppingBag, Square, Video } from 'lucide-react'

import { resolveMetaSocialPermalink } from '@/services/integrations/meta-ads'

import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/shared/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/shared/ui/tooltip'

export type Creative = {
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
  thumbnailUrl?: string
  videoUrl?: string
  landingPageUrl?: string
  callToAction?: string
  pageName?: string
  pageProfileImageUrl?: string
  isLeadGen?: boolean
  instagramPermalinkUrl?: string
  objectStoryId?: string
}

function CreativeImage({ src, alt, fallbackSrc }: { src?: string; alt?: string; fallbackSrc?: string }) {
  const [error, setError] = useState(false)
  const [useFallback, setUseFallback] = useState(false)
  const imageStyle = useMemo<CSSProperties>(() => ({ imageRendering: 'crisp-edges' }), [])
  const handleImageError = useCallback(() => {
    if (fallbackSrc && !useFallback) setUseFallback(true)
    else setError(true)
  }, [fallbackSrc, useFallback])

  if (!src || error) return <ImageOff className="h-8 w-8 text-muted-foreground" />
  const currentSrc = useFallback ? fallbackSrc ?? src : src
  return <div className="relative h-full w-full"><NextImage src={currentSrc} alt={alt || ''} fill unoptimized sizes="(max-width: 768px) 100vw, 320px" className="object-cover" style={imageStyle} onError={handleImageError} /></div>
}

function getTypeIcon(type: string) {
  const normalized = type.toLowerCase()
  if (normalized.includes('lead')) return <span className="text-xs font-medium">LG</span>
  if (normalized.includes('carousel')) return <GalleryHorizontal className="h-4 w-4" aria-hidden />
  if (normalized.includes('dynamic_product')) return <ShoppingBag className="h-4 w-4" aria-hidden />
  if (normalized.includes('dynamic_creative')) return <Layers className="h-4 w-4" aria-hidden />
  if (normalized.includes('boosted') || normalized.includes('page_post')) return <Link2 className="h-4 w-4" aria-hidden />
  if (normalized.includes('video')) return <Video className="h-4 w-4" />
  if (normalized.includes('image') || normalized.includes('display')) return <ImageIcon className="h-4 w-4" />
  return <FileText className="h-4 w-4" />
}

function getStatusBadge(status: string) {
  const normalized = status.toLowerCase()
  if (normalized === 'enabled' || normalized === 'enable' || normalized === 'active') return <Badge variant="default" className="bg-success">Active</Badge>
  if (normalized === 'paused' || normalized === 'disable') return <Badge variant="secondary">Paused</Badge>
  return <Badge variant="outline">{status}</Badge>
}

export function CreativesDisconnectedState({ providerName }: { providerName: string }) {
  return <Card><CardHeader><CardTitle className="text-lg">Creatives</CardTitle><CardDescription>Connect {providerName} to view creatives</CardDescription></CardHeader></Card>
}

export function CreativesCardHeader({ loading, onCompare, onLoad, providerName, selectedCount, summary }: { loading: boolean; onCompare: () => void; onLoad: () => void; providerName: string; selectedCount: number; summary: { total: number; byType: Record<string, number> } | null }) {
  return <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><div><CardTitle className="text-lg">Creatives</CardTitle><CardDescription>{summary ? `${summary.total} creatives` : `View ${providerName} ad creatives`}</CardDescription></div><div className="flex gap-2">{selectedCount > 1 ? <Button variant="default" size="sm" onClick={onCompare}><BarChart2 className="mr-2 h-4 w-4" />Compare &amp; Test ({selectedCount})</Button> : null}<Button variant="outline" size="sm" onClick={onLoad} disabled={loading}><span className={`mr-2 inline-flex h-4 w-4 items-center justify-center ${loading ? 'animate-spin' : ''}`}>↻</span>Load Creatives</Button></div></CardHeader>
}

export function CreativesCardContent({ creatives, onToggleSelected, selectedIds, summary }: { creatives: Creative[]; onToggleSelected: (creativeId: string) => void; selectedIds: Set<string>; summary: { total: number; byType: Record<string, number> } | null }) {
  const toggleSelectedHandlers = useMemo(
    () => Object.fromEntries(creatives.map((creative) => [creative.creativeId, () => onToggleSelected(creative.creativeId)])) as Record<string, () => void>,
    [creatives, onToggleSelected]
  )

  if (creatives.length === 0) return <CardContent><p className="text-sm text-muted-foreground">Click &quot;Load Creatives&quot; to view your ad creatives.</p></CardContent>
  return <CardContent>{summary ? <div className="mb-4 flex flex-wrap gap-2">{Object.entries(summary.byType).map(([type, count]) => <Badge key={type} variant="outline" className="text-xs">{type}: {count}</Badge>)}</div> : null}<div className="max-h-[400px] overflow-auto"><Table><TableHeader><TableRow><TableHead className="w-[40px]"></TableHead><TableHead>Type</TableHead><TableHead>Name</TableHead><TableHead>Headlines</TableHead><TableHead>Status</TableHead><TableHead>Landing</TableHead><TableHead>Permalink</TableHead></TableRow></TableHeader><TableBody>{creatives.map((creative) => {
    const permalink = resolveMetaSocialPermalink({
      instagramPermalinkUrl: creative.instagramPermalinkUrl,
      objectStoryId: creative.objectStoryId,
    })
    return <TableRow key={creative.creativeId} className={selectedIds.has(creative.creativeId) ? 'bg-accent/5' : ''}><TableCell><button type="button" onClick={toggleSelectedHandlers[creative.creativeId]} className="transition-colors hover:text-primary">{selectedIds.has(creative.creativeId) ? <CheckSquare className="h-4 w-4 text-primary" /> : <Square className="h-4 w-4 text-muted-foreground" />}</button></TableCell><TableCell><div className="flex items-center gap-2">{getTypeIcon(creative.type)}<span className="text-xs capitalize text-muted-foreground">{creative.type.toLowerCase().replace(/_/g, ' ')}</span>{creative.isLeadGen ? <Badge variant="outline" className="h-4 px-1 py-0 text-[10px]">Lead</Badge> : null}</div></TableCell><TableCell><div className="flex flex-col"><p className="max-w-[200px] truncate font-medium">{creative.name || creative.campaignName || creative.creativeId}</p>{creative.pageName ? <p className="max-w-[150px] truncate text-[10px] text-muted-foreground">via {creative.pageName}</p> : null}</div></TableCell><TableCell className="max-w-[250px]">{creative.headlines && creative.headlines.length > 0 ? <TooltipProvider><Tooltip><TooltipTrigger className="text-left"><span className="block truncate text-sm">{creative.headlines[0]}</span></TooltipTrigger><TooltipContent><div className="max-w-[300px]">{creative.headlines.map((headline) => <p key={`${creative.creativeId}-${headline}`} className="mb-1 text-xs">{headline}</p>)}</div></TooltipContent></Tooltip></TooltipProvider> : <span className="text-muted-foreground">-</span>}</TableCell><TableCell>{getStatusBadge(creative.status)}</TableCell><TableCell>{creative.landingPageUrl ? <a href={creative.landingPageUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline" title="Landing page"><ExternalLink className="h-4 w-4" /></a> : <span className="text-muted-foreground">Unavailable</span>}</TableCell><TableCell>{permalink ? <a href={permalink} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline" title="Instagram or Facebook post"><ExternalLink className="h-4 w-4" /></a> : <span className="text-muted-foreground">Unavailable</span>}</TableCell></TableRow>
  })}</TableBody></Table></div></CardContent>
}

export function CreativeComparisonDialog({ creatives, onOpenChange, onPromote, open, providerName, selectedIds }: { creatives: Creative[]; onOpenChange: (open: boolean) => void; onPromote: () => void; open: boolean; providerName: string; selectedIds: Set<string> }) {
  const handleClose = useCallback(() => onOpenChange(false), [onOpenChange])

  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="max-h-[90vh] max-w-5xl overflow-auto"><DialogHeader><DialogTitle className="flex items-center gap-2"><BarChart2 className="h-5 w-5" />Creative Comparison &amp; A/B Testing</DialogTitle><DialogDescription>Comparing {selectedIds.size} selected creatives across {providerName}</DialogDescription></DialogHeader><div className="grid grid-cols-1 gap-6 py-4 md:grid-cols-2 lg:grid-cols-3">{creatives.filter((creative) => selectedIds.has(creative.creativeId)).map((creative) => <div key={creative.creativeId} className="relative space-y-4 rounded-xl border bg-muted/20 p-4"><div className="absolute right-2 top-2 flex items-center gap-2">{creative.pageProfileImageUrl ? <Avatar className="h-4 w-4 ring-1 ring-background"><AvatarImage src={creative.pageProfileImageUrl} /><AvatarFallback className="text-[6px]">{creative.pageName?.[0]}</AvatarFallback></Avatar> : null}{getStatusBadge(creative.status)}</div><div className="flex aspect-video items-center justify-center overflow-hidden rounded-lg border bg-muted">{creative.imageUrl ? <CreativeImage key={`${creative.creativeId}-${creative.imageUrl ?? ''}-${creative.thumbnailUrl ?? ''}`} src={creative.imageUrl} alt="" fallbackSrc={creative.thumbnailUrl} /> : creative.videoUrl ? <Video className="h-8 w-8 text-muted-foreground" /> : <FileText className="h-8 w-8 text-muted-foreground" />}</div>{creative.pageName ? <div className="flex items-center gap-1.5 pt-1"><span className="text-[10px] font-medium uppercase tracking-tight text-muted-foreground">{creative.pageName}</span></div> : null}<div className="space-y-2"><h3 className="line-clamp-2 text-sm font-semibold">{creative.headlines && creative.headlines.length > 0 ? creative.headlines[0] : 'No Headline'}</h3><p className="line-clamp-3 text-xs text-muted-foreground">{creative.descriptions && creative.descriptions.length > 0 ? creative.descriptions[0] : 'No Description'}</p></div><div className="space-y-2 border-t pt-2"><div className="flex justify-between text-xs"><span className="text-muted-foreground">Type:</span><span className="capitalize">{creative.type.toLowerCase().replace(/_/g, ' ')}</span></div>{creative.callToAction ? <div className="flex justify-between text-xs"><span className="text-muted-foreground">CTA:</span><span>{creative.callToAction}</span></div> : null}</div><Button variant="outline" className="h-8 w-full text-xs" onClick={onPromote}>Promote to Winner</Button></div>)}</div><DialogFooter className="flex items-center justify-between sm:justify-between"><p className="text-xs text-muted-foreground">Tip: Compare CTR and Conversion Rates on the Analytics page to determine the winner.</p><Button onClick={handleClose}>Close</Button></DialogFooter></DialogContent></Dialog>
}
