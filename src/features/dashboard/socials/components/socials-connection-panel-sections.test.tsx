import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
vi.mock('next/navigation', () => ({
    useRouter: () => ({ refresh: vi.fn(), push: vi.fn(), replace: vi.fn() }),
}));
import { SocialsMetaSetupCard } from './socials-connection-panel-sections';
const setupState = {
    stage: 'partial' as const,
    title: 'Facebook is ready, Instagram still needs attention',
    description: 'Only one surface loaded from the selected Meta source.',
    switchSourceRecommended: true,
    switchSourceMessage: 'If you expected Instagram here, switch the Meta source below.',
};
describe('SocialsMetaSetupCard', () => {
    it('renders switch-source guidance for partial recovery states', () => {
        const markup = renderToStaticMarkup(<SocialsMetaSetupCard setupState={setupState} selectedSourceLabel="Acme Ads" sourceSelectionRequired={false} loadingSources={false} facebookStatus="ready" instagramStatus="empty" facebookCount={2} instagramCount={0} onReloadSources={vi.fn()}/>);
        expect(markup).toContain('This may be the wrong Meta source for this workspace.');
        expect(markup).toContain('If you expected Instagram here, switch the Meta source below.');
    });
});
