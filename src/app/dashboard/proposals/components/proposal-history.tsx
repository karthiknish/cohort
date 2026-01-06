'use client'

import { memo } from 'react'

import Link from 'next/link'

import { LoaderCircle } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { FileText, Sparkles, Plus, Clock, Trash2, Layout, Download, ExternalLink, RefreshCw } from 'lucide-react'

import type { ProposalDraft } from '@/services/proposals'

function extractAiSummary(insights: unknown, depth = 0): string | null {
  if (!insights || depth > 4) {
    return null
  }
  if (typeof insights === 'string') {
    const trimmed = insights.trim()
    return trimmed.length > 0 ? trimmed : null
  }
  if (typeof insights !== 'object') {
    return null
  }
  if (Array.isArray(insights)) {
    for (const entry of insights) {
      const match = extractAiSummary(entry, depth + 1)
      if (match) {
        return match
      }
    }
    return null
  }
  const record = insights as Record<string, unknown>
  const preferredKeys = ['summary', 'proposalSummary', 'executiveSummary', 'overview']
  for (const key of preferredKeys) {
    const value = record[key]
    if (typeof value === 'string') {
      const trimmed = value.trim()
      if (trimmed.length > 0) {
        return trimmed
      }
    }
  }
  for (const value of Object.values(record)) {
    const match = extractAiSummary(value, depth + 1)
    if (match) {
      return match
    }
  }
  return null
}

interface ProposalHistoryProps {
  proposals: ProposalDraft[]
  draftId: string | null
  isLoading: boolean
  deletingProposalId: string | null
  onRefresh: () => void
  onResume: (proposal: ProposalDraft) => void
  onRequestDelete: (proposal: ProposalDraft) => void
  isGenerating: boolean
  downloadingDeckId: string | null
  onDownloadDeck: (proposal: ProposalDraft) => void
  onCreateNew: () => void
  canCreate: boolean
  isCreating: boolean
}

function ProposalHistoryComponent({
  proposals,
  draftId,
  isLoading,
  deletingProposalId,
  onRefresh,
  onResume,
  onRequestDelete,
  isGenerating,
  downloadingDeckId,
  onDownloadDeck,
  onCreateNew,
  canCreate,
  isCreating,
}: ProposalHistoryProps) {
  return (
    <Card className="border-muted/60 bg-background">
      <CardHeader>
        <CardTitle className="text-lg">Proposal history</CardTitle>
        <CardDescription>Access draft, ready, and sent proposals in one place.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between pb-2 border-b border-muted/30">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{isLoading ? 'Refreshing proposals…' : `${proposals.length} total proposals`}</span>
            {!isLoading && proposals.length > 0 && (
               <Badge variant="secondary" className="bg-primary/5 text-primary text-[10px] uppercase font-bold tracking-wider px-1.5 h-4">Active</Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onRefresh} disabled={isLoading} className="h-8 px-2 text-muted-foreground hover:text-foreground">
              <RefreshCw className={cn("h-3.5 w-3.5 mr-1.5", isLoading && "animate-spin")} />
              Refresh
            </Button>
          </div>
        </div>
        <div className="space-y-3">
          {proposals.length === 0 && !isLoading ? (
            <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-muted/50 p-12 text-center bg-muted/5">
              <div className="mb-4 rounded-full bg-primary/10 p-4">
                <FileText className="h-8 w-8 text-primary/60" />
              </div>
              <h3 className="mb-2 text-lg font-semibold tracking-tight">No proposals yet</h3>
              <p className="mb-6 max-w-[280px] text-sm text-muted-foreground">
                Ready to win your next client? Start by generating a tailored AI proposal strategy.
              </p>
              <Button 
                onClick={onCreateNew} 
                disabled={!canCreate || isCreating || isGenerating}
                className="shadow-sm hover:shadow-md transition-all"
              >
                {isCreating ? (
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="mr-2 h-4 w-4" />
                )}
                Create first proposal
              </Button>
            </div>
          ) : (
            proposals.map((proposal) => {
              const isActiveDraft = proposal.id === draftId
              const presentationUrl = proposal.pptUrl ?? proposal.presentationDeck?.storageUrl ?? proposal.presentationDeck?.pptxUrl ?? null
              const suggestionText = (typeof proposal.aiSuggestions === 'string' ? proposal.aiSuggestions.trim() : '')
                || extractAiSummary(proposal.aiInsights)
              const displayName = proposal.clientName?.trim().length ? proposal.clientName : 'Unnamed company'
              const isGenerationInFlight = (isGenerating && isActiveDraft) || proposal.status === 'in_progress'
              const resumeLabel = proposal.status === 'ready'
                ? 'View proposal'
                : isGenerationInFlight
                  ? 'Generating…'
                  : isActiveDraft
                    ? 'Continue editing'
                    : 'Resume editing'
              const resumeDisabled = proposal.status !== 'ready' && isGenerationInFlight
              const deckRequestable = !presentationUrl && Boolean(suggestionText)
              const isDeckPreparing = downloadingDeckId === proposal.id

              return (
                <div
                  key={proposal.id}
                  className={cn(
                    'group relative rounded-xl border bg-card p-5 transition-all duration-200 hover:shadow-sm hover:border-primary/20',
                    isActiveDraft && 'border-primary shadow-[0_0_0_1px_rgba(var(--primary),0.05)] bg-primary/[0.01]'
                  )}
                >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="space-y-1.5">
                        <div className="flex items-center flex-wrap gap-2">
                          <h4 className="text-base font-semibold tracking-tight text-foreground transition-colors group-hover:text-primary">
                            {displayName}
                          </h4>
                          <Badge 
                            variant={proposal.status === 'ready' ? 'default' : 'outline'}
                            className={cn(
                              "text-[10px] uppercase font-bold tracking-wider px-2 h-5",
                              proposal.status === 'ready' && "bg-emerald-500 hover:bg-emerald-600 border-none",
                              proposal.status === 'sent' && "bg-purple-500 hover:bg-purple-600 border-none text-white",
                              proposal.status === 'draft' && "text-muted-foreground border-muted-foreground/30"
                            )}
                          >
                            {proposal.status}
                          </Badge>
                          {isActiveDraft && proposal.status !== 'ready' && (
                             <Badge variant="secondary" className="text-[10px] uppercase font-bold tracking-wider px-2 h-5 bg-orange-100 text-orange-700 hover:bg-orange-100 border-none">Active draft</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5" />
                            {proposal.updatedAt ? new Date(proposal.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently'}
                          </span>
                          <span className="h-3 w-px bg-muted-foreground/20" />
                          <span className="font-mono text-[10px] tracking-tight">#{proposal.id.slice(0, 8).toUpperCase()}</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-2">
                        <Button
                          size="sm"
                          variant={isActiveDraft ? "default" : "outline"}
                          onClick={() => onResume(proposal)}
                          disabled={resumeDisabled}
                          className="h-9 px-4 font-medium"
                        >
                          {resumeDisabled ? (
                            <LoaderCircle className="mr-2 h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Layout className="mr-2 h-3.5 w-3.5" />
                          )}
                          {resumeLabel}
                        </Button>
                        
                        {presentationUrl ? (
                          <div className="flex items-center gap-1.5">
                            <Button asChild size="sm" variant="secondary" className="h-9 px-3">
                              <Link href={`/dashboard/proposals/${proposal.id}/deck`}>
                                <ExternalLink className="mr-2 h-3.5 w-3.5" />
                                Preview
                              </Link>
                            </Button>
                            <Button asChild size="sm" variant="ghost" className="h-9 px-3 text-muted-foreground hover:text-foreground">
                              <a href={presentationUrl} target="_blank" rel="noopener noreferrer">
                                <Download className="mr-2 h-3.5 w-3.5" />
                                PPT
                              </a>
                            </Button>
                          </div>
                        ) : deckRequestable ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onDownloadDeck(proposal)}
                            disabled={isDeckPreparing}
                            className="h-9 px-4 border-dashed"
                          >
                            {isDeckPreparing ? (
                              <LoaderCircle className="mr-2 h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Sparkles className="mr-2 h-3.5 w-3.5 text-primary" />
                            )}
                            {isDeckPreparing ? 'Preparing...' : 'Generate Deck'}
                          </Button>
                        ) : null}

                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => onRequestDelete(proposal)}
                          disabled={Boolean(deletingProposalId)}
                          className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        >
                          {deletingProposalId === proposal.id ? (
                            <LoaderCircle className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                )
            })
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export const ProposalHistory = memo(ProposalHistoryComponent)
