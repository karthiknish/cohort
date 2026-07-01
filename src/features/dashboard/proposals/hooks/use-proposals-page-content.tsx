'use client';
import { useRouter } from '@/shared/ui/navigation';
import { useCallback, useEffect, useState } from 'react';
import type { ProposalFormData } from '@/lib/proposals';
import { can } from '@/lib/access-control/dashboard-access';
import { useAuth } from '@/shared/contexts/auth-context';
import { useClientContext } from '@/shared/contexts/client-context';
import { usePreview } from '@/shared/contexts/preview-context';
import { PageSkeletonBoundary } from '@/shared/ui/page-skeleton-boundary';
import { ProposalsPageSkeleton } from '../components/proposals-page-skeleton';
import { getPreviewProposals } from '@/lib/preview-data';
import { ProposalStepContent } from '../components/proposal-step-content';
import { type DeckProgressStage } from '../components/deck-progress-overlays';
import { ProposalsPageMainView } from '../components/proposals-page-content-sections';
import { createInitialProposalFormState } from '../utils/form-steps';
import { useKeyboardShortcuts } from '@/shared/hooks/use-keyboard-shortcuts';
import { useDeckPreparation } from './use-deck-preparation';
import { useProposalDrafts } from './use-proposal-drafts';
import { useProposalPageInteractions } from './use-proposal-page-interactions';
import { useProposalSubmission } from './use-proposal-submission';
import { useProposalWizard } from './use-proposal-wizard';
export function useProposalsPageContent() {
    const { push } = useRouter();
    const { user } = useAuth();
    const { selectedClient, selectedClientId } = useClientContext();
    const { isPreviewMode } = usePreview();
    const canManageProposals = isPreviewMode || can(user?.role, 'proposals.manage');
    const [isWizardOpen, setIsWizardOpen] = useState(false);
    useEffect(() => {
        if (!isWizardOpen) {
            return;
        }
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, [isWizardOpen]);
    // Wizard hook - form state and step navigation
    const wizard = useProposalWizard();
    const { currentStep, formState, validationErrors, steps, step, isFirstStep, isLastStep, hasPersistableData, setCurrentStep, setFormState, updateField, toggleArrayValue, handleSocialHandleChange, clearErrors, undo, redo, canUndo, canRedo, handleBack, goToStep, } = wizard;
    // Draft management hook
    const drafts = useProposalDrafts({
        isPreviewMode,
        formState,
        currentStep,
        hasPersistableData,
        onFormStateChange: setFormState,
        onStepChange: setCurrentStep,
        onSubmittedChange: (submitted) => submission.setSubmitted(submitted),
        onPresentationDeckChange: (deck) => submission.setPresentationDeck(deck),
        onAiSuggestionsChange: (suggestions) => submission.setAiSuggestions(suggestions),
        onLastSubmissionSnapshotChange: (snapshot) => submission.setLastSubmissionSnapshot(snapshot),
        steps,
    });
    const { draftId, proposals: draftProposals, isLoadingProposals, isCreatingDraft, isBootstrapping, proposalsQueryError, autosaveStatus, deletingProposalId, proposalPendingDelete, isDeleteDialogOpen, setDraftId, setAutosaveStatus, refreshProposals, ensureDraftId, saveDraftNow, handleCreateNewProposal, handleResumeProposal, handleDeleteProposal, requestDeleteProposal, handleDeleteDialogChange, wizardRef, } = drafts;
    // Submission hook - AI generation and deck polling
    const submission = useProposalSubmission({
        draftId,
        formState,
        currentStep,
        ensureDraftId,
        refreshProposals,
        setDraftId,
        setFormState,
        setCurrentStep,
        setAutosaveStatus,
        clearErrors,
        steps,
    });
    const { isSubmitting, isRecheckingDeck, submitted, isPresentationReady, presentationDeck, lastSubmissionSnapshot, submitProposal, handleContinueEditingFromSnapshot, handleRecheckDeck, canResumeSubmission, deckDownloadUrl, activeProposalIdForDeck, } = submission;
    // Deck preparation hook — setProposals is a no-op because Convex realtime
    // updates the proposals list automatically. The optimistic update in deck
    // prep is redundant; removing it avoids a local-state sync effect that
    // caused a render storm (refreshProposals was unmemoized → effect ran every
    // render → setProposals → re-render → infinite loop).
    const deckPrep = useDeckPreparation({
        draftId,
        refreshProposals,
        setPresentationDeck: submission.setPresentationDeck,
        setAiSuggestions: submission.setAiSuggestions,
        setProposals: useCallback(() => {}, []),
        presentationDeck,
    });
    const { downloadingDeckId, deckProgressStage, handleDownloadDeck } = deckPrep;
    const hasSelectedClient = Boolean(selectedClientId);
    // Handle next button with submit
    const handleNext = () => {
        if (isLastStep) {
            void submitProposal();
        }
        else {
            wizard.handleNext();
        }
    };
    const handleRegenerate = () => {
        void submitProposal();
    };
    // Summary for display
    const summary = (() => {
        if (submitted && lastSubmissionSnapshot) {
            return structuredClone(lastSubmissionSnapshot.form) as ProposalFormData;
        }
        return structuredClone(formState) as ProposalFormData;
    })();
    const activeDeckStage: DeckProgressStage = deckProgressStage ?? 'polling';
    const previewProposals = getPreviewProposals(selectedClientId ?? null);
    const previewDraftId = previewProposals.find((proposal) => proposal.status === 'draft')?.id ?? null;
    const displayedProposals = isPreviewMode ? previewProposals : draftProposals;
    const displayedDraftId = isPreviewMode ? previewDraftId : draftId;
    const displayedLoadingState = isPreviewMode ? false : isLoadingProposals;
    const isInitialLoading = displayedLoadingState && displayedProposals.length === 0 && !isWizardOpen;
    const handleStartPreviewProposal = () => {
        const initialForm = createInitialProposalFormState();
        submission.setSubmitted(false);
        submission.setPresentationDeck(null);
        submission.setAiSuggestions(null);
        submission.setLastSubmissionSnapshot(null);
        setDraftId(null);
        setAutosaveStatus('idle');
        setFormState({
            ...initialForm,
            company: {
                ...initialForm.company,
                name: selectedClient?.name ?? initialForm.company.name,
            },
        }, { resetHistory: true });
        setCurrentStep(0);
        setIsWizardOpen(true);
    };
    useKeyboardShortcuts([
        {
            combo: 'mod+s',
            description: 'Save draft now',
            callback: () => {
                void saveDraftNow({ showToast: true });
            },
            enabled: isWizardOpen && !submitted && !isPreviewMode,
        },
        {
            combo: 'mod+z',
            description: 'Undo last proposal edit',
            callback: () => {
                undo();
            },
            enabled: isWizardOpen && !submitted && canUndo,
        },
        {
            combo: 'mod+shift+z',
            description: 'Redo proposal edit',
            callback: () => {
                redo();
            },
            enabled: isWizardOpen && !submitted && canRedo,
        },
    ], {
        enabled: isWizardOpen,
        allowInInput: true,
    });
    const { handleSelectTemplate, handleVersionRestored, handleStartProposal, handleResumeProposalInModal, handleContinueEditingInModal, handlePreviewRefresh, handlePreviewRequestDelete, handlePreviewDownloadDeck, } = useProposalPageInteractions({
        routerPush: push,
        setIsWizardOpen,
        setFormState,
        setCurrentStep,
        handleCreateNewProposal,
        handleResumeProposal,
        handleContinueEditingFromSnapshot,
    });
    const handleRefreshProposals = () => {
        void refreshProposals();
    };
    const handleConfirmDeleteProposal = () => {
        if (proposalPendingDelete) {
            void handleDeleteProposal(proposalPendingDelete);
        }
    };
    const handleCloseWizard = () => {
        setIsWizardOpen(false);
    };
    const submissionAnnouncement = (() => {
        if (isSubmitting) {
            return 'Generating proposal deck. This can take a few minutes.';
        }
        if (isRecheckingDeck) {
            return 'Rechecking proposal deck status.';
        }
        if (submitted && isPresentationReady) {
            return 'Proposal deck is ready.';
        }
        return '';
    })();
    const proposalHistoryWorkflow = ({
        loading: displayedLoadingState,
        generating: isSubmitting,
        creating: isCreatingDraft,
    });
    const proposalHistoryCapabilities = ({
        canManage: canManageProposals,
        canCreate: canManageProposals && Boolean(selectedClientId),
    });
    const proposalWorkflow = ({
        canManageProposals,
        isSubmitting,
        isCreatingDraft,
        isPreviewMode,
    });
    const proposalViewState = ({
        displayedLoadingState,
        isWizardOpen,
        isDeleteDialogOpen,
        isPresentationReady,
        isBootstrapping,
        submitted,
        canResumeSubmission,
        isRecheckingDeck,
        isFirstStep,
        isLastStep,
    });
    const stepContent = (<ProposalStepContent stepId={step.id} formState={formState} summary={summary} validationErrors={validationErrors} onUpdateField={updateField} onToggleArrayValue={toggleArrayValue} onChangeSocialHandle={handleSocialHandleChange}/>);
    return (<PageSkeletonBoundary loading={isInitialLoading} loadingContent={<ProposalsPageSkeleton />}>
      <ProposalsPageMainView wizardRef={wizardRef} submissionAnnouncement={submissionAnnouncement} clientName={selectedClient?.name ?? null} workflow={proposalWorkflow} viewState={proposalViewState} formState={formState} draftId={draftId} selectedClientId={selectedClientId} onApplyTemplate={handleSelectTemplate} onVersionRestored={handleVersionRestored} onStartProposal={isPreviewMode ? handleStartPreviewProposal : handleStartProposal} displayedProposals={displayedProposals} displayedDraftId={displayedDraftId} proposalHistoryWorkflow={proposalHistoryWorkflow} proposalHistoryCapabilities={proposalHistoryCapabilities} proposalsQueryError={proposalsQueryError} deletingProposalId={deletingProposalId} onRefresh={isPreviewMode ? handlePreviewRefresh : handleRefreshProposals} onResume={handleResumeProposalInModal} onRequestDelete={isPreviewMode ? handlePreviewRequestDelete : requestDeleteProposal} downloadingDeckId={downloadingDeckId} onDownloadDeck={isPreviewMode ? handlePreviewDownloadDeck : handleDownloadDeck} onCreateNew={isPreviewMode ? handleStartPreviewProposal : handleStartProposal} proposalPendingDelete={proposalPendingDelete} onDeleteDialogChange={handleDeleteDialogChange} onConfirmDelete={handleConfirmDeleteProposal} activeDeckStage={activeDeckStage} onCloseWizard={handleCloseWizard} summary={summary} presentationDeck={presentationDeck} deckDownloadUrl={deckDownloadUrl} activeProposalIdForDeck={activeProposalIdForDeck} onResumeSubmission={handleContinueEditingInModal} onRegenerate={handleRegenerate} onRecheckDeck={handleRecheckDeck} steps={steps} currentStep={currentStep} autosaveStatus={autosaveStatus} stepContent={stepContent} onBack={handleBack} onNext={handleNext} onGoToStep={goToStep} validationMessages={Object.values(validationErrors)}/>
    </PageSkeletonBoundary>);
}
