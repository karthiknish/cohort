import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import type { DirectConversation } from '../hooks/use-direct-messages'
import type { Channel } from '../types'
import { UnifiedInbox } from './unified-inbox'

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

const baseProps = {
  currentUserId: 'user-1',
  sidebar: {
    channels: [channel],
    channelSummaries: new Map(),
    channelUnreadCounts: {},
    dmConversations: [directConversation],
    selectedChannel: null,
    selectedDM: null,
    onSelectChannel: () => {},
    onSelectDM: () => {},
    onNewDM: () => {},
    isLoadingChannels: false,
    isLoadingDMs: false,
  },
  channelPane: {
    selectedChannel: null,
    channelMessages: [],
    visibleMessages: [],
    channelParticipants: [],
    mentionParticipants: [],
    messageSearchQuery: '',
    onMessageSearchChange: () => {},
    searchHighlights: [],
    searchingMessages: false,
    isCurrentChannelLoading: false,
    onLoadMore: () => {},
    canLoadMore: false,
    loadingMore: false,
    messageInput: '',
    onMessageInputChange: () => {},
    onSendMessage: async () => {},
    sending: false,
    pendingAttachments: [],
    onAddAttachments: () => {},
    onRemoveAttachment: () => {},
    uploading: false,
    typingParticipants: [],
    onComposerFocus: () => {},
    onComposerBlur: () => {},
    onEditMessage: () => {},
    onDeleteMessage: () => {},
    onToggleReaction: () => {},
    messageUpdatingId: null,
    messageDeletingId: null,
    currentUserRole: 'admin',
    threadMessagesByRootId: {},
    threadNextCursorByRootId: {},
    threadLoadingByRootId: {},
    threadErrorsByRootId: {},
    threadUnreadCountsByRootId: {},
    onLoadThreadReplies: () => {},
    onLoadMoreThreadReplies: () => {},
    onMarkThreadAsRead: async () => {},
    reactionPendingByMessage: {},
    sharedFiles: [],
    deepLinkMessageId: null,
    deepLinkThreadId: null,
    messagesError: null,
    onRetryMessages: () => {},
  },
  directMessagePane: {
    selectedDM: null,
    messages: [],
    visibleMessages: [],
    isLoadingMessages: false,
    isLoadingMore: false,
    hasMoreMessages: false,
    loadMoreMessages: () => {},
    messageSearchQuery: '',
    onMessageSearchChange: () => {},
    searchHighlights: [],
    searchingMessages: false,
    sendMessage: async () => {},
    isSending: false,
    toggleReaction: async () => {},
    deleteMessage: async () => {},
    editMessage: async () => {},
    archiveConversation: async () => {},
    muteConversation: async () => {},
    pendingAttachments: [],
    clearPendingAttachments: () => {},
    uploadPendingAttachments: async () => [],
    uploading: false,
    onAddAttachments: () => {},
    onRemoveAttachment: () => {},
    onStartNewDM: () => {},
    messagesError: null,
    onRetryMessages: () => {},
  },
}

describe('UnifiedInbox', () => {
  it('renders the empty conversation state when nothing is selected', () => {
    const markup = renderToStaticMarkup(<UnifiedInbox {...baseProps} />)

    expect(markup).toContain('Select a conversation')
    expect(markup).toContain('1 Channels')
    expect(markup).toContain('1 Direct Messages')
    expect(markup).toContain('min-h-0 flex-1')
  })
})