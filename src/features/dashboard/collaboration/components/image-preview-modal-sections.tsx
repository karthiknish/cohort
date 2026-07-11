'use client';
import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Download, ExternalLink, Image as ImageIcon, LoaderCircle, X, ZoomIn, ZoomOut, } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Dialog, DialogContent, DialogOverlay, DialogPortal, DialogTitle, } from '@/shared/ui/dialog-primitives';
import { cn } from '@/lib/utils';
import type { UseImagePreviewModalReturn } from './use-image-preview-modal';

interface ThumbnailButtonProps {
    image: {
        url: string;
        name: string;
    };
    index: number;
    initialIndex: number;
    normalizedIndex: number;
    totalImages: number;
    onSelectThumbnail: (offset: number) => void;
}
export function ThumbnailButton({ image, index, initialIndex, normalizedIndex, totalImages, onSelectThumbnail, }: ThumbnailButtonProps) {
    const onSelectThumbnailClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onSelectThumbnail(index - initialIndex);
    };
    return (<button key={`${image.url}-${image.name}`} type="button" aria-label={`Image ${index + 1} of ${totalImages}: ${image.name}`} aria-current={index === normalizedIndex || undefined} className={cn("size-12 shrink-0 overflow-hidden rounded-md border-2 motion-chromatic transition-opacity", index === normalizedIndex
            ? "border-viewer-chrome opacity-100 ring-2 ring-viewer-chrome/30"
            : "border-transparent opacity-50 hover:opacity-80")} onClick={onSelectThumbnailClick}>
      <img src={image.url} alt="" className="size-full object-cover" loading="lazy" draggable={false}/>
    </button>);
}

export function ImagePreviewModalDialog({ currentImage, hasMultipleImages, normalizedIndex, images, initialIndex, isOpen, zoom, isDragging, imageStyle, handleOnOpenChange, handleStopPropagation, handleZoomOutClick, handleZoomInClick, handleCloseClick, handlePreviousClick, handleNextClick, handleMouseDown, handleMouseMove, handleMouseUp, handleImageAreaKeyDown, handleImageClick, handleSelectThumbnail, handleClose, handleWheel, handleDoubleClick, }: UseImagePreviewModalReturn) {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    // Reset loading state when image changes
    const currentUrl = currentImage?.url;
    const currentName = currentImage?.name;
    const imageKey = `${currentUrl}-${currentName}`;
    useEffect(() => {
        setIsLoading(true);
        setHasError(false);
    }, [imageKey]);

    if (!isOpen || !currentImage) {
        return null;
    }
    return (<Dialog open={isOpen} onOpenChange={handleOnOpenChange}>
      <DialogPortal>
        <DialogOverlay className="fixed inset-0 z-[1200] bg-black/95 backdrop-blur-sm animate-in fade-in duration-200"/>
        <DialogContent className="fixed inset-0 z-[1200] flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-viewer-chrome/60 focus-visible:ring-offset-0" onPointerDownOutside={handleClose}>
          <DialogTitle className="sr-only">
            Image Preview: {currentImage.name}
          </DialogTitle>

      {/* Header */}
      <div className="absolute left-0 right-0 top-0 z-20 flex items-center justify-between gap-2 bg-gradient-to-b from-black/70 to-transparent p-3 sm:p-4">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <span className="truncate text-sm font-medium text-viewer-chrome/90 max-w-[180px] sm:max-w-[300px]">
            {currentImage.name}
          </span>
          {currentImage.size && (<span className="hidden text-xs text-viewer-chrome/60 sm:inline">{currentImage.size}</span>)}
          {hasMultipleImages && (<span className="shrink-0 rounded-full bg-viewer-chrome/10 px-2 py-0.5 text-xs text-viewer-chrome/80">
              {normalizedIndex + 1} / {images.length}
            </span>)}
        </div>
        <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
          <Button type="button" variant="ghost" size="icon" className="size-8 text-viewer-chrome/80 hover:text-viewer-chrome hover:bg-viewer-chrome/10 sm:size-9" onClick={handleZoomOutClick} disabled={zoom <= 1} aria-label="Zoom out">
            <ZoomOut className="size-4 sm:size-5" aria-hidden/>
          </Button>
          <span className="min-w-[40px] text-center text-xs text-viewer-chrome/70" aria-live="polite">
            {Math.round(zoom * 100)}%
          </span>
          <Button type="button" variant="ghost" size="icon" className="size-8 text-viewer-chrome/80 hover:text-viewer-chrome hover:bg-viewer-chrome/10 sm:size-9" onClick={handleZoomInClick} disabled={zoom >= 4} aria-label="Zoom in">
            <ZoomIn className="size-4 sm:size-5" aria-hidden/>
          </Button>
          <div className="mx-1 h-6 w-px bg-viewer-chrome/20 sm:mx-2"/>
          <Button variant="ghost" size="icon" className="size-8 text-viewer-chrome/80 hover:text-viewer-chrome hover:bg-viewer-chrome/10 sm:size-9" asChild>
            <a href={currentImage.url} target="_blank" rel="noopener noreferrer" onClick={handleStopPropagation} aria-label={`Open ${currentImage.name} in new tab`}>
              <ExternalLink className="size-4 sm:size-5" aria-hidden/>
            </a>
          </Button>
          <Button variant="ghost" size="icon" className="size-8 text-viewer-chrome/80 hover:text-viewer-chrome hover:bg-viewer-chrome/10 sm:size-9" asChild>
            <a href={currentImage.url} download={currentImage.name} onClick={handleStopPropagation} aria-label={`Download ${currentImage.name}`}>
              <Download className="size-4 sm:size-5" aria-hidden/>
            </a>
          </Button>
          <div className="mx-1 h-6 w-px bg-viewer-chrome/20 sm:mx-2"/>
          <Button type="button" variant="ghost" size="icon" className="size-8 text-viewer-chrome/80 hover:text-viewer-chrome hover:bg-viewer-chrome/10 sm:size-9" onClick={handleCloseClick} aria-label="Close preview">
            <X className="size-4 sm:size-5" aria-hidden/>
          </Button>
        </div>
      </div>

      {/* Navigation Arrows */}
      {hasMultipleImages && (<>
          <Button type="button" variant="ghost" size="icon" className="absolute left-2 top-1/2 z-20 size-10 -translate-y-1/2 rounded-full bg-black/50 text-viewer-chrome hover:bg-black/70 sm:left-4 sm:size-12" onClick={handlePreviousClick} aria-label="Previous image">
            <ChevronLeft className="size-6 sm:size-8" aria-hidden/>
          </Button>
          <Button type="button" variant="ghost" size="icon" className="absolute right-2 top-1/2 z-20 size-10 -translate-y-1/2 rounded-full bg-black/50 text-viewer-chrome hover:bg-black/70 sm:right-4 sm:size-12" onClick={handleNextClick} aria-label="Next image">
            <ChevronRight className="size-6 sm:size-8" aria-hidden/>
          </Button>
        </>)}

      {/* Image area */}
      <div
        className="relative flex size-full items-center justify-center overflow-hidden p-8 sm:p-12 md:p-16"
        onClick={handleStopPropagation}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        onDoubleClick={handleDoubleClick}
        onKeyDown={handleImageAreaKeyDown}
        role="button"
        tabIndex={0}
        aria-label={`Preview image ${currentImage.name}`}
      >
        {/* Loading state */}
        {isLoading && !hasError ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <LoaderCircle className="size-8 animate-spin text-viewer-chrome/40" aria-hidden />
          </div>
        ) : null}

        {/* Error state */}
        {hasError ? (
          <div className="flex flex-col items-center justify-center gap-3 text-viewer-chrome/50">
            <ImageIcon className="size-12" aria-hidden />
            <div className="text-center">
              <p className="text-sm font-medium text-viewer-chrome/70">Failed to load image</p>
              <p className="mt-1 max-w-xs text-xs text-viewer-chrome/40">{currentImage.name}</p>
              <a href={currentImage.url} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-viewer-chrome/10 px-3 py-1.5 text-xs text-viewer-chrome/80 hover:bg-viewer-chrome/20" onClick={handleStopPropagation}>
                <ExternalLink className="size-3.5" aria-hidden />
                Open in new tab
              </a>
            </div>
          </div>
        ) : null}

        {/* The image — using plain img to avoid LazyImage's fill positioning */}
        {!hasError ? (
          <img
            key={imageKey}
            src={currentImage.url}
            alt={currentImage.name}
            className={cn(
              "max-h-full max-w-full object-contain transition-transform duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-out)] motion-reduce:transition-none",
              zoom > 1 ? "cursor-grab" : "cursor-zoom-in",
              isDragging && "cursor-grabbing",
              isLoading && "opacity-0",
            )}
            style={{ objectFit: 'contain', ...imageStyle }}
            onClick={handleImageClick}
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false);
              setHasError(true);
            }}
            draggable={false}
          />
        ) : null}
      </div>

      {/* Thumbnails */}
      {hasMultipleImages && (<div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/70 to-transparent p-3 sm:p-4">
          <div className="mx-auto flex max-w-full items-center justify-center gap-1.5 overflow-x-auto pb-1 [scrollbar-width:thin] sm:gap-2">
            {images.map((image, index) => (<ThumbnailButton key={`${image.url}-${image.name}`} image={image} index={index} initialIndex={initialIndex} normalizedIndex={normalizedIndex} totalImages={images.length} onSelectThumbnail={handleSelectThumbnail}/>))}
          </div>
        </div>)}

      {/* Keyboard hints — hidden on mobile and when thumbnails are shown */}
      <div className={cn("absolute bottom-3 right-4 z-10 hidden text-xs text-viewer-chrome/40 md:block", hasMultipleImages && "md:hidden")} aria-hidden>
        <span>← → Navigate</span>
        <span className="mx-2">•</span>
        <span>Scroll to zoom</span>
        <span className="mx-2">•</span>
        <span>Esc Close</span>
      </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>);
}
