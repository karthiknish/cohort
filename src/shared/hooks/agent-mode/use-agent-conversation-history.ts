'use client'

import { useCallback, useState } from 'react'
import { useAction, useMutation } from 'convex/react'

import { agentApi } from '@/lib/convex-api'
import { buildAgentConversationShareLink } from '@/lib/agent-conversation-export'
import type { AgentError } from '@/lib/agent-errors'
import { parseAgentError } from '@/lib/agent-errors'
import { isPreviewModeEnabled } from '@/lib/preview-data'
import { convexErrorMessage, reportConvexFailure } from '@/lib/handle-convex-error'

import { mapStoredMessagesToAgentMessages } from './map-stored-messages'
import { PREVIEW_AGENT_CONVERSATION_ID, type StoredAgentMessage } from './stored-message-utils'
import type { AgentConversationSummary, AgentMessage } from './types'

type UseAgentConversationHistoryParams = {
  workspaceId: string | null
  userId: string | undefined
  conversationId: string | null
  messages: AgentMessage[]
  setMessages: React.Dispatch<React.SetStateAction<AgentMessage[]>>
  setConversationId: React.Dispatch<React.SetStateAction<string | null>>
  addMessage: (
    type: 'user' | 'agent',
    content: string | unknown,
    route?: string | null,
    status?: 'success' | 'error' | 'info' | 'warning',
  ) => AgentMessage
  handleError: (err: AgentError, failedMessage?: string) => void
  setIsProcessing: (value: boolean) => void
  clearError: () => void
}

export function useAgentConversationHistory({
  workspaceId,
  userId,
  conversationId,
  messages,
  setMessages,
  setConversationId,
  addMessage,
  handleError,
  setIsProcessing,
  clearError,
}: UseAgentConversationHistoryParams) {
  const listConversations = useAction(agentApi.listConversations)
  const getConversation = useAction(agentApi.getConversation)
  const duplicateConversationAction = useAction(agentApi.duplicateConversation)
  const exportConversationAction = useAction(agentApi.exportConversation)
  const shareConversationAction = useAction(agentApi.shareConversation)
  const updateTitle = useMutation(agentApi.updateConversationTitle)
  const deleteConversationMutation = useMutation(agentApi.deleteConversation)
  const setConversationFlags = useMutation(agentApi.setConversationFlags)

  const [history, setHistory] = useState<AgentConversationSummary[]>([])
  const [isHistoryLoading, setIsHistoryLoading] = useState(false)
  const [historyError, setHistoryError] = useState<string | null>(null)
  const [historyHasMore, setHistoryHasMore] = useState(false)
  const [historyCursor, setHistoryCursor] = useState<number | null>(null)
  const [historySearch, setHistorySearch] = useState('')
  const [showArchivedHistory, setShowArchivedHistory] = useState(false)
  const [isConversationLoading, setIsConversationLoading] = useState(false)
  const [loadingConversationId, setLoadingConversationId] = useState<string | null>(null)

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
      setHistoryError(
        convexErrorMessage(err, 'Failed to load conversation history.'),
      )
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
      if (!workspaceId || !userId) return
      await setConversationFlags({
        workspaceId,
        legacyId: targetConversationId,
        userId: String(userId),
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
    [setConversationFlags, userId, workspaceId],
  )

  const setConversationArchived = useCallback(
    async (targetConversationId: string, archived: boolean) => {
      if (!workspaceId || !userId) return
      await setConversationFlags({
        workspaceId,
        legacyId: targetConversationId,
        userId: String(userId),
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
    [setConversationFlags, userId, workspaceId],
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

      setMessages(mapStoredMessagesToAgentMessages(storedMessages))
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
  }, [clearError, getConversation, handleError, setConversationId, setIsProcessing, setMessages, workspaceId])

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
      reportConvexFailure({
        error: err,
        context: 'useAgentConversationHistory:updateTitle',
        title: 'Could not update chat title',
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
      reportConvexFailure({
        error: err,
        context: 'useAgentConversationHistory:deleteConversation',
        title: 'Could not delete chat',
        fallbackMessage: 'Sorry — we could not delete that chat. Please try again.',
      })
      addMessage('agent', 'Sorry — I couldn\'t delete that chat. Please try again.')
    }
  }, [addMessage, conversationId, deleteConversationMutation, setConversationId, setMessages, workspaceId])

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
        reportConvexFailure({
          error: err,
          context: 'useAgentConversationHistory:duplicateConversation',
          title: 'Could not duplicate chat',
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
        reportConvexFailure({
          error: err,
          context: 'useAgentConversationHistory:exportConversation',
          title: 'Could not export chat',
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
        reportConvexFailure({
          error: err,
          context: 'useAgentConversationHistory:shareConversation',
          title: 'Could not share chat',
          fallbackMessage: 'Sorry — we could not prepare a share link for that chat.',
        })
        return null
      }
    },
    [shareConversationAction, workspaceId],
  )

  return {
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
  }
}
