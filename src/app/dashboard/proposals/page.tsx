'use client'

import { useSearchParams, useRouter } from 'next/navigation'
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
  const router = useRouter()
  const { toast } = useToast()
  const { selectedClient, selectedClientId, selectClient } = useClientContext()
  const [isWizardOpen, setIsWizardOpen] = useState(false)

  // Handle URL params for client selection
  useEffect(() => {
    const clientIdParam = searchParams.get('clientId')
    if (clientIdParam && clientIdParam !== selectedClientId) {
      selectClient(clientIdParam)
    }
  }, [searchParams, selectedClientId, selectClient])

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

  const handleStartProposal = async () => {
    await handleCreateNewProposal()
    setIsWizardOpen(true)
  }

  const handleResumeProposalInModal = (proposal: ProposalDraft, forceEdit?: boolean) => {
    if (proposal.status === 'ready' && !forceEdit) {
      router.push(`/dashboard/proposals/${proposal.id}/deck`)
      return
    }
    handleResumeProposal(proposal, forceEdit)
    setIsWizardOpen(true)
  }

  const handleContinueEditingInModal = async () => {
    await handleContinueEditingFromSnapshot()
    setIsWizardOpen(true)
  }

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
            onClick={handleStartProposal}
            disabled={!selectedClientId || isCreatingDraft}
            className="shrink-0 shadow-sm transition-all hover:shadow-md"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Proposal
          </Button>
        </div>
      </div>

      <ProposalMetrics proposals={proposals} isLoading={isLoadingProposals} />

      {!isWizardOpen && (
        <Card className="border-dashed border-primary/30 bg-primary/5">
          <CardHeader>
            <div className="flex flex-col gap-2">
              <h3 className="text-lg font-semibold text-foreground">Start a new proposal</h3>
              <p className="text-sm text-muted-foreground">Open the full-screen proposal builder to get started.</p>
            </div>
          </CardHeader>
          <CardContent>
            <Button onClick={handleStartProposal} disabled={!selectedClientId || isCreatingDraft}>
              Start Proposal
            </Button>
          </CardContent>
        </Card>
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

      {isWizardOpen && (
        <div className="fixed inset-0 z-[2000] isolate bg-background">
          <div className="flex h-full flex-col overflow-hidden">
            <div className="flex items-center justify-between border-b border-muted/30 px-6 py-4">
              <div className="space-y-1">
                <h2 className="text-xl font-semibold">Proposal Builder</h2>
                <p className="text-sm text-muted-foreground">Complete the steps to generate your proposal deck.</p>
              </div>
              <Button variant="ghost" onClick={() => setIsWizardOpen(false)}>
                Close
              </Button>
            </div>
            <div className="flex-1 overflow-hidden px-4 py-4 sm:px-6 sm:py-6">
              <div className="h-full space-y-4">
                {isBootstrapping ? (
                  <Card className="border-muted/60 bg-background">
                    <CardContent className="p-6">
                      <DashboardSkeleton showStepIndicator />
                    </CardContent>
                  </Card>
                ) : submitted ? (
                  <Card className="border-muted/60 bg-background">
                    <CardContent className="p-6">
                      <ProposalSubmittedPanel
                        summary={summary}
                        presentationDeck={presentationDeck}
                        deckDownloadUrl={deckDownloadUrl}
                        activeProposalIdForDeck={activeProposalIdForDeck}
                        canResumeSubmission={canResumeSubmission}
                        onResumeSubmission={handleContinueEditingInModal}
                        isSubmitting={isSubmitting}
                        onRecheckDeck={handleRecheckDeck}
                        isRecheckingDeck={false}
                      />
                    </CardContent>
                  </Card>
                ) : (
                  <div className="h-full flex flex-col space-y-4">
                    <div className="shrink-0">
                      <ProposalStepIndicator steps={steps} currentStep={currentStep} submitted={submitted} />
                    </div>
                    <Card className="flex-1 overflow-auto border-muted/60 bg-background">
                      <CardContent className="p-4 sm:p-6">
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
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
