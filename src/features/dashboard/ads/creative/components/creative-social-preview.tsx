import React, { useReducer, useCallback, useMemo } from 'react'
import { LazyMotion, domAnimation, m } from '@/shared/ui/motion'
import {
  fadeInUpVariants,
  transitions,
  easings,
} from '@/lib/motion'
import {
  Facebook,
  Instagram,
  Linkedin,
  Activity,
  RectangleVertical,
  Square,
} from 'lucide-react'

import type { AdMetricsSummary } from '@/lib/ad-algorithms'
import { cn } from '@/lib/utils'
import { motionLoopSeconds } from '@/lib/animation-system'

import type { Creative } from './types'
import { CreativePlatformMock, type CreativeSocialPreviewPlatform } from './creative-platform-mock'
import { CreativePreviewMedia } from './creative-preview-media'

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/shared/ui/tabs'

const progressBarInitial: { width: number } = { width: 0 }
const progressBarTransition = { duration: motionLoopSeconds.shimmer, ease: easings.easeOut }

export type CreativePerformanceSummary = AdMetricsSummary & {
  ctr: number
  roas: number
  cpc: number
}

type Platform = CreativeSocialPreviewPlatform

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

  const previewMedia = (
    <CreativePreviewMedia
      creative={creative}
      displayName={displayName}
      mediaAspectClass={mediaAspectClass}
      imageLoadFailed={imageLoadFailed}
      imageLightboxOpen={imageLightboxOpen}
      isPlaying={isPlaying}
      videoRef={videoRef}
      onPlay={handlePlay}
      onPause={handlePause}
      onEnded={handleEnded}
      onImageLoadFailed={handleImageLoadFailed}
      onOpenImageLightbox={handleOpenImageLightbox}
      onImageLightboxOpenChange={handleImageLightboxOpenChange}
      onTogglePlayPause={togglePlayPause}
    />
  )

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
            <h3 className="text-lg tracking-tight">Social Mockup</h3>
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
            <CreativePlatformMock
              activePlatform={activePlatform}
              campaignName={campaignName}
              creative={creative}
              displayName={displayName}
              pageDisplayName={pageDisplayName}
              primaryText={primaryText}
              headlineText={headlineText}
              landingHostname={landingHostname}
              profileImageError={profileImageError}
              onProfileImageError={handleProfileImageError}
              previewMedia={previewMedia}
            />
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
                    {Array.from({ length: headlineVariantCount }, (_, variantIndex) => (
                      <PreviewVariantButton
                        key={`headline-preview-v${variantIndex}`}
                        index={variantIndex}
                        selected={previewHeadlineIndex === variantIndex}
                        onSelect={handlePreviewHeadlineSelect}
                      />
                    ))}
                  </div>
                ) : null}
                {descriptionVariantCount > 1 && onPreviewDescriptionIndexChange ? (
                  <div className="flex items-center gap-1 rounded-lg border border-border/60 bg-background px-2 py-1">
                    <span className="text-[10px] font-semibold text-muted-foreground">Copy</span>
                    {Array.from({ length: descriptionVariantCount }, (_, variantIndex) => (
                      <PreviewVariantButton
                        key={`description-preview-v${variantIndex}`}
                        index={variantIndex}
                        selected={previewDescriptionIndex === variantIndex}
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
