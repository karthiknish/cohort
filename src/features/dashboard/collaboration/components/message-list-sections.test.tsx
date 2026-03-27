import { renderToStaticMarkup } from 'react-dom/server'

import { describe, expect, it, vi } from 'vitest'

import {
  ChannelMessageCard,
  DirectMessageCard,
  MessageDateSeparator,
  MessageListEmptyState,
  MessageListLoadMoreButton,
  MessageListLoadingState,
} from './message-list-sections'
import type { UnifiedMessage } from './message-list'

vi.mock('emoji-picker-react', () => ({
  __esModule: true,
  default: () => <div>emoji-picker</div>,
  Theme: { LIGHT: 'light' },
}))

const renderers = {
  renderMessageActions: () => <span>Quick actions</span>,
  renderMessageContent: (msg: UnifiedMessage) => <span>{msg.content}</span>,
  renderMessageFooter: () => <span>Footer</span>,
  renderThreadSection: () => <span>Thread section</span>,
}

const emptyReactionPendingByMessage = {} as Record<string, unknown>
const onReact = vi.fn()

const message: UnifiedMessage = {
  id: 'message-1',
  senderId: 'user-1',
  senderName: 'Alex Kim',
  senderRole: 'Manager',
  content: 'Please review the latest draft.',
  createdAtMs: 1760000000000,
  edited: true,
  reactions: [{ emoji: '👍', count: 2, userIds: ['user-1'] }],
}

describe('message list sections', () => {
  it('renders loading, empty, and date separator helpers', () => {
    const markup = renderToStaticMarkup(
      <>
        <MessageListLoadingState />
        <MessageListEmptyState />
        <MessageDateSeparator date="Wednesday, Mar 11" />
        <MessageListLoadMoreButton disabled={false} isLoading={false} onLoadMore={vi.fn()} />
      </>,
    )

    expect(markup).toContain('No messages yet')
    expect(markup).toContain('Wednesday, Mar 11')
    expect(markup).toContain('Load older messages')
  })

  it('renders channel and dm message cards', () => {
    const markup = renderToStaticMarkup(
      <>
        <ChannelMessageCard
          currentUserId="user-1"
          highlighted={true}
          isDeleting={false}
          isEditing={false}
          isUpdating={false}
          localReactionPending={null}
          message={message}
          onReact={onReact}
          reactionPendingByMessage={emptyReactionPendingByMessage}
          renderers={renderers}
          showAvatars={true}
        />
        <DirectMessageCard
          currentUserId="user-1"
          isDeleting={false}
          isEditing={false}
          localReactionPending={null}
          message={message}
          onReact={onReact}
          reactionPendingByMessage={emptyReactionPendingByMessage}
          renderers={renderers}
          showAvatars={true}
        />
      </>,
    )

    expect(markup).toContain('Alex Kim')
    expect(markup).toContain('Manager')
    expect(markup).toContain('Please review the latest draft.')
    expect(markup).toContain('Quick actions')
    expect(markup).toContain('Thread section')
    expect(markup).toContain('Footer')
  })
})
