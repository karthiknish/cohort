import { query } from './_generated/server'
import { v } from 'convex/values'

function requireIdentity(identity: unknown): asserts identity {
  if (!identity) throw new Error('Unauthorized')
}

type ActivityType = 'task_completed' | 'message_posted'

type Activity = {
  id: string
  type: ActivityType
  timestamp: string
  clientId: string
  entityId: string
  entityName: string
  description: string
  navigationUrl: string
}

function toIso(ms: number): string {
  return new Date(ms).toISOString()
}

function readString(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.trim().length > 0 ? value : fallback
}

export const listForClient = query({
  args: {
    workspaceId: v.string(),
    clientId: v.string(),
    limit: v.number(),
  },
  handler: async (ctx, args): Promise<Activity[]> => {
    const identity = await ctx.auth.getUserIdentity()
    requireIdentity(identity)

    const take = Math.max(1, Math.min(args.limit, 100))

    const tasks = await ctx.db
      .query('tasks')
      .withIndex('by_workspace_clientId_updatedAtMs_legacyId', (q) =>
        q.eq('workspaceId', args.workspaceId).eq('clientId', args.clientId),
      )
      .order('desc')
      .filter((row) => row.eq(row.field('deletedAtMs'), null))
      .take(take)

    const messages = await ctx.db
      .query('collaborationMessages')
      .withIndex('by_workspace_clientId_createdAtMs_legacyId', (q) =>
        q.eq('workspaceId', args.workspaceId).eq('clientId', args.clientId),
      )
      .order('desc')
      .filter((row) => row.eq(row.field('deleted'), false))
      .take(take)

    const taskActivities: Activity[] = tasks.map((task) => {
      const title = readString(task.title, 'Untitled Task')
      const projectId = readString(task.projectId, args.clientId)
      const timestampMs = typeof task.updatedAtMs === 'number' ? task.updatedAtMs : task.createdAtMs

      return {
        id: `task-${String(task.legacyId)}`,
        type: 'task_completed',
        timestamp: toIso(timestampMs),
        clientId: args.clientId,
        entityId: String(task.legacyId),
        entityName: title,
        description: `Task "${title}" was updated`,
        navigationUrl: `/dashboard/tasks?projectId=${encodeURIComponent(projectId)}&projectName=${encodeURIComponent('Project')}`,
      }
    })

    const messageActivities: Activity[] = messages.map((message) => {
      const projectId = readString(message.projectId, args.clientId)
      const entityName = message.projectId ? 'Project' : 'Collaboration'

      return {
        id: `message-${String(message.legacyId)}`,
        type: 'message_posted',
        timestamp: toIso(message.createdAtMs),
        clientId: args.clientId,
        entityId: String(message.legacyId),
        entityName,
        description: `New message in ${entityName}`,
        navigationUrl: message.projectId
          ? `/dashboard/collaboration?projectId=${encodeURIComponent(projectId)}`
          : `/dashboard/collaboration`,
      }
    })

    const combined = [...taskActivities, ...messageActivities]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, take)

    return combined
  },
})
