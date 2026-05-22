import { describe, expect, it } from 'vitest'

import { mapStoredMessagesToAgentMessages } from './map-stored-messages'
import type { StoredAgentMessage } from './stored-message-utils'

describe('mapStoredMessagesToAgentMessages', () => {
  it('maps user messages with sent lifecycle', () => {
    const stored: StoredAgentMessage[] = [
      {
        id: 'msg-1',
        type: 'user',
        content: 'Hello',
        timestamp: '2026-01-01T12:00:00.000Z',
        route: null,
        action: null,
        operation: null,
        params: null,
        executeResult: null,
      },
    ]

    const mapped = mapStoredMessagesToAgentMessages(stored)
    expect(mapped).toHaveLength(1)
    expect(mapped[0]?.type).toBe('user')
    expect(mapped[0]?.lifecycle).toBe('sent')
    expect(mapped[0]?.content).toBe('Hello')
  })

  it('marks failed execute actions as error status', () => {
    const stored: StoredAgentMessage[] = [
      {
        id: 'msg-2',
        type: 'agent',
        content: 'Failed',
        timestamp: '2026-01-01T12:01:00.000Z',
        route: null,
        action: 'execute',
        operation: 'createTask',
        params: null,
        executeResult: { success: false },
      },
    ]

    const mapped = mapStoredMessagesToAgentMessages(stored)
    expect(mapped[0]?.status).toBe('error')
    expect(mapped[0]?.metadata?.action).toBe('execute')
  })
})
