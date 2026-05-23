import type { RefObject } from 'react'

import type { AgentContextIds } from '@/lib/agent-context'
import type { AgentError } from '@/lib/agent-errors'
import type { AgentAttachmentContext } from '@/lib/agent-attachments'
import type { AgentMentionEntity } from '@/lib/agent-mentions'
import type {
  AgentExecutionStep,
  AgentMessageLifecycle,
  AgentMessageMetadata,
  AgentPendingConfirmation,
} from '@/lib/agent-message-lifecycle'

export type {
  AgentExecutionStep,
  AgentMessageLifecycle,
  AgentMessageMetadata,
  AgentPendingConfirmation,
} from '@/lib/agent-message-lifecycle'

export interface AgentMessage {
  id: string
  /** Stable client id for optimistic reconciliation */
  clientId: string
  type: 'user' | 'agent'
  content: string
  timestamp: Date
  route?: string | null
  status?: 'success' | 'error' | 'info' | 'warning'
  lifecycle?: AgentMessageLifecycle
  metadata?: AgentMessageMetadata
  steps?: AgentExecutionStep[]
  mentions?: AgentMentionEntity[]
  attachments?: AgentAttachmentContext[]
}

export interface AgentConversationSummary {
  id: string
  title: string | null
  startedAt: string | null
  lastMessageAt: string | null
  messageCount: number | null
  pinnedAt?: string | null
  archivedAt?: string | null
  previewSnippet?: string | null
}

export type ConnectionStatus = 'connected' | 'retrying' | 'disconnected'

export interface UseAgentModeReturn {
  /** Whether Agent Mode panel is open */
  isOpen: boolean
  /** Open/close the Agent Mode panel */
  setOpen: (open: boolean) => void
  /** Toggle panel open/closed */
  toggle: () => void
  /** Message history */
  messages: AgentMessage[]
  /** Whether agent is processing */
  isProcessing: boolean
  /** Process user input (text or voice transcript); pass retryClientId to resend in place */
  processInput: (
    text: string,
    options?: {
      retryClientId?: string
      mentions?: AgentMentionEntity[]
      confirmation?: {
        pending: AgentPendingConfirmation
        decision: 'confirm' | 'cancel' | 'edit'
      }
    },
  ) => void
  /** Confirm, cancel, or edit a pending write action */
  confirmPendingAction: (
    pending: AgentPendingConfirmation,
    decision: 'confirm' | 'cancel' | 'edit',
  ) => void
  /** Undo a recently completed agent write when supported */
  undoAgentAction: (messageId: string, undoHint: NonNullable<AgentMessageMetadata['undoHint']>) => Promise<void>
  /** Edit and resend the latest user message */
  editLastUserMessage: (text: string) => void
  /** Processing step timeline while awaiting agent response */
  processingSteps: AgentExecutionStep[]
  processingLabel: string
  /** Whether the message list is pinned to the bottom */
  isPinnedToBottom: boolean
  /** Scroll chat to latest message */
  scrollToLatest: () => void
  /** Mark that the user scrolled away from the bottom */
  onMessagesScroll: () => void
  /** Scroll container for the message list */
  scrollContainerRef: RefObject<HTMLDivElement | null>
  /** Current files attached as agent context */
  pendingAttachments: AgentAttachmentContext[]
  /** Add documents to the current request context */
  addAttachments: (files: FileList | File[]) => Promise<void>
  /** Remove a document from the current request context */
  removeAttachment: (attachmentId: string) => void
  /** Whether attachment text is still being extracted */
  isExtractingAttachments: boolean
  /** Clear message history */
  clearMessages: () => void
  /** Current conversation ID */
  conversationId: string | null

  /** Conversation history for the current user */
  history: AgentConversationSummary[]
  /** Whether history is currently being fetched */
  isHistoryLoading: boolean
  /** History list fetch error message */
  historyError: string | null
  /** Whether more history pages are available */
  historyHasMore: boolean
  /** Search query for history filtering */
  historySearch: string
  setHistorySearch: (value: string) => void
  /** Include archived conversations in history */
  showArchivedHistory: boolean
  setShowArchivedHistory: (value: boolean) => void
  /** Fetch latest history list */
  fetchHistory: (options?: { reset?: boolean }) => Promise<void>
  /** Load the next page of history */
  loadMoreHistory: () => Promise<void>
  /** Pin or unpin a conversation */
  setConversationPinned: (conversationId: string, pinned: boolean) => Promise<void>
  /** Archive or restore a conversation */
  setConversationArchived: (conversationId: string, archived: boolean) => Promise<void>
  /** Load a previous conversation into the chat */
  loadConversation: (conversationId: string) => Promise<void>
  /** Whether a previous conversation is being loaded */
  isConversationLoading: boolean
  /** Which previous conversation is currently loading */
  loadingConversationId: string | null

  /** Update a conversation title */
  updateConversationTitle: (conversationId: string, title: string) => Promise<void>
  /** Delete a conversation and its messages */
  deleteConversation: (conversationId: string) => Promise<void>
  /** Duplicate a conversation and its messages */
  duplicateConversation: (conversationId: string) => Promise<string | null>
  /** Export a conversation transcript */
  exportConversation: (
    conversationId: string,
    format?: 'json' | 'markdown',
  ) => Promise<{ content: string; title: string } | null>
  /** Copy share payload (markdown + deep link) for a conversation */
  shareConversation: (conversationId: string) => Promise<{ markdown: string; deepLink: string } | null>

  // Error handling
  /** Current error, if present */
  error: AgentError | null
  /** Clear current error */
  clearError: () => void
  /** Last failed message (for retry) */
  lastFailedMessage: string | null
  /** Retry the last failed message */
  retryLastMessage: () => void
  /** Re-submit the most recent user message (e.g. after a retryable agent action error) */
  retryLastUserTurn: () => void
  /** Connection status */
  connectionStatus: ConnectionStatus
  /** Rate limit countdown (seconds remaining) */
  rateLimitCountdown: number | null
  /** IDs derived from the current route + navigation context */
  activeContext: AgentContextIds
  /** Maximum allowed message length */
  maxMessageLength: number
  /** Current workspace id for agent storage */
  workspaceId: string | null
  /** Merge a persisted Excel export attachment onto an agent message */
  storeSpreadsheetExportForMessage: (messageId: string, attachment: AgentAttachmentContext) => void
}
