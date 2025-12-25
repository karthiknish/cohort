'use client'

import { useCallback, useState } from 'react'
import { useToast } from '@/components/ui/use-toast'
import type { CollaborationMessage } from '@/types/collaboration'
import type {
  ThreadMessagesState,
  ThreadCursorsState,
  ThreadLoadingState,
  ThreadErrorsState,
} from './types'
import { THREAD_PAGE_SIZE } from './constants'

interface UseThreadsOptions {
  ensureSessionToken: () => Promise<string>
}

export function useThreads({ ensureSessionToken }: UseThreadsOptions) {
  const { toast } = useToast()
  
  const [threadMessagesByRootId, setThreadMessagesByRootId] = useState<ThreadMessagesState>({})
  const [threadNextCursorByRootId, setThreadNextCursorByRootId] = useState<ThreadCursorsState>({})
  const [threadLoadingByRootId, setThreadLoadingByRootId] = useState<ThreadLoadingState>({})
  const [threadErrorsByRootId, setThreadErrorsByRootId] = useState<ThreadErrorsState>({})

  const fetchThreadReplies = useCallback(
    async (
      threadRootId: string,
      options: { after?: string | null; replace?: boolean } = {}
    ): Promise<void> => {
      const trimmedId = threadRootId.trim()
      if (!trimmedId) {
        return
      }

      const after = options.after ?? null
      const shouldReplace = options.replace ?? !after

      setThreadErrorsByRootId((prev) => ({
        ...prev,
        [trimmedId]: null,
      }))
      setThreadLoadingByRootId((prev) => ({
        ...prev,
        [trimmedId]: true,
      }))

      try {
        const token = await ensureSessionToken()
        const params = new URLSearchParams()
        params.set('threadRootId', trimmedId)
        params.set('pageSize', THREAD_PAGE_SIZE.toString())
        if (after) {
          params.set('after', after)
        }

        const response = await fetch(`/api/collaboration/messages?${params.toString()}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: 'no-store',
        })

        const payload = (await response.json().catch(() => null)) as
          | { messages?: CollaborationMessage[]; nextCursor?: string | null; error?: string }
          | null

        if (!response.ok || !payload) {
          const message = typeof payload?.error === 'string' ? payload.error : 'Unable to load thread replies'
          throw new Error(message)
        }

        const replies = Array.isArray(payload.messages) ? payload.messages : []
        const normalizedReplies = replies.map((message) => ({
          ...message,
          reactions: message.reactions ?? [],
        }))

        setThreadMessagesByRootId((prev) => {
          const existing = prev[trimmedId] ?? []

          if (shouldReplace) {
            const sameLength = existing.length === normalizedReplies.length
            const sameOrder = sameLength
              ? existing.every((message, index) => message.id === normalizedReplies[index]?.id)
              : false

            if (sameOrder) {
              return prev
            }

            return {
              ...prev,
              [trimmedId]: normalizedReplies,
            }
          }

          if (normalizedReplies.length === 0) {
            return prev
          }

          const existingIds = new Set(existing.map((message) => message.id))
          const merged = normalizedReplies.filter((message) => !existingIds.has(message.id))
          if (merged.length === 0) {
            return prev
          }

          return {
            ...prev,
            [trimmedId]: [...existing, ...merged],
          }
        })

        setThreadNextCursorByRootId((prev) => {
          const nextCursor = payload.nextCursor ?? null
          if (prev[trimmedId] === nextCursor) {
            return prev
          }
          return {
            ...prev,
            [trimmedId]: nextCursor,
          }
        })

        setThreadErrorsByRootId((prev) => {
          if (prev[trimmedId] === null) {
            return prev
          }
          return {
            ...prev,
            [trimmedId]: null,
          }
        })
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to load thread replies'
        setThreadErrorsByRootId((prev) => ({
          ...prev,
          [trimmedId]: message,
        }))
        toast({ title: '⚠️ Thread loading failed', description: message, variant: 'destructive' })
      } finally {
        setThreadLoadingByRootId((prev) => ({
          ...prev,
          [trimmedId]: false,
        }))
      }
    },
    [ensureSessionToken, toast]
  )

  const loadThreadReplies = useCallback(
    async (threadRootId: string) => {
      const trimmedId = threadRootId.trim()
      if (!trimmedId) {
        return
      }

      await fetchThreadReplies(trimmedId, { after: null, replace: true })
    },
    [fetchThreadReplies]
  )

  const loadMoreThreadReplies = useCallback(
    async (threadRootId: string) => {
      const trimmedId = threadRootId.trim()
      if (!trimmedId) {
        return
      }

      const cursor = threadNextCursorByRootId[trimmedId]
      if (!cursor) {
        return
      }

      await fetchThreadReplies(trimmedId, { after: cursor, replace: false })
    },
    [fetchThreadReplies, threadNextCursorByRootId]
  )

  const clearThreadReplies = useCallback((threadRootId?: string) => {
    if (!threadRootId) {
      setThreadMessagesByRootId({})
      setThreadNextCursorByRootId({})
      setThreadLoadingByRootId({})
      setThreadErrorsByRootId({})
      return
    }

    const trimmedId = threadRootId.trim()
    if (!trimmedId) {
      return
    }

    setThreadMessagesByRootId((prev) => {
      if (!(trimmedId in prev)) {
        return prev
      }
      const next = { ...prev }
      delete next[trimmedId]
      return next
    })

    setThreadNextCursorByRootId((prev) => {
      if (!(trimmedId in prev)) {
        return prev
      }
      const next = { ...prev }
      delete next[trimmedId]
      return next
    })

    setThreadLoadingByRootId((prev) => {
      if (!(trimmedId in prev)) {
        return prev
      }
      const next = { ...prev }
      delete next[trimmedId]
      return next
    })

    setThreadErrorsByRootId((prev) => {
      if (!(trimmedId in prev)) {
        return prev
      }
      const next = { ...prev }
      delete next[trimmedId]
      return next
    })
  }, [])

  const addThreadReply = useCallback((rootId: string, message: CollaborationMessage) => {
    setThreadMessagesByRootId((prev) => {
      const existing = prev[rootId]
      if (!existing) return prev
      return {
        ...prev,
        [rootId]: [...existing, message],
      }
    })
  }, [])

  return {
    threadMessagesByRootId,
    threadNextCursorByRootId,
    threadLoadingByRootId,
    threadErrorsByRootId,
    loadThreadReplies,
    loadMoreThreadReplies,
    clearThreadReplies,
    addThreadReply,
  }
}
