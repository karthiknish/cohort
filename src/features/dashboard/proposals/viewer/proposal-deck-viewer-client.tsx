'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { ArrowLeft, Download } from 'lucide-react'

import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'

// bundle-dynamic-imports: Dynamically import heavy PptViewer with JSZip
const PptViewer = dynamic(() => import('@/shared/components/ppt-viewer').then(m => ({ default: m.PptViewer })), {
  loading: () => (
    <div className="flex items-center justify-center aspect-[16/9] rounded-lg border bg-muted/20">
      <div className="text-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-sm text-muted-foreground">Loading presentation...</p>
      </div>
    </div>
  ),
  ssr: false,
})

type ProposalDeckViewerPageClientProps = {
  src?: string | null
}

export default function ProposalDeckViewerPageClient({ src = null }: ProposalDeckViewerPageClientProps) {

  const fileName = useMemo(() => {
    if (!src) return null

    const pathWithMaybeHash = src.split('?')[0] ?? ''
    const pathOnly = pathWithMaybeHash.split('#')[0] ?? ''
    const segments = pathOnly.split('/').filter(Boolean)
    const lastSegment = segments[segments.length - 1]

    if (typeof lastSegment === 'string' && lastSegment.includes('.')) {
      return lastSegment
    }

    return 'presentation.pptx'
  }, [src])

  const isPdf = fileName?.toLowerCase().endsWith('.pdf')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/proposals">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to proposals
          </Link>
        </Button>
        {src && (
          <Button variant="outline" size="sm" asChild>
            <a href={src} target="_blank" rel="noreferrer">
              <Download className="mr-2 h-4 w-4" />
              Download
            </a>
          </Button>
        )}
      </div>

      {!src ? (
        <Card className="border-destructive/40 bg-destructive/5">
          <CardHeader>
            <CardTitle className="text-destructive">No deck URL provided</CardTitle>
            <CardDescription className="text-destructive/80">
              Provide a valid download URL via the <code>src</code> query parameter.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <Card className="border-muted/60 bg-background">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Presentation</CardTitle>
            <CardDescription>{fileName}</CardDescription>
          </CardHeader>
          <CardContent>
            {isPdf ? (
              <div className="aspect-[16/9] w-full overflow-hidden rounded-lg border">
                <iframe
                  src={src}
                  title="Proposal PDF preview"
                  className="h-full w-full"
                  frameBorder="0"
                />
              </div>
            ) : (
              <PptViewer url={src} title={fileName ?? 'Presentation'} />
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
