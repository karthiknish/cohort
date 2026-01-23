'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowLeft, Download, LoaderCircle, Presentation, Layout, Target, Layers, BarChart3, Rocket, Users, Lightbulb, Wallet, Calendar, Sparkles, Clock } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { ProposalDraft } from '@/types/proposals'
import { mergeProposalForm } from '@/lib/proposals'
import { useAuth } from '@/contexts/auth-context'
import { useQuery } from 'convex/react'
import { proposalsApi } from '@/lib/convex-api'

export default function ProposalDeckPage() {
  const params = useParams<{ proposalId: string }>()
  const proposalId = params?.proposalId

  const { user } = useAuth()
  const workspaceId = user?.agencyId ?? null

  const proposalRow = useQuery(
    proposalsApi.getByLegacyId,
    workspaceId && proposalId ? { workspaceId, legacyId: proposalId } : 'skip'
  )

  const isLoading = proposalRow === undefined
  const error = !isLoading && proposalRow === null ? 'Proposal not found' : null

  const proposal: ProposalDraft | null = useMemo(() => {
    if (!proposalRow) return null

    return {
      id: proposalRow.legacyId,
      status: proposalRow.status,
      stepProgress: proposalRow.stepProgress,
      formData: mergeProposalForm(proposalRow.formData),
      aiInsights: proposalRow.aiInsights ?? null,
      aiSuggestions: proposalRow.aiSuggestions ?? null,
      pdfUrl: proposalRow.pdfUrl ?? null,
      pptUrl: proposalRow.pptUrl ?? null,
      createdAt: proposalRow.createdAtMs ? new Date(proposalRow.createdAtMs).toISOString() : null,
      updatedAt: proposalRow.updatedAtMs ? new Date(proposalRow.updatedAtMs).toISOString() : null,
      lastAutosaveAt: proposalRow.lastAutosaveAtMs ? new Date(proposalRow.lastAutosaveAtMs).toISOString() : null,
      clientId: proposalRow.clientId ?? null,
      clientName: proposalRow.clientName ?? null,
      presentationDeck: proposalRow.presentationDeck ?? null,
      gammaDeck: proposalRow.presentationDeck ?? null,
    }
  }, [proposalRow])

  // PDF storage URL (preferred for viewing)
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

  const pdfViewerUrl = useMemo(() => {
    return pdfStorageUrl ?? pdfUrl
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
  
  const slideGuidance = useMemo(() => {
    const text = proposal?.gammaDeck?.instructions
    if (!text) return []
    
    // Parse: "Slide 1: Title * point 1 * point 2 Slide 2: Title 2..."
    const rawSlides = text.split(/(?=Slide \d+:)/).filter(Boolean)
    return rawSlides.map((s, index) => {
      const titleMatch = s.match(/Slide \d+:\s*([^*]+)/)
      const title = titleMatch ? titleMatch[1].trim() : `Slide ${index + 1}`
      const points = s.split('*').slice(1).map(p => p.trim()).filter(Boolean)
      
      return { 
        id: index + 1,
        title, 
        points 
      }
    })
  }, [proposal])

  const getSlideIcon = (index: number) => {
    const icons = [Presentation, Target, Lightbulb, Users, Sparkles, Layers, BarChart3, Wallet, Calendar, Rocket]
    const Icon = icons[index % icons.length]
    return <Icon className="h-4 w-4" />
  }

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
              <div className="flex flex-col gap-6">
                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  {lastUpdated && (
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted/50 border border-muted/20 text-[11px] font-medium">
                      <Clock className="h-3 w-3" />
                      Updated: {lastUpdated}
                    </span>
                  )}
                </div>

                {slideGuidance.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-1 bg-primary rounded-full" />
                      <div>
                        <h4 className="text-sm font-bold uppercase tracking-widest text-foreground/80">Slide-by-Slide Guidance</h4>
                        <p className="text-xs text-muted-foreground">Strategic walkthrough of your proposal deck</p>
                      </div>
                    </div>
                    
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {slideGuidance.map((slide, index) => (
                        <Card key={slide.id} className="relative overflow-hidden border-muted/40 bg-muted/5 transition-all hover:bg-muted/10 hover:border-primary/20 group">
                          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-100 transition-opacity">
                            <span className="text-4xl font-black text-primary/10">0{slide.id}</span>
                          </div>
                          <CardHeader className="p-4 pb-2">
                            <div className="flex items-center gap-2 text-primary">
                              <div className="p-1.5 rounded-lg bg-primary/10 transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                                {getSlideIcon(index)}
                              </div>
                              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Slide {slide.id}</span>
                            </div>
                            <CardTitle className="text-sm font-bold leading-tight mt-1">{slide.title}</CardTitle>
                          </CardHeader>
                          <CardContent className="p-4 pt-2">
                            <ul className="space-y-2">
                              {slide.points.map((point, i) => (
                                <li key={i} className="flex gap-2 text-[12px] leading-relaxed text-muted-foreground">
                                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary/40" />
                                  {point}
                                </li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
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
