import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
vi.mock('@/features/dashboard/home/components/dashboard-skeleton', () => ({
    DashboardSkeleton: () => <div>DashboardSkeleton</div>,
}));
vi.mock('./proposal-draft-panel', () => ({
    ProposalDraftPanel: () => <div>ProposalDraftPanel</div>,
}));
vi.mock('./proposal-history', () => ({
    ProposalHistory: () => <div>ProposalHistory</div>,
}));
vi.mock('./proposal-metrics', () => ({
    ProposalMetrics: () => <div>ProposalMetrics</div>,
}));
vi.mock('./proposal-step-nav', () => ({
    ProposalStepNav: () => <div>ProposalStepNav</div>,
}));
vi.mock('./proposal-submitted-panel', () => ({
    ProposalSubmittedPanel: () => <div>ProposalSubmittedPanel</div>,
}));
vi.mock('./proposal-version-history', () => ({
    ProposalVersionHistory: () => <div>ProposalVersionHistory</div>,
}));
vi.mock('./proposal-wizard-header', () => ({
    ProposalWizardHeader: () => <div>ProposalWizardHeader</div>,
}));
vi.mock('./proposal-builder-journey-bar', () => ({
    ProposalBuilderJourneyBar: () => <div>ProposalBuilderJourneyBar</div>,
}));
import { ProposalBuilderOverlay, ProposalPreviewModeSection, ProposalStartStateCard, } from './proposal-page-sections';
const baseForm = {
    company: { name: 'Acme', website: '', industry: 'SaaS', size: '', locations: '' },
    marketing: { budget: '', adAccounts: '', platforms: [], socialHandles: { Facebook: '', Instagram: '', LinkedIn: '', TikTok: '', 'X / Twitter': '', YouTube: '' } },
    goals: { objectives: [], audience: '', challenges: [], customChallenge: '' },
    scope: { services: [], otherService: '' },
    timelines: { startTime: '', upcomingEvents: '' },
    value: { proposalSize: '', engagementType: '', presentationTheme: 'modern-professional' },
} as const;
const proposalStepContent = createElement('div', null, 'Step content');
const overlayBaseProps = {
    open: true,
    onClose: vi.fn(),
    isBootstrapping: false,
    isPresentationReady: false,
    summary: baseForm as never,
    presentationDeck: null,
    deckDownloadUrl: null,
    activeProposalIdForDeck: null,
    canResumeSubmission: false,
    onResumeSubmission: vi.fn(),
    isSubmitting: false,
    onRecheckDeck: vi.fn(),
    isRecheckingDeck: false,
    steps: [{ id: 'company', label: 'Company', title: 'Company', description: 'Tell us about the client.' }],
    currentStep: 0,
    draftId: null,
    autosaveStatus: 'saved' as const,
    stepContent: proposalStepContent,
    onBack: vi.fn(),
    onNext: vi.fn(),
    onGoToStep: vi.fn(),
    isFirstStep: true,
    isLastStep: false,
    validationMessages: [] as string[],
};
describe('proposal page sections', () => {
    it('renders client blocker when start is not allowed', () => {
        const markup = renderToStaticMarkup(<ProposalStartStateCard canStart={false} blockedHint="Pick a client from the workspace switcher."/>);
        expect(markup).toContain('Select a client to create proposals');
        expect(markup).toContain('Pick a client from the workspace switcher.');
    });
    it('renders nothing when client is selected', () => {
        const markup = renderToStaticMarkup(<ProposalStartStateCard canStart={true} blockedHint={null}/>);
        expect(markup).toBe('');
    });
    it('renders preview mode shell content', () => {
        const markup = renderToStaticMarkup(<ProposalPreviewModeSection previewProposals={[]} previewDraftId={null} onRefreshPreview={vi.fn()} onResume={vi.fn()} onRequestDelete={vi.fn()} onDownloadDeck={vi.fn()} onCreateNew={vi.fn()}/>);
        expect(markup).toContain('ProposalWizardHeader');
        expect(markup).toContain('Sample proposal data');
        expect(markup).toContain('ProposalMetrics');
        expect(markup).toContain('ProposalHistory');
    });
    it('renders submitted and editing states in the builder overlay', () => {
        const submittedMarkup = renderToStaticMarkup(<ProposalBuilderOverlay {...overlayBaseProps} submitted={true} canResumeSubmission={true}/>);
        const editingMarkup = renderToStaticMarkup(<ProposalBuilderOverlay {...overlayBaseProps} submitted={false}/>);
        expect(submittedMarkup).toContain('ProposalSubmittedPanel');
        expect(submittedMarkup).toContain('ProposalBuilderJourneyBar');
        expect(editingMarkup).toContain('ProposalStepNav');
        expect(editingMarkup).toContain('ProposalDraftPanel');
    });
});
