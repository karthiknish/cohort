'use client'

import { useMemo } from 'react'

import { cn } from '@/lib/utils'
import type { ClientTeamMember } from '@/types/clients'
import type { CollaborationAttachment, CollaborationMessage } from '@/types/collaboration'

import type { DirectConversation, DirectMessage } from '../hooks/use-direct-messages'
import type { ChannelSummary, PendingAttachment, ReactionPendingState, SendMessageOptions, ThreadCursorsState, ThreadErrorsState, ThreadLoadingState, ThreadMessagesState, TypingParticipant } from '../hooks/types'
import type { Channel } from '../types'
import {
  ChannelConversationPane,
  type ChannelParticipant,
  ConversationListPane,
  DirectMessageConversationPane,
  EmptyConversationPane,
} from './unified-inbox-sections'
import { useUnifiedInboxController } from './use-unified-inbox-controller'

type UnifiedInboxSidebarProps = {
  channels: Channel[]
  channelSummaries: Map<string, ChannelSummary>
  channelUnreadCounts: Record<string, number>
  dmConversations: DirectConversation[]
  selectedChannel: Channel | null
  selectedDM: DirectConversation | null
  onSelectChannel: (channelId: string | null) => void
  onSelectDM: (conversation: DirectConversation | null) => void
  onNewDM: () => void
  onBackToInbox?: () => void
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
  onEditMessage: (channelId: string, messageId: string, content: string) => Promise<void>
  onDeleteMessage: (channelId: string, messageId: string) => Promise<void>
  onToggleReaction: (channelId: string, messageId: string, emoji: string) => Promise<void>
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
  onClearDeepLink?: () => void
  deepLinkMessageId?: string | null
  deepLinkThreadId?: string | null
  messagesError: string | null
  onRetryMessages: () => void
  channelUnreadCount: number
  onMarkChannelRead: () => Promise<void>
  markChannelReadPending: boolean
  workspaceId: string | null
  isAdmin: boolean
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
  messagesError: string | null
  onRetryMessages: () => void
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
  const { onNewDM, onBackToInbox } = sidebar
  const {
    selectedChannel,
    channelMessages,
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
    onClearDeepLink,
    deepLinkMessageId,
    deepLinkThreadId,
    messagesError,
    onRetryMessages,
    channelUnreadCount,
    onMarkChannelRead,
    markChannelReadPending,
    workspaceId,
    isAdmin,
  } = channelPane
  const {
    selectedDM,
    isLoadingMessages: dmIsLoadingMessages,
    isLoadingMore: dmIsLoadingMore,
    hasMoreMessages: dmHasMoreMessages,
    loadMoreMessages: dmLoadMoreMessages,
    messageSearchQuery: dmMessageSearchQuery,
    onMessageSearchChange: onDmMessageSearchChange,
    searchHighlights: dmSearchHighlights,
    searchingMessages: dmSearchingMessages,
    isSending: dmIsSending,
    toggleReaction: dmToggleReaction,
    deleteMessage: dmDeleteMessage,
    editMessage: dmEditMessage,
    archiveConversation: dmArchiveConversation,
    muteConversation: dmMuteConversation,
    onStartNewDM,
    messagesError: dmMessagesError,
    onRetryMessages: onDmRetryMessages,
  } = directMessagePane
  const canManageSelectedChannel = manageChannel?.canManageSelectedChannel ?? false
  const onManageSelectedChannel = manageChannel?.onManageSelectedChannel

  const inbox = useUnifiedInboxController({
    sidebar,
    channelPane,
    directMessagePane,
    onBackToInbox,
  })

  const listState = useMemo(
    () => ({ canLoadMore, loading: isCurrentChannelLoading, loadingMore }),
    [canLoadMore, isCurrentChannelLoading, loadingMore],
  )
  const searchState = useMemo(
    () => ({
      active: inbox.isChannelSearchActive,
      searching: searchingMessages,
    }),
    [inbox.isChannelSearchActive, searchingMessages],
  )
  const composerState = useMemo(
    () => ({ sending, uploading }),
    [sending, uploading],
  )

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden max-lg:min-h-[min(72dvh,640px)] lg:h-[640px] lg:flex-row">
      <ConversationListPane
        className={cn(inbox.hasActiveConversation && 'max-lg:hidden')}
        channelCount={inbox.channelCount}
        dmCount={inbox.dmCount}
        filteredItems={inbox.filteredItems}
        isLoading={inbox.isLoading}
        isSelected={inbox.isSelected}
        onNewDM={onNewDM}
        onSearchQueryChange={inbox.setSearchQuery}
        onSelectItem={inbox.handleSelectItem}
        onSourceFilterChange={inbox.setSourceFilter}
        searchQuery={inbox.searchQuery}
        sourceFilter={inbox.sourceFilter}
        totalUnread={inbox.totalUnread}
      />

      <div
        className={cn(
          'flex min-h-0 min-w-0 flex-1 flex-col border-muted/40 max-lg:border-t lg:border-t-0',
          !inbox.hasActiveConversation && 'max-lg:hidden',
        )}
      >
        {selectedChannel ? (
          <ChannelConversationPane
            listState={listState}
            searchState={searchState}
            composerState={composerState}
            channelMessages={channelMessages}
            channelMessagesForPane={inbox.channelMessagesForPane as CollaborationMessage[]}
            channelParticipants={channelParticipants}
            mentionParticipants={mentionParticipants}
            currentUserId={currentUserId}
            currentUserRole={currentUserRole}
            deepLinkMessageId={deepLinkMessageId ?? null}
            deepLinkThreadId={deepLinkThreadId ?? null}
            messageDeletingId={messageDeletingId}
            messageInput={messageInput}
            messageSearchQuery={messageSearchQuery}
            messageUpdatingId={messageUpdatingId}
            onAddAttachments={onAddAttachments}
            onBackToInbox={inbox.handleBackToInbox}
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
            onClearDeepLink={onClearDeepLink}
            messagesError={messagesError}
            onRetryMessages={onRetryMessages}
            selectedChannel={selectedChannel}
            sharedFiles={sharedFiles}
            canManageMembers={canManageSelectedChannel}
            onManageMembers={onManageSelectedChannel}
            threadErrorsByRootId={threadErrorsByRootId}
            threadLoadingByRootId={threadLoadingByRootId}
            threadMessagesByRootId={threadMessagesByRootId}
            threadNextCursorByRootId={threadNextCursorByRootId}
            threadUnreadCountsByRootId={threadUnreadCountsByRootId}
            typingIndicatorText={inbox.typingIndicatorText}
            channelUnreadCount={channelUnreadCount}
            onMarkChannelRead={onMarkChannelRead}
            markChannelReadPending={markChannelReadPending}
            workspaceId={workspaceId}
            isAdmin={isAdmin}
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
            dmMessageInput={inbox.dmMessageInput}
            dmMessageSearchQuery={dmMessageSearchQuery}
            dmMessagesForPane={inbox.dmMessagesForPane as DirectMessage[]}
            dmMuteConversation={dmMuteConversation}
            dmSearchHighlights={dmSearchHighlights}
            dmSearchingMessages={dmSearchingMessages}
            dmToggleReaction={dmToggleReaction}
            handleSendDirectMessage={inbox.handleSendDirectMessage}
            isDmSearchActive={inbox.isDmSearchActive}
            onAddAttachments={onAddAttachments}
            onArchiveConversation={dmArchiveConversation}
            onBackToInbox={inbox.handleBackToInbox}
            onDmMessageSearchChange={onDmMessageSearchChange}
            onRemoveAttachment={onRemoveAttachment}
            pendingAttachments={pendingAttachments}
            selectedDM={selectedDM}
            setActiveDmMessageInput={inbox.setActiveDmMessageInput}
            uploading={uploading}
            onStartNewDM={onStartNewDM}
            messagesError={dmMessagesError}
            onRetryMessages={onDmRetryMessages}
          />
        ) : (
          <EmptyConversationPane channelCount={inbox.channelCount} dmCount={inbox.dmCount} onNewDM={onNewDM} />
        )}
      </div>
    </div>
  )
}
