'use client'

import { ExternalLink, FileText, Loader2 } from 'lucide-react'
import { useCallback, useState } from 'react'

import { Button } from '@/shared/ui/button'
import { cn } from '@/lib/utils'

type PdfViewerProps = {
  url: string
  title?: string
  className?: string
}

export function PdfViewer({ url, title = 'PDF document', className }: PdfViewerProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)

  const handleLoad = useCallback(() => {
    setIsLoading(false)
    setLoadError(false)
  }, [])

  const handleError = useCallback(() => {
    setIsLoading(false)
    setLoadError(true)
  }, [])

  return (
    <div className={cn('flex min-h-0 flex-1 flex-col', className)}>
      <div className="relative min-h-[min(72dvh,720px)] flex-1 overflow-hidden rounded-xl border border-border/60 bg-zinc-950 shadow-inner ring-1 ring-border/40">
        {isLoading && !loadError ? (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-zinc-950/90">
            <Loader2 className="h-8 w-8 animate-spin text-viewer-chrome/70" aria-hidden />
            <p className="text-sm text-viewer-chrome/60">Loading PDF…</p>
          </div>
        ) : null}

        {loadError ? (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 p-8 text-center">
            <FileText className="h-10 w-10 text-viewer-chrome/50" aria-hidden />
            <div className="space-y-1">
              <p className="font-medium text-viewer-chrome">Preview unavailable in browser</p>
              <p className="max-w-sm text-sm text-viewer-chrome/60">
                Open the file in a new tab or download it to view this PDF.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              <Button variant="secondary" size="sm" asChild>
                <a href={url} target="_blank" rel="noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Open in new tab
                </a>
              </Button>
            </div>
          </div>
        ) : null}

        <iframe
          src={url}
          title={title}
          className="h-full min-h-[min(72dvh,720px)] w-full bg-zinc-900"
          onLoad={handleLoad}
          onError={handleError}
        />
      </div>
      <p className="mt-3 text-center text-xs text-muted-foreground">
        Use your browser&apos;s PDF controls to zoom and navigate pages.
      </p>
    </div>
  )
}
