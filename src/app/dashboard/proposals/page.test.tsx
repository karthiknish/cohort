import { renderToStaticMarkup } from 'react-dom/server'

import { describe, expect, it, vi } from 'vitest'

let previewMode = false

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

vi.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}))

vi.mock('@/contexts/client-context', () => ({
  useClientContext: () => ({ selectedClientId: 'client-1', selectClient: vi.fn() }),
}))

vi.mock('@/contexts/preview-context', () => ({
  usePreview: () => ({ isPreviewMode: previewMode }),
}))

vi.mock('@/app/dashboard/components/dashboard-skeleton', () => ({
  DashboardSkeleton: () => <div>DashboardSkeleton</div>,
}))

vi.mock('./components/proposal-step-content', () => ({
  ProposalStepContent: () => <div>ProposalStepContent</div>,
}))

vi.mock('./components/proposal-history', () => ({
  ProposalHistory: () => <div>ProposalHistory</div>,
}))

vi.mock('./components/proposal-delete-dialog', () => ({
  ProposalDeleteDialog: () => <div>ProposalDeleteDialog</div>,
}))

vi.mock('./components/proposal-wizard-header', () => ({
  ProposalWizardHeader: () => <div>ProposalWizardHeader</div>,
}))

vi.mock('./components/deck-progress-overlays', () => ({
  ProposalGenerationOverlay: () => <div>ProposalGenerationOverlay</div>,
  DeckProgressOverlay: () => <div>DeckProgressOverlay</div>,
}))

vi.mock('./components/proposal-metrics', () => ({
  ProposalMetrics: () => <div>ProposalMetrics</div>,
}))

vi.mock('./components/proposal-page-sections', () => ({
  ProposalPageActions: () => <div>ProposalPageActions</div>,
  ProposalPreviewModeSection: () => <div>ProposalPreviewModeSection</div>,
  ProposalStartStateCard: () => <div>ProposalStartStateCard</div>,
  ProposalBuilderOverlay: ({ open }: { open: boolean }) => <div>{open ? 'ProposalBuilderOverlay:open' : 'ProposalBuilderOverlay:closed'}</div>,
}))

const baseForm = {
  company: { name: '', website: '', industry: '', size: '', locations: '' },
  marketing: { budget: '', adAccounts: '', platforms: [], socialHandles: { Facebook: '', Instagram: '', LinkedIn: '', TikTok: '', 'X / Twitter': '', YouTube: '' } },
  goals: { objectives: [], audience: '', challenges: [], customChallenge: '' },
  scope: { services: [], otherService: '' },
  timelines: { startTime: '', upcomingEvents: '' },
  value: { proposalSize: '', engagementType: '', presentationTheme: 'modern-professional' },
}

vi.mock('./hooks', () => ({
  useProposalWizard: () => ({
    currentStep: 0,
    formState: baseForm,
    validationErrors: {},
    steps: [{ id: 'company', label: 'Company', title: 'Company', description: 'Tell us about the client.' }],
    step: { id: 'company', label: 'Company', title: 'Company', description: 'Tell us about the client.' },
    isFirstStep: true,
    isLastStep: false,
    hasPersistableData: false,
    setCurrentStep: vi.fn(),
    setFormState: vi.fn(),
    updateField: vi.fn(),
    toggleArrayValue: vi.fn(),
    handleSocialHandleChange: vi.fn(),
    clearErrors: vi.fn(),
    handleBack: vi.fn(),
    handleNext: vi.fn(),
  }),
  useProposalDrafts: () => ({
    draftId: null,
    isLoadingProposals: false,
    isCreatingDraft: false,
    isBootstrapping: false,
    autosaveStatus: 'saved' as const,
    deletingProposalId: null,
    proposalPendingDelete: null,
    isDeleteDialogOpen: false,
    setDraftId: vi.fn(),
    setAutosaveStatus: vi.fn(),
    refreshProposals: vi.fn().mockResolvedValue([]),
    ensureDraftId: vi.fn().mockResolvedValue('draft-1'),
    handleCreateNewProposal: vi.fn().mockResolvedValue(undefined),
    handleResumeProposal: vi.fn(),
    handleDeleteProposal: vi.fn().mockResolvedValue(undefined),
    requestDeleteProposal: vi.fn(),
    handleDeleteDialogChange: vi.fn(),
    wizardRef: { current: null },
  }),
  useProposalSubmission: () => ({
    isSubmitting: false,
    isRecheckingDeck: false,
    submitted: false,
    isPresentationReady: false,
    presentationDeck: null,
    lastSubmissionSnapshot: null,
    submitProposal: vi.fn().mockResolvedValue(undefined),
    handleContinueEditingFromSnapshot: vi.fn().mockResolvedValue(undefined),
    handleRecheckDeck: vi.fn().mockResolvedValue(undefined),
    canResumeSubmission: false,
    deckDownloadUrl: null,
    activeProposalIdForDeck: null,
    setSubmitted: vi.fn(),
    setPresentationDeck: vi.fn(),
    setAiSuggestions: vi.fn(),
    setLastSubmissionSnapshot: vi.fn(),
  }),
  useDeckPreparation: () => ({
    downloadingDeckId: null,
    deckProgressStage: null,
    handleDownloadDeck: vi.fn().mockResolvedValue(undefined),
  }),
  useProposalPageInteractions: () => ({
    handleSelectTemplate: vi.fn(),
    handleVersionRestored: vi.fn(),
    handleStartProposal: vi.fn(),
    handleResumeProposalInModal: vi.fn(),
    handleContinueEditingInModal: vi.fn(),
    handlePreviewRefresh: vi.fn(),
    handlePreviewResume: vi.fn(),
    handlePreviewRequestDelete: vi.fn(),
    handlePreviewDownloadDeck: vi.fn(),
    handlePreviewCreateNew: vi.fn(),
  }),
}))

import ProposalsPage from './page'

describe('ProposalsPage route smoke', () => {
  it('renders the live workspace shell by default', () => {
    previewMode = false
    const markup = renderToStaticMarkup(<ProposalsPage />)

    expect(markup).toContain('ProposalPageActions')
    expect(markup).toContain('ProposalStartStateCard')
    expect(markup).toContain('ProposalHistory')
    expect(markup).toContain('ProposalBuilderOverlay:closed')
  })

  it('renders the preview mode shell when preview is enabled', () => {
    previewMode = true
    const markup = renderToStaticMarkup(<ProposalsPage />)

    expect(markup).toContain('ProposalPreviewModeSection')
    expect(markup).not.toContain('ProposalPageActions')
    expect(markup).not.toContain('ProposalStartStateCard')
  })
})

