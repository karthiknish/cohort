'use client'

import { useCallback, useEffect, useState } from 'react'
import JSZip from 'jszip'
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Download,
  Loader2,
  Maximize2,
  Minimize2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface PptViewerProps {
  url: string
  className?: string
  title?: string
}

interface Slide {
  index: number
  imageUrl: string | null
  textContent: string
}

export function PptViewer({ url, className, title = 'Presentation' }: PptViewerProps) {
  const [slides, setSlides] = useState<Slide[]>([])
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const extractSlides = useCallback(async (arrayBuffer: ArrayBuffer): Promise<Slide[]> => {
    const zip = await JSZip.loadAsync(arrayBuffer)
    const extractedSlides: Slide[] = []

    // Get list of slide XML files
    const slideFiles = Object.keys(zip.files)
      .filter((name) => /^ppt\/slides\/slide\d+\.xml$/.test(name))
      .sort((a, b) => {
        const numA = parseInt(a.match(/slide(\d+)/)?.[1] || '0')
        const numB = parseInt(b.match(/slide(\d+)/)?.[1] || '0')
        return numA - numB
      })

    // Extract media files (images)
    const mediaFiles: Record<string, string> = {}
    const mediaEntries = Object.entries(zip.files).filter(([name]) =>
      name.startsWith('ppt/media/')
    )

    for (const [name, file] of mediaEntries) {
      try {
        const blob = await file.async('blob')
        mediaFiles[name] = URL.createObjectURL(blob)
      } catch {
        // Skip failed media extraction
      }
    }

    // Extract slide relationships to find images per slide
    for (let i = 0; i < slideFiles.length; i++) {
      const slideFile = slideFiles[i]
      if (!slideFile) continue
      const slideNum = parseInt(slideFile.match(/slide(\d+)/)?.[1] || '0')

      let imageUrl: string | null = null
      let textContent = ''

      // Try to get slide relationship file
      const relsPath = `ppt/slides/_rels/slide${slideNum}.xml.rels`
      const relsFile = zip.files[relsPath]

      if (relsFile) {
        try {
          const relsContent = await relsFile.async('text')
          // Find image references in relationships
          const imageMatch = relsContent.match(/Target="\.\.\/media\/(image\d+\.[^"]+)"/)
          if (imageMatch) {
            const mediaPath = `ppt/media/${imageMatch[1]}`
            imageUrl = mediaFiles[mediaPath] || null
          }
        } catch {
          // Skip failed relationship extraction
        }
      }

      // Extract text content from slide XML
      try {
        const slideFileEntry = zip.files[slideFile]
        if (!slideFileEntry) continue
        const slideContent = await slideFileEntry.async('text')
        // Extract text from <a:t> tags (PowerPoint text elements)
        const textMatches = slideContent.match(/<a:t>([^<]*)<\/a:t>/g)
        if (textMatches) {
          textContent = textMatches
            .map((match: string | undefined) => match?.replace(/<\/?a:t>/g, '') ?? '')
            .filter((text: string) => text.trim())
            .join(' ')
        }
      } catch {
        // Skip failed text extraction
      }

      // If no specific image found, try to use first available media as fallback
      if (!imageUrl && Object.values(mediaFiles).length > 0) {
        const mediaValues = Object.values(mediaFiles)
        if (mediaValues[i]) {
          imageUrl = mediaValues[i] ?? null
        }
      }

      extractedSlides.push({
        index: i,
        imageUrl,
        textContent: textContent.slice(0, 500), // Limit text content
      })
    }

    return extractedSlides
  }, [])

  const fetchPresentation = useCallback(async (fileUrl: string): Promise<ArrayBuffer> => {
    // v2: Always use proxy for external URLs to avoid CORS issues
    const proxyUrl = `/api/proxy/file?url=${encodeURIComponent(fileUrl)}`
    console.log('[PptViewer] Fetching via proxy:', proxyUrl)

    const response = await fetch(proxyUrl, {
      method: 'GET',
      credentials: 'include',
    })

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new Error('Access denied. You may not have permission to view this file.')
      }
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `Failed to fetch presentation: ${response.status}`)
    }

    return response.arrayBuffer()
  }, [])

  useEffect(() => {
    let cancelled = false

    async function loadPresentation() {
      setIsLoading(true)
      setError(null)

      try {
        const arrayBuffer = await fetchPresentation(url)
        if (cancelled) return

        const extractedSlides = await extractSlides(arrayBuffer)
        if (cancelled) return

        if (extractedSlides.length === 0) {
          throw new Error('No slides found in presentation')
        }

        setSlides(extractedSlides)
        setCurrentSlide(0)
      } catch (err) {
        if (cancelled) return
        setError(err instanceof Error ? err.message : 'Failed to load presentation')
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    void loadPresentation()

    return () => {
      cancelled = true
    }
  }, [url, extractSlides, fetchPresentation])

  // Clean up object URLs when slides change or component unmounts
  useEffect(() => {
    return () => {
      slides.forEach((slide) => {
        if (slide.imageUrl) {
          URL.revokeObjectURL(slide.imageUrl)
        }
      })
    }
  }, [slides])

  const goToSlide = useCallback((index: number) => {
    setCurrentSlide((prev) => {
      if (index >= 0 && index < slides.length) {
        return index
      }
      return prev
    })
  }, [slides.length])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        goToSlide(currentSlide - 1)
      } else if (e.key === 'ArrowRight') {
        goToSlide(currentSlide + 1)
      } else if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false)
      }
    },
    [currentSlide, goToSlide, isFullscreen]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  const currentSlideData = slides[currentSlide]!

  if (isLoading) {
    return (
      <div className={cn('flex items-center justify-center rounded-lg border bg-muted p-12', className)}>
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p>Loading presentation...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={cn('flex flex-col items-center justify-center gap-4 rounded-lg border bg-muted p-12', className)}>
        <AlertCircle className="h-10 w-10 text-destructive" />
        <div className="text-center">
          <p className="font-medium">Unable to load presentation</p>
          <p className="text-sm text-muted-foreground mt-1">{error}</p>
        </div>
        <Button variant="outline" asChild>
          <a href={url} target="_blank" rel="noreferrer">
            <Download className="mr-2 h-4 w-4" />
            Download instead
          </a>
        </Button>
      </div>
    )
  }

  const viewerContent = (
    <>
      {/* Slide display */}
      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg border bg-black">
        {currentSlideData?.imageUrl ? (
          <img
            src={currentSlideData.imageUrl}
            alt={`Slide ${currentSlide + 1}`}
            className="h-full w-full object-contain"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900 p-8">
            <div className="text-center">
              <p className="text-lg font-medium text-white mb-2">Slide {currentSlide + 1}</p>
              {currentSlideData?.textContent && (
                <p className="text-sm text-slate-300 max-w-lg">{currentSlideData.textContent}</p>
              )}
            </div>
          </div>
        )}

        {/* Navigation arrows */}
        {slides.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white hover:bg-black/70 disabled:opacity-30"
              onClick={() => goToSlide(currentSlide - 1)}
              disabled={currentSlide === 0}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white hover:bg-black/70 disabled:opacity-30"
              onClick={() => goToSlide(currentSlide + 1)}
              disabled={currentSlide === slides.length - 1}
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </>
        )}

        {/* Fullscreen toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2 bg-black/50 text-white hover:bg-black/70"
          onClick={() => setIsFullscreen(!isFullscreen)}
        >
          {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </Button>

        {/* Slide counter */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-sm text-white">
          {currentSlide + 1} / {slides.length}
        </div>
      </div>

      {/* Slide thumbnails */}
      {slides.length > 1 && (
        <div className="flex gap-2 overflow-x-auto py-2">
          {slides.map((slide, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              aria-label={index === currentSlide ? `Currently viewing slide ${index + 1}` : `Go to slide ${index + 1}`}
              aria-current={index === currentSlide ? 'true' : undefined}
              className={cn(
                'flex-shrink-0 rounded border-2 overflow-hidden transition-all',
                index === currentSlide
                  ? 'border-primary ring-2 ring-primary/20'
                  : 'border-transparent hover:border-muted-foreground/30'
              )}
            >
              <div className="w-20 h-12 bg-muted flex items-center justify-center text-xs text-muted-foreground">
                {slide.imageUrl ? (
                  <img
                    src={slide.imageUrl}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </>
  )

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-6xl">{viewerContent}</div>
      </div>
    )
  }

  return <div className={cn('flex flex-col gap-3', className)}>{viewerContent}</div>
}
