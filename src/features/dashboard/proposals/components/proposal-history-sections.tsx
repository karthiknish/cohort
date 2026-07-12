'use client';
import { type ReactNode, useCallback } from 'react';
import { Clock, Download, ExternalLink, FileText, Layout, LoaderCircle, MoreHorizontal, Pencil, Plus, RefreshCw, Trash2, } from 'lucide-react';
import { Link } from '@/shared/ui/link';
import { DASHBOARD_THEME } from '@/lib/dashboard-theme';
import { withPreviewModeSearchParamIfEnabled, isPreviewModeEnabled } from '@/lib/preview-data';
import { useDownloadFile } from '@/lib/hooks/use-download-file';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, } from '@/shared/ui/dropdown-menu';
import { ViewTransition } from '@/shared/ui/view-transition';
import { cn, formatRelativeTime } from '@/lib/utils';
import type { ProposalDraft } from '@/types/proposals';
function proposalStatusBadgeClass(status: ProposalDraft['status']): string {
    if (status === 'ready') {
        return cn(DASHBOARD_THEME.badges.base, DASHBOARD_THEME.badges.success);
    }
    if (status === 'sent') {
        return cn(DASHBOARD_THEME.badges.base, 'border-accent/25 bg-accent/10 text-accent-foreground');
    }
    if (status === 'in_progress') {
        return cn(DASHBOARD_THEME.badges.base, DASHBOARD_THEME.badges.warning);
    }
    return cn(DASHBOARD_THEME.badges.base, DASHBOARD_THEME.badges.secondary);
}
function formatProposalUpdatedAt(updatedAt: string | null | undefined): string {
    if (!updatedAt)
        return 'Recently updated';
    const date = new Date(updatedAt);
    if (Number.isNaN(date.getTime()))
        return 'Recently updated';
    return formatRelativeTime(date);
}
export function ProposalHistoryHeader({ isLoading, isRefreshing, onRefresh, proposalCount, }: {
    isLoading: boolean;
    isRefreshing?: boolean;
    onRefresh: () => void;
    proposalCount: number;
}) {
    const showSpinner = isLoading || isRefreshing;
    return (<div className="flex flex-wrap items-center justify-between gap-3 px-1 py-2">
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">
          {showSpinner ? 'Refreshing…' : `${proposalCount} ${proposalCount === 1 ? 'proposal' : 'proposals'}`}
        </p>
        {!showSpinner && proposalCount > 0 ? (<p className="text-xs text-muted-foreground">In this workspace</p>) : null}
      </div>
      <Button variant="outline" size="sm" onClick={onRefresh} disabled={showSpinner} className="h-8 shrink-0 gap-1.5 rounded-full px-3">
        <RefreshCw className={cn('size-3.5', showSpinner && 'animate-spin')} aria-hidden/>
        Refresh
      </Button>
    </div>);
}
export type ProposalHistoryEmptyActions = {
    canCreate: boolean;
    canManage: boolean;
    creating: boolean;
    generating: boolean;
};
export function ProposalHistoryEmptyState({ actions, onCreateNew, }: {
    actions: ProposalHistoryEmptyActions;
    onCreateNew: () => void;
}) {
    const { canCreate, canManage = true, creating: isCreating, generating: isGenerating } = actions;
    return (<div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-muted-foreground/25 bg-linear-to-b from-muted/10 to-transparent px-6 py-14 text-center">
      <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/15">
        <FileText className="size-7 text-primary/80" aria-hidden/>
      </div>
      <h3 className="mb-2 text-lg font-semibold tracking-tight">No proposals yet</h3>
      <p className="mb-6 max-w-sm text-sm leading-relaxed text-muted-foreground">
        {canManage ? (<>
            Start the guided builder to capture client context and generate your first strategy deck.
          </>) : ('When your agency shares a proposal or deck, it will appear here for you to review.')}
      </p>
      {canManage ? (<Button onClick={onCreateNew} disabled={!canCreate || isCreating || isGenerating} className="gap-2 rounded-full shadow-sm">
          {isCreating ? <LoaderCircle className="size-4 animate-spin"/> : <Plus className="size-4"/>}
          New proposal
        </Button>) : null}
    </div>);
}
export type ProposalHistoryRowViewModel = {
    deckRequestable: boolean;
    displayName: string;
    isActiveDraft: boolean;
    isDeckPreparing: boolean;
    presentationUrl: string | null;
    pdfUrl: string | null;
    proposal: ProposalDraft;
    resumeDisabled: boolean;
    resumeLabel: string;
};
export function ProposalHistoryRow({ canManage = true, deletingProposalId, onDownloadDeck, onRequestDelete, onResume, row, workspaceId, }: {
    canManage?: boolean;
    deletingProposalId: string | null;
    onDownloadDeck: (proposal: ProposalDraft) => void;
    onRequestDelete: (proposal: ProposalDraft) => void;
    onResume: (proposal: ProposalDraft, forceEdit?: boolean) => void;
    row: ProposalHistoryRowViewModel;
    workspaceId?: string | null;
}) {
    const { deckRequestable, displayName, isActiveDraft, isDeckPreparing, presentationUrl, pdfUrl, proposal, resumeDisabled, resumeLabel } = row;
    const { download: downloadFile, isDownloading: isDownloadingFile } = useDownloadFile();
    const handleResumeAsEdit = () => {
        onResume(proposal, true);
    };
    const handleResume = () => {
        onResume(proposal, false);
    };
    const handleDownloadDeck = () => {
        onDownloadDeck(proposal);
    };
    const handleRequestDelete = () => {
        onRequestDelete(proposal);
    };
    const handleDownloadPptx = () => {
        if (!presentationUrl) return;
        void downloadFile({ url: presentationUrl, filename: `${displayName}.pptx`, workspaceId });
    };
    const handleDownloadPdf = () => {
        if (!pdfUrl) return;
        void downloadFile({ url: pdfUrl, filename: `${displayName}.pdf`, workspaceId });
    };
    const updatedLabel = formatProposalUpdatedAt(proposal.updatedAt);
    const isDeleting = deletingProposalId === proposal.id;
    return (<article className={cn('group relative transition-colors', 'hover:bg-muted/20', isActiveDraft && 'bg-primary/[0.03]')}>
      {isActiveDraft ? (<div className="absolute inset-y-0 left-0 w-0.5 bg-primary" aria-hidden/>) : null}

      <div className="flex flex-col gap-4 px-1 py-4 sm:flex-row sm:items-start sm:justify-between sm:px-2">
        <div className="min-w-0 space-y-2 pl-0.5">
          <div className="flex flex-wrap items-center gap-2">
            <ViewTransition name={`proposal-title-${proposal.id}`} share="text-morph" default="none">
              <h4 className="truncate text-base font-semibold tracking-tight text-foreground">{displayName}</h4>
            </ViewTransition>
            <ViewTransition name={`proposal-status-${proposal.id}`} share="morph" default="none">
              <span className={proposalStatusBadgeClass(proposal.status)}>{proposal.status}</span>
            </ViewTransition>
            {isActiveDraft && proposal.status !== 'ready' ? (<Badge variant="outline" className="rounded-full border-warning/30 bg-warning/10 text-[10px] font-semibold uppercase tracking-wide text-warning">
                Active draft
              </Badge>) : null}
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5" suppressHydrationWarning>
              <Clock className="size-3.5 shrink-0" aria-hidden/>
              {updatedLabel}
            </span>
            <span className="hidden h-3 w-px bg-border sm:inline" aria-hidden/>
            <span className="font-mono text-[10px] tracking-tight text-muted-foreground/80">
              #{proposal.id.slice(0, 8).toUpperCase()}
            </span>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
          <Button size="sm" variant={isActiveDraft ? 'default' : 'secondary'} onClick={handleResume} disabled={resumeDisabled} className="h-9 min-w-[8.5rem] gap-1.5 rounded-full font-medium">
            {resumeDisabled ? (<LoaderCircle className="size-3.5 animate-spin" aria-hidden/>) : (<Layout className="size-3.5" aria-hidden/>)}
            {resumeLabel}
          </Button>

          {presentationUrl ? (<>
              <Button asChild size="sm" variant="outline" className="h-9 rounded-full px-3">
                <Link href={withPreviewModeSearchParamIfEnabled(`/dashboard/proposals/${proposal.id}/deck`, isPreviewModeEnabled())} transitionTypes={['nav-forward']}>
                  <ExternalLink className="mr-1.5 size-3.5" aria-hidden/>
                  Preview
                </Link>
              </Button>
              <Button size="sm" variant="ghost" className="h-9 rounded-full px-3" onClick={handleDownloadPptx} disabled={isDownloadingFile}>
                {isDownloadingFile ? <LoaderCircle className="mr-1.5 size-3.5 animate-spin" aria-hidden/> : <Download className="mr-1.5 size-3.5" aria-hidden/>}
                PPT
              </Button>
              {pdfUrl ? (<Button size="sm" variant="ghost" className="h-9 rounded-full px-3" onClick={handleDownloadPdf} disabled={isDownloadingFile}>
                  {isDownloadingFile ? <LoaderCircle className="mr-1.5 size-3.5 animate-spin" aria-hidden/> : <FileText className="mr-1.5 size-3.5" aria-hidden/>}
                  PDF
                </Button>) : null}
            </>) : canManage && deckRequestable ? (<Button size="sm" variant="outline" onClick={handleDownloadDeck} disabled={isDeckPreparing} className="h-9 gap-1.5 rounded-full border-dashed px-3">
              {isDeckPreparing ? (<LoaderCircle className="size-3.5 animate-spin" aria-hidden/>) : (<FileText className="size-3.5 text-primary" aria-hidden/>)}
              {isDeckPreparing ? 'Preparing…' : 'Generate Deck'}
            </Button>) : null}

          {canManage ? (<DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="ghost" className="size-9 rounded-full text-muted-foreground" aria-label={`More actions for ${displayName}`}>
                  <MoreHorizontal className="size-4"/>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                {proposal.status === 'draft' && !isActiveDraft ? (<DropdownMenuItem onClick={handleResumeAsEdit}>
                    <Pencil className="mr-2 size-4"/>
                    Edit draft
                  </DropdownMenuItem>) : null}
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={handleRequestDelete} disabled={isDeleting}>
                  {isDeleting ? (<LoaderCircle className="mr-2 size-4 animate-spin"/>) : (<Trash2 className="mr-2 size-4"/>)}
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>) : null}
        </div>
      </div>
    </article>);
}
