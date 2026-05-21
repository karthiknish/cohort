'use client'

import {
  startTransition,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAction, useMutation } from 'convex/react'
import { agentApi, tasksApi } from '@/lib/convex-api'
import { useAuth } from '@/shared/contexts/auth-context'
import { useClientContext } from '@/shared/contexts/client-context'
import { useNavigationContext } from '@/shared/contexts/navigation-context'
import type { AgentError } from '@/lib/agent-errors'
import { getPreviewAgentModeResponse, isPreviewModeEnabled } from '@/lib/preview-data'
import {
  buildAgentAttachmentContext,
  createPendingAttachmentPlaceholder,
  hasUsableAttachmentContext,
  parseAgentAttachmentsFromStored,
  readFileAsBase64,
  serializeAgentAttachmentsForStorage,
  toAgentRequestAttachmentContext,
  type AgentAttachmentContext,
  type ServerPdfExtractionResult,
} from '@/lib/agent-attachments'
import { buildAgentConversationShareLink } from '@/lib/agent-conversation-export'
import { readAgentPanelLayout, shouldKeepAgentOpenOnNavigate } from '@/lib/agent-panel-layout'
import { AgentValidationError, parseAgentError, ERROR_DISPLAY_MESSAGES } from '@/lib/agent-errors'
import { deriveActiveContextFromPath, type AgentContextIds } from '@/lib/agent-context'
import { notifyFailure, notifyError } from '@/lib/notifications'
import {
  buildCompletedStepsFromResponse,
  buildProcessingSteps,
  deriveAgentStatusFromResponse,
  filterMessagesForAgentContext,
  operationProcessingLabel,
  upsertAgentMessage,
  type AgentExecutionStep,
  type AgentMessageLifecycle,
  type AgentMessageMetadata,
  type AgentPendingConfirmation,
  type AgentSendResponse,
  parsePendingConfirmationFromStored,
} from '@/lib/agent-message-lifecycle'
import {
  mergeAgentMentions,
  parseAgentMentionsFromStored,
  parseAgentMentionsFromText,
  type AgentMentionEntity,
} from '@/lib/agent-mentions'

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

type StoredAgentMessage = {
  id: string
  type: string
  content: string
  timestamp: string
  route: string | null
  action: string | null
  operation: string | null
  params: Record<string, unknown> | null
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
}

// Validation constants
export const AGENT_MAX_MESSAGE_LENGTH = 4000
const MIN_MESSAGE_LENGTH = 1
const DEBOUNCE_MS = 300
const PREVIOUS_MESSAGES_LIMIT = 12
const PREVIEW_AGENT_CONVERSATION_ID = 'preview-agent-conversation'
const AGENT_OPEN_STORAGE_KEY = 'cohorts.agentMode.open'

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
  if (trimmed.length > AGENT_MAX_MESSAGE_LENGTH) {
    return `Message too long (max ${AGENT_MAX_MESSAGE_LENGTH} characters)`
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
  const duplicateConversationAction = useAction(agentApi.duplicateConversation)
  const exportConversationAction = useAction(agentApi.exportConversation)
  const shareConversationAction = useAction(agentApi.shareConversation)
  const extractPdfTextAction = useAction(agentApi.extractPdfText)
  const updateTitle = useMutation(agentApi.updateConversationTitle)
  const deleteConversationMutation = useMutation(agentApi.deleteConversation)
  const softDeleteTask = useMutation(tasksApi.softDeleteTask)

  const [isOpen, setOpenState] = useState(false)

  const setOpen = useCallback((open: boolean) => {
    setOpenState(open)
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem(AGENT_OPEN_STORAGE_KEY, open ? '1' : '0')
    }
  }, [])
  const [messages, setMessages] = useState<AgentMessage[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)

  const [history, setHistory] = useState<AgentConversationSummary[]>([])
  const [isHistoryLoading, setIsHistoryLoading] = useState(false)
  const [historyError, setHistoryError] = useState<string | null>(null)
  const [historyHasMore, setHistoryHasMore] = useState(false)
  const [historyCursor, setHistoryCursor] = useState<number | null>(null)
  const [historySearch, setHistorySearch] = useState('')
  const [showArchivedHistory, setShowArchivedHistory] = useState(false)
  const setConversationFlags = useMutation(agentApi.setConversationFlags)
  const [isConversationLoading, setIsConversationLoading] = useState(false)
  const [loadingConversationId, setLoadingConversationId] = useState<string | null>(null)

  // Error handling state
  const [error, setError] = useState<AgentError | null>(null)
  const [lastFailedMessage, setLastFailedMessage] = useState<string | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connected')
  const [rateLimitCountdown, setRateLimitCountdown] = useState<number | null>(null)
  const [pendingAttachments, setPendingAttachments] = useState<AgentAttachmentContext[]>([])
  const [isExtractingAttachments, setIsExtractingAttachments] = useState(false)
  const [processingSteps, setProcessingSteps] = useState<AgentExecutionStep[]>([])
  const [processingLabel, setProcessingLabel] = useState('Thinking…')
  const [isPinnedToBottom, setIsPinnedToBottom] = useState(true)

  const scrollContainerRef = useRef<HTMLDivElement | null>(null)
  const activeRequestRef = useRef<string | null>(null)

  // Debounce ref to prevent rapid submissions
  const lastSubmitTimeRef = useRef<number>(0)
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const stored = window.sessionStorage.getItem(AGENT_OPEN_STORAGE_KEY)
    if (stored === '1') {
      setOpenState(true)
    }
  }, [])

  const toggle = useCallback(() => {
    setOpen(!isOpen)
  }, [isOpen, setOpen])

  const clearError = useCallback(() => {
    setError(null)
    setLastFailedMessage(null)
    setRateLimitCountdown(null)
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current)
      countdownIntervalRef.current = null
    }
  }, [])

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

  const extractPdfOnServer = useCallback(
    async (file: File): Promise<ServerPdfExtractionResult | null> => {
      if (!workspaceId || isPreviewModeEnabled()) return null
      try {
        const dataBase64 = await readFileAsBase64(file)
        const result = (await extractPdfTextAction({
          workspaceId,
          fileName: file.name,
          dataBase64,
        })) as ServerPdfExtractionResult
        return result
      } catch (err) {
        console.error('[useAgentMode] Server PDF extraction failed:', err)
        return null
      }
    },
    [extractPdfTextAction, workspaceId],
  )

  const addAttachments = useCallback(async (files: FileList | File[]) => {
    const nextFiles = Array.from(files)
    if (nextFiles.length === 0) return

    const placeholders = nextFiles.map((file) => createPendingAttachmentPlaceholder(file))
    setPendingAttachments((prev) => [...prev, ...placeholders])
    setIsExtractingAttachments(true)

    try {
      for (let index = 0; index < nextFiles.length; index += 1) {
        const file = nextFiles[index]
        const placeholderId = placeholders[index]?.id
        if (!file || !placeholderId) continue

        try {
          const extracted = await buildAgentAttachmentContext(file, { extractPdfOnServer })
          setPendingAttachments((prev) =>
            prev.map((attachment) => (attachment.id === placeholderId ? extracted : attachment)),
          )
        } catch (err) {
          console.error('[useAgentMode] Attachment processing failed:', err, file.name)
          setPendingAttachments((prev) =>
            prev.map((attachment) =>
              attachment.id === placeholderId
                ? {
                    ...attachment,
                    extractionStatus: 'failed',
                    excerpt: 'Could not read this file.',
                    errorMessage:
                      err instanceof Error ? err.message : 'Could not process this attachment.',
                  }
                : attachment,
            ),
          )
        }
      }
    } finally {
      setIsExtractingAttachments(false)
    }
  }, [extractPdfOnServer])

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


  const applyAgentResponse = useCallback(
    (response: AgentSendResponse, trimmedText: string, sentAttachments: AgentAttachmentContext[]) => {
      const derived = deriveAgentStatusFromResponse(response)
      const steps = response.steps ?? buildCompletedStepsFromResponse(response)
      const attachmentNames = sentAttachments.map((attachment) => attachment.name)
      const usedContext =
        attachmentNames.length > 0 ? { attachmentNames } : undefined

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
          clientId: activeRequestRef.current ?? response.userMessageId,
          type: 'user',
          content: trimmedText,
          timestamp: new Date(),
          lifecycle: 'sent',
        })
      }

      setLastFailedMessage(null)
    },
    [addMessage, conversationId, router, setOpen, upsertMessage],
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
    clearError,
    conversationId,
    handleError,
    isExtractingAttachments,
    isPinnedToBottom,
    pendingAttachments,
    scrollToLatest,
    buildAgentRequestContext,
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
          await softDeleteTask({ workspaceId, legacyId: undoHint.resourceId })
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
    [addMessage, softDeleteTask, workspaceId],
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

  const clearMessages = useCallback(() => {
    setMessages([])
    setConversationId(null)
    setPendingAttachments([])
    clearError()
  }, [clearError])

  const fetchHistory = useCallback(async (options?: { reset?: boolean }) => {
    const reset = options?.reset ?? true
    setIsHistoryLoading(true)
    setHistoryError(null)
    try {
      if (isPreviewModeEnabled()) {
        setHistory([{
          id: conversationId ?? PREVIEW_AGENT_CONVERSATION_ID,
          title: 'Sample actions',
          startedAt: messages[0]?.timestamp.toISOString() ?? new Date().toISOString(),
          lastMessageAt: messages[messages.length - 1]?.timestamp.toISOString() ?? new Date().toISOString(),
          messageCount: messages.length,
          previewSnippet: messages[messages.length - 1]?.content.slice(0, 120) ?? null,
        }])
        setHistoryHasMore(false)
        setHistoryCursor(null)
        return
      }

      if (!workspaceId) {
        throw new Error('Workspace context is required')
      }

      const result = await listConversations({
        workspaceId,
        limit: 30,
        cursor: reset ? null : historyCursor,
        search: historySearch.trim() || null,
        includeArchived: showArchivedHistory,
      })

      setHistory((prev) => (reset ? result.conversations : [...prev, ...result.conversations]))
      setHistoryHasMore(result.hasMore)
      setHistoryCursor(result.nextCursor)
    } catch (err) {
      console.error('[useAgentMode] Failed to fetch history:', err)
      const message = err instanceof Error ? err.message : 'Failed to load conversation history.'
      setHistoryError(message)
    } finally {
      setIsHistoryLoading(false)
    }
  }, [
    conversationId,
    historyCursor,
    historySearch,
    listConversations,
    messages,
    showArchivedHistory,
    workspaceId,
  ])

  const loadMoreHistory = useCallback(async () => {
    if (!historyHasMore || isHistoryLoading) return
    await fetchHistory({ reset: false })
  }, [fetchHistory, historyHasMore, isHistoryLoading])

  const setConversationPinned = useCallback(
    async (targetConversationId: string, pinned: boolean) => {
      if (!workspaceId || !user?.id) return
      await setConversationFlags({
        workspaceId,
        legacyId: targetConversationId,
        userId: String(user.id),
        pinned,
      })
      setHistory((prev) =>
        prev.map((entry) =>
          entry.id === targetConversationId
            ? { ...entry, pinnedAt: pinned ? new Date().toISOString() : null }
            : entry,
        ),
      )
    },
    [setConversationFlags, user?.id, workspaceId],
  )

  const setConversationArchived = useCallback(
    async (targetConversationId: string, archived: boolean) => {
      if (!workspaceId || !user?.id) return
      await setConversationFlags({
        workspaceId,
        legacyId: targetConversationId,
        userId: String(user.id),
        archived,
      })
      setHistory((prev) =>
        prev.map((entry) =>
          entry.id === targetConversationId
            ? {
                ...entry,
                archivedAt: archived ? new Date().toISOString() : null,
                pinnedAt: archived ? null : entry.pinnedAt,
              }
            : entry,
        ),
      )
    },
    [setConversationFlags, user?.id, workspaceId],
  )

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

        const pendingConfirmation =
          type === 'agent'
            ? parsePendingConfirmationFromStored(executeResult, msg.params, msg.id)
            : null

        const storedData = parseStoredExecuteResultData(executeResult)
        const undoHintRaw = storedData?.undoHint
        const undoHint =
          undoHintRaw &&
          typeof undoHintRaw === 'object' &&
          !Array.isArray(undoHintRaw) &&
          typeof (undoHintRaw as Record<string, unknown>).resourceId === 'string' &&
          ((undoHintRaw as Record<string, unknown>).type === 'task' ||
            (undoHintRaw as Record<string, unknown>).type === 'project' ||
            (undoHintRaw as Record<string, unknown>).type === 'message')
            ? {
                type: (undoHintRaw as Record<string, unknown>).type as 'task' | 'project' | 'message',
                resourceId: (undoHintRaw as Record<string, unknown>).resourceId as string,
                label:
                  typeof (undoHintRaw as Record<string, unknown>).label === 'string'
                    ? ((undoHintRaw as Record<string, unknown>).label as string)
                    : 'Created',
              }
            : undefined

        const storedMentions =
          msg.params && typeof msg.params === 'object' && !Array.isArray(msg.params)
            ? parseAgentMentionsFromStored((msg.params as Record<string, unknown>).mentions)
            : undefined
        const storedAttachments =
          msg.params && typeof msg.params === 'object' && !Array.isArray(msg.params)
            ? parseAgentAttachmentsFromStored((msg.params as Record<string, unknown>).attachments)
            : undefined

        return {
          id: msg.id,
          clientId: msg.id,
          type,
          content: msg.content,
          timestamp: new Date(msg.timestamp),
          route: msg.route,
          status: pendingConfirmation ? 'warning' : status,
          lifecycle: 'sent' as const,
          mentions: storedMentions,
          attachments: storedAttachments,
          metadata:
            normalizedAction || operation || executeResult || pendingConfirmation
              ? {
                  action: pendingConfirmation ? 'clarify' : normalizedAction,
                  operation: operation ?? undefined,
                  success: executionSuccess ?? undefined,
                  data: storedData,
                  requiresConfirmation: pendingConfirmation ? true : undefined,
                  pendingConfirmation: pendingConfirmation ?? undefined,
                  undoHint,
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

  const duplicateConversation = useCallback(
    async (targetConversationId: string) => {
      if (!targetConversationId || !workspaceId || isPreviewModeEnabled()) return null
      try {
        const result = (await duplicateConversationAction({
          workspaceId,
          conversationId: targetConversationId,
        })) as { conversationId: string; messageCount: number }

        await fetchHistory({ reset: true })
        return result.conversationId
      } catch (err) {
        notifyFailure({
          title: 'Could not duplicate chat',
          error: err,
          fallbackMessage: 'Sorry — we could not duplicate that chat.',
        })
        return null
      }
    },
    [duplicateConversationAction, fetchHistory, workspaceId],
  )

  const exportConversation = useCallback(
    async (targetConversationId: string, format: 'json' | 'markdown' = 'markdown') => {
      if (!targetConversationId || !workspaceId || isPreviewModeEnabled()) return null
      try {
        const result = (await exportConversationAction({
          workspaceId,
          conversationId: targetConversationId,
          format,
        })) as { content: string; title: string }
        return result
      } catch (err) {
        notifyFailure({
          title: 'Could not export chat',
          error: err,
          fallbackMessage: 'Sorry — we could not export that chat.',
        })
        return null
      }
    },
    [exportConversationAction, workspaceId],
  )

  const shareConversation = useCallback(
    async (targetConversationId: string) => {
      if (!targetConversationId || !workspaceId || isPreviewModeEnabled()) return null
      try {
        const result = (await shareConversationAction({
          workspaceId,
          conversationId: targetConversationId,
        })) as { markdown: string; deepLinkPath: string }

        const deepLink = buildAgentConversationShareLink(targetConversationId)
        return { markdown: result.markdown, deepLink }
      } catch (err) {
        notifyFailure({
          title: 'Could not share chat',
          error: err,
          fallbackMessage: 'Sorry — we could not prepare a share link for that chat.',
        })
        return null
      }
    },
    [shareConversationAction, workspaceId],
  )

  return {
    isOpen,
    setOpen,
    toggle,
    activeContext,
    maxMessageLength: AGENT_MAX_MESSAGE_LENGTH,
    messages,
    isProcessing,
    processInput,
    confirmPendingAction,
    undoAgentAction,
    pendingAttachments,
    addAttachments,
    removeAttachment,
    isExtractingAttachments,
    clearMessages,
    conversationId,
    history,
    isHistoryLoading,
    historyError,
    historyHasMore,
    historySearch,
    setHistorySearch,
    showArchivedHistory,
    setShowArchivedHistory,
    fetchHistory,
    loadMoreHistory,
    setConversationPinned,
    setConversationArchived,
    loadConversation,
    isConversationLoading,
    loadingConversationId,
    updateConversationTitle,
    deleteConversation,
    duplicateConversation,
    exportConversation,
    shareConversation,
    // Error handling
    error,
    clearError,
    lastFailedMessage,
    retryLastMessage,
    retryLastUserTurn,
    editLastUserMessage,
    processingSteps,
    processingLabel,
    isPinnedToBottom,
    scrollToLatest,
    onMessagesScroll,
    scrollContainerRef,
    connectionStatus,
    rateLimitCountdown,
  }
}
