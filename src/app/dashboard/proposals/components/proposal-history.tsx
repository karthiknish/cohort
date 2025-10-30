'use client'

import { memo } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

import type { ProposalDraft } from '@/services/proposals'

interface ProposalHistoryProps {
  proposals: ProposalDraft[]
  draftId: string | null
  isLoading: boolean
  deletingProposalId: string | null
  mapAiSummary: (proposal: ProposalDraft | null | undefined) => string | null
  onRefresh: () => void
  onResume: (proposal: ProposalDraft) => void
  onRequestDelete: (proposal: ProposalDraft) => void
}

function ProposalHistoryComponent({
  proposals,
  draftId,
  isLoading,
  deletingProposalId,
  mapAiSummary,
  onRefresh,
  onResume,
  onRequestDelete,
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
          <Button variant="outline" size="sm" onClick={onRefresh} disabled={isLoading}>
            Refresh
          </Button>
        </div>
        <div className="space-y-3">
          {proposals.length === 0 && !isLoading ? (
            <div className="rounded-md border border-dashed border-muted p-6 text-center text-sm text-muted-foreground">
              No proposals yet. Start by completing the wizard above.
            </div>
          ) : (
            proposals.map((proposal) => {
              const isActiveDraft = proposal.id === draftId
              const summary = mapAiSummary(proposal)
              const presentationUrl = proposal.pptUrl ?? proposal.gammaDeck?.storageUrl ?? proposal.gammaDeck?.pptxUrl ?? null
              const displayName = proposal.clientName?.trim().length ? proposal.clientName : 'Unnamed company'

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
                      >
                        {proposal.status === 'ready'
                          ? 'View summary'
                          : isActiveDraft
                            ? 'Continue editing'
                            : 'Resume editing'}
                      </Button>
                      {presentationUrl ? (
                        <Button asChild size="sm" variant="ghost">
                          <a href={presentationUrl} target="_blank" rel="noopener noreferrer">
                            Download deck
                          </a>
                        </Button>
                      ) : (
                        <Button size="sm" variant="ghost" disabled>
                          Download deck
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
                  {summary && (
                    <div className="mt-3 rounded-md bg-muted/70 p-3 text-sm text-muted-foreground">
                      <p className="font-medium text-foreground">AI summary preview</p>
                      <p className="mt-1 line-clamp-2">{summary}</p>
                    </div>
                  )}
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
