import { isLikelyImageUrl } from '@/features/dashboard/collaboration/utils';
import type { AttachmentKind, ChatMediaAttachment } from './chat-media-gallery-types';
export function getAttachmentKind(attachment: ChatMediaAttachment): AttachmentKind {
    const type = (attachment.type || '').toLowerCase();
    const url = attachment.url || '';
    const name = attachment.name.toLowerCase();
    if (isLikelyImageUrl(url) || type.startsWith('image/'))
        return 'image';
    if (type.startsWith('video/') || /\.(mp4|mov|webm|ogg)(\?.*)?$/i.test(url))
        return 'video';
    if (type.startsWith('audio/') || /\.(mp3|wav|m4a|aac)(\?.*)?$/i.test(url))
        return 'audio';
    if (type.includes('pdf') || name.endsWith('.pdf') || url.toLowerCase().includes('.pdf'))
        return 'pdf';
    if (type.includes('spreadsheet') ||
        type.includes('excel') ||
        /\.(xlsx?|csv)(\?.*)?$/i.test(name)) {
        return 'spreadsheet';
    }
    if (type.includes('zip') || /\.(zip|rar|7z)(\?.*)?$/i.test(name))
        return 'archive';
    return 'file';
}
