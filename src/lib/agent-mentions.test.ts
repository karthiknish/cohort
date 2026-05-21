import { describe, expect, it } from 'vitest'

import {
  formatAgentMentionMarkup,
  mergeAgentMentions,
  parseAgentMentionsFromText,
} from './agent-mentions'

describe('agent-mentions', () => {
  it('formats structured mention markup', () => {
    expect(
      formatAgentMentionMarkup({ id: 'c1', name: 'Acme', type: 'client' }),
    ).toBe('@[Acme](client:c1)')
  })

  it('parses mentions from composer text', () => {
    const mentions = parseAgentMentionsFromText('Ping @[Acme](client:c1) about @[Acme](client:c2)')
    expect(mentions).toHaveLength(2)
    expect(mergeAgentMentions(mentions, mentions)).toHaveLength(2)
  })
})
