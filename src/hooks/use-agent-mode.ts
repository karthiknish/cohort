'use client'

import { useCallback, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { postWithRetry, getWithRetry, type FetchWithRetryOptions } from '@/lib/fetch-with-retry'
import { AgentError, AgentValidationError, parseAgentError, ERROR_DISPLAY_MESSAGES } from '@/lib/agent-errors'

export interface AgentMessageMetadata {
  action?: 'navigate' | 'execute' | 'response'
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
  status?: 'success' | 'error' | 'info'
  metadata?: AgentMessageMetadata
}

export interface AgentConversationSummary {
  id: string
  title: string | null
  startedAt: string | null
  lastMessageAt: string | null
  messageCount: number | null
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

  /** Update a conversation title */
  updateConversationTitle: (conversationId: string, title: string) => Promise<void>
  /** Delete a conversation and its messages */
  deleteConversation: (conversationId: string) => Promise<void>

  // Error handling
  /** Current error, if any */
  error: AgentError | null
  /** Clear current error */
  clearError: () => void
  /** Last failed message (for retry) */
  lastFailedMessage: string | null
  /** Retry the last failed message */
  retryLastMessage: () => void
  /** Connection status */
  connectionStatus: ConnectionStatus
  /** Rate limit countdown (seconds remaining) */
  rateLimitCountdown: number | null
}

// Validation constants
const MAX_MESSAGE_LENGTH = 500
const MIN_MESSAGE_LENGTH = 1
const DEBOUNCE_MS = 300

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
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
  const router = useRouter()
  const { getIdToken } = useAuth()
  const [isOpen, setOpen] = useState(false)
  const [messages, setMessages] = useState<AgentMessage[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)

  const [history, setHistory] = useState<AgentConversationSummary[]>([])
  const [isHistoryLoading, setIsHistoryLoading] = useState(false)

  // Error handling state
  const [error, setError] = useState<AgentError | null>(null)
  const [lastFailedMessage, setLastFailedMessage] = useState<string | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connected')
  const [rateLimitCountdown, setRateLimitCountdown] = useState<number | null>(null)

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
    status?: 'success' | 'error' | 'info',
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
    if (err.type === 'rate-limit' && err.retryAfter) {
      startRateLimitCountdown(err.retryAfter)
    }

    // Show user-friendly error message
    const displayMessage = ERROR_DISPLAY_MESSAGES[err.type] || err.message
    addMessage('agent', displayMessage, null, 'error', { action: 'response', success: false })
  }, [addMessage, startRateLimitCountdown])

  /**
   * Retry options for API calls
   */
  const getRetryOptions = useCallback((): FetchWithRetryOptions => ({
    maxRetries: 3,
    baseDelayMs: 1000,
    getAuthToken: getIdToken,
    onRetry: (attempt, err, delayMs) => {
      console.log(`[useAgentMode] Retry attempt ${attempt}, waiting ${delayMs}ms`, err.type)
      setConnectionStatus('retrying')
    },
    onFinalFailure: (err) => {
      console.error('[useAgentMode] Final failure after retries:', err)
    },
  }), [getIdToken])

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
      addMessage('agent', validationError, null, 'error')
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
      // Get auth token
      const token = await getIdToken()

      // Build conversation context for the API
      const previousMessages = messages.slice(-4).map(m => ({
        type: m.type,
        content: m.content,
      }))

      const payload: Record<string, unknown> = {
        message: trimmedText,
        context: { previousMessages },
      }

      if (conversationId) {
        payload.conversationId = conversationId
      }

      // Call the Agent API with retry logic
      const { data, error: fetchError, response } = await postWithRetry<{ data?: Record<string, unknown> }>(
        '/api/agent',
        payload,
        token,
        getRetryOptions()
      )

      if (fetchError) {
        handleError(fetchError, trimmedText)
        return
      }

      setConnectionStatus('connected')
      
      // Handle successful response
      const rawData = data?.data || data
      const responseData = rawData as {
        conversationId?: string
        action?: string
        route?: string
        message?: string
        operation?: string
        executeResult?: { success: boolean; data?: Record<string, unknown> }
      }

      // Save conversationId for subsequent messages
      if (responseData?.conversationId && !conversationId) {
        setConversationId(responseData.conversationId)
      }

      // Determine status and metadata for enhanced UX
      let status: 'success' | 'error' | 'info' = 'info'
      const metadata: AgentMessageMetadata = {
        action: responseData?.action as AgentMessageMetadata['action'],
        operation: responseData?.operation,
      }

      // Handle different action types
      if (responseData?.action === 'navigate' && responseData?.route) {
        status = 'success'
        metadata.success = true
        // Add agent response with status
        addMessage('agent', responseData.message || 'Navigating...', responseData.route, status, metadata)
        // Navigation action - go to the route after a brief delay
        setTimeout(() => {
          router.push(responseData.route!)
          setOpen(false)
        }, 800)
      } else if (responseData?.action === 'execute' && responseData?.executeResult) {
        // Execute action - action was performed
        status = responseData.executeResult.success ? 'success' : 'error'
        metadata.success = responseData.executeResult.success
        metadata.data = responseData.executeResult.data
        addMessage('agent', responseData.message || 'Action completed', responseData.route, status, metadata)

        if (responseData.executeResult.success) {
          console.log('[useAgentMode] Action executed successfully:', responseData.operation, responseData.executeResult.data)
        } else {
          console.warn('[useAgentMode] Action execution failed:', responseData.message)
        }
      } else {
        // Regular response
        addMessage('agent', responseData?.message || 'I didn\'t quite understand that.', responseData?.route, 'info', metadata)
      }

      // Clear failed message on success
      setLastFailedMessage(null)
    } catch (err) {
      console.error('[useAgentMode] Unexpected error:', err)
      const agentError = parseAgentError(err, null)
      handleError(agentError, trimmedText)
    } finally {
      setIsProcessing(false)
    }
  }, [addMessage, clearError, conversationId, getIdToken, getRetryOptions, handleError, messages, router])

  const retryLastMessage = useCallback(() => {
    if (lastFailedMessage) {
      clearError()
      processInput(lastFailedMessage)
    }
  }, [lastFailedMessage, clearError, processInput])

  const clearMessages = useCallback(() => {
    setMessages([])
    setConversationId(null)
    clearError()
  }, [clearError])

  const fetchHistory = useCallback(async () => {
    setIsHistoryLoading(true)
    try {
      const token = await getIdToken()
      const { data, error: fetchError } = await getWithRetry<{ data?: { conversations?: AgentConversationSummary[] } }>(
        '/api/agent/conversations?limit=20',
        token,
        { maxRetries: 2 }
      )

      if (fetchError) {
        console.error('[useAgentMode] Failed to fetch history:', fetchError)
        return
      }

      const rawData = data?.data || data
      const conversations = Array.isArray((rawData as Record<string, unknown>)?.conversations) 
        ? (rawData as { conversations: AgentConversationSummary[] }).conversations 
        : []
      setHistory(conversations)
    } catch (err) {
      console.error('[useAgentMode] Failed to fetch history:', err)
    } finally {
      setIsHistoryLoading(false)
    }
  }, [getIdToken])

  const loadConversation = useCallback(async (targetConversationId: string) => {
    if (!targetConversationId) return

    setIsProcessing(true)
    clearError()
    
    try {
      const token = await getIdToken()
      const { data, error: fetchError } = await getWithRetry<{ data?: { messages?: unknown[] } }>(
        `/api/agent/conversations/${encodeURIComponent(targetConversationId)}?limit=500`,
        token,
        { maxRetries: 2 }
      )

      if (fetchError) {
        handleError(fetchError)
        return
      }

      const rawData = data?.data || data
      const apiMessages = Array.isArray((rawData as Record<string, unknown>)?.messages) 
        ? (rawData as { messages: unknown[] }).messages 
        : []

      const nextMessages: AgentMessage[] = apiMessages.map((m: unknown) => {
        const msg = m as Record<string, unknown>
        return {
          id: typeof msg?.id === 'string' ? msg.id : generateId(),
          type: msg?.type === 'user' ? 'user' as const : 'agent' as const,
          content: typeof msg?.content === 'string' ? msg.content : '',
          timestamp: msg?.timestamp ? new Date(msg.timestamp as string) : new Date(),
          route: typeof msg?.route === 'string' ? msg.route : null,
        }
      })

      setMessages(nextMessages)
      setConversationId(targetConversationId)
    } catch (err) {
      console.error('[useAgentMode] Failed to load conversation:', err)
      const agentError = parseAgentError(err, null)
      handleError(agentError)
    } finally {
      setIsProcessing(false)
    }
  }, [clearError, getIdToken, handleError])

  const updateConversationTitle = useCallback(async (targetConversationId: string, title: string) => {
    const trimmed = title.trim()
    if (!targetConversationId || !trimmed) return

    try {
      const token = await getIdToken()
      const response = await fetch(`/api/agent/conversations/${encodeURIComponent(targetConversationId)}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ title: trimmed }),
      })

      if (!response.ok) {
        throw new Error('Failed to update title')
      }

      setHistory((prev) => prev.map((c) => (c.id === targetConversationId ? { ...c, title: trimmed } : c)))
    } catch (err) {
      console.error('[useAgentMode] Failed to update title:', err)
      addMessage('agent', 'Sorry — I couldn\'t update that chat title. Please try again.')
    }
  }, [addMessage, getIdToken])

  const deleteConversation = useCallback(async (targetConversationId: string) => {
    if (!targetConversationId) return

    try {
      const token = await getIdToken()
      const response = await fetch(`/api/agent/conversations/${encodeURIComponent(targetConversationId)}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to delete conversation')
      }

      setHistory((prev) => prev.filter((c) => c.id !== targetConversationId))
      if (conversationId === targetConversationId) {
        setMessages([])
        setConversationId(null)
      }
    } catch (err) {
      console.error('[useAgentMode] Failed to delete conversation:', err)
      addMessage('agent', 'Sorry — I couldn\'t delete that chat. Please try again.')
    }
  }, [addMessage, conversationId, getIdToken])

  return {
    isOpen,
    setOpen,
    toggle,
    messages,
    isProcessing,
    processInput,
    clearMessages,
    conversationId,
    history,
    isHistoryLoading,
    fetchHistory,
    loadConversation,
    updateConversationTitle,
    deleteConversation,
    // Error handling
    error,
    clearError,
    lastFailedMessage,
    retryLastMessage,
    connectionStatus,
    rateLimitCountdown,
  }
}
