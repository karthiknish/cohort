import type { CSSProperties } from 'react'
import NextImage from 'next/image'
import { AnimatePresence, m } from '@/shared/ui/motion'
import { slideInLeftVariants, transitions } from '@/lib/motion'
import {
  Globe,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Share2,
  Bookmark,
  ThumbsUp,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import { cpMockStyles as s } from './creative-platform-mock-styles'

import type { Creative } from './types'
import { formatCTALabel } from './helpers'
import { CreativePreviewMedia, type CreativePreviewMediaProps } from './creative-preview-media'

import { Button } from '@/shared/ui/button'

const crispEdgesStyle: CSSProperties = { imageRendering: 'crisp-edges' }
const exitSlideLeft: { opacity: number; x: number } = { opacity: 0, x: -20 }

export type CreativeSocialPreviewPlatform = 'facebook' | 'instagram' | 'linkedin' | 'tiktok'

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
        <div className="flex size-full items-center justify-center text-sm font-semibold" style={s.avatarPlaceholder}>
          {initial}
        </div>
      )}
    </div>
  )
}

export function CreativePlatformMock({
  activePlatform,
  campaignName,
  creative,
  displayName,
  pageDisplayName,
  primaryText,
  headlineText,
  landingHostname,
  profileImageError,
  onProfileImageError,
  previewMediaProps,
}: {
  activePlatform: CreativeSocialPreviewPlatform
  campaignName: string
  creative: Creative
  displayName: string
  pageDisplayName: string
  primaryText: string
  headlineText: string
  landingHostname: string
  profileImageError: boolean
  onProfileImageError: () => void
  previewMediaProps: CreativePreviewMediaProps
}) {
  const previewMedia = <CreativePreviewMedia {...previewMediaProps} />
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
          <div className="overflow-hidden" style={s.igSurface}>
            <div className="flex items-center justify-between px-3 py-2.5">
              <div className="flex min-w-0 items-center gap-2.5">
                <div className="rounded-full p-[2px]" style={s.igRing}>
                  <PreviewAvatar
                    pageName={pageDisplayName}
                    profileImageUrl={creative.pageProfileImageUrl}
                    profileImageError={profileImageError}
                    onProfileImageError={onProfileImageError}
                    className="size-8"
                  />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-semibold leading-tight">{pageDisplayName}</p>
                  <p className="text-[11px] leading-tight" style={s.textMuted}>Sponsored</p>
                </div>
              </div>
              <MoreHorizontal className="size-5 shrink-0" style={s.textPrimary} strokeWidth={1.75} />
            </div>

            {primaryText ? (
              <div className="px-3 pb-3 pt-0.5">
                <p className="whitespace-pre-wrap text-[14px] leading-[1.4]" style={s.textPrimary}>{primaryText}</p>
              </div>
            ) : null}

            <div className="w-full">{previewMedia}</div>

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
                  <span className="font-normal" style={s.textPrimary}>See more</span>
                </p>
              ) : null}
              {headlineText ? (
                <p className="text-[13px] font-medium" style={s.link}>{headlineText}</p>
              ) : null}
            </div>

            {creative.callToAction ? (
              <div className="border-t px-3 py-2.5" style={s.borderLightTop}>
                <button
                  type="button"
                  className="w-full rounded-lg py-2 text-center text-[14px] font-semibold text-white"
                  style={s.ctaInstagram}
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
                    onError={onProfileImageError}
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

            {previewMedia}

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
                      onError={onProfileImageError}
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

            {previewMedia}

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
          <div
            className="relative flex flex-col font-[system-ui,-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,Helvetica,Arial,sans-serif]"
            style={s.fbOuter}
          >
            <div className="flex flex-col" style={s.fbInner}>
              <div className="flex items-center gap-2 px-3 pb-1 pt-3">
                <PreviewAvatar
                  pageName={pageDisplayName}
                  profileImageUrl={creative.pageProfileImageUrl}
                  profileImageError={profileImageError}
                  onProfileImageError={onProfileImageError}
                  className="size-10"
                />
                <div className="min-w-0 flex-1 text-left">
                  <p className="truncate text-[15px] font-semibold leading-[1.2]">{pageDisplayName}</p>
                  <p className="flex items-center gap-1 text-[13px] leading-[1.2]" style={s.textSecondary}>
                    <span>Sponsored</span>
                    <span aria-hidden>·</span>
                    <Globe className="size-3" aria-hidden />
                  </p>
                </div>
                <MoreHorizontal className="size-5 shrink-0" style={s.textSecondary} strokeWidth={1.75} />
              </div>

              <div className="px-3 pb-3 pt-1">
                <p className="whitespace-pre-wrap text-[15px] font-normal leading-[1.3333]" style={s.textPrimary}>
                  {primaryText || 'No primary text available.'}
                </p>
              </div>

              <div className="w-full border-y" style={s.fbMediaBorder}>
                {previewMedia}
              </div>

              <div className="flex items-stretch gap-3 border-b px-3 py-2.5" style={s.fbLinkRow}>
                <div className="min-w-0 flex-1 py-0.5">
                  <p className="truncate text-[12px] uppercase" style={s.textSecondary}>{landingHostname}</p>
                  <p className="mt-0.5 line-clamp-2 text-[16px] font-semibold leading-[1.2]" style={s.textPrimary}>
                    {headlineText}
                  </p>
                </div>
                {creative.callToAction ? (
                  <button
                    type="button"
                    className="shrink-0 self-center rounded-md px-4 py-2 text-[15px] font-semibold"
                    style={s.fbCta}
                  >
                    {formatCTALabel(creative.callToAction)}
                  </button>
                ) : null}
              </div>

              <div className="flex items-center justify-around border-b p-1" style={s.fbActionsBar}>
                <button
                  type="button"
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-md py-2 text-[15px] font-semibold hover:bg-muted/40"
                  style={s.textSecondary}
                >
                  <ThumbsUp className="size-[18px]" strokeWidth={1.75} />
                  Like
                </button>
                <button
                  type="button"
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-md py-2 text-[15px] font-semibold hover:bg-muted/40"
                  style={s.textSecondary}
                >
                  <MessageCircle className="size-[18px]" strokeWidth={1.75} />
                  Comment
                </button>
                <button
                  type="button"
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-md py-2 text-[15px] font-semibold hover:bg-muted/40"
                  style={s.textSecondary}
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
