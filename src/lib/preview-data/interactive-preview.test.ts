import { describe, expect, it } from 'vitest'

import { getPreviewAgentModeResponse } from './agent'
import { getPreviewClients } from './clients'
import {
  getPreviewCollaborationAutoReply,
  getPreviewCollaborationMessages,
  getPreviewCollaborationParticipants,
  getPreviewCollaborationThreadReplies,
  getPreviewDirectConversations,
  getPreviewDirectAutoReply,
  getPreviewDirectMessages,
} from './collaboration'
import { getPreviewNotifications } from './notifications'
import { getPreviewProjectMilestones, getPreviewProjects, getPreviewProposals, getPreviewTasks } from './projects'

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

  it('simulates the common preview agent actions exposed by the panel shortcuts', () => {
    const scheduleResponse = getPreviewAgentModeResponse('Schedule a meeting', {
      activeClientId: 'preview-tech-corp',
    })
    const updateResponse = getPreviewAgentModeResponse('Update this project status to active', {
      activeClientId: 'preview-tech-corp',
      activeProjectId: 'preview-project-1',
    })
    const adsResponse = getPreviewAgentModeResponse('How are my Meta ads doing this week?', {
      activeClientId: 'preview-tech-corp',
    })
    const reportResponse = getPreviewAgentModeResponse('Generate weekly report', {
      activeClientId: 'preview-tech-corp',
    })

    expect(scheduleResponse).toMatchObject({ action: 'execute', operation: 'createMeeting', success: true })
    expect(updateResponse).toMatchObject({ action: 'execute', operation: 'updateProject', success: true })
    expect(adsResponse).toMatchObject({ action: 'execute', operation: 'summarizeAdsPerformance', success: true })
    expect(reportResponse).toMatchObject({ action: 'execute', operation: 'generatePerformanceReport', success: true })
  })

  it('simulates preview task creation and direct messages', () => {
    const taskResponse = getPreviewAgentModeResponse('Create a task follow up on approvals', {
      activeClientId: 'preview-tech-corp',
    })
    const messageResponse = getPreviewAgentModeResponse('Send a message to Alex about the launch notes', {
      activeClientId: 'preview-tech-corp',
    })

    expect(taskResponse).toMatchObject({ action: 'execute', operation: 'createTask', success: true })
    expect(messageResponse).toMatchObject({ action: 'execute', operation: 'sendDirectMessage', success: true })
  })

  it('keeps preview datasets broad and cross-linked for realistic demos', () => {
    const clients = getPreviewClients()
    const projects = getPreviewProjects(null)
    const tasks = getPreviewTasks(null)
    const proposals = getPreviewProposals(null)
    const notifications = getPreviewNotifications()

    expect(clients).toHaveLength(3)
    expect(clients.every((client) => client.teamMembers.length >= 3)).toBe(true)
    expect(projects.length).toBeGreaterThanOrEqual(5)
    expect(tasks.length).toBeGreaterThanOrEqual(8)
    expect(proposals.length).toBeGreaterThanOrEqual(3)
    expect(notifications.length).toBeGreaterThanOrEqual(10)

    const clientIds = new Set(clients.map((client) => client.id))
    const projectIds = new Set(projects.map((project) => project.id))
    const proposalIds = new Set(proposals.map((proposal) => proposal.id))

    expect(tasks.every((task) => !task.clientId || clientIds.has(task.clientId))).toBe(true)
    expect(tasks.every((task) => !task.projectId || projectIds.has(task.projectId))).toBe(true)
    expect(notifications.some((notification) => notification.kind === 'task.comment')).toBe(true)
    expect(notifications.some((notification) => notification.kind === 'collaboration.message')).toBe(true)
    expect(notifications.some((notification) => notification.kind === 'proposal.deck.ready')).toBe(true)
    expect(notifications.every((notification) => (
      notification.resource.type !== 'proposal' || proposalIds.has(notification.resource.id)
    ))).toBe(true)
  })

  it('keeps collaboration preview data rich across channels, threads, and direct messages', () => {
    const participants = getPreviewCollaborationParticipants()
    const projectMessages = getPreviewCollaborationMessages('project', 'preview-tech-corp', 'preview-project-1', 'preview-current-user')
    const clientMessages = getPreviewCollaborationMessages('client', 'preview-startupxyz', null, 'preview-current-user')
    const threadReplies = getPreviewCollaborationThreadReplies('preview-collab-client-1', 'preview-current-user')
    const directConversations = getPreviewDirectConversations({ id: 'preview-current-user', name: 'You', role: 'Account Owner' })
    const directMessages = getPreviewDirectMessages('preview-dm-alex', { id: 'preview-current-user', name: 'You', role: 'Account Owner' })

    expect(participants.length).toBeGreaterThanOrEqual(9)
    expect(projectMessages.length).toBeGreaterThanOrEqual(2)
    expect(clientMessages.length).toBeGreaterThanOrEqual(2)
    expect(threadReplies.length).toBeGreaterThanOrEqual(3)
    expect(directConversations.length).toBeGreaterThanOrEqual(5)
    expect(directMessages.length).toBeGreaterThanOrEqual(4)

    expect(projectMessages.some((message) => (message.reactions?.length ?? 0) > 0)).toBe(true)
    expect(projectMessages.some((message) => (message.attachments?.length ?? 0) > 0)).toBe(true)
    expect(clientMessages.some((message) => (message.threadReplyCount ?? 0) > 0)).toBe(true)
    expect(threadReplies.some((message) => (message.attachments?.length ?? 0) > 0)).toBe(true)
    expect(directConversations.some((conversation) => conversation.isArchived)).toBe(true)
    expect(directConversations.some((conversation) => conversation.isMuted)).toBe(true)
    expect(directMessages.some((message) => (message.attachments?.length ?? 0) > 0)).toBe(true)
    expect(directMessages.some((message) => (message.sharedTo?.length ?? 0) > 0)).toBe(true)
  })
})