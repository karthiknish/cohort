'use client'

import { useCallback, useMemo, useState } from 'react'
import type { ClientTeamMember } from '@/types/clients'
import type { CollaborationAttachment, CollaborationMessage } from '@/types/collaboration'

import type { DirectConversation, DirectMessage } from '../hooks/use-direct-messages'
import type { ChannelSummary, PendingAttachment, ReactionPendingState, SendMessageOptions, ThreadCursorsState, ThreadErrorsState, ThreadLoadingState, ThreadMessagesState, TypingParticipant } from '../hooks/types'
import type { Channel } from '../types'
import { CollaborationSidebar } from './sidebar'
import {
  ChannelConversationPane,
  type ChannelParticipant,
  ConversationListPane,
  DirectMessageConversationPane,
  EmptyConversationPane,
  type SourceFilter,
  type UnifiedItem,
} from './unified-inbox-sections'

type UnifiedInboxSidebarProps = {
  channels: Channel[]
  channelSummaries: Map<string, ChannelSummary>
  channelUnreadCounts: Record<string, number>
  dmConversations: DirectConversation[]
  selectedChannel: Channel | null
  selectedDM: DirectConversation | null
  onSelectChannel: (channelId: string) => void
  onSelectDM: (conversation: DirectConversation) => void
  onNewDM: () => void
  isLoadingChannels: boolean
  isLoadingDMs: boolean
}

type UnifiedInboxChannelPaneProps = {
  selectedChannel: Channel | null
  channelMessages: CollaborationMessage[]
  visibleMessages: CollaborationMessage[]
  channelParticipants: ChannelParticipant[]
  mentionParticipants: ClientTeamMember[]
  messageSearchQuery: string
  onMessageSearchChange: (value: string) => void
  searchHighlights: string[]
  searchingMessages: boolean
  isCurrentChannelLoading: boolean
  onLoadMore: (channelId: string) => void
  canLoadMore: boolean
  loadingMore: boolean
  messageInput: string
  onMessageInputChange: (value: string) => void
  onSendMessage: (options?: SendMessageOptions) => Promise<void>
  sending: boolean
  pendingAttachments: PendingAttachment[]
  onAddAttachments: (files: FileList | File[]) => void
  onRemoveAttachment: (attachmentId: string) => void
  uploading: boolean
  typingParticipants: TypingParticipant[]
  onComposerFocus: () => void
  onComposerBlur: () => void
  onEditMessage: (channelId: string, messageId: string, content: string) => void
  onDeleteMessage: (channelId: string, messageId: string) => void
  onToggleReaction: (channelId: string, messageId: string, emoji: string) => void
  messageUpdatingId: string | null
  messageDeletingId: string | null
  currentUserRole: string | null
  threadMessagesByRootId: ThreadMessagesState
  threadNextCursorByRootId: ThreadCursorsState
  threadLoadingByRootId: ThreadLoadingState
  threadErrorsByRootId: ThreadErrorsState
  threadUnreadCountsByRootId: Record<string, number>
  onLoadThreadReplies: (threadRootId: string) => void
  onLoadMoreThreadReplies: (threadRootId: string) => void
  onMarkThreadAsRead: (threadRootId: string, beforeMs?: number) => Promise<void>
  reactionPendingByMessage: ReactionPendingState
  sharedFiles: CollaborationAttachment[]
  workspaceId?: string | null
  onPinnedMessageClick?: (messageId: string) => void
  onClearDeepLink?: () => void
  deepLinkMessageId?: string | null
  deepLinkThreadId?: string | null
}

type UnifiedInboxDirectMessagePaneProps = {
  selectedDM: DirectConversation | null
  messages: DirectMessage[]
  visibleMessages: DirectMessage[]
  isLoadingMessages: boolean
  isLoadingMore: boolean
  hasMoreMessages: boolean
  loadMoreMessages: () => void
  messageSearchQuery: string
  onMessageSearchChange: (value: string) => void
  searchHighlights: string[]
  searchingMessages: boolean
  sendMessage: (content: string, attachments?: CollaborationAttachment[]) => Promise<void>
  isSending: boolean
  toggleReaction: (messageLegacyId: string, emoji: string) => Promise<void>
  deleteMessage?: (messageLegacyId: string) => Promise<void>
  editMessage?: (messageLegacyId: string, newContent: string) => Promise<void>
  archiveConversation: (archived: boolean) => Promise<void>
  muteConversation: (muted: boolean) => Promise<void>
  pendingAttachments: PendingAttachment[]
  clearPendingAttachments: () => void
  uploadPendingAttachments: (attachments: PendingAttachment[]) => Promise<CollaborationAttachment[]>
  uploading: boolean
  onAddAttachments: (files: FileList | File[]) => void
  onRemoveAttachment: (attachmentId: string) => void
  onStartNewDM?: () => void
}

type UnifiedInboxManageChannelProps = {
  canManageSelectedChannel?: boolean
  onManageSelectedChannel?: () => void
}

interface UnifiedInboxProps {
  currentUserId: string | null
  sidebar: UnifiedInboxSidebarProps
  channelPane: UnifiedInboxChannelPaneProps
  directMessagePane: UnifiedInboxDirectMessagePaneProps
  manageChannel?: UnifiedInboxManageChannelProps
}

export function UnifiedInbox({
  currentUserId,
  sidebar,
  channelPane,
  directMessagePane,
  manageChannel,
}: UnifiedInboxProps) {
  const {
    channels,
    channelSummaries,
    channelUnreadCounts,
    dmConversations,
    selectedChannel,
    selectedDM,
    onSelectChannel,
    onSelectDM,
    onNewDM,
    isLoadingChannels,
    isLoadingDMs,
  } = sidebar
  const {
    channelMessages,
    visibleMessages,
    channelParticipants,
    mentionParticipants,
    messageSearchQuery,
    onMessageSearchChange,
    searchHighlights,
    searchingMessages,
    isCurrentChannelLoading,
    onLoadMore,
    canLoadMore,
    loadingMore,
    messageInput,
    onMessageInputChange,
    onSendMessage,
    sending,
    pendingAttachments,
    onAddAttachments,
    onRemoveAttachment,
    uploading,
    typingParticipants,
    onComposerFocus,
    onComposerBlur,
    onEditMessage,
    onDeleteMessage,
    onToggleReaction,
    messageUpdatingId,
    messageDeletingId,
    currentUserRole,
    threadMessagesByRootId,
    threadNextCursorByRootId,
    threadLoadingByRootId,
    threadErrorsByRootId,
    threadUnreadCountsByRootId,
    onLoadThreadReplies,
    onLoadMoreThreadReplies,
    onMarkThreadAsRead,
    reactionPendingByMessage,
    sharedFiles,
    workspaceId,
    onPinnedMessageClick,
    onClearDeepLink,
    deepLinkMessageId,
    deepLinkThreadId,
  } = channelPane
  const {
    messages: dmMessages,
    visibleMessages: dmVisibleMessages,
    isLoadingMessages: dmIsLoadingMessages,
    isLoadingMore: dmIsLoadingMore,
    hasMoreMessages: dmHasMoreMessages,
    loadMoreMessages: dmLoadMoreMessages,
    messageSearchQuery: dmMessageSearchQuery,
    onMessageSearchChange: onDmMessageSearchChange,
    searchHighlights: dmSearchHighlights,
    searchingMessages: dmSearchingMessages,
    sendMessage: dmSendMessage,
    isSending: dmIsSending,
    toggleReaction: dmToggleReaction,
    deleteMessage: dmDeleteMessage,
    editMessage: dmEditMessage,
    archiveConversation: dmArchiveConversation,
    muteConversation: dmMuteConversation,
    clearPendingAttachments,
    uploadPendingAttachments,
    onStartNewDM,
  } = directMessagePane
  const { canManageSelectedChannel = false, onManageSelectedChannel } = manageChannel ?? {}
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
    },
    [activeDmLegacyId]
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

        // If attachment-only send fails to upload, do not send an empty message.
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
    [activeDmLegacyId, clearPendingAttachments, dmSendMessage, pendingAttachments, uploadPendingAttachments]
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
        metadata: { channelType: channel.type },
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
        unreadCount: conv.isRead ? 0 : 1,
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
    if (!selectedChannel || typingParticipants.length === 0) {
      return undefined
    }

    const names = typingParticipants
      .map((participant) => participant.name)
      .filter((name) => typeof name === 'string' && name.trim().length > 0)

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
  }, [selectedChannel, typingParticipants])

  const handleSelectItem = useCallback((item: UnifiedItem) => {
    if (item.type === 'channel') {
      onSelectChannel(item.id)
    } else {
      onSelectDM(item.originalData as DirectConversation)
    }
  }, [onSelectChannel, onSelectDM])

  const isSelected = (item: UnifiedItem): boolean => {
    if (item.type === 'channel') return selectedChannel?.id === item.id
    return selectedDM?.legacyId === item.legacyId
  }

  return (
    <div className="flex-1 flex flex-col lg:flex-row min-h-[500px] lg:h-[640px]">
      <ConversationListPane
        channelCount={channelCount}
        dmCount={dmCount}
        filteredItems={filteredItems}
        isLoading={isLoading}
        isSelected={isSelected}
        onNewDM={onNewDM}
        onSearchQueryChange={setSearchQuery}
        onSelectItem={handleSelectItem}
        onSourceFilterChange={setSourceFilter}
        searchQuery={searchQuery}
        sourceFilter={sourceFilter}
        totalUnread={totalUnread}
      />

      {selectedChannel ? (
        <ChannelConversationPane
          canLoadMore={canLoadMore}
          channelMessages={channelMessages}
          channelMessagesForPane={channelMessagesForPane}
          channelParticipants={channelParticipants}
          mentionParticipants={mentionParticipants}
          currentUserId={currentUserId}
          currentUserRole={currentUserRole}
          deepLinkMessageId={deepLinkMessageId ?? null}
          deepLinkThreadId={deepLinkThreadId ?? null}
          isChannelSearchActive={isChannelSearchActive}
          isCurrentChannelLoading={isCurrentChannelLoading}
          loadingMore={loadingMore}
          messageDeletingId={messageDeletingId}
          messageInput={messageInput}
          messageSearchQuery={messageSearchQuery}
          messageUpdatingId={messageUpdatingId}
          onAddAttachments={onAddAttachments}
          onComposerBlur={onComposerBlur}
          onComposerFocus={onComposerFocus}
          onDeleteMessage={onDeleteMessage}
          onEditMessage={onEditMessage}
          onLoadMore={onLoadMore}
          onLoadMoreThreadReplies={onLoadMoreThreadReplies}
          onLoadThreadReplies={onLoadThreadReplies}
          onMarkThreadAsRead={onMarkThreadAsRead}
          onMessageInputChange={onMessageInputChange}
          onMessageSearchChange={onMessageSearchChange}
          onRemoveAttachment={onRemoveAttachment}
          onSendMessage={onSendMessage}
          onToggleReaction={onToggleReaction}
          pendingAttachments={pendingAttachments}
          reactionPendingByMessage={reactionPendingByMessage}
          searchHighlights={searchHighlights}
          searchingMessages={searchingMessages}
          onClearDeepLink={onClearDeepLink}
          selectedChannel={selectedChannel}
          sending={sending}
          threadErrorsByRootId={threadErrorsByRootId}
          threadLoadingByRootId={threadLoadingByRootId}
          threadMessagesByRootId={threadMessagesByRootId}
          threadNextCursorByRootId={threadNextCursorByRootId}
          threadUnreadCountsByRootId={threadUnreadCountsByRootId}
          typingIndicatorText={typingIndicatorText}
          uploading={uploading}
        />
      ) : selectedDM ? (
        <DirectMessageConversationPane
          currentUserId={currentUserId}
          dmDeleteMessage={dmDeleteMessage}
          dmEditMessage={dmEditMessage}
          dmHasMoreMessages={dmHasMoreMessages}
          dmIsLoadingMessages={dmIsLoadingMessages}
          dmIsLoadingMore={dmIsLoadingMore}
          dmIsSending={dmIsSending}
          dmLoadMoreMessages={dmLoadMoreMessages}
          dmMessageInput={dmMessageInput}
          dmMessageSearchQuery={dmMessageSearchQuery}
          dmMessagesForPane={dmMessagesForPane}
          dmMuteConversation={dmMuteConversation}
          dmSearchHighlights={dmSearchHighlights}
          dmSearchingMessages={dmSearchingMessages}
          dmToggleReaction={dmToggleReaction}
          handleSendDirectMessage={handleSendDirectMessage}
          isDmSearchActive={isDmSearchActive}
          onAddAttachments={onAddAttachments}
          onArchiveConversation={dmArchiveConversation}
          onDmMessageSearchChange={onDmMessageSearchChange}
          onRemoveAttachment={onRemoveAttachment}
          pendingAttachments={pendingAttachments}
          selectedDM={selectedDM}
          setActiveDmMessageInput={setActiveDmMessageInput}
          uploading={uploading}
          onStartNewDM={onStartNewDM}
        />
      ) : (
        <EmptyConversationPane channelCount={channelCount} dmCount={dmCount} />
      )}

      {selectedChannel && (
        <CollaborationSidebar
          channel={selectedChannel}
          channelParticipants={channelParticipants}
          channelMessages={channelMessages}
          sharedFiles={sharedFiles}
          workspaceId={workspaceId ?? null}
          onPinnedMessageClick={onPinnedMessageClick}
          canManageMembers={canManageSelectedChannel}
          onManageMembers={onManageSelectedChannel}
        />
      )}
    </div>
  )
}
