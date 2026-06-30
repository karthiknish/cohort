import { describe, expect, it } from 'vitest';
import type { ProposalFormData } from '@/lib/proposals';
import { countOutlineSlides, createProposalDeckRequest, formatDeckInputWithSlideBreaks, sanitizeDeckProviderWarnings, } from './proposal-deck-generation';
const baseForm = {
    company: { name: 'Acme', website: '', industry: 'SaaS', size: '', locations: '' },
    goals: { objectives: ['Leads'], audience: 'CMOs', challenges: [], customChallenge: '' },
    marketing: { platforms: [], budget: '$10k', socialHandles: {} },
    scope: { services: ['PPC'], otherService: '' },
    timelines: { startTime: 'ASAP' },
    value: { proposalSize: '£5,000 – £10,000', engagementType: 'Ongoing', presentationTheme: 'theme-1' },
} satisfies ProposalFormData;
describe('proposal-deck-generation', () => {
    it('counts slides from outline', () => {
        const outline = 'Slide 1: Intro\nSlide 2: Goals\nSlide 3: Plan';
        expect(countOutlineSlides(outline)).toBe(3);
    });
    it('formats input with slide breaks', () => {
        const outline = 'Slide 1: Intro\nSlide 2: Plan';
        const formatted = formatDeckInputWithSlideBreaks(baseForm, outline);
        expect(formatted).toContain('---');
        expect(formatted).toContain('Acme');
    });
    it('requests both pptx and pdf exports', () => {
        const request = createProposalDeckRequest(baseForm, 'Slide 1: Test');
        expect(request.exportAs).toEqual(['pptx', 'pdf']);
        expect(request.cardSplit).toBe('inputTextBreaks');
        expect(request.textOptions?.audience).toBe('CMOs');
    });
    it('sanitizes provider warnings for UI', () => {
        expect(sanitizeDeckProviderWarnings(['Gamma layout adjusted'])).toEqual([
            'Presentation layout adjusted',
        ]);
    });
});
