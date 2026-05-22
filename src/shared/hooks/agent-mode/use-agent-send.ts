'use client'

import { useCallback, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAction } from 'convex/react'

import { agentApi } from '@/lib/convex-api'
import type { AgentContextIds } from '@/lib/agent-context'
import {
  serializeAgentAttachmentsForStorage,
  toAgentRequestAttachmentContext,
  type AgentAttachmentContext,
} from '@/lib/agent-attachments'
import type { AgentError } from '@/lib/agent-errors'
import { AgentValidationError, parseAgentError, ERROR_DISPLAY_MESSAGES } from '@/lib/agent-errors'
import { getPreviewAgentModeResponse, isPreviewModeEnabled } from '@/lib/preview-data'
import { notifyError, notifyFailure } from '@/lib/notifications'
import {
  buildCompletedStepsFromResponse,
  buildProcessingSteps,
  filterMessagesForAgentContext,
  operationProcessingLabel,
  type AgentExecutionStep,
  type AgentMessageLifecycle,
  type AgentMessageMetadata,
  type AgentPendingConfirmation,
  type AgentSendResponse,
} from '@/lib/agent-message-lifecycle'
import {
  mergeAgentMentions,
  parseAgentMentionsFromText,
  type AgentMentionEntity,
} from '@/lib/agent-mentions'

import { applyAgentResponse as applyAgentResponseCore } from './agent-send-response'
import { useAgentTaskUndo } from './use-agent-task-undo'
import { generateId, PREVIEW_AGENT_CONVERSATION_ID, validateInput } from './stored-message-utils'
import type { AgentMessage, ConnectionStatus } from './types'

const DEBOUNCE_MS = 300
const PREVIOUS_MESSAGES_LIMIT = 12

type UseAgentSendParams = {
  workspaceId: string | null
  activeContext: AgentContextIds
  messages: AgentMessage[]
  setMessages: React.Dispatch<React.SetStateAction<AgentMessage[]>>
  conversationId: string | null
  setConversationId: React.Dispatch<React.SetStateAction<string | null>>
  pendingAttachments: AgentAttachmentContext[]
  setPendingAttachments: React.Dispatch<React.SetStateAction<AgentAttachmentContext[]>>
  clearAttachments: () => void
  isExtractingAttachments: boolean
  isPinnedToBottom: boolean
  scrollToLatest: () => void
  upsertMessage: (message: AgentMessage) => AgentMessage
  addMessage: (
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
  ) => AgentMessage
  setOpen: (open: boolean) => void
}

export function useAgentSend({
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
}: UseAgentSendParams) {
  const router = useRouter()
  const sendMessage = useAction(agentApi.sendMessage)
  const { undoTask } = useAgentTaskUndo(workspaceId)

  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<AgentError | null>(null)
  const [lastFailedMessage, setLastFailedMessage] = useState<string | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connected')
  const [rateLimitCountdown, setRateLimitCountdown] = useState<number | null>(null)
  const [processingSteps, setProcessingSteps] = useState<AgentExecutionStep[]>([])
  const [processingLabel, setProcessingLabel] = useState('Thinking…')

  const activeRequestRef = useRef<string | null>(null)
  const lastSubmitTimeRef = useRef<number>(0)
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const clearError = useCallback(() => {
    setError(null)
    setLastFailedMessage(null)
    setRateLimitCountdown(null)
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current)
      countdownIntervalRef.current = null
    }
  }, [])

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

  const handleError = useCallback((err: AgentError, failedMessage?: string) => {
    setError(err)
    setConnectionStatus(err.type === 'network' ? 'disconnected' : 'connected')

    if (failedMessage) {
      setLastFailedMessage(failedMessage)
    }

    const retryAfterSeconds = err.retryAfterMs ? err.retryAfterMs / 1000 : undefined
    if (err.type === 'rate-limit' && retryAfterSeconds) {
      startRateLimitCountdown(retryAfterSeconds)
    }

    const displayMessage = ERROR_DISPLAY_MESSAGES[err.type] || err.message
    addMessage('agent', displayMessage, null, 'error', { action: 'response', success: false })
    if (err.type !== 'rate-limit') {
      notifyError({ message: displayMessage })
    }
  }, [addMessage, startRateLimitCountdown])

  const applyAgentResponse = useCallback(
    (response: AgentSendResponse, trimmedText: string, sentAttachments: AgentAttachmentContext[]) => {
      applyAgentResponseCore({
        response,
        trimmedText,
        sentAttachments,
        conversationId,
        activeRequestClientId: activeRequestRef.current,
        addMessage,
        upsertMessage,
        setConversationId,
        setPendingAttachments,
        setLastFailedMessage,
        router,
        setOpen,
      })
    },
    [addMessage, conversationId, router, setConversationId, setLastFailedMessage, setOpen, setPendingAttachments, upsertMessage],
  )

  const buildAgentRequestContext = useCallback(
    (overrides?: {
      confirmationDecision?: 'confirm' | 'cancel' | 'edit'
      pendingConfirmation?: AgentPendingConfirmation
      mentions?: AgentMentionEntity[]
    }) => ({
      previousMessages: filterMessagesForAgentContext(messages, PREVIOUS_MESSAGES_LIMIT).map((m) => ({
        type: m.type,
        content: m.content,
      })),
      activeProposalId: activeContext.activeProposalId ?? null,
      activeProjectId: activeContext.activeProjectId ?? null,
      activeClientId: activeContext.activeClientId ?? null,
      confirmationDecision: overrides?.confirmationDecision ?? null,
      pendingConfirmation: overrides?.pendingConfirmation
        ? {
            confirmationId: overrides.pendingConfirmation.confirmationId,
            operation: overrides.pendingConfirmation.operation,
            params: overrides.pendingConfirmation.params,
          }
        : null,
      mentions: overrides?.mentions && overrides.mentions.length > 0 ? overrides.mentions : undefined,
      attachmentContext:
        pendingAttachments.length > 0
          ? toAgentRequestAttachmentContext(pendingAttachments)
          : undefined,
      attachments:
        pendingAttachments.length > 0
          ? serializeAgentAttachmentsForStorage(pendingAttachments)
          : undefined,
    }),
    [activeContext, messages, pendingAttachments],
  )

  const processInput = useCallback(async (
    text: string,
    options?: {
      retryClientId?: string
      mentions?: AgentMentionEntity[]
      confirmation?: {
        pending: AgentPendingConfirmation
        decision: 'confirm' | 'cancel' | 'edit'
      }
    },
  ) => {
    const now = Date.now()
    if (now - lastSubmitTimeRef.current < DEBOUNCE_MS) {
      console.log('[useAgentMode] Debounced rapid submission')
      return
    }
    lastSubmitTimeRef.current = now

    const confirmationRequest = options?.confirmation
    const trimmedText = confirmationRequest
      ? confirmationRequest.decision === 'confirm'
        ? 'Confirm'
        : confirmationRequest.decision === 'cancel'
          ? 'Cancel'
          : 'Edit'
      : text.trim()

    const validationError = confirmationRequest ? null : validateInput(text)
    if (validationError) {
      setError(new AgentValidationError(validationError))
      addMessage('agent', validationError, null, 'error', { action: 'response', success: false })
      return
    }

    const hasExtractingAttachments = pendingAttachments.some(
      (attachment) => attachment.extractionStatus === 'extracting',
    )
    if (isExtractingAttachments || hasExtractingAttachments) {
      addMessage('agent', 'I’m still reading the attached files. Send the message again in a moment.', null, 'warning', {
        action: 'response',
        success: false,
      })
      return
    }

    const retryClientId = options?.retryClientId
    const resolvedMentions = mergeAgentMentions(
      parseAgentMentionsFromText(trimmedText),
      options?.mentions ?? [],
    )
    const attachmentsForTurn = pendingAttachments.filter(
      (attachment) => attachment.extractionStatus !== 'extracting',
    )
    const userClientId = retryClientId ?? generateId()
    activeRequestRef.current = userClientId

    clearError()
    setIsProcessing(true)
    setConnectionStatus('connected')
    setProcessingSteps(buildProcessingSteps())
    setProcessingLabel('Understanding request…')

    upsertMessage({
      id: userClientId,
      clientId: userClientId,
      type: 'user',
      content: trimmedText,
      timestamp: new Date(),
      lifecycle: 'sending',
      mentions: resolvedMentions.length > 0 ? resolvedMentions : undefined,
      attachments: attachmentsForTurn.length > 0 ? attachmentsForTurn : undefined,
    })

    if (isPinnedToBottom) {
      requestAnimationFrame(() => scrollToLatest())
    }

    try {
      if (isPreviewModeEnabled()) {
        const previewResponse = getPreviewAgentModeResponse(trimmedText, activeContext)
        setProcessingSteps(buildProcessingSteps(previewResponse.operation))
        setProcessingLabel('Checking data…')

        const previewPayload: AgentSendResponse = {
          conversationId: conversationId ?? PREVIEW_AGENT_CONVERSATION_ID,
          userMessageId: userClientId,
          agentMessageId: generateId(),
          action: previewResponse.action,
          route: previewResponse.route,
          message: previewResponse.message,
          operation: previewResponse.operation,
          executeResult:
            previewResponse.action === 'execute'
              ? {
                  success: previewResponse.success !== false,
                  data: previewResponse.data,
                }
              : null,
        }

        applyAgentResponse(previewPayload, trimmedText, attachmentsForTurn)
        upsertMessage({
          id: userClientId,
          clientId: userClientId,
          type: 'user',
          content: trimmedText,
          timestamp: new Date(),
          lifecycle: 'sent',
          attachments: attachmentsForTurn.length > 0 ? attachmentsForTurn : undefined,
        })
        return
      }

      if (!workspaceId) {
        throw new Error('Workspace context is required')
      }

      setProcessingSteps((steps) =>
        steps.map((step, index) => ({
          ...step,
          status: index === 0 ? 'completed' : index === 1 ? 'active' : step.status,
        })),
      )
      setProcessingLabel('Checking data…')

      const responseData = (await sendMessage({
        workspaceId,
        message: trimmedText,
        conversationId,
        context: buildAgentRequestContext(
          confirmationRequest
            ? {
                confirmationDecision: confirmationRequest.decision,
                pendingConfirmation: confirmationRequest.pending,
                mentions: resolvedMentions,
              }
            : { mentions: resolvedMentions },
        ),
      })) as AgentSendResponse

      setConnectionStatus('connected')
      setProcessingSteps(buildCompletedStepsFromResponse(responseData))
      setProcessingLabel(operationProcessingLabel(responseData.operation))

      applyAgentResponse(
        {
          ...responseData,
          userMessageId: responseData.userMessageId ?? userClientId,
          steps: responseData.steps ?? buildCompletedStepsFromResponse(responseData),
        },
        trimmedText,
        attachmentsForTurn,
      )
    } catch (err) {
      console.error('[useAgentMode] Unexpected error:', err)
      const agentError = parseAgentError(err, null)
      upsertMessage({
        id: userClientId,
        clientId: userClientId,
        type: 'user',
        content: trimmedText,
        timestamp: new Date(),
        lifecycle: 'failed',
      })
      setProcessingSteps((steps) =>
        steps.map((step) => (step.id === 'action' || step.id === 'done' ? { ...step, status: 'failed' } : step)),
      )
      handleError(agentError, trimmedText)
    } finally {
      setIsProcessing(false)
      setProcessingSteps([])
      setProcessingLabel('Thinking…')
      activeRequestRef.current = null
      if (isPinnedToBottom) {
        requestAnimationFrame(() => scrollToLatest())
      }
    }
  }, [
    activeContext,
    addMessage,
    applyAgentResponse,
    buildAgentRequestContext,
    clearError,
    conversationId,
    handleError,
    isExtractingAttachments,
    isPinnedToBottom,
    pendingAttachments,
    scrollToLatest,
    sendMessage,
    upsertMessage,
    workspaceId,
  ])

  const confirmPendingAction = useCallback(
    (pending: AgentPendingConfirmation, decision: 'confirm' | 'cancel' | 'edit') => {
      void processInput('', { confirmation: { pending, decision } })
    },
    [processInput],
  )

  const undoAgentAction = useCallback(
    async (messageId: string, undoHint: NonNullable<AgentMessageMetadata['undoHint']>) => {
      if (!workspaceId) return

      try {
        if (undoHint.type === 'task') {
          await undoTask(undoHint.resourceId)
        } else {
          notifyFailure({
            title: 'Undo not available',
            fallbackMessage: 'Undo is only supported for newly created tasks right now.',
          })
          return
        }

        setMessages((prev) =>
          prev.map((entry) =>
            entry.id === messageId
              ? {
                  ...entry,
                  metadata: entry.metadata
                    ? { ...entry.metadata, undoHint: undefined }
                    : undefined,
                }
              : entry,
          ),
        )
        addMessage('agent', 'Undid that action.', null, 'info', { action: 'response', success: true })
      } catch (err) {
        notifyFailure({
          title: 'Could not undo',
          error: err,
          fallbackMessage: 'Sorry — that action could not be undone.',
        })
      }
    },
    [addMessage, setMessages, undoTask, workspaceId],
  )

  const retryLastMessage = useCallback(() => {
    if (!lastFailedMessage) return
    const failedUser = [...messages].reverse().find((entry) => entry.type === 'user' && entry.lifecycle === 'failed')
    clearError()
    void processInput(lastFailedMessage, { retryClientId: failedUser?.clientId })
  }, [lastFailedMessage, clearError, messages, processInput])

  const retryLastUserTurn = useCallback(() => {
    for (let i = messages.length - 1; i >= 0; i -= 1) {
      const entry = messages[i]
      if (entry?.type === 'user') {
        void processInput(entry.content, { retryClientId: entry.clientId })
        return
      }
    }
  }, [messages, processInput])

  const editLastUserMessage = useCallback(
    (text: string) => {
      const trimmed = text.trim()
      if (!trimmed) return
      for (let i = messages.length - 1; i >= 0; i -= 1) {
        const entry = messages[i]
        if (entry?.type === 'user') {
          void processInput(trimmed, { retryClientId: entry.clientId })
          return
        }
      }
      void processInput(trimmed)
    },
    [messages, processInput],
  )

  return {
    isProcessing,
    setIsProcessing,
    processInput,
    confirmPendingAction,
    undoAgentAction,
    editLastUserMessage,
    processingSteps,
    processingLabel,
    error,
    clearError,
    lastFailedMessage,
    retryLastMessage,
    retryLastUserTurn,
    connectionStatus,
    rateLimitCountdown,
    handleError,
    clearAttachmentsForReset: clearAttachments,
  }
}
