'use client'

import { useState, useMemo, useCallback, type RefObject } from 'react'
import { Search, Inbox, Hash, MessageCircle, Plus } from 'lucide-react'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import type { CollaborationAttachment, CollaborationMessage } from '@/types/collaboration'

import type { Channel } from '../types'
import type { ChannelSummary, PendingAttachment, TypingParticipant, ThreadMessagesState, ThreadCursorsState, ThreadLoadingState, ThreadErrorsState, ReactionPendingState, SendMessageOptions } from '../hooks/types'
import type { DirectConversation, DirectMessage } from '../hooks/use-direct-messages'
import { CHANNEL_TYPE_COLORS, formatRelativeTime } from '../utils'
import { collaborationToUnifiedMessage } from './message-list'
import { UnifiedMessagePane } from './unified-message-pane'
import { CollaborationSidebar } from './sidebar'

type SourceFilter = 'all' | 'direct_message' | 'channel'
type ChannelParticipant = { name: string; role: string }

type UnifiedItem = {
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
    otherParticipantRole?: string | null
  }
  originalData: Channel | DirectConversation
}

interface UnifiedInboxProps {
  workspaceId: string | null
  currentUserId: string | null
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
  // Channel message props
  channelMessages: CollaborationMessage[]
  visibleMessages: CollaborationMessage[]
  channelParticipants: ChannelParticipant[]
  messagesError: string | null
  isCurrentChannelLoading: boolean
  onLoadMore: (channelId: string) => void
  canLoadMore: boolean
  loadingMore: boolean
  messageInput: string
  onMessageInputChange: (value: string) => void
  onSendMessage: (options?: SendMessageOptions) => Promise<void>
  sending: boolean
  isSendDisabled: boolean
  pendingAttachments: PendingAttachment[]
  onAddAttachments: (files: FileList | File[]) => void
  onRemoveAttachment: (attachmentId: string) => void
  clearPendingAttachments: () => void
  uploadPendingAttachments: (attachments: PendingAttachment[]) => Promise<CollaborationAttachment[]>
  uploading: boolean
  typingParticipants: TypingParticipant[]
  onComposerFocus: () => void
  onComposerBlur: () => void
  onEditMessage: (channelId: string, messageId: string, content: string) => void
  onDeleteMessage: (channelId: string, messageId: string) => void
  onToggleReaction: (channelId: string, messageId: string, emoji: string) => void
  messageUpdatingId: string | null
  messageDeletingId: string | null
  messagesEndRef: RefObject<HTMLDivElement | null>
  currentUserRole: string | null
  threadMessagesByRootId: ThreadMessagesState
  threadNextCursorByRootId: ThreadCursorsState
  threadLoadingByRootId: ThreadLoadingState
  threadErrorsByRootId: ThreadErrorsState
  threadUnreadCountsByRootId: Record<string, number>
  onLoadThreadReplies: (threadRootId: string) => void
  onLoadMoreThreadReplies: (threadRootId: string) => void
  onMarkThreadAsRead: (threadRootId: string, beforeMs?: number) => Promise<void>
  onClearThreadReplies: () => void
  reactionPendingByMessage: ReactionPendingState
  sharedFiles: CollaborationAttachment[]
  deepLinkMessageId?: string | null
  deepLinkThreadId?: string | null
  // DM props
  dmMessages: DirectMessage[]
  dmIsLoadingMessages: boolean
  dmIsLoadingMore: boolean
  dmHasMoreMessages: boolean
  dmLoadMoreMessages: () => void
  dmSendMessage: (content: string, attachments?: CollaborationAttachment[]) => Promise<void>
  dmIsSending: boolean
  dmToggleReaction: (messageLegacyId: string, emoji: string) => Promise<void>
  dmDeleteMessage?: (messageLegacyId: string) => Promise<void>
  dmEditMessage?: (messageLegacyId: string, newContent: string) => Promise<void>
  dmArchiveConversation: (archived: boolean) => Promise<void>
  dmMuteConversation: (muted: boolean) => Promise<void>
}

const SOURCE_ICONS: Record<string, React.ReactNode> = {
  direct_message: <MessageCircle className="h-4 w-4" />,
  channel: <Hash className="h-4 w-4" />,
}

function getInitials(name: string | null | undefined): string {
  if (!name) return '?'
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
}

export function UnifiedInbox({
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
  channelMessages,
  channelParticipants,
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
  clearPendingAttachments,
  uploadPendingAttachments,
  uploading,
  typingParticipants,
  onComposerFocus,
  onComposerBlur,
  onEditMessage,
  onDeleteMessage,
  onToggleReaction,
  messageUpdatingId,
  messageDeletingId,
  currentUserId,
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
  deepLinkMessageId,
  deepLinkThreadId,
  dmMessages,
  dmIsLoadingMessages,
  dmIsLoadingMore,
  dmHasMoreMessages,
  dmLoadMoreMessages,
  dmSendMessage,
  dmIsSending,
  dmToggleReaction,
  dmDeleteMessage,
  dmEditMessage,
  dmArchiveConversation,
  dmMuteConversation,
}: UnifiedInboxProps) {
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
  const topLevelChannelMessages = useMemo(
    () => channelMessages.filter((message) => !message?.parentMessageId),
    [channelMessages],
  )

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
      {/* Conversation List */}
      <div className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r border-muted/40 flex flex-col h-full">
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Inbox className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Inbox</h3>
              {totalUnread > 0 && (
                <Badge variant="default" className="h-5 px-1.5 text-xs">{totalUnread}</Badge>
              )}
            </div>
            <Button variant="ghost" size="sm" onClick={onNewDM} title="New direct message">
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="pl-9"
            />
          </div>

          <Tabs value={sourceFilter} onValueChange={(v) => setSourceFilter(v as SourceFilter)}>
            <TabsList className="w-full bg-muted/50 h-auto flex-wrap">
              <TabsTrigger value="all" className="flex-1 text-xs">
                All <Badge variant="secondary" className="ml-1 h-4 px-1 text-[10px]">{channelCount + dmCount}</Badge>
              </TabsTrigger>
              <TabsTrigger value="channel" className="flex-1 text-xs">
                <Hash className="h-3 w-3 mr-0.5" />{channelCount}
              </TabsTrigger>
              <TabsTrigger value="direct_message" className="flex-1 text-xs">
                <MessageCircle className="h-3 w-3 mr-0.5" />{dmCount}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <ScrollArea className="flex-1">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {['inbox-skeleton-1', 'inbox-skeleton-2', 'inbox-skeleton-3', 'inbox-skeleton-4', 'inbox-skeleton-5'].map((slotKey) => (
                <div key={slotKey} className="flex items-center gap-3 p-3">
                  <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                    <div className="h-3 w-32 bg-muted animate-pulse rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="p-8 text-center">
              <Inbox className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
              <p className="text-sm text-muted-foreground">
                {searchQuery ? 'No conversations match your search.' : 'No conversations yet.'}
              </p>
              {sourceFilter === 'all' && (
                <Button variant="outline" size="sm" className="mt-3" onClick={onNewDM}>
                  <Plus className="h-4 w-4 mr-1" />Start a conversation
                </Button>
              )}
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {filteredItems.map((item) => {
                const hasUnread = !item.isRead || item.unreadCount > 0
                const selected = isSelected(item)
                
                return (
                  <button
                    key={`${item.type}-${item.legacyId}`}
                    type="button"
                    onClick={() => handleSelectItem(item)}
                    className={cn(
                      'w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all',
                      'hover:bg-muted/50',
                      selected && 'bg-primary/5 border border-primary/20',
                      hasUnread && !selected && 'bg-muted/30'
                    )}
                  >
                    <Avatar className="h-10 w-10 shrink-0">
                      <AvatarFallback className={cn(
                        'text-xs font-medium',
                        hasUnread && 'bg-primary/10 text-primary',
                        item.type === 'channel' && 'bg-muted'
                      )}>
                        {item.type === 'channel' 
                          ? SOURCE_ICONS.channel 
                          : getInitials(item.name)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className={cn(
                          'truncate text-sm',
                          hasUnread ? 'font-semibold' : 'font-medium',
                          selected && 'text-primary'
                        )}>
                          {item.name}
                        </span>
                        {item.lastMessageAtMs && (
                          <span className="text-[10px] text-muted-foreground shrink-0">
                            {formatRelativeTime(new Date(item.lastMessageAtMs).toISOString())}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {item.type === 'channel' ? (
                          <Badge variant="outline" className={cn("text-[10px] px-1 py-0 h-4", CHANNEL_TYPE_COLORS[item.metadata.channelType || 'team'])}>
                            {item.metadata.channelType || 'channel'}
                          </Badge>
                        ) : item.metadata.otherParticipantRole && (
                          <Badge variant="outline" className="text-[10px] px-1 py-0 h-4">
                            {item.metadata.otherParticipantRole}
                          </Badge>
                        )}
                        <p className="truncate text-xs text-muted-foreground">
                          {item.lastMessageSnippet || 'No messages yet'}
                        </p>
                      </div>
                    </div>

                    {hasUnread && (
                      <div className="flex items-center gap-1 shrink-0">
                        {item.unreadCount > 0 && (
                          <Badge variant="default" className="h-5 px-1.5 text-xs">{item.unreadCount}</Badge>
                        )}
                        <div className="h-2 w-2 rounded-full bg-primary" />
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </ScrollArea>
      </div>

      {selectedChannel ? (
        <UnifiedMessagePane
          header={{
            name: selectedChannel.name,
            type: 'channel',
            participantCount: channelParticipants.length,
            messageCount: channelMessages.length,
          }}
          messages={topLevelChannelMessages.map(collaborationToUnifiedMessage)}
          currentUserId={currentUserId}
          currentUserRole={currentUserRole}
          isLoading={isCurrentChannelLoading}
          isLoadingMore={loadingMore}
          hasMore={canLoadMore}
          onLoadMore={selectedChannel ? () => onLoadMore(selectedChannel.id) : () => {}}
          messageInput={messageInput}
          onMessageInputChange={onMessageInputChange}
          onSendMessage={async () => { await onSendMessage() }}
          isSending={sending || uploading}
          pendingAttachments={pendingAttachments}
          uploadingAttachments={uploading}
          onAddAttachments={onAddAttachments}
          onRemoveAttachment={onRemoveAttachment}
          typingIndicator={typingIndicatorText}
          onComposerFocus={onComposerFocus}
          onComposerBlur={onComposerBlur}
          onToggleReaction={async (messageId: string, emoji: string) => onToggleReaction(selectedChannel.id, messageId, emoji)}
          reactionPendingByMessage={reactionPendingByMessage}
          onDeleteMessage={async (messageId: string) => onDeleteMessage(selectedChannel.id, messageId)}
          onEditMessage={async (messageId: string, newContent: string) => onEditMessage(selectedChannel.id, messageId, newContent)}
          participants={channelParticipants}
          channelMessages={channelMessages}
          threadMessagesByRootId={threadMessagesByRootId}
          threadNextCursorByRootId={threadNextCursorByRootId}
          threadLoadingByRootId={threadLoadingByRootId}
          threadErrorsByRootId={threadErrorsByRootId}
          threadUnreadCountsByRootId={threadUnreadCountsByRootId}
          onLoadThreadReplies={onLoadThreadReplies}
          onLoadMoreThreadReplies={onLoadMoreThreadReplies}
          onMarkThreadAsRead={onMarkThreadAsRead}
          focusMessageId={deepLinkMessageId ?? null}
          focusThreadId={deepLinkThreadId ?? null}
          messageUpdatingId={messageUpdatingId}
          messageDeletingId={messageDeletingId}
        />
      ) : selectedDM ? (
        <UnifiedMessagePane
          header={{
            name: selectedDM.otherParticipantName,
            type: 'dm',
            role: selectedDM.otherParticipantRole,
            isArchived: selectedDM.isArchived,
            isMuted: selectedDM.isMuted,
            onArchive: dmArchiveConversation,
            onMute: dmMuteConversation,
          }}
          messages={dmMessages.map((msg) => ({
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
          }))}
          currentUserId={currentUserId}
          isLoading={dmIsLoadingMessages}
          isLoadingMore={dmIsLoadingMore}
          hasMore={dmHasMoreMessages}
          onLoadMore={dmLoadMoreMessages}
          messageInput={dmMessageInput}
          onMessageInputChange={setActiveDmMessageInput}
          onSendMessage={handleSendDirectMessage}
          isSending={dmIsSending || uploading}
          pendingAttachments={pendingAttachments}
          uploadingAttachments={uploading}
          onAddAttachments={onAddAttachments}
          onRemoveAttachment={onRemoveAttachment}
          onToggleReaction={dmToggleReaction}
          onDeleteMessage={dmDeleteMessage}
          onEditMessage={dmEditMessage}
          placeholder={`Message ${selectedDM.otherParticipantName}...`}
        />
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center p-8">
            <Inbox className="h-16 w-16 mx-auto text-muted-foreground/40 mb-4" />
            <h3 className="text-lg font-medium text-foreground">Select a conversation</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
              Choose a conversation from the sidebar to view messages
            </p>
            <div className="flex flex-wrap justify-center gap-2 mt-6">
              <Badge variant="outline" className="gap-1.5">
                <Hash className="h-3 w-3" />{channelCount} Channels
              </Badge>
              <Badge variant="outline" className="gap-1.5">
                <MessageCircle className="h-3 w-3" />{dmCount} Direct Messages
              </Badge>
            </div>
          </div>
        </div>
      )}

      {selectedChannel && (
        <CollaborationSidebar
          channel={selectedChannel}
          channelParticipants={channelParticipants}
          sharedFiles={sharedFiles}
        />
      )}
    </div>
  )
}
