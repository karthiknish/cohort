import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import type { CollaborationMessage } from '@/types/collaboration'

import { MessageList } from './message-list'
import { MessageListRenderProvider } from './message-list-render-context'
import { UnifiedThreadReplyCard } from './unified-message-pane-sections'

const deletedMessage = {
  id: 'message-1',
  senderId: 'user-1',
  senderName: 'Alex',
  content: 'Original content',
  createdAtMs: Date.now(),
  deleted: true,
}

const deletedMessages = [deletedMessage]

const reply: CollaborationMessage = {
  id: 'reply-1',
  channelType: 'team',
  clientId: null,
  projectId: null,
  content: 'Original reply content',
  senderId: 'user-2',
  senderName: 'Taylor',
  senderRole: 'Designer',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  isEdited: false,
  deletedAt: null,
  deletedBy: null,
  isDeleted: false,
}

const deletedRenderContextValue = {
  renderDeletedInfo: () => <span>Deleted via render context</span>,
}

const replyRenderContextValue = {
  renderMessageContent: () => <span>Reply body from render context</span>,
}

const noop = () => {}

const asyncNoop = async () => {}

describe('MessageListRenderProvider', () => {
  it('lets MessageList read deleted rendering from context', () => {
    const markup = renderToStaticMarkup(
      <MessageListRenderProvider value={deletedRenderContextValue}>
        <MessageList
          messages={deletedMessages}
          currentUserId={null}
          isLoading={false}
          hasMore={false}
          onLoadMore={noop}
          onToggleReaction={asyncNoop}
        />
      </MessageListRenderProvider>,
    )

    expect(markup).toContain('Deleted via render context')
  })

  it('lets UnifiedThreadReplyCard read content rendering from context', () => {
    const markup = renderToStaticMarkup(
      <MessageListRenderProvider value={replyRenderContextValue}>
        <UnifiedThreadReplyCard
          reply={reply}
          currentUserId={null}
          editingMessageId={null}
          activeDeletingMessageId={null}
          messageUpdatingId={null}
          reactionPendingEmoji={null}
          onToggleReaction={noop}
        />
      </MessageListRenderProvider>,
    )

    expect(markup).toContain('Reply body from render context')
  })
})