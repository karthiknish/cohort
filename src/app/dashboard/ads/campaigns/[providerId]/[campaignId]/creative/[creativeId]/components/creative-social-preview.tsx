import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText,
  Image as ImageIcon,
  Video,
  ZoomIn,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MoreHorizontal,
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  Globe,
  Activity,
  Smartphone,
  RectangleVertical,
  Square,
  Play,
  Pause
} from 'lucide-react'

import type { AdMetricsSummary } from '@/lib/ad-algorithms'
import { cn } from '@/lib/utils'

import type { Creative } from './types'
import { getTypeIcon, isDirectVideoUrl, formatCTALabel } from './helpers'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

export type CreativePerformanceSummary = AdMetricsSummary & {
  ctr: number
  roas: number
  cpc: number
}

type Platform = 'facebook' | 'instagram' | 'linkedin' | 'tiktok'

export function CreativeSocialPreview(props: {
  creative: Creative
  campaignName: string
  displayName: string
  performanceSummary: CreativePerformanceSummary | null
  efficiencyScore: number | null
}) {
  const { creative, campaignName, displayName, performanceSummary, efficiencyScore } = props

  const [imageLoadFailed, setImageLoadFailed] = useState(false)
  const [profileImageError, setProfileImageError] = useState(false)
  const [aspectRatio, setAspectRatio] = useState<'feed' | 'reel'>('feed')
  const [isPlaying, setIsPlaying] = useState(false)
  const videoRef = React.useRef<HTMLVideoElement>(null)

  const mediaAspectClass = aspectRatio === 'reel' ? 'aspect-[9/16]' : 'aspect-square'

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const renderMedia = () => {
    if (creative.videoUrl && isDirectVideoUrl(creative.videoUrl)) {
      return (
        <div className={cn("relative bg-black overflow-hidden group/video", mediaAspectClass)}>
          <video
            ref={videoRef}
            src={creative.videoUrl}
            className="w-full h-full object-cover"
            poster={creative.imageUrl || creative.thumbnailUrl}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={() => setIsPlaying(false)}
          />
          <button
            onClick={togglePlayPause}
            className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/video:opacity-100 transition-opacity duration-300"
          >
            <div className="h-14 w-14 rounded-full bg-black/40 backdrop-blur-xl border border-white/20 flex items-center justify-center shadow-2xl">
              {isPlaying ? <Pause className="h-6 w-6 text-white" /> : <Play className="h-6 w-6 text-white ml-1" />}
            </div>
          </button>
        </div>
      )
    }

    if (creative.videoUrl) {
      return (
        <div className={cn("relative bg-black flex items-center justify-center overflow-hidden group", mediaAspectClass)}>
          {creative.imageUrl && !imageLoadFailed ? (
            <img
              src={creative.imageUrl}
              alt={displayName}
              className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:scale-105 transition-transform duration-700"
              onError={() => setImageLoadFailed(true)}
            />
          ) : (
            <div className="text-muted-foreground flex flex-col items-center">
              <Video className="h-10 w-10 mb-2 opacity-20" />
              <p className="text-[10px] text-white/40 uppercase tracking-widest font-black">Video Preview</p>
            </div>
          )}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="h-14 w-14 rounded-full bg-black/40 backdrop-blur-xl border border-white/20 flex items-center justify-center shadow-2xl cursor-pointer"
            >
              <Video className="h-6 w-6 text-white" />
            </motion.div>
          </div>
          <div className="absolute bottom-4 left-4 flex gap-2">
            <div className="rounded-md bg-black/60 backdrop-blur-md text-white px-2 py-0.5 text-[8px] font-black tracking-widest uppercase border border-white/10">
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
            <img
              src={creative.imageUrl}
              alt={displayName}
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
              loading="lazy"
              decoding="async"
              onError={() => setImageLoadFailed(true)}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
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
        <motion.div
          key={activePlatform}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="w-full"
        >
          {activePlatform === 'instagram' && (
            <div className="bg-background rounded-tr-[2.5rem] rounded-tl-[2.5rem] overflow-hidden">
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] p-[2px] overflow-hidden shrink-0">
                    <div className="h-full w-full rounded-full bg-background flex items-center justify-center text-[10px] font-black overflow-hidden border border-background">
                      {creative.pageProfileImageUrl && !profileImageError ? (
                        <img
                          src={creative.pageProfileImageUrl}
                          alt=""
                          className="w-full h-full object-cover"
                          onError={() => setProfileImageError(true)}
                        />
                      ) : (
                        (creative.pageName || creative.campaignName || campaignName || 'A').slice(0, 1).toUpperCase()
                      )}
                    </div>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold leading-none mb-0.5 truncate">{creative.pageName || creative.campaignName || creative.name || campaignName}</p>
                    <p className="text-[9px] font-medium opacity-60 leading-none">Sponsored</p>
                  </div>
                </div>
                <MoreHorizontal className="h-4 w-4 opacity-40" />
              </div>

              {renderMedia()}

              <div className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Heart className="h-6 w-6" />
                    <MessageCircle className="h-6 w-6" />
                    <Share2 className="h-6 w-6" />
                  </div>
                  <Bookmark className="h-6 w-6" />
                </div>

                <div className="space-y-1.5">
                  <p className="text-xs font-bold">11,492 likes</p>
                  <div className="text-xs leading-snug line-clamp-2">
                    <span className="font-bold mr-1.5">{campaignName}</span>
                    <span className="opacity-80">{creative.descriptions?.[0] || 'No primary text available.'}</span>
                  </div>
                </div>

                {creative.callToAction && (
                  <Button className="w-full h-10 text-[11px] font-black tracking-widest uppercase bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl">
                    {formatCTALabel(creative.callToAction)}
                  </Button>
                )}
              </div>
            </div>
          )}

          {activePlatform === 'linkedin' && (
            <div className="bg-background rounded-tr-[2.5rem] rounded-tl-[2.5rem] overflow-hidden text-left">
              <div className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-[#0077b5] flex items-center justify-center text-white font-black text-lg overflow-hidden shrink-0">
                  {creative.pageProfileImageUrl && !profileImageError ? (
                    <img
                      src={creative.pageProfileImageUrl}
                      alt=""
                      className="w-full h-full object-cover"
                      onError={() => setProfileImageError(true)}
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
                  <Button variant="outline" className="h-9 px-4 text-[11px] font-black uppercase tracking-widest border-[#0077b5] text-[#0077b5] hover:bg-[#0077b5]/5 shrink-0 rounded-full">
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

          {activePlatform === 'facebook' && (
            <div className="bg-background flex flex-col relative">
              {/* Account Header */}
              <div className="p-4 flex items-center gap-3 bg-background z-10">
                <div className="h-10 w-10 rounded-full bg-[#1877F2] flex items-center justify-center text-white font-black text-lg shadow-inner overflow-hidden shrink-0 border border-black/5">
                  {creative.pageProfileImageUrl && !profileImageError ? (
                    <img
                      src={creative.pageProfileImageUrl}
                      alt=""
                      className="w-full h-full object-cover"
                      onError={() => setProfileImageError(true)}
                    />
                  ) : (
                    (creative.pageName || creative.campaignName || campaignName || 'A').slice(0, 1).toUpperCase()
                  )}
                </div>
                <div className="min-w-0 flex-1 text-left">
                  <p className="text-[13px] font-bold leading-tight truncate text-black/90">{creative.pageName || creative.campaignName || campaignName}</p>
                  <p className="text-[11px] opacity-60 flex items-center gap-1 font-medium text-black/60">
                    Sponsored · <Globe className="h-2.5 w-2.5" />
                  </p>
                </div>
                <MoreHorizontal className="h-5 w-5 opacity-40 shrink-0 text-black" />
              </div>

              {/* Caption */}
              <div className="px-4 pb-4 text-[13px] leading-relaxed line-clamp-2 text-black/80 z-10 text-left">
                {creative.descriptions?.[0] || 'No primary text available.'}
              </div>

              {/* Gap and Media */}
              <div className="w-full pt-1">
                {renderMedia()}
              </div>

              {/* CTA Section */}
              <div className="p-4 bg-[#F0F2F5] border-t border-black/5 flex items-center justify-between z-10">
                <div className="min-w-0 pr-4 space-y-0.5">
                  <p className="text-[9px] uppercase opacity-40 font-black tracking-widest">{new URL(creative.landingPageUrl || `https://${(creative.pageName || campaignName).replace(/\s+/g, '').toLowerCase()}.com`).hostname}</p>
                  <p className="text-sm font-bold truncate tracking-tight">{creative.headlines?.[0] || displayName}</p>
                </div>
                {creative.callToAction && (
                  <Button className="h-9 px-5 text-xs font-black uppercase tracking-widest bg-[#E4E6EB]/50 text-black hover:bg-[#D8DADF] shrink-0 border-none shadow-none rounded-lg">
                    {formatCTALabel(creative.callToAction)}
                  </Button>
                )}
              </div>

              <div className="px-6 py-2.5 flex items-center justify-between opacity-50">
                <div className="flex items-center gap-2 hover:opacity-100 transition-opacity cursor-pointer">
                  <Heart className="h-4 w-4" />
                  <span className="text-[11px] font-black uppercase tracking-widest mt-0.5">Like</span>
                </div>
                <div className="flex items-center gap-2 hover:opacity-100 transition-opacity cursor-pointer">
                  <MessageCircle className="h-4 w-4" />
                  <span className="text-[11px] font-black uppercase tracking-widest mt-0.5">Comment</span>
                </div>
                <div className="flex items-center gap-2 hover:opacity-100 transition-opacity cursor-pointer">
                  <Share2 className="h-4 w-4" />
                  <span className="text-[11px] font-black uppercase tracking-widest mt-0.5">Share</span>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    )
  }

  // Determine available platforms based on provider
  const availablePlatforms: Platform[] = creative.providerId === 'linkedin'
    ? ['linkedin']
    : creative.providerId === 'tiktok'
      ? ['tiktok' as Platform]
      : ['facebook', 'instagram'] // Meta ads show Facebook & Instagram

  // Default to the first available platform
  const [activePlatform, setActivePlatform] = useState<Platform>(availablePlatforms[0]!)

  return (
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
                onClick={() => setAspectRatio('feed')}
                className={cn(
                  "h-8 w-8 rounded-md flex items-center justify-center transition-all",
                  aspectRatio === 'feed' ? "bg-background shadow-sm" : "hover:bg-muted/50"
                )}
                title="Feed (1:1)"
              >
                <Square className="h-4 w-4" />
              </button>
              <button
                onClick={() => setAspectRatio('reel')}
                className={cn(
                  "h-8 w-8 rounded-md flex items-center justify-center transition-all",
                  aspectRatio === 'reel' ? "bg-background shadow-sm" : "hover:bg-muted/50"
                )}
                title="Reel (9:16)"
              >
                <RectangleVertical className="h-4 w-4" />
              </button>
            </div>

            {/* Platform Toggle */}
            {availablePlatforms.length > 1 && (
              <Tabs value={activePlatform} onValueChange={(v) => setActivePlatform(v as Platform)} className="w-auto">
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

        {/* Preview Card */}
        <div className="rounded-2xl bg-muted/20 border border-muted-foreground/10 p-4 overflow-hidden">
          <div className="rounded-xl overflow-hidden bg-background shadow-lg border border-muted-foreground/5">
            {renderPlatformMock()}
          </div>

          {/* Preview Info */}
          <div className="mt-3 flex items-center justify-between text-[10px] text-muted-foreground">
            <span className="font-medium uppercase tracking-wider">
              {aspectRatio === 'reel' ? '9:16 Reel/Story' : '1:1 Feed Post'}
            </span>
          </div>
        </div>
      </div>

      {performanceSummary && efficiencyScore !== null ? (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <Card className="border-none bg-gradient-to-br from-primary/[0.08] to-primary/[0.02] shadow-[0_20px_50px_-10px_rgba(var(--primary),0.1)] rounded-[2.5rem] overflow-hidden">
            <CardHeader className="pb-4 pt-8 px-8">
              <CardTitle className="text-xs font-black uppercase tracking-[0.3em] flex items-center gap-3 text-primary/80">
                <div className="h-6 w-6 rounded-lg bg-primary/10 flex items-center justify-center">
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
                <div className="h-3 w-full rounded-full bg-primary/5 border border-primary/5 p-0.5 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${efficiencyScore}%` }}
                    transition={{ duration: 1.5, cubicBezier: [0.16, 1, 0.3, 1] }}
                    className="h-full bg-gradient-to-r from-primary/60 to-primary rounded-full shadow-[0_0_20px_rgba(var(--primary),0.5)]"
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
        </motion.div>
      ) : null}
    </div>
  )
}