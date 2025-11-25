'use client'

import { memo } from 'react'

import Link from 'next/link'

import { Loader2 } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

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
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{isLoading ? 'Refreshing proposals…' : `${proposals.length} total proposals`}</span>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={onCreateNew}
              disabled={!canCreate || isCreating || isGenerating}
            >
              {isCreating ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating…
                </span>
              ) : (
                'New proposal'
              )}
            </Button>
            <Button variant="outline" size="sm" onClick={onRefresh} disabled={isLoading}>
              Refresh
            </Button>
          </div>
        </div>
        <div className="space-y-3">
          {proposals.length === 0 && !isLoading ? (
            <div className="rounded-md border border-dashed border-muted p-6 text-center text-sm text-muted-foreground">
              No proposals yet. Start by completing the wizard above.
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
                    'rounded-lg border bg-card p-4 transition hover:bg-muted/40',
                    isActiveDraft && 'border-primary'
                  )}
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-sm font-semibold">
                        {displayName}
                        <Badge variant={proposal.status === 'ready' ? 'default' : 'outline'}>{proposal.status}</Badge>
                        {isActiveDraft && proposal.status !== 'ready' && <Badge variant="secondary">Active draft</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        ID: {proposal.id} · Updated{' '}
                        {proposal.updatedAt ? new Date(proposal.updatedAt).toLocaleString() : 'recently'}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onResume(proposal)}
                        disabled={resumeDisabled}
                      >
                        {resumeLabel}
                      </Button>
                      {presentationUrl ? (
                        <>
                          <Button asChild size="sm" variant="secondary">
                            <Link href={`/dashboard/proposals/${proposal.id}/deck`}>
                              View PPT
                            </Link>
                          </Button>
                          <Button asChild size="sm" variant="ghost">
                            <a href={presentationUrl} target="_blank" rel="noopener noreferrer">
                              Download PPT
                            </a>
                          </Button>
                        </>
                      ) : deckRequestable ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onDownloadDeck(proposal)}
                          disabled={isDeckPreparing}
                        >
                          {isDeckPreparing ? (
                            <span className="flex items-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Preparing...
                            </span>
                          ) : (
                            'Prepare PPT'
                          )}
                        </Button>
                      ) : (
                        <Button size="sm" variant="ghost" disabled>
                          Deck unavailable
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => onRequestDelete(proposal)}
                        disabled={Boolean(deletingProposalId)}
                      >
                        {deletingProposalId === proposal.id ? 'Deleting…' : 'Delete'}
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
