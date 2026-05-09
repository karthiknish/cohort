'use client'

import { useEffect } from 'react'
import { ArrowRight, FileText, Plus, X } from 'lucide-react'

import { DashboardSkeleton } from '@/features/dashboard/home/components/dashboard-skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/alert'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader } from '@/shared/ui/card'
import { getButtonClasses } from '@/lib/dashboard-theme'
import type { ProposalFormData } from '@/lib/proposals'
import { cn } from '@/lib/utils'
import type { ProposalDraft } from '@/types/proposals'

import { ProposalDraftPanel } from './proposal-draft-panel'
import { ProposalHistory } from './proposal-history'
import { ProposalMetrics } from './proposal-metrics'
import { ProposalStepIndicator } from './proposal-step-indicator'
import type { ProposalStep } from './proposal-step-indicator'
import { ProposalSubmittedPanel } from './proposal-submitted-panel'
import { ProposalTemplateSelector } from './proposal-template-selector'
import { ProposalVersionHistory } from './proposal-version-history'
import { ProposalWizardHeader } from './proposal-wizard-header'

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
        className={cn(getButtonClasses('primary'), 'shrink-0 shadow-sm motion-chromatic hover:shadow-md')}
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
  /** Shown when `canStart` is false (e.g. no client selected). */
  blockedHint?: string | null
}) {
  const { canStart, isCreatingDraft, onStartProposal, blockedHint } = props

  return (
    <Card className="overflow-hidden border-dashed border-accent/25 bg-linear-to-br from-primary/6 via-background to-background shadow-sm">
      <CardHeader className="space-y-4 pb-2">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-accent/15 bg-accent/10 text-primary shadow-sm">
              <FileText className="h-6 w-6" aria-hidden />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold tracking-tight text-foreground">Start a new proposal</h3>
              <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
                Opens the full-screen builder with autosave, step-by-step validation, and one-click deck generation when
                you are done.
              </p>
            </div>
          </div>
          <Button
            onClick={onStartProposal}
            disabled={!canStart || isCreatingDraft}
            size="lg"
            className="w-full shrink-0 shadow-md transition-[box-shadow,transform] hover:shadow-lg active:scale-[0.99] sm:w-auto"
          >
            {isCreatingDraft ? 'Preparing…' : 'Open proposal builder'}
            {!isCreatingDraft ? <ArrowRight className="ml-2 h-4 w-4" aria-hidden /> : null}
          </Button>
        </div>
        {!canStart && blockedHint ? (
          <Alert className="border-muted-foreground/25 bg-muted/30">
            <AlertTitle>Choose a client first</AlertTitle>
            <AlertDescription>{blockedHint}</AlertDescription>
          </Alert>
        ) : null}
      </CardHeader>
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
  onRecheckDeck: () => Promise<void>
  isRecheckingDeck: boolean
  steps: ProposalStep[]
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

  useEffect(() => {
    if (!open) {
      return
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || isSubmitting) {
        return
      }
      event.preventDefault()
      onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, isSubmitting, onClose])

  if (!open) {
    return null
  }

  const activeStep = steps[currentStep]

  return (
    <div className="fixed inset-0 z-2000 isolate bg-background supports-[padding:max(0px)]:pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <div className="flex h-full min-h-0 flex-col overflow-hidden">
        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-muted/40 bg-background/95 px-4 py-4 backdrop-blur-md sm:items-center sm:px-6">
          <div className="min-w-0 space-y-1">
            <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/80">Proposal builder</p>
            <h2 className="text-balance text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
              {submitted ? 'Deck and next steps' : activeStep?.title ?? 'Proposal'}
            </h2>
            <p className="text-pretty text-sm text-muted-foreground">
              {submitted
                ? 'Review your generated materials or jump back in to adjust inputs.'
                : (activeStep?.description ?? 'Complete each section—your work saves automatically.')}
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isSubmitting}
            className="shrink-0 gap-2 border-muted-foreground/25"
            aria-label={isSubmitting ? 'Close when generation finishes' : 'Close proposal builder'}
          >
            <X className="h-4 w-4" aria-hidden />
            <span className="hidden sm:inline">Close</span>
            <kbd className="hidden rounded border border-muted-foreground/20 bg-muted/50 px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground sm:inline">
              Esc
            </kbd>
          </Button>
        </header>
        <div className="min-h-0 flex-1 overflow-hidden px-4 py-4 sm:px-6 sm:py-6">
          <div className="flex h-full min-h-0 flex-col gap-4">
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
              <div className="flex min-h-0 flex-1 flex-col gap-4">
                <div className="shrink-0">
                  <ProposalStepIndicator steps={steps} currentStep={currentStep} submitted={submitted} />
                </div>
                <Card className="flex min-h-0 flex-1 flex-col overflow-hidden border-muted/60 bg-background shadow-sm">
                  <CardContent className="flex min-h-0 flex-1 flex-col p-4 sm:p-6">
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