'use client'

import { memo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

import type { ProposalDraft } from '@/types/proposals'
import {
  ProposalHistoryEmptyState,
  ProposalHistoryHeader,
  ProposalHistoryRow,
} from './proposal-history-sections'

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
  onResume: (proposal: ProposalDraft, forceEdit?: boolean) => void
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
  const rows = proposals.map((proposal) => {
    const isActiveDraft = proposal.id === draftId
    const presentationUrl = proposal.pptUrl ?? proposal.presentationDeck?.storageUrl ?? proposal.presentationDeck?.pptxUrl ?? null
    const suggestionText = (typeof proposal.aiSuggestions === 'string' ? proposal.aiSuggestions.trim() : '') || extractAiSummary(proposal.aiInsights)
    const displayName = proposal.clientName?.trim().length ? proposal.clientName : 'Unnamed company'
    const isGenerationInFlight = (isGenerating && isActiveDraft) || proposal.status === 'in_progress'
    const resumeLabel = proposal.status === 'ready'
      ? 'View proposal'
      : isGenerationInFlight
        ? 'Generating…'
        : isActiveDraft
          ? 'Continue editing'
          : 'Resume editing'

    return {
      deckRequestable: !presentationUrl && Boolean(suggestionText),
      displayName,
      isActiveDraft,
      isDeckPreparing: downloadingDeckId === proposal.id,
      presentationUrl,
      proposal,
      resumeDisabled: proposal.status !== 'ready' && isGenerationInFlight,
      resumeLabel,
    }
  })

  return (
    <Card className="border-muted/60 bg-background">
      <CardHeader>
        <CardTitle className="text-lg">Proposal history</CardTitle>
        <CardDescription>Access draft, ready, and sent proposals in one place.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <ProposalHistoryHeader isLoading={isLoading} onRefresh={onRefresh} proposalCount={proposals.length} />
        <div className="space-y-3">
          {proposals.length === 0 && !isLoading ? (
            <ProposalHistoryEmptyState canCreate={canCreate} isCreating={isCreating} isGenerating={isGenerating} onCreateNew={onCreateNew} />
          ) : (
            rows.map((row) => (
              <ProposalHistoryRow
                key={row.proposal.id}
                deletingProposalId={deletingProposalId}
                onDownloadDeck={onDownloadDeck}
                onRequestDelete={onRequestDelete}
                onResume={onResume}
                row={row}
              />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export const ProposalHistory = memo(ProposalHistoryComponent)
