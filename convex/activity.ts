import { mutation, query } from './_generated/server'
import type { QueryCtx } from './_generated/server'
import { v } from 'convex/values'
import { Errors } from './errors'
import {
  zAuthenticatedQuery,
} from './functions'
import { z } from 'zod/v4'

function requireIdentity(identity: unknown): asserts identity {
  if (!identity) throw Errors.auth.unauthorized()
}

type ActivityType =
  | 'task_activity'
  | 'message_posted'
  | 'project_updated'
  | 'proposal_created'

type Activity = {
  id: string
  type: ActivityType
  timestamp: string
  clientId: string
  entityId: string
  entityName: string
  description: string
  navigationUrl: string
  userName: string | null
  isRead: boolean
  kind: string
}

function toIso(ms: number): string {
  return new Date(ms).toISOString()
}

function readString(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.trim().length > 0 ? value : fallback
}

const KIND_TO_TYPE: Record<string, ActivityType> = {
  'task.created': 'task_activity',
  'task.updated': 'task_activity',
  'task.comment': 'task_activity',
  'task.mention': 'task_activity',
  'collaboration.message': 'message_posted',
  'collaboration.mention': 'message_posted',
  'project.created': 'project_updated',
  'proposal.deck.ready': 'proposal_created',
}

const RESOURCE_TO_URL: Record<string, string> = {
  task: '/dashboard/tasks',
  collaboration: '/dashboard/collaboration',
  project: '/dashboard/projects',
  proposal: '/dashboard/proposals',
}

export const listForClient = zAuthenticatedQuery({
  args: {
    workspaceId: z.string(),
    clientId: z.string(),
    limit: z.number(),
  },
  handler: async (ctx: QueryCtx, args: { workspaceId: string; clientId: string; limit: number }): Promise<Activity[]> => {
    const identity = await ctx.auth.getUserIdentity()
    requireIdentity(identity)

    const userId = identity.subject
    const take = Math.max(1, Math.min(args.limit, 100))
    const seenIds = new Set<string>()
    const activities: Activity[] = []

    // 1. Query centralized notifications table
    const notifRows = await ctx.db
      .query('notifications')
      .withIndex('by_workspaceId_createdAtMs', (q) =>
        q.eq('workspaceId', args.workspaceId),
      )
      .order('desc')
      .take(500)

    for (const n of notifRows) {
      const matchesClient =
        n.recipientClientId === args.clientId ||
        (Array.isArray(n.recipientClientIds) && n.recipientClientIds.includes(args.clientId)) ||
        ((n.metadata as Record<string, unknown> | undefined)?.clientId === args.clientId)

      if (!matchesClient) continue

      const activityType = KIND_TO_TYPE[n.kind]
      if (!activityType) continue

      const resourceType = n.resourceType ?? ''
      const navigationUrl = RESOURCE_TO_URL[resourceType] ?? '/dashboard'

      const id = typeof n.legacyId === 'string' ? n.legacyId : String(n._id)
      seenIds.add(id)

      activities.push({
        id,
        type: activityType,
        timestamp: toIso(n.createdAtMs),
        clientId: args.clientId,
        entityId: n.resourceId,
        entityName: n.title,
        description: n.body,
        navigationUrl,
        userName: n.actorName ?? null,
        isRead: Array.isArray(n.readBy) && n.readBy.includes(userId),
        kind: n.kind,
      })
    }

    // 2. Backfill from tasks table (covers existing data before notifications were wired)
    const tasks = await ctx.db
      .query('tasks')
      .withIndex('by_workspace_clientId_updatedAtMs_legacyId', (q) =>
        q.eq('workspaceId', args.workspaceId).eq('clientId', args.clientId),
      )
      .order('desc')
      .filter((row) => row.eq(row.field('deletedAtMs'), null))
      .take(take)

    for (const task of tasks) {
      const taskId = `task-${String(task.legacyId)}`
      if (seenIds.has(taskId)) continue
      // Also skip if we already have a notification for this task's legacyId
      if (seenIds.has(`task:created:${task.legacyId}`)) continue

      const title = readString(task.title, 'Untitled Task')
      const timestampMs = typeof task.updatedAtMs === 'number' ? task.updatedAtMs : task.createdAtMs

      seenIds.add(taskId)
      activities.push({
        id: taskId,
        type: 'task_activity',
        timestamp: toIso(timestampMs),
        clientId: args.clientId,
        entityId: String(task.legacyId),
        entityName: title,
        description: `Task "${title}" was updated`,
        navigationUrl: '/dashboard/tasks',
        userName: null,
        isRead: false,
        kind: 'task.updated',
      })
    }

    // 3. Backfill from collaboration messages table
    const messages = await ctx.db
      .query('collaborationMessages')
      .withIndex('by_workspace_clientId_createdAtMs_legacyId', (q) =>
        q.eq('workspaceId', args.workspaceId).eq('clientId', args.clientId),
      )
      .order('desc')
      .filter((row) => row.eq(row.field('deleted'), false))
      .take(take)

    for (const message of messages) {
      const msgId = `message-${String(message.legacyId)}`
      if (seenIds.has(msgId)) continue
      if (seenIds.has(`collab:${message.legacyId}`)) continue

      const entityName = message.projectId ? 'Project' : 'Collaboration'

      seenIds.add(msgId)
      activities.push({
        id: msgId,
        type: 'message_posted',
        timestamp: toIso(message.createdAtMs),
        clientId: args.clientId,
        entityId: String(message.legacyId),
        entityName,
        description: `New message in ${entityName}`,
        navigationUrl: message.projectId
          ? `/dashboard/collaboration?projectId=${encodeURIComponent(readString(message.projectId, args.clientId))}`
          : '/dashboard/collaboration',
        userName: readString(message.senderName, null as any) ?? null,
        isRead: false,
        kind: 'collaboration.message',
      })
    }

    // Sort all combined activities by timestamp desc and limit
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    return activities.slice(0, take)
  },
})
