import { renderToStaticMarkup } from 'react-dom/server'

import type { ReactNode } from 'react'

import { describe, expect, it, vi } from 'vitest'

import type { DirectConversation, DirectMessage } from '../hooks/use-direct-messages'
import type { Channel } from '../types'
import type { CollaborationMessage } from '@/types/collaboration'

vi.mock('./unified-message-pane', () => ({
  UnifiedMessagePane: ({
    header,
    placeholder,
    messages,
    participants,
    statusBanner,
  }: {
    header: { name: string; primaryActionLabel?: string }
    placeholder?: string
    messages: unknown[]
    participants?: Array<{ name: string }>
    statusBanner?: ReactNode
  }) => (
    <div>
      <span>{header.name}</span>
      <span>{header.primaryActionLabel ?? 'no-primary-action'}</span>
      <span>{placeholder ?? 'no-placeholder'}</span>
      <span>{participants?.map((participant) => participant.name).join(',') ?? 'no-participants'}</span>
      <span>{messages.length} messages</span>
      <div>{statusBanner}</div>
    </div>
  ),
}))

import {
  ChannelConversationPane,
  ConversationListPane,
  DirectMessageConversationPane,
  EmptyConversationPane,
  type UnifiedItem,
} from './unified-inbox-sections'

const channel: Channel = {
  id: 'team-agency',
  name: 'team-agency',
  type: 'team',
  clientId: null,
  projectId: null,
  teamMembers: [],
}

const directConversation: DirectConversation = {
  id: 'dm-1',
  legacyId: 'dm-1',
  otherParticipantId: 'user-2',
  otherParticipantName: 'Alex Johnson',
  otherParticipantRole: 'member',
  lastMessageSnippet: 'Hey there',
  lastMessageAtMs: Date.now(),
  lastMessageSenderId: 'user-2',
  isRead: true,
  isArchived: false,
  isMuted: false,
  createdAtMs: Date.now(),
  updatedAtMs: Date.now(),
}

const channelMessage: CollaborationMessage = {
  id: 'msg-1',
  channelType: 'team',
  clientId: 'client-1',
  projectId: null,
  content: 'Hello team',
  senderId: 'user-1',
  senderName: 'Taylor',
  senderRole: 'manager',
  createdAt: '2026-03-11T12:00:00.000Z',
  updatedAt: '2026-03-11T12:00:00.000Z',
  isEdited: false,
  deletedAt: null,
  deletedBy: null,
  isDeleted: false,
  attachments: [],
  mentions: [],
  reactions: [],
  parentMessageId: null,
  threadRootId: null,
  threadReplyCount: 0,
  threadLastReplyAt: null,
  readBy: [],
  deliveredTo: [],
  sharedTo: [],
}

const directMessage: DirectMessage = {
  id: 'dm-msg-1-row',
  legacyId: 'dm-msg-1',
  senderId: 'user-2',
  senderName: 'Alex Johnson',
  senderRole: 'member',
  content: 'Need anything else?',
  createdAtMs: Date.now(),
  edited: false,
  deleted: false,
  deletedBy: null,
  deletedAtMs: null,
  reactions: [],
  attachments: [],
  readBy: [],
  deliveredTo: [],
  sharedTo: [],
  updatedAtMs: Date.now(),
}

const EMPTY_BOOLEAN_MAP = {} as Record<string, boolean>
const EMPTY_STRING_MAP = {} as Record<string, string | null>
const EMPTY_NUMBER_MAP = {} as Record<string, number>
const EMPTY_MESSAGE_MAP = {} as Record<string, CollaborationMessage[]>

const makeIsSelected = (selectedId: string) => (item: UnifiedItem) => item.id === selectedId

describe('unified inbox sections', () => {
  it('renders the list pane and empty selection state', () => {
    const items: UnifiedItem[] = [
      {
        id: channel.id,
        legacyId: channel.id,
        type: 'channel',
        name: channel.name,
        lastMessageSnippet: 'Hello team',
        lastMessageAtMs: Date.now(),
        isRead: false,
        unreadCount: 2,
        metadata: { channelType: 'team' },
        originalData: channel,
      },
      {
        id: directConversation.legacyId,
        legacyId: directConversation.legacyId,
        type: 'direct_message',
        name: directConversation.otherParticipantName,
        lastMessageSnippet: 'Hey there',
        lastMessageAtMs: directConversation.lastMessageAtMs ?? null,
        isRead: true,
        unreadCount: 0,
        metadata: { otherParticipantRole: 'member' },
        originalData: directConversation,
      },
    ]
    const isSelected = makeIsSelected(channel.id)

    const markup = renderToStaticMarkup(
      <>
        <ConversationListPane
          channelCount={1}
          dmCount={1}
          filteredItems={items}
          isLoading={false}
          isSelected={isSelected}
          onNewDM={vi.fn()}
          onSearchQueryChange={vi.fn()}
          onSelectItem={vi.fn()}
          onSourceFilterChange={vi.fn()}
          searchQuery=""
          sourceFilter="all"
          totalUnread={2}
        />
        <EmptyConversationPane channelCount={1} dmCount={1} onNewDM={vi.fn()} />
      </>,
    )

    expect(markup).toContain('Inbox')
    expect(markup).toContain('team-agency')
    expect(markup).toContain('Alex Johnson')
    expect(markup).toContain('Pick a conversation')
  })

  it('renders channel and direct message panes through the shared message pane', () => {
    const channelParticipants = [{ name: 'Taylor', role: 'manager' }]
    const mentionParticipants = [
      { id: 'user-1', name: 'Taylor', role: 'manager' },
      { id: 'user-2', name: 'Jordan', role: 'designer' },
    ]

    const markup = renderToStaticMarkup(
      <>
        <ChannelConversationPane
          canLoadMore={false}
          channelMessages={[channelMessage]}
          channelMessagesForPane={[channelMessage]}
          channelParticipants={channelParticipants}
          mentionParticipants={mentionParticipants}
          currentUserId="user-1"
          currentUserRole="admin"
          deepLinkMessageId={null}
          deepLinkThreadId={null}
          isChannelSearchActive={false}
          isCurrentChannelLoading={false}
          loadingMore={false}
          messageDeletingId={null}
          messageInput=""
          messageSearchQuery=""
          messageUpdatingId={null}
          onAddAttachments={vi.fn()}
          onClearDeepLink={vi.fn()}
          onComposerBlur={vi.fn()}
          onComposerFocus={vi.fn()}
          onDeleteMessage={vi.fn()}
          onEditMessage={vi.fn()}
          onLoadMore={vi.fn()}
          onLoadMoreThreadReplies={vi.fn()}
          onLoadThreadReplies={vi.fn()}
          onMarkThreadAsRead={vi.fn()}
          onMessageInputChange={vi.fn()}
          onMessageSearchChange={vi.fn()}
          onRemoveAttachment={vi.fn()}
          onSendMessage={vi.fn()}
          onToggleReaction={vi.fn()}
          pendingAttachments={[]}
          reactionPendingByMessage={EMPTY_STRING_MAP}
          searchHighlights={[]}
          searchingMessages={false}
          selectedChannel={channel}
          sending={false}
          threadErrorsByRootId={EMPTY_STRING_MAP}
          threadLoadingByRootId={EMPTY_BOOLEAN_MAP}
          threadMessagesByRootId={EMPTY_MESSAGE_MAP}
          threadNextCursorByRootId={EMPTY_STRING_MAP}
          threadUnreadCountsByRootId={EMPTY_NUMBER_MAP}
          uploading={false}
          messagesError={null}
          onRetryMessages={vi.fn()}
        />
        <DirectMessageConversationPane
          currentUserId="user-1"
          dmDeleteMessage={vi.fn()}
          dmEditMessage={vi.fn()}
          dmHasMoreMessages={false}
          dmIsLoadingMessages={false}
          dmIsLoadingMore={false}
          dmIsSending={false}
          dmLoadMoreMessages={vi.fn()}
          dmMessageInput="hello"
          dmMessageSearchQuery=""
          dmMessagesForPane={[directMessage]}
          dmMuteConversation={vi.fn()}
          dmSearchHighlights={[]}
          dmSearchingMessages={false}
          dmToggleReaction={vi.fn()}
          handleSendDirectMessage={vi.fn()}
          isDmSearchActive={false}
          onAddAttachments={vi.fn()}
          onArchiveConversation={vi.fn()}
          onDmMessageSearchChange={vi.fn()}
          onRemoveAttachment={vi.fn()}
          pendingAttachments={[]}
          selectedDM={directConversation}
          setActiveDmMessageInput={vi.fn()}
          uploading={false}
          onStartNewDM={vi.fn()}
          messagesError={null}
          onRetryMessages={vi.fn()}
        />
      </>,
    )

    expect(markup).toContain('team-agency')
    expect(markup).toContain('Alex Johnson')
    expect(markup).toContain('New chat')
    expect(markup).toContain('Taylor,Jordan')
    expect(markup).toContain('Message Alex Johnson...')
    expect(markup).toContain('1 messages')
  })

  it('renders a visible warning when a deep-linked message cannot be resolved', () => {
    const markup = renderToStaticMarkup(
      <ChannelConversationPane
        canLoadMore={false}
        channelMessages={[channelMessage]}
        channelMessagesForPane={[channelMessage]}
        channelParticipants={[{ name: 'Taylor', role: 'manager' }]}
        mentionParticipants={[{ id: 'user-1', name: 'Taylor', role: 'manager' }]}
        currentUserId="user-1"
        currentUserRole="admin"
        deepLinkMessageId="missing-message"
        deepLinkThreadId={null}
        isChannelSearchActive={false}
        isCurrentChannelLoading={false}
        loadingMore={false}
        messageDeletingId={null}
        messageInput=""
        messageSearchQuery=""
        messageUpdatingId={null}
        onAddAttachments={vi.fn()}
        onClearDeepLink={vi.fn()}
        onComposerBlur={vi.fn()}
        onComposerFocus={vi.fn()}
        onDeleteMessage={vi.fn()}
        onEditMessage={vi.fn()}
        onLoadMore={vi.fn()}
        onLoadMoreThreadReplies={vi.fn()}
        onLoadThreadReplies={vi.fn()}
        onMarkThreadAsRead={vi.fn()}
        onMessageInputChange={vi.fn()}
        onMessageSearchChange={vi.fn()}
        onRemoveAttachment={vi.fn()}
        onSendMessage={vi.fn()}
        onToggleReaction={vi.fn()}
        pendingAttachments={[]}
        reactionPendingByMessage={EMPTY_STRING_MAP}
        searchHighlights={[]}
        searchingMessages={false}
        selectedChannel={channel}
        sending={false}
        threadErrorsByRootId={EMPTY_STRING_MAP}
        threadLoadingByRootId={EMPTY_BOOLEAN_MAP}
        threadMessagesByRootId={EMPTY_MESSAGE_MAP}
        threadNextCursorByRootId={EMPTY_STRING_MAP}
        threadUnreadCountsByRootId={EMPTY_NUMBER_MAP}
        uploading={false}
        messagesError={null}
        onRetryMessages={vi.fn()}
      />,
    )

    expect(markup).toContain('Linked message unavailable')
    expect(markup).toContain('Clear link')
    expect(markup).toContain('team-agency')
  })
})
