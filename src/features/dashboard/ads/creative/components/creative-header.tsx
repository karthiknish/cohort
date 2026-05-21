import { LazyMotion, domAnimation, m } from '@/shared/ui/motion'
import {
  fadeInDownVariants,
  transitions,
} from '@/lib/motion'
import {
  ArrowLeft,
  RefreshCw,
  Save,
  X,
  MoreHorizontal,
  Share,
  ExternalLink,
  TrendingUp,
  Trash2,
  ChevronRight,
  Sparkles,
} from 'lucide-react'
import Link from 'next/link'

import { ADS_PAGE_THEME } from '@/features/dashboard/ads/components/ads-page-theme'
import { Button } from '@/shared/ui/button'
import { TruncatedTextPreview } from '@/shared/ui/hover-preview'
import { Badge } from '@/shared/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'

import type { Creative } from './types'
import { getTypeIcon } from './helpers'
import { cn } from '@/lib/utils'
import { resolveMetaSocialPermalink } from '@/services/integrations/meta-ads'

function getStatusVariant(status: string): string {
  const s = status.toLowerCase()
  if (s === 'enabled' || s === 'enable' || s === 'active')
    return 'bg-success/10 text-success border-success/20'
  if (s === 'paused' || s === 'disable') return 'bg-warning/10 text-warning border-warning/20'
  if (s === 'deleted' || s === 'removed')
    return 'bg-destructive/10 text-destructive border-destructive/20'
  return 'bg-muted/50 text-muted-foreground border-muted'
}

export function CreativeHeader(props: {
  creative: Creative
  backUrl: string
  displayName: string
  isDirty: boolean
  isSaving: boolean
  onCancelEditing: () => void
  onSave: () => void
  onRefreshCreative: () => void
  onRefreshPerformance: () => void
}) {
  const {
    creative,
    backUrl,
    displayName,
    isDirty,
    isSaving,
    onCancelEditing,
    onSave,
    onRefreshCreative,
    onRefreshPerformance,
  } = props

  const socialPermalink =
    creative.providerId === 'facebook'
      ? resolveMetaSocialPermalink({
          instagramPermalinkUrl: creative.instagramPermalinkUrl,
          objectStoryId: creative.objectStoryId,
        })
      : undefined

  return (
    <LazyMotion features={domAnimation}>
      <m.header
        initial="hidden"
        animate="visible"
        variants={fadeInDownVariants}
        transition={transitions.slow}
        className={cn(ADS_PAGE_THEME.innerHero, 'mb-6')}
      >
        <div className={ADS_PAGE_THEME.innerHeroGlow} aria-hidden />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <Link href={backUrl} className="group shrink-0">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border/60 bg-background/80 transition-colors group-hover:border-primary/25 group-hover:bg-primary/10">
                <ArrowLeft
                  className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-primary"
                  aria-hidden
                />
              </div>
            </Link>

            <div className="min-w-0 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80">
                  <Sparkles className="h-3 w-3 text-primary" aria-hidden />
                  Creative
                  <ChevronRight className="h-3 w-3 opacity-50" aria-hidden />
                  {creative.providerId}
                </span>
                <div
                  className={cn(
                    'rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest',
                    getStatusVariant(creative.status),
                  )}
                >
                  {creative.status}
                </div>
                {isDirty ? (
                  <Badge variant="secondary" className="h-5 gap-1 rounded-full px-2 text-[10px] font-semibold">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />
                    Unsaved
                  </Badge>
                ) : null}
              </div>
              <h1 className="flex flex-wrap items-center gap-2.5 text-xl font-semibold tracking-tight sm:text-2xl">
                <TruncatedTextPreview text={displayName} className="min-w-0 max-w-[min(100%,20rem)]" />
                <span className="shrink-0 rounded-lg border border-border/60 bg-muted/30 p-1.5">
                  {getTypeIcon(creative.type)}
                </span>
                {socialPermalink ? (
                  <a
                    href={socialPermalink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border/60 text-muted-foreground hover:border-primary/30 hover:text-primary"
                    title="Open post on Instagram or Facebook"
                    aria-label="Open social permalink"
                  >
                    <ExternalLink className="h-4 w-4" aria-hidden />
                  </a>
                ) : null}
              </h1>
              {creative.campaignName ? (
                <p className="text-sm text-muted-foreground">
                  Campaign: <span className="font-medium text-foreground">{creative.campaignName}</span>
                </p>
              ) : null}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
            {isDirty ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onCancelEditing}
                  disabled={isSaving}
                  className="h-10 rounded-xl border-border/70"
                >
                  <X className="mr-1.5 h-3.5 w-3.5" aria-hidden />
                  Discard
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={onSave}
                  disabled={isSaving}
                  className="h-10 rounded-full px-5 text-sm font-semibold shadow-sm"
                >
                  {isSaving ? (
                    <RefreshCw className="mr-1.5 h-3.5 w-3.5 animate-spin" aria-hidden />
                  ) : (
                    <Save className="mr-1.5 h-3.5 w-3.5" aria-hidden />
                  )}
                  {isSaving ? 'Saving…' : 'Save changes'}
                </Button>
              </>
            ) : (
              <div className="hidden items-center gap-1.5 border-r border-border/50 pr-3 lg:flex">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-10 rounded-xl border border-transparent px-3 text-xs font-medium text-muted-foreground hover:border-border/60 hover:bg-muted/40"
                >
                  <Share className="mr-2 h-4 w-4" aria-hidden />
                  Export
                </Button>
              </div>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 rounded-xl border-border/70"
                  aria-label="Creative actions"
                >
                  <MoreHorizontal className="h-5 w-5" aria-hidden />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-60 rounded-2xl border-border/60 p-2 shadow-xl"
              >
                <DropdownMenuItem onClick={onRefreshCreative} className="cursor-pointer gap-3 rounded-xl py-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted/50">
                    <RefreshCw className="h-4 w-4 text-muted-foreground" aria-hidden />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold">Sync from Meta</span>
                    <span className="text-[10px] text-muted-foreground">Refresh creative data</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onRefreshPerformance} className="cursor-pointer gap-3 rounded-xl py-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted/50">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" aria-hidden />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold">Update metrics</span>
                    <span className="text-[10px] text-muted-foreground">Reload performance stats</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="my-2" />
                <DropdownMenuItem className="cursor-pointer gap-3 rounded-xl py-2.5 text-destructive focus:bg-destructive/10 focus:text-destructive">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/10">
                    <Trash2 className="h-4 w-4 text-destructive" aria-hidden />
                  </div>
                  <span className="text-sm font-semibold">Delete asset</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </m.header>
    </LazyMotion>
  )
}
