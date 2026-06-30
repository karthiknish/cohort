'use client';
import { useCallback, useEffect } from 'react';
import { FileText, Plus, X } from 'lucide-react';
import { useIsMobile } from '@/shared/hooks/use-is-mobile';
import { Drawer, DrawerContent } from '@/shared/ui/drawer';
import { Kbd } from '@/shared/ui/kbd';
import { DashboardSkeleton } from '@/features/dashboard/home/components/dashboard-skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/alert';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader } from '@/shared/ui/card';
import { getButtonClasses } from '@/lib/dashboard-theme';
import { cn } from '@/lib/utils';
import type { ProposalFormData } from '@/lib/proposals';
import { DashboardPageHero } from '@/shared/components/dashboard-page-hero';
import type { ProposalDraft } from '@/types/proposals';
import { ProposalBuilderJourneyBar } from './proposal-builder-journey-bar';
import { ProposalDraftPanel } from './proposal-draft-panel';
import { ProposalHistory } from './proposal-history';
import { ProposalMetrics } from './proposal-metrics';
import { ProposalStepIndicator } from './proposal-step-indicator';
import { ProposalStepNav } from './proposal-step-nav';
import type { ProposalStep } from './proposal-step-indicator';
import { ProposalSubmittedPanel } from './proposal-submitted-panel';
import { ProposalTemplateSelector } from './proposal-template-selector';
import { ProposalVersionHistory } from './proposal-version-history';
import { ProposalWizardHeader } from './proposal-wizard-header';
import { DeckProgressOverlay, ProposalGenerationOverlay, type DeckProgressStage } from './deck-progress-overlays';
import { ProposalDeleteDialog } from './proposal-delete-dialog';
const PREVIEW_PROPOSAL_WORKFLOW = { loading: false, generating: false, creating: false } as const;
const PREVIEW_PROPOSAL_CAPABILITIES = { canCreate: false, canManage: false } as const;
export function ProposalPageActions(props: {
    canManage?: boolean;
    currentFormData: ProposalFormData;
    draftId: string | null;
    isSubmitting: boolean;
    selectedClientId: string | null;
    isCreatingDraft: boolean;
    onApplyTemplate: (templateFormData: ProposalFormData) => void;
    onVersionRestored: (restoredFormData: ProposalFormData) => void;
    onStartProposal: () => void;
}) {
    const { canManage = true, currentFormData, draftId, isSubmitting, selectedClientId, isCreatingDraft, onApplyTemplate, onVersionRestored, onStartProposal, } = props;
    if (!canManage) {
        return null;
    }
    return (<div className="flex w-full flex-col gap-2 sm:w-auto sm:items-end">
      <div className="flex flex-wrap items-center justify-end gap-2">
        <ProposalTemplateSelector currentFormData={currentFormData} onApplyTemplate={onApplyTemplate}/>
        <ProposalVersionHistory proposalId={draftId} currentFormData={currentFormData} onVersionRestored={onVersionRestored} disabled={!draftId || isSubmitting}/>
      </div>
      <Button onClick={onStartProposal} disabled={!selectedClientId || isCreatingDraft} className={cn(getButtonClasses('primary'), 'w-full shrink-0 shadow-sm sm:w-auto')}>
        <Plus className="mr-2 size-4"/>
        New proposal
      </Button>
    </div>);
}
export function ProposalStartStateCard(props: {
    canStart: boolean;
    /** When false, user can view shared proposals but not create. */
    canManage?: boolean;
    /** Shown when `canStart` is false (e.g. no client selected). */
    blockedHint?: string | null;
}) {
    const { canStart, canManage = true, blockedHint } = props;
    if (canStart) {
        return null;
    }
    if (!canManage) {
        return (<Alert className="rounded-2xl border border-dashed border-muted-foreground/25 bg-muted/15">
        <AlertTitle className="flex items-center gap-2 text-base">
          <FileText className="size-4 text-primary" aria-hidden/>
          Shared proposals
        </AlertTitle>
        <AlertDescription className="text-sm leading-relaxed">
          Your agency publishes proposals and decks here. Open a row below to preview or download when ready.
        </AlertDescription>
      </Alert>);
    }
    return (<Alert className="rounded-2xl border border-dashed border-warning/25 bg-warning/5">
      <AlertTitle className="flex items-center gap-2 text-base">
        <FileText className="size-4 text-warning" aria-hidden/>
        Select a client to create proposals
      </AlertTitle>
      <AlertDescription className="text-sm leading-relaxed">{blockedHint}</AlertDescription>
    </Alert>);
}
export function ProposalPreviewModeSection(props: {
    previewProposals: ProposalDraft[];
    previewDraftId: string | null;
    onRefreshPreview: () => void;
    onResume: (proposal: ProposalDraft) => void;
    onRequestDelete: () => void;
    onDownloadDeck: (proposal: ProposalDraft) => void;
    onCreateNew: () => void;
}) {
    const { previewProposals, previewDraftId, onRefreshPreview, onResume, onRequestDelete, onDownloadDeck, onCreateNew, } = props;
    return (<>
      <div className="flex items-center justify-between">
        <ProposalWizardHeader />
        <Button disabled className={cn(getButtonClasses('primary'), 'shrink-0 opacity-70')}>
          <Plus className="mr-2 size-4"/>
          Preview Mode
        </Button>
      </div>

      <Card className="border-dashed border-accent/30 bg-accent/5">
        <CardHeader>
          <div className="flex flex-col gap-2">
            <h3 className="text-lg font-semibold text-foreground">Sample proposal data</h3>
            <p className="text-sm text-muted-foreground">
              Preview mode shows representative proposal history, metrics, and deck previews. Editing and generation actions stay read-only.
            </p>
          </div>
        </CardHeader>
      </Card>

      <ProposalMetrics proposals={previewProposals} isLoading={false}/>

      <ProposalHistory proposals={previewProposals} draftId={previewDraftId} workflow={PREVIEW_PROPOSAL_WORKFLOW} capabilities={PREVIEW_PROPOSAL_CAPABILITIES} deletingProposalId={null} onRefresh={onRefreshPreview} onResume={onResume} onRequestDelete={onRequestDelete} downloadingDeckId={null} onDownloadDeck={onDownloadDeck} onCreateNew={onCreateNew}/>
    </>);
}
export function ProposalBuilderOverlay(props: {
    open: boolean;
    onClose: () => void;
    isBootstrapping: boolean;
    submitted: boolean;
    isPresentationReady: boolean;
    summary: ProposalFormData;
    presentationDeck: unknown;
    deckDownloadUrl: string | null;
    activeProposalIdForDeck: string | null;
    canResumeSubmission: boolean;
    onResumeSubmission: () => void;
    isSubmitting: boolean;
    onRecheckDeck: () => Promise<void>;
    isRecheckingDeck: boolean;
    steps: ProposalStep[];
    currentStep: number;
    draftId: string | null;
    autosaveStatus: 'idle' | 'saving' | 'saved' | 'error';
    stepContent: React.ReactNode;
    onBack: () => void;
    onNext: () => void;
    onGoToStep: (index: number) => void;
    isFirstStep: boolean;
    isLastStep: boolean;
    validationMessages: string[];
}) {
    const { open, onClose, isBootstrapping, submitted, isPresentationReady, summary, presentationDeck, deckDownloadUrl, activeProposalIdForDeck, canResumeSubmission, onResumeSubmission, isSubmitting, onRecheckDeck, isRecheckingDeck, steps, currentStep, draftId, autosaveStatus, stepContent, onBack, onNext, onGoToStep, isFirstStep, isLastStep, validationMessages, } = props;
    const isMobile = useIsMobile();
    useEffect(() => {
        if (!open) {
            return;
        }
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key !== 'Escape' || isSubmitting) {
                return;
            }
            event.preventDefault();
            onClose();
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [open, isSubmitting, onClose]);
    const activeStep = steps[currentStep];
    const handleDrawerOpenChange = (next: boolean) => {
        if (!next && !isSubmitting) {
            onClose();
        }
    };
    const builderBody = (<div className="flex h-full min-h-0 flex-col overflow-hidden bg-background supports-[padding:max(0px)]:pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-border/50 bg-background/90 p-4 backdrop-blur-md sm:items-center sm:px-6">
          <div className="min-w-0 space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Proposal builder</p>
            <h2 className="text-balance text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
              {submitted ? 'Deck and next steps' : activeStep?.title ?? 'Proposal'}
            </h2>
            <p className="text-pretty text-sm leading-relaxed text-muted-foreground">
              {submitted
            ? 'Review your generated materials or jump back in to adjust inputs.'
            : (activeStep?.description ?? 'Complete each section—your work saves automatically.')}
            </p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting} className="shrink-0 gap-2 rounded-full border-muted-foreground/25" aria-label={isSubmitting ? 'Close when generation finishes' : 'Close proposal builder'}>
            <X className="size-4" aria-hidden/>
            <span className="hidden sm:inline">Close</span>
            <Kbd className="hidden sm:inline">Esc</Kbd>
          </Button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:px-6 sm:py-5">
          <div className="mb-4">
            <ProposalBuilderJourneyBar isSubmitting={isSubmitting} isRecheckingDeck={isRecheckingDeck} submitted={submitted} isPresentationReady={isPresentationReady} activeProposalIdForDeck={activeProposalIdForDeck} deckDownloadUrl={deckDownloadUrl} autosaveStatus={autosaveStatus}/>
          </div>
          <div className="flex min-h-0 flex-col gap-4">
            {isBootstrapping ? (<Card className="border-border/60 bg-background shadow-sm">
                <CardContent className="p-6">
                  <DashboardSkeleton showStepIndicator/>
                </CardContent>
              </Card>) : submitted ? (<Card className="border-border/60 bg-background shadow-sm">
                <CardContent className="p-6">
                  <ProposalSubmittedPanel summary={summary} presentationDeck={presentationDeck as Parameters<typeof ProposalSubmittedPanel>[0]['presentationDeck']} deckDownloadUrl={deckDownloadUrl} activeProposalIdForDeck={activeProposalIdForDeck} canResumeSubmission={canResumeSubmission} onResumeSubmission={onResumeSubmission} isSubmitting={isSubmitting} onRecheckDeck={onRecheckDeck} isRecheckingDeck={isRecheckingDeck}/>
                </CardContent>
              </Card>) : (<Card className="flex min-h-0 flex-col overflow-hidden border-border/60 bg-background p-0 shadow-sm md:grid md:grid-cols-4">
                <aside className="hidden min-h-0 flex-col border-b border-border/50 p-6 md:flex md:border-r md:border-b-0">
                  <p className="mb-4 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Sections
                  </p>
                  <ProposalStepNav steps={steps} currentStep={currentStep} submitted={submitted} onGoToStep={onGoToStep}/>
                </aside>
                <div className="flex min-h-0 flex-col gap-4 p-4 md:col-span-3 sm:p-6">
                  <div className="lg:hidden">
                    <ProposalStepIndicator steps={steps} currentStep={currentStep} submitted={submitted}/>
                  </div>
                  <ProposalDraftPanel draftId={draftId} autosaveStatus={autosaveStatus} stepContent={stepContent} onBack={onBack} onNext={onNext} isFirstStep={isFirstStep} isLastStep={isLastStep} currentStep={currentStep} totalSteps={steps.length} isSubmitting={isSubmitting} validationMessages={validationMessages}/>
                </div>
              </Card>)}
          </div>
        </div>
    </div>);
    if (isMobile) {
        return (<Drawer open={open} onOpenChange={handleDrawerOpenChange} direction="right">
        <DrawerContent className="inset-y-0 left-auto mt-0 h-full max-h-none w-full max-w-none rounded-none border-0 data-[vaul-drawer-direction=right]:w-full">
          {builderBody}
        </DrawerContent>
      </Drawer>);
    }
    if (!open) {
        return null;
    }
    return (<div className="fixed inset-0 z-2000 isolate bg-background">{builderBody}</div>);
}
export function ProposalsPageHeroSection({ clientName, pageActions, }: {
    clientName: string | null;
    pageActions: React.ReactNode;
}) {
    return (<DashboardPageHero innerClassName="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
      <ProposalWizardHeader clientName={clientName}/>
      {pageActions}
    </DashboardPageHero>);
}
export function ProposalsPageOverlays(props: {
    isWizardOpen: boolean;
    onCloseWizard: () => void;
    isBootstrapping: boolean;
    submitted: boolean;
    isPresentationReady: boolean;
    summary: ProposalFormData;
    presentationDeck: unknown;
    deckDownloadUrl: string | null;
    activeProposalIdForDeck: string | null;
    canResumeSubmission: boolean;
    onResumeSubmission: () => void;
    isSubmitting: boolean;
    onRecheckDeck: () => Promise<void>;
    isRecheckingDeck: boolean;
    steps: ProposalStep[];
    currentStep: number;
    draftId: string | null;
    autosaveStatus: 'idle' | 'saving' | 'saved' | 'error';
    stepContent: React.ReactNode;
    onBack: () => void;
    onNext: () => void;
    onGoToStep: (index: number) => void;
    isFirstStep: boolean;
    isLastStep: boolean;
    validationMessages: string[];
    isDeleteDialogOpen: boolean;
    deletingProposalId: string | null;
    proposalName: string | null;
    onDeleteDialogChange: (open: boolean) => void;
    onConfirmDelete: () => void;
    showGenerationOverlay: boolean;
    deckProgressStage: DeckProgressStage | null;
    showDeckProgressOverlay: boolean;
}) {
    const { isWizardOpen, onCloseWizard, isBootstrapping, submitted, isPresentationReady, summary, presentationDeck, deckDownloadUrl, activeProposalIdForDeck, canResumeSubmission, onResumeSubmission, isSubmitting, onRecheckDeck, isRecheckingDeck, steps, currentStep, draftId, autosaveStatus, stepContent, onBack, onNext, onGoToStep, isFirstStep, isLastStep, validationMessages, isDeleteDialogOpen, deletingProposalId, proposalName, onDeleteDialogChange, onConfirmDelete, showGenerationOverlay, deckProgressStage, showDeckProgressOverlay, } = props;
    return (<>
      <ProposalDeleteDialog open={isDeleteDialogOpen} isDeleting={Boolean(deletingProposalId)} proposalName={proposalName} onOpenChange={onDeleteDialogChange} onConfirm={onConfirmDelete}/>
      <ProposalGenerationOverlay isSubmitting={showGenerationOverlay} isPresentationReady={isPresentationReady && !isWizardOpen}/>
      <DeckProgressOverlay stage={deckProgressStage ?? ('polling' satisfies DeckProgressStage)} isVisible={showDeckProgressOverlay}/>
      <ProposalBuilderOverlay open={isWizardOpen} onClose={onCloseWizard} isBootstrapping={isBootstrapping} submitted={submitted} isPresentationReady={isPresentationReady} summary={summary} presentationDeck={presentationDeck} deckDownloadUrl={deckDownloadUrl} activeProposalIdForDeck={activeProposalIdForDeck} canResumeSubmission={canResumeSubmission} onResumeSubmission={onResumeSubmission} isSubmitting={isSubmitting} onRecheckDeck={onRecheckDeck} isRecheckingDeck={isRecheckingDeck} steps={steps} currentStep={currentStep} draftId={draftId} autosaveStatus={autosaveStatus} stepContent={stepContent} onBack={onBack} onNext={onNext} onGoToStep={onGoToStep} isFirstStep={isFirstStep} isLastStep={isLastStep} validationMessages={validationMessages}/>
    </>);
}
