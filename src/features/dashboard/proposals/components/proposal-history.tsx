'use client';
import { memo, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, CircleAlert, History } from 'lucide-react';
import { DASHBOARD_THEME } from '@/lib/dashboard-theme';
import { cn } from '@/lib/utils';
import { FadeIn, FadeInStagger } from '@/shared/ui/animate-in';
import { FadeInItem } from '@/shared/ui/fade-in-item';
import { MotionCard } from '@/shared/ui/motion-primitives';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { Button } from '@/shared/ui/button';
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import type { ProposalDraft } from '@/types/proposals';
import { ProposalHistoryEmptyState, ProposalHistoryHeader, ProposalHistoryRow, } from './proposal-history-sections';

const PROPOSAL_HISTORY_PAGE_SIZE = 8;
function extractAiSummary(insights: unknown, depth = 0): string | null {
    if (!insights || depth > 4) {
        return null;
    }
    if (typeof insights === 'string') {
        const trimmed = insights.trim();
        return trimmed.length > 0 ? trimmed : null;
    }
    if (typeof insights !== 'object') {
        return null;
    }
    if (Array.isArray(insights)) {
        for (const entry of insights) {
            const match = extractAiSummary(entry, depth + 1);
            if (match) {
                return match;
            }
        }
        return null;
    }
    const record = insights as Record<string, unknown>;
    const preferredKeys = ['summary', 'proposalSummary', 'executiveSummary', 'overview'];
    for (const key of preferredKeys) {
        const value = record[key];
        if (typeof value === 'string') {
            const trimmed = value.trim();
            if (trimmed.length > 0) {
                return trimmed;
            }
        }
    }
    for (const value of Object.values(record)) {
        const match = extractAiSummary(value, depth + 1);
        if (match) {
            return match;
        }
    }
    return null;
}
export type ProposalHistoryCapabilities = {
    canCreate: boolean;
    canManage: boolean;
};
export type ProposalHistoryWorkflowState = {
    loading: boolean;
    generating: boolean;
    creating: boolean;
};
interface ProposalHistoryProps {
    proposals: ProposalDraft[];
    draftId: string | null;
    workflow: ProposalHistoryWorkflowState;
    capabilities: ProposalHistoryCapabilities;
    deletingProposalId: string | null;
    queryError?: string | null;
    onRefresh: () => void;
    onResume: (proposal: ProposalDraft, forceEdit?: boolean) => void;
    onRequestDelete: (proposal: ProposalDraft) => void;
    downloadingDeckId: string | null;
    onDownloadDeck: (proposal: ProposalDraft) => void;
    onCreateNew: () => void;
}
function ProposalHistoryComponent({ proposals, draftId, workflow, capabilities, deletingProposalId, queryError, onRefresh, onResume, onRequestDelete, downloadingDeckId, onDownloadDeck, onCreateNew, }: ProposalHistoryProps) {
    const { loading: isLoading, generating: isGenerating, creating: isCreating } = workflow;
    const { canCreate, canManage = true } = capabilities;
    const emptyStateActions = ({
        canCreate,
        canManage,
        creating: isCreating,
        generating: isGenerating,
    });
    const allRows = useMemo(() => proposals.map((proposal) => {
        const isActiveDraft = proposal.id === draftId;
        const presentationUrl = proposal.pptUrl ?? proposal.presentationDeck?.storageUrl ?? proposal.presentationDeck?.pptxUrl ?? null;
        const pdfUrl = proposal.pdfUrl ?? proposal.presentationDeck?.pdfUrl ?? proposal.presentationDeck?.pdfStorageUrl ?? null;
        const suggestionText = (typeof proposal.aiSuggestions === 'string' ? proposal.aiSuggestions.trim() : '') || extractAiSummary(proposal.aiInsights);
        const displayName = proposal.clientName?.trim().length ? proposal.clientName : 'Unnamed company';
        const isGenerationInFlight = (isGenerating && isActiveDraft) || proposal.status === 'in_progress';
        const resumeLabel = proposal.status === 'ready'
            ? 'View proposal'
            : isGenerationInFlight
                ? 'Generating…'
                : isActiveDraft
                    ? 'Continue editing'
                    : 'Resume editing';
        return {
            deckRequestable: !presentationUrl && Boolean(suggestionText),
            displayName,
            isActiveDraft,
            isDeckPreparing: downloadingDeckId === proposal.id,
            presentationUrl,
            pdfUrl,
            proposal,
            resumeDisabled: proposal.status !== 'ready' && isGenerationInFlight,
            resumeLabel,
        };
    }), [proposals, draftId, isGenerating, downloadingDeckId]);
    const totalPages = Math.max(1, Math.ceil(allRows.length / PROPOSAL_HISTORY_PAGE_SIZE));
    const [pageIndex, setPageIndex] = useState(0);
    const clampedPageIndex = Math.min(pageIndex, totalPages - 1);
    const pagedRows = useMemo(() => {
        const start = clampedPageIndex * PROPOSAL_HISTORY_PAGE_SIZE;
        return allRows.slice(start, start + PROPOSAL_HISTORY_PAGE_SIZE);
    }, [allRows, clampedPageIndex]);
    const canPrev = clampedPageIndex > 0;
    const canNext = clampedPageIndex < totalPages - 1;
    const handlePrev = () => canPrev && setPageIndex(clampedPageIndex - 1);
    const handleNext = () => canNext && setPageIndex(clampedPageIndex + 1);
    return (<FadeIn>
      <MotionCard className={cn(DASHBOARD_THEME.cards.base, 'overflow-hidden')}>
        <CardHeader className={DASHBOARD_THEME.cards.header}>
          <div className="flex items-start gap-3">
            <div className={cn(DASHBOARD_THEME.icons.container, 'size-10 shrink-0')}>
              <History className="size-5" aria-hidden/>
            </div>
            <div className="min-w-0 space-y-1">
              <CardTitle className="text-lg font-semibold tracking-tight">Proposal history</CardTitle>
              <CardDescription className="text-sm leading-relaxed">
                Drafts, generated decks, and sent proposals for this client - resume work or open materials in one place.
              </CardDescription>
            </div>
          </div>
      </CardHeader>
        <CardContent className="space-y-4">
        <ProposalHistoryHeader isLoading={isLoading} onRefresh={onRefresh} proposalCount={proposals.length}/>
        {queryError ? (<Alert variant="destructive">
            <CircleAlert className="size-4"/>
            <AlertDescription>{queryError}</AlertDescription>
          </Alert>) : null}
        {proposals.length === 0 && !isLoading ? (<ProposalHistoryEmptyState actions={emptyStateActions} onCreateNew={onCreateNew}/>) : (<>
            <FadeInStagger className="divide-y divide-border/60">
              {pagedRows.map((row) => (<FadeInItem key={row.proposal.id} y={8}>
                    <ProposalHistoryRow canManage={canManage} deletingProposalId={deletingProposalId} onDownloadDeck={onDownloadDeck} onRequestDelete={onRequestDelete} onResume={onResume} row={row}/>
                  </FadeInItem>))}
            </FadeInStagger>
            {totalPages > 1 ? (<div className="flex items-center justify-between gap-3 pt-1">
                <p className="text-xs text-muted-foreground">
                  Page {clampedPageIndex + 1} of {totalPages} · {allRows.length} {allRows.length === 1 ? 'proposal' : 'proposals'}
                </p>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="h-8 gap-1.5 rounded-full px-3" onClick={handlePrev} disabled={!canPrev}>
                    <ChevronLeft className="size-3.5"/>
                    Prev
                  </Button>
                  <Button variant="outline" size="sm" className="h-8 gap-1.5 rounded-full px-3" onClick={handleNext} disabled={!canNext}>
                    Next
                    <ChevronRight className="size-3.5"/>
                  </Button>
                </div>
              </div>) : null}
          </>)}
      </CardContent>
      </MotionCard>
    </FadeIn>);
}
export const ProposalHistory = ProposalHistoryComponent;
