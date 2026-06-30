import { slugifyMeetingTitle } from '@/lib/slugify';
export function buildMeetingArtifactFilename(title: string, kind: 'notes' | 'notes-pdf' | 'transcript'): string {
    const slug = slugifyMeetingTitle(title);
    if (kind === 'notes-pdf') {
        return `${slug}-notes.pdf`;
    }
    return `${slug}-${kind}.md`;
}
export function downloadPdfArtifact(blob: Blob, filename: string): void {
    if (typeof document === 'undefined') {
        return;
    }
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.rel = 'noopener';
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => {
        URL.revokeObjectURL(url);
    }, 0);
}
export function downloadTextArtifact(content: string, filename: string): void {
    if (typeof document === 'undefined') {
        return;
    }
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.rel = 'noopener';
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => {
        URL.revokeObjectURL(url);
    }, 0);
}
export async function downloadUrlArtifact(url: string, filename: string): Promise<void> {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error('Unable to download the archived meeting file.');
    }
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = filename;
    link.rel = 'noopener';
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => {
        URL.revokeObjectURL(objectUrl);
    }, 0);
}
