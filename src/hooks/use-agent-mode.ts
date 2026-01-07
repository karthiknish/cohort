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

  const toggle = useCallback(() => {
    setOpen((prev) => !prev)
  }, [])

  const addMessage = useCallback((type: 'user' | 'agent', content: string, route?: string | null) => {
    const message: AgentMessage = {
      id: generateId(),
      type,
      content,
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

      // Call the Agent API
      const response = await fetch('/api/agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: text,
          conversationId,
          context: { previousMessages },
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to process request')
      }

      const data = await response.json() as {
        conversationId: string
        action: string
        route?: string | null
        message: string
      }

      // Save conversationId for subsequent messages
      if (data.conversationId && !conversationId) {
        setConversationId(data.conversationId)
      }

      // Add agent response
      addMessage('agent', data.message, data.route)

      // If navigation action, navigate after a brief delay
      if (data.action === 'navigate' && data.route) {
        setTimeout(() => {
          router.push(data.route!)
          setOpen(false)
        }, 800)
      }
    } catch (error) {
      console.error('[useAgentMode] Error:', error)
      addMessage(
        'agent',
        'Sorry, I had trouble processing that. Try saying "go to analytics" or "show me tasks".'
      )
    } finally {
      setIsProcessing(false)
    }
  }, [addMessage, conversationId, getIdToken, messages, router])

  const clearMessages = useCallback(() => {
    setMessages([])
    setConversationId(null)
  }, [])

  return {
    isOpen,
    setOpen,
    toggle,
    messages,
    isProcessing,
    processInput,
    clearMessages,
    conversationId,
  }
}
