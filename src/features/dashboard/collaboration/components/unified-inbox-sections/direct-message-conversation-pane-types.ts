import type { ClientTeamMember } from '@/types/clients'

import type { DirectConversation, DirectMessage } from '../../hooks/use-direct-messages'
import type { PendingAttachment } from '../../hooks/types'
import type { UnifiedMessage } from '../message-list-types'

export type DirectMessageConversationPaneProps = {
  mentionParticipants: ClientTeamMember[]
  currentUserId: string | null
  dmDeleteMessage?: (messageLegacyId: string) => Promise<void>
  dmEditMessage?: (messageLegacyId: string, newContent: string) => Promise<void>
  dmHasMoreMessages: boolean
  dmIsLoadingMessages: boolean
  dmIsLoadingMore: boolean
  dmIsSending: boolean
  dmLoadMoreMessages: () => void
  dmMessageInput: string
  dmMessageSearchQuery: string
  dmMessagesForPane: DirectMessage[]
  dmMuteConversation: (muted: boolean) => Promise<void>
  dmSearchHighlights: string[]
  dmSearchingMessages: boolean
  dmToggleReaction: (messageLegacyId: string, emoji: string) => Promise<void>
  handleSendDirectMessage: (content: string) => Promise<void>
  isDmSearchActive: boolean
  onAddAttachments: (files: FileList | File[]) => void
  onArchiveConversation: (archived: boolean) => Promise<void>
  onBackToInbox?: () => void
  onDmMessageSearchChange: (value: string) => void
  onRemoveAttachment: (attachmentId: string) => void
  pendingAttachments: PendingAttachment[]
  selectedDM: DirectConversation
  setActiveDmMessageInput: (value: string) => void
  uploading: boolean
  onStartNewDM?: () => void
  messagesError: string | null
  onRetryMessages: () => void
  onShareToPlatform?: (message: UnifiedMessage, platform: 'email') => Promise<void>
  onComposerFocus?: () => void
  onComposerBlur?: () => void
  typingIndicatorText?: string
  onCreateTask?: (message: UnifiedMessage) => void
  currentUserRole?: string | null
  workspaceId?: string | null
  deepLinkMessageId?: string | null
  onClearDeepLink?: () => void
}
