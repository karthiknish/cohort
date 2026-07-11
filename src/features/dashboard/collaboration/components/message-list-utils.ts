import type { CollaborationMessage } from '@/types/collaboration';
import type { UnifiedMessage } from './message-list-types';
export function collaborationToUnifiedMessage(msg: CollaborationMessage): UnifiedMessage {
    return {
        id: msg.id,
        senderId: msg.senderId,
        senderName: msg.senderName,
        senderRole: msg.senderRole,
        content: msg.content ?? '',
        createdAtMs: msg.createdAt ? new Date(msg.createdAt).getTime() : Date.now(),
        edited: msg.isEdited,
        deleted: msg.isDeleted,
        reactions: msg.reactions ?? undefined,
        attachments: msg.attachments?.map(a => ({
            url: a.url,
            name: a.name,
            mimeType: a.type ?? undefined,
            size: a.size || undefined,
        })) ?? undefined,
        sharedTo: msg.sharedTo ?? undefined,
        mentions: msg.mentions ?? undefined,
        threadRootId: msg.threadRootId ?? undefined,
        threadReplyCount: msg.threadReplyCount ?? undefined,
        threadLastReplyAt: msg.threadLastReplyAt ?? undefined,
        isPinned: msg.isPinned ?? undefined,
        deletedBy: msg.deletedBy ?? undefined,
        deletedAt: msg.deletedAt ?? undefined,
        readBy: msg.readBy ?? undefined,
        deliveredTo: msg.deliveredTo ?? undefined,
    };
}
