'use client'

import { useCallback, useRef, useState } from 'react'
import { useToast } from '@/components/ui/use-toast'
import type { CollaborationMessage, CollaborationAttachment, CollaborationMention } from '@/types/collaboration'
import type { Channel } from '../types'
import type { SendMessageOptions, MessagesByChannelState } from './types'
import { MESSAGE_PAGE_SIZE } from './constants'
import { extractMentionsFromContent } from '../utils/mentions'
import type { ClientTeamMember } from '@/types/clients'

interface UseSendMessageOptions {
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
  
  const [sendingMessage, setSendingMessage] = useState(false)
  const sendingMessageRef = useRef(false)

  const handleSendMessage = useCallback(
    async (content: string, options?: SendMessageOptions) => {
      const trimmedContent = content.trim()
      const channelId = selectedChannelId

      if (!trimmedContent && !options?.attachmentPaths?.length) {
        toast({ title: '✍️ Message required', description: 'Enter a message before sending.', variant: 'destructive' })
        return
      }

      if (!channelId || !channels.some((channel) => channel.id === channelId)) {
        toast({ title: '⚠️ Channel unavailable', description: 'Select a channel and try again.', variant: 'destructive' })
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

        const token = await ensureSessionToken()
        const response = await fetch('/api/collaboration/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            channelId,
            content: trimmedContent,
            format: 'markdown',
            attachments: uploadedAttachments.length > 0 ? uploadedAttachments : undefined,
            mentions: mentionMetadata.length > 0 ? mentionMetadata : undefined,
            parentMessageId: options?.parentMessageId,
          }),
        })

        const payload = (await response.json().catch(() => null)) as
          | { message?: CollaborationMessage; error?: string }
          | null

        if (!response.ok || !payload?.message) {
          const message = typeof payload?.error === 'string' ? payload.error : 'Unable to send message'
          throw new Error(message)
        }

        const serverMessage = payload.message

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
        const message = error instanceof Error ? error.message : 'Unable to send message'
        toast({ title: 'Collaboration error', description: message, variant: 'destructive' })
      } finally {
        setSendingMessage(false)
        sendingMessageRef.current = false
      }
    },
    [
      channels,
      channelParticipants,
      clearAttachments,
      ensureSessionToken,
      mutateChannelMessages,
      selectedChannelId,
      stopTyping,
      toast,
      uploadAttachments,
    ]
  )

  return {
    sendingMessage,
    handleSendMessage,
  }
}

interface UseFetchMessagesOptions {
  ensureSessionToken: () => Promise<string>
  channels: Channel[]
  setMessagesByChannel: React.Dispatch<React.SetStateAction<MessagesByChannelState>>
}

export function useFetchMessages({
  ensureSessionToken,
  channels,
  setMessagesByChannel,
}: UseFetchMessagesOptions) {
  const { toast } = useToast()
  
  const [fetchingMessages, setFetchingMessages] = useState(false)
  const [channelCursors, setChannelCursors] = useState<Record<string, string | null>>({})
  const [hasMoreByChannel, setHasMoreByChannel] = useState<Record<string, boolean>>({})

  const fetchMessages = useCallback(
    async (channelId: string, cursor?: string | null) => {
      if (!channels.some((channel) => channel.id === channelId)) {
        return
      }

      setFetchingMessages(true)

      try {
        const token = await ensureSessionToken()
        const params = new URLSearchParams({ channelId, limit: String(MESSAGE_PAGE_SIZE) })
        if (cursor) {
          params.set('cursor', cursor)
        }

        const response = await fetch(`/api/collaboration/messages?${params.toString()}`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        const payload = (await response.json().catch(() => null)) as
          | { messages?: CollaborationMessage[]; nextCursor?: string | null; error?: string }
          | null

        if (!response.ok || !payload) {
          const message = typeof payload?.error === 'string' ? payload.error : 'Unable to fetch messages'
          throw new Error(message)
        }

        const messages = Array.isArray(payload.messages) ? payload.messages : []
        const nextCursor = typeof payload.nextCursor === 'string' ? payload.nextCursor : null

        setMessagesByChannel((prev) => {
          const existing = prev[channelId] ?? []
          if (cursor) {
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
        const message = error instanceof Error ? error.message : 'Unable to fetch messages'
        toast({ title: 'Fetch error', description: message, variant: 'destructive' })
      } finally {
        setFetchingMessages(false)
      }
    },
    [channels, ensureSessionToken, setMessagesByChannel, toast]
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
