export type DocumentKind = 'pdf' | 'pptx' | 'unknown';
export function getFileNameFromUrl(src: string): string {
    const pathWithMaybeHash = src.split('?')[0] ?? '';
    const pathOnly = pathWithMaybeHash.split('#')[0] ?? '';
    const segments = pathOnly.split('/').filter(Boolean);
    const lastSegment = segments[segments.length - 1];
    if (typeof lastSegment === 'string' && lastSegment.includes('.')) {
        return lastSegment;
    }
    return 'presentation';
}
export function getDocumentKind(fileName: string): DocumentKind {
    const lower = fileName.toLowerCase();
    if (lower.endsWith('.pdf'))
        return 'pdf';
    if (lower.endsWith('.pptx') || lower.endsWith('.ppt'))
        return 'pptx';
    return 'unknown';
}
export function documentKindLabel(kind: DocumentKind): string {
    switch (kind) {
        case 'pdf':
            return 'PDF';
        case 'pptx':
            return 'PowerPoint';
        default:
            return 'Document';
    }
}
