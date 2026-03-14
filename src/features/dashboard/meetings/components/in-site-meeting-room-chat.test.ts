import { describe, expect, it } from 'vitest'

import type { ReceivedChatMessage } from '@livekit/components-react'

import {
  DEFAULT_MEETING_CHAT_MENTION_STATE,
  buildMeetingChatMessageContent,
  countUnreadMeetingChatMessages,
  detectMeetingChatMentionState,
  getMeetingChatAuthorLabel,
  getMeetingChatInitials,
  getMeetingChatParticipantAvatarUrl,
  insertMeetingChatMention,
  parseMeetingChatMessageContent,
} from './in-site-meeting-room-chat.utils'

function makeMessage(overrides: Partial<ReceivedChatMessage> = {}): ReceivedChatMessage {
  return {
    id: 'message-1',
    message: 'Hello room',
    timestamp: 100,
    from: undefined,
    ...overrides,
  }
}

describe('in-site meeting room chat utils', () => {
  it('prefers participant name, then identity, for chat author labels', () => {
    expect(getMeetingChatAuthorLabel(makeMessage({ from: { name: 'Deepak', identity: 'deepak-1' } as ReceivedChatMessage['from'] }))).toBe('Deepak')
    expect(getMeetingChatAuthorLabel(makeMessage({ from: { identity: 'deepak-1' } as ReceivedChatMessage['from'] }))).toBe('deepak-1')
    expect(getMeetingChatAuthorLabel(makeMessage())).toBe('Participant')
  })

  it('counts unread room chat messages after the last read timestamp', () => {
    const messages = [
      makeMessage({ id: 'message-1', timestamp: 100 }),
      makeMessage({ id: 'message-2', timestamp: 200 }),
      makeMessage({ id: 'message-3', timestamp: 300 }),
    ]

    expect(countUnreadMeetingChatMessages(messages, 0)).toBe(3)
    expect(countUnreadMeetingChatMessages(messages, 150)).toBe(2)
    expect(countUnreadMeetingChatMessages(messages, 300)).toBe(0)
  })

  it('builds compact initials for chat avatars', () => {
    expect(getMeetingChatInitials('Deepak Kannan')).toBe('DK')
    expect(getMeetingChatInitials('room-bot')).toBe('R')
  })

  it('round-trips structured meeting chat messages with attachments', () => {
    const serialized = buildMeetingChatMessageContent({
      text: 'Please review this',
      attachments: [
        {
          name: 'brief.pdf',
          size: '2 MB',
          type: 'application/pdf',
          url: 'https://example.com/brief.pdf',
        },
      ],
    })

    expect(parseMeetingChatMessageContent(serialized)).toEqual({
      text: 'Please review this',
      attachments: [
        {
          name: 'brief.pdf',
          size: '2 MB',
          type: 'application/pdf',
          url: 'https://example.com/brief.pdf',
        },
      ],
    })
    expect(parseMeetingChatMessageContent('Plain text message')).toEqual({ text: 'Plain text message', attachments: [] })
  })

  it('reads participant avatar URLs from LiveKit metadata when available', () => {
    expect(getMeetingChatParticipantAvatarUrl(makeMessage({
      from: {
        metadata: JSON.stringify({ photoURL: 'https://example.com/avatar.png' }),
      } as ReceivedChatMessage['from'],
    }))).toBe('https://example.com/avatar.png')

    expect(getMeetingChatParticipantAvatarUrl(makeMessage())).toBeNull()
  })

  it('detects active mention queries near the textarea caret', () => {
    expect(detectMeetingChatMentionState('Loop in @dee', 'Loop in @dee'.length)).toEqual({
      active: true,
      startIndex: 8,
      query: 'dee',
    })

    expect(detectMeetingChatMentionState('email@test.com', 'email@test.com'.length)).toEqual(DEFAULT_MEETING_CHAT_MENTION_STATE)
    expect(detectMeetingChatMentionState('Already @[Deepak]', 'Already @[Deepak]'.length)).toEqual(DEFAULT_MEETING_CHAT_MENTION_STATE)
  })

  it('inserts mention markup and preserves following punctuation spacing', () => {
    expect(insertMeetingChatMention({
      currentValue: 'Loop in @dee',
      mentionLabel: 'Deepak',
      mentionState: { active: true, startIndex: 8, query: 'dee' },
      caretPosition: 'Loop in @dee'.length,
    })).toEqual({
      nextValue: 'Loop in @[Deepak] ',
      nextCaret: 'Loop in @[Deepak] '.length,
    })

    expect(insertMeetingChatMention({
      currentValue: 'Ping @dee, please',
      mentionLabel: 'Deepak',
      mentionState: { active: true, startIndex: 5, query: 'dee' },
      caretPosition: 9,
    })).toEqual({
      nextValue: 'Ping @[Deepak], please',
      nextCaret: 'Ping @[Deepak]'.length,
    })
  })
})