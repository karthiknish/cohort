'use client'

import { useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'

export interface AgentMessage {
  id: string
  type: 'user' | 'agent'
  content: string
  timestamp: Date
  route?: string | null
}

export interface AgentConversationSummary {
  id: string
  title: string | null
  startedAt: string | null
  lastMessageAt: string | null
  messageCount: number | null
}

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
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
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

  const toggle = useCallback(() => {
    setOpen((prev) => !prev)
  }, [])

  const addMessage = useCallback((type: 'user' | 'agent', content: string | unknown, route?: string | null) => {
    // Ensure content is always a string to prevent React error #301
    const safeContent = typeof content === 'string' ? content : String(content ?? '')
    const message: AgentMessage = {
      id: generateId(),
      type,
      content: safeContent,
      timestamp: new Date(),
      route,
    }
    setMessages((prev) => [...prev, message])
    return message
  }, [])

  const processInput = useCallback(async (text: string) => {
    if (!text.trim()) return

    setIsProcessing(true)

    // Add user message
    addMessage('user', text)

    try {
      // Get auth token
      const token = await getIdToken()

      // Build conversation context for the API
      const previousMessages = messages.slice(-4).map(m => ({
        type: m.type,
        content: m.content,
      }))

      const payload: Record<string, unknown> = {
        message: text,
        context: { previousMessages },
      }

      if (conversationId) {
        payload.conversationId = conversationId
      }

      // Call the Agent API
      const response = await fetch('/api/agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error('Failed to process request')
      }

      const raw = await response.json() as any
      const data = (raw && typeof raw === 'object' && 'data' in raw) ? raw.data : raw

      // Save conversationId for subsequent messages
      if (data.conversationId && !conversationId) {
        setConversationId(data.conversationId)
      }

      // Add agent response
      addMessage('agent', data.message, data.route)

      // Handle different action types
      if (data.action === 'navigate' && data.route) {
        // Navigation action - go to the route after a brief delay
        setTimeout(() => {
          router.push(data.route!)
          setOpen(false)
        }, 800)
      } else if (data.action === 'execute' && data.executeResult) {
        // Execute action - action was performed, optionally navigate
        if (data.executeResult.success) {
          // Success - could show a toast or navigate to relevant page
          console.log('[useAgentMode] Action executed successfully:', data.operation, data.executeResult.data)
        } else {
          // Failure - message already explains what to do
          console.warn('[useAgentMode] Action execution failed:', data.message)
        }
      }
    } catch (error) {
      console.error('[useAgentMode] Error:', error)
      addMessage(
        'agent',
        'Sorry, I had trouble processing that. Try saying "go to analytics" or "add 500 in ad spend".'
      )
    } finally {
      setIsProcessing(false)
    }
  }, [addMessage, conversationId, getIdToken, messages, router])

  const clearMessages = useCallback(() => {
    setMessages([])
    setConversationId(null)
  }, [])

  const fetchHistory = useCallback(async () => {
    setIsHistoryLoading(true)
    try {
      const token = await getIdToken()
      const response = await fetch('/api/agent/conversations?limit=20', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch conversation history')
      }

      const raw = await response.json() as any
      const data = (raw && typeof raw === 'object' && 'data' in raw) ? raw.data : raw
      const conversations = Array.isArray(data?.conversations) ? data.conversations : []
      setHistory(conversations)
    } catch (error) {
      console.error('[useAgentMode] Failed to fetch history:', error)
    } finally {
      setIsHistoryLoading(false)
    }
  }, [getIdToken])

  const loadConversation = useCallback(async (targetConversationId: string) => {
    if (!targetConversationId) return

    setIsProcessing(true)
    try {
      const token = await getIdToken()
      const response = await fetch(`/api/agent/conversations/${encodeURIComponent(targetConversationId)}?limit=500`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to load conversation')
      }

      const raw = await response.json() as any
      const data = (raw && typeof raw === 'object' && 'data' in raw) ? raw.data : raw
      const apiMessages = Array.isArray(data?.messages) ? data.messages : []

      const nextMessages: AgentMessage[] = apiMessages.map((m: any) => ({
        id: typeof m?.id === 'string' ? m.id : generateId(),
        type: m?.type === 'user' ? 'user' : 'agent',
        content: typeof m?.content === 'string' ? m.content : '',
        timestamp: m?.timestamp ? new Date(m.timestamp) : new Date(),
        route: typeof m?.route === 'string' ? m.route : null,
      }))

      setMessages(nextMessages)
      setConversationId(targetConversationId)
    } catch (error) {
      console.error('[useAgentMode] Failed to load conversation:', error)
      addMessage('agent', 'Sorry — I couldn\'t load that chat history. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }, [addMessage, getIdToken])

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
    } catch (error) {
      console.error('[useAgentMode] Failed to update title:', error)
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
    } catch (error) {
      console.error('[useAgentMode] Failed to delete conversation:', error)
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
  }
}
