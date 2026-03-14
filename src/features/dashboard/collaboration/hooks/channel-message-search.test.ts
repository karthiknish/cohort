import { describe, expect, it } from 'vitest'

import type { CollaborationMessage } from '@/types/collaboration'

import { filterChannelMessagesForSearch, parseChannelMessageSearchQuery } from './channel-message-search'

const baseMessage = (overrides: Partial<CollaborationMessage> = {}): CollaborationMessage => ({
  id: 'message-1',
  channelType: 'team',
  clientId: null,
  projectId: null,
  senderId: 'user-1',
  senderName: 'Deepak',
  senderRole: 'Admin',
  content: 'Review the launch brief with @Alex',
  createdAt: '2026-03-01T10:00:00.000Z',
  updatedAt: null,
  isEdited: false,
  deletedAt: null,
  deletedBy: null,
  isDeleted: false,
  attachments: undefined,
  format: 'markdown',
  mentions: undefined,
  reactions: [],
  readBy: ['user-1'],
  deliveredTo: ['user-1'],
  isPinned: false,
  pinnedAt: null,
  pinnedBy: null,
  sharedTo: undefined,
  parentMessageId: null,
  threadRootId: null,
  threadReplyCount: undefined,
  threadLastReplyAt: null,
  ...overrides,
})

describe('channel-message-search', () => {
  it('parses channel search filters into structured fields', () => {
    expect(parseChannelMessageSearchQuery('launch from:Deepak attachment:brief mention:alex after:2026-03-01 before:2026-03-10')).toEqual({
      q: 'launch',
      sender: 'Deepak',
      attachment: 'brief',
      mention: 'alex',
      start: '2026-03-01',
      end: '2026-03-10',
      highlights: ['launch', 'Deepak', 'brief', 'alex'],
    })
  })

  it('filters channel messages by text, sender, attachment, mention, and date', () => {
    const matches = filterChannelMessagesForSearch(
      [
        baseMessage({
          id: 'message-1',
          attachments: [{ name: 'launch-brief.pdf', url: '/launch-brief.pdf', type: 'application/pdf', size: '1234' }],
          mentions: [{ slug: 'alex', name: 'Alex', role: 'Strategist' }],
          createdAt: '2026-03-03T10:00:00.000Z',
        }),
        baseMessage({
          id: 'message-2',
          senderName: 'Jane',
          content: 'Launch timeline update',
          createdAt: '2026-03-04T10:00:00.000Z',
        }),
      ],
      parseChannelMessageSearchQuery('launch from:Deepak attachment:brief mention:alex after:2026-03-01 before:2026-03-05'),
    )

    expect(matches.map((message) => message.id)).toEqual(['message-1'])
  })
})