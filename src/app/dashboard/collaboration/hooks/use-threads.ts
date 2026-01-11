'use client'

import { useCallback, useState } from 'react'
import { useToast } from '@/components/ui/use-toast'
import { useConvex } from 'convex/react'
import { collaborationApi } from '@/lib/convex-api'
import type {
  CollaborationAttachment,
  CollaborationChannelType,
  CollaborationMention,
  CollaborationMessage,
  CollaborationMessageFormat,
  CollaborationReaction,
} from '@/types/collaboration'
import type {
  ThreadMessagesState,
  ThreadCursorsState,
  ThreadLoadingState,
  ThreadErrorsState,
} from './types'
import { THREAD_PAGE_SIZE } from './constants'
import { decodeTimestampIdCursor, encodeTimestampIdCursor } from '@/lib/pagination'

interface ConvexThreadRow {
  legacyId?: string
  channelType?: string
  clientId?: string
  projectId?: string
  senderId?: string
  senderName?: string
  senderRole?: string
  content?: string
  createdAtMs?: number
  updatedAtMs?: number
  deletedAtMs?: number
  deleted?: boolean
  deletedBy?: string
  attachments?: unknown[]
  format?: string
  mentions?: unknown[]
  reactions?: unknown[]
  parentMessageId?: string
  threadRootId?: string
  threadReplyCount?: number
  threadLastReplyAtMs?: number
}

const VALID_CHANNEL_TYPES: CollaborationChannelType[] = ['client', 'team', 'project']

function isValidChannelType(value: unknown): value is CollaborationChannelType {
  return typeof value === 'string' && VALID_CHANNEL_TYPES.includes(value as CollaborationChannelType)
}

interface UseThreadsOptions {
  workspaceId: string | null
}

export function useThreads({ workspaceId }: UseThreadsOptions) {
  const { toast } = useToast()

  const convex = useConvex()

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
        if (!workspaceId) {
          throw new Error('Workspace unavailable')
        }

        const decoded = decodeTimestampIdCursor(after)
        const afterCreatedAtMs = decoded ? decoded.time.getTime() : undefined
        const afterLegacyId = decoded ? decoded.id : undefined

        const rows = (await convex.query(collaborationApi.listThreadReplies, {
          workspaceId: String(workspaceId),
          threadRootId: trimmedId,
          limit: THREAD_PAGE_SIZE + 1,
          afterCreatedAtMs,
          afterLegacyId,
        })) as ConvexThreadRow[]

        const replies: CollaborationMessage[] = rows
          .slice(0, THREAD_PAGE_SIZE)
          .map((row: ConvexThreadRow) => ({
            id: String(row?.legacyId ?? ''),
            channelType: isValidChannelType(row?.channelType) ? row.channelType : 'team',
            clientId: typeof row?.clientId === 'string' ? row.clientId : null,
            projectId: typeof row?.projectId === 'string' ? row.projectId : null,
            senderId: typeof row?.senderId === 'string' ? row.senderId : null,
            senderName: typeof row?.senderName === 'string' ? row.senderName : 'Unknown teammate',
            senderRole: typeof row?.senderRole === 'string' ? row.senderRole : null,
            content: Boolean(row?.deleted || row?.deletedAtMs) ? '' : String(row?.content ?? ''),
            createdAt: typeof row?.createdAtMs === 'number' ? new Date(row.createdAtMs).toISOString() : null,
            updatedAt: typeof row?.updatedAtMs === 'number' ? new Date(row.updatedAtMs).toISOString() : null,
            isEdited: Boolean(row?.updatedAtMs && row?.createdAtMs && row.updatedAtMs !== row.createdAtMs),
            deletedAt: typeof row?.deletedAtMs === 'number' ? new Date(row.deletedAtMs).toISOString() : null,
            deletedBy: typeof row?.deletedBy === 'string' ? row.deletedBy : null,
            isDeleted: Boolean(row?.deleted || row?.deletedAtMs),
            attachments:
              Array.isArray(row?.attachments) && row.attachments.length > 0
                ? (row.attachments as CollaborationAttachment[])
                : undefined,
            format: (row?.format === 'plaintext' ? 'plaintext' : 'markdown') as CollaborationMessageFormat,
            mentions:
              Array.isArray(row?.mentions) && row.mentions.length > 0
                ? (row.mentions as CollaborationMention[])
                : undefined,
            reactions:
              Array.isArray(row?.reactions) && row.reactions.length > 0
                ? (row.reactions as CollaborationReaction[])
                : undefined,
            parentMessageId: typeof row?.parentMessageId === 'string' ? row.parentMessageId : null,
            threadRootId: typeof row?.threadRootId === 'string' ? row.threadRootId : null,
            threadReplyCount: typeof row?.threadReplyCount === 'number' ? row.threadReplyCount : undefined,
            threadLastReplyAt:
              typeof row?.threadLastReplyAtMs === 'number' ? new Date(row.threadLastReplyAtMs).toISOString() : null,
          }))
          .sort((a, b) => new Date(a.createdAt ?? 0).getTime() - new Date(b.createdAt ?? 0).getTime())
        const normalizedReplies = replies.map((message) => ({
          ...message,
          reactions: message.reactions ?? [],
        }))

        const hasMore = rows.length > THREAD_PAGE_SIZE
        const lastDisplayed = rows.length ? rows[Math.min(rows.length, THREAD_PAGE_SIZE) - 1] : null
        const nextCursor =
          hasMore && lastDisplayed && typeof lastDisplayed.createdAtMs === 'number'
            ? encodeTimestampIdCursor(new Date(lastDisplayed.createdAtMs).toISOString(), String(lastDisplayed.legacyId ?? ''))
            : null

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
        toast({ title: 'Thread loading failed', description: message, variant: 'destructive' })
      } finally {
        setThreadLoadingByRootId((prev) => ({
          ...prev,
          [trimmedId]: false,
        }))
      }
    },
    [convex, toast, workspaceId]
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
