export function inferUploadMimeType(fileName: string, mimeType?: string): string {
    if (mimeType && mimeType.trim().length > 0)
        return mimeType;
    const lower = fileName.toLowerCase();
    if (lower.endsWith('.mp4') || lower.endsWith('.mov') || lower.endsWith('.webm'))
        return 'video/mp4';
    if (lower.endsWith('.png'))
        return 'image/png';
    if (lower.endsWith('.gif'))
        return 'image/gif';
    if (lower.endsWith('.webp'))
        return 'image/webp';
    return 'image/jpeg';
}
export function isVideoMimeType(mimeType: string): boolean {
    return mimeType.startsWith('video/');
}
export function asRecord(value: unknown): Record<string, unknown> | null {
    if (!value || typeof value !== 'object' || Array.isArray(value))
        return null;
    return value as Record<string, unknown>;
}
export function asNonEmptyString(value: unknown): string | undefined {
    if (typeof value !== 'string')
        return undefined;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
}
