/** Strip markdown/noise and clamp text for conversation list previews. */
export function formatConversationSnippet(raw: string | null | undefined, maxLength = 96): string {
    if (!raw?.trim())
        return '';
    const text = raw
        .replace(/```[\s\S]*?```/g, '[code]')
        .replace(/`([^`]+)`/g, '$1')
        .replace(/!\[[^\]]*\]\([^)]+\)/g, '[image]')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/\*\*([^*]+)\*\*/g, '$1')
        .replace(/\*([^*\n]+)\*/g, '$1')
        .replace(/_([^_\n]+)_/g, '$1')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    if (!text)
        return '';
    if (text.length <= maxLength)
        return text;
    return `${text.slice(0, Math.max(0, maxLength - 1)).trimEnd()}…`;
}

const MIME_TO_CATEGORY = {
    image: 'image',
    video: 'video',
    audio: 'audio',
    pdf: 'PDF',
    excel: 'Excel',
    document: 'document',
    file: 'file',
} as const;

type AttachmentCategory = keyof typeof MIME_TO_CATEGORY;

function getAttachmentCategory(attachment: { name?: string; type?: string | null } | null | undefined): AttachmentCategory {
    if (!attachment) return 'file';
    const type = (attachment.type ?? '').toLowerCase();
    const name = (attachment.name ?? '').toLowerCase();

    if (type.startsWith('image/')) return 'image';
    if (type.startsWith('video/')) return 'video';
    if (type.startsWith('audio/')) return 'audio';
    if (type.includes('pdf') || name.endsWith('.pdf')) return 'pdf';
    if (
        type.includes('spreadsheet') ||
        type.includes('excel') ||
        type === 'text/csv' ||
        name.endsWith('.xlsx') ||
        name.endsWith('.xls') ||
        name.endsWith('.csv')
    )
        return 'excel';
    if (
        type.includes('word') ||
        type.includes('msword') ||
        type.includes('document') ||
        type.includes('presentation') ||
        type.includes('powerpoint') ||
        name.endsWith('.doc') ||
        name.endsWith('.docx') ||
        name.endsWith('.ppt') ||
        name.endsWith('.pptx') ||
        name.endsWith('.odt') ||
        name.endsWith('.odp')
    )
        return 'document';
    return 'file';
}

function categoryLabel(category: AttachmentCategory): string {
    return MIME_TO_CATEGORY[category];
}

function categoryLabelPlural(category: AttachmentCategory): string {
    switch (category) {
        case 'image':
            return 'images';
        case 'video':
            return 'videos';
        case 'audio':
            return 'audio files';
        case 'pdf':
            return 'PDFs';
        case 'excel':
            return 'Excel files';
        case 'document':
            return 'documents';
        case 'file':
        default:
            return 'files';
    }
}

function singularSnippet(category: AttachmentCategory): string {
    switch (category) {
        case 'image':
            return 'Sent an image';
        case 'video':
            return 'Sent a video';
        case 'audio':
            return 'Sent an audio file';
        case 'pdf':
            return 'Sent a PDF';
        case 'excel':
            return 'Sent an Excel file';
        case 'document':
            return 'Sent a document';
        case 'file':
        default:
            return 'Sent a file';
    }
}

function joinLabels(labels: string[]): string {
    if (labels.length === 0) return '';
    if (labels.length === 1) return labels[0]!;
    if (labels.length === 2) return `${labels[0]} and ${labels[1]}`;
    return `${labels.slice(0, -1).join(', ')}, and ${labels[labels.length - 1]}`;
}

/** Build a sidebar snippet for attachment-only messages, e.g. "Sent an image" or "Sent PDF, and Excel". */
export function formatAttachmentSummary(
    attachments: Array<{ name?: string; type?: string | null }> | null | undefined,
): string | null {
    const list = attachments?.filter((a): a is NonNullable<typeof a> => Boolean(a)) ?? [];
    if (list.length === 0) return null;

    const categories = list.map(getAttachmentCategory);

    if (categories.length === 1) {
        return singularSnippet(categories[0]!);
    }

    const unique = [...new Set(categories)];
    if (unique.length === 1) {
        return `Sent ${categoryLabelPlural(unique[0]!)}`;
    }

    const labels = unique.map((category) => categoryLabel(category));
    return `Sent ${joinLabels(labels)}`;
}

/** Contain long tokens inside chat bubbles and markdown bodies. */
export const CHAT_MESSAGE_BODY_CLASS = 'max-w-full min-w-0 overflow-hidden break-words [overflow-wrap:anywhere]';
export const CHAT_MARKDOWN_CLASS = 'max-w-full min-w-0 space-y-2 [&_a]:break-all [&_code]:break-all [&_pre]:max-w-full [&_pre]:overflow-x-auto [&_table]:block [&_table]:max-w-full';
export const CHAT_LIST_PREVIEW_CLASS = 'min-w-0 flex-1 line-clamp-1 break-all text-xs text-muted-foreground';
export const CHAT_CONVERSATION_ROW_CLASS = 'flex w-full max-w-full min-w-0 items-center gap-3 overflow-hidden rounded-xl p-3 text-left';
