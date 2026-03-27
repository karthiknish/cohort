'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
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
  DialogClose,
  DialogContent,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from '@/shared/ui/dialog-primitives'
import { LazyImage } from '@/shared/ui/lazy-image'
import { cn } from '@/lib/utils'

interface ImagePreviewModalProps {
  images: Array<{
    url: string
    name: string
    size?: string
  }>
  initialIndex?: number
  isOpen: boolean
  onClose: () => void
}

interface ThumbnailButtonProps {
  image: { url: string; name: string }
  index: number
  initialIndex: number
  normalizedIndex: number
  setIndexOffset: React.Dispatch<React.SetStateAction<number>>
  setZoom: React.Dispatch<React.SetStateAction<number>>
  setPosition: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>
}

function ThumbnailButton({
  image,
  index,
  initialIndex,
  normalizedIndex,
  setIndexOffset,
  setZoom,
  setPosition,
}: ThumbnailButtonProps) {
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      setIndexOffset(() => index - initialIndex)
      setZoom(1)
      setPosition({ x: 0, y: 0 })
    },
    [index, initialIndex, setIndexOffset, setZoom, setPosition]
  )

  return (
    <button
      key={`${image.url}-${image.name}`}
      className={cn(
        "h-14 w-14 overflow-hidden rounded-md border-2 transition-[color,background-color,border-color,text-decoration-color,fill,stroke,opacity,box-shadow,transform,filter,backdrop-filter]",
        index === normalizedIndex
          ? "border-white opacity-100"
          : "border-transparent opacity-50 hover:opacity-80"
      )}
      onClick={handleClick}
    >
      <LazyImage
        src={image.url}
        alt={image.name}
        className="h-full w-full object-cover"
      />
    </button>
  )
}

export function ImagePreviewModal({
  images,
  initialIndex = 0,
  isOpen,
  onClose,
}: ImagePreviewModalProps) {
  const [indexOffset, setIndexOffset] = useState(0)
  const [zoom, setZoom] = useState(1)
  const [isDragging, setIsDragging] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  const normalizedIndex =
    images.length > 0
      ? ((initialIndex + indexOffset) % images.length + images.length) % images.length
      : 0

  const currentImage = images[normalizedIndex]
  const hasMultipleImages = images.length > 1

  const handleClose = useCallback(() => {
    setIndexOffset(0)
    setZoom(1)
    setPosition({ x: 0, y: 0 })
    setIsDragging(false)
    onClose()
  }, [onClose])

  const handlePrevious = useCallback(() => {
    setIndexOffset((prev) => prev - 1)
    setZoom(1)
    setPosition({ x: 0, y: 0 })
  }, [])

  const handleNext = useCallback(() => {
    setIndexOffset((prev) => prev + 1)
    setZoom(1)
    setPosition({ x: 0, y: 0 })
  }, [])

  const handleZoomIn = useCallback(() => {
    setZoom((prev) => Math.min(prev + 0.5, 4))
  }, [])

  const handleZoomOut = useCallback(() => {
    setZoom((prev) => {
      const newZoom = Math.max(prev - 0.5, 1)
      if (newZoom === 1) {
        setPosition({ x: 0, y: 0 })
      }
      return newZoom
    })
  }, [])

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (zoom > 1) {
        setIsDragging(true)
        setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y })
      }
    },
    [zoom, position]
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isDragging && zoom > 1) {
        setPosition({
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y,
        })
      }
    },
    [isDragging, dragStart, zoom]
  )

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleOnOpenChange = useCallback(
    (open: boolean) => {
      if (!open) handleClose()
    },
    [handleClose]
  )

  const handleStopPropagation = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
  }, [])

  const handleZoomOutClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      handleZoomOut()
    },
    [handleZoomOut]
  )

  const handleZoomInClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      handleZoomIn()
    },
    [handleZoomIn]
  )

  const handleCloseClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      handleClose()
    },
    [handleClose]
  )

  const handlePreviousClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      handlePrevious()
    },
    [handlePrevious]
  )

  const handleNextClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      handleNext()
    },
    [handleNext]
  )

  const handleImageAreaKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        handleClose()
      }
    },
    [handleClose]
  )

  const handleImageClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      if (zoom === 1) {
        handleZoomIn()
      }
    },
    [zoom, handleZoomIn]
  )

  const imageStyle = useMemo(
    () => ({
      transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
    }),
    [zoom, position.x, position.y]
  )

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return

      switch (e.key) {
        case "Escape":
          handleClose()
          break
        case "ArrowLeft":
          handlePrevious()
          break
        case "ArrowRight":
          handleNext()
          break
        case "+":
        case "=":
          handleZoomIn()
          break
        case "-":
          handleZoomOut()
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [handleClose, handleNext, handlePrevious, handleZoomIn, handleZoomOut, isOpen])

  if (!isOpen || !currentImage) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOnOpenChange}>
      <DialogPortal>
        <DialogOverlay className="fixed inset-0 z-[1200] bg-black/90 backdrop-blur-sm animate-in fade-in duration-200" />
        <DialogContent
          className="fixed inset-0 z-[1200] flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-0"
          onPointerDownOutside={handleClose}
        >
          <DialogTitle className="sr-only">
            Image Preview: {currentImage.name}
          </DialogTitle>
      {/* Header */}
      <div className="absolute left-0 right-0 top-0 z-10 flex items-center justify-between bg-gradient-to-b from-black/60 to-transparent p-4">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-white/90 truncate max-w-[300px]">
            {currentImage.name}
          </span>
          {currentImage.size && (
            <span className="text-xs text-white/60">{currentImage.size}</span>
          )}
          {hasMultipleImages && (
            <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/80">
              {normalizedIndex + 1} / {images.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-white/80 hover:text-white hover:bg-white/10"
            onClick={handleZoomOutClick}
            disabled={zoom <= 1}
          >
            <ZoomOut className="h-5 w-5" />
            <span className="sr-only">Zoom out</span>
          </Button>
          <span className="min-w-[50px] text-center text-xs text-white/70">
            {Math.round(zoom * 100)}%
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-white/80 hover:text-white hover:bg-white/10"
            onClick={handleZoomInClick}
            disabled={zoom >= 4}
          >
            <ZoomIn className="h-5 w-5" />
            <span className="sr-only">Zoom in</span>
          </Button>
          <div className="mx-2 h-6 w-px bg-white/20" />
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-white/80 hover:text-white hover:bg-white/10"
            asChild
            onClick={handleStopPropagation}
          >
            <a
              href={currentImage.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="h-5 w-5" />
              <span className="sr-only">Open in new tab</span>
            </a>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-white/80 hover:text-white hover:bg-white/10"
            asChild
            onClick={handleStopPropagation}
          >
            <a href={currentImage.url} download={currentImage.name}>
              <Download className="h-5 w-5" />
              <span className="sr-only">Download</span>
            </a>
          </Button>
          <div className="mx-2 h-6 w-px bg-white/20" />
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-white/80 hover:text-white hover:bg-white/10"
            onClick={handleCloseClick}
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </Button>
        </div>
      </div>

      {/* Navigation Arrows */}
      {hasMultipleImages && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 top-1/2 z-10 h-12 w-12 -translate-y-1/2 rounded-full bg-black/40 text-white hover:bg-black/60"
            onClick={handlePreviousClick}
          >
            <ChevronLeft className="h-8 w-8" />
            <span className="sr-only">Previous image</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-1/2 z-10 h-12 w-12 -translate-y-1/2 rounded-full bg-black/40 text-white hover:bg-black/60"
            onClick={handleNextClick}
          >
            <ChevronRight className="h-8 w-8" />
            <span className="sr-only">Next image</span>
          </Button>
        </>
      )}

      {/* Image */}
      <div
        className="flex h-full w-full items-center justify-center overflow-hidden p-16"
        onClick={handleStopPropagation}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onKeyDown={handleImageAreaKeyDown}
        role="button"
        tabIndex={0}
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
      </div>

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
              setIndexOffset={setIndexOffset}
              setZoom={setZoom}
              setPosition={setPosition}
            />
          ))}
        </div>
      )}

      {/* Keyboard hints */}
      <div className="absolute bottom-4 right-4 text-xs text-white/40">
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
