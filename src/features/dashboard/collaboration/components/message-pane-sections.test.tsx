import { renderToStaticMarkup } from 'react-dom/server'
import type { RefObject } from 'react'

import { describe, expect, it, vi } from 'vitest'

import type { CollaborationMessage } from '@/types/collaboration'

vi.mock('@/shared/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuItem: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

vi.mock('./link-preview-card', () => ({
  LinkPreviewCard: ({ url }: { url: string }) => <div>{url}</div>,
}))

import {
  CollaborationMessageItem,
  CollaborationMessageViewport,
  type CollaborationFlattenedMessageItem,
} from './message-pane-sections'

const baseMessage: CollaborationMessage = {
  id: 'message-1',
  channelType: 'project',
  clientId: 'client-1',
  projectId: 'project-1',
  content: 'Please review the scope doc https://example.com/spec.pdf',
  senderId: 'user-1',
  senderName: 'Alex Kim',
  senderRole: 'manager',
  createdAt: '2026-03-11T12:00:00.000Z',
  updatedAt: '2026-03-11T12:00:00.000Z',
  isEdited: false,
  deletedAt: null,
  deletedBy: null,
  isDeleted: false,
  attachments: [{ name: 'brief.pdf', url: 'https://example.com/brief.pdf', size: '2 MB', type: 'application/pdf' }],
  mentions: [],
  reactions: [{ emoji: '👍', count: 1, userIds: ['user-1'] }],
  parentMessageId: null,
  threadRootId: null,
  threadReplyCount: 0,
  threadLastReplyAt: null,
  readBy: [],
  deliveredTo: [],
  sharedTo: ['email'],
}

const EMPTY_BOOLEAN_MAP = {} as Record<string, boolean>
const EMPTY_STRING_MAP = {} as Record<string, string | null>
const EMPTY_MESSAGE_MAP = {} as Record<string, CollaborationMessage[]>
const EMPTY_MESSAGES_END_REF = { current: null } as RefObject<HTMLDivElement | null>

describe('message pane sections', () => {
  it('renders a collaboration message item shell', () => {
    const markup = renderToStaticMarkup(
      <CollaborationMessageItem
        currentUserId="user-1"
        currentUserRole="admin"
        editingMessageId={null}
        editingPreview=""
        editingValue=""
        expandedThreadIds={EMPTY_BOOLEAN_MAP}
        message={baseMessage}
        messageDeletingId={null}
        messageUpdatingId={null}
        onCancelEdit={vi.fn()}
        onConfirmDelete={vi.fn()}
        onConfirmEdit={vi.fn()}
        onCreateTask={vi.fn()}
        onEditingValueChange={vi.fn()}
        onLoadMoreThread={vi.fn()}
        onReply={vi.fn()}
        onRetryThreadLoad={vi.fn()}
        onStartEdit={vi.fn()}
        onThreadToggle={vi.fn()}
        onToggleReaction={vi.fn()}
        reactionPendingByMessage={EMPTY_STRING_MAP}
        threadErrorsByRootId={EMPTY_STRING_MAP}
        threadLoadingByRootId={EMPTY_BOOLEAN_MAP}
        threadMessagesByRootId={EMPTY_MESSAGE_MAP}
        threadNextCursorByRootId={EMPTY_STRING_MAP}
      />,
    )

    expect(markup).toContain('Alex Kim')
    expect(markup).toContain('Please review the scope doc')
    expect(markup).toContain('brief.pdf')
  })

  it('renders viewport empty and loaded states', () => {
    const flattenedMessages: CollaborationFlattenedMessageItem[] = [
      { id: 'separator-1', type: 'separator', label: 'Today' },
      { id: 'message-1', type: 'message', message: baseMessage, isFirstInGroup: true },
    ]

    const loadedMarkup = renderToStaticMarkup(
      <CollaborationMessageViewport
        canLoadMore={true}
        channelMessages={[baseMessage]}
        currentUserId="user-1"
        currentUserRole="admin"
        editingMessageId={null}
        editingPreview=""
        editingValue=""
        expandedThreadIds={EMPTY_BOOLEAN_MAP}
        flattenedMessages={flattenedMessages}
        isLoading={false}
        isSearchActive={false}
        loadingMore={false}
        messageDeletingId={null}
        messageUpdatingId={null}
        messagesEndRef={EMPTY_MESSAGES_END_REF}
        messagesError={null}
        onCancelEdit={vi.fn()}
        onConfirmDelete={vi.fn()}
        onConfirmEdit={vi.fn()}
        onCreateTask={vi.fn()}
        onEditingValueChange={vi.fn()}
        onLoadMore={vi.fn()}
        onLoadMoreThread={vi.fn()}
        onReply={vi.fn()}
        onRetryThreadLoad={vi.fn()}
        onStartEdit={vi.fn()}
        onThreadToggle={vi.fn()}
        onToggleReaction={vi.fn()}
        reactionPendingByMessage={EMPTY_STRING_MAP}
        threadErrorsByRootId={EMPTY_STRING_MAP}
        threadLoadingByRootId={EMPTY_BOOLEAN_MAP}
        threadMessagesByRootId={EMPTY_MESSAGE_MAP}
        threadNextCursorByRootId={EMPTY_STRING_MAP}
        visibleMessages={[baseMessage]}
      />,
    )

    const emptyMarkup = renderToStaticMarkup(
      <CollaborationMessageViewport
        canLoadMore={false}
        channelMessages={[]}
        currentUserId="user-1"
        currentUserRole="admin"
        editingMessageId={null}
        editingPreview=""
        editingValue=""
        expandedThreadIds={EMPTY_BOOLEAN_MAP}
        flattenedMessages={[]}
        isLoading={false}
        isSearchActive={false}
        loadingMore={false}
        messageDeletingId={null}
        messageUpdatingId={null}
        messagesEndRef={EMPTY_MESSAGES_END_REF}
        messagesError={null}
        onCancelEdit={vi.fn()}
        onConfirmDelete={vi.fn()}
        onConfirmEdit={vi.fn()}
        onCreateTask={vi.fn()}
        onEditingValueChange={vi.fn()}
        onLoadMore={undefined}
        onLoadMoreThread={vi.fn()}
        onReply={vi.fn()}
        onRetryThreadLoad={vi.fn()}
        onStartEdit={vi.fn()}
        onThreadToggle={vi.fn()}
        onToggleReaction={vi.fn()}
        reactionPendingByMessage={EMPTY_STRING_MAP}
        threadErrorsByRootId={EMPTY_STRING_MAP}
        threadLoadingByRootId={EMPTY_BOOLEAN_MAP}
        threadMessagesByRootId={EMPTY_MESSAGE_MAP}
        threadNextCursorByRootId={EMPTY_STRING_MAP}
        visibleMessages={[]}
      />,
    )

    expect(loadedMarkup).toContain('Load older messages')
    expect(loadedMarkup).toContain('Today')
    expect(loadedMarkup).toContain('Alex Kim')
    expect(emptyMarkup).toContain('Start the conversation by posting the first update for this workspace.')
  })
})
