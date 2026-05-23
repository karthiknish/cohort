'use client'

import { useCallback, useMemo, useState } from 'react'

import type { CollaborationAttachment } from '@/types/collaboration'

import type { DirectConversation } from '../hooks/use-direct-messages'
import type { PendingAttachment } from '../hooks/types'
import type { Channel } from '../types'
import type { SourceFilter, UnifiedItem } from './unified-inbox-sections'

export type UnifiedInboxSidebarInput = {
  channels: Channel[]
  channelSummaries: Map<string, { lastMessage?: string | null; lastTimestamp?: string | null }>
  channelUnreadCounts: Record<string, number>
  dmConversations: DirectConversation[]
  selectedChannel: Channel | null
  selectedDM: DirectConversation | null
  onSelectChannel: (channelId: string | null) => void
  onSelectDM: (conversation: DirectConversation | null) => void
  isLoadingChannels: boolean
  isLoadingDMs: boolean
}

export type UnifiedInboxChannelInput = {
  channelMessages: Array<{ parentMessageId?: string | null }>
  visibleMessages: Array<{ parentMessageId?: string | null }>
  messageSearchQuery: string
  typingParticipants: Array<{ name?: string | null }>
}

export type UnifiedInboxDirectMessageInput = {
  messages: unknown[]
  visibleMessages: unknown[]
  messageSearchQuery: string
  sendMessage: (content: string, attachments?: CollaborationAttachment[]) => Promise<void>
  pendingAttachments: PendingAttachment[]
  uploadPendingAttachments: (attachments: PendingAttachment[]) => Promise<CollaborationAttachment[]>
  clearPendingAttachments: () => void
  typingParticipants: Array<{ name?: string | null }>
  notifyDmTyping: () => void
}

export type UseUnifiedInboxControllerArgs = {
  sidebar: UnifiedInboxSidebarInput
  channelPane: UnifiedInboxChannelInput
  directMessagePane: UnifiedInboxDirectMessageInput
  onBackToInbox?: () => void
}

export function useUnifiedInboxController({
  sidebar,
  channelPane,
  directMessagePane,
  onBackToInbox,
}: UseUnifiedInboxControllerArgs) {
  const {
    channels,
    channelSummaries,
    channelUnreadCounts,
    dmConversations,
    selectedChannel,
    selectedDM,
    onSelectChannel,
    onSelectDM,
    isLoadingChannels,
    isLoadingDMs,
  } = sidebar

  const {
    channelMessages,
    visibleMessages,
    messageSearchQuery,
    typingParticipants,
  } = channelPane

  const {
    messages: dmMessages,
    visibleMessages: dmVisibleMessages,
    messageSearchQuery: dmMessageSearchQuery,
    sendMessage: dmSendMessage,
    pendingAttachments,
    uploadPendingAttachments,
    clearPendingAttachments,
    typingParticipants: dmTypingParticipants,
    notifyDmTyping,
  } = directMessagePane

  const [searchQuery, setSearchQuery] = useState('')
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>('all')
  const [dmMessageInputByConversation, setDmMessageInputByConversation] = useState<Record<string, string>>({})

  const activeDmLegacyId = selectedDM?.legacyId ?? null
  const dmMessageInput = activeDmLegacyId ? (dmMessageInputByConversation[activeDmLegacyId] ?? '') : ''

  const setActiveDmMessageInput = useCallback(
    (value: string) => {
      if (!activeDmLegacyId) {
        return
      }

      setDmMessageInputByConversation((current) => ({
        ...current,
        [activeDmLegacyId]: value,
      }))

      if (value.trim().length > 0) {
        notifyDmTyping()
      }
    },
    [activeDmLegacyId, notifyDmTyping],
  )

  const handleSendDirectMessage = useCallback(
    async (content: string) => {
      const trimmed = content.trim()
      const hasPendingAttachments = pendingAttachments.length > 0

      if (!trimmed && !hasPendingAttachments) {
        return
      }

      let uploadedAttachments: CollaborationAttachment[] = []
      if (hasPendingAttachments) {
        uploadedAttachments = await uploadPendingAttachments(pendingAttachments)

        if (!trimmed && uploadedAttachments.length === 0) {
          return
        }
      }

      await dmSendMessage(trimmed, uploadedAttachments.length > 0 ? uploadedAttachments : undefined)
      if (activeDmLegacyId) {
        setDmMessageInputByConversation((current) => ({
          ...current,
          [activeDmLegacyId]: '',
        }))
      }
      clearPendingAttachments()
    },
    [activeDmLegacyId, clearPendingAttachments, dmSendMessage, pendingAttachments, uploadPendingAttachments],
  )

  const unifiedItems = useMemo((): UnifiedItem[] => {
    const items: UnifiedItem[] = []

    for (const channel of channels) {
      const summary = channelSummaries.get(channel.id)
      const unreadCount = channelUnreadCounts[channel.id] ?? 0
      items.push({
        id: channel.id,
        legacyId: channel.id,
        type: 'channel',
        name: channel.name,
        lastMessageSnippet: summary?.lastMessage ?? null,
        lastMessageAtMs: summary?.lastTimestamp ? new Date(summary.lastTimestamp).getTime() : null,
        isRead: unreadCount <= 0,
        unreadCount,
        metadata: { channelType: channel.type, channelAvatarUrl: channel.avatarUrl ?? null },
        originalData: channel,
      })
    }

    for (const conv of dmConversations) {
      items.push({
        id: conv.legacyId,
        legacyId: conv.legacyId,
        type: 'direct_message',
        name: conv.otherParticipantName,
        lastMessageSnippet: conv.lastMessageSnippet ?? null,
        lastMessageAtMs: conv.lastMessageAtMs ?? null,
        isRead: conv.isRead,
        unreadCount: conv.unreadCount ?? (conv.isRead ? 0 : 1),
        metadata: { otherParticipantRole: conv.otherParticipantRole },
        originalData: conv,
      })
    }

    return items.sort((a, b) => (b.lastMessageAtMs ?? 0) - (a.lastMessageAtMs ?? 0))
  }, [channels, channelSummaries, channelUnreadCounts, dmConversations])

  const filteredItems = useMemo(() => {
    return unifiedItems.filter((item) => {
      if (sourceFilter !== 'all' && item.type !== sourceFilter) return false
      if (!searchQuery.trim()) return true
      const query = searchQuery.toLowerCase()
      return (
        item.name?.toLowerCase().includes(query) ||
        item.lastMessageSnippet?.toLowerCase().includes(query) ||
        (item.type === 'direct_message' &&
          (item.originalData as DirectConversation).otherParticipantName?.toLowerCase().includes(query))
      )
    })
  }, [unifiedItems, sourceFilter, searchQuery])

  const totalUnread = unifiedItems.reduce((sum, item) => sum + item.unreadCount, 0)
  const channelCount = channels.length
  const dmCount = dmConversations.length
  const isLoading = isLoadingChannels || isLoadingDMs
  const isChannelSearchActive = messageSearchQuery.trim().length > 0
  const isDmSearchActive = dmMessageSearchQuery.trim().length > 0
  const topLevelChannelMessages = useMemo(
    () => channelMessages.filter((message) => !message?.parentMessageId),
    [channelMessages],
  )
  const channelMessagesForPane = isChannelSearchActive ? visibleMessages : topLevelChannelMessages
  const dmMessagesForPane = isDmSearchActive ? dmVisibleMessages : dmMessages

  const typingIndicatorText = useMemo(() => {
    const activeTypingParticipants = selectedChannel ? typingParticipants : selectedDM ? dmTypingParticipants : []

    if (activeTypingParticipants.length === 0) {
      return undefined
    }

    const names = activeTypingParticipants.flatMap((participant) => {
      const name = participant.name
      return typeof name === 'string' && name.trim().length > 0 ? [name] : []
    })

    if (names.length === 0) {
      return undefined
    }

    if (names.length === 1) {
      return `${names[0]} is typing...`
    }

    if (names.length === 2) {
      return `${names[0]} and ${names[1]} are typing...`
    }

    return `${names[0]}, ${names[1]}, and ${names.length - 2} others are typing...`
  }, [dmTypingParticipants, selectedChannel, selectedDM, typingParticipants])

  const handleSelectItem = useCallback(
    (item: UnifiedItem) => {
      if (item.type === 'channel') {
        onSelectChannel(item.id)
      } else {
        onSelectDM(item.originalData as DirectConversation)
      }
    },
    [onSelectChannel, onSelectDM],
  )

  const isSelected = useCallback(
    (item: UnifiedItem): boolean => {
      if (item.type === 'channel') return selectedChannel?.id === item.id
      return selectedDM?.legacyId === item.legacyId
    },
    [selectedChannel?.id, selectedDM?.legacyId],
  )

  const hasActiveConversation = Boolean(selectedChannel || selectedDM)

  const handleBackToInbox = useCallback(() => {
    onBackToInbox?.()
  }, [onBackToInbox])

  return {
    searchQuery,
    setSearchQuery,
    sourceFilter,
    setSourceFilter,
    filteredItems,
    totalUnread,
    channelCount,
    dmCount,
    isLoading,
    channelMessagesForPane,
    dmMessagesForPane,
    isChannelSearchActive,
    isDmSearchActive,
    typingIndicatorText,
    handleSelectItem,
    isSelected,
    hasActiveConversation,
    handleBackToInbox,
    dmMessageInput,
    setActiveDmMessageInput,
    handleSendDirectMessage,
  }
}
