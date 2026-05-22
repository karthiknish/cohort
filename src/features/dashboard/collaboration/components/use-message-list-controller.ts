'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import type { UnifiedMessage } from './message-list-types'
import type { MessageListRenderers } from './message-list-sections'
import { useMessageListRenderContext } from './message-list-render-context'
import { toMessageContentComponent } from './message-list-render-utils'

function formatDate(ms: number): string {
  const date = new Date(ms)
  return date.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })
}

function groupMessagesByDate(messages: UnifiedMessage[]): Map<string, UnifiedMessage[]> {
  const groups = new Map<string, UnifiedMessage[]>()
  const seenIds = new Set<string>()

  for (const message of messages) {
    if (seenIds.has(message.id)) continue
    seenIds.add(message.id)

    const dateKey = formatDate(message.createdAtMs)
    const existing = groups.get(dateKey) ?? []
    existing.push(message)
    groups.set(dateKey, existing)
  }

  return groups
}

const EMPTY_REACTION_PENDING_BY_MESSAGE: Record<string, string | null> = {}

export type UseMessageListControllerArgs = {
  messages: UnifiedMessage[]
  hasMore: boolean
  isLoading: boolean
  onLoadMore: () => void
  onToggleReaction: (messageId: string, emoji: string) => Promise<void>
  reactionPendingByMessage?: Record<string, string | null>
  renderMessageExtras?: (message: UnifiedMessage) => React.ReactNode
  renderMessageActions?: (message: UnifiedMessage) => React.ReactNode
  renderMessageContent?: React.ComponentType<{ message: UnifiedMessage }>
  renderMessageAttachments?: (message: UnifiedMessage) => React.ReactNode
  renderMessageFooter?: (message: UnifiedMessage) => React.ReactNode
  renderThreadSection?: (message: UnifiedMessage) => React.ReactNode
  renderEditForm?: (message: UnifiedMessage) => React.ReactNode
  renderDeletedInfo?: (message: UnifiedMessage) => React.ReactNode
  focusMessageId?: string | null
  focusThreadId?: string | null
  typingIndicatorText?: string
}

export function useMessageListController({
  messages,
  hasMore,
  isLoading,
  onLoadMore,
  onToggleReaction,
  reactionPendingByMessage = EMPTY_REACTION_PENDING_BY_MESSAGE,
  renderMessageExtras,
  renderMessageActions,
  renderMessageContent,
  renderMessageAttachments,
  renderMessageFooter,
  renderThreadSection,
  renderEditForm,
  renderDeletedInfo,
  focusMessageId,
  focusThreadId,
  typingIndicatorText,
}: UseMessageListControllerArgs) {
  const renderContext = useMessageListRenderContext()
  const scrollRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const prependSnapshotRef = useRef<{ scrollTop: number; scrollHeight: number } | null>(null)
  const loadingOlderRef = useRef(false)
  const lastFocusedMessageRef = useRef<string | null>(null)
  const previousEdgeRef = useRef<{ firstId: string | null; lastId: string | null }>({
    firstId: null,
    lastId: null,
  })
  const shouldStickToBottomRef = useRef(true)
  const hasAutoScrolledInitiallyRef = useRef(false)
  const [localReactionPending, setLocalReactionPending] = useState<string | null>(null)
  const [highlightedMessageId, setHighlightedMessageId] = useState<string | null>(null)
  const [showJumpToLatest, setShowJumpToLatest] = useState(false)

  const sortedMessages = useMemo(
    () => messages.toSorted((a, b) => a.createdAtMs - b.createdAtMs),
    [messages],
  )

  const groupedMessages = useMemo(() => groupMessagesByDate(sortedMessages), [sortedMessages])

  const effectiveRenderMessageExtras = renderMessageExtras ?? renderContext?.renderMessageExtras
  const effectiveRenderMessageActions = renderMessageActions ?? renderContext?.renderMessageActions
  const effectiveRenderMessageContent = renderMessageContent ?? renderContext?.renderMessageContent
  const effectiveRenderMessageAttachments = renderMessageAttachments ?? renderContext?.renderMessageAttachments
  const effectiveRenderMessageFooter = renderMessageFooter ?? renderContext?.renderMessageFooter
  const effectiveRenderThreadSection = renderThreadSection ?? renderContext?.renderThreadSection
  const effectiveRenderEditForm = renderEditForm ?? renderContext?.renderEditForm
  const effectiveRenderDeletedInfo = renderDeletedInfo ?? renderContext?.renderDeletedInfo
  const effectiveRenderMessageWrapper = renderContext?.renderMessageWrapper

  const renderers = useMemo<MessageListRenderers>(
    () => ({
      renderMessageActions: effectiveRenderMessageActions,
      renderMessageAttachments: effectiveRenderMessageAttachments,
      renderMessageContent: effectiveRenderMessageContent
        ? toMessageContentComponent(effectiveRenderMessageContent)
        : undefined,
      renderMessageExtras: effectiveRenderMessageExtras,
      renderMessageFooter: effectiveRenderMessageFooter,
      renderThreadSection: effectiveRenderThreadSection,
      renderEditForm: effectiveRenderEditForm,
      renderDeletedInfo: effectiveRenderDeletedInfo,
    }),
    [
      effectiveRenderDeletedInfo,
      effectiveRenderEditForm,
      effectiveRenderMessageActions,
      effectiveRenderMessageAttachments,
      effectiveRenderMessageContent,
      effectiveRenderMessageExtras,
      effectiveRenderMessageFooter,
      effectiveRenderThreadSection,
    ],
  )

  const requestLoadOlder = useCallback(() => {
    const container = scrollRef.current
    if (!container || !hasMore || isLoading || loadingOlderRef.current) {
      return
    }

    prependSnapshotRef.current = {
      scrollTop: container.scrollTop,
      scrollHeight: container.scrollHeight,
    }
    loadingOlderRef.current = true
    onLoadMore()
  }, [hasMore, isLoading, onLoadMore])

  useEffect(() => {
    if (!isLoading && loadingOlderRef.current && prependSnapshotRef.current) {
      loadingOlderRef.current = false
      prependSnapshotRef.current = null
    }
  }, [isLoading])

  useEffect(() => {
    const container = scrollRef.current
    if (!container) return

    const firstId = sortedMessages[0]?.id ?? null
    const lastMessage = sortedMessages.length > 0 ? sortedMessages[sortedMessages.length - 1] : null
    const lastId = lastMessage ? lastMessage.id : null
    const previousFirst = previousEdgeRef.current.firstId
    const previousLast = previousEdgeRef.current.lastId

    if (prependSnapshotRef.current) {
      const snapshot = prependSnapshotRef.current
      const delta = container.scrollHeight - snapshot.scrollHeight
      container.scrollTop = snapshot.scrollTop + delta
      prependSnapshotRef.current = null
      loadingOlderRef.current = false
    } else if (!hasAutoScrolledInitiallyRef.current && sortedMessages.length > 0) {
      container.scrollTop = container.scrollHeight
      shouldStickToBottomRef.current = true
      hasAutoScrolledInitiallyRef.current = true
    } else {
      const conversationSwitched =
        previousFirst !== null &&
        previousLast !== null &&
        firstId !== null &&
        lastId !== null &&
        previousFirst !== firstId &&
        previousLast !== lastId

      const appendedAtBottom =
        previousLast !== null && previousFirst === firstId && previousLast !== lastId

      if ((conversationSwitched || appendedAtBottom) && shouldStickToBottomRef.current) {
        container.scrollTop = container.scrollHeight
      }
    }

    previousEdgeRef.current = { firstId, lastId }
  }, [sortedMessages])

  useEffect(() => {
    if (!typingIndicatorText) return
    const container = scrollRef.current
    if (!container || !shouldStickToBottomRef.current) return

    const frame = requestAnimationFrame(() => {
      container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' })
    })

    return () => {
      cancelAnimationFrame(frame)
    }
  }, [typingIndicatorText])

  useEffect(() => {
    const container = scrollRef.current
    if (!container) return

    const resolvedFocusId =
      (typeof focusMessageId === 'string' && focusMessageId.trim().length > 0
        ? focusMessageId.trim()
        : null) ??
      (typeof focusThreadId === 'string' && focusThreadId.trim().length > 0
        ? sortedMessages.find((message) => {
            const threadRootId =
              typeof message.threadRootId === 'string' && message.threadRootId.trim().length > 0
                ? message.threadRootId.trim()
                : message.id
            return threadRootId === focusThreadId.trim()
          })?.id ?? null
        : null)

    if (!resolvedFocusId) {
      return
    }

    if (lastFocusedMessageRef.current === resolvedFocusId) {
      return
    }

    const candidates = container.querySelectorAll<HTMLElement>('[data-message-id]')
    let target: HTMLElement | null = null
    for (const node of candidates) {
      if (node.dataset.messageId === resolvedFocusId) {
        target = node
        break
      }
    }

    if (!target) {
      return
    }

    lastFocusedMessageRef.current = resolvedFocusId
    target.scrollIntoView({ behavior: 'smooth', block: 'center' })

    const frame = window.requestAnimationFrame(() => {
      setHighlightedMessageId(resolvedFocusId)
    })

    const timer = window.setTimeout(() => {
      setHighlightedMessageId((current) => (current === resolvedFocusId ? null : current))
    }, 2400)

    return () => {
      window.cancelAnimationFrame(frame)
      window.clearTimeout(timer)
    }
  }, [focusMessageId, focusThreadId, sortedMessages])

  const scrollToLatest = useCallback(() => {
    const container = scrollRef.current
    if (!container) return
    container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' })
    shouldStickToBottomRef.current = true
    setShowJumpToLatest(false)
  }, [])

  const handleScroll = useCallback(() => {
    const container = scrollRef.current
    if (!container) return

    const distanceFromBottom = container.scrollHeight - (container.scrollTop + container.clientHeight)
    shouldStickToBottomRef.current = distanceFromBottom < 80
    setShowJumpToLatest(distanceFromBottom > 200 && sortedMessages.length > 0)

    if (container.scrollTop < 64) {
      requestLoadOlder()
    }
  }, [requestLoadOlder, sortedMessages.length])

  const handleReaction = useCallback(
    async (messageId: string, emoji: string) => {
      const key = `${messageId}-${emoji}`
      if (localReactionPending) return
      setLocalReactionPending(key)
      try {
        await onToggleReaction(messageId, emoji)
      } finally {
        setLocalReactionPending(null)
      }
    },
    [localReactionPending, onToggleReaction],
  )

  return {
    scrollRef,
    messagesEndRef,
    groupedMessages,
    renderers,
    effectiveRenderMessageWrapper,
    localReactionPending,
    highlightedMessageId,
    showJumpToLatest,
    reactionPendingByMessage,
    requestLoadOlder,
    scrollToLatest,
    handleScroll,
    handleReaction,
    sortedMessages,
  }
}
