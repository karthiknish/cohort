'use client'

import { useState, useRef, useCallback } from 'react'
import { Play, Pause, Volume2, VolumeX, Maximize2, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { CollaborationAttachment } from '@/types/collaboration'

interface GifGalleryItemProps {
  attachment: CollaborationAttachment
  index?: number
  className?: string
  onPreview?: (attachment: CollaborationAttachment) => void
}

/**
 * Gallery item component with special handling for GIFs
 * Shows play/pause controls and prevents auto-playing GIFs until hovered
 */
export function GifGalleryItem({
  attachment,
  index,
  className,
  onPreview,
}: GifGalleryItemProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)

  const isGif = attachment.type?.includes('gif') || attachment.name.toLowerCase().endsWith('.gif')
  const isVideo = attachment.type?.startsWith('video/') || attachment.name.toLowerCase().match(/\.(mp4|webm|mov|avi)$/i)

  const handlePlayPause = useCallback(() => {
    if (!videoRef.current) return

    if (isPlaying) {
      videoRef.current.pause()
    } else {
      videoRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }, [isPlaying])

  const handleMuteToggle = useCallback(() => {
    if (!videoRef.current) return
    videoRef.current.muted = !isMuted
    setIsMuted(!isMuted)
  }, [isMuted])

  const handleMouseEnter = useCallback(() => {
    if (!videoRef.current || isPlaying) return
    videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {
      // Auto-play was blocked, user needs to interact first
    })
  }, [isPlaying])

  const handleMouseLeave = useCallback(() => {
    if (!videoRef.current || !isPlaying) return
    videoRef.current.pause()
    setIsPlaying(false)
  }, [isPlaying])

  const handleDownload = useCallback(() => {
    const link = document.createElement('a')
    link.href = attachment.url
    link.download = attachment.name
    link.click()
  }, [attachment])

  // For regular images, show simple img tag
  if (!isGif && !isVideo) {
    return (
      <div className={cn('relative group rounded-lg overflow-hidden', className)}>
        <img
          src={attachment.url}
          alt={attachment.name}
          className="w-full h-auto object-cover"
          loading="lazy"
        />
        {onPreview && (
          <button
            type="button"
            onClick={() => onPreview(attachment)}
            className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
          >
            <Maximize2 className="h-8 w-8 text-white" />
          </button>
        )}
      </div>
    )
  }

  // For GIFs and videos, show with controls
  return (
    <div
      className={cn('relative group rounded-lg overflow-hidden bg-black', className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Video/GIF element */}
      <video
        ref={videoRef}
        src={attachment.url}
        className="w-full h-auto object-cover max-h-96"
        muted={isMuted}
        loop
        playsInline
        onLoadedData={() => setIsLoading(false)}
        poster={attachment.url.replace(/\.(gif|mp4|webm|mov)$/i, '.jpg')} // Try to find poster image
      />

      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent" />
        </div>
      )}

      {/* Controls overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="absolute bottom-0 left-0 right-0 p-3 flex items-center justify-between">
          {/* Play/Pause button */}
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-white hover:bg-white/20"
            onClick={handlePlayPause}
          >
            {isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4 ml-0.5" />
            )}
          </Button>

          {/* Right side controls */}
          <div className="flex items-center gap-1">
            {/* Mute button */}
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-white hover:bg-white/20"
              onClick={handleMuteToggle}
            >
              {isMuted ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </Button>

            {/* Download button */}
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-white hover:bg-white/20"
              onClick={handleDownload}
            >
              <Download className="h-4 w-4" />
            </Button>

            {/* Preview button */}
            {onPreview && (
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-white hover:bg-white/20"
                onClick={() => onPreview(attachment)}
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* GIF badge */}
        {isGif && (
          <div className="absolute top-2 left-2">
            <span className="px-2 py-1 bg-black/70 rounded text-[10px] font-medium text-white uppercase">
              GIF
            </span>
          </div>
        )}
      </div>

      {/* Click to play overlay (for when user needs to interact first) */}
      {!isPlaying && !isLoading && (
        <button
          type="button"
          onClick={handlePlayPause}
          className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors"
        >
          <div className="h-12 w-12 rounded-full bg-white/90 flex items-center justify-center">
            <Play className="h-5 w-5 text-black ml-0.5" />
          </div>
        </button>
      )}
    </div>
  )
}

/**
 * Lightweight GIF thumbnail that loads the full GIF on hover
 */
export function GifThumbnail({
  attachment,
  className,
}: {
  attachment: CollaborationAttachment
  className?: string
}) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  const isGif = attachment.type?.includes('gif') || attachment.name.toLowerCase().endsWith('.gif')

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true)
    if (!isLoaded && imgRef.current) {
      imgRef.current.src = attachment.url
    }
  }, [attachment.url, isLoaded])

  const handleLoad = useCallback(() => {
    setIsLoaded(true)
  }, [])

  if (!isGif) {
    return (
      <img
        src={attachment.url}
        alt={attachment.name}
        className={cn('w-full h-auto object-cover rounded-lg', className)}
        loading="lazy"
      />
    )
  }

  return (
    <div
      className={cn('relative rounded-lg overflow-hidden bg-muted', className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Static thumbnail - using first frame or poster */}
      <img
        ref={imgRef}
        src={isHovered ? attachment.url : attachment.url}
        alt={attachment.name}
        className={cn('w-full h-auto object-cover transition-opacity', isLoaded && 'opacity-100')}
        onLoad={handleLoad}
        loading="lazy"
      />

      {/* GIF badge */}
      <div className="absolute bottom-2 right-2">
        <span className="px-2 py-1 bg-black/70 rounded text-[10px] font-medium text-white uppercase flex items-center gap-1">
          <Play className="h-3 w-3" />
          GIF
        </span>
      </div>

      {/* Loading indicator */}
      {isHovered && !isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
        </div>
      )}
    </div>
  )
}
