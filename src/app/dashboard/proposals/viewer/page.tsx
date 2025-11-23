'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ArrowLeft, Loader2 } from 'lucide-react'
import dynamic from 'next/dynamic'

const DocViewer = dynamic(() => import('react-doc-viewer'), { ssr: false })
import { DocViewerRenderers } from 'react-doc-viewer'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function ProposalDeckViewerPage() {
  const searchParams = useSearchParams()
  const src = searchParams.get('src')

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
            <CardDescription>Use the toolbar below to navigate the slides.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[70vh] overflow-hidden rounded-lg border bg-muted/30">
              <DocViewer
                documents={[{ uri: src }]}
                pluginRenderers={DocViewerRenderers}
                style={{ height: '100%' }}
                config={{
                  header: {
                    disableHeader: true,
                    disableFileName: true,
                    retainURLParams: true,
                  },
                }}
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
