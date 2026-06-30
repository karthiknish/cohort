'use client';
import type { CollaborationAttachment } from '@/types/collaboration';
import { ChatMediaGallery, type ChatMediaAttachment } from '@/shared/ui/chat-media-gallery';
export interface MessageAttachmentsProps {
    attachments: CollaborationAttachment[];
    highlightTerms?: string[];
    compact?: boolean;
}
function toChatMediaAttachments(attachments: CollaborationAttachment[]): ChatMediaAttachment[] {
    return attachments.map((attachment) => ({
        name: attachment.name,
        url: attachment.url,
        type: attachment.type,
        size: attachment.size,
    }));
}
export function MessageAttachments({ attachments, highlightTerms, compact }: MessageAttachmentsProps) {
    return (<ChatMediaGallery attachments={toChatMediaAttachments(attachments)} highlightTerms={highlightTerms} compact={compact}/>);
}
