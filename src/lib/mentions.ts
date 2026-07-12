export const MENTION_PROTOCOL = 'mention://';
export function buildMentionSlug(name: string): string {
    return encodeURIComponent(name.trim().toLowerCase());
}
export function buildMentionMarkup(name: string): string {
    const trimmed = name.trim();
    const display = trimmed.startsWith('@') ? trimmed : `@${trimmed}`;
    const slug = buildMentionSlug(trimmed);
    return `[${display}](${MENTION_PROTOCOL}${slug})`;
}
export type ExtractedMention = {
    slug: string;
    name: string;
};
const MENTION_REGEX = /\[([^\]]+)\]\(mention:\/\/([^\)]+)\)/g;
const MENTION_DISPLAY_REGEX = /\[([^\]]+)\]\(mention:\/\/[^\)]+\)/g;
export function stripMentionMarkdown(text: string): string {
    if (!text) return text;
    return text.replace(MENTION_DISPLAY_REGEX, (_, display: string) => display);
}
function escapeRegExp(text: string): string {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
export function convertMentionsToMarkdown(text: string, participants: { name: string }[]): string {
    if (!text || participants.length === 0) return text;
    let result = text;
    for (const participant of participants) {
        const name = participant.name.trim();
        if (!name) continue;
        const display = name.startsWith('@') ? name : `@${name}`;
        const slug = buildMentionSlug(name);
        const markdown = `[${display}](${MENTION_PROTOCOL}${slug})`;
        result = result.replace(new RegExp(escapeRegExp(display), 'g'), markdown);
    }
    return result;
}
export function extractMentionsFromContent(content: string): ExtractedMention[] {
    if (!content) {
        return [];
    }
    const mentions: ExtractedMention[] = [];
    const seen = new Set<string>();
    let match: RegExpExecArray | null;
    while ((match = MENTION_REGEX.exec(content)) !== null) {
        const [, displayLabel, rawSlug] = match;
        if (!displayLabel || !rawSlug) {
            continue;
        }
        const normalizedSlug = rawSlug.trim();
        if (!normalizedSlug || seen.has(normalizedSlug)) {
            continue;
        }
        seen.add(normalizedSlug);
        const decoded = decodeURIComponent(normalizedSlug);
        const name = decoded && decoded.length > 0 ? decoded : displayLabel.replace(/^@/, '');
        mentions.push({
            slug: normalizedSlug,
            name,
        });
    }
    return mentions;
}
