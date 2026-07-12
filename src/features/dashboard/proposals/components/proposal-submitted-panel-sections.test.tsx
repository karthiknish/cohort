import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
vi.mock('@/lib/hooks/use-download-file', () => ({
    useDownloadFile: () => async () => false,
}));
vi.mock('convex/react', () => ({
    useConvex: () => ({ action: vi.fn() }),
}));
vi.mock('@/shared/contexts/auth-context', () => ({
    useAuth: () => ({ user: null, getIdToken: vi.fn() }),
}));
vi.mock('@/shared/contexts/client-context', () => ({
    useClientContext: () => ({ selectedClient: null }),
}));
import { ProposalSubmittedPanel } from './proposal-submitted-panel';
const summary = {
    company: { name: 'Acme', industry: 'SaaS', website: 'https://acme.test' },
    marketing: { budget: '$5k', platforms: ['Google Ads'] },
    goals: { objectives: ['Leads'], challenges: ['Awareness'] },
    scope: { services: ['Paid Search'] },
    timelines: { startTime: 'Next month' },
} as never;
const readyDeck = { status: 'ready', storageUrl: 'https://cdn.example.com/deck.pptx', pptxUrl: null } as never;
describe('ProposalSubmittedPanel', () => {
    it('renders the hero, strategy brief, and asset delivery for a ready deck', () => {
        const markup = renderToStaticMarkup(
            <ProposalSubmittedPanel
                summary={summary}
                presentationDeck={readyDeck}
                deckDownloadUrl="https://cdn.example.com/deck.pptx"
                activeProposalIdForDeck="p1"
                canResumeSubmission={true}
                onResumeSubmission={vi.fn()}
                isSubmitting={false}
            />,
        );
        expect(markup).toContain('Your proposal is ready');
        expect(markup).toContain('View Presentation');
        expect(markup).toContain('Strategy Brief');
        expect(markup).toContain('Acme');
        expect(markup).toContain('Presentation Deck');
        expect(markup).toContain('Download PowerPoint');
        expect(markup).toContain('Copy share link');
    });
    it('renders the generating state when no deck is available', () => {
        const markup = renderToStaticMarkup(
            <ProposalSubmittedPanel
                summary={summary}
                presentationDeck={null}
                deckDownloadUrl={null}
                activeProposalIdForDeck={null}
                canResumeSubmission={false}
                onResumeSubmission={vi.fn()}
                isSubmitting={false}
            />,
        );
        expect(markup).toContain('Building your deck');
    });
});
