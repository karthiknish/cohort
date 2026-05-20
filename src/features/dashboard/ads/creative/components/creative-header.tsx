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
} from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/shared/ui/button'
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
  if (s === 'enabled' || s === 'enable' || s === 'active') return 'bg-success/10 text-success border-success/20'
  if (s === 'paused' || s === 'disable') return 'bg-warning/10 text-warning border-warning/20'
  if (s === 'deleted' || s === 'removed') return 'bg-destructive/10 text-destructive border-destructive/20'
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
      <m.div
        initial="hidden"
        animate="visible"
        variants={fadeInDownVariants}
        transition={transitions.slow}
        className="mb-6 flex flex-col gap-4 border-b bg-background/80 px-1 py-5 backdrop-blur-md sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex items-center gap-4">
          <Link href={backUrl} className="group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-muted-foreground/10 bg-muted/50 group-hover:border-accent/20 group-hover:bg-accent/10 motion-chromatic-lg">
              <ArrowLeft className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-primary" />
            </div>
          </Link>

          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">
                Ads
                <ChevronRight className="mx-1 h-3 w-3 opacity-50" />
                {creative.providerId}
              </div>
              <div
                className={cn(
                  'rounded-full border px-2 py-0.5 text-[9px] font-black uppercase tracking-widest',
                  getStatusVariant(creative.status),
                )}
              >
                {creative.status}
              </div>
              {isDirty ? (
                <Badge variant="secondary" className="h-5 gap-1 px-2 text-[10px] font-semibold">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Unsaved
                </Badge>
              ) : null}
            </div>
            <h1 className="flex items-center gap-2.5 text-xl font-bold tracking-tight">
              <span className="truncate">{displayName}</span>
              <span className="shrink-0 rounded-lg border border-muted-foreground/10 bg-muted-foreground/5 p-1">
                {getTypeIcon(creative.type)}
              </span>
              {socialPermalink ? (
                <a
                  href={socialPermalink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-muted-foreground/15 text-muted-foreground hover:border-accent/30 hover:text-primary"
                  title="Open post on Instagram or Facebook"
                  aria-label="Open social permalink"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              ) : null}
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isDirty ? (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onCancelEditing}
                disabled={isSaving}
                className="h-9 rounded-xl"
              >
                <X className="mr-1.5 h-3.5 w-3.5" />
                Discard
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={onSave}
                disabled={isSaving}
                className="h-9 rounded-xl bg-primary px-5 text-xs font-bold shadow-lg shadow-primary/20 hover:bg-accent/90"
              >
                {isSaving ? (
                  <RefreshCw className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Save className="mr-1.5 h-3.5 w-3.5" />
                )}
                {isSaving ? 'Saving…' : 'Save changes'}
              </Button>
            </>
          ) : (
            <div className="hidden items-center gap-1.5 border-r border-muted-foreground/10 pr-3 lg:flex">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-9 rounded-xl border border-transparent px-3 text-xs font-medium text-muted-foreground hover:border-muted-foreground/10 hover:bg-muted/50"
              >
                <Share className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-xl border border-transparent transition-[background-color,border-color] hover:border-muted-foreground/10 hover:bg-muted/50"
                aria-label="Creative actions"
              >
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60 rounded-2xl border-muted-foreground/10 p-2 shadow-2xl">
              <DropdownMenuItem onClick={onRefreshCreative} className="cursor-pointer gap-3 rounded-xl py-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted/50">
                  <RefreshCw className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold">Sync from Meta</span>
                  <span className="text-[10px] text-muted-foreground">Refresh creative data</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onRefreshPerformance} className="cursor-pointer gap-3 rounded-xl py-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted/50">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold">Update metrics</span>
                  <span className="text-[10px] text-muted-foreground">Reload performance stats</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="my-2" />
              <DropdownMenuItem className="cursor-pointer gap-3 rounded-xl py-2.5 text-destructive focus:bg-destructive/10 focus:text-destructive">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/10">
                  <Trash2 className="h-4 w-4 text-destructive" />
                </div>
                <span className="text-sm font-semibold">Delete asset</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </m.div>
    </LazyMotion>
  )
}
