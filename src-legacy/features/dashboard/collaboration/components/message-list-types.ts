import type { CollaborationMention } from '@/types/collaboration';
export interface UnifiedMessage {
    id: string;
    senderId: string | null;
    senderName: string;
    senderRole?: string | null;
    content: string;
    createdAtMs: number;
    edited?: boolean;
    deleted?: boolean;
    reactions?: Array<{
        emoji: string;
        count: number;
        userIds: string[];
    }>;
    attachments?: Array<{
        url: string;
        name?: string;
        mimeType?: string;
        size?: number;
    }>;
    sharedTo?: string[];
    mentions?: CollaborationMention[];
    threadRootId?: string | null;
    threadReplyCount?: number;
    threadLastReplyAt?: string | null;
    isPinned?: boolean;
    deletedBy?: string | null;
    deletedAt?: string | null;
    readBy?: string[];
    deliveredTo?: string[];
}
