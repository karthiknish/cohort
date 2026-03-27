import { renderToStaticMarkup } from 'react-dom/server'

import { describe, expect, it, vi } from 'vitest'

import type { CollaborationMessage } from '@/types/collaboration'

import { ThreadSection } from './thread-section'

const RENDER_REPLY = (message: CollaborationMessage) => <div>{message.content}</div>

const reply: CollaborationMessage = {
  id: 'reply-1', senderId: 'user-2', senderName: 'Sam Lee', createdAt: '2026-03-11T12:30:00.000Z',
  channelType: 'project', clientId: 'client-1', projectId: 'project-1', content: 'Reviewed.', updatedAt: null,
  senderRole: 'designer', isEdited: false, deletedAt: null, deletedBy: null, isDeleted: false,
  attachments: [], mentions: [], reactions: [], parentMessageId: 'root-1', threadRootId: 'root-1',
  threadReplyCount: 0, threadLastReplyAt: null, readBy: [], deliveredTo: [], sharedTo: [],
}

describe('ThreadSection', () => {
  it('renders deterministic loading, empty, and error states', () => {
    const baseProps = {
      threadRootId: 'root-1', replyCount: 1, unreadCount: 0, lastReplyIso: null, hasNextCursor: false,
      onToggle: vi.fn(), onRetry: vi.fn(), onLoadMore: vi.fn(), onReply: vi.fn(), renderReply: vi.fn(),
    }

    const loadingMarkup = renderToStaticMarkup(<ThreadSection {...baseProps} isOpen={true} isLoading={true} error={null} replies={[]} />)
    const emptyMarkup = renderToStaticMarkup(<ThreadSection {...baseProps} isOpen={true} isLoading={false} error={null} replies={[]} />)
    const errorMarkup = renderToStaticMarkup(<ThreadSection {...baseProps} isOpen={true} isLoading={false} error="Unable to load replies." replies={[]} />)
    const loadedMarkup = renderToStaticMarkup(<ThreadSection {...baseProps} isOpen={true} isLoading={false} error={null} replies={[reply]} renderReply={RENDER_REPLY} />)

    expect(loadingMarkup).toContain('Loading replies…')
    expect(emptyMarkup).toContain('No replies yet')
    expect(errorMarkup).toContain('Unable to load replies.')
    expect(loadedMarkup).toContain('Reviewed.')
  })
})