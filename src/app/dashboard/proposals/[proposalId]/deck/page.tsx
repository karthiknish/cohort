'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowLeft, Download, LoaderCircle } from 'lucide-react'
import { PPTXViewer } from 'pptxviewjs'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { ProposalDraft } from '@/services/proposals'
import { getProposalById } from '@/services/proposals'

type ViewerSource = 
  | { type: 'pdf'; url: string }

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

export default function ProposalDeckPage() {
  const params = useParams<{ proposalId: string }>()
  const proposalId = params?.proposalId
  const [proposal, setProposal] = useState<ProposalDraft | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const canvasContainerRef = useRef<HTMLDivElement | null>(null)
  const viewerRef = useRef<PPTXViewer | null>(null)

  const [isDeckLoading, setIsDeckLoading] = useState(false)
  const [deckError, setDeckError] = useState<string | null>(null)
  const [slideCount, setSlideCount] = useState<number>(0)
  const [slideIndex, setSlideIndex] = useState<number>(0)
  const [pendingSlideNumber, setPendingSlideNumber] = useState<string>('1')

  useEffect(() => {
    let active = true

    async function loadProposal() {
      if (!proposalId) {
        setError('Proposal not found')
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setError(null)
      try {
        const result = await getProposalById(proposalId)
        if (!active) {
          return
        }
        setProposal(result)
      } catch (err: unknown) {
        if (!active) {
          return
        }
        const message = err instanceof Error ? err.message : 'Failed to load proposal'
        setError(message)
        setProposal(null)
      } finally {
        if (active) {
          setIsLoading(false)
        }
      }
    }

    void loadProposal()

    return () => {
      active = false
    }
  }, [proposalId])

  const presentationUrl = useMemo(() => {
    if (!proposal) {
      return null
    }
    return (
      proposal.pptUrl
      ?? proposal.presentationDeck?.storageUrl
      ?? proposal.presentationDeck?.pptxUrl
      ?? proposal.gammaDeck?.storageUrl
      ?? proposal.gammaDeck?.pptxUrl
      ?? null
    )
  }, [proposal])

  const viewerSrc = useMemo(() => {
    if (!presentationUrl) return null
    try {
      const url = new URL(presentationUrl)
      // Use proxy for Firebase/Gamma URLs so the viewer can HEAD/GET without CORS issues.
      const shouldProxy =
        url.hostname.endsWith('firebasestorage.googleapis.com') ||
        url.hostname.endsWith('storage.googleapis.com') ||
        url.hostname.endsWith('public-api.gamma.app') ||
        url.hostname.endsWith('gamma.app')

      return shouldProxy ? `/api/files/proxy?url=${encodeURIComponent(presentationUrl)}` : presentationUrl
    } catch {
      return presentationUrl
    }
  }, [presentationUrl])

  const viewerSource = useMemo<ViewerSource | null>(() => {
    if (!proposal) return null

    const deck = proposal.presentationDeck ?? proposal.gammaDeck

    // PDF viewer (works with browser's native viewer)
    if (proposal.pdfUrl || deck?.pdfUrl) {
      return {
        type: 'pdf',
        url: (proposal.pdfUrl ?? deck?.pdfUrl) as string
      }
    }

    return null
  }, [proposal])

  const lastUpdated = useMemo(() => {
    if (!proposal?.updatedAt) {
      return null
    }
    const parsed = new Date(proposal.updatedAt)
    if (Number.isNaN(parsed.getTime())) {
      return proposal.updatedAt
    }
    return parsed.toLocaleString()
  }, [proposal])

  useEffect(() => {
    setDeckError(null)
    setSlideCount(0)
    setSlideIndex(0)
    setPendingSlideNumber('1')

    if (!viewerSrc) return
    if (!canvasRef.current) return
    if (!canvasContainerRef.current) return

    const abortController = new AbortController()
    const viewer = new PPTXViewer({ canvas: canvasRef.current, slideSizeMode: 'fit' })
    viewerRef.current = viewer

    const handleLoadComplete = (data: unknown) => {
      const count =
        typeof data === 'object' &&
        data &&
        'slideCount' in data &&
        typeof (data as { slideCount?: unknown }).slideCount === 'number'
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

    const resizeAndRerender = () => {
      const canvas = canvasRef.current
      const container = canvasContainerRef.current
      if (!canvas || !container) return
      sizeCanvasToContainer(canvas, container)

      // Re-render the current slide after sizing to avoid stretched/clipped output.
      try {
        const current = viewer.getCurrentSlideIndex()
        void viewer.render(canvas, { slideIndex: current, quality: 'high' })
      } catch {
        // ignore
      }
    }

    const resizeObserver = new ResizeObserver(() => {
      // Avoid thrashing while loading.
      if (isDeckLoading) return
      resizeAndRerender()
    })
    resizeObserver.observe(canvasContainerRef.current)

    ;(async () => {
      setIsDeckLoading(true)
      try {
        const response = await fetch(viewerSrc, { signal: abortController.signal })
        if (!response.ok) {
          throw new Error(`Failed to fetch deck: ${response.status} ${response.statusText}`)
        }

        const buffer = await response.arrayBuffer()
        await viewer.loadFile(buffer)

        // Ensure canvas has the correct pixel dimensions before rendering.
        resizeAndRerender()
        await viewer.render(canvasRef.current, { slideIndex: 0, quality: 'high' })
        setSlideCount(viewer.getSlideCount())
        setSlideIndex(viewer.getCurrentSlideIndex())
        setPendingSlideNumber(String(viewer.getCurrentSlideIndex() + 1))
      } catch (err) {
        if (isAbortError(err)) return
        setDeckError(err instanceof Error ? err.message : 'Failed to load deck')
      } finally {
        setIsDeckLoading(false)
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
  }, [viewerSrc]) // Removed isDeckLoading from dependencies to prevent infinite loops

  useEffect(() => {
    const onKeyDown = async (event: KeyboardEvent) => {
      const viewer = viewerRef.current
      const canvas = canvasRef.current
      if (!viewer || !canvas) return
      if (isDeckLoading) return

      const active = document.activeElement
      const isTyping =
        active instanceof HTMLInputElement ||
        active instanceof HTMLTextAreaElement ||
        (active instanceof HTMLElement && active.isContentEditable)
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
  }, [isDeckLoading])

  const canNavigate = slideCount > 0 && !isDeckLoading && !deckError
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
        {proposal && (
          <Badge variant={proposal.status === 'ready' ? 'default' : 'outline'} className="uppercase tracking-wide">
            {proposal.status}
          </Badge>
        )}
      </div>

      {isLoading ? (
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <LoaderCircle className="h-6 w-6 animate-spin" />
            <p>Loading proposal deck…</p>
          </div>
        </div>
      ) : error ? (
        <Card className="border-destructive/40 bg-destructive/5">
          <CardHeader>
            <CardTitle className="text-destructive">Unable to load deck</CardTitle>
            <CardDescription className="text-destructive/80">{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" asChild>
              <Link href="/dashboard/proposals">Return to proposals</Link>
            </Button>
          </CardContent>
        </Card>
      ) : proposal ? (
        <div className="space-y-5">
          <Card className="border-muted/60 bg-background">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Presentation deck</CardTitle>
              <CardDescription>
                {proposal.clientName ? `Prepared for ${proposal.clientName}` : 'Presentation preview'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                {proposal.clientName && <span><strong>Client:</strong> {proposal.clientName}</span>}
                {lastUpdated && <span><strong>Last updated:</strong> {lastUpdated}</span>}
                {proposal.gammaDeck?.instructions && (
                  <span className="block w-full text-xs text-muted-foreground/80">
                    Slide guidance: {proposal.gammaDeck.instructions}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-3">
                {presentationUrl && (
                  <Button asChild>
                    <a href={presentationUrl} target="_blank" rel="noreferrer">
                      <Download className="mr-2 h-4 w-4" />
                      Download PPT
                    </a>
                  </Button>
                )}
              </div>

              {viewerSrc ? (
                <>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button variant="outline" size="sm" onClick={goPrev} disabled={!canGoPrev}>
                      Prev
                    </Button>
                    <Button variant="outline" size="sm" onClick={goNext} disabled={!canGoNext}>
                      Next
                    </Button>

                    <div className="ml-2 flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{slideCount > 0 ? `${slideIndex + 1} / ${slideCount}` : '—'}</span>
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
                    {isDeckLoading ? (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <LoaderCircle className="h-6 w-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : null}

                    {deckError ? (
                      <div className="p-4 text-sm text-destructive">
                        {deckError}
                        <div className="mt-2 text-xs text-muted-foreground">Try the download link above if preview fails.</div>
                      </div>
                    ) : null}

                    <div className="flex h-full w-full items-center justify-center p-4">
                      <canvas ref={canvasRef} className="block rounded-md bg-white shadow-sm" />
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    Tip: use left/right arrow keys to navigate.
                  </p>
                </>
              ) : null}
              
              {/* PDF viewer using browser's native PDF support */}
              {viewerSource?.type === 'pdf' && (
                <div className="h-[70vh] overflow-hidden rounded-lg border bg-muted/30">
                  <iframe
                    title="PDF preview"
                    src={viewerSource.url}
                    className="h-full w-full"
                  />
                </div>
              )}
              
              {/* No viewer available */}
              {!viewerSrc && !viewerSource && (
                <div className="rounded-md border border-dashed border-muted p-6 text-center text-sm text-muted-foreground">
                  <p className="mb-2">Preview unavailable for this file type.</p>
                  {presentationUrl && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={presentationUrl} target="_blank" rel="noreferrer">
                        Download File
                      </a>
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Proposal not found</CardTitle>
            <CardDescription>The requested proposal could not be located.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" asChild>
              <Link href="/dashboard/proposals">Return to proposals</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
