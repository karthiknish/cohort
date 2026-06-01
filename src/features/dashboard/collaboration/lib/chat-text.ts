/** Strip markdown/noise and clamp text for conversation list previews. */
export function formatConversationSnippet(raw: string | null | undefined, maxLength = 96): string {
    if (!raw?.trim())
        return '';
    const text = raw
        .replace(/```[\s\S]*?```/g, '[code]')
        .replace(/`([^`]+)`/g, '$1')
        .replace(/!\[[^\]]*\]\([^)]+\)/g, '[image]')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    if (!text)
        return '';
    if (text.length <= maxLength)
        return text;
    return `${text.slice(0, Math.max(0, maxLength - 1)).trimEnd()}…`;
}
/** Contain long tokens inside chat bubbles and markdown bodies. */
export const CHAT_MESSAGE_BODY_CLASS = 'max-w-full min-w-0 overflow-hidden break-words [overflow-wrap:anywhere]';
export const CHAT_MARKDOWN_CLASS = 'max-w-full min-w-0 space-y-2 [&_a]:break-all [&_code]:break-all [&_pre]:max-w-full [&_pre]:overflow-x-auto [&_table]:block [&_table]:max-w-full';
export const CHAT_LIST_PREVIEW_CLASS = 'min-w-0 flex-1 line-clamp-1 break-all text-xs text-muted-foreground';
export const CHAT_CONVERSATION_ROW_CLASS = 'flex w-full max-w-full min-w-0 items-center gap-3 overflow-hidden rounded-xl p-3 text-left';
