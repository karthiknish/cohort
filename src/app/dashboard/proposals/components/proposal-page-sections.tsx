'use client'

import { Plus } from 'lucide-react'

import { DashboardSkeleton } from '@/app/dashboard/components/dashboard-skeleton'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { getButtonClasses } from '@/lib/dashboard-theme'
import type { ProposalFormData } from '@/lib/proposals'
import { cn } from '@/lib/utils'
import type { ProposalDraft } from '@/types/proposals'

import { ProposalDraftPanel } from './proposal-draft-panel'
import { ProposalHistory } from './proposal-history'
import { ProposalMetrics } from './proposal-metrics'
import { ProposalStepIndicator } from './proposal-step-indicator'
import { ProposalSubmittedPanel } from './proposal-submitted-panel'
import { ProposalTemplateSelector } from './proposal-template-selector'
import { ProposalVersionHistory } from './proposal-version-history'
import { ProposalWizardHeader } from './proposal-wizard-header'
import type { ProposalStepId } from './proposal-step-types'

export function ProposalPageActions(props: {
  currentFormData: ProposalFormData
  draftId: string | null
  isSubmitting: boolean
  selectedClientId: string | null
  isCreatingDraft: boolean
  onApplyTemplate: (templateFormData: ProposalFormData) => void
  onVersionRestored: (restoredFormData: ProposalFormData) => void
  onStartProposal: () => void
}) {
  const {
    currentFormData,
    draftId,
    isSubmitting,
    selectedClientId,
    isCreatingDraft,
    onApplyTemplate,
    onVersionRestored,
    onStartProposal,
  } = props

  return (
    <div className="flex flex-wrap items-center gap-3">
      <ProposalTemplateSelector currentFormData={currentFormData} onApplyTemplate={onApplyTemplate} />
      <ProposalVersionHistory
        proposalId={draftId}
        currentFormData={currentFormData}
        onVersionRestored={onVersionRestored}
        disabled={!draftId || isSubmitting}
      />
      <Button
        onClick={onStartProposal}
        disabled={!selectedClientId || isCreatingDraft}
        className={cn(getButtonClasses('primary'), 'shrink-0 shadow-sm transition-[color,background-color,border-color,text-decoration-color,fill,stroke,opacity,box-shadow,transform,filter,backdrop-filter] hover:shadow-md')}
      >
        <Plus className="mr-2 h-4 w-4" />
        New Proposal
      </Button>
    </div>
  )
}

export function ProposalStartStateCard(props: {
  canStart: boolean
  isCreatingDraft: boolean
  onStartProposal: () => void
}) {
  const { canStart, isCreatingDraft, onStartProposal } = props

  return (
    <Card className="border-dashed border-primary/30 bg-primary/5">
      <CardHeader>
        <div className="flex flex-col gap-2">
          <h3 className="text-lg font-semibold text-foreground">Start a new proposal</h3>
          <p className="text-sm text-muted-foreground">Open the full-screen proposal builder to get started.</p>
        </div>
      </CardHeader>
      <CardContent>
        <Button onClick={onStartProposal} disabled={!canStart || isCreatingDraft}>
          Start Proposal
        </Button>
      </CardContent>
    </Card>
  )
}

export function ProposalPreviewModeSection(props: {
  previewProposals: ProposalDraft[]
  previewDraftId: string | null
  onRefreshPreview: () => void
  onResume: (proposal: ProposalDraft) => void
  onRequestDelete: () => void
  onDownloadDeck: (proposal: ProposalDraft) => void
  onCreateNew: () => void
}) {
  const {
    previewProposals,
    previewDraftId,
    onRefreshPreview,
    onResume,
    onRequestDelete,
    onDownloadDeck,
    onCreateNew,
  } = props

  return (
    <>
      <div className="flex items-center justify-between">
        <ProposalWizardHeader />
        <Button disabled className={cn(getButtonClasses('primary'), 'shrink-0 opacity-70')}>
          <Plus className="mr-2 h-4 w-4" />
          Preview Mode
        </Button>
      </div>

      <Card className="border-dashed border-primary/30 bg-primary/5">
        <CardHeader>
          <div className="flex flex-col gap-2">
            <h3 className="text-lg font-semibold text-foreground">Sample proposal data</h3>
            <p className="text-sm text-muted-foreground">
              Preview mode shows representative proposal history, metrics, and deck previews. Editing and generation actions stay read-only.
            </p>
          </div>
        </CardHeader>
      </Card>

      <ProposalMetrics proposals={previewProposals} isLoading={false} />

      <ProposalHistory
        proposals={previewProposals}
        draftId={previewDraftId}
        isLoading={false}
        deletingProposalId={null}
        onRefresh={onRefreshPreview}
        onResume={onResume}
        onRequestDelete={onRequestDelete}
        isGenerating={false}
        downloadingDeckId={null}
        onDownloadDeck={onDownloadDeck}
        onCreateNew={onCreateNew}
        canCreate={false}
        isCreating={false}
      />
    </>
  )
}

export function ProposalBuilderOverlay(props: {
  open: boolean
  onClose: () => void
  isBootstrapping: boolean
  submitted: boolean
  summary: ProposalFormData
  presentationDeck: unknown
  deckDownloadUrl: string | null
  activeProposalIdForDeck: string | null
  canResumeSubmission: boolean
  onResumeSubmission: () => void
  isSubmitting: boolean
  onRecheckDeck: () => void
  isRecheckingDeck: boolean
  steps: Array<{ id: ProposalStepId; label: string; title: string; description: string }>
  currentStep: number
  draftId: string | null
  autosaveStatus: 'idle' | 'saving' | 'saved' | 'error'
  stepContent: React.ReactNode
  onBack: () => void
  onNext: () => void
  isFirstStep: boolean
  isLastStep: boolean
  validationMessages: string[]
  requiredFieldLabels: string[]
}) {
  const {
    open,
    onClose,
    isBootstrapping,
    submitted,
    summary,
    presentationDeck,
    deckDownloadUrl,
    activeProposalIdForDeck,
    canResumeSubmission,
    onResumeSubmission,
    isSubmitting,
    onRecheckDeck,
    isRecheckingDeck,
    steps,
    currentStep,
    draftId,
    autosaveStatus,
    stepContent,
    onBack,
    onNext,
    isFirstStep,
    isLastStep,
    validationMessages,
    requiredFieldLabels,
  } = props

  if (!open) return null

  const activeStep = steps[currentStep]

  return (
    <div className="fixed inset-0 z-[2000] isolate bg-background">
      <div className="flex h-full flex-col overflow-hidden">
        <div className="flex items-center justify-between border-b border-muted/30 px-6 py-4">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold">Proposal Builder</h2>
            <p className="text-sm text-muted-foreground">Complete the steps to generate your proposal deck.</p>
          </div>
          <Button variant="ghost" onClick={onClose}>Close</Button>
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
                    presentationDeck={presentationDeck as Parameters<typeof ProposalSubmittedPanel>[0]['presentationDeck']}
                    deckDownloadUrl={deckDownloadUrl}
                    activeProposalIdForDeck={activeProposalIdForDeck}
                    canResumeSubmission={canResumeSubmission}
                    onResumeSubmission={onResumeSubmission}
                    isSubmitting={isSubmitting}
                    onRecheckDeck={onRecheckDeck}
                    isRecheckingDeck={isRecheckingDeck}
                  />
                </CardContent>
              </Card>
            ) : (
              <div className="flex h-full flex-col space-y-4">
                <div className="shrink-0">
                  <ProposalStepIndicator steps={steps} currentStep={currentStep} submitted={submitted} />
                </div>
                <Card className="flex-1 overflow-auto border-muted/60 bg-background">
                  <CardContent className="p-4 sm:p-6">
                    <ProposalDraftPanel
                      draftId={draftId}
                      autosaveStatus={autosaveStatus}
                      stepContent={stepContent}
                      onBack={onBack}
                      onNext={onNext}
                      isFirstStep={isFirstStep}
                      isLastStep={isLastStep}
                      currentStep={currentStep}
                      totalSteps={steps.length}
                      isSubmitting={isSubmitting}
                      stepTitle={activeStep?.title ?? 'Proposal step'}
                      stepDescription={activeStep?.description ?? 'Complete this proposal step.'}
                      requiredFieldLabels={requiredFieldLabels}
                      validationMessages={validationMessages}
                    />
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}