"use client"

import { useState } from "react"
import { Download, Image as ImageIcon, ZoomIn } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { CollaborationAttachment } from "@/types/collaboration"

import { ImagePreviewModal } from "./image-preview-modal"

interface ImageGalleryProps {
  images: Array<{
    url: string
    name: string
    size?: string
  }>
  className?: string
}

export function ImageGallery({ images, className }: ImageGalleryProps) {
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewIndex, setPreviewIndex] = useState(0)

  if (!images.length) return null

  const handleImageClick = (index: number) => {
    setPreviewIndex(index)
    setPreviewOpen(true)
  }

  // Single image layout
  if (images.length === 1) {
    const image = images[0]
    return (
      <>
        <figure
          className={cn(
            "group relative max-w-xl overflow-hidden rounded-lg border border-muted/60 bg-muted/10 cursor-pointer transition-all hover:border-muted",
            className
          )}
          onClick={() => handleImageClick(0)}
        >
          <div className="relative aspect-video max-h-96 overflow-hidden">
            <img
              src={image.url}
              alt={image.name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
              decoding="async"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/20">
              <div className="flex items-center gap-2 rounded-full bg-black/60 px-4 py-2 text-white opacity-0 transition-opacity group-hover:opacity-100">
                <ZoomIn className="h-4 w-4" />
                <span className="text-sm font-medium">Preview</span>
              </div>
            </div>
          </div>
          <figcaption className="flex items-center justify-between gap-3 border-t border-muted/40 p-3 text-xs text-muted-foreground">
            <div className="flex flex-1 items-center gap-2 truncate">
              <ImageIcon className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{image.name}</span>
              {image.size && (
                <span className="whitespace-nowrap text-muted-foreground/60">
                  {image.size}
                </span>
              )}
            </div>
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={(e) => e.stopPropagation()}
            >
              <a href={image.url} download={image.name}>
                <Download className="mr-1 h-3.5 w-3.5" />
                Download
              </a>
            </Button>
          </figcaption>
        </figure>

        <ImagePreviewModal
          images={images}
          initialIndex={previewIndex}
          isOpen={previewOpen}
          onClose={() => setPreviewOpen(false)}
        />
      </>
    )
  }

  // Two images layout - side by side
  if (images.length === 2) {
    return (
      <>
        <div className={cn("grid grid-cols-2 gap-2 max-w-xl", className)}>
          {images.map((image, index) => (
            <figure
              key={`${image.url}-${index}`}
              className="group relative overflow-hidden rounded-lg border border-muted/60 bg-muted/10 cursor-pointer transition-all hover:border-muted"
              onClick={() => handleImageClick(index)}
            >
              <div className="relative aspect-square overflow-hidden">
                <img
                  src={image.url}
                  alt={image.name}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                  decoding="async"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/20">
                  <div className="rounded-full bg-black/60 p-2 text-white opacity-0 transition-opacity group-hover:opacity-100">
                    <ZoomIn className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </figure>
          ))}
        </div>

        <ImagePreviewModal
          images={images}
          initialIndex={previewIndex}
          isOpen={previewOpen}
          onClose={() => setPreviewOpen(false)}
        />
      </>
    )
  }

  // Three images layout - one large, two small
  if (images.length === 3) {
    return (
      <>
        <div className={cn("grid grid-cols-2 gap-2 max-w-xl", className)}>
          <figure
            className="group relative col-span-1 row-span-2 overflow-hidden rounded-lg border border-muted/60 bg-muted/10 cursor-pointer transition-all hover:border-muted"
            onClick={() => handleImageClick(0)}
          >
            <div className="relative aspect-[3/4] overflow-hidden">
              <img
                src={images[0].url}
                alt={images[0].name}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
                decoding="async"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/20">
                <div className="rounded-full bg-black/60 p-2 text-white opacity-0 transition-opacity group-hover:opacity-100">
                  <ZoomIn className="h-4 w-4" />
                </div>
              </div>
            </div>
          </figure>
          {images.slice(1, 3).map((image, index) => (
            <figure
              key={`${image.url}-${index}`}
              className="group relative overflow-hidden rounded-lg border border-muted/60 bg-muted/10 cursor-pointer transition-all hover:border-muted"
              onClick={() => handleImageClick(index + 1)}
            >
              <div className="relative aspect-square overflow-hidden">
                <img
                  src={image.url}
                  alt={image.name}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                  decoding="async"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/20">
                  <div className="rounded-full bg-black/60 p-2 text-white opacity-0 transition-opacity group-hover:opacity-100">
                    <ZoomIn className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </figure>
          ))}
        </div>

        <ImagePreviewModal
          images={images}
          initialIndex={previewIndex}
          isOpen={previewOpen}
          onClose={() => setPreviewOpen(false)}
        />
      </>
    )
  }

  // Four+ images layout - grid with "+X more" overlay
  const displayImages = images.slice(0, 4)
  const remainingCount = images.length - 4

  return (
    <>
      <div className={cn("grid grid-cols-2 gap-2 max-w-xl", className)}>
        {displayImages.map((image, index) => (
          <figure
            key={`${image.url}-${index}`}
            className="group relative overflow-hidden rounded-lg border border-muted/60 bg-muted/10 cursor-pointer transition-all hover:border-muted"
            onClick={() => handleImageClick(index)}
          >
            <div className="relative aspect-square overflow-hidden">
              <img
                src={image.url}
                alt={image.name}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
                decoding="async"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/20">
                {index === 3 && remainingCount > 0 ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <span className="text-2xl font-bold text-white">
                      +{remainingCount}
                    </span>
                  </div>
                ) : (
                  <div className="rounded-full bg-black/60 p-2 text-white opacity-0 transition-opacity group-hover:opacity-100">
                    <ZoomIn className="h-4 w-4" />
                  </div>
                )}
              </div>
            </div>
          </figure>
        ))}
      </div>

      <ImagePreviewModal
        images={images}
        initialIndex={previewIndex}
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
      />
    </>
  )
}
