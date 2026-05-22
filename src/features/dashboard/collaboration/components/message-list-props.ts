import type { UnifiedMessage } from './message-list-types'

export interface MessageListProps {
  messages: UnifiedMessage[]
  currentUserId: string | null
  currentUserRole?: string | null
  isLoading: boolean
  hasMore: boolean
  onLoadMore: () => void
  onToggleReaction: (messageId: string, emoji: string) => Promise<void>
  reactionPendingByMessage?: Record<string, string | null>
  renderMessageExtras?: (message: UnifiedMessage) => React.ReactNode
  renderMessageActions?: (message: UnifiedMessage) => React.ReactNode
  renderMessageContent?: React.ComponentType<{ message: UnifiedMessage }>
  renderMessageAttachments?: (message: UnifiedMessage) => React.ReactNode
  renderMessageFooter?: (message: UnifiedMessage) => React.ReactNode
  renderThreadSection?: (message: UnifiedMessage) => React.ReactNode
  renderEditForm?: (message: UnifiedMessage) => React.ReactNode
  renderDeletedInfo?: (message: UnifiedMessage) => React.ReactNode
  renderMessageWrapper?: (message: UnifiedMessage, children: React.ReactNode) => React.ReactNode
  emptyState?: React.ReactNode
  loadingSkeleton?: React.ReactNode
  variant?: 'channel' | 'dm'
  showAvatars?: boolean
  compact?: boolean
  onEditMessage?: (messageId: string, content: string) => void
  onDeleteMessage?: (messageId: string) => void
  onReply?: (message: UnifiedMessage) => void
  onCreateTask?: (message: UnifiedMessage) => void
  onRefresh?: () => Promise<void> | void
  editingMessageId?: string | null
  deletingMessageId?: string | null
  updatingMessageId?: string | null
  focusMessageId?: string | null
  focusThreadId?: string | null
  typingIndicatorText?: string
}
