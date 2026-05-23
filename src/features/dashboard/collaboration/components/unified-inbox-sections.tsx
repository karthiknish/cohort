'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { usePrevious } from '@/shared/hooks/use-previous'
import type { ReactNode } from 'react'

import { AlertCircle, Hash, Inbox, MessageCircle, Plus, Search, Sparkles } from 'lucide-react'

import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/alert'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { LiveRegion } from '@/shared/ui/live-region'
import { ScrollArea } from '@/shared/ui/scroll-area'
import { Skeleton } from '@/shared/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/shared/ui/tabs'
import { ClientRelativeTime } from '@/shared/components/client-relative-time'
import { chromaticTransitionClass } from '@/lib/motion'
import { cn } from '@/lib/utils'
import type { ClientTeamMember } from '@/types/clients'
import type { CollaborationAttachment, CollaborationMessage } from '@/types/collaboration'

import type { DirectConversation, DirectMessage } from '../hooks/use-direct-messages'
import { directMessageToCollaborationMessage } from '../lib/direct-message-collaboration'
import type { PendingAttachment, ReactionPendingState, SendMessageOptions, ThreadCursorsState, ThreadErrorsState, ThreadLoadingState, ThreadMessagesState } from '../hooks/types'
import type { Channel } from '../types'
import {
  buildCollaborationChannelShareUrl,
  buildCollaborationDmShareUrl,
  CHANNEL_TYPE_COLORS,
  CHAT_CONVERSATION_ROW_CLASS,
  CHAT_LIST_PREVIEW_CLASS,
  formatConversationSnippet,
} from '../utils'
import { collaborationToUnifiedMessage } from './message-list-utils'
import { EmptyMessagesState, MessagesErrorState, NoSearchResultsState } from './message-pane-parts'
import type { UnifiedMessage } from './message-list-types'
import { UnifiedMessagePane } from './unified-message-pane'

export type SourceFilter = 'all' | 'direct_message' | 'channel'
export type ChannelParticipant = { name: string; role: string }

export type UnifiedItem = {
  id: string
  legacyId: string
  type: 'channel' | 'direct_message'
  name: string
  lastMessageSnippet: string | null
  lastMessageAtMs: number | null
  isRead: boolean
  unreadCount: number
  metadata: {
    channelType?: 'team' | 'client' | 'project'
    channelAvatarUrl?: string | null
    otherParticipantRole?: string | null
  }
  originalData: Channel | DirectConversation
}

const SOURCE_ICONS: Record<string, ReactNode> = {
  direct_message: <MessageCircle className="size-4" />,
  channel: <Hash className="size-4" />,
}

function getInitials(name: string | null | undefined): string {
  if (!name) return '?'
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export type ConversationListPaneProps = {
  channelCount: number
  dmCount: number
  filteredItems: UnifiedItem[]
  isLoading: boolean
  isSelected: (item: UnifiedItem) => boolean
  onNewDM: () => void
  onSearchQueryChange: (value: string) => void
  onSelectItem: (item: UnifiedItem) => void
  onSourceFilterChange: (value: SourceFilter) => void
  searchQuery: string
  sourceFilter: SourceFilter
  totalUnread: number
}

export function ConversationListPane({
  channelCount,
  dmCount,
  filteredItems,
  isLoading,
  isSelected,
  onNewDM,
  onSearchQueryChange,
  onSelectItem,
  onSourceFilterChange,
  searchQuery,
  sourceFilter,
  totalUnread,
  className,
}: ConversationListPaneProps & { className?: string }) {
  const searchInputRef = useRef<HTMLInputElement>(null)
  const previousUnread = usePrevious(totalUnread)

  const handleSearchChange = useCallback((event: { target: { value: string } }) => {
    onSearchQueryChange(event.target.value)
  }, [onSearchQueryChange])

  const handleSourceFilterChange = useCallback((value: string) => {
    onSourceFilterChange(value as SourceFilter)
  }, [onSourceFilterChange])

  const createSelectItemHandler = useCallback(
    (item: UnifiedItem) => () => {
      onSelectItem(item)
    },
    [onSelectItem]
  )

  useEffect(() => {
    const onGlobalKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      const tag = target?.tagName
      const inEditableField =
        tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target?.isContentEditable

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        if (inEditableField) {
          return
        }

        event.preventDefault()
        searchInputRef.current?.focus()
        searchInputRef.current?.select()
        return
      }

      if (inEditableField || filteredItems.length === 0) {
        return
      }

      const selectedIndex = filteredItems.findIndex((item) => isSelected(item))
      if (event.key === 'ArrowDown') {
        event.preventDefault()
        const nextIndex = selectedIndex < filteredItems.length - 1 ? selectedIndex + 1 : 0
        onSelectItem(filteredItems[nextIndex]!)
        return
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault()
        const nextIndex = selectedIndex > 0 ? selectedIndex - 1 : filteredItems.length - 1
        onSelectItem(filteredItems[nextIndex]!)
      }
    }

    window.addEventListener('keydown', onGlobalKeyDown)
    return () => window.removeEventListener('keydown', onGlobalKeyDown)
  }, [filteredItems, isSelected, onSelectItem])

  const unreadAnnouncement = useMemo(() => {
    if (isLoading || previousUnread === undefined) {
      return ''
    }

    if (totalUnread > previousUnread) {
      const newMessages = totalUnread - previousUnread
      return `${newMessages} new ${newMessages === 1 ? 'message has' : 'messages have'} arrived. ${totalUnread} unread ${totalUnread === 1 ? 'conversation' : 'conversations'} in inbox.`
    }

    if (totalUnread === 0 && previousUnread > 0) {
      return 'All inbox conversations are marked as read.'
    }

    return ''
  }, [isLoading, previousUnread, totalUnread])

  const showRecentLabel = sourceFilter === 'all' && !searchQuery.trim()

  return (
    <div
      className={cn(
        'flex h-full min-h-0 w-full flex-col overflow-hidden border-b border-muted/40 bg-muted/15 max-lg:min-h-[min(72dvh,640px)] lg:w-[min(100%,20rem)] lg:border-b-0 lg:border-r',
        className,
      )}
    >
      <LiveRegion message={unreadAnnouncement} />
      <div className="space-y-3 border-b border-muted/30 p-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-primary ring-1 ring-primary/15">
              <Inbox className="size-4" />
            </div>
            <div className="min-w-0">
              <h3 className="truncate text-sm font-semibold tracking-tight">Inbox</h3>
              <p className="text-[11px] text-muted-foreground">Channels & direct messages</p>
            </div>
            {totalUnread > 0 ? (
              <Badge
                variant="default"
                className="h-5 shrink-0 px-1.5 text-xs"
                aria-label={`${totalUnread} unread ${totalUnread === 1 ? 'conversation' : 'conversations'}`}
              >
                {totalUnread}
              </Badge>
            ) : null}
          </div>
          <Button variant="ghost" size="sm" onClick={onNewDM} title="New direct message" aria-label="Start a new direct message">
            <Plus className="size-4" />
          </Button>
        </div>

        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            ref={searchInputRef}
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search conversations…"
            className="pl-9 pr-14"
            aria-label="Search conversations"
          />
          <span className="pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 select-none rounded border border-muted/60 bg-muted/40 px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground sm:inline">
            ⌘/Ctrl K
          </span>
        </div>

        <Tabs value={sourceFilter} onValueChange={handleSourceFilterChange}>
          <TabsList className="flex h-auto w-full flex-wrap gap-0.5 bg-muted/50 p-1">
            <TabsTrigger value="all" className="flex-1 text-xs data-[state=active]:shadow-sm">
              All <Badge variant="secondary" className="ml-1 h-4 px-1 text-[10px]">{channelCount + dmCount}</Badge>
            </TabsTrigger>
            <TabsTrigger value="channel" className="flex-1 text-xs data-[state=active]:shadow-sm">
              <Hash className="mr-0.5 size-3" />
              {channelCount}
            </TabsTrigger>
            <TabsTrigger value="direct_message" className="flex-1 text-xs data-[state=active]:shadow-sm">
              <MessageCircle className="mr-0.5 size-3" />
              {dmCount}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <ScrollArea className="min-h-0 w-full max-w-full flex-1 overflow-x-hidden">
        {isLoading ? (
          <output
            className="block space-y-3 p-4"
            aria-live="polite"
            aria-busy="true"
            aria-label="Loading conversations"
          >
            {['inbox-skeleton-1', 'inbox-skeleton-2', 'inbox-skeleton-3', 'inbox-skeleton-4', 'inbox-skeleton-5'].map((slotKey) => (
              <div key={slotKey} className="flex items-center gap-3 p-3">
                <Skeleton className="size-10 shrink-0 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
            ))}
          </output>
        ) : filteredItems.length === 0 ? (
          <div className="p-8 text-center">
            <Inbox className="mx-auto mb-3 size-12 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">{searchQuery ? 'No conversations match your search.' : 'No conversations yet.'}</p>
            {sourceFilter === 'all' ? (
              <Button variant="outline" size="sm" className="mt-3" onClick={onNewDM}>
                <Plus className="mr-1 size-4" />
                Start a conversation
              </Button>
            ) : null}
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {showRecentLabel ? (
              <div className="px-2 pb-1 pt-1">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/90">Recent</p>
              </div>
            ) : null}
            {filteredItems.map((item) => {
              const hasUnread = !item.isRead || item.unreadCount > 0
              const selected = isSelected(item)

              return (
                <button
                  key={`${item.type}-${item.legacyId}`}
                  type="button"
                  aria-current={selected ? 'true' : undefined}
                  onClick={createSelectItemHandler(item)}
                  className={cn(
                    CHAT_CONVERSATION_ROW_CLASS,
                    'cv-scroll-item-compact',
                    chromaticTransitionClass,
                    'hover:bg-muted/60',
                    selected && 'border border-accent/25 bg-accent/8 shadow-sm ring-1 ring-primary/10',
                    hasUnread && !selected && 'bg-muted/25',
                  )}
                >
                  <Avatar className="size-10 shrink-0">
                    {item.type === 'channel' && item.metadata.channelAvatarUrl ? (
                      <AvatarImage src={item.metadata.channelAvatarUrl} alt={item.name} className="object-cover" />
                    ) : null}
                    <AvatarFallback className={cn('text-xs font-medium', hasUnread && 'bg-accent/10 text-primary', item.type === 'channel' && 'bg-muted')}>
                      {item.type === 'channel' ? SOURCE_ICONS.channel : getInitials(item.name)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className={cn('truncate text-sm', hasUnread ? 'font-semibold' : 'font-medium', selected && 'text-primary')}>{item.name}</span>
                      {item.lastMessageAtMs ? (
                        <ClientRelativeTime
                          value={item.lastMessageAtMs}
                          className="shrink-0 text-[10px] text-muted-foreground"
                        />
                      ) : null}
                    </div>

                    <div className="mt-0.5 flex min-w-0 items-center gap-1.5 overflow-hidden">
                      {item.type === 'channel' ? (
                        <Badge variant="outline" className={cn('h-4 shrink-0 px-1 py-0 text-[10px]', CHANNEL_TYPE_COLORS[item.metadata.channelType || 'team'])}>
                          {item.metadata.channelType || 'channel'}
                        </Badge>
                      ) : item.metadata.otherParticipantRole ? (
                        <Badge variant="outline" className="h-4 shrink-0 px-1 py-0 text-[10px]">
                          {item.metadata.otherParticipantRole}
                        </Badge>
                      ) : null}
                      <p className={CHAT_LIST_PREVIEW_CLASS} title={item.lastMessageSnippet ?? undefined}>
                        {item.lastMessageSnippet
                          ? formatConversationSnippet(item.lastMessageSnippet)
                          : 'No messages yet'}
                      </p>
                    </div>
                  </div>

                  {hasUnread ? (
                    <div className="flex shrink-0 items-center gap-1">
                      {item.unreadCount > 0 ? <Badge variant="default" className="h-5 px-1.5 text-xs">{item.unreadCount}</Badge> : null}
                      <div className="size-2 rounded-full bg-primary" />
                    </div>
                  ) : null}
                </button>
              )
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}

export type ChannelPaneListState = {
  canLoadMore: boolean
  loading: boolean
  loadingMore: boolean
}

export type ChannelPaneSearchState = {
  active: boolean
  searching: boolean
}

export type ChannelPaneComposerState = {
  sending: boolean
  uploading: boolean
}

export type ChannelConversationPaneProps = {
  listState: ChannelPaneListState
  searchState: ChannelPaneSearchState
  composerState: ChannelPaneComposerState
  channelMessages: CollaborationMessage[]
  channelMessagesForPane: CollaborationMessage[]
  channelParticipants: ChannelParticipant[]
  mentionParticipants: ClientTeamMember[]
  currentUserId: string | null
  currentUserRole: string | null
  deepLinkMessageId: string | null
  deepLinkThreadId: string | null
  messageDeletingId: string | null
  messageInput: string
  messageSearchQuery: string
  messageUpdatingId: string | null
  onAddAttachments: (files: FileList | File[]) => void
  onBackToInbox?: () => void
  onClearDeepLink?: () => void
  onComposerBlur: () => void
  onComposerFocus: () => void
  onDeleteMessage: (channelId: string, messageId: string) => void
  onEditMessage: (channelId: string, messageId: string, content: string) => void
  onLoadMore: (channelId: string) => void
  onLoadMoreThreadReplies: (threadRootId: string) => void
  onLoadThreadReplies: (threadRootId: string) => void
  onMarkThreadAsRead: (threadRootId: string, beforeMs?: number) => Promise<void>
  onMessageInputChange: (value: string) => void
  onMessageSearchChange: (value: string) => void
  onRemoveAttachment: (attachmentId: string) => void
  sharedFiles: CollaborationAttachment[]
  canManageMembers?: boolean
  onManageMembers?: () => void
  workspaceId: string | null
  isAdmin: boolean
  onSendMessage: (options?: SendMessageOptions) => Promise<void>
  onShareToPlatform?: (message: UnifiedMessage, platform: 'email') => Promise<void>
  onCreateTask?: (message: UnifiedMessage) => void
  onForwardMessage?: (message: UnifiedMessage) => void
  onCreatePoll?: (poll: Omit<import('./message-polls').MessagePoll, 'id' | 'createdAt'>) => Promise<void>
  onExportChannel?: () => void
  onOpenChannelMessage?: (messageId: string, options?: { threadId?: string | null }) => void
  onToggleReaction: (channelId: string, messageId: string, emoji: string) => void
  pendingAttachments: PendingAttachment[]
  reactionPendingByMessage: ReactionPendingState
  searchHighlights: string[]
  selectedChannel: Channel
  threadErrorsByRootId: ThreadErrorsState
  threadLoadingByRootId: ThreadLoadingState
  threadMessagesByRootId: ThreadMessagesState
  threadNextCursorByRootId: ThreadCursorsState
  threadUnreadCountsByRootId: Record<string, number>
  typingIndicatorText?: string
  messagesError: string | null
  onRetryMessages: () => void
  channelUnreadCount: number
  onMarkChannelRead: () => Promise<void>
  markChannelReadPending: boolean
}

function hasRequestedDeepLinkTarget(
  channelMessages: CollaborationMessage[],
  threadMessagesByRootId: ThreadMessagesState,
  deepLinkMessageId: string | null,
  deepLinkThreadId: string | null,
): boolean {
  const normalizedMessageId = typeof deepLinkMessageId === 'string' ? deepLinkMessageId.trim() : ''
  const normalizedThreadId = typeof deepLinkThreadId === 'string' ? deepLinkThreadId.trim() : ''

  if (!normalizedMessageId && !normalizedThreadId) {
    return false
  }

  const allMessages = [...channelMessages, ...Object.values(threadMessagesByRootId).flat()]

  return allMessages.some((message) => {
    if (normalizedMessageId && message.id === normalizedMessageId) {
      return true
    }

    if (!normalizedThreadId) {
      return false
    }

    const threadRootId = typeof message.threadRootId === 'string' && message.threadRootId.trim().length > 0
      ? message.threadRootId.trim()
      : message.id

    return threadRootId === normalizedThreadId || message.parentMessageId === normalizedThreadId || message.id === normalizedThreadId
  })
}

export function ChannelConversationPane({
  listState,
  searchState,
  composerState,
  channelMessages,
  channelMessagesForPane,
  channelParticipants,
  mentionParticipants,
  currentUserId,
  currentUserRole,
  deepLinkMessageId,
  deepLinkThreadId,
  messageDeletingId,
  messageInput,
  messageSearchQuery,
  messageUpdatingId,
  onAddAttachments,
  onBackToInbox,
  onClearDeepLink,
  onComposerBlur,
  onComposerFocus,
  onDeleteMessage,
  onEditMessage,
  onLoadMore,
  onLoadMoreThreadReplies,
  onLoadThreadReplies,
  onMarkThreadAsRead,
  onMessageInputChange,
  onMessageSearchChange,
  onRemoveAttachment,
  onSendMessage,
  onShareToPlatform,
  onCreateTask,
  onForwardMessage,
  onCreatePoll,
  onExportChannel,
  onOpenChannelMessage,
  onToggleReaction,
  pendingAttachments,
  reactionPendingByMessage,
  searchHighlights,
  selectedChannel,
  sharedFiles,
  canManageMembers,
  onManageMembers,
  workspaceId,
  isAdmin,
  threadErrorsByRootId,
  threadLoadingByRootId,
  threadMessagesByRootId,
  threadNextCursorByRootId,
  threadUnreadCountsByRootId,
  typingIndicatorText,
  messagesError,
  onRetryMessages,
  channelUnreadCount,
  onMarkChannelRead,
  markChannelReadPending,
}: ChannelConversationPaneProps) {
  const { canLoadMore, loading: isCurrentChannelLoading, loadingMore } = listState
  const { active: isChannelSearchActive, searching: searchingMessages } = searchState
  const { sending, uploading } = composerState
  const [replyingToMessage, setReplyingToMessage] = useState<CollaborationMessage | null>(null)

  useEffect(() => {
    setReplyingToMessage(null)
  }, [selectedChannel.id])

  const resolveCollaborationMessage = useCallback(
    (message: UnifiedMessage): CollaborationMessage | null => {
      const fromChannel = channelMessages.find((entry) => entry.id === message.id)
      if (fromChannel) {
        return fromChannel
      }

      for (const replies of Object.values(threadMessagesByRootId)) {
        const fromThread = replies.find((entry) => entry.id === message.id)
        if (fromThread) {
          return fromThread
        }
      }

      return null
    },
    [channelMessages, threadMessagesByRootId],
  )

  const handleReply = useCallback(
    (message: UnifiedMessage) => {
      setReplyingToMessage(resolveCollaborationMessage(message))
    },
    [resolveCollaborationMessage],
  )

  const handleCancelReply = useCallback(() => {
    setReplyingToMessage(null)
  }, [])

  const channelEmptyState = useMemo(() => {
    if (isCurrentChannelLoading || searchingMessages) {
      return undefined
    }

    if (channelMessages.length > 0) {
      return undefined
    }

    if (isChannelSearchActive) {
      return <NoSearchResultsState />
    }

    return <EmptyMessagesState />
  }, [channelMessages.length, isChannelSearchActive, isCurrentChannelLoading, searchingMessages])

  const showMissingDeepLinkNotice =
    (Boolean(deepLinkMessageId?.trim()) || Boolean(deepLinkThreadId?.trim())) &&
    !isCurrentChannelLoading &&
    !searchingMessages &&
    !hasRequestedDeepLinkTarget(channelMessages, threadMessagesByRootId, deepLinkMessageId, deepLinkThreadId)

  const channelHeader = useMemo(
    () => ({
      conversationKey: selectedChannel.id,
      name: selectedChannel.name,
      type: 'channel' as const,
      channelKind: selectedChannel.type,
      participantCount: channelParticipants.length,
      messageCount: channelMessages.length,
      onExport: onExportChannel,
      buildShareableUrl: () => buildCollaborationChannelShareUrl(selectedChannel),
      channelUnreadCount,
      onMarkChannelRead,
      markChannelReadPending,
      onBack: onBackToInbox,
      channelInfo:
        workspaceId != null
          ? {
              channel: selectedChannel,
              channelMessages,
              channelParticipants,
              currentUserId,
              onPinnedMessageClick: onOpenChannelMessage
                ? (messageId: string) => {
                    onOpenChannelMessage(messageId)
                  }
                : undefined,
              sharedFiles,
              workspaceId,
              isAdmin,
              canManageMembers,
              onManageMembers,
            }
          : undefined,
    }),
    [
      canManageMembers,
      channelMessages,
      channelParticipants,
      channelUnreadCount,
      currentUserId,
      isAdmin,
      markChannelReadPending,
      onBackToInbox,
      onExportChannel,
      onManageMembers,
      onMarkChannelRead,
      onOpenChannelMessage,
      selectedChannel,
      sharedFiles,
      workspaceId,
    ],
  )

  const missingDeepLinkBanner = useMemo(() => {
    if (!showMissingDeepLinkNotice) return null

    return (
      <Alert className="mx-4 mt-4 border-warning/20 bg-warning/10 text-warning-foreground">
        <AlertCircle className="size-4" />
        <AlertTitle>Linked message unavailable</AlertTitle>
        <AlertDescription className="space-y-2">
          <p>We couldn&apos;t open the requested message in #{selectedChannel.name}. It may no longer be available in this channel.</p>
          {onClearDeepLink ? (
            <Button type="button" variant="outline" size="sm" onClick={onClearDeepLink}>
              Clear link
            </Button>
          ) : null}
        </AlertDescription>
      </Alert>
    )
  }, [onClearDeepLink, selectedChannel.name, showMissingDeepLinkNotice])

  const combinedStatusBanner = useMemo(() => {
    const errorBanner = messagesError ? (
      <div className="mx-4 mt-4">
        <MessagesErrorState
          error={messagesError}
          onRetry={onRetryMessages}
          isRetrying={searchingMessages && isChannelSearchActive}
        />
      </div>
    ) : null

    if (!missingDeepLinkBanner && !errorBanner) {
      return null
    }

    return (
      <>
        {missingDeepLinkBanner}
        {errorBanner}
      </>
    )
  }, [isChannelSearchActive, messagesError, missingDeepLinkBanner, onRetryMessages, searchingMessages])

  const handleLoadMore = useCallback(() => {
    onLoadMore(selectedChannel.id)
  }, [onLoadMore, selectedChannel.id])

  const handleSendMessage = useCallback(async () => {
    await onSendMessage({ parentMessageId: replyingToMessage?.id })
    setReplyingToMessage(null)
  }, [onSendMessage, replyingToMessage?.id])

  const handleToggleReaction = useCallback(async (messageId: string, emoji: string) => {
    await onToggleReaction(selectedChannel.id, messageId, emoji)
  }, [onToggleReaction, selectedChannel.id])

  const handleDeleteMessage = useCallback(async (messageId: string) => {
    await onDeleteMessage(selectedChannel.id, messageId)
  }, [onDeleteMessage, selectedChannel.id])

  const handleEditMessage = useCallback(async (messageId: string, newContent: string) => {
    await onEditMessage(selectedChannel.id, messageId, newContent)
  }, [onEditMessage, selectedChannel.id])

  const channelListState = useMemo(
    () => ({
      loading: isCurrentChannelLoading || (isChannelSearchActive && searchingMessages),
      loadingMore: !isChannelSearchActive && loadingMore,
      hasMore: !isChannelSearchActive && canLoadMore,
    }),
    [canLoadMore, isChannelSearchActive, isCurrentChannelLoading, loadingMore, searchingMessages],
  )

  const channelComposerState = useMemo(
    () => ({
      sending: sending || uploading,
      pendingAttachments: pendingAttachments.length > 0,
      uploadingAttachments: uploading,
    }),
    [pendingAttachments.length, sending, uploading],
  )

  return (
    <UnifiedMessagePane
      header={channelHeader}
      messages={channelMessagesForPane.map(collaborationToUnifiedMessage)}
      currentUserId={currentUserId}
      currentUserRole={currentUserRole}
      listState={channelListState}
      onLoadMore={handleLoadMore}
      messageSearchQuery={messageSearchQuery}
      onMessageSearchChange={onMessageSearchChange}
      messageSearchHighlights={searchHighlights}
      messageInput={messageInput}
      onMessageInputChange={onMessageInputChange}
      onSendMessage={handleSendMessage}
      onReply={handleReply}
      replyingToMessage={replyingToMessage}
      onCancelReply={handleCancelReply}
      emptyState={channelEmptyState}
      composerState={channelComposerState}
      pendingAttachments={pendingAttachments}
      onAddAttachments={onAddAttachments}
      onRemoveAttachment={onRemoveAttachment}
      typingIndicator={typingIndicatorText}
      onComposerFocus={onComposerFocus}
      onComposerBlur={onComposerBlur}
      onToggleReaction={handleToggleReaction}
      onShareToPlatform={onShareToPlatform}
      onCreateTask={onCreateTask}
      onForwardMessage={onForwardMessage}
      onCreatePoll={onCreatePoll ? async (poll) => onCreatePoll(poll) : undefined}
      workspaceId={workspaceId}
      reactionPendingByMessage={reactionPendingByMessage}
      onDeleteMessage={handleDeleteMessage}
      onEditMessage={handleEditMessage}
      participants={mentionParticipants}
      statusBanner={combinedStatusBanner}
      channelMessages={channelMessages}
      threadMessagesByRootId={threadMessagesByRootId}
      threadNextCursorByRootId={threadNextCursorByRootId}
      threadLoadingByRootId={threadLoadingByRootId}
      threadErrorsByRootId={threadErrorsByRootId}
      threadUnreadCountsByRootId={threadUnreadCountsByRootId}
      onLoadThreadReplies={onLoadThreadReplies}
      onLoadMoreThreadReplies={onLoadMoreThreadReplies}
      onMarkThreadAsRead={onMarkThreadAsRead}
      focusMessageId={deepLinkMessageId}
      focusThreadId={deepLinkThreadId}
      messageUpdatingId={messageUpdatingId}
      messageDeletingId={messageDeletingId}
    />
  )
}

export type DirectMessageConversationPaneProps = {
  mentionParticipants: ClientTeamMember[]
  currentUserId: string | null
  dmDeleteMessage?: (messageLegacyId: string) => Promise<void>
  dmEditMessage?: (messageLegacyId: string, newContent: string) => Promise<void>
  dmHasMoreMessages: boolean
  dmIsLoadingMessages: boolean
  dmIsLoadingMore: boolean
  dmIsSending: boolean
  dmLoadMoreMessages: () => void
  dmMessageInput: string
  dmMessageSearchQuery: string
  dmMessagesForPane: DirectMessage[]
  dmMuteConversation: (muted: boolean) => Promise<void>
  dmSearchHighlights: string[]
  dmSearchingMessages: boolean
  dmToggleReaction: (messageLegacyId: string, emoji: string) => Promise<void>
  handleSendDirectMessage: (content: string) => Promise<void>
  isDmSearchActive: boolean
  onAddAttachments: (files: FileList | File[]) => void
  onArchiveConversation: (archived: boolean) => Promise<void>
  onBackToInbox?: () => void
  onDmMessageSearchChange: (value: string) => void
  onRemoveAttachment: (attachmentId: string) => void
  pendingAttachments: PendingAttachment[]
  selectedDM: DirectConversation
  setActiveDmMessageInput: (value: string) => void
  uploading: boolean
  onStartNewDM?: () => void
  messagesError: string | null
  onRetryMessages: () => void
  onShareToPlatform?: (message: UnifiedMessage, platform: 'email') => Promise<void>
  onComposerFocus?: () => void
  onComposerBlur?: () => void
  typingIndicatorText?: string
  onCreateTask?: (message: UnifiedMessage) => void
  currentUserRole?: string | null
  workspaceId?: string | null
  deepLinkMessageId?: string | null
  onClearDeepLink?: () => void
}

export function DirectMessageConversationPane({
  mentionParticipants,
  currentUserId,
  dmDeleteMessage,
  dmEditMessage,
  dmHasMoreMessages,
  dmIsLoadingMessages,
  dmIsLoadingMore,
  dmIsSending,
  dmLoadMoreMessages,
  dmMessageInput,
  dmMessageSearchQuery,
  dmMessagesForPane,
  dmMuteConversation,
  dmSearchHighlights,
  dmSearchingMessages,
  dmToggleReaction,
  handleSendDirectMessage,
  isDmSearchActive,
  onAddAttachments,
  onArchiveConversation,
  onBackToInbox,
  onDmMessageSearchChange,
  onRemoveAttachment,
  pendingAttachments,
  selectedDM,
  setActiveDmMessageInput,
  uploading,
  onStartNewDM,
  messagesError,
  onRetryMessages,
  onShareToPlatform,
  onComposerFocus,
  onComposerBlur,
  typingIndicatorText,
  onCreateTask,
  currentUserRole,
  workspaceId,
  deepLinkMessageId,
  onClearDeepLink,
}: DirectMessageConversationPaneProps) {
  const handleDmSend = useCallback(async () => {
    const content = dmMessageInput.trim()
    if (!content && pendingAttachments.length === 0) {
      return
    }

    await handleSendDirectMessage(content)
  }, [dmMessageInput, handleSendDirectMessage, pendingAttachments.length])

  const dmEmptyState = useMemo(() => {
    if (dmIsLoadingMessages || dmSearchingMessages) {
      return undefined
    }

    if (dmMessagesForPane.length > 0) {
      return undefined
    }

    if (isDmSearchActive) {
      return <NoSearchResultsState />
    }

    return <EmptyMessagesState />
  }, [dmIsLoadingMessages, dmMessagesForPane.length, dmSearchingMessages, isDmSearchActive])

  const dmHeader = useMemo(
    () => ({
      conversationKey: selectedDM.legacyId,
      name: selectedDM.otherParticipantName,
      type: 'dm' as const,
      role: selectedDM.otherParticipantRole,
      isArchived: selectedDM.isArchived,
      isMuted: selectedDM.isMuted,
      onArchive: onArchiveConversation,
      onMute: dmMuteConversation,
      primaryActionLabel: 'New chat',
      onPrimaryAction: onStartNewDM,
      buildShareableUrl: () => buildCollaborationDmShareUrl(selectedDM.legacyId),
      onBack: onBackToInbox,
    }),
    [dmMuteConversation, onArchiveConversation, onBackToInbox, onStartNewDM, selectedDM],
  )

  const dmStatusBanner = useMemo(() => {
    if (!messagesError) {
      return null
    }

    return (
      <div className="mx-4 mt-4">
        <MessagesErrorState
          error={messagesError}
          onRetry={onRetryMessages}
          isRetrying={dmSearchingMessages && isDmSearchActive}
        />
      </div>
    )
  }, [dmSearchingMessages, isDmSearchActive, messagesError, onRetryMessages])

  const dmListState = useMemo(
    () => ({
      loading: dmIsLoadingMessages || (isDmSearchActive && dmSearchingMessages),
      loadingMore: !isDmSearchActive && dmIsLoadingMore,
      hasMore: !isDmSearchActive && dmHasMoreMessages,
    }),
    [dmHasMoreMessages, dmIsLoadingMessages, dmIsLoadingMore, dmSearchingMessages, isDmSearchActive],
  )

  const dmComposerState = useMemo(
    () => ({
      sending: dmIsSending || uploading,
      pendingAttachments: pendingAttachments.length > 0,
      uploadingAttachments: uploading,
    }),
    [dmIsSending, pendingAttachments.length, uploading],
  )

  const dmChannelMessages = useMemo(
    () => dmMessagesForPane.map(directMessageToCollaborationMessage),
    [dmMessagesForPane],
  )

  return (
    <UnifiedMessagePane
      header={dmHeader}
      messages={dmMessagesForPane.map(directMessageToUnifiedMessage)}
      channelMessages={dmChannelMessages}
      currentUserId={currentUserId}
      currentUserRole={currentUserRole}
      workspaceId={workspaceId}
      dmParticipantName={selectedDM.otherParticipantName}
      focusMessageId={deepLinkMessageId}
      onCreateTask={onCreateTask}
      listState={dmListState}
      onLoadMore={dmLoadMoreMessages}
      messageSearchQuery={dmMessageSearchQuery}
      onMessageSearchChange={onDmMessageSearchChange}
      messageSearchHighlights={dmSearchHighlights}
      messageInput={dmMessageInput}
      onMessageInputChange={setActiveDmMessageInput}
      onSendMessage={handleDmSend}
      emptyState={dmEmptyState}
      participants={mentionParticipants}
      composerState={dmComposerState}
      pendingAttachments={pendingAttachments}
      onAddAttachments={onAddAttachments}
      onRemoveAttachment={onRemoveAttachment}
      onToggleReaction={dmToggleReaction}
      onDeleteMessage={dmDeleteMessage}
      onEditMessage={dmEditMessage}
      onShareToPlatform={onShareToPlatform}
      onComposerFocus={onComposerFocus}
      onComposerBlur={onComposerBlur}
      typingIndicator={typingIndicatorText}
      placeholder={`Message ${selectedDM.otherParticipantName}...`}
      statusBanner={dmStatusBanner}
    />
  )
}

export function EmptyConversationPane({
  channelCount,
  dmCount,
  onNewDM,
}: {
  channelCount: number
  dmCount: number
  onNewDM?: () => void
}) {
  return (
    <div className="relative flex min-h-[min(60dvh,480px)] flex-1 flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-muted/20 via-background to-background px-4 py-10 sm:px-6 sm:py-12">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
      <div className="relative max-w-md text-center">
        <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-2xl bg-accent/10 text-primary ring-1 ring-primary/15">
          <Sparkles className="size-8" />
        </div>
        <h3 className="text-xl font-semibold tracking-tight text-foreground">Pick a conversation</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Choose a channel or direct message in the inbox to read the thread, react, and reply in context.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Badge variant="outline" className="gap-1.5 border-muted/60 bg-background/80">
            <Hash className="size-3" />
            {channelCount} channel{channelCount === 1 ? '' : 's'}
          </Badge>
          <Badge variant="outline" className="gap-1.5 border-muted/60 bg-background/80">
            <MessageCircle className="size-3" />
            {dmCount} DM{dmCount === 1 ? '' : 's'}
          </Badge>
        </div>
        {onNewDM ? (
          <Button type="button" className="mt-8 gap-2 shadow-sm" onClick={onNewDM}>
            <Plus className="size-4" />
            Start a direct message
          </Button>
        ) : null}
        <p className="mt-4 text-[11px] text-muted-foreground/80">
          Tip: <kbd className="rounded border border-muted/60 bg-muted/50 px-1 py-0.5 font-mono text-[10px]">⌘/Ctrl</kbd>{' '}
          + <kbd className="rounded border border-muted/60 bg-muted/50 px-1 py-0.5 font-mono text-[10px]">K</kbd> focuses inbox search.
        </p>
      </div>
    </div>
  )
}

function directMessageToUnifiedMessage(message: DirectMessage) {
  return {
    id: message.legacyId,
    senderId: message.senderId,
    senderName: message.senderName,
    senderRole: message.senderRole,
    content: message.content,
    createdAtMs: message.createdAtMs,
    edited: message.edited,
    deleted: message.deleted,
    deletedBy: message.deletedBy ?? undefined,
    deletedAt: typeof message.deletedAtMs === 'number' ? new Date(message.deletedAtMs).toISOString() : undefined,
    reactions: message.reactions ?? undefined,
    attachments:
      message.attachments?.map((attachment) => ({
        url: attachment.url,
        name: attachment.name,
        mimeType: attachment.type ?? undefined,
        size: attachment.size ? parseInt(attachment.size, 10) : undefined,
      })) ?? undefined,
    sharedTo: message.sharedTo ?? undefined,
    readBy: message.readBy ?? undefined,
    deliveredTo: message.deliveredTo ?? undefined,
  }
}
