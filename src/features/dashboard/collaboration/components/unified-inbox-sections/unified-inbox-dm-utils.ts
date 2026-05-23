import type { DirectMessage } from '../../hooks/use-direct-messages'

export function directMessageToUnifiedMessage(message: DirectMessage) {
  return {
    id: message.legacyId,
    senderId: message.senderId,
    senderName: message.senderName,
    senderRole: message.senderRole,
    content: message.content,
    createdAtMs: message.createdAtMs,
    edited: message.edited,
    deleted: message.deleted,
    deletedBy: message.deletedBy ?? undefined,
    deletedAt:
      typeof message.deletedAtMs === 'number' ? new Date(message.deletedAtMs).toISOString() : undefined,
    reactions: message.reactions ?? undefined,
    attachments:
      message.attachments?.map((attachment) => ({
        url: attachment.url,
        name: attachment.name,
        mimeType: attachment.type ?? undefined,
        size: attachment.size ? parseInt(attachment.size, 10) : undefined,
      })) ?? undefined,
    sharedTo: message.sharedTo ?? undefined,
    readBy: message.readBy ?? undefined,
    deliveredTo: message.deliveredTo ?? undefined,
  }
}
