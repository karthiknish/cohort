'use client'

import { useCallback, useRef, useState, type ChangeEvent, type DragEvent } from 'react'
import NextImage from 'next/image'
import { CheckCircle2, Loader2, Trash2, Upload } from 'lucide-react'

import { ADS_PAGE_THEME } from '@/features/dashboard/ads/components/ads-page-theme'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { cn } from '@/lib/utils'

const IMAGE_ACCEPT = 'image/jpeg,image/png,image/webp,image/gif'
const VIDEO_ACCEPT = 'video/mp4,video/quicktime,video/x-msvideo'
const MAX_MB = 30

type CreativeMediaFieldProps = {
  mode?: 'image' | 'video'
  previewSrc?: string | null
  imageUrl: string
  imageHash?: string
  videoId?: string
  uploading?: boolean
  disabled?: boolean
  onImageUrlChange: (value: string) => void
  onFileSelect: (event: ChangeEvent<HTMLInputElement>) => void
  onClear?: () => void
}

export function CreativeMediaField({
  mode = 'image',
  previewSrc,
  imageUrl,
  imageHash,
  videoId,
  uploading = false,
  disabled = false,
  onImageUrlChange,
  onFileSelect,
  onClear,
}: CreativeMediaFieldProps) {
  const isVideo = mode === 'video'
  const accept = isVideo ? VIDEO_ACCEPT : IMAGE_ACCEPT
  const ready = isVideo ? Boolean(videoId) : Boolean(imageHash)
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [showUrlField, setShowUrlField] = useState(Boolean(imageUrl && !previewSrc))
  const [previewError, setPreviewError] = useState(false)

  const hasPreview = Boolean(previewSrc && !previewError)

  const openFilePicker = useCallback(() => {
    if (!disabled && !uploading) inputRef.current?.click()
  }, [disabled, uploading])

  const handleDragOver = useCallback((event: DragEvent<HTMLButtonElement>) => {
    event.preventDefault()
    setDragging(true)
  }, [])

  const handleDragLeave = useCallback((event: DragEvent<HTMLButtonElement>) => {
    event.preventDefault()
    setDragging(false)
  }, [])

  const handleDrop = useCallback(
    (event: DragEvent<HTMLButtonElement>) => {
      event.preventDefault()
      setDragging(false)
      if (disabled || uploading) return
      const file = event.dataTransfer.files?.[0]
      if (!file || !inputRef.current) return
      const dt = new DataTransfer()
      dt.items.add(file)
      inputRef.current.files = dt.files
      onFileSelect({ target: inputRef.current } as ChangeEvent<HTMLInputElement>)
    },
    [disabled, onFileSelect, uploading],
  )

  const handleUrlToggle = useCallback(() => {
    setShowUrlField((value) => !value)
  }, [])

  const handlePreviewError = useCallback(() => {
    setPreviewError(true)
  }, [])

  const handleImageUrlChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      onImageUrlChange(event.target.value)
    },
    [onImageUrlChange],
  )

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="sr-only"
        disabled={disabled || uploading}
        onChange={onFileSelect}
      />

      {hasPreview ? (
        <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-muted/20 ring-1 ring-border/40">
          <div className="relative aspect-[1.91/1] max-h-[220px] w-full bg-muted/40 sm:aspect-video">
            <NextImage
              src={previewSrc!}
              alt="Uploaded creative preview"
              fill
              unoptimized
              sizes="(max-width: 640px) 100vw, 480px"
              className="object-cover"
              onError={handlePreviewError}
            />
            {uploading ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-background/75 backdrop-blur-sm">
                <Loader2 className="size-7 animate-spin text-primary" aria-hidden />
                <p className="text-xs font-medium text-foreground">
                  {isVideo ? 'Uploading video to Meta…' : 'Uploading to Meta…'}
                </p>
              </div>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/50 bg-card/80 px-3 py-2.5">
            <div className="flex items-center gap-2 text-xs">
              {ready ? (
                <>
                  <CheckCircle2 className="size-4 text-success" aria-hidden />
                  <span className="font-medium text-foreground">Ready for ad creation</span>
                </>
              ) : (
                <span className="text-muted-foreground">Preview only — upload to attach to Meta</span>
              )}
            </div>
            <div className="flex gap-1.5">
              <Button type="button" variant="outline" size="sm" className="h-8" onClick={openFilePicker} disabled={disabled || uploading}>
                Replace
              </Button>
              {onClear ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-8 text-muted-foreground hover:text-destructive"
                  onClick={onClear}
                  disabled={disabled || uploading}
                  aria-label="Remove image"
                >
                  <Trash2 className="size-4" aria-hidden />
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={openFilePicker}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          disabled={disabled || uploading}
          className={cn(
            ADS_PAGE_THEME.controlMapFrame,
            'flex w-full flex-col items-center justify-center gap-3 px-6 py-10 text-center transition-colors',
            'border-2 border-dashed',
            dragging ? 'border-primary bg-primary/5' : 'border-border/70 bg-muted/15 hover:border-primary/35 hover:bg-muted/25',
            (disabled || uploading) && 'cursor-not-allowed opacity-60',
          )}
        >
          {uploading ? (
            <Loader2 className="size-9 animate-spin text-primary" aria-hidden />
          ) : (
            <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20">
              <Upload className="size-6 text-primary" aria-hidden />
            </div>
          )}
          <div className="space-y-1">
            <p className="text-sm font-semibold text-foreground">
              {uploading
                ? 'Uploading…'
                : isVideo
                  ? 'Drop video here or click to browse'
                  : 'Drop image here or click to browse'}
            </p>
            <p className="text-xs text-muted-foreground">
              {isVideo
                ? `MP4 or MOV · up to ${MAX_MB}MB`
                : `JPG, PNG, or WebP · up to ${MAX_MB}MB · recommended 1080×1080 or 1200×628`}
            </p>
          </div>
        </button>
      )}

      {!isVideo ? (
      <div className="flex items-center justify-between gap-2">
        <Button type="button" variant="ghost" size="sm" className="h-8 px-2 text-xs text-muted-foreground" onClick={handleUrlToggle}>
          {showUrlField ? 'Hide URL option' : 'Use image URL instead'}
        </Button>
        {imageHash ? (
          <span className="font-mono text-[10px] text-muted-foreground truncate max-w-[180px]" title={imageHash}>
            hash …{imageHash.slice(-8)}
          </span>
        ) : null}
        {videoId ? (
          <span className="font-mono text-[10px] text-muted-foreground truncate max-w-[180px]" title={videoId}>
            video …{videoId.slice(-8)}
          </span>
        ) : null}
      </div>
      ) : null}

      {showUrlField && !isVideo ? (
        <div className="space-y-1.5 rounded-xl border border-border/50 bg-muted/10 p-3">
          <Label htmlFor="creative-image-url" className="text-xs text-muted-foreground">
            Image URL (optional if you upload a file)
          </Label>
          <Input
            id="creative-image-url"
            type="url"
            placeholder="https://cdn.example.com/hero.jpg"
            value={imageUrl}
            onChange={handleImageUrlChange}
            disabled={disabled || uploading}
          />
          <p className="text-[11px] text-muted-foreground">
            Meta still requires an uploaded hash for most image ads — URL alone may not be enough.
          </p>
        </div>
      ) : null}
    </div>
  )
}
