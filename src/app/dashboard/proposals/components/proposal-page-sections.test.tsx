import { renderToStaticMarkup } from 'react-dom/server'

import { describe, expect, it, vi } from 'vitest'

vi.mock('@/app/dashboard/components/dashboard-skeleton', () => ({
  DashboardSkeleton: () => <div>DashboardSkeleton</div>,
}))

vi.mock('./proposal-draft-panel', () => ({
  ProposalDraftPanel: () => <div>ProposalDraftPanel</div>,
}))

vi.mock('./proposal-history', () => ({
  ProposalHistory: () => <div>ProposalHistory</div>,
}))

vi.mock('./proposal-metrics', () => ({
  ProposalMetrics: () => <div>ProposalMetrics</div>,
}))

vi.mock('./proposal-step-indicator', () => ({
  ProposalStepIndicator: () => <div>ProposalStepIndicator</div>,
}))

vi.mock('./proposal-submitted-panel', () => ({
  ProposalSubmittedPanel: () => <div>ProposalSubmittedPanel</div>,
}))

vi.mock('./proposal-template-selector', () => ({
  ProposalTemplateSelector: () => <div>ProposalTemplateSelector</div>,
}))

vi.mock('./proposal-version-history', () => ({
  ProposalVersionHistory: () => <div>ProposalVersionHistory</div>,
}))

vi.mock('./proposal-wizard-header', () => ({
  ProposalWizardHeader: () => <div>ProposalWizardHeader</div>,
}))

import {
  ProposalBuilderOverlay,
  ProposalPreviewModeSection,
  ProposalStartStateCard,
} from './proposal-page-sections'

const baseForm = {
  company: { name: 'Acme', website: '', industry: 'SaaS', size: '', locations: '' },
  marketing: { budget: '', adAccounts: '', platforms: [], socialHandles: { Facebook: '', Instagram: '', LinkedIn: '', TikTok: '', 'X / Twitter': '', YouTube: '' } },
  goals: { objectives: [], audience: '', challenges: [], customChallenge: '' },
  scope: { services: [], otherService: '' },
  timelines: { startTime: '', upcomingEvents: '' },
  value: { proposalSize: '', engagementType: '', presentationTheme: 'modern-professional' },
} as const

describe('proposal page sections', () => {
  it('renders the start card affordance', () => {
    const markup = renderToStaticMarkup(
      <ProposalStartStateCard canStart={true} isCreatingDraft={false} onStartProposal={vi.fn()} />,
    )

    expect(markup).toContain('Start a new proposal')
    expect(markup).toContain('Start Proposal')
  })

  it('renders preview mode shell content', () => {
    const markup = renderToStaticMarkup(
      <ProposalPreviewModeSection
        previewProposals={[]}
        previewDraftId={null}
        onRefreshPreview={vi.fn()}
        onResume={vi.fn()}
        onRequestDelete={vi.fn()}
        onDownloadDeck={vi.fn()}
        onCreateNew={vi.fn()}
      />,
    )

    expect(markup).toContain('ProposalWizardHeader')
    expect(markup).toContain('Sample proposal data')
    expect(markup).toContain('ProposalMetrics')
    expect(markup).toContain('ProposalHistory')
  })

  it('renders submitted and editing states in the builder overlay', () => {
    const submittedMarkup = renderToStaticMarkup(
      <ProposalBuilderOverlay
        open={true}
        onClose={vi.fn()}
        isBootstrapping={false}
        submitted={true}
        summary={baseForm as never}
        presentationDeck={null}
        deckDownloadUrl={null}
        activeProposalIdForDeck={null}
        canResumeSubmission={true}
        onResumeSubmission={vi.fn()}
        isSubmitting={false}
        onRecheckDeck={vi.fn()}
        isRecheckingDeck={false}
        steps={[{ id: 'company', label: 'Company', title: 'Company', description: 'Tell us about the client.' }]}
        currentStep={0}
        draftId={null}
        autosaveStatus="saved"
        stepContent={<div>Step content</div>}
        onBack={vi.fn()}
        onNext={vi.fn()}
        isFirstStep={true}
        isLastStep={false}
        validationMessages={[]}
        requiredFieldLabels={['Company Name']}
      />,
    )

    const editingMarkup = renderToStaticMarkup(
      <ProposalBuilderOverlay
        open={true}
        onClose={vi.fn()}
        isBootstrapping={false}
        submitted={false}
        summary={baseForm as never}
        presentationDeck={null}
        deckDownloadUrl={null}
        activeProposalIdForDeck={null}
        canResumeSubmission={false}
        onResumeSubmission={vi.fn()}
        isSubmitting={false}
        onRecheckDeck={vi.fn()}
        isRecheckingDeck={false}
        steps={[{ id: 'company', label: 'Company', title: 'Company', description: 'Tell us about the client.' }]}
        currentStep={0}
        draftId={null}
        autosaveStatus="saved"
        stepContent={<div>Step content</div>}
        onBack={vi.fn()}
        onNext={vi.fn()}
        isFirstStep={true}
        isLastStep={false}
        validationMessages={[]}
        requiredFieldLabels={['Company Name']}
      />,
    )

    expect(submittedMarkup).toContain('ProposalSubmittedPanel')
    expect(editingMarkup).toContain('ProposalStepIndicator')
    expect(editingMarkup).toContain('ProposalDraftPanel')
  })
})