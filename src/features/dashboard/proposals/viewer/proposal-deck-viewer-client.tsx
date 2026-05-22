'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

import { DeckDocumentViewer } from '@/features/dashboard/proposals/viewer/components/deck-document-viewer'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'

type ProposalDeckViewerPageClientProps = {
  src?: string | null
}

export default function ProposalDeckViewerPageClient({ src = null }: ProposalDeckViewerPageClientProps) {
  if (!src) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/proposals">
            <ArrowLeft className="mr-2 size-4" />
            Back to proposals
          </Link>
        </Button>
        <Card className="border-destructive/40 bg-destructive/5">
          <CardHeader>
            <CardTitle className="text-destructive">No deck URL provided</CardTitle>
            <CardDescription className="text-destructive/80">
              Open a proposal and use Preview, or add a valid <code className="text-xs">src</code> query
              parameter to this page.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <DeckDocumentViewer
      src={src}
      backHref="/dashboard/proposals"
      backLabel="Back to proposals"
      subtitle="Interactive deck preview"
    />
  )
}
