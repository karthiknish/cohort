'use client'

import { Clock, Download, ExternalLink, FileText, Layout, LoaderCircle, Pencil, Plus, RefreshCw, Trash2 } from 'lucide-react'
import Link from 'next/link'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { ProposalDraft } from '@/types/proposals'

export function ProposalHistoryHeader({
  isLoading,
  onRefresh,
  proposalCount,
}: {
  isLoading: boolean
  onRefresh: () => void
  proposalCount: number
}) {
  return (
    <div className="flex items-center justify-between border-b border-muted/30 pb-2">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">{isLoading ? 'Refreshing proposals…' : `${proposalCount} total proposals`}</span>
        {!isLoading && proposalCount > 0 ? (
          <Badge variant="secondary" className="h-4 bg-primary/5 px-1.5 text-[10px] font-bold uppercase tracking-wider text-primary">
            Active
          </Badge>
        ) : null}
      </div>
      <Button variant="ghost" size="sm" onClick={onRefresh} disabled={isLoading} className="h-8 px-2 text-muted-foreground hover:text-foreground">
        <RefreshCw className={cn('mr-1.5 h-3.5 w-3.5', isLoading && 'animate-spin')} />
        Refresh
      </Button>
    </div>
  )
}

export function ProposalHistoryEmptyState({
  canCreate,
  isCreating,
  isGenerating,
  onCreateNew,
}: {
  canCreate: boolean
  isCreating: boolean
  isGenerating: boolean
  onCreateNew: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-muted/50 bg-muted/5 p-12 text-center">
      <div className="mb-4 rounded-full bg-primary/10 p-4">
        <FileText className="h-8 w-8 text-primary/60" />
      </div>
      <h3 className="mb-2 text-lg font-semibold tracking-tight">No proposals yet</h3>
      <p className="mb-6 max-w-[280px] text-sm text-muted-foreground">
        Ready to win your next client? Start by generating a tailored AI proposal strategy.
      </p>
      <Button onClick={onCreateNew} disabled={!canCreate || isCreating || isGenerating} className="shadow-sm transition-[color,background-color,border-color,text-decoration-color,fill,stroke,opacity,box-shadow,transform,filter,backdrop-filter] hover:shadow-md">
        {isCreating ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
        Create first proposal
      </Button>
    </div>
  )
}

export type ProposalHistoryRowViewModel = {
  deckRequestable: boolean
  displayName: string
  isActiveDraft: boolean
  isDeckPreparing: boolean
  presentationUrl: string | null
  proposal: ProposalDraft
  resumeDisabled: boolean
  resumeLabel: string
}

export function ProposalHistoryRow({
  deletingProposalId,
  onDownloadDeck,
  onRequestDelete,
  onResume,
  row,
}: {
  deletingProposalId: string | null
  onDownloadDeck: (proposal: ProposalDraft) => void
  onRequestDelete: (proposal: ProposalDraft) => void
  onResume: (proposal: ProposalDraft, forceEdit?: boolean) => void
  row: ProposalHistoryRowViewModel
}) {
  const { deckRequestable, displayName, isActiveDraft, isDeckPreparing, presentationUrl, proposal, resumeDisabled, resumeLabel } = row

  return (
    <div
      className={cn(
        'group relative rounded-xl border bg-card p-5 transition-[color,background-color,border-color,text-decoration-color,fill,stroke,opacity,box-shadow,transform,filter,backdrop-filter] duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-standard)] motion-reduce:transition-none hover:border-primary/20 hover:shadow-sm',
        isActiveDraft && 'border-primary bg-primary/[0.01] shadow-[0_0_0_1px_rgba(var(--primary),0.05)]',
      )}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-base font-semibold tracking-tight text-foreground transition-colors group-hover:text-primary">{displayName}</h4>
            <Badge
              variant={proposal.status === 'ready' ? 'default' : 'outline'}
              className={cn(
                'h-5 px-2 text-[10px] font-bold uppercase tracking-wider',
                proposal.status === 'ready' && 'border-none bg-emerald-500 hover:bg-emerald-600',
                proposal.status === 'sent' && 'border-none bg-purple-500 text-white hover:bg-purple-600',
                proposal.status === 'draft' && 'border-muted-foreground/30 text-muted-foreground',
              )}
            >
              {proposal.status}
            </Badge>
            {isActiveDraft && proposal.status !== 'ready' ? (
              <Badge variant="secondary" className="h-5 border-none bg-orange-100 px-2 text-[10px] font-bold uppercase tracking-wider text-orange-700 hover:bg-orange-100">
                Active draft
              </Badge>
            ) : null}
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
          {proposal.status === 'draft' && !isActiveDraft ? (
            <Button size="sm" variant="secondary" onClick={() => onResume(proposal, true)} className="h-9 px-4 font-medium">
              <Pencil className="mr-2 h-3.5 w-3.5" />
              Edit
            </Button>
          ) : null}

          <Button size="sm" variant={isActiveDraft ? 'default' : 'outline'} onClick={() => onResume(proposal, false)} disabled={resumeDisabled} className="h-9 px-4 font-medium">
            {resumeDisabled ? <LoaderCircle className="mr-2 h-3.5 w-3.5 animate-spin" /> : <Layout className="mr-2 h-3.5 w-3.5" />}
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
            <Button size="sm" variant="outline" onClick={() => onDownloadDeck(proposal)} disabled={isDeckPreparing} className="h-9 border-dashed px-4">
              {isDeckPreparing ? <LoaderCircle className="mr-2 h-3.5 w-3.5 animate-spin" /> : <FileText className="mr-2 h-3.5 w-3.5 text-primary" />}
              {isDeckPreparing ? 'Preparing…' : 'Generate Deck'}
            </Button>
          ) : null}

          <Button
            size="icon"
            variant="ghost"
            onClick={() => onRequestDelete(proposal)}
            disabled={Boolean(deletingProposalId)}
            className="h-9 w-9 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
            aria-label={`Delete ${displayName}`}
          >
            {deletingProposalId === proposal.id ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  )
}