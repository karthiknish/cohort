import { describe, expect, it } from 'vitest'

import type { DirectMessage } from '@/types/collaboration'

import { filterDirectMessagesForSearch, parseDirectMessageSearchQuery } from './direct-message-search'

const baseMessage = (overrides: Partial<DirectMessage>): DirectMessage => ({
  id: 'msg_1',
  legacyId: 'msg_1',
  senderId: 'user_1',
  senderName: 'Deepak',
  senderRole: 'Admin',
  content: 'Review the launch brief',
  edited: false,
  editedAtMs: null,
  deleted: false,
  deletedAtMs: null,
  deletedBy: null,
  attachments: null,
  reactions: null,
  readBy: ['user_1'],
  deliveredTo: ['user_1'],
  readAtMs: null,
  sharedTo: null,
  createdAtMs: Date.parse('2026-03-01T10:00:00.000Z'),
  updatedAtMs: Date.parse('2026-03-01T10:00:00.000Z'),
  ...overrides,
})

describe('direct-message-search', () => {
  it('parses DM search filters into structured fields', () => {
    expect(parseDirectMessageSearchQuery('launch from:Deepak attachment:brief after:2026-03-01 before:2026-03-10')).toEqual({
      q: 'launch',
      sender: 'Deepak',
      attachment: 'brief',
      start: '2026-03-01',
      end: '2026-03-10',
      highlights: ['launch', 'Deepak', 'brief'],
    })
  })

  it('filters DM messages by text, sender, attachment, and date', () => {
    const matches = filterDirectMessagesForSearch(
      [
        baseMessage({
          id: 'msg_1',
          legacyId: 'msg_1',
          attachments: [{ name: 'launch-brief.pdf', url: '/launch-brief.pdf' }],
          createdAtMs: Date.parse('2026-03-03T10:00:00.000Z'),
        }),
        baseMessage({
          id: 'msg_2',
          legacyId: 'msg_2',
          senderName: 'Jane',
          content: 'Launch timeline update',
          createdAtMs: Date.parse('2026-03-04T10:00:00.000Z'),
        }),
      ],
      parseDirectMessageSearchQuery('launch from:Deepak attachment:brief after:2026-03-01 before:2026-03-05'),
    )

    expect(matches.map((message) => message.legacyId)).toEqual(['msg_1'])
  })

  it('excludes deleted messages from search results', () => {
    const matches = filterDirectMessagesForSearch(
      [
        baseMessage({ id: 'msg_1', legacyId: 'msg_1', deleted: true, content: 'launch hidden' }),
        baseMessage({ id: 'msg_2', legacyId: 'msg_2', content: 'launch visible' }),
      ],
      parseDirectMessageSearchQuery('launch'),
    )

    expect(matches.map((message) => message.legacyId)).toEqual(['msg_2'])
  })
})