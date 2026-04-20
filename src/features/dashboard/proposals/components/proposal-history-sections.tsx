'use client'

import { type ReactNode, useCallback, ViewTransition } from 'react'
import { Clock, Download, ExternalLink, FileText, Layout, LoaderCircle, Pencil, Plus, RefreshCw, Trash2 } from 'lucide-react'
import Link from 'next/link'

import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { cn } from '@/lib/utils'
import type { ProposalDraft } from '@/types/proposals'

function MaybeViewTransition({
  children,
  defaultType,
  name,
  share,
}: {
  children: ReactNode
  defaultType: 'none' | 'auto'
  name: string
  share: string
}) {
  if (typeof ViewTransition !== 'function') {
    return children
  }

  return (
    <ViewTransition name={name} share={share} default={defaultType}>
      {children}
    </ViewTransition>
  )
}

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
      <div className="flex min-w-0 flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-2">
        <span className="text-sm font-medium text-foreground">
          {isLoading ? 'Refreshing proposals…' : `${proposalCount} ${proposalCount === 1 ? 'proposal' : 'proposals'}`}
        </span>
        {!isLoading && proposalCount > 0 ? (
          <span className="text-xs text-muted-foreground">For the selected client workspace</span>
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
      <div className="mb-4 rounded-full bg-info/10 p-4">
        <FileText className="h-8 w-8 text-info/60" />
      </div>
      <h3 className="mb-2 text-lg font-semibold tracking-tight">No proposals yet</h3>
      <p className="mb-6 max-w-[280px] text-sm text-muted-foreground">
        Ready to win your next client? Start by generating a tailored AI proposal strategy.
      </p>
      <Button onClick={onCreateNew} disabled={!canCreate || isCreating || isGenerating} className="shadow-sm motion-chromatic hover:shadow-md">
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

  const handleResumeAsEdit = useCallback(() => {
    onResume(proposal, true)
  }, [onResume, proposal])

  const handleResume = useCallback(() => {
    onResume(proposal, false)
  }, [onResume, proposal])

  const handleDownloadDeck = useCallback(() => {
    onDownloadDeck(proposal)
  }, [onDownloadDeck, proposal])

  const handleRequestDelete = useCallback(() => {
    onRequestDelete(proposal)
  }, [onRequestDelete, proposal])

  return (
    <div
      className={cn(
        'group relative rounded-xl border bg-card p-5 motion-chromatic hover:border-info/20 hover:shadow-sm',
        isActiveDraft && 'border-info bg-info/[0.01] shadow-[0_0_0_1px_hsl(var(--info)/0.05)]',
      )}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <MaybeViewTransition name={`proposal-title-${proposal.id}`} share="text-morph" defaultType="none">
              <h4 className="text-base font-semibold tracking-tight text-foreground transition-colors group-hover:text-primary">{displayName}</h4>
            </MaybeViewTransition>
            <MaybeViewTransition name={`proposal-status-${proposal.id}`} share="morph" defaultType="none">
              <Badge
                variant={proposal.status === 'ready' ? 'default' : 'outline'}
                className={cn(
                  'h-5 px-2 text-[10px] font-bold uppercase tracking-wider',
                  proposal.status === 'ready' && 'border-none bg-success hover:bg-success/90',
                  proposal.status === 'sent' && 'border-none bg-accent text-accent-foreground hover:bg-accent/90',
                  proposal.status === 'draft' && 'border-muted-foreground/30 text-muted-foreground',
                )}
              >
                {proposal.status}
              </Badge>
            </MaybeViewTransition>
            {isActiveDraft && proposal.status !== 'ready' ? (
              <Badge variant="secondary" className="h-5 border-none bg-warning/10 px-2 text-[10px] font-bold uppercase tracking-wider text-warning hover:bg-warning/10">
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
            <Button size="sm" variant="secondary" onClick={handleResumeAsEdit} className="h-9 px-4 font-medium">
              <Pencil className="mr-2 h-3.5 w-3.5" />
              Edit
            </Button>
          ) : null}

          <Button size="sm" variant={isActiveDraft ? 'default' : 'outline'} onClick={handleResume} disabled={resumeDisabled} className="h-9 px-4 font-medium">
            {resumeDisabled ? <LoaderCircle className="mr-2 h-3.5 w-3.5 animate-spin" /> : <Layout className="mr-2 h-3.5 w-3.5" />}
            {resumeLabel}
          </Button>

          {presentationUrl ? (
            <div className="flex items-center gap-1.5">
              <Button asChild size="sm" variant="secondary" className="h-9 px-3">
                <Link href={`/dashboard/proposals/${proposal.id}/deck`} transitionTypes={['nav-forward']}>
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
            <Button size="sm" variant="outline" onClick={handleDownloadDeck} disabled={isDeckPreparing} className="h-9 border-dashed px-4">
              {isDeckPreparing ? <LoaderCircle className="mr-2 h-3.5 w-3.5 animate-spin" /> : <FileText className="mr-2 h-3.5 w-3.5 text-info" />}
              {isDeckPreparing ? 'Preparing…' : 'Generate Deck'}
            </Button>
          ) : null}

          <Button
            size="icon"
            variant="ghost"
            onClick={handleRequestDelete}
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
