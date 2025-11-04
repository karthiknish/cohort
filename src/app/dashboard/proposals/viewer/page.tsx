'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ArrowLeft, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

function buildViewerUrl(source: string): string {
  // Google Docs viewer tends to handle Firebase signed URLs more reliably
  return `https://docs.google.com/gview?url=${encodeURIComponent(source)}&embedded=true`
}

export default function ProposalDeckViewerPage() {
  const searchParams = useSearchParams()
  const src = searchParams.get('src')

  const viewerUrl = useMemo(() => {
    if (!src) {
      return null
    }
    return buildViewerUrl(src)
  }, [src])

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
      ) : !viewerUrl ? (
        <div className="flex min-h-[60vh] items-center justify-center text-muted-foreground">
          <div className="flex flex-col items-center gap-3 text-center">
            <Loader2 className="h-6 w-6 animate-spin" />
            <p>Preparing viewer…</p>
          </div>
        </div>
      ) : (
        <Card className="border-muted/60 bg-background">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Presentation preview</CardTitle>
            <CardDescription>Use the toolbar below to navigate the slides.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border bg-muted/30">
              <iframe
                title="Proposal presentation preview"
                src={viewerUrl}
                className="h-[70vh] w-full"
                allowFullScreen
              />
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
