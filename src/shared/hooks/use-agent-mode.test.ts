import { describe, expect, it } from 'vitest'

import {
  countUserMessagesByClientId,
  filterMessagesForAgentContext,
  upsertAgentMessage,
} from '@/lib/agent-message-lifecycle'

describe('use-agent-mode message reconciliation', () => {
  it('optimistic send then success reconciles to a single user row', () => {
    const clientId = 'local-abc'
    let messages = upsertAgentMessage([], {
      id: clientId,
      clientId,
      lifecycle: 'sending',
    })

    messages = upsertAgentMessage(messages, {
      id: 'persisted-xyz',
      clientId,
      lifecycle: 'sent',
    })

    expect(messages).toHaveLength(1)
    expect(messages[0]?.lifecycle).toBe('sent')
    expect(messages[0]?.id).toBe('persisted-xyz')
  })

  it('failed send retry updates in place instead of duplicating', () => {
    const clientId = 'local-retry'
    let messages = upsertAgentMessage([], {
      id: clientId,
      clientId,
      lifecycle: 'sending',
    })
    messages = upsertAgentMessage(messages, {
      id: clientId,
      clientId,
      lifecycle: 'failed',
    })
    messages = upsertAgentMessage(messages, {
      id: clientId,
      clientId,
      lifecycle: 'sending',
    })

    expect(messages).toHaveLength(1)
    expect(messages[0]?.lifecycle).toBe('sending')
    expect(countUserMessagesByClientId(
      messages.map((m) => ({ type: 'user', clientId: m.clientId })),
    ).get(clientId)).toBe(1)
  })

  it('history reload replaces local ids with persisted ids per row', () => {
    const stored = [
      { id: 'srv-1', clientId: 'srv-1', lifecycle: 'sent' as const },
      { id: 'srv-2', clientId: 'srv-2', lifecycle: 'sent' as const },
    ]
    expect(stored.map((m) => m.id)).toEqual(['srv-1', 'srv-2'])
    expect(
      countUserMessagesByClientId(stored.map((m) => ({ type: 'user', clientId: m.clientId }))),
    ).toEqual(new Map([['srv-1', 1], ['srv-2', 1]]))
  })

  it('filters optimistic rows out of previousMessages context', () => {
    const context = filterMessagesForAgentContext(
      [
        { lifecycle: 'sent', content: 'a' },
        { lifecycle: 'sending', content: 'b' },
        { lifecycle: 'failed', content: 'c' },
      ],
      5,
    ).map((m) => m.content)

    expect(context).toEqual(['a'])
  })
})
