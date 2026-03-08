import { describe, expect, it } from 'vitest'

import {
  matchesNotificationRecipient,
  resolveMentionRecipientUserIds,
  resolveProjectNotificationRecipientUserIds,
  resolveTaskNotificationRecipientUserIds,
  resolveWorkspaceUserIds,
} from './notificationTargeting'

function createDbStub() {
  const usersByAgency = [
    { legacyId: 'user-1', name: 'Jane Doe', status: 'active' },
    { legacyId: 'user-2', name: 'John Smith', status: 'disabled' },
    { legacyId: 'user-3', name: 'Alex Roe', status: 'active' },
  ]

  return {
    query: (table: string) => ({
      withIndex: (indexName: string) => {
        if (table === 'users' && indexName === 'by_agencyId') {
          return { take: async () => usersByAgency }
        }

        if (table === 'users' && indexName === 'by_legacyId') {
          return {
            unique: async () => ({ legacyId: 'owner-1', name: 'Agency Owner', status: 'active' }),
          }
        }

        if (table === 'projects' && indexName === 'by_workspace_legacyId') {
          return {
            unique: async () => ({ ownerId: 'owner-1' }),
          }
        }

        if (table === 'taskComments' && indexName === 'by_workspace_task_createdAtMs_legacyId') {
          return {
            take: async () => ([
              { authorId: 'user-3', deleted: false },
              { authorId: 'user-2', deleted: false },
              { authorId: null, deleted: false },
              { authorId: 'user-1', deleted: true },
            ]),
          }
        }

        throw new Error(`unexpected ${table}.${indexName}`)
      },
    }),
  }
}

describe('matchesNotificationRecipient', () => {
  it('enforces explicit recipient user ids before role/client matches', () => {
    expect(matchesNotificationRecipient({
      recipientRoles: ['team'],
      recipientClientId: 'client-1',
      recipientUserIds: ['user-2'],
    }, {
      userId: 'user-1',
      role: 'team',
      clientId: 'client-1',
    })).toBe(false)
  })

  it('excludes actor and already-read notifications when requested', () => {
    expect(matchesNotificationRecipient({
      actorId: 'user-1',
      readBy: ['user-1'],
      recipientRoles: ['team'],
    }, {
      userId: 'user-1',
      role: 'team',
      unreadOnly: true,
      excludeActor: true,
    })).toBe(false)
  })

  it('accepts metadata client fallbacks when the audience is otherwise valid', () => {
    expect(matchesNotificationRecipient({
      recipientRoles: ['team'],
      metadata: { clientId: 'client-1' },
    }, {
      userId: 'user-1',
      role: 'team',
      clientId: 'client-1',
    })).toBe(true)
  })
})

describe('resolveMentionRecipientUserIds', () => {
  it('matches workspace users by mention slug or name and skips disabled users', async () => {
    const ctx = {
      db: createDbStub(),
    }

    await expect(resolveMentionRecipientUserIds(ctx as never, 'ws-1', [
      { slug: 'jane%20doe', name: 'Jane Doe' },
      { slug: 'agency%20owner', name: 'Agency Owner' },
      { slug: 'john%20smith', name: 'John Smith' },
    ])).resolves.toEqual(['owner-1', 'user-1'])
  })
})

describe('resolveWorkspaceUserIds', () => {
  it('matches active workspace users by direct id or display name', async () => {
    const ctx = { db: createDbStub() }

    await expect(resolveWorkspaceUserIds(ctx as never, 'ws-1', {
      userIds: ['owner-1', 'user-2'],
      names: ['Alex Roe'],
    })).resolves.toEqual(['owner-1', 'user-3'])
  })
})

describe('resolveTaskNotificationRecipientUserIds', () => {
  it('combines assignees, task creator, project owner, and prior commenters', async () => {
    const ctx = { db: createDbStub() }

    await expect(resolveTaskNotificationRecipientUserIds(ctx as never, {
      workspaceId: 'ws-1',
      assignedTo: ['Jane Doe'],
      createdBy: 'user-3',
      projectId: 'project-1',
      taskLegacyId: 'task-1',
      includeCommentAuthors: true,
    })).resolves.toEqual(['owner-1', 'user-1', 'user-3'])
  })
})

describe('resolveProjectNotificationRecipientUserIds', () => {
  it('keeps project notifications targeted to the explicit owner only', async () => {
    const ctx = { db: createDbStub() }

    await expect(resolveProjectNotificationRecipientUserIds(ctx as never, 'ws-1', 'owner-1'))
      .resolves.toEqual(['owner-1'])
  })
})