'use client';
import { Link } from '@/shared/ui/link';
import { useParams } from '@/shared/ui/navigation';
import { Download, LoaderCircle, Clock } from 'lucide-react';
import { useCallback } from 'react';
import { ViewTransition } from '@/shared/ui/view-transition';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { SvglPdfIcon } from '@/shared/components/svgl-brand-logo';
import type { ProposalDraft, ProposalPresentationDeck } from '@/types/proposals';
import { mergeProposalForm } from '@/lib/proposals';
import { useAuth } from '@/shared/contexts/auth-context';
import { usePreview } from '@/shared/contexts/preview-context';
import { useConvex, useQuery } from 'convex/react';
import { proposalsApi, proposalArchivesApi } from '@/lib/convex-api';
import { resolveProposalDeckUrls, useProposalArtifactUrls, } from '@/features/dashboard/proposals/hooks/use-proposal-artifact-urls';
import { getPreviewProposals } from '@/lib/preview-data';
import { PageSkeletonBoundary } from '@/shared/ui/page-skeleton-boundary';
import { DirectionalPageTransition } from '@/shared/ui/page-transition';
import { BackLink } from '@/shared/components/back-link';
import { DeckPageViewerSection } from '@/features/dashboard/proposals/[proposalId]/deck/deck-page-viewer-section';

const LOADING_FALLBACK = (
    <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <LoaderCircle className="size-6 animate-spin" />
            <p>Loading proposal deck…</p>
        </div>
    </div>
);

export default function ProposalDeckPage() {
    const params = useParams() as { proposalId: string };
    const proposalId = params?.proposalId;
    const { user } = useAuth();
    const { isPreviewMode } = usePreview();
    const workspaceId = user?.agencyId ?? null;
    const convex = useConvex();
    const proposalRow = useQuery(proposalsApi.getByLegacyId, !isPreviewMode && workspaceId && proposalId ? { workspaceId, legacyId: proposalId } : 'skip');
    const previewProposal = (isPreviewMode && proposalId ? getPreviewProposals(null).find((proposal) => proposal.id === proposalId) ?? null : null);
    const isLoading = !isPreviewMode && proposalRow === undefined;
    const error = isPreviewMode
        ? (previewProposal ? null : 'Proposal not found')
        : !isLoading && proposalRow === null
            ? 'Proposal not found'
            : null;
    const proposal: ProposalDraft | null = (() => {
        if (isPreviewMode) return previewProposal;
        if (!proposalRow) return null;
        return {
            id: proposalRow.legacyId,
            status: proposalRow.status as ProposalDraft['status'],
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
            presentationDeck: (proposalRow.presentationDeck ?? null) as ProposalPresentationDeck | null,
        };
    })();
    const artifactUrls = useProposalArtifactUrls(!isPreviewMode ? workspaceId : null, proposalId ?? null);
    const { pdfUrl: pdfViewerUrl, pptUrl: pptxViewerUrl } = resolveProposalDeckUrls({
        artifactUrls,
        pdfUrl: proposal?.pdfUrl,
        pptUrl: proposal?.pptUrl,
        presentationDeck: proposal?.presentationDeck,
    });
    const refreshPptxUrl = useCallback(async (): Promise<string | null> => {
        if (!workspaceId || !proposalId || !pptxViewerUrl) return null;
        try {
            const result = await convex.action(proposalArchivesApi.refreshSignedUrl, { workspaceId, url: pptxViewerUrl }) as unknown;
            if (typeof result === 'string') return result || null;
            if (result && typeof result === 'object' && 'data' in result) {
                return (result as { data: string | null }).data ?? null;
            }
            return null;
        } catch {
            return null;
        }
    }, [convex, workspaceId, proposalId, pptxViewerUrl]);
    const cloudCopyPending = Boolean(proposal && workspaceId &&
        ((proposal.pdfUrl && !artifactUrls?.pdfArchived) || (proposal.pptUrl && !artifactUrls?.pptArchived)));
    const lastUpdated = (() => {
        if (!proposal?.updatedAt) return null;
        const parsed = new Date(proposal.updatedAt);
        return Number.isNaN(parsed.getTime()) ? proposal.updatedAt : parsed.toLocaleString();
    })();
    const proposalDisplayName = proposal?.clientName ?? 'Strategy Proposal';

    return (
        <DirectionalPageTransition>
            <PageSkeletonBoundary loading={isLoading} loadingContent={LOADING_FALLBACK}>
                <div className="space-y-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="space-y-2">
                            <BackLink label="Back to proposals" href="/dashboard/proposals" transitionTypes={['nav-back']} />
                            {proposal ? (
                                <ViewTransition name={`proposal-title-${proposal.id}`} share="text-morph" default="none">
                                    <h1 className="text-2xl font-semibold tracking-tight text-foreground">{proposalDisplayName}</h1>
                                </ViewTransition>
                            ) : null}
                        </div>
                        {proposal ? (
                            <ViewTransition name={`proposal-status-${proposal.id}`} share="morph" default="none">
                                <Badge variant={proposal.status === 'ready' ? 'default' : 'outline'} className="uppercase tracking-wide">
                                    {proposal.status}
                                </Badge>
                            </ViewTransition>
                        ) : null}
                    </div>

                    {error ? (
                        <Card className="border-destructive/40 bg-destructive/5">
                            <CardHeader>
                                <CardTitle className="text-destructive">Unable to load deck</CardTitle>
                                <CardDescription className="text-destructive/80">{error}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button variant="outline" asChild>
                                    <Link href="/dashboard/proposals" transitionTypes={['nav-back']}>Return to proposals</Link>
                                </Button>
                            </CardContent>
                        </Card>
                    ) : proposal ? (
                        <Card className="border-border/60 bg-background">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-xl">Presentation deck</CardTitle>
                                <CardDescription>
                                    {proposal.clientName ? `Prepared for ${proposal.clientName}` : 'Presentation preview'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {lastUpdated ? (
                                    <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                        <Clock className="size-3" />
                                        Updated {lastUpdated}
                                    </p>
                                ) : null}

                                <div className="flex flex-wrap gap-3">
                                    {pdfViewerUrl ? (
                                        <Button variant="outline" asChild>
                                            <a href={pdfViewerUrl} download={`${proposalDisplayName}.pdf`} target="_blank" rel="noreferrer">
                                                <SvglPdfIcon className="mr-2 size-4" />
                                                Download PDF
                                            </a>
                                        </Button>
                                    ) : null}
                                    {pptxViewerUrl ? (
                                        <Button variant="outline" asChild>
                                            <a href={pptxViewerUrl} download={`${proposalDisplayName}.pptx`} target="_blank" rel="noreferrer">
                                                <Download className="mr-2 size-4" />
                                                Download PowerPoint
                                            </a>
                                        </Button>
                                    ) : null}
                                    {cloudCopyPending ? (
                                        <span className="self-center text-xs text-muted-foreground">Cloud copies syncing…</span>
                                    ) : null}
                                </div>

                                <DeckPageViewerSection pdfUrl={pdfViewerUrl} pptxUrl={pptxViewerUrl} proposalDisplayName={proposalDisplayName} refreshPptxUrl={refreshPptxUrl} />
                            </CardContent>
                        </Card>
                    ) : null}
                </div>
            </PageSkeletonBoundary>
        </DirectionalPageTransition>
    );
}
