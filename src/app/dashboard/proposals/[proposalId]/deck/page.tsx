'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowLeft, Download, LoaderCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { ProposalDraft } from '@/services/proposals'
import { getProposalById } from '@/services/proposals'

export default function ProposalDeckPage() {
  const params = useParams<{ proposalId: string }>()
  const proposalId = params?.proposalId
  const [proposal, setProposal] = useState<ProposalDraft | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
        if (!active) return
        setProposal(result)
      } catch (err: unknown) {
        if (!active) return
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


  // PDF storage URL from Firebase (preferred for viewing)
  const pdfStorageUrl = useMemo(() => {
    if (!proposal) return null
    const deck = proposal.presentationDeck ?? proposal.gammaDeck
    return deck?.pdfStorageUrl ?? null
  }, [proposal])

  // Direct PDF URL (fallback for download)
  const pdfUrl = useMemo(() => {
    if (!proposal) return null
    const deck = proposal.presentationDeck ?? proposal.gammaDeck
    return proposal.pdfUrl ?? deck?.pdfUrl ?? null
  }, [proposal])

  // Use proxy for Firebase Storage URLs to avoid CORS issues
  const pdfViewerUrl = useMemo(() => {
    const url = pdfStorageUrl ?? pdfUrl
    if (!url) return null
    // If it's a Firebase Storage URL, route through our proxy
    if (url.includes('firebasestorage.googleapis.com')) {
      return `/api/proxy/file?url=${encodeURIComponent(url)}`
    }
    return url
  }, [pdfStorageUrl, pdfUrl])

  // Best PDF download URL (prefer storage URL for reliability)
  const pdfDownloadUrl = useMemo(() => {
    return pdfStorageUrl ?? pdfUrl
  }, [pdfStorageUrl, pdfUrl])

  const lastUpdated = useMemo(() => {
    if (!proposal?.updatedAt) return null
    const parsed = new Date(proposal.updatedAt)
    return Number.isNaN(parsed.getTime()) ? proposal.updatedAt : parsed.toLocaleString()
  }, [proposal])

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
                {lastUpdated && (
                  <span>
                    <strong>Last updated:</strong> {lastUpdated}
                  </span>
                )}
                {proposal.gammaDeck?.instructions && (
                  <span className="block w-full text-xs text-muted-foreground/80">
                    Slide guidance: {proposal.gammaDeck.instructions}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-3">
                {pdfDownloadUrl && (
                  <Button asChild>
                    <a href={pdfDownloadUrl} target="_blank" rel="noreferrer">
                      <Download className="mr-2 h-4 w-4" />
                      Download PDF
                    </a>
                  </Button>
                )}
              </div>

              {pdfViewerUrl ? (
                <div className="aspect-[16/9] w-full overflow-hidden rounded-lg border bg-muted">
                  <iframe
                    src={pdfViewerUrl}
                    title={proposal.clientName ? `${proposal.clientName} Presentation` : 'Presentation'}
                    className="h-full w-full"
                  />
                </div>
              ) : (
                <div className="rounded-md border border-dashed border-muted p-6 text-center text-sm text-muted-foreground">
                  <p>No PDF file available for this proposal.</p>
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
