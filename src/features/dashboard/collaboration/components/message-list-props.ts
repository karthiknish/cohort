import type { MessageListRenderers } from './message-list-render-context'
import type { MessageListRendererProps } from './message-list-render-utils'
import type { UnifiedMessage } from './message-list-types'

export interface MessageListProps extends MessageListRendererProps {
  messages: UnifiedMessage[]
  currentUserId: string | null
  currentUserRole?: string | null
  isLoading: boolean
  hasMore: boolean
  onLoadMore: () => void
  onToggleReaction: (messageId: string, emoji: string) => Promise<void>
  reactionPendingByMessage?: Record<string, string | null>
  renderers?: MessageListRenderers
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
