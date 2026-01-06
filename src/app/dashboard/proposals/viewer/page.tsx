
'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ArrowLeft, LoaderCircle } from 'lucide-react'
import { PPTXViewer } from 'pptxviewjs'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

function sizeCanvasToContainer(canvas: HTMLCanvasElement, container: HTMLElement) {
  const rect = container.getBoundingClientRect()
  const dpr = window.devicePixelRatio || 1

  const targetWidth = Math.max(1, Math.floor(rect.width * dpr))
  const targetHeight = Math.max(1, Math.floor(rect.height * dpr))

  if (canvas.width !== targetWidth) canvas.width = targetWidth
  if (canvas.height !== targetHeight) canvas.height = targetHeight

  const cssWidth = `${Math.max(1, Math.floor(rect.width))}px`
  const cssHeight = `${Math.max(1, Math.floor(rect.height))}px`
  if (canvas.style.width !== cssWidth) canvas.style.width = cssWidth
  if (canvas.style.height !== cssHeight) canvas.style.height = cssHeight
}

function isAbortError(error: unknown): boolean {
  if (!error) return false
  if (error instanceof DOMException && error.name === 'AbortError') return true
  if (typeof error === 'object' && 'name' in error && (error as { name?: unknown }).name === 'AbortError') return true
  return false
}

export default function ProposalDeckViewerPage() {
  const searchParams = useSearchParams()
  const src = searchParams.get('src')

  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const canvasContainerRef = useRef<HTMLDivElement | null>(null)
  const viewerRef = useRef<PPTXViewer | null>(null)

  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [slideCount, setSlideCount] = useState<number>(0)
  const [slideIndex, setSlideIndex] = useState<number>(0)
  const [pendingSlideNumber, setPendingSlideNumber] = useState<string>('1')

  const viewerSrc = useMemo(() => {
    if (!src) return null
    try {
      const url = new URL(src)
      // Use proxy for Firebase/Gamma URLs so the viewer can HEAD/GET without CORS issues.
      const shouldProxy =
        url.hostname.endsWith('firebasestorage.googleapis.com') ||
        url.hostname.endsWith('storage.googleapis.com') ||
        url.hostname.endsWith('public-api.gamma.app') ||
        url.hostname.endsWith('gamma.app')

      return shouldProxy ? `/api/files/proxy?url=${encodeURIComponent(src)}` : src
    } catch {
      return src
    }
  }, [src])

  useEffect(() => {
    setErrorMessage(null)
    setSlideCount(0)
    setSlideIndex(0)
    setPendingSlideNumber('1')

    if (!src || !viewerSrc) return
    if (!canvasRef.current) return
    if (!canvasContainerRef.current) return

    const abortController = new AbortController()
    const viewer = new PPTXViewer({ canvas: canvasRef.current, slideSizeMode: 'fit' })
    viewerRef.current = viewer

    const resizeAndRerender = () => {
      const canvas = canvasRef.current
      const container = canvasContainerRef.current
      if (!canvas || !container) return
      sizeCanvasToContainer(canvas, container)
      try {
        const current = viewer.getCurrentSlideIndex()
        void viewer.render(canvas, { slideIndex: current, quality: 'high' })
      } catch {
        // ignore
      }
    }

    const resizeObserver = new ResizeObserver(() => {
      if (isLoading) return
      resizeAndRerender()
    })
    resizeObserver.observe(canvasContainerRef.current)

    const handleLoadComplete = (data: unknown) => {
      const count =
        typeof data === 'object' && data && 'slideCount' in data && typeof (data as { slideCount?: unknown }).slideCount === 'number'
          ? (data as { slideCount: number }).slideCount
          : viewer.getSlideCount()
      setSlideCount(count)
    }

    const handleSlideChanged = (index: unknown) => {
      if (typeof index === 'number' && Number.isFinite(index)) {
        setSlideIndex(index)
        setPendingSlideNumber(String(index + 1))
      } else {
        const current = viewer.getCurrentSlideIndex()
        setSlideIndex(current)
        setPendingSlideNumber(String(current + 1))
      }
    }

    viewer.on('loadComplete', handleLoadComplete)
    viewer.on('slideChanged', handleSlideChanged)

    ;(async () => {
      setIsLoading(true)
      try {
        const response = await fetch(viewerSrc, { signal: abortController.signal })
        if (!response.ok) {
          throw new Error(`Failed to fetch deck: ${response.status} ${response.statusText}`)
        }

        const buffer = await response.arrayBuffer()
        await viewer.loadFile(buffer)

        resizeAndRerender()
        await viewer.render(canvasRef.current, { slideIndex: 0, quality: 'high' })
        setSlideCount(viewer.getSlideCount())
        setSlideIndex(viewer.getCurrentSlideIndex())
        setPendingSlideNumber(String(viewer.getCurrentSlideIndex() + 1))
      } catch (error) {
        if (isAbortError(error)) return
        setErrorMessage(error instanceof Error ? error.message : 'Failed to load deck')
      } finally {
        setIsLoading(false)
      }
    })()

    return () => {
      abortController.abort()
      resizeObserver.disconnect()
      try {
        viewer.off('loadComplete', handleLoadComplete)
        viewer.off('slideChanged', handleSlideChanged)
      } catch {
        // ignore
      }
      try {
        viewer.destroy()
      } catch {
        // ignore
      }
      if (viewerRef.current === viewer) viewerRef.current = null
    }
  }, [src, viewerSrc, isLoading])

  useEffect(() => {
    const onKeyDown = async (event: KeyboardEvent) => {
      const viewer = viewerRef.current
      const canvas = canvasRef.current
      if (!viewer || !canvas) return
      if (isLoading) return

      const active = document.activeElement
      const isTyping =
        active instanceof HTMLInputElement || active instanceof HTMLTextAreaElement || (active instanceof HTMLElement && active.isContentEditable)
      if (isTyping) return

      try {
        if (event.key === 'ArrowLeft') {
          event.preventDefault()
          await viewer.previousSlide(canvas)
        }
        if (event.key === 'ArrowRight') {
          event.preventDefault()
          await viewer.nextSlide(canvas)
        }
      } catch {
        // ignore navigation errors
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isLoading])

  const canNavigate = slideCount > 0 && !isLoading && !errorMessage
  const canGoPrev = canNavigate && slideIndex > 0
  const canGoNext = canNavigate && slideIndex + 1 < slideCount

  const goPrev = async () => {
    const viewer = viewerRef.current
    const canvas = canvasRef.current
    const container = canvasContainerRef.current
    if (!viewer || !canvas) return
    if (container) sizeCanvasToContainer(canvas, container)
    await viewer.previousSlide(canvas)
  }

  const goNext = async () => {
    const viewer = viewerRef.current
    const canvas = canvasRef.current
    const container = canvasContainerRef.current
    if (!viewer || !canvas) return
    if (container) sizeCanvasToContainer(canvas, container)
    await viewer.nextSlide(canvas)
  }

  const goToSlide = async (targetSlideNumber: number) => {
    const viewer = viewerRef.current
    const canvas = canvasRef.current
    const container = canvasContainerRef.current
    if (!viewer || !canvas) return
    if (container) sizeCanvasToContainer(canvas, container)
    const index = Math.max(0, Math.min(slideCount - 1, targetSlideNumber - 1))
    await viewer.goToSlide(index, canvas)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/proposals">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to proposals
          </Link>
        </Button>
        {src ? (
          <Button variant="outline" size="sm" asChild>
            <a href={src} target="_blank" rel="noreferrer">
              Download PPT
            </a>
          </Button>
        ) : null}
      </div>

      {!src ? (
        <Card className="border-destructive/40 bg-destructive/5">
          <CardHeader>
            <CardTitle className="text-destructive">No deck URL provided</CardTitle>
            <CardDescription className="text-destructive/80">
              Provide a valid download URL via the <code>src</code> query parameter to preview the deck.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <Card className="border-muted/60 bg-background">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Presentation preview</CardTitle>
            <CardDescription>Use the controls below (or arrow keys) to navigate slides.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <Button variant="outline" size="sm" onClick={goPrev} disabled={!canGoPrev}>
                Prev
              </Button>
              <Button variant="outline" size="sm" onClick={goNext} disabled={!canGoNext}>
                Next
              </Button>

              <div className="ml-2 flex items-center gap-2 text-sm text-muted-foreground">
                <span>
                  {slideCount > 0 ? `${slideIndex + 1} / ${slideCount}` : '—'}
                </span>
                <label className="flex items-center gap-2">
                  <span>Go to</span>
                  <input
                    className="h-8 w-20 rounded-md border bg-background px-2 text-sm text-foreground shadow-sm"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={pendingSlideNumber}
                    onChange={(e) => setPendingSlideNumber(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key !== 'Enter') return
                      const parsed = Number.parseInt(pendingSlideNumber, 10)
                      if (!Number.isFinite(parsed) || parsed < 1) return
                      void goToSlide(parsed)
                    }}
                    disabled={!canNavigate}
                  />
                </label>
              </div>
            </div>

            <div ref={canvasContainerRef} className="relative h-[70vh] overflow-hidden rounded-lg border bg-muted/30">
              {isLoading ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <LoaderCircle className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : null}

              {errorMessage ? (
                <div className="p-4 text-sm text-destructive">
                  {errorMessage}
                  <div className="mt-2 text-xs text-muted-foreground">
                    Try the download link above if preview fails.
                  </div>
                </div>
              ) : null}

              <div className="flex h-full w-full items-center justify-center p-4">
                <canvas
                  ref={canvasRef}
                  className="block rounded-md bg-white shadow-sm"
                />
              </div>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              If the viewer cannot load the deck, use the download link above to open the PPT directly.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
