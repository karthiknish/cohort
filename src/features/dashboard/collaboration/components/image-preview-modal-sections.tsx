'use client'

import { useCallback } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react'
import { Button } from '@/shared/ui/button'
import {
  Dialog,
  DialogContent,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from '@/shared/ui/dialog-primitives'
import { LazyImage } from '@/shared/ui/lazy-image'
import { cn } from '@/lib/utils'

import type { UseImagePreviewModalReturn } from './use-image-preview-modal'

interface ThumbnailButtonProps {
  image: { url: string; name: string }
  index: number
  initialIndex: number
  normalizedIndex: number
  totalImages: number
  onSelectThumbnail: (offset: number) => void
}

export function ThumbnailButton({
  image,
  index,
  initialIndex,
  normalizedIndex,
  totalImages,
  onSelectThumbnail,
}: ThumbnailButtonProps) {
  const onSelectThumbnailClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      onSelectThumbnail(index - initialIndex)
    },
    [index, initialIndex, onSelectThumbnail]
  )

  return (
    <button
      key={`${image.url}-${image.name}`}
      type="button"
      aria-label={`Image ${index + 1} of ${totalImages}: ${image.name}`}
      aria-current={index === normalizedIndex || undefined}
      className={cn(
        "size-14 overflow-hidden rounded-md border-2 motion-chromatic",
        index === normalizedIndex
          ? "border-viewer-chrome opacity-100"
          : "border-transparent opacity-50 hover:opacity-80"
      )}
      onClick={onSelectThumbnailClick}
    >
      <LazyImage
        src={image.url}
        alt=""
        className="size-full object-cover"
      />
    </button>
  )
}

export function ImagePreviewModalDialog({
  currentImage,
  hasMultipleImages,
  normalizedIndex,
  images,
  initialIndex,
  isOpen,
  zoom,
  isDragging,
  imageStyle,
  handleOnOpenChange,
  handleStopPropagation,
  handleZoomOutClick,
  handleZoomInClick,
  handleCloseClick,
  handlePreviousClick,
  handleNextClick,
  handleMouseDown,
  handleMouseMove,
  handleMouseUp,
  handleImageAreaKeyDown,
  handleImageClick,
  handleSelectThumbnail,
  handleClose,
}: UseImagePreviewModalReturn) {
  if (!isOpen || !currentImage) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOnOpenChange}>
      <DialogPortal>
        <DialogOverlay className="fixed inset-0 z-[1200] bg-black/90 backdrop-blur-sm animate-in fade-in duration-200" />
        <DialogContent
          className="fixed inset-0 z-[1200] flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-viewer-chrome/60 focus-visible:ring-offset-0"
          onPointerDownOutside={handleClose}
        >
          <DialogTitle className="sr-only">
            Image Preview: {currentImage.name}
          </DialogTitle>
      {/* Header */}
      <div className="absolute left-0 right-0 top-0 z-10 flex items-center justify-between bg-gradient-to-b from-black/60 to-transparent p-4">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-viewer-chrome/90 truncate max-w-[300px]">
            {currentImage.name}
          </span>
          {currentImage.size && (
            <span className="text-xs text-viewer-chrome/60">{currentImage.size}</span>
          )}
          {hasMultipleImages && (
            <span className="rounded-full bg-viewer-chrome/10 px-2 py-0.5 text-xs text-viewer-chrome/80">
              {normalizedIndex + 1} / {images.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-9 text-viewer-chrome/80 hover:text-viewer-chrome hover:bg-viewer-chrome/10"
            onClick={handleZoomOutClick}
            disabled={zoom <= 1}
            aria-label="Zoom out"
          >
            <ZoomOut className="size-5" aria-hidden />
          </Button>
          <span className="min-w-[50px] text-center text-xs text-viewer-chrome/70" aria-live="polite">
            {Math.round(zoom * 100)}%
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-9 text-viewer-chrome/80 hover:text-viewer-chrome hover:bg-viewer-chrome/10"
            onClick={handleZoomInClick}
            disabled={zoom >= 4}
            aria-label="Zoom in"
          >
            <ZoomIn className="size-5" aria-hidden />
          </Button>
          <div className="mx-2 h-6 w-px bg-viewer-chrome/20" />
          <Button variant="ghost" size="icon" className="size-9 text-viewer-chrome/80 hover:text-viewer-chrome hover:bg-viewer-chrome/10" asChild>
            <a
              href={currentImage.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleStopPropagation}
              aria-label={`Open ${currentImage.name} in new tab`}
            >
              <ExternalLink className="size-5" aria-hidden />
            </a>
          </Button>
          <Button variant="ghost" size="icon" className="size-9 text-viewer-chrome/80 hover:text-viewer-chrome hover:bg-viewer-chrome/10" asChild>
            <a
              href={currentImage.url}
              download={currentImage.name}
              onClick={handleStopPropagation}
              aria-label={`Download ${currentImage.name}`}
            >
              <Download className="size-5" aria-hidden />
            </a>
          </Button>
          <div className="mx-2 h-6 w-px bg-viewer-chrome/20" />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-9 text-viewer-chrome/80 hover:text-viewer-chrome hover:bg-viewer-chrome/10"
            onClick={handleCloseClick}
            aria-label="Close preview"
          >
            <X className="size-5" aria-hidden />
          </Button>
        </div>
      </div>

      {/* Navigation Arrows */}
      {hasMultipleImages && (
        <>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute left-4 top-1/2 z-10 size-12 -translate-y-1/2 rounded-full bg-black/40 text-viewer-chrome hover:bg-black/60"
            onClick={handlePreviousClick}
            aria-label="Previous image"
          >
            <ChevronLeft className="size-8" aria-hidden />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-4 top-1/2 z-10 size-12 -translate-y-1/2 rounded-full bg-black/40 text-viewer-chrome hover:bg-black/60"
            onClick={handleNextClick}
            aria-label="Next image"
          >
            <ChevronRight className="size-8" aria-hidden />
          </Button>
        </>
      )}

      {/* Image */}
      <button
        type="button"
        className="flex size-full items-center justify-center overflow-hidden p-16"
        onClick={handleStopPropagation}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onKeyDown={handleImageAreaKeyDown}
        aria-label={`Preview image ${currentImage.name}`}
      >
        <LazyImage
          src={currentImage.url}
          alt={currentImage.name}
          className={cn(
            "max-h-full max-w-full object-contain transition-transform duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-out)] motion-reduce:transition-none",
            zoom > 1 ? "cursor-grab" : "cursor-zoom-in",
            isDragging && "cursor-grabbing"
          )}
          style={imageStyle}
          onClick={handleImageClick}
          draggable={false}
        />
      </button>

      {/* Thumbnails */}
      {hasMultipleImages && (
        <div className="absolute bottom-0 left-0 right-0 z-10 flex items-center justify-center gap-2 bg-gradient-to-t from-black/60 to-transparent p-4">
          {images.map((image, index) => (
            <ThumbnailButton
              key={`${image.url}-${image.name}`}
              image={image}
              index={index}
              initialIndex={initialIndex}
              normalizedIndex={normalizedIndex}
              totalImages={images.length}
              onSelectThumbnail={handleSelectThumbnail}
            />
          ))}
        </div>
      )}

      {/* Keyboard hints */}
      <div className="absolute bottom-4 right-4 text-xs text-viewer-chrome/40" aria-hidden>
        <span>← → Navigate</span>
        <span className="mx-2">•</span>
        <span>+/- Zoom</span>
        <span className="mx-2">•</span>
        <span>Esc Close</span>
      </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  )
}
