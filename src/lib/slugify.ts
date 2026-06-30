export type SlugifyOptions = {
    /** Max slug length after normalization. Default 48. */
    maxLength?: number;
    /** Used when the input normalizes to an empty string. Default `"item"`. */
    fallback?: string;
};
/**
 * Normalize arbitrary text into a filesystem-safe slug segment.
 */
export function slugify(value: string, options: SlugifyOptions = {}): string {
    const maxLength = options.maxLength ?? 48;
    const fallback = options.fallback ?? 'item';
    const base = value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, maxLength);
    return base.length > 0 ? base : fallback;
}
export function slugifyMeetingTitle(title: string): string {
    return slugify(title, { maxLength: 48, fallback: 'meeting' });
}
/** Legacy meeting ids (Convex `legacyId` on create) — keep 40 chars for historical compatibility. */
export function slugifyMeetingLegacyId(title: string): string {
    return slugify(title, { maxLength: 40, fallback: 'meeting' });
}
export function slugifyProposalLabel(label: string): string {
    return slugify(label, { maxLength: 48, fallback: 'proposal' });
}
export function slugifyClientName(name: string): string {
    return slugify(name, { maxLength: 60, fallback: `client-${Date.now()}` });
}
