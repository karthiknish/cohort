import React, { useReducer, useCallback, useMemo } from 'react'
import NextImage from 'next/image'
import { AnimatePresence, LazyMotion, domAnimation, m } from '@/shared/ui/motion'
import {
  fadeInUpVariants,
  slideInLeftVariants,
  scaleVariants,
  transitions,
  easings,
} from '@/lib/motion'
import {
  FileText,
  Image as ImageIcon,
  Video,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MoreHorizontal,
  Facebook,
  Instagram,
  Linkedin,
  Globe,
  Activity,
  RectangleVertical,
  Square,
  Play,
  Pause,
  ThumbsUp,
  Maximize2,
} from 'lucide-react'

import type { AdMetricsSummary } from '@/lib/ad-algorithms'
import { cn } from '@/lib/utils'
import { motionLoopSeconds } from '@/lib/animation-system'

import type { Creative } from './types'
import { isDirectVideoUrl, formatCTALabel } from './helpers'

import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/shared/ui/dialog'
import { Tabs, TabsList, TabsTrigger } from '@/shared/ui/tabs'

const crispEdgesStyle: React.CSSProperties = { imageRendering: 'crisp-edges' }
const whileHoverScale: { scale: number } = { scale: 1.1 }
const whileTapScale: { scale: number } = { scale: 0.9 }
const exitSlideLeft: { opacity: number; x: number } = { opacity: 0, x: -20 }
const progressBarInitial: { width: number } = { width: 0 }
const progressBarTransition = { duration: motionLoopSeconds.shimmer, ease: easings.easeOut }

export type CreativePerformanceSummary = AdMetricsSummary & {
  ctr: number
  roas: number
  cpc: number
}

type Platform = 'facebook' | 'instagram' | 'linkedin' | 'tiktok'

type CreativeSocialPreviewState = {
  imageLoadFailed: boolean
  imageLightboxOpen: boolean
  profileImageError: boolean
  aspectRatio: 'feed' | 'reel'
  isPlaying: boolean
  activePlatform: Platform
}

type CreativeSocialPreviewAction =
  | { type: 'setImageLoadFailed'; value: boolean }
  | { type: 'setImageLightboxOpen'; value: boolean }
  | { type: 'setProfileImageError'; value: boolean }
  | { type: 'setAspectRatio'; value: 'feed' | 'reel' }
  | { type: 'setIsPlaying'; value: boolean }
  | { type: 'setActivePlatform'; value: Platform }

function createInitialCreativeSocialPreviewState(defaultPlatform: Platform): CreativeSocialPreviewState {
  return {
    imageLoadFailed: false,
    imageLightboxOpen: false,
    profileImageError: false,
    aspectRatio: 'feed',
    isPlaying: false,
    activePlatform: defaultPlatform,
  }
}

function creativeSocialPreviewReducer(
  state: CreativeSocialPreviewState,
  action: CreativeSocialPreviewAction,
): CreativeSocialPreviewState {
  switch (action.type) {
    case 'setImageLoadFailed':
      return { ...state, imageLoadFailed: action.value }
    case 'setImageLightboxOpen':
      return { ...state, imageLightboxOpen: action.value }
    case 'setProfileImageError':
      return { ...state, profileImageError: action.value }
    case 'setAspectRatio':
      return { ...state, aspectRatio: action.value }
    case 'setIsPlaying':
      return { ...state, isPlaying: action.value }
    case 'setActivePlatform':
      return { ...state, activePlatform: action.value }
    default:
      return state
  }
}

function safeHostname(url: string | undefined, fallback: string): string {
  if (!url) return fallback
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return fallback
  }
}

function PreviewAvatar(props: {
  pageName: string
  profileImageUrl?: string
  profileImageError: boolean
  onProfileImageError: () => void
  className?: string
  ringClassName?: string
}) {
  const { pageName, profileImageUrl, profileImageError, onProfileImageError, className, ringClassName } = props
  const initial = pageName.slice(0, 1).toUpperCase()

  return (
    <div className={cn('shrink-0 overflow-hidden rounded-full', ringClassName, className)}>
      {profileImageUrl && !profileImageError ? (
        <NextImage
          src={profileImageUrl}
          alt=""
          width={40}
          height={40}
          unoptimized
          className="size-full object-cover"
          onError={onProfileImageError}
          style={crispEdgesStyle}
        />
      ) : (
        <div className="flex size-full items-center justify-center bg-[#e4e6eb] text-sm font-semibold text-[#050505]">
          {initial}
        </div>
      )}
    </div>
  )
}

function PreviewVariantButton({
  index,
  selected,
  onSelect,
}: {
  index: number
  selected: boolean
  onSelect: (index: number) => void
}) {
  const onSelectPreview = useCallback(() => onSelect(index), [index, onSelect])

  return (
    <button
      type="button"
      onClick={onSelectPreview}
      className={cn(
        'h-6 min-w-6 rounded-md px-1.5 text-[10px] font-bold transition-colors',
        selected
          ? 'bg-primary text-primary-foreground'
          : 'bg-muted/50 text-muted-foreground hover:bg-muted',
      )}
    >
      {index + 1}
    </button>
  )
}

export function CreativeSocialPreview(props: {
  creative: Creative
  campaignName: string
  displayName: string
  performanceSummary: CreativePerformanceSummary | null
  efficiencyScore: number | null
  headlineVariantCount?: number
  descriptionVariantCount?: number
  previewHeadlineIndex?: number
  previewDescriptionIndex?: number
  onPreviewHeadlineIndexChange?: (index: number) => void
  onPreviewDescriptionIndexChange?: (index: number) => void
}) {
  const {
    creative,
    campaignName,
    displayName,
    performanceSummary,
    efficiencyScore,
    headlineVariantCount = 0,
    descriptionVariantCount = 0,
    previewHeadlineIndex = 0,
    previewDescriptionIndex = 0,
    onPreviewHeadlineIndexChange,
    onPreviewDescriptionIndexChange,
  } = props

  const availablePlatforms: Platform[] = creative.providerId === 'linkedin'
    ? ['linkedin']
    : creative.providerId === 'tiktok'
      ? ['tiktok' as Platform]
      : ['facebook', 'instagram']

  const [previewState, dispatch] = useReducer(
    creativeSocialPreviewReducer,
    availablePlatforms[0] ?? 'facebook',
    createInitialCreativeSocialPreviewState,
  )
  const {
    imageLoadFailed,
    imageLightboxOpen,
    profileImageError,
    aspectRatio,
    isPlaying,
    activePlatform,
  } = previewState

  const videoRef = React.useRef<HTMLVideoElement>(null)

  const mediaAspectClass = aspectRatio === 'reel' ? 'aspect-[9/16]' : 'aspect-square'

  const handlePlay = useCallback(() => dispatch({ type: 'setIsPlaying', value: true }), [])
  const handlePause = useCallback(() => dispatch({ type: 'setIsPlaying', value: false }), [])
  const handleEnded = useCallback(() => dispatch({ type: 'setIsPlaying', value: false }), [])
  const handleImageLoadFailed = useCallback(() => dispatch({ type: 'setImageLoadFailed', value: true }), [])
  const handleOpenImageLightbox = useCallback(() => dispatch({ type: 'setImageLightboxOpen', value: true }), [])
  const handleProfileImageError = useCallback(() => dispatch({ type: 'setProfileImageError', value: true }), [])
  const handleSetFeed = useCallback(() => dispatch({ type: 'setAspectRatio', value: 'feed' }), [])
  const handleSetReel = useCallback(() => dispatch({ type: 'setAspectRatio', value: 'reel' }), [])
  const handleImageLightboxOpenChange = useCallback(
    (value: boolean) => dispatch({ type: 'setImageLightboxOpen', value }),
    [],
  )
  const togglePlayPause = useCallback(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      dispatch({ type: 'setIsPlaying', value: !isPlaying })
    }
  }, [isPlaying])

  const scoreCardTransition = useMemo(() => ({ ...transitions.slow, delay: 0.2 }), [])
  const progressBarAnimate = useMemo(() => ({ width: `${efficiencyScore}%` }), [efficiencyScore])

  const pageDisplayName = useMemo(
    () => creative.pageName || creative.campaignName || creative.name || campaignName,
    [campaignName, creative.campaignName, creative.name, creative.pageName],
  )

  const handlePreviewHeadlineSelect = useCallback(
    (index: number) => onPreviewHeadlineIndexChange?.(index),
    [onPreviewHeadlineIndexChange],
  )

  const handlePreviewDescriptionSelect = useCallback(
    (index: number) => onPreviewDescriptionIndexChange?.(index),
    [onPreviewDescriptionIndexChange],
  )

  const primaryText = creative.descriptions?.[0] || ''
  const headlineText = creative.headlines?.[0] || displayName
  const landingHostname = useMemo(
    () => safeHostname(creative.landingPageUrl, pageDisplayName.replace(/\s+/g, '').toLowerCase() + '.com'),
    [creative.landingPageUrl, pageDisplayName],
  )

  const renderMedia = () => {
    if (creative.videoUrl && isDirectVideoUrl(creative.videoUrl)) {
      return (
        <div className={cn("relative bg-foreground overflow-hidden group/video", mediaAspectClass)}>
          <video
            ref={videoRef}
            src={creative.videoUrl}
            className="size-full object-cover"
            poster={creative.imageUrl || creative.thumbnailUrl}
            onPlay={handlePlay}
            onPause={handlePause}
            onEnded={handleEnded}
            style={crispEdgesStyle}
          >
            <track kind="captions" />
          </video>
          <button
            type="button"
            onClick={togglePlayPause}
            className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/video:opacity-100 transition-opacity duration-[var(--motion-duration-normal)] ease-[var(--motion-ease-out)] motion-reduce:transition-none"
          >
            <div className="size-14 rounded-full bg-background/40 backdrop-blur-xl border border-background/20 flex items-center justify-center shadow-2xl">
              {isPlaying ? <Pause className="size-6 text-background" /> : <Play className="size-6 text-background ml-1" />}
            </div>
          </button>
        </div>
      )
    }

    if (creative.videoUrl) {
      return (
        <div className={cn("relative bg-foreground flex items-center justify-center overflow-hidden group", mediaAspectClass)}>
          {creative.imageUrl && !imageLoadFailed ? (
            <NextImage
              src={creative.imageUrl}
              alt={displayName}
              fill
              unoptimized
              sizes="(max-width: 768px) 100vw, 640px"
              className="object-cover opacity-70 group-hover:scale-105 transition-transform duration-[var(--motion-duration-xslow)] ease-[var(--motion-ease-out)] motion-reduce:transition-none"
              onError={handleImageLoadFailed}
              style={crispEdgesStyle}
            />
          ) : (
            <div className="text-muted-foreground flex flex-col items-center">
              <Video className="size-10 mb-2 opacity-20" />
              <p className="text-[10px] text-background/40 uppercase tracking-widest font-black">Video Preview</p>
            </div>
          )}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-[var(--motion-duration-normal)] ease-[var(--motion-ease-out)] motion-reduce:transition-none">
          <m.div
            whileHover={whileHoverScale}
            whileTap={whileTapScale}
            variants={scaleVariants}
            className="size-14 rounded-full bg-background/40 backdrop-blur-xl border border-background/20 flex items-center justify-center shadow-2xl cursor-pointer"
          >
              <Video className="size-6 text-background" />
            </m.div>
          </div>
          <div className="absolute bottom-4 left-4 flex gap-2">
            <div className="rounded-md bg-foreground/60 backdrop-blur-md text-background px-2 py-0.5 text-[8px] font-black tracking-widest uppercase border border-background/10">
              4K Stream
            </div>
          </div>
        </div>
      )
    }

    if (creative.imageUrl) {
      return (
        <>
          <div className={cn('relative overflow-hidden bg-muted/10 group', mediaAspectClass)}>
            {imageLoadFailed ? (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                <ImageIcon className="mb-2 size-8 opacity-20" aria-hidden />
                <p className="text-[10px] font-bold uppercase tracking-tighter">Asset Unavailable</p>
              </div>
            ) : (
              <button
                type="button"
                className="relative block size-full cursor-zoom-in"
                onClick={handleOpenImageLightbox}
                aria-label={`View full image for ${displayName}`}
              >
                <NextImage
                  src={creative.imageUrl}
                  alt={displayName}
                  fill
                  unoptimized
                  sizes="(max-width: 768px) 100vw, 640px"
                  className="object-cover transition-transform duration-[var(--motion-duration-xslow)] ease-[var(--motion-ease-out)] motion-reduce:transition-none group-hover:scale-110"
                  onError={handleImageLoadFailed}
                  style={crispEdgesStyle}
                />
              </button>
            )}
            {!imageLoadFailed ? (
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-foreground/20 to-transparent opacity-0 transition-opacity duration-[var(--motion-duration-slow)] ease-[var(--motion-ease-out)] group-hover:opacity-100 motion-reduce:opacity-0" />
            ) : null}
            {!imageLoadFailed ? (
              <div className="absolute bottom-3 right-3 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  className="pointer-events-auto h-8 gap-1.5 bg-background/95 shadow-md"
                  onClick={handleOpenImageLightbox}
                >
                  <Maximize2 className="size-3.5" aria-hidden />
                  Expand
                </Button>
              </div>
            ) : null}
          </div>
          <Dialog open={imageLightboxOpen} onOpenChange={handleImageLightboxOpenChange}>
            <DialogContent className="max-w-4xl gap-0 overflow-hidden border-border/60 p-0">
              <DialogTitle className="sr-only">{displayName}</DialogTitle>
              <DialogDescription className="sr-only">Full-size creative preview</DialogDescription>
              <div className="relative max-h-[85vh] min-h-[240px] w-full bg-foreground/95">
                <NextImage
                  src={creative.imageUrl}
                  alt={displayName}
                  width={1200}
                  height={1200}
                  unoptimized
                  className="mx-auto h-auto max-h-[85vh] w-full object-contain"
                  onError={handleImageLoadFailed}
                />
              </div>
            </DialogContent>
          </Dialog>
        </>
      )
    }

    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground bg-muted/5 rounded-2xl border-2 border-dashed border-muted">
        <FileText className="size-10 mb-2 opacity-10" />
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">No Asset Data</p>
      </div>
    )
  }

  const renderPlatformMock = () => {
    return (
      <AnimatePresence mode="wait">
        <m.div
          key={activePlatform}
          initial="hidden"
          animate="visible"
          exit={exitSlideLeft}
          variants={slideInLeftVariants}
          transition={transitions.normal}
          className="w-full"
        >
          {activePlatform === 'instagram' && (
            <div className="overflow-hidden bg-white text-[#262626]">
              {/* IG feed: header */}
              <div className="flex items-center justify-between px-3 py-2.5">
                <div className="flex min-w-0 items-center gap-2.5">
                  <PreviewAvatar
                    pageName={pageDisplayName}
                    profileImageUrl={creative.pageProfileImageUrl}
                    profileImageError={profileImageError}
                    onProfileImageError={handleProfileImageError}
                    className="size-8"
                    ringClassName="p-[2px] bg-gradient-to-tr from-[#feda75] via-[#fa7e1e] to-[#d62976]"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-semibold leading-tight">{pageDisplayName}</p>
                    <p className="text-[11px] leading-tight text-[#8e8e8e]">Sponsored</p>
                  </div>
                </div>
                <MoreHorizontal className="size-5 shrink-0 text-[#262626]" strokeWidth={1.75} />
              </div>

              {/* Primary text above media (common for IG link ads) */}
              {primaryText ? (
                <div className="px-3 pb-3 pt-0.5">
                  <p className="whitespace-pre-wrap text-[14px] leading-[1.4] text-[#262626]">{primaryText}</p>
                </div>
              ) : null}

              {/* Media — full bleed */}
              <div className="w-full">{renderMedia()}</div>

              {/* Action row */}
              <div className="flex items-center justify-between px-3 py-2.5">
                <div className="flex items-center gap-4">
                  <Heart className="size-6" strokeWidth={1.75} />
                  <MessageCircle className="size-6" strokeWidth={1.75} />
                  <Share2 className="size-6" strokeWidth={1.75} />
                </div>
                <Bookmark className="size-6" strokeWidth={1.75} />
              </div>

              <div className="space-y-1 px-3 pb-2">
                <p className="text-[13px] font-semibold">11,492 likes</p>
                {!primaryText ? (
                  <p className="text-[14px] leading-[1.4]">
                    <span className="font-semibold">{pageDisplayName}</span>{' '}
                    <span className="font-normal text-[#262626]">See more</span>
                  </p>
                ) : null}
                {headlineText ? (
                  <p className="text-[13px] font-medium text-[#00376b]">{headlineText}</p>
                ) : null}
              </div>

              {creative.callToAction ? (
                <div className="border-t border-[#efefef] px-3 py-2.5">
                  <button
                    type="button"
                    className="w-full rounded-lg bg-[#0095f6] py-2 text-center text-[14px] font-semibold text-white"
                  >
                    {formatCTALabel(creative.callToAction)}
                  </button>
                </div>
              ) : null}
            </div>
          )}

          {activePlatform === 'linkedin' && (
            <div className="bg-background rounded-tr-[2.5rem] rounded-tl-[2.5rem] overflow-hidden text-left">
              <div className="p-4 flex items-center gap-3">
                <div className="size-10 rounded-lg bg-info flex items-center justify-center text-info-foreground font-black text-lg overflow-hidden shrink-0">
                  {creative.pageProfileImageUrl && !profileImageError ? (
                    <NextImage
                      src={creative.pageProfileImageUrl}
                      alt=""
                      width={40}
                      height={40}
                      unoptimized
                      className="size-full object-cover"
                      onError={handleProfileImageError}
                      style={crispEdgesStyle}
                    />
                  ) : (
                    (creative.pageName || creative.campaignName || campaignName || 'A').slice(0, 1).toUpperCase()
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-bold leading-tight truncate">{creative.pageName || creative.campaignName || campaignName}</p>
                  <p className="text-[11px] opacity-60 leading-tight">Promoted</p>
                </div>
              </div>

              <div className="px-4 pb-3">
                <p className="text-xs leading-relaxed line-clamp-2">
                  {creative.descriptions?.[0] || 'No description available.'}
                </p>
              </div>

              {renderMedia()}

              <div className="p-4 bg-muted/5 flex items-center justify-between border-y border-muted-foreground/10">
                <div className="min-w-0 pr-4 space-y-0.5">
                  <p className="text-[13px] font-bold truncate tracking-tight">{creative.headlines?.[0] || displayName}</p>
                  <p className="text-[11px] opacity-50 truncate font-medium uppercase tracking-wider">{new URL(creative.landingPageUrl || 'https://learnmore.com').hostname}</p>
                </div>
                {creative.callToAction && (
                  <Button variant="outline" className="h-9 px-4 text-[11px] font-black uppercase tracking-widest border-info text-info hover:bg-info/10 shrink-0 rounded-full">
                    {formatCTALabel(creative.callToAction)}
                  </Button>
                )}
              </div>

              <div className="px-5 py-3 flex items-center gap-6 opacity-60">
                <span className="text-[11px] font-bold flex items-center gap-1.5"><Heart className="size-4" /> Like</span>
                <span className="text-[11px] font-bold flex items-center gap-1.5"><MessageCircle className="size-4" /> Comment</span>
                <span className="text-[11px] font-bold flex items-center gap-1.5"><Share2 className="size-4" /> Repost</span>
              </div>
            </div>
          )}

          {activePlatform === 'tiktok' && (
            <div className="bg-background rounded-tr-[2.5rem] rounded-tl-[2.5rem] overflow-hidden text-left">
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-foreground text-background flex items-center justify-center font-black text-sm overflow-hidden shrink-0">
                    {creative.pageProfileImageUrl && !profileImageError ? (
                      <NextImage
                        src={creative.pageProfileImageUrl}
                        alt=""
                        width={40}
                        height={40}
                        unoptimized
                        className="size-full object-cover"
                        onError={handleProfileImageError}
                        style={crispEdgesStyle}
                      />
                    ) : (
                      (creative.pageName || creative.campaignName || campaignName || 'A').slice(0, 1).toUpperCase()
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-bold leading-tight truncate">{creative.pageName || creative.campaignName || campaignName}</p>
                    <p className="text-[11px] opacity-60 leading-tight">Sponsored content</p>
                  </div>
                </div>
                <MoreHorizontal className="size-4 opacity-40" />
              </div>

              {renderMedia()}

              <div className="p-4 space-y-4">
                <div className="flex items-center gap-6 text-[11px] font-bold opacity-80">
                  <span className="flex items-center gap-1.5"><Heart className="size-4" /> 12.4K</span>
                  <span className="flex items-center gap-1.5"><MessageCircle className="size-4" /> 418</span>
                  <span className="flex items-center gap-1.5"><Share2 className="size-4" /> 109</span>
                </div>

                <div className="space-y-1.5">
                  <p className="text-[13px] font-bold truncate">{creative.headlines?.[0] || displayName}</p>
                  <p className="text-xs leading-relaxed line-clamp-3 text-foreground/80">
                    {creative.descriptions?.[0] || 'No description available.'}
                  </p>
                </div>

                {creative.callToAction && (
                  <Button className="w-full h-10 rounded-xl bg-foreground text-background hover:bg-foreground/90 text-[11px] font-black uppercase tracking-widest">
                    {formatCTALabel(creative.callToAction)}
                  </Button>
                )}
              </div>
            </div>
          )}

          {activePlatform === 'facebook' && (
            <div className="relative flex flex-col bg-[#f0f2f5] font-[system-ui,-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,Helvetica,Arial,sans-serif]">
              <div className="flex flex-col bg-white text-[#050505]">
                {/* Page row */}
                <div className="flex items-center gap-2 px-3 pb-1 pt-3">
                  <PreviewAvatar
                    pageName={pageDisplayName}
                    profileImageUrl={creative.pageProfileImageUrl}
                    profileImageError={profileImageError}
                    onProfileImageError={handleProfileImageError}
                    className="size-10"
                  />
                  <div className="min-w-0 flex-1 text-left">
                    <p className="truncate text-[15px] font-semibold leading-[1.2]">{pageDisplayName}</p>
                    <p className="flex items-center gap-1 text-[13px] leading-[1.2] text-[#65676b]">
                      <span>Sponsored</span>
                      <span aria-hidden>·</span>
                      <Globe className="size-3" aria-hidden />
                    </p>
                  </div>
                  <MoreHorizontal className="size-5 shrink-0 text-[#65676b]" strokeWidth={1.75} />
                </div>

                {/* Primary text — spaced clearly above media */}
                <div className="px-3 pb-3 pt-1">
                  <p className="whitespace-pre-wrap text-[15px] font-normal leading-[1.3333] text-[#050505]">
                    {primaryText || 'No primary text available.'}
                  </p>
                </div>

                {/* Creative asset — edge-to-edge, separated from copy */}
                <div className="w-full border-y border-[#dadde1]/80">{renderMedia()}</div>

                {/* Link preview card (native FB ad footer) */}
                <div className="flex items-stretch gap-3 border-b border-[#dadde1] bg-[#f0f2f5] px-3 py-2.5">
                  <div className="min-w-0 flex-1 py-0.5">
                    <p className="truncate text-[12px] uppercase text-[#65676b]">{landingHostname}</p>
                    <p className="mt-0.5 line-clamp-2 text-[16px] font-semibold leading-[1.2] text-[#050505]">
                      {headlineText}
                    </p>
                  </div>
                  {creative.callToAction ? (
                    <button
                      type="button"
                      className="shrink-0 self-center rounded-md bg-[#e4e6eb] px-4 py-2 text-[15px] font-semibold text-[#050505]"
                    >
                      {formatCTALabel(creative.callToAction)}
                    </button>
                  ) : null}
                </div>

                {/* Reactions */}
                <div className="flex items-center justify-around border-b border-[#dadde1] p-1">
                  <button
                    type="button"
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-md py-2 text-[15px] font-semibold text-[#65676b] hover:bg-[#f0f2f5]"
                  >
                    <ThumbsUp className="size-[18px]" strokeWidth={1.75} />
                    Like
                  </button>
                  <button
                    type="button"
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-md py-2 text-[15px] font-semibold text-[#65676b] hover:bg-[#f0f2f5]"
                  >
                    <MessageCircle className="size-[18px]" strokeWidth={1.75} />
                    Comment
                  </button>
                  <button
                    type="button"
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-md py-2 text-[15px] font-semibold text-[#65676b] hover:bg-[#f0f2f5]"
                  >
                    <Share2 className="size-[18px]" strokeWidth={1.75} />
                    Share
                  </button>
                </div>
              </div>
            </div>
          )}
        </m.div>
      </AnimatePresence>
    )
  }

  const handlePlatformChange = useCallback(
    (v: string) => dispatch({ type: 'setActivePlatform', value: v as Platform }),
    [],
  )

  return (
    <LazyMotion features={domAnimation}>
      <div className="lg:col-span-5 self-start space-y-6">
      <div className="space-y-4">
        {/* Header with Platform & Aspect Ratio controls */}
        <div className="flex items-center justify-between px-1">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-primary tracking-[0.2em] uppercase mb-0.5">Preview</span>
            <h3 className="text-lg font-bold tracking-tight">Social Mockup</h3>
          </div>
          <div className="flex items-center gap-2">
            {/* Aspect Ratio Toggle */}
            <div className="flex items-center gap-1 p-1 rounded-lg bg-muted/30 border border-muted-foreground/10">
              <button
                type="button"
                onClick={handleSetFeed}
                className={cn(
                  "size-8 rounded-md flex items-center justify-center motion-chromatic",
                  aspectRatio === 'feed' ? "bg-background shadow-sm" : "hover:bg-muted/50"
                )}
                title="Feed (1:1)"
              >
                <Square className="size-4" />
              </button>
              <button
                type="button"
                onClick={handleSetReel}
                className={cn(
                  "size-8 rounded-md flex items-center justify-center motion-chromatic",
                  aspectRatio === 'reel' ? "bg-background shadow-sm" : "hover:bg-muted/50"
                )}
                title="Reel (9:16)"
              >
                <RectangleVertical className="size-4" />
              </button>
            </div>

            {/* Platform Toggle */}
            {availablePlatforms.length > 1 && (
              <Tabs value={activePlatform} onValueChange={handlePlatformChange} className="w-auto">
                <TabsList className="h-10 bg-muted/30 p-1 rounded-lg border border-muted-foreground/10">
                  {availablePlatforms.includes('facebook') && (
                    <TabsTrigger value="facebook" className="size-8 p-0 rounded-md">
                      <Facebook className="size-4" />
                    </TabsTrigger>
                  )}
                  {availablePlatforms.includes('instagram') && (
                    <TabsTrigger value="instagram" className="size-8 p-0 rounded-md">
                      <Instagram className="size-4" />
                    </TabsTrigger>
                  )}
                  {availablePlatforms.includes('linkedin') && (
                    <TabsTrigger value="linkedin" className="size-8 p-0 rounded-md">
                      <Linkedin className="size-4" />
                    </TabsTrigger>
                  )}
                </TabsList>
              </Tabs>
            )}
          </div>
        </div>

        {/* Preview Card — light feed chrome so FB/IG colors read as native */}
        <div className="overflow-hidden rounded-2xl border border-border/60 bg-[#f0f2f5] p-3 shadow-sm">
          <div className="overflow-hidden rounded-lg border border-[#dadde1] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.1)]">
            {renderPlatformMock()}
          </div>

          {/* Preview Info */}
          <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between text-[10px] text-muted-foreground">
              <span className="font-medium uppercase tracking-wider">
                {aspectRatio === 'reel' ? '9:16 Reel/Story' : '1:1 Feed Post'}
              </span>
            </div>
            {(headlineVariantCount > 1 || descriptionVariantCount > 1) && (
              <div className="flex flex-wrap gap-2">
                {headlineVariantCount > 1 && onPreviewHeadlineIndexChange ? (
                  <div className="flex items-center gap-1 rounded-lg border border-border/60 bg-background px-2 py-1">
                    <span className="text-[10px] font-semibold text-muted-foreground">Headline</span>
                    {Array.from({ length: headlineVariantCount }, (_, index) => (
                      <PreviewVariantButton
                        key={`headline-preview-${index}`}
                        index={index}
                        selected={previewHeadlineIndex === index}
                        onSelect={handlePreviewHeadlineSelect}
                      />
                    ))}
                  </div>
                ) : null}
                {descriptionVariantCount > 1 && onPreviewDescriptionIndexChange ? (
                  <div className="flex items-center gap-1 rounded-lg border border-border/60 bg-background px-2 py-1">
                    <span className="text-[10px] font-semibold text-muted-foreground">Copy</span>
                    {Array.from({ length: descriptionVariantCount }, (_, index) => (
                      <PreviewVariantButton
                        key={`description-preview-${index}`}
                        index={index}
                        selected={previewDescriptionIndex === index}
                        onSelect={handlePreviewDescriptionSelect}
                      />
                    ))}
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </div>

      {performanceSummary && efficiencyScore !== null ? (
        <m.div
          initial="hidden"
          animate="visible"
          variants={fadeInUpVariants}
          transition={scoreCardTransition}
        >
          <Card className="border border-border/60 bg-card shadow-lg rounded-[2.5rem] overflow-hidden">
            <CardHeader className="pb-4 pt-8 px-8">
              <CardTitle className="text-xs font-black uppercase tracking-[0.3em] flex items-center gap-3 text-primary/80">
                <div className="size-6 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Activity className="size-3.5 text-primary" />
                </div>
                The Alpha Score
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8 px-8 pb-10">
              <div className="flex items-end justify-between">
                <div className="space-y-1">
                  <div className="flex items-baseline gap-1">
                    <span className="text-6xl font-black tracking-tighter text-primary">{efficiencyScore}</span>
                    <span className="text-sm font-bold text-primary/40 leading-none">/ 100</span>
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">{performanceSummary.period}</p>
                </div>
                <div className="text-right space-y-2">
                  <div className="flex items-center gap-3 justify-end group">
                    <span className="text-[10px] font-bold text-muted-foreground/40 group-hover:text-primary transition-colors">ROAS</span>
                    <span className="text-lg font-black tracking-tight">{performanceSummary.roas.toFixed(2)}x</span>
                  </div>
                  <div className="flex items-center gap-3 justify-end group">
                    <span className="text-[10px] font-bold text-muted-foreground/40 group-hover:text-primary transition-colors">CTR</span>
                    <span className="text-lg font-black tracking-tight">{performanceSummary.ctr.toFixed(2)}%</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="h-3 w-full rounded-full bg-accent/5 border border-accent/5 p-0.5 overflow-hidden">
                  <m.div
                    initial={progressBarInitial}
                    animate={progressBarAnimate}
                    transition={progressBarTransition}
                    className="h-full bg-info rounded-full shadow-sm"
                  />
                </div>
                <div className="flex justify-between text-[9px] font-black uppercase tracking-widest opacity-30">
                  <span>Underperforming</span>
                  <span>Industry Leader</span>
                </div>
              </div>

              <p className="text-[11px] leading-relaxed text-muted-foreground font-medium text-center bg-background/30 backdrop-blur-sm p-4 rounded-2xl border border-muted-foreground/5 italic">
                &quot;This creative&apos;s conversion profile exceeds {Math.max(0, efficiencyScore - 10)}% of tested assets in the {creative.providerId}-network benchmarks.&quot;
              </p>
            </CardContent>
          </Card>
        </m.div>
      ) : null}
      </div>
    </LazyMotion>
  )
}
