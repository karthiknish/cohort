import { describe, expect, it } from 'vitest'

import { getPreviewAgentModeResponse } from './agent'
import {
  getPreviewCollaborationAutoReply,
  getPreviewDirectAutoReply,
} from './collaboration'
import { getPreviewProjectMilestones } from './projects'

describe('interactive preview helpers', () => {
  it('returns scoped preview milestones for visible projects', () => {
    const milestones = getPreviewProjectMilestones('preview-tech-corp', ['preview-project-1', 'preview-project-4'])

    expect(Object.keys(milestones)).toEqual(['preview-project-1', 'preview-project-4'])
    expect(milestones['preview-project-1']?.length).toBeGreaterThan(0)
    expect(milestones['preview-project-4']?.length).toBeGreaterThan(0)
  })

  it('builds collaboration auto-replies in the current project context', () => {
    const reply = getPreviewCollaborationAutoReply({
      channelType: 'project',
      clientId: 'preview-tech-corp',
      projectId: 'preview-project-1',
      content: 'Can we confirm the timeline?',
      viewerId: 'preview-current-user',
    })

    expect(reply.projectId).toBe('preview-project-1')
    expect(reply.senderName).toBe('Jordan Lee')
    expect(reply.content.toLowerCase()).toContain('timeline')
  })

  it('builds direct-message auto-replies from the conversation participant', () => {
    const reply = getPreviewDirectAutoReply({
      conversationLegacyId: 'preview-dm-sam',
      otherParticipantId: 'preview-user-4',
      otherParticipantName: 'Sam Chen',
      otherParticipantRole: 'Performance Marketer',
      content: 'How is budget pacing looking?',
      currentUserId: 'preview-current-user',
    })

    expect(reply.senderName).toBe('Sam Chen')
    expect(reply.content.toLowerCase()).toContain('pacing')
    expect(reply.readBy).toContain('preview-current-user')
  })

  it('returns an execute action for the sample project command', () => {
    const response = getPreviewAgentModeResponse('create sample project', {
      activeClientId: 'preview-tech-corp',
    })

    expect(response.action).toBe('execute')
    expect(response.operation).toBe('createProject')
    expect(response.route).toContain('/dashboard/projects')
  })
})