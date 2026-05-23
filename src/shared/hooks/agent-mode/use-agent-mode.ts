'use client'

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { usePathname } from 'next/navigation'

import { deriveActiveContextFromPath } from '@/lib/agent-context'
import {
  upsertAgentMessage,
  type AgentExecutionStep,
  type AgentMessageLifecycle,
  type AgentMessageMetadata,
} from '@/lib/agent-message-lifecycle'
import { useAuth } from '@/shared/contexts/auth-context'
import { useClientContext } from '@/shared/contexts/client-context'
import { useNavigationContext } from '@/shared/contexts/navigation-context'

import type { AgentAttachmentContext } from '@/lib/agent-attachments'

import { useAgentAttachments } from './use-agent-attachments'
import { useAgentConversationHistory } from './use-agent-conversation-history'
import { useAgentSend } from './use-agent-send'
import { AGENT_MAX_MESSAGE_LENGTH, generateId } from './stored-message-utils'
import type { AgentMessage, UseAgentModeReturn } from './types'

const AGENT_OPEN_STORAGE_KEY = 'cohorts.agentMode.open'

export function useAgentMode(): UseAgentModeReturn {
  const pathname = usePathname()
  const { user } = useAuth()
  const { selectedClientId } = useClientContext()
  const { navigationState } = useNavigationContext()
  const workspaceId = user?.agencyId ? String(user.agencyId) : null
  const activeContext = useMemo(() => {
    const pathContext = deriveActiveContextFromPath(pathname)

    return {
      activeProposalId: pathContext.activeProposalId,
      activeProjectId: pathContext.activeProjectId ?? navigationState.projectId ?? undefined,
      activeClientId: pathContext.activeClientId ?? selectedClientId ?? undefined,
    }
  }, [navigationState.projectId, pathname, selectedClientId])

  const [isOpen, setOpenState] = useState(() => {
    if (typeof window === 'undefined') {
      return false
    }
    return window.sessionStorage.getItem(AGENT_OPEN_STORAGE_KEY) === '1'
  })

  const setOpen = useCallback((open: boolean) => {
    setOpenState(open)
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem(AGENT_OPEN_STORAGE_KEY, open ? '1' : '0')
    }
  }, [])

  const [messages, setMessages] = useState<AgentMessage[]>([])
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [isPinnedToBottom, setIsPinnedToBottom] = useState(true)
  const scrollContainerRef = useRef<HTMLDivElement | null>(null)

  const {
    pendingAttachments,
    setPendingAttachments,
    isExtractingAttachments,
    addAttachments,
    removeAttachment,
    clearAttachments,
  } = useAgentAttachments(workspaceId)

  const toggle = useCallback(() => {
    setOpen(!isOpen)
  }, [isOpen, setOpen])

  const scrollToLatest = useCallback(() => {
    const element = scrollContainerRef.current
    if (element) {
      element.scrollTop = element.scrollHeight
    }
    setIsPinnedToBottom(true)
  }, [])

  const onMessagesScroll = useCallback(() => {
    const element = scrollContainerRef.current
    if (!element) return
    const distanceFromBottom = element.scrollHeight - element.scrollTop - element.clientHeight
    setIsPinnedToBottom(distanceFromBottom < 80)
  }, [])

  const upsertMessage = useCallback((message: AgentMessage) => {
    setMessages((prev) => upsertAgentMessage(prev, message))
    return message
  }, [])

  const addMessage = useCallback((
    type: 'user' | 'agent',
    content: string | unknown,
    route?: string | null,
    status?: 'success' | 'error' | 'info' | 'warning',
    metadata?: AgentMessageMetadata,
    options?: {
      clientId?: string
      lifecycle?: AgentMessageLifecycle
      persistedId?: string
      steps?: AgentExecutionStep[]
    },
  ) => {
    const safeContent = typeof content === 'string' ? content : String(content ?? '')
    const clientId = options?.clientId ?? generateId()
    const message: AgentMessage = {
      id: options?.persistedId ?? clientId,
      clientId,
      type,
      content: safeContent,
      timestamp: new Date(),
      route,
      status,
      lifecycle: options?.lifecycle,
      metadata,
      steps: options?.steps,
    }
    return upsertMessage(message)
  }, [upsertMessage])

  const send = useAgentSend({
    workspaceId,
    activeContext,
    messages,
    setMessages,
    conversationId,
    setConversationId,
    pendingAttachments,
    setPendingAttachments,
    clearAttachments,
    isExtractingAttachments,
    isPinnedToBottom,
    scrollToLatest,
    upsertMessage,
    addMessage,
    setOpen,
  })

  const historyApi = useAgentConversationHistory({
    workspaceId,
    userId: user?.id,
    conversationId,
    messages,
    setMessages,
    setConversationId,
    addMessage,
    handleError: send.handleError,
    setIsProcessing: send.setIsProcessing,
    clearError: send.clearError,
  })

  const clearMessages = useCallback(() => {
    setMessages([])
    setConversationId(null)
    send.clearAttachmentsForReset()
    send.clearError()
  }, [send])

  const storeSpreadsheetExportForMessage = useCallback(
    (messageId: string, attachment: AgentAttachmentContext) => {
      setMessages((prev) =>
        prev.map((message) => {
          if (message.id !== messageId) return message
          const existing = message.attachments ?? []
          const withoutDuplicate = existing.filter((item) => item.id !== attachment.id)
          return {
            ...message,
            attachments: [...withoutDuplicate, attachment],
            metadata: message.metadata
              ? {
                  ...message.metadata,
                  data: {
                    ...(message.metadata.data ?? {}),
                    storedExport: attachment,
                  },
                }
              : message.metadata,
          }
        }),
      )
    },
    [],
  )

  return {
    isOpen,
    setOpen,
    toggle,
    activeContext,
    maxMessageLength: AGENT_MAX_MESSAGE_LENGTH,
    messages,
    isProcessing: send.isProcessing,
    processInput: send.processInput,
    confirmPendingAction: send.confirmPendingAction,
    undoAgentAction: send.undoAgentAction,
    pendingAttachments,
    addAttachments,
    removeAttachment,
    isExtractingAttachments,
    clearMessages,
    conversationId,
    history: historyApi.history,
    isHistoryLoading: historyApi.isHistoryLoading,
    historyError: historyApi.historyError,
    historyHasMore: historyApi.historyHasMore,
    historySearch: historyApi.historySearch,
    setHistorySearch: historyApi.setHistorySearch,
    showArchivedHistory: historyApi.showArchivedHistory,
    setShowArchivedHistory: historyApi.setShowArchivedHistory,
    fetchHistory: historyApi.fetchHistory,
    loadMoreHistory: historyApi.loadMoreHistory,
    setConversationPinned: historyApi.setConversationPinned,
    setConversationArchived: historyApi.setConversationArchived,
    loadConversation: historyApi.loadConversation,
    isConversationLoading: historyApi.isConversationLoading,
    loadingConversationId: historyApi.loadingConversationId,
    updateConversationTitle: historyApi.updateConversationTitle,
    deleteConversation: historyApi.deleteConversation,
    duplicateConversation: historyApi.duplicateConversation,
    exportConversation: historyApi.exportConversation,
    shareConversation: historyApi.shareConversation,
    error: send.error,
    clearError: send.clearError,
    lastFailedMessage: send.lastFailedMessage,
    retryLastMessage: send.retryLastMessage,
    retryLastUserTurn: send.retryLastUserTurn,
    editLastUserMessage: send.editLastUserMessage,
    processingSteps: send.processingSteps,
    processingLabel: send.processingLabel,
    isPinnedToBottom,
    scrollToLatest,
    onMessagesScroll,
    scrollContainerRef,
    connectionStatus: send.connectionStatus,
    rateLimitCountdown: send.rateLimitCountdown,
    workspaceId,
    storeSpreadsheetExportForMessage,
  }
}
