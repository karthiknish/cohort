'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useMemo, useState } from 'react'
import type { ProposalDraft } from '@/types/proposals'
import type { ProposalFormData } from '@/lib/proposals'
import { useToast } from '@/shared/ui/use-toast'
import { useClientContext } from '@/shared/contexts/client-context'
import { usePreview } from '@/shared/contexts/preview-context'
import { DASHBOARD_THEME } from '@/lib/dashboard-theme'
import { getPreviewProposals } from '@/lib/preview-data'
import { ProposalStepContent } from './components/proposal-step-content'
import { DashboardSkeleton } from '@/features/dashboard/home/components/dashboard-skeleton'
import { ProposalHistory } from './components/proposal-history'
import { ProposalDeleteDialog } from './components/proposal-delete-dialog'
import { ProposalWizardHeader } from './components/proposal-wizard-header'
import { ProposalGenerationOverlay, DeckProgressOverlay, type DeckProgressStage } from './components/deck-progress-overlays'
import { ProposalMetrics } from './components/proposal-metrics'
import {
  ProposalBuilderOverlay,
  ProposalPageActions,
  ProposalPreviewModeSection,
  ProposalStartStateCard,
} from './components/proposal-page-sections'
import { stepRequiredFieldLabels } from './utils/form-steps'

// Extracted hooks
import {
  useProposalPageInteractions,
  useProposalWizard,
  useProposalDrafts,
  useProposalSubmission,
  useDeckPreparation,
} from './hooks'

function ProposalsPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const { selectedClientId, selectClient } = useClientContext()
  const { isPreviewMode } = usePreview()
  const [isWizardOpen, setIsWizardOpen] = useState(false)
  const clientIdParam = searchParams.get('clientId')

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
    handleBack,
  } = wizard

  // Draft management hook
  const drafts = useProposalDrafts({
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
  const handleNext = () => {
    if (isLastStep) {
      void submitProposal()
    } else {
      wizard.handleNext()
    }
  }

  // Summary for display
  const summary = useMemo(() => {
    if (submitted && lastSubmissionSnapshot) {
      return structuredClone(lastSubmissionSnapshot.form) as ProposalFormData
    }
    return structuredClone(formState) as ProposalFormData
  }, [formState, lastSubmissionSnapshot, submitted])

  const activeDeckStage: DeckProgressStage = deckProgressStage ?? 'polling'
  const previewProposals = getPreviewProposals(selectedClientId ?? null)

  const {
    handleSelectTemplate,
    handleVersionRestored,
    handleStartProposal,
    handleResumeProposalInModal,
    handleContinueEditingInModal,
    handlePreviewRefresh,
    handlePreviewResume,
    handlePreviewRequestDelete,
    handlePreviewDownloadDeck,
    handlePreviewCreateNew,
  } = useProposalPageInteractions({
    toast,
    routerPush: router.push,
    setIsWizardOpen,
    setFormState,
    setCurrentStep,
    handleCreateNewProposal,
    handleResumeProposal,
    handleContinueEditingFromSnapshot,
  })

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

  if (isPreviewMode) {
    const previewDraftId = previewProposals.find((proposal) => proposal.status === 'draft')?.id ?? null

    return (
      <div ref={wizardRef} className={DASHBOARD_THEME.layout.container}>
        <ProposalPreviewModeSection
          previewProposals={previewProposals}
          previewDraftId={previewDraftId}
          onRefreshPreview={handlePreviewRefresh}
          onResume={handlePreviewResume}
          onRequestDelete={handlePreviewRequestDelete}
          onDownloadDeck={handlePreviewDownloadDeck}
          onCreateNew={handlePreviewCreateNew}
        />
      </div>
    )
  }

  return (
    <div ref={wizardRef} className={DASHBOARD_THEME.layout.container}>
      <div className={DASHBOARD_THEME.layout.header}>
        <ProposalWizardHeader />
        <ProposalPageActions
          currentFormData={formState}
          draftId={draftId}
          isSubmitting={isSubmitting}
          selectedClientId={selectedClientId}
          isCreatingDraft={isCreatingDraft}
          onApplyTemplate={handleSelectTemplate}
          onVersionRestored={handleVersionRestored}
          onStartProposal={handleStartProposal}
        />
      </div>

      <ProposalMetrics proposals={proposals} isLoading={isLoadingProposals} />

      {!isWizardOpen && (
        <ProposalStartStateCard
          canStart={Boolean(selectedClientId)}
          isCreatingDraft={isCreatingDraft}
          onStartProposal={handleStartProposal}
        />
      )}

      <ProposalHistory
        proposals={proposals}
        draftId={draftId}
        isLoading={isLoadingProposals}
        deletingProposalId={deletingProposalId}
        onRefresh={() => void refreshProposals().then(setProposals)}
        onResume={(proposal: ProposalDraft, forceEdit?: boolean) => handleResumeProposalInModal(proposal, forceEdit)}
        onRequestDelete={requestDeleteProposal}
        isGenerating={isSubmitting}
        downloadingDeckId={downloadingDeckId}
        onDownloadDeck={handleDownloadDeck}
        onCreateNew={handleStartProposal}
        canCreate={Boolean(selectedClientId)}
        isCreating={isCreatingDraft}
      />
      <ProposalDeleteDialog
        open={isDeleteDialogOpen}
        isDeleting={Boolean(deletingProposalId)}
        proposalName={proposalPendingDelete?.clientName ?? proposalPendingDelete?.id ?? null}
        onOpenChange={handleDeleteDialogChange}
        onConfirm={() => {
          if (proposalPendingDelete) {
            void handleDeleteProposal(proposalPendingDelete)
          }
        }}
      />
      <ProposalGenerationOverlay isSubmitting={isSubmitting} isPresentationReady={isPresentationReady} />
      <DeckProgressOverlay stage={activeDeckStage} isVisible={Boolean(downloadingDeckId && !isSubmitting)} />

      <ProposalBuilderOverlay
        open={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        isBootstrapping={isBootstrapping}
        submitted={submitted}
        summary={summary}
        presentationDeck={presentationDeck}
        deckDownloadUrl={deckDownloadUrl}
        activeProposalIdForDeck={activeProposalIdForDeck}
        canResumeSubmission={canResumeSubmission}
        onResumeSubmission={handleContinueEditingInModal}
        isSubmitting={isSubmitting}
        onRecheckDeck={handleRecheckDeck}
        isRecheckingDeck={isRecheckingDeck}
        steps={steps}
        currentStep={currentStep}
        draftId={draftId}
        autosaveStatus={autosaveStatus}
        stepContent={stepContent}
        onBack={handleBack}
        onNext={handleNext}
        isFirstStep={isFirstStep}
        isLastStep={isLastStep}
        validationMessages={Object.values(validationErrors)}
        requiredFieldLabels={stepRequiredFieldLabels[step.id]}
      />
    </div>
  )
}

export default function ProposalsPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <ProposalsPageContent />
    </Suspense>
  )
}
