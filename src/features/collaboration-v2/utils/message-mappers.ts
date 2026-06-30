import type {
  CollaborationAttachment,
  CollaborationChannelType,
  CollaborationMessage,
  CollaborationMessageFormat,
  CollaborationMention,
  CollaborationReaction,
  DirectConversation,
  DirectMessage,
  DirectMessageAttachment,
  DirectMessageReaction,
} from '@/types/collaboration';

type MapChannelMessageOptions = {
  fallbackChannelType: CollaborationChannelType;
  fallbackClientId?: string | null;
  fallbackProjectId?: string | null;
  fallbackSenderId?: string | null;
  fallbackSenderName?: string;
  fallbackSenderRole?: string | null;
  fallbackThreadRootId?: string | null;
  fallbackCreatedAtIso?: string | null;
};

function toStringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value) || value.length === 0) return undefined;
  const normalized = value.filter((entry): entry is string => typeof entry === 'string');
  return normalized.length > 0 ? normalized : undefined;
}

function toSharedPlatforms(value: unknown): Array<'email'> | undefined {
  if (!Array.isArray(value) || value.length === 0) return undefined;
  const normalized = value.filter((entry): entry is 'email' => entry === 'email');
  return normalized.length > 0 ? normalized : undefined;
}

function toChannelType(value: unknown, fallback: CollaborationChannelType): CollaborationChannelType {
  if (value === 'client' || value === 'team' || value === 'project') return value;
  return fallback;
}

function toReactions(value: unknown): CollaborationReaction[] | undefined {
  if (!Array.isArray(value) || value.length === 0) return undefined;
  return value as CollaborationReaction[];
}

function toMentions(value: unknown): CollaborationMention[] | undefined {
  if (!Array.isArray(value) || value.length === 0) return undefined;
  return value as CollaborationMention[];
}

function toAttachments(value: unknown): CollaborationAttachment[] | undefined {
  if (!Array.isArray(value) || value.length === 0) return undefined;
  return value as CollaborationAttachment[];
}

export function mapChannelMessageRow(
  row: unknown,
  options: MapChannelMessageOptions,
): CollaborationMessage | null {
  const item = (row ?? {}) as Record<string, unknown>;
  const id = String(item.legacyId ?? '');
  if (!id) return null;

  const {
    fallbackChannelType,
    fallbackClientId = null,
    fallbackProjectId = null,
    fallbackSenderId = null,
    fallbackSenderName = 'Unknown teammate',
    fallbackSenderRole = null,
    fallbackThreadRootId = null,
    fallbackCreatedAtIso = null,
  } = options;

  return {
    id,
    channelType: toChannelType(item.channelType, fallbackChannelType),
    clientId: typeof item.clientId === 'string' ? item.clientId : fallbackClientId,
    projectId: typeof item.projectId === 'string' ? item.projectId : fallbackProjectId,
    senderId: typeof item.senderId === 'string' ? item.senderId : fallbackSenderId,
    senderName: typeof item.senderName === 'string' ? item.senderName : fallbackSenderName,
    senderRole: typeof item.senderRole === 'string' ? item.senderRole : fallbackSenderRole,
    content: item.deleted || item.deletedAtMs ? '' : String(item.content ?? ''),
    createdAt:
      typeof item.createdAtMs === 'number' ? new Date(item.createdAtMs).toISOString() : fallbackCreatedAtIso,
    updatedAt:
      typeof item.updatedAtMs === 'number' ? new Date(item.updatedAtMs).toISOString() : null,
    isEdited: Boolean(item.updatedAtMs && item.createdAtMs && item.updatedAtMs !== item.createdAtMs),
    deletedAt:
      typeof item.deletedAtMs === 'number' ? new Date(item.deletedAtMs).toISOString() : null,
    deletedBy: typeof item.deletedBy === 'string' ? item.deletedBy : null,
    isDeleted: Boolean(item.deleted || item.deletedAtMs),
    attachments: toAttachments(item.attachments),
    format: (item.format === 'plaintext' ? 'plaintext' : 'markdown') as CollaborationMessageFormat,
    mentions: toMentions(item.mentions),
    reactions: toReactions(item.reactions),
    readBy: toStringArray(item.readBy),
    deliveredTo: toStringArray(item.deliveredTo),
    isPinned: Boolean(item.isPinned),
    pinnedAt:
      typeof item.pinnedAtMs === 'number' ? new Date(item.pinnedAtMs).toISOString() : null,
    pinnedBy: typeof item.pinnedBy === 'string' ? item.pinnedBy : null,
    sharedTo: toSharedPlatforms(item.sharedTo),
    parentMessageId: typeof item.parentMessageId === 'string' ? item.parentMessageId : null,
    threadRootId: typeof item.threadRootId === 'string' ? item.threadRootId : fallbackThreadRootId,
    threadReplyCount: typeof item.threadReplyCount === 'number' ? item.threadReplyCount : undefined,
    threadLastReplyAt:
      typeof item.threadLastReplyAtMs === 'number'
        ? new Date(item.threadLastReplyAtMs).toISOString()
        : null,
  };
}

export function mapThreadReplyRow(row: unknown): CollaborationMessage {
  const item = (row ?? {}) as Record<string, unknown>;
  const id = String(item.legacyId ?? '');
  return {
    id,
    channelType: toChannelType(item.channelType, 'team'),
    clientId: typeof item.clientId === 'string' ? item.clientId : null,
    projectId: typeof item.projectId === 'string' ? item.projectId : null,
    senderId: typeof item.senderId === 'string' ? item.senderId : null,
    senderName: typeof item.senderName === 'string' ? item.senderName : 'Unknown teammate',
    senderRole: typeof item.senderRole === 'string' ? item.senderRole : null,
    content: item.deleted || item.deletedAtMs ? '' : String(item.content ?? ''),
    createdAt:
      typeof item.createdAtMs === 'number' ? new Date(item.createdAtMs).toISOString() : null,
    updatedAt:
      typeof item.updatedAtMs === 'number' ? new Date(item.updatedAtMs).toISOString() : null,
    isEdited: Boolean(item.updatedAtMs && item.createdAtMs && item.updatedAtMs !== item.createdAtMs),
    deletedAt:
      typeof item.deletedAtMs === 'number' ? new Date(item.deletedAtMs).toISOString() : null,
    deletedBy: typeof item.deletedBy === 'string' ? item.deletedBy : null,
    isDeleted: Boolean(item.deleted || item.deletedAtMs),
    attachments: toAttachments(item.attachments),
    format: (item.format === 'plaintext' ? 'plaintext' : 'markdown') as CollaborationMessageFormat,
    mentions: toMentions(item.mentions),
    reactions: toReactions(item.reactions),
    readBy: toStringArray(item.readBy),
    deliveredTo: toStringArray(item.deliveredTo),
    isPinned: Boolean(item.isPinned),
    pinnedAt:
      typeof item.pinnedAtMs === 'number' ? new Date(item.pinnedAtMs).toISOString() : null,
    pinnedBy: typeof item.pinnedBy === 'string' ? item.pinnedBy : null,
    sharedTo: toSharedPlatforms(item.sharedTo),
    parentMessageId: typeof item.parentMessageId === 'string' ? item.parentMessageId : null,
    threadRootId: typeof item.threadRootId === 'string' ? item.threadRootId : null,
    threadReplyCount: undefined,
    threadLastReplyAt: null,
  };
}

type RawDirectConversation = {
  _id: string;
  legacyId: string;
  otherParticipantId: string;
  otherParticipantName: string;
  otherParticipantRole?: string | null;
  lastMessageSnippet?: string | null;
  lastMessageAtMs?: number | null;
  lastMessageSenderId?: string | null;
  isRead: boolean;
  unreadCount?: number;
  isArchived: boolean;
  isMuted: boolean;
  createdAtMs: number;
  updatedAtMs: number;
};

export function mapDirectConversationRow(row: RawDirectConversation): DirectConversation {
  return {
    id: row._id,
    legacyId: row.legacyId,
    otherParticipantId: row.otherParticipantId,
    otherParticipantName: row.otherParticipantName,
    otherParticipantRole: row.otherParticipantRole,
    lastMessageSnippet: row.lastMessageSnippet,
    lastMessageAtMs: row.lastMessageAtMs,
    lastMessageSenderId: row.lastMessageSenderId,
    isRead: row.isRead,
    unreadCount: row.unreadCount,
    isArchived: row.isArchived,
    isMuted: row.isMuted,
    createdAtMs: row.createdAtMs,
    updatedAtMs: row.updatedAtMs,
  };
}

function toDirectMessageAttachments(value: unknown): DirectMessageAttachment[] | null {
  if (!Array.isArray(value)) return null;
  return value as DirectMessageAttachment[];
}

function toDirectMessageReactions(value: unknown): DirectMessageReaction[] | null {
  if (!Array.isArray(value)) return null;
  return value as DirectMessageReaction[];
}

type RawDirectMessage = {
  _id?: string;
  legacyId?: string;
  conversationLegacyId?: string;
  senderId?: string;
  senderName?: string;
  senderRole?: string | null;
  content?: string;
  edited?: boolean;
  editedAtMs?: number | null;
  deleted?: boolean;
  deletedAtMs?: number | null;
  deletedBy?: string | null;
  attachments?: unknown;
  reactions?: unknown;
  readBy?: unknown;
  deliveredTo?: unknown;
  readAtMs?: number | null;
  sharedTo?: unknown;
  createdAtMs?: number;
  updatedAtMs?: number | null;
};

export function mapDirectMessageRow(row: Record<string, unknown>): DirectMessage {
  const item = row as RawDirectMessage;
  return {
    id: String(item._id ?? ''),
    legacyId: String(item.legacyId ?? ''),
    conversationLegacyId: item.conversationLegacyId,
    senderId: String(item.senderId ?? ''),
    senderName: typeof item.senderName === 'string' ? item.senderName : 'Unknown teammate',
    senderRole: typeof item.senderRole === 'string' ? item.senderRole : null,
    content: typeof item.content === 'string' ? item.content : '',
    edited: Boolean(item.edited),
    editedAtMs: typeof item.editedAtMs === 'number' ? item.editedAtMs : null,
    deleted: Boolean(item.deleted),
    deletedAtMs: typeof item.deletedAtMs === 'number' ? item.deletedAtMs : null,
    deletedBy: typeof item.deletedBy === 'string' ? item.deletedBy : null,
    attachments: toDirectMessageAttachments(item.attachments),
    reactions: toDirectMessageReactions(item.reactions),
    readBy: Array.isArray(item.readBy)
      ? item.readBy.filter((value): value is string => typeof value === 'string')
      : [],
    deliveredTo: Array.isArray(item.deliveredTo)
      ? item.deliveredTo.filter((value): value is string => typeof value === 'string')
      : [],
    readAtMs: typeof item.readAtMs === 'number' ? item.readAtMs : null,
    sharedTo: Array.isArray(item.sharedTo)
      ? item.sharedTo.filter((value): value is 'email' => value === 'email')
      : null,
    createdAtMs: typeof item.createdAtMs === 'number' ? item.createdAtMs : 0,
    updatedAtMs: typeof item.updatedAtMs === 'number' ? item.updatedAtMs : null,
  };
}
