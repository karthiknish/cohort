'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowLeft, ExternalLink, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { ProposalDraft } from '@/services/proposals'
import { getProposalById } from '@/services/proposals'

function buildViewerUrl(src: string): string {
  const encoded = encodeURIComponent(src)
  return `https://view.officeapps.live.com/op/embed.aspx?src=${encoded}`
}

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
      ?? proposal.gammaDeck?.storageUrl
      ?? proposal.gammaDeck?.pptxUrl
      ?? null
    )
  }, [proposal])

  const viewerUrl = useMemo(() => {
    if (!presentationUrl) {
      return null
    }
    return buildViewerUrl(presentationUrl)
  }, [presentationUrl])

  const shareUrl = useMemo(() => {
    if (!proposal) {
      return null
    }
    return proposal.gammaDeck?.webUrl ?? proposal.gammaDeck?.shareUrl ?? null
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
            <Loader2 className="h-6 w-6 animate-spin" />
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
                      Download PPT
                    </a>
                  </Button>
                )}
                {shareUrl && (
                  <Button variant="outline" asChild>
                    <a href={shareUrl} target="_blank" rel="noreferrer">
                      Open online
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                )}
              </div>
              {viewerUrl ? (
                <div className="rounded-lg border bg-muted/30">
                  <iframe
                    title="Proposal presentation preview"
                    src={viewerUrl}
                    className="h-[70vh] w-full"
                    allowFullScreen
                  />
                </div>
              ) : (
                <div className="rounded-md border border-dashed border-muted p-6 text-sm text-muted-foreground">
                  {presentationUrl
                    ? 'Inline preview is unavailable for this deck. Use the download button above to open the presentation.'
                    : 'This proposal does not have a presentation deck yet. Generate a deck from the proposal history panel first.'}
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
