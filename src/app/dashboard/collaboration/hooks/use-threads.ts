'use client'

import { useCallback, useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useConvex } from 'convex/react'

import { useToast } from '@/components/ui/use-toast'
import { collaborationApi } from '@/lib/convex-api'
import { asErrorMessage } from '@/lib/convex-errors'
import { decodeTimestampIdCursor, encodeTimestampIdCursor } from '@/lib/pagination'
import { THREAD_PAGE_SIZE } from './constants'
import type {
  CollaborationAttachment,
  CollaborationChannelType,
  CollaborationMention,
  CollaborationMessage,
  CollaborationMessageFormat,
  CollaborationReaction,
} from '@/types/collaboration'

import type { ThreadErrorsState, ThreadMessagesState } from './types'

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

function mapThreadReplyRow(row: ConvexThreadRow): CollaborationMessage {
  return {
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
    threadLastReplyAt: typeof row?.threadLastReplyAtMs === 'number' ? new Date(row.threadLastReplyAtMs).toISOString() : null,
  }
}

interface UseThreadsOptions {
  workspaceId: string | null
}

export function useThreads({ workspaceId }: UseThreadsOptions) {
  const { toast } = useToast()
  const convex = useConvex()
  const queryClient = useQueryClient()

  const [activeThreadIds, setActiveThreadIds] = useState<Set<string>>(new Set())
  const [threadErrorsByRootId, setThreadErrorsByRootId] = useState<ThreadErrorsState>({})

  const [threadMessagesByRootId, setThreadMessagesByRootId] = useState<ThreadMessagesState>({})
  const [threadNextCursorByRootId, setThreadNextCursorByRootId] = useState<Record<string, string | null>>({})
  const [threadLoadingByRootId, setThreadLoadingByRootId] = useState<Record<string, boolean>>({})

  const fetchThreadRepliesPage = useCallback(
    async (threadRootId: string, cursor: string | null) => {
      if (!workspaceId) {
        return {
          replies: [] as CollaborationMessage[],
          nextCursor: null as string | null,
        }
      }

      const decoded = decodeTimestampIdCursor(cursor)
      const afterCreatedAtMs = decoded ? decoded.time.getTime() : undefined
      const afterLegacyId = decoded ? decoded.id : undefined

      const rows = (await convex.query(collaborationApi.listThreadReplies, {
        workspaceId: String(workspaceId),
        threadRootId,
        limit: THREAD_PAGE_SIZE + 1,
        afterCreatedAtMs,
        afterLegacyId,
      })) as ConvexThreadRow[]

      const mapped = rows
        .slice(0, THREAD_PAGE_SIZE)
        .map(mapThreadReplyRow)
        .filter((message) => message.id)
        .sort((a, b) => new Date(a.createdAt ?? 0).getTime() - new Date(b.createdAt ?? 0).getTime())
        .map((message) => ({
          ...message,
          reactions: message.reactions ?? [],
        }))

      const hasMore = rows.length > THREAD_PAGE_SIZE
      const lastDisplayed = rows.length ? rows[Math.min(rows.length, THREAD_PAGE_SIZE) - 1] : null
      const nextCursor =
        hasMore && lastDisplayed && typeof lastDisplayed.createdAtMs === 'number'
          ? encodeTimestampIdCursor(
              new Date(lastDisplayed.createdAtMs).toISOString(),
              String(lastDisplayed.legacyId ?? '')
            )
          : null

      return {
        replies: mapped,
        nextCursor,
      }
    },
    [convex, workspaceId]
  )

  // Keep state maps aligned with active thread set.
  useMemo(() => {
    const ids = Array.from(activeThreadIds)
    setThreadMessagesByRootId((prev) => {
      const next: ThreadMessagesState = { ...prev }
      for (const key of Object.keys(next)) {
        if (!ids.includes(key)) delete next[key]
      }
      return next
    })
    setThreadNextCursorByRootId((prev) => {
      const next = { ...prev }
      for (const key of Object.keys(next)) {
        if (!ids.includes(key)) delete next[key]
      }
      return next
    })
    setThreadLoadingByRootId((prev) => {
      const next = { ...prev }
      for (const key of Object.keys(next)) {
        if (!ids.includes(key)) delete next[key]
      }
      return next
    })
    return null
  }, [activeThreadIds])

  const loadThreadReplies = useCallback(
    async (threadRootId: string) => {
      const trimmedId = threadRootId.trim()
      if (!trimmedId) return

      setActiveThreadIds((prev: Set<string>) => {
        const next = new Set(prev)
        next.add(trimmedId)
        return next
      })

      setThreadErrorsByRootId((prev: ThreadErrorsState) => ({ ...prev, [trimmedId]: null }))

      setThreadLoadingByRootId((prev) => ({ ...prev, [trimmedId]: true }))

      try {
        const firstPage = await fetchThreadRepliesPage(trimmedId, null)
        setThreadMessagesByRootId((prev) => ({ ...prev, [trimmedId]: firstPage.replies }))
        setThreadNextCursorByRootId((prev) => ({ ...prev, [trimmedId]: firstPage.nextCursor }))
      } catch (error) {
        const message = asErrorMessage(error)
        setThreadErrorsByRootId((prev: ThreadErrorsState) => ({ ...prev, [trimmedId]: message }))
        toast({ title: 'Thread loading failed', description: message, variant: 'destructive' })
      } finally {
        setThreadLoadingByRootId((prev) => ({ ...prev, [trimmedId]: false }))
      }
    },
    [fetchThreadRepliesPage, toast]
  )

  const loadMoreThreadReplies = useCallback(
    async (threadRootId: string) => {
      const trimmedId = threadRootId.trim()
      if (!trimmedId) return

      const cursor = threadNextCursorByRootId[trimmedId] ?? null
      const isLoading = threadLoadingByRootId[trimmedId] ?? false
      if (!cursor || isLoading) {
        return
      }

      setThreadLoadingByRootId((prev) => ({ ...prev, [trimmedId]: true }))

      try {
        const page = await fetchThreadRepliesPage(trimmedId, cursor)
        setThreadMessagesByRootId((prev) => {
          const existing = prev[trimmedId] ?? []
          return { ...prev, [trimmedId]: [...existing, ...page.replies] }
        })
        setThreadNextCursorByRootId((prev) => ({ ...prev, [trimmedId]: page.nextCursor }))
      } catch (error) {
        const message = asErrorMessage(error)
        setThreadErrorsByRootId((prev: ThreadErrorsState) => ({ ...prev, [trimmedId]: message }))
        toast({ title: 'Thread loading failed', description: message, variant: 'destructive' })
      } finally {
        setThreadLoadingByRootId((prev) => ({ ...prev, [trimmedId]: false }))
      }
    },
    [fetchThreadRepliesPage, threadLoadingByRootId, threadNextCursorByRootId, toast]
  )

  const clearThreadReplies = useCallback((threadRootId?: string) => {
    if (!threadRootId) {
      setActiveThreadIds(new Set())
      setThreadErrorsByRootId({})
      return
    }

    const trimmedId = threadRootId.trim()
    if (!trimmedId) return

    setActiveThreadIds((prev: Set<string>) => {
      if (!prev.has(trimmedId)) return prev
      const next = new Set(prev)
      next.delete(trimmedId)
      return next
    })

    setThreadErrorsByRootId((prev: ThreadErrorsState) => {
      if (!(trimmedId in prev)) return prev
      const next = { ...prev }
      delete next[trimmedId]
      return next
    })

    queryClient.removeQueries({ queryKey: ['threadReplies', workspaceId, trimmedId] })
  }, [queryClient, workspaceId])

  const addThreadReply = useCallback(
    (rootId: string, message: CollaborationMessage) => {
      queryClient.setQueryData(['threadReplies', workspaceId, rootId], (existing: any) => {
        const data = existing as any
        if (!data?.pages?.length) return existing

        const pages = [...data.pages]
        const lastPageIndex = pages.length - 1
        const lastPage = pages[lastPageIndex]
        const currentReplies: CollaborationMessage[] = lastPage?.replies ?? []

        const exists = currentReplies.some((entry) => entry.id === message.id)
        if (exists) return existing

        pages[lastPageIndex] = { ...lastPage, replies: [...currentReplies, message] }
        return { ...data, pages }
      })
    },
    [queryClient, workspaceId]
  )

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
