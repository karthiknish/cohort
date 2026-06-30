import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { ProposalDraftContentShell, ProposalDraftFooter, ProposalDraftStatusStrip, } from './proposal-draft-panel-sections';
const STEP_BODY = <div>Step body</div>;
describe('proposal draft panel sections', () => {
    it('renders the autosave status strip', () => {
        const markup = renderToStaticMarkup(<ProposalDraftStatusStrip autosaveLabel="All changes saved" autosaveStatus="saved" draftId="draft-12345678"/>);
        expect(markup).toContain('All changes saved');
        expect(markup).toContain('Draft #DRAFT-12');
    });
    it('renders the content shell and footer actions', () => {
        const markup = renderToStaticMarkup(<>
        <ProposalDraftContentShell stepContent={STEP_BODY} validationMessages={['Budget is required']}/>
        <ProposalDraftFooter currentStep={1} isFirstStep={false} isLastStep={true} isSubmitting={false} onBack={vi.fn()} onNext={vi.fn()} totalSteps={5}/>
      </>);
        expect(markup).toContain('Fix these before continuing');
        expect(markup).toContain('Step body');
        expect(markup).toContain('Previous');
        expect(markup).toContain('Generate strategy');
        expect(markup).toContain('40%');
    });
});
