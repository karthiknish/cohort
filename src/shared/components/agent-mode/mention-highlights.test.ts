import { describe, expect, it } from 'vitest'

import { splitAgentTextWithMentions } from './mention-highlights'

describe('splitAgentTextWithMentions', () => {
  it('highlights known multi-word mentions', () => {
    expect(splitAgentTextWithMentions('Review @Acme Corp launch plan', ['Acme Corp'])).toEqual([
      { text: 'Review ', isMention: false },
      { text: '@Acme Corp', isMention: true },
      { text: ' launch plan', isMention: false },
    ])
  })

  it('highlights fallback @commands', () => {
    expect(splitAgentTextWithMentions('Run @refresh before sync')).toEqual([
      { text: 'Run ', isMention: false },
      { text: '@refresh', isMention: true },
      { text: ' before sync', isMention: false },
    ])
  })

  it('normalizes bracket mentions for display', () => {
    expect(splitAgentTextWithMentions('Check @[Jane Doe] today')).toEqual([
      { text: 'Check ', isMention: false },
      { text: '@Jane Doe', isMention: true },
      { text: ' today', isMention: false },
    ])
  })
})