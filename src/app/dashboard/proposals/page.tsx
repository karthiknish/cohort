'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
} from '@/components/ui/card'
import type { ProposalDraft, ProposalPresentationDeck } from '@/types/proposals'
import type { ProposalFormData } from '@/lib/proposals'
import { useToast } from '@/components/ui/use-toast'
import { useClientContext } from '@/contexts/client-context'
import { ProposalStepContent } from './components/proposal-step-content'
import { ProposalStepIndicator } from './components/proposal-step-indicator'
import { DashboardSkeleton } from '@/app/dashboard/components/dashboard-skeleton'
import { ProposalHistory } from './components/proposal-history'
import { ProposalDeleteDialog } from './components/proposal-delete-dialog'
import { ProposalWizardHeader } from './components/proposal-wizard-header'
import { ProposalSubmittedPanel } from './components/proposal-submitted-panel'
import { ProposalDraftPanel } from './components/proposal-draft-panel'
import { ProposalGenerationOverlay, DeckProgressOverlay, type DeckProgressStage } from './components/deck-progress-overlays'
import { ProposalTemplateSelector } from './components/proposal-template-selector'
import { ProposalVersionHistory } from './components/proposal-version-history'
import { ProposalMetrics } from './components/proposal-metrics'

// Extracted hooks
import {
  useProposalWizard,
  useProposalDrafts,
  useProposalSubmission,
  useDeckPreparation,
  type SubmissionSnapshot,
} from './hooks'

export default function ProposalsPage() {
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const { selectedClient, selectedClientId, selectClient } = useClientContext()

  // Handle URL params for client selection
  useEffect(() => {
    const clientIdParam = searchParams.get('clientId')
    if (clientIdParam && clientIdParam !== selectedClientId) {
      selectClient(clientIdParam)
    }
  }, [searchParams, selectedClientId, selectClient])

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

  // Sync proposals from drafts hook to local state
  useEffect(() => {
    // This is handled inside the drafts hook via the refreshProposals callback
  }, [])

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
    submitted,
    isPresentationReady,
    presentationDeck,
    aiSuggestions,
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

  // Initial load of proposals
  useEffect(() => {
    const loadProposals = async () => {
      const result = await refreshProposals()
      setProposals(result)
    }
    if (!isBootstrapping && selectedClientId) {
      void loadProposals()
    }
  }, [isBootstrapping, selectedClientId, refreshProposals])

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

  const handleSelectTemplate = (templateFormData: ProposalFormData) => {
    setFormState(templateFormData)
    setCurrentStep(0)
    toast({
      title: 'Template applied',
      description: 'The template has been applied to your proposal. You can customize it as needed.',
    })
  }

  const handleVersionRestored = (restoredFormData: ProposalFormData) => {
    setFormState(restoredFormData)
    setCurrentStep(0)
    toast({
      title: 'Version restored',
      description: 'The proposal has been restored to the selected version.',
    })
  }

  const renderStepContent = () => (
    <ProposalStepContent
      stepId={step.id}
      formState={formState}
      summary={summary}
      validationErrors={validationErrors}
      onUpdateField={updateField}
      onToggleArrayValue={toggleArrayValue}
      onChangeSocialHandle={handleSocialHandleChange}
    />
  )

  return (
    <div ref={wizardRef} className="space-y-6">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
        <ProposalWizardHeader />
        <div className="flex flex-wrap items-center gap-3">
          <ProposalTemplateSelector
            currentFormData={formState}
            onApplyTemplate={handleSelectTemplate}
          />
          <ProposalVersionHistory
            proposalId={draftId}
            currentFormData={formState}
            onVersionRestored={handleVersionRestored}
            disabled={!draftId || isSubmitting}
          />
          <Button
            onClick={handleCreateNewProposal}
            disabled={!selectedClientId || isCreatingDraft}
            className="shrink-0 shadow-sm transition-all hover:shadow-md"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Proposal
          </Button>
        </div>
      </div>

      <ProposalMetrics proposals={proposals} isLoading={isLoadingProposals} />

      <Card className="border-muted/60 bg-background">
        <CardHeader>
          <ProposalStepIndicator steps={steps} currentStep={currentStep} submitted={submitted} />
        </CardHeader>
        <CardContent className="space-y-6">
          {isBootstrapping ? (
            <DashboardSkeleton showStepIndicator />
          ) : submitted ? (
            <ProposalSubmittedPanel
              summary={summary}
              presentationDeck={presentationDeck}
              deckDownloadUrl={deckDownloadUrl}
              activeProposalIdForDeck={activeProposalIdForDeck}
              canResumeSubmission={canResumeSubmission}
              onResumeSubmission={handleContinueEditingFromSnapshot}
              isSubmitting={isSubmitting}
              onRecheckDeck={handleRecheckDeck}
              isRecheckingDeck={false}
            />
          ) : (
            <ProposalDraftPanel
              draftId={draftId}
              autosaveStatus={autosaveStatus}
              stepContent={renderStepContent()}
              onBack={handleBack}
              onNext={handleNext}
              isFirstStep={isFirstStep}
              isLastStep={isLastStep}
              currentStep={currentStep}
              totalSteps={steps.length}
              isSubmitting={isSubmitting}
            />
          )}
        </CardContent>
      </Card>

      <ProposalHistory
        proposals={proposals}
        draftId={draftId}
        isLoading={isLoadingProposals}
        deletingProposalId={deletingProposalId}
        onRefresh={() => void refreshProposals().then(setProposals)}
        onResume={handleResumeProposal}
        onRequestDelete={requestDeleteProposal}
        isGenerating={isSubmitting}
        downloadingDeckId={downloadingDeckId}
        onDownloadDeck={handleDownloadDeck}
        onCreateNew={handleCreateNewProposal}
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
    </div>
  )
}
