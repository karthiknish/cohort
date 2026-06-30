import { buildAgentAttachmentContext, type AgentAttachmentContext, type ServerPdfExtractionResult, } from '@/lib/agent-attachments';
const TASKS_DOCUMENT_EXTENSIONS = new Set(['pdf', 'doc', 'docx']);
const TASKS_VISUAL_EXTENSIONS = new Set(['png', 'jpg', 'jpeg', 'webp', 'heic', 'heif']);
const TASKS_DOCUMENT_MIME_TYPES = new Set([
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);
const TASKS_VISUAL_MIME_TYPES = new Set([
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/webp',
    'image/heic',
    'image/heif',
]);
export type PreparedTaskImportDocument = {
    kind: 'text';
    fileName: string;
    text: string;
} | {
    kind: 'vision';
    fileName: string;
    mimeType: string;
    storageId: string;
};
function getFileExtension(fileName: string): string {
    return fileName.split('.').pop()?.toLowerCase() ?? '';
}
function resolveTasksDocumentMimeType(file: File): string {
    if (file.type)
        return file.type;
    const extension = getFileExtension(file.name);
    if (extension === 'pdf')
        return 'application/pdf';
    if (extension === 'doc')
        return 'application/msword';
    if (extension === 'docx') {
        return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    }
    if (extension === 'png')
        return 'image/png';
    if (extension === 'jpg' || extension === 'jpeg')
        return 'image/jpeg';
    if (extension === 'webp')
        return 'image/webp';
    if (extension === 'heic')
        return 'image/heic';
    if (extension === 'heif')
        return 'image/heif';
    return 'application/octet-stream';
}
export function isTasksVisualDocumentFile(file: File): boolean {
    const extension = getFileExtension(file.name);
    if (TASKS_VISUAL_EXTENSIONS.has(extension))
        return true;
    return TASKS_VISUAL_MIME_TYPES.has(file.type);
}
export function isTasksDocumentFile(file: File): boolean {
    if (isTasksVisualDocumentFile(file))
        return true;
    const extension = getFileExtension(file.name);
    if (TASKS_DOCUMENT_EXTENSIONS.has(extension))
        return true;
    return TASKS_DOCUMENT_MIME_TYPES.has(file.type);
}
export function filterTasksDocumentFiles(files: FileList | File[]): File[] {
    return Array.from(files).filter(isTasksDocumentFile);
}
export function isFileDragEvent(event: DragEvent | React.DragEvent): boolean {
    return Array.from(event.dataTransfer?.types ?? []).includes('Files');
}
function isPdfFile(file: File): boolean {
    const extension = getFileExtension(file.name);
    const mimeType = resolveTasksDocumentMimeType(file);
    return extension === 'pdf' || mimeType === 'application/pdf';
}
function shouldUseVisionImport(file: File, extracted: AgentAttachmentContext): boolean {
    if (isTasksVisualDocumentFile(file))
        return true;
    if (!isPdfFile(file))
        return false;
    if (extracted.extractionStatus === 'ready' && extracted.extractedText?.trim())
        return false;
    return true;
}
export async function prepareTaskImportDocument(file: File, options: {
    extractPdfOnServer?: (file: File) => Promise<ServerPdfExtractionResult | null>;
    uploadForVision: (file: File) => Promise<string>;
}): Promise<PreparedTaskImportDocument> {
    if (isTasksVisualDocumentFile(file)) {
        const storageId = await options.uploadForVision(file);
        return {
            kind: 'vision',
            fileName: file.name,
            mimeType: resolveTasksDocumentMimeType(file),
            storageId,
        };
    }
    const extracted = await buildAgentAttachmentContext(file, options);
    if (extracted.extractionStatus === 'failed') {
        const isLegacyDoc = file.name.toLowerCase().endsWith('.doc');
        throw new Error(extracted.errorMessage ??
            (isLegacyDoc
                ? 'Legacy .doc files are not supported. Save as .docx and try again.'
                : 'Could not read this document.'));
    }
    if (shouldUseVisionImport(file, extracted)) {
        const storageId = await options.uploadForVision(file);
        return {
            kind: 'vision',
            fileName: file.name,
            mimeType: resolveTasksDocumentMimeType(file),
            storageId,
        };
    }
    const text = extracted.extractedText?.trim();
    if (!text) {
        throw new Error('Could not read any text from this document.');
    }
    return {
        kind: 'text',
        fileName: file.name,
        text,
    };
}
/** @deprecated Prefer prepareTaskImportDocument for the tasks import flow. */
export async function extractTasksDocumentText(file: File, options: {
    extractPdfOnServer?: (file: File) => Promise<ServerPdfExtractionResult | null>;
} = {}): Promise<AgentAttachmentContext> {
    const extracted = await buildAgentAttachmentContext(file, options);
    if (extracted.extractionStatus === 'failed') {
        const isLegacyDoc = file.name.toLowerCase().endsWith('.doc');
        throw new Error(extracted.errorMessage ??
            (isLegacyDoc
                ? 'Legacy .doc files are not supported. Save as .docx and try again.'
                : 'Could not read this document.'));
    }
    const text = extracted.extractedText ?? extracted.excerpt;
    if (!text.trim()) {
        throw new Error('Could not read any text from this document.');
    }
    return extracted;
}
export function combineExtractedDocumentText(documents: Array<{
    fileName: string;
    text: string;
}>): string {
    return documents
        .map((document, index) => `--- Document ${index + 1}: ${document.fileName} ---\n${document.text}`)
        .join('\n\n');
}
export function buildTaskImportFileName(files: File[]): string {
    if (files.length === 1)
        return files[0]?.name ?? 'document';
    return `${files.length} documents`;
}
