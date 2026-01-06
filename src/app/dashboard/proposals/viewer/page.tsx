'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ArrowLeft, Download } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PptViewer } from '@/components/ppt-viewer'

export default function ProposalDeckViewerPage() {
  const searchParams = useSearchParams()
  const src = searchParams.get('src')

  const fileName = useMemo(() => {
    if (!src) return null
    try {
      const url = new URL(src)
      const pathname = url.pathname
      const lastSegment = pathname.split('/').pop()
      if (lastSegment && lastSegment.includes('.')) {
        return decodeURIComponent(lastSegment)
      }
    } catch {
      // Use default
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
                  title={fileName ?? 'PDF'}
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
