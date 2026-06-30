import type { CollaborationChannelType, CollaborationMessage, CollaborationAttachment, CollaborationMention, CollaborationReaction, DirectConversation, DirectMessage, } from '@/types/collaboration';
import type { ClientTeamMember } from '@/types/clients';

// Re-export the existing Channel type from the legacy feature so we share one shape.
export type { CollaborationChannelType, CollaborationMessage, CollaborationAttachment, CollaborationMention, CollaborationReaction, DirectConversation, DirectMessage, };
export type { ClientTeamMember };

// Re-export Channel from the legacy feature to keep one source of truth.
export type { Channel } from '@/features/dashboard/collaboration/types';

export type WorkspaceMember = {
  id: string;
  name: string;
  email?: string;
  role?: string;
};

export type ChannelSummary = {
  lastMessage: string;
  lastTimestamp: string | null;
};

export type TypingParticipant = {
  name: string;
  role?: string | null;
};

export type PendingAttachment = {
  id: string;
  file: File;
  name: string;
  size: number;
  mimeType: string;
  sizeLabel: string;
  previewUrl?: string;
};

export type ConversationSelection = {
  type: 'channel' | 'dm' | null;
  channelId: string | null;
  conversationLegacyId: string | null;
};

export type MessageSearchResult = {
  message: CollaborationMessage;
  channelName: string;
  channelId: string;
  highlights: string[];
};
