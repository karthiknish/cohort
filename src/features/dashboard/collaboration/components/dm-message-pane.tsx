'use client'

import { useCallback, useMemo, useState } from 'react'

import type { DirectConversation, DirectMessage } from '../hooks/use-direct-messages'
import type { UnifiedMessage } from './message-list'
import type { MessagePaneHeaderInfo } from './unified-message-pane-types'
import { UnifiedMessagePane } from './unified-message-pane'

function toUnifiedMessage(msg: DirectMessage): UnifiedMessage {
  return {
    id: msg.legacyId,
    senderId: msg.senderId,
    senderName: msg.senderName,
    senderRole: msg.senderRole,
    content: msg.content,
    createdAtMs: msg.createdAtMs,
    edited: msg.edited,
    deleted: msg.deleted,
    deletedBy: msg.deletedBy ?? undefined,
    deletedAt: typeof msg.deletedAtMs === 'number' ? new Date(msg.deletedAtMs).toISOString() : undefined,
    reactions: msg.reactions ?? undefined,
    attachments: msg.attachments?.map(a => ({
      url: a.url,
      name: a.name,
      mimeType: a.type ?? undefined,
      size: a.size ? parseInt(a.size, 10) : undefined,
    })) ?? undefined,
    sharedTo: msg.sharedTo ?? undefined,
  }
}

interface DMMessagePaneProps {
  conversation: DirectConversation | null
  messages: DirectMessage[]
  isLoading: boolean
  isLoadingMore: boolean
  hasMore: boolean
  onLoadMore: () => void
  onSendMessage: (content: string) => Promise<void>
  isSending: boolean
  onToggleReaction: (messageLegacyId: string, emoji: string) => Promise<void>
  onDeleteMessage?: (messageLegacyId: string) => Promise<void>
  onEditMessage?: (messageLegacyId: string, newContent: string) => Promise<void>
  onArchive: (archived: boolean) => Promise<void>
  onMute: (muted: boolean) => Promise<void>
  currentUserId: string | null
  onShareToPlatform?: (message: DirectMessage, platform: 'email') => Promise<void>
}

export function DMMessagePane({
  conversation,
  messages,
  isLoading,
  isLoadingMore,
  hasMore,
  onLoadMore,
  onSendMessage,
  isSending,
  onToggleReaction,
  onDeleteMessage,
  onEditMessage,
  onArchive,
  onMute,
  currentUserId,
  onShareToPlatform,
}: DMMessagePaneProps) {
  const [inputValue, setInputValue] = useState('')
  const header = useMemo<MessagePaneHeaderInfo | null>(() => {
    if (!conversation) {
      return null
    }

    return {
      name: conversation.otherParticipantName,
      type: 'dm',
      role: conversation.otherParticipantRole,
      isArchived: conversation.isArchived,
      isMuted: conversation.isMuted,
      onArchive,
      onMute,
    }
  }, [conversation, onArchive, onMute])

  const unifiedMessages = useMemo(() => messages.map(toUnifiedMessage), [messages])

  const handleSend = useCallback(async (content: string) => {
    const trimmedContent = content.trim()
    if (!trimmedContent || isSending) return

    setInputValue('')

    try {
      await onSendMessage(trimmedContent)
    } catch (error) {
      setInputValue(trimmedContent)
      throw error
    }
  }, [isSending, onSendMessage])

  const handleReaction = useCallback(async (messageId: string, emoji: string) => {
    await onToggleReaction(messageId, emoji)
  }, [onToggleReaction])

  const handleShare = useCallback(async (message: UnifiedMessage, platform: 'email') => {
    if (!onShareToPlatform) return

    const originalMessage = messages.find((entry) => entry.legacyId === message.id)
    if (!originalMessage) {
      throw new Error('Message unavailable')
    }

    await onShareToPlatform(originalMessage, platform)
  }, [messages, onShareToPlatform])

  return (
    <UnifiedMessagePane
      header={header}
      messages={unifiedMessages}
      currentUserId={currentUserId}
      isLoading={isLoading}
      isLoadingMore={isLoadingMore}
      hasMore={hasMore}
      onLoadMore={onLoadMore}
      messageInput={inputValue}
      onMessageInputChange={setInputValue}
      onSendMessage={handleSend}
      isSending={isSending}
      onToggleReaction={handleReaction}
      onDeleteMessage={onDeleteMessage}
      onEditMessage={onEditMessage}
      onShareToPlatform={onShareToPlatform ? handleShare : undefined}
      placeholder={conversation ? `Message ${conversation.otherParticipantName}...` : 'Type a message...'}
    />
  )
}
