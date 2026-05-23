import { describe, expect, it } from 'vitest'

import { buildDmTypingChannelId, isDmTypingChannelId, parseDmTypingChannelId } from './dm-typing'

describe('dm typing channel ids', () => {
  it('builds and parses dm typing channel ids', () => {
    const channelId = buildDmTypingChannelId('conversation-123')

    expect(isDmTypingChannelId(channelId)).toBe(true)
    expect(parseDmTypingChannelId(channelId)).toBe('conversation-123')
  })
})
