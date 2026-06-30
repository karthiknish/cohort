import { cache } from 'react';
import type { ProposalFormData } from '@/lib/proposals';
import { generateDeckInstructions, generateProposalSuggestions as generateDeckSuggestions, } from '@/lib/proposal-deck-ai';
import { gammaService } from '@/services/gamma';
import type { GammaGenerationStatus } from '@/services/gamma';
export type GammaDeckPayload = {
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
function normalizeGammaFileType(value: string): string {
    const lower = value.toLowerCase();
    if (lower.includes('ppt')) {
        return 'pptx';
    }
    if (lower.includes('pdf')) {
        return 'pdf';
    }
    return lower;
}
export function parseGammaDeckPayload(value: unknown): GammaDeckPayload | null {
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
                const fileType = typeof fileRecord?.fileType === 'string' ? normalizeGammaFileType(fileRecord.fileType) : '';
                const fileUrl = typeof fileRecord?.fileUrl === 'string' ? fileRecord.fileUrl : '';
                return fileType && fileUrl ? [{ fileType, fileUrl }] : [];
            })
            : [],
        pptStorageId: typeof record.pptStorageId === 'string' ? record.pptStorageId : null,
        pdfStorageId: typeof record.pdfStorageId === 'string' ? record.pdfStorageId : null,
    };
}
export function buildGammaInputText(formData: ProposalFormData, summary?: string): string {
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
export type NormalizedGammaFile = {
    fileType: string;
    fileUrl: string;
};
async function findGammaFileInternal(args: {
    generationId: string;
    fileType: 'pptx' | 'pdf';
}): Promise<NormalizedGammaFile | null> {
    const status = (await gammaService.getGeneration(args.generationId)) as GammaGenerationStatus;
    const statusRecord = status && typeof status === 'object' ? (status as unknown as Record<string, unknown>) : null;
    const files = Array.isArray(statusRecord?.generatedFiles) ? statusRecord.generatedFiles : [];
    for (const file of files) {
        const fileRecord = file && typeof file === 'object' ? (file as Record<string, unknown>) : null;
        if (!fileRecord)
            continue;
        const normalizedType = normalizeGammaFileType(String(fileRecord.fileType ?? ''));
        const url = typeof fileRecord.fileUrl === 'string' ? fileRecord.fileUrl : '';
        if (normalizedType === args.fileType && url) {
            return { fileType: normalizedType, fileUrl: url };
        }
    }
    const directUrl = args.fileType === 'pptx' ? statusRecord?.pptxUrl : statusRecord?.pdfUrl;
    if (typeof directUrl === 'string' && directUrl) {
        return { fileType: args.fileType, fileUrl: directUrl };
    }
    return null;
}
export const findGammaFile = cache(findGammaFileInternal);
export async function downloadGammaPresentation(url: string, retries = 3, backoffMs = 2000): Promise<Uint8Array> {
    const apiKey = process.env.GAMMA_API_KEY;
    if (!apiKey) {
        throw new Error('GAMMA_API_KEY is not configured');
    }
    const retryableStatuses = new Set([404, 423, 425, 429, 500, 502, 503, 504]);
    let attempt = 0;
    let lastError: unknown = null;
    while (attempt <= retries) {
        attempt += 1;
        try {
            const response = await fetch(url, {
                headers: {
                    'X-API-KEY': apiKey,
                    accept: 'application/octet-stream',
                },
            });
            if (!response.ok) {
                if (retryableStatuses.has(response.status) && attempt <= retries) {
                    await new Promise((resolve) => setTimeout(resolve, backoffMs * attempt));
                    continue;
                }
                const details = await response.text().catch(() => '');
                throw new Error(`Presentation file download failed (${response.status}): ${details || 'Unknown error'}`);
            }
            const arrayBuffer = await response.arrayBuffer();
            return new Uint8Array(arrayBuffer);
        }
        catch (error: unknown) {
            lastError = error;
            if (attempt > retries) {
                break;
            }
            await new Promise((resolve) => setTimeout(resolve, backoffMs * attempt));
        }
    }
    throw (lastError instanceof Error ? lastError : new Error('Presentation file download failed after retries'));
}
export async function generateGammaInstructions(formData: ProposalFormData, existing?: string | null): Promise<string> {
    return generateDeckInstructions(formData, existing);
}
export async function generateProposalSuggestions(formData: ProposalFormData, summary: string | null | undefined): Promise<string | null> {
    return generateDeckSuggestions(formData, summary);
}
