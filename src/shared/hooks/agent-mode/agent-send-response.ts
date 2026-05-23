import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'

import {
  hasUsableAttachmentContext,
  type AgentAttachmentContext,
} from '@/lib/agent-attachments'
import { readAgentPanelLayout, shouldKeepAgentOpenOnNavigate } from '@/lib/agent-panel-layout'
import {
  buildCompletedStepsFromResponse,
  deriveAgentStatusFromResponse,
  type AgentSendResponse,
} from '@/lib/agent-message-lifecycle'

import type { AgentMessage } from './types'

export type ApplyAgentResponseParams = {
  response: AgentSendResponse
  trimmedText: string
  sentAttachments: AgentAttachmentContext[]
  conversationId: string | null
  activeRequestClientId: string | null
  addMessage: (
    type: 'user' | 'agent',
    content: string | unknown,
    route?: string | null,
    status?: 'success' | 'error' | 'info' | 'warning',
    metadata?: AgentMessage['metadata'],
    options?: {
      clientId?: string
      lifecycle?: AgentMessage['lifecycle']
      persistedId?: string
      steps?: AgentMessage['steps']
    },
  ) => AgentMessage
  upsertMessage: (message: AgentMessage) => AgentMessage
  setConversationId: React.Dispatch<React.SetStateAction<string | null>>
  setPendingAttachments: React.Dispatch<React.SetStateAction<AgentAttachmentContext[]>>
  setLastFailedMessage: React.Dispatch<React.SetStateAction<string | null>>
  router: AppRouterInstance
  setOpen: (open: boolean) => void
}

export function applyAgentResponse({
  response,
  trimmedText,
  sentAttachments,
  conversationId,
  activeRequestClientId,
  addMessage,
  upsertMessage,
  setConversationId,
  setPendingAttachments,
  setLastFailedMessage,
  router,
  setOpen,
}: ApplyAgentResponseParams): void {
  const derived = deriveAgentStatusFromResponse(response)
  const steps = response.steps ?? buildCompletedStepsFromResponse(response)
  const attachmentNames = sentAttachments.map((attachment) => attachment.name)
  const usedContext = attachmentNames.length > 0 ? { attachmentNames } : undefined

  if (response.action === 'navigate' && response.route) {
    addMessage(
      'agent',
      response.message || 'Navigating...',
      response.route,
      derived.status,
      { ...derived, usedContext },
      { persistedId: response.agentMessageId, steps },
    )
    setTimeout(() => {
      router.push(response.route!)
      if (!shouldKeepAgentOpenOnNavigate(readAgentPanelLayout())) {
        setOpen(false)
      }
    }, 800)
  } else if (response.action === 'execute' && response.executeResult) {
    const executeRoute =
      typeof response.route === 'string' && response.route.length > 0
        ? response.route
        : typeof response.executeResult.data?.route === 'string' && response.executeResult.data.route.length > 0
          ? response.executeResult.data.route
          : null

    addMessage(
      'agent',
      response.message || 'Action completed',
      executeRoute,
      derived.status,
      { ...derived, usedContext },
      { persistedId: response.agentMessageId, steps },
    )
    if (response.executeResult.success) {
      setPendingAttachments([])
    }
  } else {
    addMessage(
      'agent',
      response.message || "I didn't quite understand that.",
      response.route ?? null,
      derived.status,
      { ...derived, usedContext },
      { persistedId: response.agentMessageId, steps },
    )
    if (!hasUsableAttachmentContext(sentAttachments)) {
      setPendingAttachments([])
    }
  }

  if (response.conversationId && !conversationId) {
    setConversationId(response.conversationId)
  }

  if (response.userMessageId) {
    upsertMessage({
      id: response.userMessageId,
      clientId: activeRequestClientId ?? response.userMessageId,
      type: 'user',
      content: trimmedText,
      timestamp: new Date(),
      lifecycle: 'sent',
      attachments: sentAttachments.length > 0 ? sentAttachments : undefined,
    })
  }

  setLastFailedMessage(null)
}
