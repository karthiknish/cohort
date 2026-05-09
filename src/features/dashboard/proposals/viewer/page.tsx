import { Suspense } from 'react'

import ProposalDeckViewerPageClient from './proposal-deck-viewer-client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'

type RouteSearchParams = Record<string, string | string[] | undefined>

type ProposalDeckViewerPageProps = {
  searchParams?: RouteSearchParams | Promise<RouteSearchParams>
}

const PROPOSAL_DECK_VIEWER_FALLBACK = <ProposalDeckViewerFallback />

function getFirstSearchParam(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) {
    return value[0] ?? null
  }

  return typeof value === 'string' ? value : null
}

export default async function ProposalDeckViewerPage({ searchParams }: ProposalDeckViewerPageProps) {
  const resolvedSearchParams = await searchParams

  return (
    <Suspense fallback={PROPOSAL_DECK_VIEWER_FALLBACK}>
      <ProposalDeckViewerPageClient src={getFirstSearchParam(resolvedSearchParams?.src)} />
    </Suspense>
  )
}

function ProposalDeckViewerFallback() {
  return (
    <Card className="border-muted/60 bg-background">
      <CardHeader>
        <CardTitle className="text-xl">Loading presentation</CardTitle>
        <CardDescription>Preparing the deck preview.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex aspect-[16/9] items-center justify-center rounded-lg border bg-muted/20">
          <div className="text-center">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">Loading presentation…</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
