'use client'

import { startTransition, useCallback, useMemo, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAction, useMutation } from 'convex/react'
import { useAuth } from '@/shared/contexts/auth-context'
import { useClientContext } from '@/shared/contexts/client-context'
import { useNavigationContext } from '@/shared/contexts/navigation-context'
import type { AgentError } from '@/lib/agent-errors'
import { getPreviewAgentModeResponse, isPreviewModeEnabled } from '@/lib/preview-data'
import {
  buildAgentAttachmentContext,
  hasUsableAttachmentContext,
  type AgentAttachmentContext,
} from '@/lib/agent-attachments'
import { agentApi } from '@/lib/convex-api'
import { AgentValidationError, parseAgentError, ERROR_DISPLAY_MESSAGES } from '@/lib/agent-errors'
import { notifyFailure, notifyError } from '@/lib/notifications'



export interface AgentMessageMetadata {
  action?: 'navigate' | 'execute' | 'clarify' | 'response'
  operation?: string
  success?: boolean
  data?: Record<string, unknown>
}

export interface AgentMessage {
  id: string
  type: 'user' | 'agent'
  content: string
  timestamp: Date
  route?: string | null
  status?: 'success' | 'error' | 'info' | 'warning'
  metadata?: AgentMessageMetadata
}

export interface AgentConversationSummary {
  id: string
  title: string | null
  startedAt: string | null
  lastMessageAt: string | null
  messageCount: number | null
}

type StoredAgentMessage = {
  id: string
  type: string
  content: string
  timestamp: string
  route: string | null
  action: string | null
  operation: string | null
  executeResult: Record<string, unknown> | null
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null
}

function parseStoredExecuteResultData(executeResult: Record<string, unknown> | null): Record<string, unknown> | undefined {
  if (!executeResult) return undefined

  let data: Record<string, unknown> = {}

  const directData = asRecord(executeResult.data)
  if (directData) {
    data = { ...directData }
  } else {
    const dataJson = typeof executeResult.dataJson === 'string' ? executeResult.dataJson : null
    if (dataJson) {
      try {
        const parsed = asRecord(JSON.parse(dataJson))
        if (parsed) data = { ...parsed }
      } catch {
        // ignore malformed JSON
      }
    }
  }

  if (typeof executeResult.retryable === 'boolean') {
    data = { ...data, retryable: executeResult.retryable }
  }
  if (typeof executeResult.userMessage === 'string' && executeResult.userMessage.trim().length > 0) {
    data = { ...data, userMessage: executeResult.userMessage }
  }

  return Object.keys(data).length > 0 ? data : undefined
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
  /** Process user input (text or voice transcript) */
  processInput: (text: string) => void
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
  /** Fetch latest history list */
  fetchHistory: () => Promise<void>
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
}

// Validation constants
const MAX_MESSAGE_LENGTH = 500
const MIN_MESSAGE_LENGTH = 1
const DEBOUNCE_MS = 300
const PREVIEW_AGENT_CONVERSATION_ID = 'preview-agent-conversation'

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function deriveActiveContextFromPath(pathname: string | null): {
  activeProposalId?: string
  activeProjectId?: string
  activeClientId?: string
} {
  if (!pathname) return {}

  const segments = pathname.split('/').filter(Boolean)

  const fromSection = (section: string): string | undefined => {
    const sectionIndex = segments.indexOf(section)
    if (sectionIndex === -1) return undefined

    const candidate = segments[sectionIndex + 1]
    if (!candidate) return undefined

    // Ignore utility routes.
    if (['new', 'viewer', 'deck'].includes(candidate)) return undefined
    return candidate
  }

  const activeProposalId = fromSection('proposals')
  const activeProjectId = fromSection('projects')
  const activeClientId = fromSection('clients')

  return {
    activeProposalId,
    activeProjectId,
    activeClientId,
  }
}

/**
 * Validate user input before sending
 */
function validateInput(text: string): string | null {
  const trimmed = text.trim()
  if (trimmed.length < MIN_MESSAGE_LENGTH) {
    return 'Message is too short'
  }
  if (trimmed.length > MAX_MESSAGE_LENGTH) {
    return `Message too long (max ${MAX_MESSAGE_LENGTH} characters)`
  }
  return null
}

export function useAgentMode(): UseAgentModeReturn {
  const pathname = usePathname()
  const router = useRouter()
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

  const sendMessage = useAction(agentApi.sendMessage)
  const listConversations = useAction(agentApi.listConversations)
  const getConversation = useAction(agentApi.getConversation)
  const updateTitle = useMutation(agentApi.updateConversationTitle)
  const deleteConversationMutation = useMutation(agentApi.deleteConversation)

  const [isOpen, setOpen] = useState(false)
  const [messages, setMessages] = useState<AgentMessage[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)

  const [history, setHistory] = useState<AgentConversationSummary[]>([])
  const [isHistoryLoading, setIsHistoryLoading] = useState(false)
  const [isConversationLoading, setIsConversationLoading] = useState(false)
  const [loadingConversationId, setLoadingConversationId] = useState<string | null>(null)

  // Error handling state
  const [error, setError] = useState<AgentError | null>(null)
  const [lastFailedMessage, setLastFailedMessage] = useState<string | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connected')
  const [rateLimitCountdown, setRateLimitCountdown] = useState<number | null>(null)
  const [pendingAttachments, setPendingAttachments] = useState<AgentAttachmentContext[]>([])
  const [isExtractingAttachments, setIsExtractingAttachments] = useState(false)

  // Debounce ref to prevent rapid submissions
  const lastSubmitTimeRef = useRef<number>(0)
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const toggle = useCallback(() => {
    setOpen((prev) => !prev)
  }, [])

  const clearError = useCallback(() => {
    setError(null)
    setLastFailedMessage(null)
    setRateLimitCountdown(null)
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current)
      countdownIntervalRef.current = null
    }
  }, [])

  const addMessage = useCallback((
    type: 'user' | 'agent',
    content: string | unknown,
    route?: string | null,
    status?: 'success' | 'error' | 'info' | 'warning',
    metadata?: AgentMessageMetadata
  ) => {
    // Ensure content is always a string to prevent React error #301
    const safeContent = typeof content === 'string' ? content : String(content ?? '')
    const message: AgentMessage = {
      id: generateId(),
      type,
      content: safeContent,
      timestamp: new Date(),
      route,
      status,
      metadata,
    }
    setMessages((prev) => [...prev, message])
    return message
  }, [])

  const addAttachments = useCallback(async (files: FileList | File[]) => {
    const nextFiles = Array.from(files)
    if (nextFiles.length === 0) return

    setIsExtractingAttachments(true)
    try {
      const extracted = await Promise.all(nextFiles.map((file) => buildAgentAttachmentContext(file)))
      startTransition(() => {
        setPendingAttachments((prev) => [...prev, ...extracted])
      })
    } catch (err) {
      console.error('[useAgentMode] Attachment processing failed:', err)
      notifyFailure({
        title: 'Could not add attachments',
        error: err,
        fallbackMessage: 'Could not process attached files. Try a different file or smaller size.',
      })
    } finally {
      setIsExtractingAttachments(false)
    }
  }, [])

  const removeAttachment = useCallback((attachmentId: string) => {
    setPendingAttachments((prev) => prev.filter((attachment) => attachment.id !== attachmentId))
  }, [])

  /**
   * Start rate limit countdown timer
   */
  const startRateLimitCountdown = useCallback((seconds: number) => {
    setRateLimitCountdown(seconds)
    
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current)
    }

    countdownIntervalRef.current = setInterval(() => {
      setRateLimitCountdown((prev) => {
        if (prev === null || prev <= 1) {
          if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current)
            countdownIntervalRef.current = null
          }
          setError(null)
          setConnectionStatus('connected')
          return null
        }
        return prev - 1
      })
    }, 1000)
  }, [])

  /**
   * Handle errors with proper categorization and UI updates
   */
  const handleError = useCallback((err: AgentError, failedMessage?: string) => {
    setError(err)
    setConnectionStatus(err.type === 'network' ? 'disconnected' : 'connected')

    if (failedMessage) {
      setLastFailedMessage(failedMessage)
    }

    // Start countdown for rate limit errors
    const retryAfterSeconds = err.retryAfterMs ? err.retryAfterMs / 1000 : undefined
    if (err.type === 'rate-limit' && retryAfterSeconds) {
      startRateLimitCountdown(retryAfterSeconds)
    }

    // Show user-friendly error message
    const displayMessage = ERROR_DISPLAY_MESSAGES[err.type] || err.message
    addMessage('agent', displayMessage, null, 'error', { action: 'response', success: false })
    if (err.type !== 'rate-limit') {
      notifyError({ message: displayMessage })
    }
  }, [addMessage, startRateLimitCountdown])


  const processInput = useCallback(async (text: string) => {
    // Debounce check
    const now = Date.now()
    if (now - lastSubmitTimeRef.current < DEBOUNCE_MS) {
      console.log('[useAgentMode] Debounced rapid submission')
      return
    }
    lastSubmitTimeRef.current = now

    // Validate input
    const validationError = validateInput(text)
    if (validationError) {
      setError(new AgentValidationError(validationError))
      addMessage('agent', validationError, null, 'error', { action: 'response', success: false })
      return
    }

    if (isExtractingAttachments) {
      addMessage('agent', 'I’m still reading the attached files. Send the message again in a moment.', null, 'warning', {
        action: 'response',
        success: false,
      })
      return
    }

    const trimmedText = text.trim()

    // Clear previous errors
    clearError()
    setIsProcessing(true)
    setConnectionStatus('connected')

    // Add user message (optimistic)
    addMessage('user', trimmedText)

    try {
      if (isPreviewModeEnabled()) {
        const previewResponse = getPreviewAgentModeResponse(trimmedText, activeContext)

        if (!conversationId) {
          setConversationId(PREVIEW_AGENT_CONVERSATION_ID)
        }

        if (previewResponse.action === 'navigate' && previewResponse.route) {
          addMessage('agent', previewResponse.message, previewResponse.route, 'success', {
            action: 'navigate',
            success: true,
          })
          if (!hasUsableAttachmentContext(pendingAttachments)) {
            setPendingAttachments([])
          }
          setTimeout(() => {
            router.push(previewResponse.route!)
            setOpen(false)
          }, 800)
        } else if (previewResponse.action === 'execute') {
          addMessage('agent', previewResponse.message, previewResponse.route, previewResponse.success === false ? 'error' : 'success', {
            action: 'execute',
            operation: previewResponse.operation,
            success: previewResponse.success,
            data: previewResponse.data,
          })
          setPendingAttachments([])
        } else {
          addMessage('agent', previewResponse.message, previewResponse.route, 'info', {
            action: 'response',
            success: true,
          })
          if (!hasUsableAttachmentContext(pendingAttachments)) {
            setPendingAttachments([])
          }
        }

        setLastFailedMessage(null)
        return
      }

      if (!workspaceId) {
        throw new Error('Workspace context is required')
      }

      const previousMessages = messages.slice(-4).map((m) => ({
        type: m.type,
        content: m.content,
      }))

      const responseData = await sendMessage({
        workspaceId,
        message: trimmedText,
        conversationId,
        context: {
          previousMessages,
          activeProposalId: activeContext.activeProposalId ?? null,
          activeProjectId: activeContext.activeProjectId ?? null,
          activeClientId: activeContext.activeClientId ?? null,
          attachmentContext: pendingAttachments.map((attachment) => ({
            name: attachment.name,
            mimeType: attachment.mimeType,
            sizeLabel: attachment.sizeLabel,
            excerpt: attachment.excerpt,
            extractedText: attachment.extractedText,
            extractionStatus: attachment.extractionStatus,
            errorMessage: attachment.errorMessage,
          })),
        },
      })

      setConnectionStatus('connected')

      // Save conversationId for subsequent messages
      if (responseData?.conversationId && !conversationId) {
        setConversationId(responseData.conversationId)
      }

      // Determine status and metadata for enhanced UX
      let status: 'success' | 'error' | 'info' | 'warning' = 'info'
      const metadata: AgentMessageMetadata = {
        action: responseData?.action as AgentMessageMetadata['action'],
        operation: responseData?.operation,
      }

      // Handle different action types
      if (responseData?.action === 'navigate' && responseData?.route) {
        status = 'success'
        metadata.success = true
        const route = responseData.route
        addMessage('agent', responseData.message || 'Navigating...', responseData.route, status, metadata)
        setTimeout(() => {
          router.push(route)
          setOpen(false)
        }, 800)
      } else if (responseData?.action === 'execute' && responseData?.executeResult) {
        status = responseData.executeResult.success ? 'success' : 'error'
        metadata.success = responseData.executeResult.success
        const exec = responseData.executeResult as {
          success: boolean
          data?: Record<string, unknown>
          retryable?: boolean
          userMessage?: string
        }
        const mergedData: Record<string, unknown> = {
          ...(exec.data && typeof exec.data === 'object' && !Array.isArray(exec.data) ? exec.data : {}),
        }
        if (typeof exec.retryable === 'boolean') mergedData.retryable = exec.retryable
        if (typeof exec.userMessage === 'string' && exec.userMessage.trim().length > 0) {
          mergedData.userMessage = exec.userMessage
        }
        metadata.data = Object.keys(mergedData).length > 0 ? mergedData : undefined
        const executeRoute =
          typeof responseData.route === 'string' && responseData.route.length > 0
            ? responseData.route
            : typeof exec.data?.route === 'string' && exec.data.route.length > 0
              ? exec.data.route
              : null

        addMessage('agent', responseData.message || 'Action completed', executeRoute, status, metadata)
        if (responseData.executeResult.success) {
          setPendingAttachments([])
        }
      } else {
        addMessage('agent', responseData?.message || 'I didn\'t quite understand that.', responseData?.route, 'info', metadata)
        if (!hasUsableAttachmentContext(pendingAttachments)) {
          setPendingAttachments([])
        }
      }

      setLastFailedMessage(null)
    } catch (err) {
      console.error('[useAgentMode] Unexpected error:', err)
      const agentError = parseAgentError(err, null)
      handleError(agentError, trimmedText)
    } finally {
      setIsProcessing(false)
    }
  }, [
    activeContext,
    addMessage,
    clearError,
    conversationId,
    handleError,
    messages,
    isExtractingAttachments,
    pendingAttachments,
    router,
    sendMessage,
    workspaceId,
  ])

  const retryLastMessage = useCallback(() => {
    if (lastFailedMessage) {
      clearError()
      processInput(lastFailedMessage)
    }
  }, [lastFailedMessage, clearError, processInput])

  const retryLastUserTurn = useCallback(() => {
    for (let i = messages.length - 1; i >= 0; i -= 1) {
      const entry = messages[i]
      if (entry?.type === 'user') {
        void processInput(entry.content)
        return
      }
    }
  }, [messages, processInput])

  const clearMessages = useCallback(() => {
    setMessages([])
    setConversationId(null)
    setPendingAttachments([])
    clearError()
  }, [clearError])

  const fetchHistory = useCallback(async () => {
    setIsHistoryLoading(true)
    try {
      if (isPreviewModeEnabled()) {
        setHistory([{
          id: conversationId ?? PREVIEW_AGENT_CONVERSATION_ID,
          title: 'Sample actions',
          startedAt: messages[0]?.timestamp.toISOString() ?? new Date().toISOString(),
          lastMessageAt: messages[messages.length - 1]?.timestamp.toISOString() ?? new Date().toISOString(),
          messageCount: messages.length,
        }])
        return
      }

      if (!workspaceId) {
        throw new Error('Workspace context is required')
      }

      const result = await listConversations({ workspaceId, limit: 20 })
      setHistory(result.conversations)
    } catch (err) {
      console.error('[useAgentMode] Failed to fetch history:', err)
      notifyFailure({
        title: 'Could not load chats',
        error: err,
        fallbackMessage: 'Failed to load conversation history.',
      })
    } finally {
      setIsHistoryLoading(false)
    }
  }, [conversationId, listConversations, messages, workspaceId])

  const loadConversation = useCallback(async (targetConversationId: string) => {
    if (!targetConversationId) return

    if (isPreviewModeEnabled()) {
      setConversationId(targetConversationId)
      return
    }

    setLoadingConversationId(targetConversationId)
    setIsConversationLoading(true)
    setIsProcessing(true)
    clearError()

    try {
      if (!workspaceId) {
        throw new Error('Workspace context is required')
      }

      const result = await getConversation({
        workspaceId,
        conversationId: targetConversationId,
        limit: 500,
      })

      const storedMessages = Array.isArray(result.messages)
        ? (result.messages as StoredAgentMessage[])
        : []

      const nextMessages: AgentMessage[] = storedMessages.map((msg) => {
        const type: 'user' | 'agent' = msg.type === 'user' ? 'user' : 'agent'
        const action = typeof msg.action === 'string' ? msg.action : null
        const operation = typeof msg.operation === 'string' ? msg.operation : null
        const executeResult =
          msg.executeResult && typeof msg.executeResult === 'object'
            ? (msg.executeResult as Record<string, unknown>)
            : null

        const executionSuccess =
          executeResult && typeof executeResult.success === 'boolean'
            ? executeResult.success
            : null

        const normalizedAction: AgentMessageMetadata['action'] | undefined =
          action === 'navigate' || action === 'execute' || action === 'clarify' ? action : action ? 'response' : undefined

        const status: AgentMessage['status'] =
          normalizedAction === 'execute' && executionSuccess !== null
            ? executionSuccess
              ? 'success'
              : 'error'
            : normalizedAction === 'navigate'
              ? 'success'
              : 'info'

        return {
          id: msg.id,
          type,
          content: msg.content,
          timestamp: new Date(msg.timestamp),
          route: msg.route,
          status,
          metadata:
            normalizedAction || operation || executeResult
              ? {
                  action: normalizedAction,
                  operation: operation ?? undefined,
                  success: executionSuccess ?? undefined,
                  data: parseStoredExecuteResultData(executeResult),
                }
              : undefined,
        }
      })

      setMessages(nextMessages)
      setConversationId(targetConversationId)
    } catch (err) {
      console.error('[useAgentMode] Failed to load conversation:', err)
      const agentError = parseAgentError(err, null)
      handleError(agentError)
    } finally {
      setLoadingConversationId(null)
      setIsConversationLoading(false)
      setIsProcessing(false)
    }
  }, [clearError, getConversation, handleError, workspaceId])

  const updateConversationTitle = useCallback(async (targetConversationId: string, title: string) => {
    const trimmed = title.trim()
    if (!targetConversationId || !trimmed) return

    if (isPreviewModeEnabled()) {
      setHistory((prev) => prev.map((conversation) => (
        conversation.id === targetConversationId
          ? { ...conversation, title: trimmed }
          : conversation
      )))
      return
    }

    try {
      if (!workspaceId) {
        throw new Error('Workspace context is required')
      }

      await updateTitle({ workspaceId, conversationId: targetConversationId, title: trimmed })
      setHistory((prev) => prev.map((c) => (c.id === targetConversationId ? { ...c, title: trimmed } : c)))
    } catch (err) {
      console.error('[useAgentMode] Failed to update title:', err)
      notifyFailure({
        title: 'Could not update chat title',
        error: err,
        fallbackMessage: 'Sorry — we could not update that chat title. Please try again.',
      })
      addMessage('agent', 'Sorry — I couldn\'t update that chat title. Please try again.')
    }
  }, [addMessage, updateTitle, workspaceId])

  const deleteConversation = useCallback(async (targetConversationId: string) => {
    if (!targetConversationId) return

    if (isPreviewModeEnabled()) {
      setHistory((prev) => prev.filter((conversation) => conversation.id !== targetConversationId))
      if (conversationId === targetConversationId) {
        setMessages([])
        setConversationId(null)
      }
      return
    }

    try {
      if (!workspaceId) {
        throw new Error('Workspace context is required')
      }

      await deleteConversationMutation({ workspaceId, conversationId: targetConversationId })

      setHistory((prev) => prev.filter((c) => c.id !== targetConversationId))
      if (conversationId === targetConversationId) {
        setMessages([])
        setConversationId(null)
      }
    } catch (err) {
      console.error('[useAgentMode] Failed to delete conversation:', err)
      notifyFailure({
        title: 'Could not delete chat',
        error: err,
        fallbackMessage: 'Sorry — we could not delete that chat. Please try again.',
      })
      addMessage('agent', 'Sorry — I couldn\'t delete that chat. Please try again.')
    }
  }, [addMessage, conversationId, deleteConversationMutation, workspaceId])

  return {
    isOpen,
    setOpen,
    toggle,
    messages,
    isProcessing,
    processInput,
    pendingAttachments,
    addAttachments,
    removeAttachment,
    isExtractingAttachments,
    clearMessages,
    conversationId,
    history,
    isHistoryLoading,
    fetchHistory,
    loadConversation,
    isConversationLoading,
    loadingConversationId,
    updateConversationTitle,
    deleteConversation,
    // Error handling
    error,
    clearError,
    lastFailedMessage,
    retryLastMessage,
    retryLastUserTurn,
    connectionStatus,
    rateLimitCountdown,
  }
}
