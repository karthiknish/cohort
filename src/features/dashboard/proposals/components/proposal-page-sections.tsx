'use client'

import { useEffect } from 'react'
import { FileText, Plus, X } from 'lucide-react'

import { useIsMobile } from '@/shared/hooks/use-is-mobile'
import { Drawer, DrawerContent } from '@/shared/ui/drawer'
import { Kbd } from '@/shared/ui/kbd'

import { DashboardSkeleton } from '@/features/dashboard/home/components/dashboard-skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/alert'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader } from '@/shared/ui/card'
import { getButtonClasses } from '@/lib/dashboard-theme'
import type { ProposalFormData } from '@/lib/proposals'
import { cn } from '@/lib/utils'
import type { ProposalDraft } from '@/types/proposals'

import { ProposalBuilderJourneyBar } from './proposal-builder-journey-bar'
import { ProposalDraftPanel } from './proposal-draft-panel'
import { ProposalHistory } from './proposal-history'
import { ProposalMetrics } from './proposal-metrics'
import { ProposalStepNav } from './proposal-step-nav'
import type { ProposalStep } from './proposal-step-indicator'
import { ProposalSubmittedPanel } from './proposal-submitted-panel'
import { ProposalTemplateSelector } from './proposal-template-selector'
import { ProposalVersionHistory } from './proposal-version-history'
import { ProposalWizardHeader } from './proposal-wizard-header'

export function ProposalPageActions(props: {
  canManage?: boolean
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
    canManage = true,
    currentFormData,
    draftId,
    isSubmitting,
    selectedClientId,
    isCreatingDraft,
    onApplyTemplate,
    onVersionRestored,
    onStartProposal,
  } = props

  if (!canManage) {
    return null
  }

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
  /** When false, user can view shared proposals but not create. */
  canManage?: boolean
  /** Shown when `canStart` is false (e.g. no client selected). */
  blockedHint?: string | null
}) {
  const { canStart, canManage = true, blockedHint } = props

  if (canStart) {
    return null
  }

  if (!canManage) {
    return (
      <Alert className="border-dashed border-muted-foreground/30 bg-muted/20">
        <AlertTitle className="flex items-center gap-2">
          <FileText className="h-4 w-4" aria-hidden />
          Shared proposals
        </AlertTitle>
        <AlertDescription>
          Your agency publishes proposals and decks here. Open a row below to preview or download when ready.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Alert className="border-dashed border-muted-foreground/30 bg-muted/20">
      <AlertTitle className="flex items-center gap-2">
        <FileText className="h-4 w-4" aria-hidden />
        Select a client to create proposals
      </AlertTitle>
      <AlertDescription>{blockedHint}</AlertDescription>
    </Alert>
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
  isPresentationReady: boolean
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
  onGoToStep: (index: number) => void
  isFirstStep: boolean
  isLastStep: boolean
  validationMessages: string[]
}) {
  const {
    open,
    onClose,
    isBootstrapping,
    submitted,
    isPresentationReady,
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
    onGoToStep,
    isFirstStep,
    isLastStep,
    validationMessages,
  } = props

  const isMobile = useIsMobile()

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

  const activeStep = steps[currentStep]

  const builderBody = (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-background supports-[padding:max(0px)]:pb-[max(0.75rem,env(safe-area-inset-bottom))]">
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
            <Kbd className="hidden sm:inline">Esc</Kbd>
          </Button>
        </header>
        <div className="min-h-0 flex-1 overflow-hidden px-4 py-4 sm:px-6 sm:py-5">
          <div className="mb-4">
            <ProposalBuilderJourneyBar
              isSubmitting={isSubmitting}
              isRecheckingDeck={isRecheckingDeck}
              submitted={submitted}
              isPresentationReady={isPresentationReady}
              activeProposalIdForDeck={activeProposalIdForDeck}
              deckDownloadUrl={deckDownloadUrl}
              autosaveStatus={autosaveStatus}
            />
          </div>
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
              <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[minmax(220px,260px)_1fr] lg:gap-6">
                <aside className="hidden min-h-0 shrink-0 overflow-y-auto lg:block">
                  <ProposalStepNav
                    steps={steps}
                    currentStep={currentStep}
                    submitted={submitted}
                    onGoToStep={onGoToStep}
                  />
                </aside>
                <Card className="flex min-h-0 flex-1 flex-col overflow-hidden border-muted/60 bg-background shadow-sm">
                  <CardContent className="flex min-h-0 flex-1 flex-col p-4 sm:p-6">
                    <div className="mb-4 lg:hidden">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Step {currentStep + 1} of {steps.length}
                      </p>
                      <p className="text-sm font-medium text-foreground">{activeStep?.title}</p>
                    </div>
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
                      validationMessages={validationMessages}
                    />
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
    </div>
  )

  if (isMobile) {
    return (
      <Drawer
        open={open}
        onOpenChange={(next) => {
          if (!next && !isSubmitting) {
            onClose()
          }
        }}
        direction="right"
      >
        <DrawerContent className="inset-y-0 left-auto mt-0 h-full max-h-none w-full max-w-none rounded-none border-0 data-[vaul-drawer-direction=right]:w-full">
          {builderBody}
        </DrawerContent>
      </Drawer>
    )
  }

  if (!open) {
    return null
  }

  return (
    <div className="fixed inset-0 z-2000 isolate bg-background">{builderBody}</div>
  )
}