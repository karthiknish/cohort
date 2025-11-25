"use client"

import { useCallback, useEffect, useState } from "react"
import {
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

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

export function ImagePreviewModal({
  images,
  initialIndex = 0,
  isOpen,
  onClose,
}: ImagePreviewModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [zoom, setZoom] = useState(1)
  const [isDragging, setIsDragging] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  const currentImage = images[currentIndex]
  const hasMultipleImages = images.length > 1

  useEffect(() => {
    setCurrentIndex(initialIndex)
  }, [initialIndex])

  useEffect(() => {
    if (!isOpen) {
      setZoom(1)
      setPosition({ x: 0, y: 0 })
    }
  }, [isOpen])

  const handlePrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))
    setZoom(1)
    setPosition({ x: 0, y: 0 })
  }, [images.length])

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))
    setZoom(1)
    setPosition({ x: 0, y: 0 })
  }, [images.length])

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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return

      switch (e.key) {
        case "Escape":
          onClose()
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
  }, [isOpen, onClose, handlePrevious, handleNext, handleZoomIn, handleZoomOut])

  if (!isOpen || !currentImage) {
    return null
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
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
              {currentIndex + 1} / {images.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-white/80 hover:text-white hover:bg-white/10"
            onClick={(e) => {
              e.stopPropagation()
              handleZoomOut()
            }}
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
            onClick={(e) => {
              e.stopPropagation()
              handleZoomIn()
            }}
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
            onClick={(e) => e.stopPropagation()}
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
            onClick={(e) => e.stopPropagation()}
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
            onClick={(e) => {
              e.stopPropagation()
              onClose()
            }}
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
            onClick={(e) => {
              e.stopPropagation()
              handlePrevious()
            }}
          >
            <ChevronLeft className="h-8 w-8" />
            <span className="sr-only">Previous image</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-1/2 z-10 h-12 w-12 -translate-y-1/2 rounded-full bg-black/40 text-white hover:bg-black/60"
            onClick={(e) => {
              e.stopPropagation()
              handleNext()
            }}
          >
            <ChevronRight className="h-8 w-8" />
            <span className="sr-only">Next image</span>
          </Button>
        </>
      )}

      {/* Image */}
      <div
        className="flex h-full w-full items-center justify-center overflow-hidden p-16"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <img
          src={currentImage.url}
          alt={currentImage.name}
          className={cn(
            "max-h-full max-w-full object-contain transition-transform duration-200",
            zoom > 1 ? "cursor-grab" : "cursor-zoom-in",
            isDragging && "cursor-grabbing"
          )}
          style={{
            transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
          }}
          onClick={(e) => {
            e.stopPropagation()
            if (zoom === 1) {
              handleZoomIn()
            }
          }}
          draggable={false}
        />
      </div>

      {/* Thumbnails */}
      {hasMultipleImages && (
        <div className="absolute bottom-0 left-0 right-0 z-10 flex items-center justify-center gap-2 bg-gradient-to-t from-black/60 to-transparent p-4">
          {images.map((image, index) => (
            <button
              key={`${image.url}-${index}`}
              className={cn(
                "h-14 w-14 overflow-hidden rounded-md border-2 transition-all",
                index === currentIndex
                  ? "border-white opacity-100"
                  : "border-transparent opacity-50 hover:opacity-80"
              )}
              onClick={(e) => {
                e.stopPropagation()
                setCurrentIndex(index)
                setZoom(1)
                setPosition({ x: 0, y: 0 })
              }}
            >
              <img
                src={image.url}
                alt={image.name}
                className="h-full w-full object-cover"
              />
            </button>
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
    </div>
  )
}
