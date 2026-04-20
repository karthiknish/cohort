'use client'

import { Download, Image as ImageIcon, ZoomIn } from 'lucide-react'
import { useCallback, useState, type MouseEvent } from 'react'

import { Button } from '@/shared/ui/button'
import { LazyImage } from '@/shared/ui/lazy-image'
import { cn } from '@/lib/utils'

import { ImagePreviewModal } from './image-preview-modal'

interface ImageGalleryProps {
  images: Array<{ url: string; name: string; size?: string }>
  className?: string
}

function PreviewTile({ image, previewIndex, onPreview, className, aspectClassName = 'aspect-square', overlayCount }: {
  image: ImageGalleryProps['images'][number]
  previewIndex: number
  onPreview: (index: number) => void
  className?: string
  aspectClassName?: string
  overlayCount?: number
}) {
  const handlePreview = useCallback((event: MouseEvent<HTMLButtonElement>) => {
    const index = Number(event.currentTarget.dataset.previewIndex)
    onPreview(index)
  }, [onPreview])

  return (
    <button
      type="button"
      onClick={handlePreview}
      data-preview-index={previewIndex}
      className={cn('group relative overflow-hidden rounded-lg border border-muted/60 bg-muted/10 text-left motion-chromatic hover:border-muted', className)}
      aria-label={`Preview image ${image.name}`}
    >
      <div className={cn('relative overflow-hidden', aspectClassName)}>
        <LazyImage src={image.url} alt={image.name} className="h-full w-full object-cover transition-transform duration-[var(--motion-duration-normal)] ease-[var(--motion-ease-out)] motion-reduce:transition-none group-hover:scale-105" />
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/20">
          {typeof overlayCount === 'number' ? (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-2xl font-bold text-white">+{overlayCount}</div>
          ) : (
            <div className="rounded-full bg-black/60 p-2 text-white opacity-0 transition-opacity group-hover:opacity-100">
              <ZoomIn className="h-4 w-4" />
            </div>
          )}
        </div>
      </div>
    </button>
  )
}

export function ImageGallery({ images, className }: ImageGalleryProps) {
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewIndex, setPreviewIndex] = useState(0)

  const handleImageClick = useCallback((index: number) => {
    setPreviewIndex(index)
    setPreviewOpen(true)
  }, [])

  const handleClosePreview = useCallback(() => {
    setPreviewOpen(false)
  }, [])

  if (!images.length) return null

  if (images.length === 1) {
    const image = images[0]
    if (!image) return null
    return (
      <>
        <figure className={cn('my-2 max-w-xl overflow-hidden rounded-lg border border-muted/60 bg-muted/10', className)}>
          <PreviewTile image={image} previewIndex={0} onPreview={handleImageClick} aspectClassName="aspect-video max-h-96" className="rounded-none border-0" />
          <figcaption className="flex items-center justify-between gap-3 border-t border-muted/40 p-3 text-xs text-muted-foreground">
            <div className="flex flex-1 items-center gap-2 truncate">
              <ImageIcon className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{image.name}</span>
              {image.size ? <span className="whitespace-nowrap text-muted-foreground/60">{image.size}</span> : null}
            </div>
            <Button asChild variant="ghost" size="sm" className="h-7 px-2 text-xs">
              <a href={image.url} download={image.name}><Download className="mr-1 h-3.5 w-3.5" />Download</a>
            </Button>
          </figcaption>
        </figure>
        <ImagePreviewModal images={images} initialIndex={previewIndex} isOpen={previewOpen} onClose={handleClosePreview} />
      </>
    )
  }

  const modal = <ImagePreviewModal images={images} initialIndex={previewIndex} isOpen={previewOpen} onClose={handleClosePreview} />

  if (images.length === 2) {
    return <><div className={cn('grid max-w-xl grid-cols-2 gap-2', className)}>{images.map((image, index) => <PreviewTile key={image.url} image={image} previewIndex={index} onPreview={handleImageClick} />)}</div>{modal}</>
  }

  if (images.length === 3) {
    const firstImage = images[0]
    if (!firstImage) return null

    return (
      <>
        <div className={cn('grid max-w-xl grid-cols-2 gap-2', className)}>
          <PreviewTile image={firstImage} previewIndex={0} onPreview={handleImageClick} className="col-span-1 row-span-2" aspectClassName="aspect-[3/4]" />
          {images.slice(1, 3).map((image, index) => <PreviewTile key={image.url} image={image} previewIndex={index + 1} onPreview={handleImageClick} />)}
        </div>
        {modal}
      </>
    )
  }

  const displayImages = images.slice(0, 4)
  const remainingCount = images.length - 4

  return (
    <>
      <div className={cn('grid max-w-xl grid-cols-2 gap-2', className)}>
        {displayImages.map((image, index) => (
          <PreviewTile
            key={image.url}
            image={image}
            previewIndex={index}
            onPreview={handleImageClick}
            overlayCount={index === 3 && remainingCount > 0 ? remainingCount : undefined}
          />
        ))}
      </div>
      {modal}
    </>
  )
}