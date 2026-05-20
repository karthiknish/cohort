import React, { useState, useCallback, useMemo } from 'react'
import NextImage from 'next/image'
import { AnimatePresence, LazyMotion, domAnimation, m } from '@/shared/ui/motion'
import {
  fadeInUpVariants,
  slideInLeftVariants,
  scaleVariants,
  transitions,
  easings,
} from '@/lib/dashboard-animations'
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
} from 'lucide-react'

import type { AdMetricsSummary } from '@/lib/ad-algorithms'
import { cn } from '@/lib/utils'
import { motionLoopSeconds } from '@/lib/animation-system'

import type { Creative } from './types'
import { isDirectVideoUrl, formatCTALabel } from './helpers'

import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
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
          className="h-full w-full object-cover"
          onError={onProfileImageError}
          style={crispEdgesStyle}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-[#e4e6eb] text-sm font-semibold text-[#050505]">
          {initial}
        </div>
      )}
    </div>
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

  const [imageLoadFailed, setImageLoadFailed] = useState(false)
  const [profileImageError, setProfileImageError] = useState(false)
  const [aspectRatio, setAspectRatio] = useState<'feed' | 'reel'>('feed')
  const [isPlaying, setIsPlaying] = useState(false)
  const videoRef = React.useRef<HTMLVideoElement>(null)

  const mediaAspectClass = aspectRatio === 'reel' ? 'aspect-[9/16]' : 'aspect-square'

  const handlePlay = useCallback(() => setIsPlaying(true), [])
  const handlePause = useCallback(() => setIsPlaying(false), [])
  const handleEnded = useCallback(() => setIsPlaying(false), [])
  const handleImageLoadFailed = useCallback(() => setImageLoadFailed(true), [])
  const handleProfileImageError = useCallback(() => setProfileImageError(true), [])
  const handleSetFeed = useCallback(() => setAspectRatio('feed'), [])
  const handleSetReel = useCallback(() => setAspectRatio('reel'), [])
  const togglePlayPause = useCallback(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }, [isPlaying])

  const scoreCardTransition = useMemo(() => ({ ...transitions.slow, delay: 0.2 }), [])
  const progressBarAnimate = useMemo(() => ({ width: `${efficiencyScore}%` }), [efficiencyScore])

  const pageDisplayName = useMemo(
    () => creative.pageName || creative.campaignName || creative.name || campaignName,
    [campaignName, creative.campaignName, creative.name, creative.pageName],
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
            className="w-full h-full object-cover"
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
            <div className="h-14 w-14 rounded-full bg-background/40 backdrop-blur-xl border border-background/20 flex items-center justify-center shadow-2xl">
              {isPlaying ? <Pause className="h-6 w-6 text-background" /> : <Play className="h-6 w-6 text-background ml-1" />}
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
              <Video className="h-10 w-10 mb-2 opacity-20" />
              <p className="text-[10px] text-background/40 uppercase tracking-widest font-black">Video Preview</p>
            </div>
          )}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-[var(--motion-duration-normal)] ease-[var(--motion-ease-out)] motion-reduce:transition-none">
          <m.div
            whileHover={whileHoverScale}
            whileTap={whileTapScale}
            variants={scaleVariants}
            className="h-14 w-14 rounded-full bg-background/40 backdrop-blur-xl border border-background/20 flex items-center justify-center shadow-2xl cursor-pointer"
          >
              <Video className="h-6 w-6 text-background" />
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
        <div className={cn("relative bg-muted/10 group overflow-hidden", mediaAspectClass)}>
          {imageLoadFailed ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <ImageIcon className="h-8 w-8 mb-2 opacity-20" />
              <p className="text-[10px] uppercase font-bold tracking-tighter">Asset Unavailable</p>
            </div>
          ) : (
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
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-[var(--motion-duration-slow)] ease-[var(--motion-ease-out)] motion-reduce:transition-none" />
        </div>
      )
    }

    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground bg-muted/5 rounded-2xl border-2 border-dashed border-muted">
        <FileText className="h-10 w-10 mb-2 opacity-10" />
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
                    className="h-8 w-8"
                    ringClassName="p-[2px] bg-gradient-to-tr from-[#feda75] via-[#fa7e1e] to-[#d62976]"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-semibold leading-tight">{pageDisplayName}</p>
                    <p className="text-[11px] leading-tight text-[#8e8e8e]">Sponsored</p>
                  </div>
                </div>
                <MoreHorizontal className="h-5 w-5 shrink-0 text-[#262626]" strokeWidth={1.75} />
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
                  <Heart className="h-6 w-6" strokeWidth={1.75} />
                  <MessageCircle className="h-6 w-6" strokeWidth={1.75} />
                  <Share2 className="h-6 w-6" strokeWidth={1.75} />
                </div>
                <Bookmark className="h-6 w-6" strokeWidth={1.75} />
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
                <div className="h-10 w-10 rounded-lg bg-info flex items-center justify-center text-info-foreground font-black text-lg overflow-hidden shrink-0">
                  {creative.pageProfileImageUrl && !profileImageError ? (
                    <NextImage
                      src={creative.pageProfileImageUrl}
                      alt=""
                      width={40}
                      height={40}
                      unoptimized
                      className="h-full w-full object-cover"
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
                <span className="text-[11px] font-bold flex items-center gap-1.5"><Heart className="h-4 w-4" /> Like</span>
                <span className="text-[11px] font-bold flex items-center gap-1.5"><MessageCircle className="h-4 w-4" /> Comment</span>
                <span className="text-[11px] font-bold flex items-center gap-1.5"><Share2 className="h-4 w-4" /> Repost</span>
              </div>
            </div>
          )}

          {activePlatform === 'tiktok' && (
            <div className="bg-background rounded-tr-[2.5rem] rounded-tl-[2.5rem] overflow-hidden text-left">
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-foreground text-background flex items-center justify-center font-black text-sm overflow-hidden shrink-0">
                    {creative.pageProfileImageUrl && !profileImageError ? (
                      <NextImage
                        src={creative.pageProfileImageUrl}
                        alt=""
                        width={40}
                        height={40}
                        unoptimized
                        className="h-full w-full object-cover"
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
                <MoreHorizontal className="h-4 w-4 opacity-40" />
              </div>

              {renderMedia()}

              <div className="p-4 space-y-4">
                <div className="flex items-center gap-6 text-[11px] font-bold opacity-80">
                  <span className="flex items-center gap-1.5"><Heart className="h-4 w-4" /> 12.4K</span>
                  <span className="flex items-center gap-1.5"><MessageCircle className="h-4 w-4" /> 418</span>
                  <span className="flex items-center gap-1.5"><Share2 className="h-4 w-4" /> 109</span>
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
                    className="h-10 w-10"
                  />
                  <div className="min-w-0 flex-1 text-left">
                    <p className="truncate text-[15px] font-semibold leading-[1.2]">{pageDisplayName}</p>
                    <p className="flex items-center gap-1 text-[13px] leading-[1.2] text-[#65676b]">
                      <span>Sponsored</span>
                      <span aria-hidden>·</span>
                      <Globe className="h-3 w-3" aria-hidden />
                    </p>
                  </div>
                  <MoreHorizontal className="h-5 w-5 shrink-0 text-[#65676b]" strokeWidth={1.75} />
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
                <div className="flex items-center justify-around border-b border-[#dadde1] px-1 py-1">
                  <button
                    type="button"
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-md py-2 text-[15px] font-semibold text-[#65676b] hover:bg-[#f0f2f5]"
                  >
                    <ThumbsUp className="h-[18px] w-[18px]" strokeWidth={1.75} />
                    Like
                  </button>
                  <button
                    type="button"
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-md py-2 text-[15px] font-semibold text-[#65676b] hover:bg-[#f0f2f5]"
                  >
                    <MessageCircle className="h-[18px] w-[18px]" strokeWidth={1.75} />
                    Comment
                  </button>
                  <button
                    type="button"
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-md py-2 text-[15px] font-semibold text-[#65676b] hover:bg-[#f0f2f5]"
                  >
                    <Share2 className="h-[18px] w-[18px]" strokeWidth={1.75} />
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

  // Determine available platforms based on provider
  const availablePlatforms: Platform[] = creative.providerId === 'linkedin'
    ? ['linkedin']
    : creative.providerId === 'tiktok'
      ? ['tiktok' as Platform]
      : ['facebook', 'instagram'] // Meta ads show Facebook & Instagram

  const [activePlatform, setActivePlatform] = useState<Platform>(availablePlatforms[0] ?? 'facebook')
  const handlePlatformChange = useCallback((v: string) => setActivePlatform(v as Platform), [])

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
                  "h-8 w-8 rounded-md flex items-center justify-center motion-chromatic",
                  aspectRatio === 'feed' ? "bg-background shadow-sm" : "hover:bg-muted/50"
                )}
                title="Feed (1:1)"
              >
                <Square className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={handleSetReel}
                className={cn(
                  "h-8 w-8 rounded-md flex items-center justify-center motion-chromatic",
                  aspectRatio === 'reel' ? "bg-background shadow-sm" : "hover:bg-muted/50"
                )}
                title="Reel (9:16)"
              >
                <RectangleVertical className="h-4 w-4" />
              </button>
            </div>

            {/* Platform Toggle */}
            {availablePlatforms.length > 1 && (
              <Tabs value={activePlatform} onValueChange={handlePlatformChange} className="w-auto">
                <TabsList className="h-10 bg-muted/30 p-1 rounded-lg border border-muted-foreground/10">
                  {availablePlatforms.includes('facebook') && (
                    <TabsTrigger value="facebook" className="h-8 w-8 p-0 rounded-md">
                      <Facebook className="h-4 w-4" />
                    </TabsTrigger>
                  )}
                  {availablePlatforms.includes('instagram') && (
                    <TabsTrigger value="instagram" className="h-8 w-8 p-0 rounded-md">
                      <Instagram className="h-4 w-4" />
                    </TabsTrigger>
                  )}
                  {availablePlatforms.includes('linkedin') && (
                    <TabsTrigger value="linkedin" className="h-8 w-8 p-0 rounded-md">
                      <Linkedin className="h-4 w-4" />
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
                      <button
                        key={`headline-preview-${index}`}
                        type="button"
                        onClick={() => onPreviewHeadlineIndexChange(index)}
                        className={cn(
                          'h-6 min-w-6 rounded-md px-1.5 text-[10px] font-bold transition-colors',
                          previewHeadlineIndex === index
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted/50 text-muted-foreground hover:bg-muted',
                        )}
                      >
                        {index + 1}
                      </button>
                    ))}
                  </div>
                ) : null}
                {descriptionVariantCount > 1 && onPreviewDescriptionIndexChange ? (
                  <div className="flex items-center gap-1 rounded-lg border border-border/60 bg-background px-2 py-1">
                    <span className="text-[10px] font-semibold text-muted-foreground">Copy</span>
                    {Array.from({ length: descriptionVariantCount }, (_, index) => (
                      <button
                        key={`description-preview-${index}`}
                        type="button"
                        onClick={() => onPreviewDescriptionIndexChange(index)}
                        className={cn(
                          'h-6 min-w-6 rounded-md px-1.5 text-[10px] font-bold transition-colors',
                          previewDescriptionIndex === index
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted/50 text-muted-foreground hover:bg-muted',
                        )}
                      >
                        {index + 1}
                      </button>
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
                <div className="h-6 w-6 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Activity className="h-3.5 w-3.5 text-primary" />
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
