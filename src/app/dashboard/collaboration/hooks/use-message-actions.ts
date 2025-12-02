'use client'

import { useCallback, useState } from 'react'
import { useToast } from '@/components/ui/use-toast'
import type { CollaborationMessage, CollaborationReaction } from '@/types/collaboration'
import { COLLABORATION_REACTION_SET } from '@/constants/collaboration-reactions'
import type { Channel } from '../types'
import type { ReactionPendingState, MessagesByChannelState } from './types'
import { extractMentionsFromContent } from '../utils/mentions'
import type { ClientTeamMember } from '@/types/clients'

interface UseMessageActionsOptions {
  ensureSessionToken: () => Promise<string>
  channels: Channel[]
  channelParticipants: ClientTeamMember[]
  mutateChannelMessages: (channelId: string, updater: (messages: CollaborationMessage[]) => CollaborationMessage[]) => void
}

export function useMessageActions({
  ensureSessionToken,
  channels,
  channelParticipants,
  mutateChannelMessages,
}: UseMessageActionsOptions) {
  const { toast } = useToast()
  
  const [messageUpdatingId, setMessageUpdatingId] = useState<string | null>(null)
  const [messageDeletingId, setMessageDeletingId] = useState<string | null>(null)
  const [reactionUpdatingByMessage, setReactionUpdatingByMessage] = useState<ReactionPendingState>({})

  const handleEditMessage = useCallback(
    async (channelId: string, messageId: string, nextContent: string) => {
      const trimmedContent = nextContent.trim()
      if (!trimmedContent) {
        toast({ title: '✏️ Message required', description: 'Enter a message before saving.', variant: 'destructive' })
        return
      }

      if (!channels.some((channel) => channel.id === channelId)) {
        toast({ title: '⚠️ Channel unavailable', description: 'Refresh the page and try editing again.', variant: 'destructive' })
        return
      }

      setMessageUpdatingId(messageId)

      try {
        const mentionMatches = extractMentionsFromContent(trimmedContent)
        const mentionMetadata = mentionMatches.map((mention) => {
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
        const response = await fetch(`/api/collaboration/messages/${encodeURIComponent(messageId)}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            content: trimmedContent,
            format: 'markdown',
            mentions: mentionMetadata.length > 0 ? mentionMetadata : [],
          }),
        })

        const payload = (await response.json().catch(() => null)) as
          | { message?: CollaborationMessage; error?: string }
          | null

        if (!response.ok || !payload?.message) {
          const message = typeof payload?.error === 'string' ? payload.error : 'Unable to update message'
          throw new Error(message)
        }

        const updatedMessage = payload.message

        mutateChannelMessages(channelId, (messages) => {
          const index = messages.findIndex((entry) => entry.id === messageId)
          if (index === -1) {
            return messages
          }
          const next = [...messages]
          next[index] = {
            ...messages[index],
            ...updatedMessage,
            mentions: updatedMessage.mentions ?? mentionMetadata,
            format: updatedMessage.format ?? 'markdown',
          }
          return next
        })

        toast({ title: 'Message updated', description: 'Your edit is live for the team.' })
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to update message'
        toast({ title: 'Collaboration error', description: message, variant: 'destructive' })
      } finally {
        setMessageUpdatingId((current) => (current === messageId ? null : current))
      }
    },
    [channelParticipants, channels, ensureSessionToken, mutateChannelMessages, toast]
  )

  const handleDeleteMessage = useCallback(
    async (channelId: string, messageId: string) => {
      if (!channels.some((channel) => channel.id === channelId)) {
        toast({ title: 'Channel unavailable', description: 'Refresh and try deleting again.', variant: 'destructive' })
        return
      }

      setMessageDeletingId(messageId)

      try {
        const token = await ensureSessionToken()
        const response = await fetch(`/api/collaboration/messages/${encodeURIComponent(messageId)}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        const payload = (await response.json().catch(() => null)) as
          | { message?: CollaborationMessage; error?: string }
          | null

        if (!response.ok || !payload?.message) {
          const message = typeof payload?.error === 'string' ? payload.error : 'Unable to delete message'
          throw new Error(message)
        }

        const deletedMessage = payload.message

        mutateChannelMessages(channelId, (messages) => {
          const index = messages.findIndex((entry) => entry.id === messageId)
          if (index === -1) {
            return messages
          }
          const next = [...messages]
          next[index] = {
            ...messages[index],
            ...deletedMessage,
            attachments: [],
          }
          return next
        })

        toast({ title: 'Message removed', description: 'The message is no longer visible to teammates.' })
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to delete message'
        toast({ title: 'Collaboration error', description: message, variant: 'destructive' })
      } finally {
        setMessageDeletingId((current) => (current === messageId ? null : current))
      }
    },
    [channels, ensureSessionToken, mutateChannelMessages, toast]
  )

  const handleToggleReaction = useCallback(
    async (channelId: string, messageId: string, emoji: string) => {
      if (!channels.some((channel) => channel.id === channelId)) {
        toast({ title: 'Channel unavailable', description: 'Refresh and try reacting again.', variant: 'destructive' })
        return
      }

      if (!COLLABORATION_REACTION_SET.has(emoji)) {
        toast({ title: 'Reaction unavailable', description: 'That emoji is not supported for reactions.', variant: 'destructive' })
        return
      }

      setReactionUpdatingByMessage((prev) => ({
        ...prev,
        [messageId]: emoji,
      }))

      try {
        const token = await ensureSessionToken()
        const response = await fetch(`/api/collaboration/messages/${encodeURIComponent(messageId)}/reactions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ emoji }),
        })

        const payload = (await response.json().catch(() => null)) as
          | { reactions?: CollaborationReaction[]; error?: string }
          | null

        if (!response.ok || !payload) {
          const message = typeof payload?.error === 'string' ? payload.error : 'Unable to update reaction'
          throw new Error(message)
        }

        const reactions = Array.isArray(payload.reactions) ? payload.reactions : []

        mutateChannelMessages(channelId, (messages) => {
          const index = messages.findIndex((entry) => entry.id === messageId)
          if (index === -1) {
            return messages
          }
          const next = [...messages]
          next[index] = {
            ...messages[index],
            reactions,
          }
          return next
        })
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to update reaction'
        toast({ title: 'Reaction failed', description: message, variant: 'destructive' })
      } finally {
        setReactionUpdatingByMessage((prev) => {
          const next = { ...prev }
          if (next[messageId] === emoji) {
            delete next[messageId]
          }
          return next
        })
      }
    },
    [channels, ensureSessionToken, mutateChannelMessages, toast]
  )

  const clearReactionState = useCallback(() => {
    setReactionUpdatingByMessage({})
  }, [])

  return {
    messageUpdatingId,
    messageDeletingId,
    reactionUpdatingByMessage,
    handleEditMessage,
    handleDeleteMessage,
    handleToggleReaction,
    clearReactionState,
  }
}
