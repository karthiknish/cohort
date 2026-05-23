import { describe, expect, it } from 'vitest'

import { applyPollVote, encodePollMessage, endPoll, parsePollMessage } from './collaborationPollMessage'

describe('collaborationPollMessage', () => {
  const basePoll = {
    id: 'poll-1',
    question: 'Ship now?',
    options: [
      { id: 'a', text: 'Yes', voters: [] as string[] },
      { id: 'b', text: 'No', voters: [] as string[] },
    ],
    multipleChoice: false,
    anonymous: false,
    endTime: null,
    createdBy: 'user-1',
    createdByName: 'Alex',
    createdAt: '2026-01-01T00:00:00.000Z',
  }

  it('round-trips poll payloads in message content', () => {
    const encoded = encodePollMessage(basePoll)
    const parsed = parsePollMessage(encoded)

    expect(parsed?.question).toBe('Ship now?')
    expect(parsed?.options).toHaveLength(2)
  })

  it('records a vote and can end the poll', () => {
    const voted = applyPollVote(basePoll, 'user-2', ['a'])
    expect(voted.options[0]?.voters).toContain('user-2')

    const ended = endPoll(voted, Date.parse('2026-12-31T00:00:00.000Z'))
    expect(ended.endTime).toBeTruthy()
  })
})
