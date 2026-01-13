'use client'

import { useCallback, useRef, useState } from 'react'
import { useToast } from '@/components/ui/use-toast'
import { useMutation } from 'convex/react'
import { collaborationApi } from '@/lib/convex-api'
import { asErrorMessage } from '@/lib/convex-errors'
import type {
  CollaborationMessage,
  CollaborationAttachment,
  CollaborationMention,
  CollaborationMessageFormat,
} from '@/types/collaboration'
import type { Channel } from '../types'
import type { SendMessageOptions, MessagesByChannelState } from './types'
import { MESSAGE_PAGE_SIZE } from './constants'
import { extractMentionsFromContent } from '../utils/mentions'
import type { ClientTeamMember } from '@/types/clients'

interface UseSendMessageOptions {
  workspaceId: string | null
  ensureSessionToken: () => Promise<string>
  currentUserId: string | null
  channels: Channel[]
  selectedChannelId: string | null
  channelParticipants: ClientTeamMember[]
  uploadAttachments: (channelId: string) => Promise<CollaborationAttachment[]>
  clearAttachments: () => void
  stopTyping: () => Promise<void>
  mutateChannelMessages: (channelId: string, updater: (messages: CollaborationMessage[]) => CollaborationMessage[]) => void
}

export function useSendMessage({
  workspaceId,
  ensureSessionToken,
  currentUserId,
  channels,
  selectedChannelId,
  channelParticipants,
  uploadAttachments,
  clearAttachments,
  stopTyping,
  mutateChannelMessages,
}: UseSendMessageOptions) {
  const { toast } = useToast()

  const createMessage = useMutation((collaborationApi as any).createMessage)

  const [sendingMessage, setSendingMessage] = useState(false)
  const sendingMessageRef = useRef(false)

  const handleSendMessage = useCallback(
    async (content: string, options?: SendMessageOptions) => {
      const trimmedContent = content.trim()
      const channelId = selectedChannelId

      if (!trimmedContent && !options?.attachmentPaths?.length) {
        toast({ title: 'Message required', description: 'Enter a message before sending.', variant: 'destructive' })
        return
      }

      if (!channelId || !channels.some((channel) => channel.id === channelId)) {
        toast({ title: 'Channel unavailable', description: 'Select a channel and try again.', variant: 'destructive' })
        return
      }

      if (sendingMessageRef.current) {
        return
      }

      setSendingMessage(true)
      sendingMessageRef.current = true

      try {
        await stopTyping()

        let uploadedAttachments: CollaborationAttachment[] = []
        if (!options?.skipAttachmentUpload) {
          uploadedAttachments = await uploadAttachments(channelId)
        }

        const mentionMatches = extractMentionsFromContent(trimmedContent)
        const mentionMetadata: CollaborationMention[] = mentionMatches.map((mention) => {
          const participant = channelParticipants.find(
            (member) => member.name.toLowerCase() === mention.name.toLowerCase()
          )
          return {
            slug: mention.slug,
            name: participant?.name ?? mention.name,
            role: participant?.role ?? null,
          }
        })

        if (!workspaceId) {
          throw new Error('Workspace unavailable')
        }

        const { clientId, projectId, type: channelType } = channels.find((channel) => channel.id === channelId) ?? {
          clientId: null,
          projectId: null,
          type: 'team',
        }

        const legacyId = crypto.randomUUID()

        await createMessage({
          workspaceId: String(workspaceId),
          legacyId,
          channelType,
          clientId: channelType === 'client' ? (clientId ?? null) : null,
          projectId: channelType === 'project' ? (projectId ?? null) : null,
          senderId: currentUserId,
          senderName: options?.senderName ?? 'Unknown User',
          senderRole: options?.senderRole ?? null,
          content: trimmedContent,
          attachments: uploadedAttachments,
          format: 'markdown',
          mentions: mentionMetadata,
          parentMessageId: options?.parentMessageId ?? null,
          threadRootId: options?.threadRootId ?? null,
          isThreadRoot: options?.parentMessageId ? false : true,
        })

        const serverMessage: CollaborationMessage = {
          id: legacyId,
          channelType,
          clientId: channelType === 'client' ? (clientId ?? null) : null,
          projectId: channelType === 'project' ? (projectId ?? null) : null,
          senderId: currentUserId,
          senderName: options?.senderName ?? 'Unknown User',
          senderRole: options?.senderRole ?? null,
          content: trimmedContent,
          createdAt: new Date().toISOString(),
          updatedAt: null,
          isEdited: false,
          deletedAt: null,
          deletedBy: null,
          isDeleted: false,
          attachments: uploadedAttachments.length > 0 ? uploadedAttachments : undefined,
          format: 'markdown',
          mentions: mentionMetadata.length > 0 ? mentionMetadata : undefined,
          reactions: undefined,
          parentMessageId: options?.parentMessageId ?? null,
          threadRootId: options?.threadRootId ?? null,
        }

        mutateChannelMessages(channelId, (messages) => {
          const exists = messages.some((entry) => entry.id === serverMessage.id)
          if (exists) {
            return messages
          }
          return [...messages, serverMessage]
        })

        clearAttachments()

        toast({ title: 'Message sent', description: 'Your message is live for the team.' })
      } catch (error) {
        toast({ title: 'Collaboration error', description: asErrorMessage(error), variant: 'destructive' })
      } finally {
        setSendingMessage(false)
        sendingMessageRef.current = false
      }
    },
    [
      channels,
      channelParticipants,
      clearAttachments,
      createMessage,
      currentUserId,
      mutateChannelMessages,
      selectedChannelId,
      stopTyping,
      toast,
      uploadAttachments,
      workspaceId,
    ]
  )

  return {
    sendingMessage,
    handleSendMessage,
  }
}

interface UseFetchMessagesOptions {
  workspaceId: string | null
  ensureSessionToken: () => Promise<string>
  channels: Channel[]
  setMessagesByChannel: React.Dispatch<React.SetStateAction<MessagesByChannelState>>
}

export function useFetchMessages({
  workspaceId,
  ensureSessionToken,
  channels,
  setMessagesByChannel,
}: UseFetchMessagesOptions) {
  const { toast } = useToast()

  const listChannel = useMutation((collaborationApi as any).listChannel)

  const [fetchingMessages, setFetchingMessages] = useState(false)
  const [channelCursors, setChannelCursors] = useState<Record<string, string | null>>({})
  const [hasMoreByChannel, setHasMoreByChannel] = useState<Record<string, boolean>>({})

  const fetchMessages = useCallback(
    async (channelId: string, after?: string | null) => {
      if (!channels.some((channel) => channel.id === channelId)) {
        return
      }

      setFetchingMessages(true)

      try {
        if (!workspaceId) {
          throw new Error('Workspace unavailable')
        }

        const channel = channels.find((item) => item.id === channelId)
        if (!channel) {
          return
        }

        // Convex expects channelType/clientId/projectId; REST used channelId only.
        const fetchLimit = MESSAGE_PAGE_SIZE + 1
        const rows = (await listChannel({
          workspaceId: String(workspaceId),
          channelType: channel.type,
          clientId: channel.type === 'client' ? (channel.clientId ?? null) : null,
          projectId: channel.type === 'project' ? (channel.projectId ?? null) : null,
          limit: fetchLimit,
        })) as any[]

        const mapped: CollaborationMessage[] = rows
          .map((row) => ({
            id: String(row?.legacyId ?? ''),
            channelType: typeof row?.channelType === 'string' ? row.channelType : channel.type,
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
            attachments: Array.isArray(row?.attachments) && row.attachments.length > 0 ? row.attachments : undefined,
            format: (row?.format === 'plaintext' ? 'plaintext' : 'markdown') as CollaborationMessageFormat,
            mentions: Array.isArray(row?.mentions) && row.mentions.length > 0 ? row.mentions : undefined,
            reactions: Array.isArray(row?.reactions) && row.reactions.length > 0 ? row.reactions : undefined,
            parentMessageId: typeof row?.parentMessageId === 'string' ? row.parentMessageId : null,
            threadRootId: typeof row?.threadRootId === 'string' ? row.threadRootId : null,
            threadReplyCount: typeof row?.threadReplyCount === 'number' ? row.threadReplyCount : undefined,
            threadLastReplyAt:
              typeof row?.threadLastReplyAtMs === 'number' ? new Date(row.threadLastReplyAtMs).toISOString() : null,
          }))
          // Convex listChannel is desc; UI expects asc(old->new)
          .sort((a, b) => new Date(a.createdAt ?? 0).getTime() - new Date(b.createdAt ?? 0).getTime())

        const page = mapped.slice(0, MESSAGE_PAGE_SIZE)
        const nextCursor = mapped.length > MESSAGE_PAGE_SIZE ? mapped[MESSAGE_PAGE_SIZE].id : null
        const messages = after ? page.filter((m) => m.id !== after) : page

        setMessagesByChannel((prev) => {
          const existing = prev[channelId] ?? []
          if (after) {
            // Paginating older messages
            const existingIds = new Set(existing.map((m) => m.id))
            const newMessages = messages.filter((m) => !existingIds.has(m.id))
            return { ...prev, [channelId]: [...newMessages, ...existing] }
          }
          // Initial load
          return { ...prev, [channelId]: messages }
        })

        setChannelCursors((prev) => ({ ...prev, [channelId]: nextCursor }))
        setHasMoreByChannel((prev) => ({ ...prev, [channelId]: !!nextCursor }))
      } catch (error) {
        toast({ title: 'Fetch error', description: asErrorMessage(error), variant: 'destructive' })
      } finally {
        setFetchingMessages(false)
      }
    },
     [channels, listChannel, setMessagesByChannel, toast, workspaceId]
   )


  const loadMoreMessages = useCallback(
    async (channelId: string) => {
      const cursor = channelCursors[channelId]
      if (!cursor || !hasMoreByChannel[channelId]) {
        return
      }
      await fetchMessages(channelId, cursor)
    },
    [channelCursors, fetchMessages, hasMoreByChannel]
  )

  return {
    fetchingMessages,
    channelCursors,
    hasMoreByChannel,
    fetchMessages,
    loadMoreMessages,
  }
}
