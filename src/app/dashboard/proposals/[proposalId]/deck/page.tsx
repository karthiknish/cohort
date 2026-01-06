'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowLeft, Download, ExternalLink, FileText, Loader2, Presentation, AlertCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { ProposalDraft } from '@/services/proposals'
import { getProposalById } from '@/services/proposals'

type ViewerSource = 
  | { type: 'gamma'; url: string }
  | { type: 'pdf'; url: string }
  | { type: 'office'; embedUrl: string; downloadUrl: string }

/**
 * Creates a Microsoft Office Online viewer URL for a PPTX file
 * Uses our proxy endpoint to make authenticated URLs accessible
 */
function createOfficeViewerUrl(pptxUrl: string): string {
  // Create the proxy URL for this PPTX file
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
  const proxyUrl = `${baseUrl}/api/files/proxy?url=${encodeURIComponent(pptxUrl)}`
  
  // Microsoft Office Online viewer
  return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(proxyUrl)}`
}

export default function ProposalDeckPage() {
  const params = useParams<{ proposalId: string }>()
  const proposalId = params?.proposalId
  const [proposal, setProposal] = useState<ProposalDraft | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewerError, setViewerError] = useState(false)

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

  const viewerSource = useMemo<ViewerSource | null>(() => {
    if (!proposal) return null

    // 1. Gamma Web URL (Best experience - Gamma's native viewer)
    if (proposal.gammaDeck?.webUrl || proposal.gammaDeck?.shareUrl) {
      return {
        type: 'gamma',
        url: (proposal.gammaDeck.webUrl ?? proposal.gammaDeck.shareUrl) as string
      }
    }

    // 2. PDF viewer (works with browser's native viewer)
    if (proposal.pdfUrl || proposal.gammaDeck?.pdfUrl) {
      return {
        type: 'pdf',
        url: (proposal.pdfUrl ?? proposal.gammaDeck?.pdfUrl) as string
      }
    }

    // 3. PPTX - use Microsoft Office Online viewer with proxy
    const pptxUrl = proposal.pptUrl ?? proposal.gammaDeck?.storageUrl ?? proposal.gammaDeck?.pptxUrl
    if (pptxUrl) {
      return {
        type: 'office',
        embedUrl: createOfficeViewerUrl(pptxUrl),
        downloadUrl: pptxUrl
      }
    }

    return null
  }, [proposal])

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
                    <a href={presentationUrl} download>
                      <Download className="mr-2 h-4 w-4" />
                      Download PPT
                    </a>
                  </Button>
                )}
                {shareUrl && (
                  <Button variant="outline" asChild>
                    <a href={shareUrl} target="_blank" rel="noreferrer">
                      Open in Gamma
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                )}
              </div>
              
              {/* Gamma iframe viewer (best experience) */}
              {viewerSource?.type === 'gamma' && (
                <div className="rounded-lg border bg-muted/30">
                  <iframe
                    title="Proposal presentation preview"
                    src={viewerSource.url}
                    className="h-[70vh] w-full"
                    allowFullScreen
                  />
                </div>
              )}
              
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
              
              {/* Microsoft Office Online viewer for PPTX */}
              {viewerSource?.type === 'office' && !viewerError && (
                <div className="h-[70vh] overflow-hidden rounded-lg border bg-muted/30">
                  <iframe
                    title="PowerPoint presentation preview"
                    src={viewerSource.embedUrl}
                    className="h-full w-full"
                    onError={() => setViewerError(true)}
                  />
                </div>
              )}

              {/* Fallback when Office viewer fails */}
              {viewerSource?.type === 'office' && viewerError && (
                <div className="rounded-lg border border-dashed border-muted-foreground/30 bg-muted/20 p-8">
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="rounded-full bg-amber-100 p-4 mb-4">
                      <AlertCircle className="h-10 w-10 text-amber-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      Preview temporarily unavailable
                    </h3>
                    <p className="text-sm text-muted-foreground mb-6 max-w-md">
                      The online viewer couldn't load. Download the presentation to view it locally.
                    </p>
                    <div className="flex flex-wrap gap-3 justify-center">
                      <Button asChild size="lg">
                        <a href={viewerSource.downloadUrl} download>
                          <Download className="mr-2 h-5 w-5" />
                          Download PPTX
                        </a>
                      </Button>
                      {shareUrl && (
                        <Button variant="outline" size="lg" asChild>
                          <a href={shareUrl} target="_blank" rel="noreferrer">
                            View in Gamma
                            <ExternalLink className="ml-2 h-4 w-4" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              {/* No viewer available */}
              {!viewerSource && (
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
