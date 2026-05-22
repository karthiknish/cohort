'use client'

import { useCallback, useState } from 'react'
import NextImage from 'next/image'
import { ExternalLink, ImageIcon, Maximize2, X } from 'lucide-react'

import { ADS_PAGE_THEME } from '@/features/dashboard/ads/components/ads-page-theme'
import { Button } from '@/shared/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/shared/ui/dialog'
import { cn } from '@/lib/utils'

type CreativeImageViewerProps = {
  src?: string | null
  alt: string
  className?: string
  /** Compact row for metadata panels */
  variant?: 'preview' | 'thumbnail'
  aspectClass?: string
  showExpand?: boolean
  showOpenLink?: boolean
}

export function CreativeImageViewer({
  src,
  alt,
  className,
  variant = 'preview',
  aspectClass = 'aspect-[4/5] sm:aspect-square',
  showExpand = true,
  showOpenLink = true,
}: CreativeImageViewerProps) {
  const [failed, setFailed] = useState(false)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  const handleError = useCallback(() => setFailed(true), [])
  const handleOpenLightbox = useCallback(() => setLightboxOpen(true), [])
  const handleCloseLightbox = useCallback(() => setLightboxOpen(false), [])

  if (!src || failed) {
    return (
      <div
        className={cn(
          ADS_PAGE_THEME.controlMapFrame,
          'flex flex-col items-center justify-center gap-2 bg-muted/20 py-12 text-center',
          className,
        )}
      >
        <ImageIcon className="size-8 text-muted-foreground/40" aria-hidden />
        <p className="text-xs font-medium text-muted-foreground">Image unavailable</p>
        <p className="max-w-xs text-[11px] text-muted-foreground/80">
          The asset may have expired or the URL is not publicly reachable.
        </p>
      </div>
    )
  }

  if (variant === 'thumbnail') {
    return (
      <>
        <div className={cn('flex items-stretch gap-3 rounded-xl border border-border/60 bg-card p-2', className)}>
          <button
            type="button"
            onClick={showExpand ? handleOpenLightbox : undefined}
            className={cn(
              'relative size-20 shrink-0 overflow-hidden rounded-lg bg-muted ring-1 ring-border/50',
              showExpand && 'cursor-zoom-in transition-opacity hover:opacity-90',
            )}
            aria-label={showExpand ? `View full image: ${alt}` : undefined}
          >
            <NextImage
              src={src}
              alt={alt}
              fill
              unoptimized
              sizes="80px"
              className="object-cover"
              onError={handleError}
            />
          </button>
          <div className="flex min-w-0 flex-1 flex-col justify-center gap-2 py-1 pr-1">
            <p className={ADS_PAGE_THEME.controlSectionLabel}>Creative asset</p>
            <p className="line-clamp-2 text-xs text-muted-foreground break-all">{src}</p>
            <div className="flex flex-wrap gap-1.5">
              {showExpand ? (
                <Button type="button" variant="outline" size="sm" className="h-7 gap-1 text-xs" onClick={handleOpenLightbox}>
                  <Maximize2 className="size-3" aria-hidden />
                  View
                </Button>
              ) : null}
              {showOpenLink ? (
                <Button type="button" variant="ghost" size="sm" className="h-7 gap-1 text-xs" asChild>
                  <a href={src} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="size-3" aria-hidden />
                    Open
                  </a>
                </Button>
              ) : null}
            </div>
          </div>
        </div>
        <ImageLightbox open={lightboxOpen} onOpenChange={setLightboxOpen} src={src} alt={alt} onError={handleError} />
      </>
    )
  }

  return (
    <>
      <div
        className={cn(
          ADS_PAGE_THEME.controlMapFrame,
          'group relative overflow-hidden bg-muted/30',
          aspectClass,
          className,
        )}
      >
        <NextImage
          src={src}
          alt={alt}
          fill
          unoptimized
          sizes="(max-width: 768px) 100vw, 560px"
          className="object-cover transition-transform duration-300 motion-reduce:transition-none group-hover:scale-[1.02]"
          onError={handleError}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-foreground/25 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100 motion-reduce:opacity-0" />
        {showExpand ? (
          <div className="absolute bottom-3 right-3 flex gap-1.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100 transition-opacity">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="h-8 gap-1.5 bg-background/95 shadow-md"
              onClick={handleOpenLightbox}
            >
              <Maximize2 className="size-3.5" aria-hidden />
              Expand
            </Button>
            {showOpenLink ? (
              <Button type="button" size="sm" variant="secondary" className="h-8 bg-background/95 shadow-md" asChild>
                <a href={src} target="_blank" rel="noopener noreferrer" aria-label="Open image in new tab">
                  <ExternalLink className="size-3.5" aria-hidden />
                </a>
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>
      <ImageLightbox open={lightboxOpen} onOpenChange={setLightboxOpen} src={src} alt={alt} onError={handleError} />
    </>
  )
}

function ImageLightbox({
  open,
  onOpenChange,
  src,
  alt,
  onError,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  src: string
  alt: string
  onError: () => void
}) {
  const handleClose = useCallback(() => {
    onOpenChange(false)
  }, [onOpenChange])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl gap-0 overflow-hidden border-border/60 p-0">
        <DialogTitle className="sr-only">{alt}</DialogTitle>
        <DialogDescription className="sr-only">Full-size creative image preview</DialogDescription>
        <div className="relative max-h-[85vh] min-h-[240px] w-full bg-foreground/95">
          <NextImage
            src={src}
            alt={alt}
            width={1200}
            height={1200}
            unoptimized
            className="mx-auto h-auto max-h-[85vh] w-full object-contain"
            onError={onError}
          />
          <Button
            type="button"
            variant="secondary"
            size="icon"
            className="absolute right-3 top-3 size-9 rounded-full bg-background/90 shadow-md"
            onClick={handleClose}
            aria-label="Close image preview"
          >
            <X className="size-4" aria-hidden />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
