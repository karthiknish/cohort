'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useQuery } from 'convex/react'

import { useToast } from '@/components/ui/use-toast'
import { usePreview } from '@/contexts/preview-context'
import { collaborationApi } from '@/lib/convex-api'
import { getPreviewCollaborationMessages } from '@/lib/preview-data'
import type { CollaborationMessage } from '@/types/collaboration'
import type { Channel } from '../types'
import type { MessagesByChannelState, TypingParticipant } from './types'
import { REALTIME_MESSAGE_LIMIT, TYPING_TIMEOUT_MS } from './constants'
import { encodeTimestampIdCursor } from '@/lib/pagination'

function mapConvexRealtimeMessageRow(row: any): CollaborationMessage {
  const isDeleted = Boolean(row?.deleted || row?.deletedAtMs)
  const createdAt = typeof row?.createdAtMs === 'number' ? new Date(row.createdAtMs).toISOString() : null
  const updatedAt = typeof row?.updatedAtMs === 'number' ? new Date(row.updatedAtMs).toISOString() : null
  const deletedAt = typeof row?.deletedAtMs === 'number' ? new Date(row.deletedAtMs).toISOString() : null
  const threadLastReplyAt =
    typeof row?.threadLastReplyAtMs === 'number' ? new Date(row.threadLastReplyAtMs).toISOString() : null

  const content = typeof row?.content === 'string' ? row.content : ''

  return {
    id: String(row?.legacyId ?? ''),
    channelType: typeof row?.channelType === 'string' ? row.channelType : 'team',
    clientId: typeof row?.clientId === 'string' ? row.clientId : null,
    projectId: typeof row?.projectId === 'string' ? row.projectId : null,
    senderId: typeof row?.senderId === 'string' ? row.senderId : null,
    senderName: typeof row?.senderName === 'string' ? row.senderName : 'Unknown teammate',
    senderRole: typeof row?.senderRole === 'string' ? row.senderRole : null,
    content: isDeleted ? '' : content,
    createdAt,
    updatedAt,
    isEdited: Boolean(updatedAt && (!createdAt || createdAt !== updatedAt) && !isDeleted),
    deletedAt,
    deletedBy: typeof row?.deletedBy === 'string' ? row.deletedBy : null,
    isDeleted,
    attachments: Array.isArray(row?.attachments) && row.attachments.length > 0 ? row.attachments : undefined,
    format: row?.format === 'plaintext' ? 'plaintext' : 'markdown',
    mentions: Array.isArray(row?.mentions) && row.mentions.length > 0 ? row.mentions : undefined,
    reactions: Array.isArray(row?.reactions) && row.reactions.length > 0 ? row.reactions : undefined,
    parentMessageId: typeof row?.parentMessageId === 'string' ? row.parentMessageId : null,
    threadRootId: typeof row?.threadRootId === 'string' ? row.threadRootId : null,
    threadReplyCount: typeof row?.threadReplyCount === 'number' ? row.threadReplyCount : undefined,
    threadLastReplyAt,
  }
}

interface UseRealtimeMessagesOptions {
  workspaceId: string | null
  selectedChannel: Channel | null
  setMessagesByChannel: React.Dispatch<React.SetStateAction<MessagesByChannelState>>
  setNextCursorByChannel: React.Dispatch<React.SetStateAction<Record<string, string | null>>>
  setLoadingChannelId: React.Dispatch<React.SetStateAction<string | null>>
  setMessagesError: React.Dispatch<React.SetStateAction<string | null>>
  onError: (channel: Channel) => void
}

const FALLBACK_POLL_INTERVAL_MS = 30000

export function useRealtimeMessages({
  workspaceId,
  selectedChannel,
  setMessagesByChannel,
  setNextCursorByChannel,
  setLoadingChannelId,
  setMessagesError,
  onError,
}: UseRealtimeMessagesOptions) {
  const { toast } = useToast()
  const { isPreviewMode } = usePreview()

  const channelRef = useRef(selectedChannel)
  channelRef.current = selectedChannel

  const onErrorRef = useRef(onError)
  onErrorRef.current = onError

  const channelId = selectedChannel?.id ?? null
  const channelType = selectedChannel?.type ?? null
  const channelClientId = selectedChannel?.clientId ?? null
  const channelProjectId = selectedChannel?.projectId ?? null

  const convexEnabled =
    !isPreviewMode &&
    Boolean(workspaceId) &&
    Boolean(channelId) &&
    Boolean(channelType)

  const convexRows = useQuery(
    (collaborationApi as any).listChannel,
    convexEnabled
      ? {
          workspaceId: String(workspaceId),
          channelType: String(channelType),
          clientId: channelType === 'client' ? (channelClientId ?? null) : null,
          projectId: channelType === 'project' ? (channelProjectId ?? null) : null,
          limit: REALTIME_MESSAGE_LIMIT + 1,
        }
      : 'skip'
  ) as Array<any> | undefined

  useEffect(() => {
    if (!convexEnabled || !channelId) {
      return
    }

    setLoadingChannelId(channelId)
    setMessagesError(null)
  }, [channelId, convexEnabled, setLoadingChannelId, setMessagesError])

  useEffect(() => {
    if (!convexEnabled || !channelId) {
      return
    }

    if (!convexRows) {
      return
    }

    const rows = Array.isArray(convexRows) ? convexRows : []
    const hasMore = rows.length > REALTIME_MESSAGE_LIMIT
    const pageRows = hasMore ? rows.slice(0, REALTIME_MESSAGE_LIMIT) : rows

    const oldestRow = pageRows.length ? pageRows[pageRows.length - 1] : null
    const nextCursor =
      hasMore && oldestRow && typeof oldestRow.createdAtMs === 'number'
        ? encodeTimestampIdCursor(new Date(oldestRow.createdAtMs).toISOString(), String(oldestRow.legacyId ?? ''))
        : null

    const next = pageRows
      .map(mapConvexRealtimeMessageRow)
      .filter((message) => message.id)
      // `listChannel` is ordered desc; UI expects oldest->newest.
      .sort((a, b) => new Date(a.createdAt ?? 0).getTime() - new Date(b.createdAt ?? 0).getTime())

    setMessagesByChannel((prev) => ({
      ...prev,
      [channelId]: next,
    }))
    setNextCursorByChannel((prev) => ({
      ...prev,
      [channelId]: nextCursor,
    }))
    setLoadingChannelId((current) => (current === channelId ? null : current))
    setMessagesError(null)
  }, [
    channelId,
    convexEnabled,
    convexRows,
    setLoadingChannelId,
    setMessagesByChannel,
    setMessagesError,
    setNextCursorByChannel,
  ])

  useEffect(() => {
    if (convexEnabled) {
      return
    }

    if (!channelId || !channelType) {
      return
    }

    if (isPreviewMode) {
      const previewMessages = getPreviewCollaborationMessages(channelClientId, channelProjectId)
      setMessagesByChannel((prev) => {
        const existing = prev[channelId]
        if (existing && existing.length === previewMessages.length) {
          return prev
        }
        return {
          ...prev,
          [channelId]: previewMessages,
        }
      })
      setNextCursorByChannel((prev) => {
        if (prev[channelId] === null) return prev
        return {
          ...prev,
          [channelId]: null,
        }
      })
      setLoadingChannelId(null)
      setMessagesError(null)
    }
  }, [channelClientId, channelId, channelProjectId, channelType, convexEnabled, isPreviewMode, setLoadingChannelId, setMessagesByChannel, setMessagesError, setNextCursorByChannel])
}

interface UseRealtimeTypingOptions {
  userId: string | null
  workspaceId: string | null
  selectedChannel: Channel | null
}

export function useRealtimeTyping({ userId, workspaceId, selectedChannel }: UseRealtimeTypingOptions) {
  const [typingParticipants, setTypingParticipants] = useState<TypingParticipant[]>([])

  const channelId = selectedChannel?.id ?? null

  const convexEnabled =
    Boolean(userId) &&
    Boolean(workspaceId) &&
    Boolean(channelId)

  const typingRows = useQuery(
    (collaborationApi as any).listTyping,
    convexEnabled
      ? {
          workspaceId: String(workspaceId),
          channelId: String(channelId),
          limit: 20,
        }
      : 'skip'
  ) as Array<any> | undefined

  useEffect(() => {
    if (!convexEnabled) {
      return
    }

    if (!typingRows) {
      setTypingParticipants([])
      return
    }

    const list = typingRows
      .filter((row) => typeof row?.userId === 'string' && row.userId !== userId)
      .map((row) => {
        const name = typeof row?.name === 'string' ? row.name : null
        if (!name || name.trim().length === 0) return null
        const role = typeof row?.role === 'string' ? row.role : null
        return { name, role } as TypingParticipant
      })
      .filter(Boolean) as TypingParticipant[]

    setTypingParticipants(list)
  }, [convexEnabled, typingRows, userId])

  return { typingParticipants }
}

export function useTypingTimeout(typingParticipants: TypingParticipant[]) {
  const [freshTypingParticipants, setFreshTypingParticipants] = useState<TypingParticipant[]>(typingParticipants)

  useEffect(() => {
    setFreshTypingParticipants(typingParticipants)

    if (typingParticipants.length === 0) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      setFreshTypingParticipants([])
    }, TYPING_TIMEOUT_MS)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [typingParticipants])

  return freshTypingParticipants
}
