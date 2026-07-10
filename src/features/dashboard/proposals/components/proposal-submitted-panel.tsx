'use client';
import { useCallback } from 'react';
import { m } from '@/shared/ui/motion';
import { CircleCheck, Copy, Download, ExternalLink, FileText, LoaderCircle, Pencil, Presentation, RefreshCw } from 'lucide-react';
import { Link } from '@/shared/ui/link';
import { dynamic } from '@/shared/ui/dynamic';
import { isPreviewModeEnabled, withPreviewModeSearchParamIfEnabled } from '@/lib/preview-data';
import { notifySuccess } from '@/lib/notifications';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { fadeInUpVariants, slideInLeftVariants, slideInRightVariants, transitions } from '@/lib/motion';
import type { ProposalFormData } from '@/lib/proposals';
import { cn } from '@/lib/utils';
import type { ProposalPresentationDeck } from '@/types/proposals';

const PptViewer = dynamic(() => import('@/shared/components/ppt-viewer').then((m) => ({ default: m.PptViewer })), {
    loading: () => (
        <div className="flex min-h-[min(42dvh,360px)] items-center justify-center rounded-xl border border-border/60 bg-muted/20">
            <LoaderCircle className="size-6 animate-spin text-muted-foreground" aria-hidden />
        </div>
    ),
    ssr: false,
});

function resolvePptxPreviewUrl(
    presentationDeck: ProposalPresentationDeck | null,
    deckDownloadUrl: string | null,
): string | null {
    for (const candidate of [deckDownloadUrl, presentationDeck?.storageUrl, presentationDeck?.pptxUrl]) {
        if (!candidate) {
            continue;
        }
        if (candidate.startsWith('/dashboard/')) {
            continue;
        }
        return candidate;
    }
    return null;
}

interface ProposalSubmittedPanelProps {
    summary: ProposalFormData;
    presentationDeck: ProposalPresentationDeck | null;
    deckDownloadUrl: string | null;
    activeProposalIdForDeck: string | null;
    canResumeSubmission: boolean;
    onResumeSubmission: () => void;
    onRegenerate: () => void;
    onRecheckDeck?: () => Promise<void>;
    isRecheckingDeck?: boolean;
    isSubmitting: boolean;
}

export function ProposalSubmittedPanel({
    summary,
    presentationDeck,
    deckDownloadUrl,
    activeProposalIdForDeck,
    canResumeSubmission,
    onResumeSubmission,
    onRegenerate,
    onRecheckDeck,
    isRecheckingDeck = false,
    isSubmitting,
}: ProposalSubmittedPanelProps) {
    const presentationHref = activeProposalIdForDeck
        ? withPreviewModeSearchParamIfEnabled(`/dashboard/proposals/${activeProposalIdForDeck}/deck`, isPreviewModeEnabled())
        : null;
    const viewerHref = activeProposalIdForDeck
        ? presentationHref
        : deckDownloadUrl
            ? `/dashboard/proposals/viewer?src=${encodeURIComponent(deckDownloadUrl)}`
            : null;
    const downloadUrl = deckDownloadUrl || presentationDeck?.storageUrl || presentationDeck?.pptxUrl || null;
    const pdfDownloadUrl = presentationDeck?.pdfUrl ?? presentationDeck?.pdfStorageUrl ?? null;
    const pptxPreviewUrl = resolvePptxPreviewUrl(presentationDeck, deckDownloadUrl);

    const handleCopySummary = useCallback(() => {
        const text = `
Company: ${summary.company.name}
Industry: ${summary.company.industry}
Website: ${summary.company.website}

Marketing Budget: ${summary.marketing.budget}
Platforms: ${summary.marketing.platforms.join(', ')}

Goals: ${summary.goals.objectives.join(', ')}
Challenges: ${summary.goals.challenges.join(', ')}

Scope: ${summary.scope.services.join(', ')}
Timeline: ${summary.timelines.startTime}
    `.trim();
        navigator.clipboard.writeText(text);
        notifySuccess({ message: 'Summary copied to clipboard' });
    }, [summary]);

    const handleCopyShareLink = useCallback(() => {
        if (presentationHref) {
            const shareLink = `${window.location.origin}${presentationHref}`;
            navigator.clipboard.writeText(shareLink);
            notifySuccess({ message: 'Share link copied!' });
        }
    }, [presentationHref]);

    return (
        <div className="min-w-0 space-y-6">
            {/* Hero */}
            <m.div initial="hidden" animate="visible" variants={fadeInUpVariants} className="flex flex-col items-center gap-6 rounded-2xl border border-border/60 bg-background p-8 md:flex-row md:items-start">
                <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/20">
                    <CircleCheck className="size-8 stroke-[2.5px] text-primary-foreground" />
                </div>
                <div className="flex-1 space-y-3 text-center md:text-left">
                    <h2 className="text-2xl font-semibold tracking-tight text-foreground">Your proposal is ready</h2>
                    <p className="max-w-lg text-sm leading-relaxed text-muted-foreground">
                        Your strategy brief and presentation deck are ready to review and share.
                    </p>
                    <div className="flex flex-wrap justify-center gap-3 pt-2 md:justify-start">
                        {presentationHref ? (
                            <Button size="lg" className="h-12 rounded-xl px-6 text-sm font-semibold" asChild>
                                <Link href={presentationHref} transitionTypes={['nav-forward']}>
                                    <Presentation className="mr-2 size-5" />
                                    View Presentation
                                </Link>
                            </Button>
                        ) : null}
                        {canResumeSubmission ? (
                            <Button size="lg" variant="outline" className="h-12 rounded-xl px-6 text-sm font-semibold" onClick={onResumeSubmission} disabled={isSubmitting}>
                                <Pencil className="mr-2 size-4" />
                                Edit Responses
                            </Button>
                        ) : null}
                        <Button size="lg" variant="outline" className="h-12 rounded-xl px-6 text-sm font-semibold" onClick={onRegenerate} disabled={isSubmitting}>
                            {isSubmitting ? <LoaderCircle className="mr-2 size-4 animate-spin" /> : <RefreshCw className="mr-2 size-4" />}
                            Regenerate
                        </Button>
                    </div>
                </div>
            </m.div>

            {/* Brief + Assets */}
            <div className="grid min-w-0 gap-6 lg:grid-cols-3">
                {/* Strategy Brief */}
                <m.div initial="hidden" animate="visible" variants={slideInLeftVariants} transition={{ ...transitions.slow, delay: 0.1 }}>
                    <Card className="flex h-full flex-col border-border/60 bg-background">
                        <CardHeader className="border-b border-border/40 pb-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <FileText className="size-4 text-primary" />
                                    <CardTitle className="text-sm font-semibold">Strategy Brief</CardTitle>
                                </div>
                                <Button variant="ghost" size="icon" className="size-8 rounded-lg" onClick={handleCopySummary} aria-label="Copy strategy brief">
                                    <Copy className="size-4" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1 space-y-4 pt-4">
                            <div className="space-y-1">
                                <p className="text-xs font-medium text-muted-foreground">Target Client</p>
                                <p className="text-sm font-semibold text-foreground">{summary.company.name || 'Unnamed Client'}</p>
                                <p className="text-xs text-muted-foreground">{summary.company.industry || 'Industry focus'}</p>
                            </div>
                            <div className="space-y-1.5">
                                <p className="text-xs font-medium text-muted-foreground">Objectives</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {summary.goals.objectives.length ? summary.goals.objectives.map((objective) => (
                                        <Badge key={objective} variant="secondary" className="text-[11px]">
                                            {objective}
                                        </Badge>
                                    )) : <span className="text-xs italic text-muted-foreground">None yet</span>}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-medium text-muted-foreground">Project Scope</p>
                                <p className="text-xs leading-relaxed text-muted-foreground">{summary.scope.services.join(', ') || 'No services selected'}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-medium text-muted-foreground">Timeline</p>
                                <p className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                                    <RefreshCw className="size-3 text-primary" />
                                    {summary.timelines.startTime || 'Not scheduled'}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </m.div>

                {/* Asset Delivery */}
                <m.div initial="hidden" animate="visible" variants={slideInRightVariants} transition={{ ...transitions.slow, delay: 0.15 }} className="min-w-0 lg:col-span-2">
                    <Card className="flex h-full min-w-0 flex-col overflow-hidden border-border/60 bg-background">
                        <CardHeader className="border-b border-border/40 pb-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Presentation className="size-4 text-primary" />
                                    <CardTitle className="text-sm font-semibold">Presentation Deck</CardTitle>
                                </div>
                                {presentationDeck ? (
                                    <Badge variant="outline" className={cn('text-[11px] font-semibold uppercase', presentationDeck.status === 'ready' ? 'border-success/20 bg-success/10 text-success' : 'border-primary/20 bg-primary/5 text-primary')}>
                                        {presentationDeck.status}
                                    </Badge>
                                ) : null}
                            </div>
                        </CardHeader>
                        <CardContent className="flex flex-1 flex-col pt-4">
                            {presentationDeck ? (
                                <div className="flex flex-1 flex-col gap-4">
                                    {pptxPreviewUrl && presentationDeck.status === 'ready' ? (
                                        <div className="min-w-0 overflow-hidden rounded-xl border border-border/60 bg-muted/10 p-3">
                                            <PptViewer
                                                url={pptxPreviewUrl}
                                                title={summary.company.name ? `${summary.company.name} deck` : 'Presentation'}
                                                embedded
                                            />
                                        </div>
                                    ) : null}
                                    <div className="space-y-3">
                                        {downloadUrl ? (
                                            <Button variant="outline" className="h-12 w-full justify-start rounded-xl" asChild>
                                                <a href={downloadUrl} download="proposal-deck.pptx" rel="noreferrer">
                                                    <Download className="mr-3 size-4 text-muted-foreground" />
                                                    <span className="text-sm font-semibold">Download PowerPoint</span>
                                                </a>
                                            </Button>
                                        ) : null}
                                        {pdfDownloadUrl ? (
                                            <Button variant="outline" className="h-12 w-full justify-start rounded-xl" asChild>
                                                <a href={pdfDownloadUrl} download="proposal.pdf" rel="noreferrer">
                                                    <FileText className="mr-3 size-4 text-muted-foreground" />
                                                    <span className="text-sm font-semibold">Download PDF</span>
                                                </a>
                                            </Button>
                                        ) : null}
                                        {viewerHref ? (
                                            <Button variant="outline" className="h-12 w-full justify-start rounded-xl" asChild>
                                                <Link href={viewerHref}>
                                                    <ExternalLink className="mr-3 size-4 text-muted-foreground" />
                                                    <span className="text-sm font-semibold">Open in-app preview</span>
                                                </Link>
                                            </Button>
                                        ) : null}
                                        {activeProposalIdForDeck ? (
                                            <Button variant="ghost" className="h-10 w-full justify-center rounded-xl text-xs font-semibold text-muted-foreground" onClick={handleCopyShareLink}>
                                                <Copy className="mr-2 size-3.5" />
                                                Copy share link
                                            </Button>
                                        ) : null}
                                    </div>
                                    {onRecheckDeck && (presentationDeck.status === 'pending' || presentationDeck.status === 'processing') ? (
                                        <div className="mt-auto flex items-center justify-end border-t border-border/40 pt-4">
                                            <Button variant="ghost" size="sm" onClick={onRecheckDeck} disabled={isRecheckingDeck} className="h-8 rounded-lg text-xs font-semibold text-primary">
                                                {isRecheckingDeck ? <LoaderCircle className="mr-2 size-3 animate-spin" /> : <RefreshCw className="mr-2 size-3" />}
                                                Sync
                                            </Button>
                                        </div>
                                    ) : null}
                                </div>
                            ) : (
                                <div className="flex flex-1 flex-col items-center justify-center py-12 text-center">
                                    <LoaderCircle className="mb-3 size-8 animate-spin text-primary/40" />
                                    <h4 className="mb-1 text-base font-semibold">Building your deck</h4>
                                    <p className="max-w-xs text-xs leading-relaxed text-muted-foreground">
                                        AI is structuring your slides. This usually takes less than 60 seconds.
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </m.div>
            </div>
        </div>
    );
}
