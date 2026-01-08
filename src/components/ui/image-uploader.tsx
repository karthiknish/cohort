'use client'

import { useCallback, useRef, useState, ChangeEvent, DragEvent } from 'react'
import { ImagePlus, LoaderCircle, Trash2, Upload } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { LazyImage } from '@/components/ui/lazy-image'
import { cn } from '@/lib/utils'

interface ImageUploaderProps {
  value?: string | null
  onChange: (url: string | null) => void
  onUpload: (file: File) => Promise<string>
  className?: string
  disabled?: boolean
  maxSizeMB?: number
  placeholder?: string
}

export function ImageUploader({
  value,
  onChange,
  onUpload,
  className,
  disabled = false,
  maxSizeMB = 5,
  placeholder = 'Upload an image',
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(value ?? null)

  const maxSizeBytes = maxSizeMB * 1024 * 1024

  const handleClick = useCallback(() => {
    if (!disabled && !isUploading) {
      inputRef.current?.click()
    }
  }, [disabled, isUploading])

  const validateFile = useCallback(
    (file: File): string | null => {
      if (!file.type.startsWith('image/')) {
        return 'Please select an image file (PNG, JPG, WebP, or GIF)'
      }
      if (file.size > maxSizeBytes) {
        return `Image must be smaller than ${maxSizeMB}MB`
      }
      return null
    },
    [maxSizeBytes, maxSizeMB]
  )

  const processFile = useCallback(
    async (file: File) => {
      const validationError = validateFile(file)
      if (validationError) {
        setError(validationError)
        return
      }

      setError(null)
      setIsUploading(true)

      // Create preview
      const objectUrl = URL.createObjectURL(file)
      setPreviewUrl(objectUrl)

      try {
        const uploadedUrl = await onUpload(file)
        URL.revokeObjectURL(objectUrl)
        setPreviewUrl(uploadedUrl)
        onChange(uploadedUrl)
      } catch (err) {
        console.error('Image upload failed:', err)
        setError('Upload failed. Please try again.')
        URL.revokeObjectURL(objectUrl)
        setPreviewUrl(value ?? null)
      } finally {
        setIsUploading(false)
      }
    },
    [onUpload, onChange, validateFile, value]
  )

  const handleFileChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (file) {
        void processFile(file)
      }
      event.target.value = ''
    },
    [processFile]
  )

  const handleDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault()
      event.stopPropagation()
      setIsDragging(false)

      if (disabled || isUploading) return

      const file = event.dataTransfer.files?.[0]
      if (file) {
        void processFile(file)
      }
    },
    [disabled, isUploading, processFile]
  )

  const handleRemove = useCallback(() => {
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl)
    }
    setPreviewUrl(null)
    onChange(null)
    setError(null)
  }, [previewUrl, onChange])

  return (
    <div className={cn('space-y-2', className)}>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
        className="hidden"
        onChange={handleFileChange}
        disabled={disabled || isUploading}
      />

      {previewUrl ? (
        <div className="relative group">
          <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-border bg-muted">
            <LazyImage
              src={previewUrl}
              alt="Feature preview"
              className="h-full w-full object-cover"
            />
            {isUploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}
          </div>
          <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="h-8 w-8 bg-background/90 hover:bg-background"
              onClick={handleClick}
              disabled={disabled || isUploading}
            >
              <ImagePlus className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="h-8 w-8"
              onClick={handleRemove}
              disabled={disabled || isUploading}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div
          role="button"
          tabIndex={0}
          onClick={handleClick}
          onKeyDown={(e) => e.key === 'Enter' && handleClick()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            'flex flex-col items-center justify-center gap-2 p-6',
            'aspect-video w-full rounded-lg border-2 border-dashed',
            'cursor-pointer transition-colors',
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50',
            (disabled || isUploading) && 'cursor-not-allowed opacity-50'
          )}
        >
          {isUploading ? (
            <LoaderCircle className="h-8 w-8 animate-spin text-muted-foreground" />
          ) : (
            <Upload className="h-8 w-8 text-muted-foreground" />
          )}
          <div className="text-center">
            <p className="text-sm font-medium text-foreground">
              {isUploading ? 'Uploading...' : placeholder}
            </p>
            <p className="text-xs text-muted-foreground">
              Drag and drop or click to browse
            </p>
          </div>
        </div>
      )}

      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
    </div>
  )
}
