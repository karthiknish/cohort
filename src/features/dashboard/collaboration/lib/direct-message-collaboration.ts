import type { CollaborationMessage, DirectMessage } from '@/types/collaboration'

export function directMessageToCollaborationMessage(message: DirectMessage): CollaborationMessage {
  return {
    id: message.legacyId,
    channelType: 'team',
    clientId: null,
    projectId: null,
    content: message.content,
    senderId: message.senderId,
    senderName: message.senderName,
    senderRole: message.senderRole ?? null,
    createdAt: new Date(message.createdAtMs).toISOString(),
    updatedAt: message.editedAtMs ? new Date(message.editedAtMs).toISOString() : null,
    isEdited: Boolean(message.edited),
    deletedAt: message.deletedAtMs ? new Date(message.deletedAtMs).toISOString() : null,
    deletedBy: message.deletedBy ?? null,
    isDeleted: Boolean(message.deleted),
    attachments: message.attachments?.map((attachment) => ({
      name: attachment.name,
      url: attachment.url,
      storageId: attachment.storageId ?? undefined,
      type: attachment.type ?? null,
      size: attachment.size ?? null,
    })),
    reactions: message.reactions ?? undefined,
    readBy: message.readBy ?? [],
    deliveredTo: message.deliveredTo ?? [],
  }
}
