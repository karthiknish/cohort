'use client'

import { useCallback } from 'react'

import { cn } from '@/lib/utils'
import { DASHBOARD_THEME } from '@/lib/dashboard-theme'
import type { ProposalFormData } from '@/lib/proposals'
import type { ProposalDraft } from '@/types/proposals'
import { FadeIn } from '@/shared/ui/animate-in'
import { LiveRegion } from '@/shared/ui/live-region'

import { DeckProgressOverlay, ProposalGenerationOverlay, type DeckProgressStage } from './deck-progress-overlays'
import { ProposalDeleteDialog } from './proposal-delete-dialog'
import { ProposalHistory } from './proposal-history'
import { ProposalMetrics } from './proposal-metrics'
import {
  ProposalBuilderOverlay,
  ProposalPageActions,
  ProposalStartStateCard,
} from './proposal-page-sections'
import { ProposalWizardHeader } from './proposal-wizard-header'
import type { ProposalStep } from './proposal-step-indicator'

export type ProposalsPageWorkflowState = {
  canManageProposals: boolean
  isSubmitting: boolean
  isCreatingDraft: boolean
  isPreviewMode: boolean
}

export type ProposalsPageViewState = {
  displayedLoadingState: boolean
  isWizardOpen: boolean
  isDeleteDialogOpen: boolean
  isPresentationReady: boolean
  isBootstrapping: boolean
  submitted: boolean
  canResumeSubmission: boolean
  isRecheckingDeck: boolean
  isFirstStep: boolean
  isLastStep: boolean
}

export function ProposalsPageHeroSection({
  clientName,
  workflow,
  formState,
  draftId,
  selectedClientId,
  onApplyTemplate,
  onVersionRestored,
  onStartProposal,
}: {
  clientName: string | null
  workflow: ProposalsPageWorkflowState
  formState: ProposalFormData
  draftId: string | null
  selectedClientId: string | null
  onApplyTemplate: (templateFormData: ProposalFormData) => void
  onVersionRestored: (restoredFormData: ProposalFormData) => void
  onStartProposal: () => void
}) {
  const { canManageProposals, isSubmitting, isCreatingDraft } = workflow
  return (
    <section
      className={cn(
        'relative overflow-hidden rounded-2xl border border-muted/40 bg-linear-to-br from-primary/[0.07] via-background to-info/[0.05] p-5 shadow-sm sm:p-6',
      )}
    >
      <div
        className="pointer-events-none absolute -left-8 top-0 size-32 rounded-full bg-primary/10 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-10 -bottom-8 size-36 rounded-full bg-info/10 blur-3xl"
        aria-hidden
      />
      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <ProposalWizardHeader clientName={clientName} />
        <ProposalPageActions
          canManage={canManageProposals}
          currentFormData={formState}
          draftId={draftId}
          isSubmitting={isSubmitting}
          selectedClientId={selectedClientId}
          isCreatingDraft={isCreatingDraft}
          onApplyTemplate={onApplyTemplate}
          onVersionRestored={onVersionRestored}
          onStartProposal={onStartProposal}
        />
      </div>
    </section>
  )
}

export function ProposalsPageMainView({
  wizardRef,
  submissionAnnouncement,
  clientName,
  workflow,
  viewState,
  formState,
  draftId,
  selectedClientId,
  onApplyTemplate,
  onVersionRestored,
  onStartProposal,
  displayedProposals,
  displayedDraftId,
  proposalHistoryWorkflow,
  proposalHistoryCapabilities,
  deletingProposalId,
  onRefresh,
  onResume,
  onRequestDelete,
  downloadingDeckId,
  onDownloadDeck,
  onCreateNew,
  proposalPendingDelete,
  onDeleteDialogChange,
  onConfirmDelete,
  activeDeckStage,
  onCloseWizard,
  summary,
  presentationDeck,
  deckDownloadUrl,
  activeProposalIdForDeck,
  onResumeSubmission,
  onRecheckDeck,
  steps,
  currentStep,
  autosaveStatus,
  stepContent,
  onBack,
  onNext,
  onGoToStep,
  validationMessages,
}: {
  wizardRef: React.RefObject<HTMLDivElement | null>
  submissionAnnouncement: string
  clientName: string | null
  workflow: ProposalsPageWorkflowState
  viewState: ProposalsPageViewState
  formState: ProposalFormData
  draftId: string | null
  selectedClientId: string | null
  onApplyTemplate: (templateFormData: ProposalFormData) => void
  onVersionRestored: (restoredFormData: ProposalFormData) => void
  onStartProposal: () => void
  displayedProposals: ProposalDraft[]
  displayedDraftId: string | null
  proposalHistoryWorkflow: { loading: boolean; generating: boolean; creating: boolean }
  proposalHistoryCapabilities: { canManage: boolean; canCreate: boolean }
  deletingProposalId: string | null
  onRefresh: () => void
  onResume: (proposal: ProposalDraft, forceEdit?: boolean) => void
  onRequestDelete: (proposal: ProposalDraft) => void
  downloadingDeckId: string | null
  onDownloadDeck: (proposal: ProposalDraft) => void
  onCreateNew: () => void
  proposalPendingDelete: ProposalDraft | null
  onDeleteDialogChange: (open: boolean) => void
  onConfirmDelete: () => void
  activeDeckStage: DeckProgressStage
  onCloseWizard: () => void
  summary: ProposalFormData
  presentationDeck: unknown
  deckDownloadUrl: string | null
  activeProposalIdForDeck: string | null
  onResumeSubmission: () => void
  onRecheckDeck: () => void | Promise<void>
  steps: ProposalStep[]
  currentStep: number
  autosaveStatus: 'idle' | 'saving' | 'saved' | 'error'
  stepContent: React.ReactNode
  onBack: () => void
  onNext: () => void
  onGoToStep: (step: number) => void
  validationMessages: string[]
}) {
  const { canManageProposals, isPreviewMode, isSubmitting } = workflow
  const {
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
  } = viewState
  const handleRecheckDeck = useCallback(() => Promise.resolve(onRecheckDeck()), [onRecheckDeck])

  return (
    <div ref={wizardRef} className={DASHBOARD_THEME.layout.container}>
      <LiveRegion message={submissionAnnouncement} />

      <ProposalsPageHeroSection
        clientName={clientName}
        workflow={workflow}
        formState={formState}
        draftId={draftId}
        selectedClientId={selectedClientId}
        onApplyTemplate={onApplyTemplate}
        onVersionRestored={onVersionRestored}
        onStartProposal={onStartProposal}
      />

      <FadeIn>
        <ProposalMetrics proposals={displayedProposals} isLoading={displayedLoadingState} />
      </FadeIn>

      {!isWizardOpen ? (
        <FadeIn>
          <ProposalStartStateCard
            canManage={canManageProposals}
            canStart={canManageProposals && Boolean(selectedClientId)}
            blockedHint={
              selectedClientId
                ? null
                : 'Pick a client from the workspace switcher in the header. Proposals are always created for the active client.'
            }
          />
        </FadeIn>
      ) : null}

      <ProposalHistory
        proposals={displayedProposals}
        draftId={displayedDraftId}
        workflow={proposalHistoryWorkflow}
        capabilities={proposalHistoryCapabilities}
        deletingProposalId={deletingProposalId}
        onRefresh={onRefresh}
        onResume={onResume}
        onRequestDelete={onRequestDelete}
        downloadingDeckId={downloadingDeckId}
        onDownloadDeck={onDownloadDeck}
        onCreateNew={onCreateNew}
      />
      <ProposalDeleteDialog
        open={isDeleteDialogOpen}
        isDeleting={Boolean(deletingProposalId)}
        proposalName={proposalPendingDelete?.clientName ?? proposalPendingDelete?.id ?? null}
        onOpenChange={onDeleteDialogChange}
        onConfirm={onConfirmDelete}
      />
      <ProposalGenerationOverlay
        isSubmitting={isSubmitting && !isWizardOpen}
        isPresentationReady={isPresentationReady && !isWizardOpen}
      />
      <DeckProgressOverlay stage={activeDeckStage} isVisible={Boolean(downloadingDeckId && !isSubmitting)} />

      <ProposalBuilderOverlay
        open={isWizardOpen}
        onClose={onCloseWizard}
        isBootstrapping={isBootstrapping}
        submitted={submitted}
        isPresentationReady={isPresentationReady}
        summary={summary}
        presentationDeck={presentationDeck}
        deckDownloadUrl={deckDownloadUrl}
        activeProposalIdForDeck={activeProposalIdForDeck}
        canResumeSubmission={canResumeSubmission}
        onResumeSubmission={onResumeSubmission}
        isSubmitting={isSubmitting}
        onRecheckDeck={handleRecheckDeck}
        isRecheckingDeck={isRecheckingDeck}
        steps={steps}
        currentStep={currentStep}
        draftId={draftId}
        autosaveStatus={autosaveStatus}
        stepContent={stepContent}
        onBack={onBack}
        onNext={onNext}
        onGoToStep={onGoToStep}
        isFirstStep={isFirstStep}
        isLastStep={isLastStep}
        validationMessages={validationMessages}
      />
    </div>
  )
}
