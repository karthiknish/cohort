'use client';
import type { CollaborationAttachment, CollaborationMessage } from '@/types/collaboration';
import { extractUrlsFromContent, isLikelyImageUrl } from '../lib/utils';
import { parsePollMessage } from '../lib/collaboration-poll-message';
import { ImageUrlPreview } from './image-url-preview';
import { LinkPreviewCard } from './link-preview-card';
import { MessageAttachments } from './message-attachments';
import { MessageContent } from './message-content';
import { DeletedMessageInfo, MessageEditForm } from './message-item-parts';
import { MessagePollCardBlock } from './message-poll-card-block';
import type { UnifiedMessage } from './message-list-types';
export function getSharePlatformLabel(platform: 'email'): string {
    if (platform === 'email')
        return 'Email';
    return platform;
}
export function renderMessageAttachmentsContent(message: UnifiedMessage) {
    if (!message.attachments || message.attachments.length === 0)
        return null;
    const attachments: CollaborationAttachment[] = message.attachments.map((attachment) => ({
        name: attachment.name ?? 'File',
        url: attachment.url,
        type: attachment.mimeType ?? null,
        size: attachment.size ? String(attachment.size) : null,
    }));
    return <MessageAttachments attachments={attachments}/>;
}
type RenderMessageContentOptions = {
    message: UnifiedMessage;
    originalMessage?: CollaborationMessage;
    highlightTerms?: string[];
    currentUserId?: string | null;
    isAdmin?: boolean;
    onVotePoll?: (messageLegacyId: string, optionIds: string[]) => Promise<void>;
    onEndPoll?: (messageLegacyId: string) => Promise<void>;
};
export function renderMessageContentBlock({ message, originalMessage, highlightTerms, currentUserId, isAdmin = false, onVotePoll, onEndPoll, }: RenderMessageContentOptions) {
    const content = originalMessage?.content ?? message.content ?? '';
    const poll = parsePollMessage(content);
    if (poll) {
        return (<MessagePollCardBlock message={message} poll={poll} currentUserId={currentUserId} isAdmin={isAdmin} onVotePoll={onVotePoll} onEndPoll={onEndPoll}/>);
    }
    const allUrls = extractUrlsFromContent(content);
    const imageUrlPreviews = allUrls.filter((url) => isLikelyImageUrl(url));
    const linkPreviews = allUrls.filter((url) => !isLikelyImageUrl(url));
    return (<>
      <MessageContent content={content} mentions={originalMessage?.mentions ?? message.mentions} highlightTerms={highlightTerms}/>
      {imageUrlPreviews.length > 0 ? (<div className="mt-2 flex flex-wrap gap-2">
          {imageUrlPreviews.map((url) => (<ImageUrlPreview key={`${message.id}-img-${url}`} url={url}/>))}
        </div>) : null}
      {linkPreviews.length > 0 ? (<div className="mt-2 space-y-2">
          {linkPreviews.map((url) => (<LinkPreviewCard key={`${message.id}-link-${url}`} url={url}/>))}
        </div>) : null}
    </>);
}
export function renderDeletedMessageInfo(message: UnifiedMessage, deletedInfoByMessage?: Record<string, {
    deletedBy: string | null;
    deletedAt: string | null;
}>) {
    const info = deletedInfoByMessage?.[message.id] ?? {
        deletedBy: message.deletedBy ?? null,
        deletedAt: message.deletedAt ?? null,
    };
    if (!info.deletedBy && !info.deletedAt) {
        return <p className="text-sm italic text-muted-foreground">Message removed</p>;
    }
    return <DeletedMessageInfo deletedBy={info.deletedBy} deletedAt={info.deletedAt}/>;
}
export function renderMessageEditForm(message: UnifiedMessage, editingMessageId: string | null, editingValue: string, onChange: (value: string) => void, onConfirm: () => void, onCancel: () => void, isUpdating: boolean, editingPreview: string) {
    if (editingMessageId !== message.id) {
        return null;
    }
    return (<MessageEditForm value={editingValue} onChange={onChange} onConfirm={onConfirm} onCancel={onCancel} isUpdating={isUpdating} editingPreview={editingPreview}/>);
}
