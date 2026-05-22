'use client'

import Image from 'next/image'
import { useCallback, useEffect, useRef, useReducer } from 'react'
import JSZip from 'jszip'
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Download,
  Loader2,
  Maximize2,
  Minimize2,
  RotateCcw,
} from 'lucide-react'

import { Button } from '@/shared/ui/button'
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

type PptViewerState = {
  slides: Slide[]
  currentSlide: number
  isLoading: boolean
  error: string | null
  isFullscreen: boolean
}

type PptViewerAction =
  | { type: 'beginLoad' }
  | { type: 'loadResolved'; slides: Slide[]; error?: string | null }
  | { type: 'setCurrentSlide'; value: number }
  | { type: 'toggleFullscreen' }
  | { type: 'setFullscreen'; value: boolean }

function createInitialPptViewerState(): PptViewerState {
  return {
    slides: [],
    currentSlide: 0,
    isLoading: true,
    error: null,
    isFullscreen: false,
  }
}

function pptViewerReducer(state: PptViewerState, action: PptViewerAction): PptViewerState {
  switch (action.type) {
    case 'beginLoad':
      return { ...state, isLoading: true, error: null, slides: [], currentSlide: 0 }
    case 'loadResolved':
      return {
        ...state,
        isLoading: false,
        slides: action.slides,
        currentSlide: 0,
        error: action.error ?? null,
      }
    case 'setCurrentSlide':
      return { ...state, currentSlide: action.value }
    case 'toggleFullscreen':
      return { ...state, isFullscreen: !state.isFullscreen }
    case 'setFullscreen':
      return { ...state, isFullscreen: action.value }
    default:
      return state
  }
}

export function PptViewer({ url, className, title = 'Presentation' }: PptViewerProps) {
  const [state, dispatch] = useReducer(pptViewerReducer, undefined, createInitialPptViewerState)
  const { slides, currentSlide, isLoading, error, isFullscreen } = state
  const loadRequestRef = useRef(0)

  const extractSlides = useCallback(async (arrayBuffer: ArrayBuffer): Promise<Slide[]> => {
    const zip = await JSZip.loadAsync(arrayBuffer)
    const extractedSlides: Slide[] = []

    const slideFiles = Object.keys(zip.files)
      .filter((name) => /^ppt\/slides\/slide\d+\.xml$/.test(name))
      .sort((a, b) => {
        const numA = parseInt(a.match(/slide(\d+)/)?.[1] || '0', 10)
        const numB = parseInt(b.match(/slide(\d+)/)?.[1] || '0', 10)
        return numA - numB
      })

    const mediaFiles: Record<string, string> = {}
    const mediaEntries = Object.entries(zip.files).filter(([name]) =>
      name.startsWith('ppt/media/'),
    )

    await Promise.all(
      mediaEntries.map(async ([name, file]) => {
        const blob = await file.async('blob').catch(() => null)
        if (blob) {
          mediaFiles[name] = URL.createObjectURL(blob)
        }
      }),
    )

    const mediaValues = Object.values(mediaFiles)
    const parsedSlides = await Promise.all(
      slideFiles.map(async (slideFile, i) => {
        if (!slideFile) return null
        const slideNum = parseInt(slideFile.match(/slide(\d+)/)?.[1] || '0', 10)

        let imageUrl: string | null = null
        let textContent = ''

        const relsPath = `ppt/slides/_rels/slide${slideNum}.xml.rels`
        const relsFile = zip.files[relsPath]

        if (relsFile) {
          const relsContent = await relsFile.async('text').catch(() => null)
          if (relsContent) {
            const imageMatch = relsContent.match(/Target="\.\.\/media\/(image\d+\.[^"]+)"/)
            if (imageMatch) {
              const mediaPath = `ppt/media/${imageMatch[1]}`
              imageUrl = mediaFiles[mediaPath] || null
            }
          }
        }

        const slideFileEntry = zip.files[slideFile]
        if (slideFileEntry) {
          const slideContent = await slideFileEntry.async('text').catch(() => null)
          if (slideContent) {
            const textMatches = slideContent.match(/<a:t>([^<]*)<\/a:t>/g)
            if (textMatches) {
              textContent = textMatches
                .flatMap((match: string | undefined) => {
                  const text = match?.replace(/<\/?a:t>/g, '') ?? ''
                  return text.trim() ? [text] : []
                })
                .join(' ')
            }
          }
        }

        if (!imageUrl && mediaValues.length > 0 && mediaValues[i]) {
          imageUrl = mediaValues[i] ?? null
        }

        return {
          index: i,
          imageUrl,
          textContent: textContent.slice(0, 500),
        }
      }),
    )

    extractedSlides.push(...parsedSlides.filter((slide): slide is NonNullable<typeof slide> => slide !== null))

    return extractedSlides
  }, [])

  const fetchPresentation = useCallback(async (fileUrl: string): Promise<ArrayBuffer> => {
    const proxyUrl = `/api/proxy/file?url=${encodeURIComponent(fileUrl)}`
    const response = await fetch(proxyUrl, {
      method: 'GET',
      credentials: 'include',
    })

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new Error('Access denied. You may not have permission to view this file.')
      }
      const errorData = await response.json().catch(() => ({}))
      throw new Error(
        (errorData as { error?: string }).error || `Failed to fetch presentation: ${response.status}`,
      )
    }

    return response.arrayBuffer()
  }, [])

  const loadPresentation = useCallback(() => {
    const requestId = loadRequestRef.current + 1
    loadRequestRef.current = requestId

    dispatch({ type: 'beginLoad' })

    void fetchPresentation(url)
      .then((arrayBuffer) => {
        if (loadRequestRef.current !== requestId) return null
        return extractSlides(arrayBuffer)
      })
      .then((extractedSlides) => {
        if (loadRequestRef.current !== requestId || !extractedSlides) return

        if (extractedSlides.length === 0) {
          throw new Error('No slides found in presentation')
        }

        dispatch({ type: 'loadResolved', slides: extractedSlides })
      })
      .catch((err) => {
        if (loadRequestRef.current !== requestId) return
        dispatch({
          type: 'loadResolved',
          slides: [],
          error: err instanceof Error ? err.message : 'Failed to load presentation',
        })
      })
  }, [url, extractSlides, fetchPresentation])

  useEffect(() => {
    loadPresentation()
  }, [loadPresentation])

  useEffect(() => {
    return () => {
      slides.forEach((slide) => {
        if (slide.imageUrl) {
          URL.revokeObjectURL(slide.imageUrl)
        }
      })
    }
  }, [slides])

  const goToSlide = useCallback(
    (index: number) => {
      if (index >= 0 && index < slides.length) {
        dispatch({ type: 'setCurrentSlide', value: index })
      }
    },
    [slides.length],
  )

  const handlePrevSlide = useCallback(() => {
    goToSlide(currentSlide - 1)
  }, [currentSlide, goToSlide])

  const handleNextSlide = useCallback(() => {
    goToSlide(currentSlide + 1)
  }, [currentSlide, goToSlide])

  const handleToggleFullscreen = useCallback(() => {
    dispatch({ type: 'toggleFullscreen' })
  }, [])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        goToSlide(currentSlide - 1)
      } else if (e.key === 'ArrowRight') {
        goToSlide(currentSlide + 1)
      } else if (e.key === 'Home') {
        goToSlide(0)
      } else if (e.key === 'End') {
        goToSlide(slides.length - 1)
      } else if (e.key === 'Escape' && isFullscreen) {
        dispatch({ type: 'setFullscreen', value: false })
      }
    },
    [currentSlide, goToSlide, isFullscreen, slides.length],
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  const handleRetry = useCallback(() => {
    loadPresentation()
  }, [loadPresentation])

  if (isLoading) {
    return (
      <div
        className={cn(
          'flex min-h-[min(60dvh,560px)] flex-1 items-center justify-center rounded-xl border border-border/60 bg-zinc-950',
          className,
        )}
      >
        <div className="flex flex-col items-center gap-4 text-viewer-chrome/70">
          <Loader2 className="size-9 animate-spin" aria-hidden />
          <div className="text-center">
            <p className="text-sm font-medium text-viewer-chrome/90">Extracting slides</p>
            <p className="mt-1 text-xs text-viewer-chrome/50">This may take a few seconds for large decks</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div
        className={cn(
          'flex min-h-[min(40dvh,400px)] flex-1 flex-col items-center justify-center gap-4 rounded-xl border border-destructive/30 bg-destructive/5 p-10',
          className,
        )}
      >
        <AlertCircle className="size-10 text-destructive" aria-hidden />
        <div className="max-w-md text-center">
          <p className="font-medium text-foreground">Unable to load presentation</p>
          <p className="mt-1 text-sm text-muted-foreground">{error}</p>
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRetry}>
            <RotateCcw className="mr-2 size-4" />
            Try again
          </Button>
          <Button variant="secondary" size="sm" asChild>
            <a href={url} target="_blank" rel="noreferrer">
              <Download className="mr-2 size-4" />
              Download file
            </a>
          </Button>
        </div>
      </div>
    )
  }

  const currentSlideData = slides[currentSlide]!
  const hasMultiple = slides.length > 1

  const slideCanvas = (
    <div className="relative aspect-video w-full max-h-[min(72dvh,720px)] overflow-hidden rounded-xl border border-border/60 bg-zinc-950 shadow-inner ring-1 ring-white/5">
      {currentSlideData?.imageUrl ? (
        <Image
          src={currentSlideData.imageUrl}
          alt={`${title} — slide ${currentSlide + 1}`}
          fill
          unoptimized
          sizes={isFullscreen ? '100vw' : '(max-width: 1280px) 90vw'}
          className="object-contain"
          priority={currentSlide === 0}
        />
      ) : (
        <div className="flex h-full min-h-[280px] w-full items-center justify-center bg-gradient-to-b from-zinc-900 to-zinc-950 p-8 sm:min-h-[360px]">
          <div className="max-w-lg text-center">
            <p className="text-sm font-medium uppercase tracking-widest text-viewer-chrome/40">
              Slide {currentSlide + 1}
            </p>
            {currentSlideData?.textContent ? (
              <p className="mt-4 text-base leading-relaxed text-viewer-chrome/85">
                {currentSlideData.textContent}
              </p>
            ) : (
              <p className="mt-4 text-sm text-viewer-chrome/50">No preview image for this slide</p>
            )}
          </div>
        </div>
      )}

      {hasMultiple ? (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-3 top-1/2 z-10 size-11 -translate-y-1/2 rounded-full border border-white/10 bg-black/55 text-viewer-chrome shadow-lg backdrop-blur-sm hover:bg-black/75 disabled:opacity-25"
            onClick={handlePrevSlide}
            disabled={currentSlide === 0}
            aria-label="Previous slide"
          >
            <ChevronLeft className="size-6" aria-hidden />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-3 top-1/2 z-10 size-11 -translate-y-1/2 rounded-full border border-white/10 bg-black/55 text-viewer-chrome shadow-lg backdrop-blur-sm hover:bg-black/75 disabled:opacity-25"
            onClick={handleNextSlide}
            disabled={currentSlide === slides.length - 1}
            aria-label="Next slide"
          >
            <ChevronRight className="size-6" aria-hidden />
          </Button>
        </>
      ) : null}

      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between gap-2 bg-gradient-to-b from-black/70 to-transparent px-3 pb-8 pt-3">
        <span className="rounded-md bg-black/50 px-2 py-1 text-[11px] font-medium uppercase tracking-wider text-viewer-chrome/80 backdrop-blur-sm">
          {title}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="pointer-events-auto size-9 rounded-full border border-white/10 bg-black/50 text-viewer-chrome hover:bg-black/70"
          onClick={handleToggleFullscreen}
          aria-label={isFullscreen ? 'Exit full screen' : 'Enter full screen'}
        >
          {isFullscreen ? (
            <Minimize2 className="size-4" aria-hidden />
          ) : (
            <Maximize2 className="size-4" aria-hidden />
          )}
        </Button>
      </div>

      <div
        className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full border border-white/10 bg-black/65 px-4 py-1.5 text-sm font-medium tabular-nums text-viewer-chrome shadow-lg backdrop-blur-sm"
        aria-live="polite"
      >
        {currentSlide + 1} / {slides.length}
      </div>
    </div>
  )

  const filmstrip = hasMultiple ? (
    <div className="relative mt-4">
      <div
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-background to-transparent"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-background to-transparent"
        aria-hidden
      />
      <div
        className="flex gap-2 overflow-x-auto px-1 pb-1 pt-0.5 scroll-smooth"
        role="tablist"
        aria-label="Slide thumbnails"
      >
        {slides.map((slide, index) => (
          <PptViewerThumbnailButton
            key={slide.index}
            index={index}
            currentSlide={currentSlide}
            onGoToSlide={goToSlide}
            slide={slide}
            aria-label={
              index === currentSlide
                ? `Currently viewing slide ${index + 1}`
                : `Go to slide ${index + 1}`
            }
          />
        ))}
      </div>
    </div>
  ) : null

  const viewerBody = (
    <div className={cn('flex min-h-0 flex-1 flex-col', className)}>
      {slideCanvas}
      {filmstrip}
      <p className="mt-3 text-center text-xs text-muted-foreground">
        Arrow keys to navigate · Home / End for first and last slide
      </p>
    </div>
  )

  if (isFullscreen) {
    return (
      <div
        className="fixed inset-0 z-[100] flex flex-col bg-black/95 p-4 sm:p-8"
        role="dialog"
        aria-modal="true"
        aria-label={`${title} full screen`}
      >
        <div className="mx-auto flex size-full max-w-6xl flex-col justify-center">
          {viewerBody}
        </div>
      </div>
    )
  }

  return viewerBody
}

function PptViewerThumbnailButton({
  slide,
  index,
  currentSlide,
  onGoToSlide,
  'aria-label': ariaLabel,
}: {
  slide: Slide
  index: number
  currentSlide: number
  onGoToSlide: (index: number) => void
  'aria-label': string
}) {
  const onSelectSlideThumbnail = useCallback(() => {
    onGoToSlide(index)
  }, [index, onGoToSlide])

  return (
    <button
      type="button"
      role="tab"
      onClick={onSelectSlideThumbnail}
      aria-label={ariaLabel}
      aria-selected={index === currentSlide}
      className={cn(
        'flex-shrink-0 overflow-hidden rounded-lg border-2 motion-chromatic transition-[border-color,box-shadow,opacity]',
        index === currentSlide
          ? 'border-primary shadow-md shadow-primary/20 ring-2 ring-primary/25'
          : 'border-transparent opacity-70 hover:border-muted-foreground/30 hover:opacity-100',
      )}
    >
      <div className="relative h-14 w-24 bg-zinc-900 sm:h-16 sm:w-28">
        {slide.imageUrl ? (
          <Image
            src={slide.imageUrl}
            alt=""
            fill
            unoptimized
            sizes="112px"
            className="object-cover"
          />
        ) : (
          <span className="flex size-full items-center justify-center text-xs font-medium tabular-nums text-viewer-chrome/60">
            {index + 1}
          </span>
        )}
      </div>
    </button>
  )
}
