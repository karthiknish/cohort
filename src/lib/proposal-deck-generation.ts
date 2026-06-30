import type { ProposalFormData } from '@/lib/proposals';

/** User-facing name for the deck generation integration (never expose vendor names in UI). */
export const PRESENTATION_ENGINE_LABEL = 'Presentation engine';

export function countOutlineSlides(instructions: string): number {
    const matches = instructions.match(/^Slide\s+\d+/gim);
    const count = matches?.length ?? 0;
    if (count > 12)
        return 12;
    if (count >= 1)
        return count;
    return 10;
}

export function formatDeckInputWithSlideBreaks(formData: ProposalFormData, instructions: string): string {
    const header = buildDeckInputText(formData, instructions);
    const slideBlocks = instructions.split(/\n(?=Slide\s+\d+)/i).flatMap((block) => {
        const trimmed = block.trim();
        return trimmed ? [trimmed] : [];
    });
    if (slideBlocks.length > 1) {
        return [header, ...slideBlocks].join('\n---\n');
    }
    return `${header}\n---\n${instructions.trim()}`;
}

function buildDeckInputText(formData: ProposalFormData, summary?: string): string {
    const companyName = formData.company?.name?.trim() || 'Client';
    const industry = formData.company?.industry?.trim();
    const goals = formData.goals?.objectives?.join(', ');
    const budget = formData.marketing?.budget?.trim();
    const scope = [...(formData.scope?.services || []), formData.scope?.otherService].filter(Boolean).join(', ');
    return [
        `Client: ${companyName}`,
        industry ? `Industry: ${industry}` : null,
        goals ? `Strategic Goals: ${goals}` : null,
        budget ? `Budget: ${budget}` : null,
        scope ? `Proposed Scope: ${scope}` : null,
        summary ? `AI Generated Outline:\n${summary}` : null,
    ]
        .filter(Boolean)
        .join('\n');
}

export type DeckGenerationCredits = {
    deducted: number | null;
    remaining: number | null;
};

export function parseDeckGenerationCredits(_raw: Record<string, unknown> | undefined): DeckGenerationCredits {
    // pptxgenjs is a local library — no credit system.
    return { deducted: null, remaining: null };
}

export function sanitizeDeckProviderWarnings(warnings: string[] | undefined): string[] {
    if (!warnings?.length)
        return [];
    return warnings;
}
