"use client"

import { useState } from "react"
import { AlertCircle, Loader2, ZoomIn } from "lucide-react"

import { cn } from "@/lib/utils"
import { LazyImage } from "@/components/ui/lazy-image"
import { ImagePreviewModal } from "./image-preview-modal"

interface ImageUrlPreviewProps {
  url: string
  className?: string
}

export function ImageUrlPreview({ url, className }: ImageUrlPreviewProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)

  const fileName = (() => {
    try {
      const parsed = new URL(url)
      const pathParts = parsed.pathname.split("/")
      return pathParts[pathParts.length - 1] || "Image"
    } catch {
      return "Image"
    }
  })()

  if (hasError) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-sm text-primary underline-offset-2 hover:underline"
      >
        <AlertCircle className="h-3.5 w-3.5 text-muted-foreground" />
        {fileName}
      </a>
    )
  }

  return (
    <>
      <figure
        className={cn(
          "group relative inline-block max-w-md overflow-hidden rounded-lg border border-muted/60 bg-muted/10 cursor-pointer transition-all hover:border-muted",
          className
        )}
        onClick={() => setPreviewOpen(true)}
      >
        <div className="relative overflow-hidden">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/20">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          )}
          <LazyImage
            src={url}
            alt={fileName}
            className={cn(
              "max-h-80 w-auto object-contain transition-all duration-300",
              isLoading && "opacity-0",
              "group-hover:scale-105"
            )}
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false)
              setHasError(true)
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/20">
            <div className="flex items-center gap-2 rounded-full bg-black/60 px-3 py-1.5 text-white opacity-0 transition-opacity group-hover:opacity-100">
              <ZoomIn className="h-4 w-4" />
              <span className="text-xs font-medium">Preview</span>
            </div>
          </div>
        </div>
      </figure>

      <ImagePreviewModal
        images={[{ url, name: fileName }]}
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
      />
    </>
  )
}
