'use client'

import { useCallback, useState } from 'react'
import { useToast } from '@/components/ui/use-toast'
import { useMutation } from 'convex/react'
import { collaborationApi } from '@/lib/convex-api'
import { asErrorMessage, logError } from '@/lib/convex-errors'
import type { CollaborationMessage, CollaborationReaction } from '@/types/collaboration'
import { COLLABORATION_REACTION_SET } from '@/constants/collaboration-reactions'
import type { Channel } from '../types'
import type { ReactionPendingState } from './types'
import { extractMentionsFromContent } from '../utils/mentions'
import type { ClientTeamMember } from '@/types/clients'

interface UseMessageActionsOptions {
  workspaceId: string | null
  userId: string | null
  channels: Channel[]
  channelParticipants: ClientTeamMember[]
  mutateChannelMessages: (channelId: string, updater: (messages: CollaborationMessage[]) => CollaborationMessage[]) => void
}

export function useMessageActions({
  workspaceId,
  userId,
  channels,
  channelParticipants,
  mutateChannelMessages,
}: UseMessageActionsOptions) {
  const { toast } = useToast()

  const updateMessage = useMutation((collaborationApi as any).updateMessage)
  const softDeleteMessage = useMutation((collaborationApi as any).softDeleteMessage)
  const toggleReaction = useMutation((collaborationApi as any).toggleReaction)

  const [messageUpdatingId, setMessageUpdatingId] = useState<string | null>(null)
  const [messageDeletingId, setMessageDeletingId] = useState<string | null>(null)
  const [reactionUpdatingByMessage, setReactionUpdatingByMessage] = useState<ReactionPendingState>({})

  const handleToggleReaction = useCallback(
    async (channelId: string, messageId: string, emoji: string) => {
      if (!channels.some((channel) => channel.id === channelId)) {
        toast({ title: 'Channel unavailable', description: 'Refresh and try reacting again.', variant: 'destructive' })
        return
      }

      if (!COLLABORATION_REACTION_SET.has(emoji)) {
        toast({
          title: 'Reaction unavailable',
          description: 'That emoji is not supported for reactions.',
          variant: 'destructive',
        })
        return
      }

      setReactionUpdatingByMessage((prev) => ({
        ...prev,
        [messageId]: emoji,
      }))

      try {
        if (!workspaceId) {
          throw new Error('Workspace unavailable')
        }

        if (!userId) {
          throw new Error('You must be signed in to react')
        }

        const result = (await toggleReaction({
          workspaceId: String(workspaceId),
          legacyId: messageId,
          emoji,
          userId: String(userId),
        })) as { ok?: boolean; reactions?: CollaborationReaction[] }

        const reactions = Array.isArray(result?.reactions) ? result.reactions : []

        mutateChannelMessages(channelId, (messages) => {
          const index = messages.findIndex((entry) => entry.id === messageId)
          if (index === -1) {
            return messages
          }
          const next = [...messages]
          next[index] = {
            ...messages[index]!, // Safe: we verified index !== -1
            reactions,
          }
          return next
        })
      } catch (error) {
        logError(error, 'useMessageActions:handleToggleReaction')
        toast({ title: 'Reaction failed', description: asErrorMessage(error), variant: 'destructive' })
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
    [channels, mutateChannelMessages, toast, toggleReaction, userId, workspaceId]
  )

  const handleEditMessage = useCallback(
    async (channelId: string, messageId: string, nextContent: string) => {
      const trimmedContent = nextContent.trim()
      if (!trimmedContent) {
        toast({ title: 'Message required', description: 'Enter a message before saving.', variant: 'destructive' })
        return
      }

      if (!channels.some((channel) => channel.id === channelId)) {
        toast({ title: 'Channel unavailable', description: 'Refresh the page and try editing again.', variant: 'destructive' })
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

        if (!workspaceId) {
          throw new Error('Workspace unavailable')
        }

        if (!userId) {
          throw new Error('You must be signed in to edit messages')
        }

        await updateMessage({
          workspaceId: String(workspaceId),
          legacyId: messageId,
          content: trimmedContent,
          format: 'markdown',
          mentions: mentionMetadata,
        })

        const updatedMessage: CollaborationMessage = {
          id: messageId,
          channelType: channels.find((c) => c.id === channelId)?.type ?? 'team',
          clientId: null,
          projectId: null,
          senderId: null,
          senderName: 'Unknown teammate',
          senderRole: null,
          content: trimmedContent,
          createdAt: null,
          updatedAt: new Date().toISOString(),
          isEdited: true,
          deletedAt: null,
          deletedBy: null,
          isDeleted: false,
          attachments: undefined,
          format: 'markdown',
          mentions: mentionMetadata,
          reactions: [],
          parentMessageId: null,
          threadRootId: null,
        }

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
        logError(error, 'useMessageActions:handleEditMessage')
        toast({ title: 'Collaboration error', description: asErrorMessage(error), variant: 'destructive' })
      } finally {
        setMessageUpdatingId((current) => (current === messageId ? null : current))
      }
    },
    [channelParticipants, channels, mutateChannelMessages, toast, updateMessage, userId, workspaceId]
   )


  const handleDeleteMessage = useCallback(
    async (channelId: string, messageId: string) => {
      if (!channels.some((channel) => channel.id === channelId)) {
        toast({ title: 'Channel unavailable', description: 'Refresh and try deleting again.', variant: 'destructive' })
        return
      }

      setMessageDeletingId(messageId)

      try {
        if (!workspaceId) {
          throw new Error('Workspace unavailable')
        }

        if (!userId) {
          throw new Error('You must be signed in to delete messages')
        }

        await softDeleteMessage({
          workspaceId: String(workspaceId),
          legacyId: messageId,
          deletedBy: String(userId),
        })

        const deletedMessage: CollaborationMessage = {
          id: messageId,
          channelType: channels.find((c) => c.id === channelId)?.type ?? 'team',
          clientId: null,
          projectId: null,
          senderId: null,
          senderName: 'Unknown teammate',
          senderRole: null,
          content: '',
          createdAt: null,
          updatedAt: new Date().toISOString(),
          isEdited: false,
          deletedAt: new Date().toISOString(),
          deletedBy: String(userId),
          isDeleted: true,
          attachments: [],
          format: 'markdown',
          mentions: undefined,
          reactions: [],
          parentMessageId: null,
          threadRootId: null,
        }

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
        logError(error, 'useMessageActions:handleDeleteMessage')
        toast({ title: 'Collaboration error', description: asErrorMessage(error), variant: 'destructive' })
      } finally {
        setMessageDeletingId((current) => (current === messageId ? null : current))
      }
    },
     [channels, mutateChannelMessages, softDeleteMessage, toast, userId, workspaceId]
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
