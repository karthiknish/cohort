'use client'


import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import type { ProposalDraft } from '@/types/proposals'
import type { ProposalFormData } from '@/lib/proposals'
import { useToast } from '@/shared/ui/use-toast'
import { can } from '@/lib/access-control/dashboard-access'
import { useAuth } from '@/shared/contexts/auth-context'
import { useClientContext } from '@/shared/contexts/client-context'
import { usePreview } from '@/shared/contexts/preview-context'
import { BoneyardSkeletonBoundary } from '@/shared/ui/boneyard-skeleton-boundary'
import { getPreviewProposals } from '@/lib/preview-data'
import { ProposalStepContent } from '../components/proposal-step-content'
import { type DeckProgressStage } from '../components/deck-progress-overlays'
import { ProposalsPageMainView } from '../components/proposals-page-content-sections'
import { createInitialProposalFormState } from '../utils/form-steps'
import { useKeyboardShortcuts } from '@/shared/hooks/use-keyboard-shortcuts'
import { useDeckPreparation } from './use-deck-preparation'
import { useProposalDrafts } from './use-proposal-drafts'
import { useProposalPageInteractions } from './use-proposal-page-interactions'
import { useProposalSubmission } from './use-proposal-submission'
import { useProposalWizard } from './use-proposal-wizard'


export function useProposalsPageContent() {
  const { push } = useRouter()
  const { get } = useSearchParams()
  const { toast } = useToast()
  const { user } = useAuth()
  const { selectedClient, selectedClientId, selectClient } = useClientContext()
  const { isPreviewMode } = usePreview()
  const canManageProposals = isPreviewMode || can(user?.role, 'proposals.manage')
  const [isWizardOpen, setIsWizardOpen] = useState(false)
  const clientIdParam = get('clientId')

  // Handle URL params for client selection
  useEffect(() => {
    if (clientIdParam) {
      selectClient(clientIdParam)
    }
  }, [clientIdParam, selectClient])

  useEffect(() => {
    if (!isWizardOpen) {
      return
    }
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [isWizardOpen])

  // Local state for proposals list (needed by deck preparation)
  const [proposals, setProposals] = useState<ProposalDraft[]>([])

  // Wizard hook - form state and step navigation
  const wizard = useProposalWizard()
  const {
    currentStep,
    formState,
    validationErrors,
    steps,
    step,
    isFirstStep,
    isLastStep,
    hasPersistableData,
    setCurrentStep,
    setFormState,
    updateField,
    toggleArrayValue,
    handleSocialHandleChange,
    clearErrors,
    undo,
    redo,
    canUndo,
    canRedo,
    handleBack,
    goToStep,
  } = wizard

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
  })
  const {
    draftId,
    isLoadingProposals,
    isCreatingDraft,
    isBootstrapping,
    autosaveStatus,
    deletingProposalId,
    proposalPendingDelete,
    isDeleteDialogOpen,
    setDraftId,
    setAutosaveStatus,
    refreshProposals,
    ensureDraftId,
    saveDraftNow,
    handleCreateNewProposal,
    handleResumeProposal,
    handleDeleteProposal,
    requestDeleteProposal,
    handleDeleteDialogChange,
    wizardRef,
  } = drafts

  // Submission hook - AI generation and deck polling
  const submission = useProposalSubmission({
    draftId,
    formState,
    currentStep,
    ensureDraftId,
    refreshProposals: async () => {
      const result = await refreshProposals()
      setProposals(result)
      return result
    },
    setDraftId,
    setFormState,
    setCurrentStep,
    setAutosaveStatus,
    clearErrors,
    steps,
  })
  const {
    isSubmitting,
    isRecheckingDeck,
    submitted,
    isPresentationReady,
    presentationDeck,
    lastSubmissionSnapshot,
    submitProposal,
    handleContinueEditingFromSnapshot,
    handleRecheckDeck,
    canResumeSubmission,
    deckDownloadUrl,
    activeProposalIdForDeck,
  } = submission

  // Deck preparation hook
  const deckPrep = useDeckPreparation({
    draftId,
    refreshProposals: async () => {
      const result = await refreshProposals()
      setProposals(result)
      return result
    },
    setPresentationDeck: submission.setPresentationDeck,
    setAiSuggestions: submission.setAiSuggestions,
    setProposals,
    presentationDeck,
  })
  const { downloadingDeckId, deckProgressStage, handleDownloadDeck } = deckPrep
  const hasSelectedClient = Boolean(selectedClientId)

  // Initial load of proposals
  useEffect(() => {
    const loadProposals = async () => {
      const result = await refreshProposals()
      setProposals(result)
    }
    if (!isBootstrapping && hasSelectedClient) {
      void loadProposals()
    }
  }, [hasSelectedClient, isBootstrapping, refreshProposals])

  // Handle next button with submit
  const handleNext = useCallback(() => {
    if (isLastStep) {
      void submitProposal()
    } else {
      wizard.handleNext()
    }
  }, [isLastStep, submitProposal, wizard])

  // Summary for display
  const summary = useMemo(() => {
    if (submitted && lastSubmissionSnapshot) {
      return structuredClone(lastSubmissionSnapshot.form) as ProposalFormData
    }
    return structuredClone(formState) as ProposalFormData
  }, [formState, lastSubmissionSnapshot, submitted])

  const activeDeckStage: DeckProgressStage = deckProgressStage ?? 'polling'
  const previewProposals = getPreviewProposals(selectedClientId ?? null)
  const previewDraftId = previewProposals.find((proposal) => proposal.status === 'draft')?.id ?? null
  const displayedProposals = isPreviewMode ? previewProposals : proposals
  const displayedDraftId = isPreviewMode ? previewDraftId : draftId
  const displayedLoadingState = isPreviewMode ? false : isLoadingProposals
  const isInitialLoading = displayedLoadingState && displayedProposals.length === 0 && !isWizardOpen
  const handleStartPreviewProposal = useCallback(() => {
    const initialForm = createInitialProposalFormState()

    submission.setSubmitted(false)
    submission.setPresentationDeck(null)
    submission.setAiSuggestions(null)
    submission.setLastSubmissionSnapshot(null)
    setDraftId(null)
    setAutosaveStatus('idle')
    setFormState({
      ...initialForm,
      company: {
        ...initialForm.company,
        name: selectedClient?.name ?? initialForm.company.name,
      },
    }, { resetHistory: true })
    setCurrentStep(0)
    setIsWizardOpen(true)
  }, [selectedClient?.name, setAutosaveStatus, setCurrentStep, setDraftId, setFormState, submission])

  useKeyboardShortcuts(
    [
      {
        combo: 'mod+s',
        description: 'Save draft now',
        callback: () => {
          void saveDraftNow({ showToast: true })
        },
        enabled: isWizardOpen && !submitted && !isPreviewMode,
      },
      {
        combo: 'mod+z',
        description: 'Undo last proposal edit',
        callback: () => {
          undo()
        },
        enabled: isWizardOpen && !submitted && canUndo,
      },
      {
        combo: 'mod+shift+z',
        description: 'Redo proposal edit',
        callback: () => {
          redo()
        },
        enabled: isWizardOpen && !submitted && canRedo,
      },
    ],
    {
      enabled: isWizardOpen,
      allowInInput: true,
    }
  )

  const {
    handleSelectTemplate,
    handleVersionRestored,
    handleStartProposal,
    handleResumeProposalInModal,
    handleContinueEditingInModal,
    handlePreviewRefresh,
    handlePreviewRequestDelete,
    handlePreviewDownloadDeck,
  } = useProposalPageInteractions({
    toast,
    routerPush: push,
    setIsWizardOpen,
    setFormState,
    setCurrentStep,
    handleCreateNewProposal,
    handleResumeProposal,
    handleContinueEditingFromSnapshot,
  })

  const handleRefreshProposals = useCallback(() => {
    void refreshProposals().then(setProposals)
  }, [refreshProposals])

  const handleConfirmDeleteProposal = useCallback(() => {
    if (proposalPendingDelete) {
      void handleDeleteProposal(proposalPendingDelete)
    }
  }, [handleDeleteProposal, proposalPendingDelete])

  const handleCloseWizard = useCallback(() => {
    setIsWizardOpen(false)
  }, [])

  const submissionAnnouncement = useMemo(() => {
    if (isSubmitting) {
      return 'Generating proposal deck. This can take a few minutes.'
    }

    if (isRecheckingDeck) {
      return 'Rechecking proposal deck status.'
    }

    if (submitted && isPresentationReady) {
      return 'Proposal deck is ready.'
    }

    return ''
  }, [isPresentationReady, isRecheckingDeck, isSubmitting, submitted])

  const proposalHistoryWorkflow = useMemo(
    () => ({
      loading: displayedLoadingState,
      generating: isSubmitting,
      creating: isCreatingDraft,
    }),
    [displayedLoadingState, isCreatingDraft, isSubmitting],
  )

  const proposalHistoryCapabilities = useMemo(
    () => ({
      canManage: canManageProposals,
      canCreate: canManageProposals && Boolean(selectedClientId),
    }),
    [canManageProposals, selectedClientId],
  )

  const proposalWorkflow = useMemo(
    () => ({
      canManageProposals,
      isSubmitting,
      isCreatingDraft,
      isPreviewMode,
    }),
    [canManageProposals, isCreatingDraft, isPreviewMode, isSubmitting],
  )

  const proposalViewState = useMemo(
    () => ({
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
    }),
    [
      canResumeSubmission,
      displayedLoadingState,
      isBootstrapping,
      isDeleteDialogOpen,
      isFirstStep,
      isLastStep,
      isPresentationReady,
      isRecheckingDeck,
      isWizardOpen,
      submitted,
    ],
  )

  const stepContent = useMemo(
    () => (
    <ProposalStepContent
      stepId={step.id}
      formState={formState}
      summary={summary}
      validationErrors={validationErrors}
      onUpdateField={updateField}
      onToggleArrayValue={toggleArrayValue}
      onChangeSocialHandle={handleSocialHandleChange}
    />
    ),
    [formState, handleSocialHandleChange, step.id, summary, toggleArrayValue, updateField, validationErrors]
  )

  return (
    <BoneyardSkeletonBoundary
      name="dashboard-proposals-page"
      loading={isInitialLoading}
    >
      <ProposalsPageMainView
        wizardRef={wizardRef}
        submissionAnnouncement={submissionAnnouncement}
        clientName={selectedClient?.name ?? null}
        workflow={proposalWorkflow}
        viewState={proposalViewState}
        formState={formState}
        draftId={draftId}
        selectedClientId={selectedClientId}
        onApplyTemplate={handleSelectTemplate}
        onVersionRestored={handleVersionRestored}
        onStartProposal={isPreviewMode ? handleStartPreviewProposal : handleStartProposal}
        displayedProposals={displayedProposals}
        displayedDraftId={displayedDraftId}
        proposalHistoryWorkflow={proposalHistoryWorkflow}
        proposalHistoryCapabilities={proposalHistoryCapabilities}
        deletingProposalId={deletingProposalId}
        onRefresh={isPreviewMode ? handlePreviewRefresh : handleRefreshProposals}
        onResume={handleResumeProposalInModal}
        onRequestDelete={isPreviewMode ? handlePreviewRequestDelete : requestDeleteProposal}
        downloadingDeckId={downloadingDeckId}
        onDownloadDeck={isPreviewMode ? handlePreviewDownloadDeck : handleDownloadDeck}
        onCreateNew={isPreviewMode ? handleStartPreviewProposal : handleStartProposal}
        proposalPendingDelete={proposalPendingDelete}
        onDeleteDialogChange={handleDeleteDialogChange}
        onConfirmDelete={handleConfirmDeleteProposal}
        activeDeckStage={activeDeckStage}
        onCloseWizard={handleCloseWizard}
        summary={summary}
        presentationDeck={presentationDeck}
        deckDownloadUrl={deckDownloadUrl}
        activeProposalIdForDeck={activeProposalIdForDeck}
        onResumeSubmission={handleContinueEditingInModal}
        onRecheckDeck={handleRecheckDeck}
        steps={steps}
        currentStep={currentStep}
        autosaveStatus={autosaveStatus}
        stepContent={stepContent}
        onBack={handleBack}
        onNext={handleNext}
        onGoToStep={goToStep}
        validationMessages={Object.values(validationErrors)}
      />
    </BoneyardSkeletonBoundary>
  )
}
