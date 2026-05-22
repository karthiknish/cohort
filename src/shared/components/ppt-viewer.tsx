'use client'

import { cn } from '@/lib/utils'

import {
  PptViewerCanvas,
  PptViewerError,
  PptViewerFilmstrip,
  PptViewerLoading,
} from './ppt-viewer-sections'
import type { PptViewerProps } from './ppt-viewer-types'
import { usePptViewer } from './use-ppt-viewer'

export function PptViewer({ url, className, title = 'Presentation' }: PptViewerProps) {
  const {
    slides,
    currentSlide,
    isLoading,
    error,
    isFullscreen,
    goToSlide,
    handlePrevSlide,
    handleNextSlide,
    handleToggleFullscreen,
    handleRetry,
  } = usePptViewer({ url })

  if (isLoading) {
    return <PptViewerLoading className={className} />
  }

  if (error) {
    return (
      <PptViewerError
        className={className}
        error={error}
        url={url}
        onRetry={handleRetry}
      />
    )
  }

  const viewerBody = (
    <div className={cn('flex min-h-0 flex-1 flex-col', className)}>
      <PptViewerCanvas
        title={title}
        slides={slides}
        currentSlide={currentSlide}
        isFullscreen={isFullscreen}
        onPrevSlide={handlePrevSlide}
        onNextSlide={handleNextSlide}
        onToggleFullscreen={handleToggleFullscreen}
      />
      <PptViewerFilmstrip slides={slides} currentSlide={currentSlide} onGoToSlide={goToSlide} />
      <p className="mt-3 text-center text-xs text-muted-foreground">
        Arrow keys to navigate · Home / End for first and last slide
      </p>
    </div>
  )

  if (isFullscreen) {
    return (
      <dialog
        open
        className="fixed inset-0 z-[100] m-0 flex max-h-none w-full max-w-none flex-col border-0 bg-black/95 p-4 sm:p-8"
        aria-label={`${title} full screen`}
      >
        <div className="mx-auto flex size-full max-w-6xl flex-col justify-center">
          {viewerBody}
        </div>
      </dialog>
    )
  }

  return viewerBody
}
