import type { CollaborationMessage } from '@/types/collaboration';
export function getThreadRootId(message: CollaborationMessage): string {
    return typeof message.threadRootId === 'string' && message.threadRootId.trim().length > 0
        ? message.threadRootId.trim()
        : message.id;
}
