
"use client"

import { useCallback, useMemo, useState } from "react"
import { CircleAlert, LoaderCircle, ZoomIn } from "lucide-react"

import { cn } from "@/lib/utils"
import { LazyImage } from "@/shared/ui/lazy-image"
import { ImagePreviewModal } from "./image-preview-modal"

interface ImageUrlPreviewProps {
  url: string
  className?: string
}

export function ImageUrlPreview({ url, className }: ImageUrlPreviewProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const handleOpenPreview = useCallback(() => {
    setPreviewOpen(true)
  }, [])

  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      setPreviewOpen(true)
    }
  }, [])

  const handleImageLoad = useCallback(() => {
    setIsLoading(false)
  }, [])

  const handleImageError = useCallback(() => {
    setIsLoading(false)
    setHasError(true)
  }, [])

  const handleClosePreview = useCallback(() => {
    setPreviewOpen(false)
  }, [])

  const fileName = useMemo(() => {
    const pathWithMaybeHash = url.split("?")[0] ?? ""
    const pathOnly = pathWithMaybeHash.split("#")[0] ?? ""
    const segments = pathOnly.split("/").filter(Boolean)
    const lastSegment = segments[segments.length - 1]

    if (typeof lastSegment === 'string' && lastSegment.length > 0) {
      return lastSegment
    }

    return "Image"
  }, [url])

  if (hasError) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-sm text-primary underline-offset-2 hover:underline"
      >
        <CircleAlert className="h-3.5 w-3.5 text-muted-foreground" />
        {fileName}
      </a>
    )
  }

  return (
    <>
      <button
        type="button"
        className={cn(
          "group relative block max-w-md overflow-hidden rounded-lg border border-muted/60 bg-muted/10 cursor-pointer transition-[color,background-color,border-color,text-decoration-color,fill,stroke,opacity,box-shadow,transform,filter,backdrop-filter] hover:border-muted my-2",
          className
        )}
        onClick={handleOpenPreview}
        onKeyDown={handleKeyDown}
        aria-label={`Preview image ${fileName}`}
      >
        <div className="relative overflow-hidden">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/20">
              <LoaderCircle className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          )}
          <LazyImage
            src={url}
            alt={fileName}
            className={cn(
              "max-h-80 w-auto object-contain transition-[color,background-color,border-color,text-decoration-color,fill,stroke,opacity,box-shadow,transform,filter,backdrop-filter] duration-[var(--motion-duration-normal)] ease-[var(--motion-ease-standard)] motion-reduce:transition-none",
              isLoading && "opacity-0",
              "group-hover:scale-105"
            )}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/20">
            <div className="flex items-center gap-2 rounded-full bg-black/60 px-3 py-1.5 text-white opacity-0 transition-opacity group-hover:opacity-100">
              <ZoomIn className="h-4 w-4" />
              <span className="text-xs font-medium">Preview</span>
            </div>
          </div>
        </div>
      </button>

      <ImagePreviewModal
        images={[{ url, name: fileName }]}
        isOpen={previewOpen}
        onClose={handleClosePreview}
      />
    </>
  )
}
