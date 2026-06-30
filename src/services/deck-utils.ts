import { cache } from 'react';
import type { ProposalFormData } from '@/lib/proposals';
import { generateDeckInstructions, generateProposalSuggestions as generateDeckSuggestions, } from '@/lib/proposal-deck-ai';

export type DeckPayload = {
    generationId: string;
    status: string;
    instructions: string;
    webUrl: string | null;
    shareUrl: string | null;
    pptxUrl: string | null;
    pdfUrl: string | null;
    generatedFiles: Array<{
        fileType: string;
        fileUrl: string;
    }>;
    pptStorageId: string | null;
    pdfStorageId: string | null;
};

function normalizeFileType(value: string): string {
    const lower = value.toLowerCase();
    if (lower.includes('ppt')) {
        return 'pptx';
    }
    if (lower.includes('pdf')) {
        return 'pdf';
    }
    return lower;
}

export function parseDeckPayload(value: unknown): DeckPayload | null {
    if (!value || typeof value !== 'object')
        return null;
    const record = value as Record<string, unknown>;
    const generationId = typeof record.generationId === 'string' ? record.generationId : '';
    if (!generationId)
        return null;
    return {
        generationId,
        status: typeof record.status === 'string' ? record.status : 'unknown',
        instructions: typeof record.instructions === 'string' ? record.instructions : '',
        webUrl: typeof record.webUrl === 'string' ? record.webUrl : null,
        shareUrl: typeof record.shareUrl === 'string' ? record.shareUrl : null,
        pptxUrl: typeof record.pptxUrl === 'string' ? record.pptxUrl : null,
        pdfUrl: typeof record.pdfUrl === 'string' ? record.pdfUrl : null,
        generatedFiles: Array.isArray(record.generatedFiles)
            ? record.generatedFiles.flatMap((entry) => {
                const fileRecord = entry && typeof entry === 'object' ? (entry as Record<string, unknown>) : null;
                const fileType = typeof fileRecord?.fileType === 'string' ? normalizeFileType(fileRecord.fileType) : '';
                const fileUrl = typeof fileRecord?.fileUrl === 'string' ? fileRecord.fileUrl : '';
                return fileType && fileUrl ? [{ fileType, fileUrl }] : [];
            })
            : [],
        pptStorageId: typeof record.pptStorageId === 'string' ? record.pptStorageId : null,
        pdfStorageId: typeof record.pdfStorageId === 'string' ? record.pdfStorageId : null,
    };
}

export function buildDeckInputText(formData: ProposalFormData, summary?: string): string {
    const companyName = formData.company?.name?.trim() || 'Client';
    const industry = formData.company?.industry?.trim();
    const goals = formData.goals?.objectives?.join(', ');
    const budget = formData.marketing?.budget?.trim();
    const scope = [
        ...(formData.scope?.services || []),
        formData.scope?.otherService
    ].filter(Boolean).join(', ');
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

export async function generatePresentationInstructions(formData: ProposalFormData, existing?: string | null): Promise<string> {
    return generateDeckInstructions(formData, existing);
}

export async function generateProposalSuggestions(formData: ProposalFormData, summary: string | null | undefined): Promise<string | null> {
    return generateDeckSuggestions(formData, summary);
}
