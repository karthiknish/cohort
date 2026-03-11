import { describe, expect, it } from 'vitest'

import type { Channel } from '../types'
import { buildTypingUpdateRequest } from './use-typing'

const channel: Channel = {
  id: 'team-general',
  name: 'team-general',
  type: 'team',
  clientId: null,
  projectId: 'project-1',
  teamMembers: [],
}

describe('buildTypingUpdateRequest', () => {
  it('builds the typing mutation payload without a client-supplied user id', () => {
    const payload = buildTypingUpdateRequest({
      workspaceId: 'workspace-1',
      selectedChannel: channel,
      senderName: 'Alex Johnson',
      senderRole: 'admin',
      isTyping: true,
    })

    expect(payload).toEqual({
      workspaceId: 'workspace-1',
      channelId: 'team-general',
      channelType: 'team',
      clientId: null,
      projectId: 'project-1',
      name: 'Alex Johnson',
      role: 'admin',
      isTyping: true,
      ttlMs: 8000,
    })
    expect(payload && 'userId' in payload).toBe(false)
  })

  it('returns null when required typing request fields are missing', () => {
    expect(
      buildTypingUpdateRequest({
        workspaceId: null,
        selectedChannel: channel,
        senderName: 'Alex Johnson',
        senderRole: 'admin',
        isTyping: false,
      }),
    ).toBeNull()

    expect(
      buildTypingUpdateRequest({
        workspaceId: 'workspace-1',
        selectedChannel: null,
        senderName: 'Alex Johnson',
        senderRole: 'admin',
        isTyping: false,
      }),
    ).toBeNull()

    expect(
      buildTypingUpdateRequest({
        workspaceId: 'workspace-1',
        selectedChannel: channel,
        senderName: '',
        senderRole: 'admin',
        isTyping: false,
      }),
    ).toBeNull()
  })
})