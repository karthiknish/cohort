import { v } from 'convex/values'

import { query, mutation } from './_generated/server'
import type { WorkspaceNotification, WorkspaceNotificationKind, WorkspaceNotificationRole, WorkspaceNotificationResource } from '../src/types/notifications'

function toNotificationKind(input: string): WorkspaceNotificationKind {
  const allowed: WorkspaceNotificationKind[] = [
    'task.created',
    'task.updated',
    'task.comment',
    'task.mention',
    'project.created',
    'collaboration.message',
    'collaboration.mention',
    'proposal.deck.ready',
    'invoice.sent',
    'invoice.paid',
  ]

  return (allowed as readonly string[]).includes(input) ? (input as WorkspaceNotificationKind) : 'task.created'
}

function toResource(type: string, id: string): WorkspaceNotificationResource {
  if (type === 'project') return { type: 'project', id }
  if (type === 'collaboration') return { type: 'collaboration', id }
  if (type === 'proposal') return { type: 'proposal', id }
  if (type === 'invoice') return { type: 'invoice', id }
  return { type: 'task', id }
}

function mapNotification(row: any, userId: string): WorkspaceNotification {
  const recipientRoles = Array.isArray(row.recipientRoles) ? row.recipientRoles : []
  const roles = recipientRoles.filter((value: unknown): value is WorkspaceNotificationRole => value === 'admin' || value === 'team' || value === 'client')

  return {
    id: typeof row.legacyId === 'string' ? row.legacyId : String(row._id),
    kind: toNotificationKind(typeof row.kind === 'string' ? row.kind : 'task.created'),
    title: typeof row.title === 'string' ? row.title : 'Notification',
    body: typeof row.body === 'string' ? row.body : '',
    actor: {
      id: typeof row.actorId === 'string' ? row.actorId : null,
      name: typeof row.actorName === 'string' ? row.actorName : null,
    },
    resource: toResource(
      typeof row.resourceType === 'string' ? row.resourceType : 'task',
      typeof row.resourceId === 'string' ? row.resourceId : ''
    ),
    recipients: {
      roles,
      clientIds: Array.isArray(row.recipientClientIds) ? row.recipientClientIds : undefined,
      clientId: typeof row.recipientClientId === 'string' ? row.recipientClientId : null,
      userIds: Array.isArray(row.recipientUserIds) ? row.recipientUserIds : undefined,
    },
    metadata: row.metadata && typeof row.metadata === 'object' ? row.metadata : undefined,
    createdAt: typeof row.createdAtMs === 'number' ? new Date(row.createdAtMs).toISOString() : null,
    updatedAt: typeof row.updatedAtMs === 'number' ? new Date(row.updatedAtMs).toISOString() : null,
    read: Array.isArray(row.readBy) ? row.readBy.includes(userId) : false,
    acknowledged: Array.isArray(row.acknowledgedBy) ? row.acknowledgedBy.includes(userId) : false,
  }
}

export const list = query({
  args: {
    workspaceId: v.string(),
    pageSize: v.optional(v.number()),
    afterCreatedAtMs: v.optional(v.number()),
    afterLegacyId: v.optional(v.string()),
    role: v.optional(v.union(v.literal('admin'), v.literal('team'), v.literal('client'))),
    clientId: v.optional(v.string()),
    unread: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error('Unauthorized')

    const userId = identity.subject
    const pageSize = Math.min(Math.max(args.pageSize ?? 25, 1), 100)

    const base = ctx.db
      .query('notifications')
      .withIndex('by_workspaceId_createdAtMs', (q) => q.eq('workspaceId', args.workspaceId))
      .order('desc')

    const rows = await base.take(500)

    const filtered = rows
      .filter((row) => {
        if (args.role && !(row.recipientRoles ?? []).includes(args.role)) return false
        if (args.clientId && row.recipientClientId !== args.clientId) return false
        if (args.unread && (row.readBy ?? []).includes(userId)) return false
        return true
      })
      .filter((row) => {
        if (!args.afterCreatedAtMs && !args.afterLegacyId) return true
        const createdAtOk = typeof row.createdAtMs === 'number' ? row.createdAtMs < (args.afterCreatedAtMs ?? Number.POSITIVE_INFINITY) : true
        if (createdAtOk) return true
        if (args.afterCreatedAtMs != null && typeof row.createdAtMs === 'number' && row.createdAtMs === args.afterCreatedAtMs) {
          return typeof row.legacyId === 'string' ? row.legacyId < (args.afterLegacyId ?? '') : false
        }
        return false
      })

    const page = filtered.slice(0, pageSize)
    const next = filtered.length > pageSize ? filtered[pageSize] : null

    return {
      notifications: page.map((row) => mapNotification(row, userId)),
      nextCursor: next
        ? {
            createdAtMs: next.createdAtMs,
            legacyId: next.legacyId,
          }
        : null,
    }
  },
})

export const create = mutation({
  args: {
    workspaceId: v.string(),
    legacyId: v.string(),
    kind: v.string(),
    title: v.string(),
    body: v.string(),
    actorId: v.union(v.string(), v.null()),
    actorName: v.union(v.string(), v.null()),
    resourceType: v.string(),
    resourceId: v.string(),
    recipientRoles: v.array(v.string()),
    recipientClientId: v.union(v.string(), v.null()),
    recipientClientIds: v.optional(v.array(v.string())),
    recipientUserIds: v.optional(v.array(v.string())),
    metadata: v.optional(v.any()),
    createdAtMs: v.number(),
    updatedAtMs: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error('Unauthorized')

    const existing = await ctx.db
      .query('notifications')
      .withIndex('by_workspaceId_legacyId', (q) => q.eq('workspaceId', args.workspaceId).eq('legacyId', args.legacyId))
      .unique()

    const payload = {
      workspaceId: args.workspaceId,
      legacyId: args.legacyId,
      kind: args.kind,
      title: args.title,
      body: args.body,
      actorId: args.actorId,
      actorName: args.actorName,
      resourceType: args.resourceType,
      resourceId: args.resourceId,
      recipientRoles: args.recipientRoles,
      recipientClientId: args.recipientClientId,
      recipientClientIds: args.recipientClientIds,
      recipientUserIds: args.recipientUserIds,
      metadata: args.metadata,
      createdAtMs: args.createdAtMs,
      updatedAtMs: args.updatedAtMs,
      readBy: existing?.readBy ?? [],
      acknowledgedBy: existing?.acknowledgedBy ?? [],
    }

    if (existing) {
      await ctx.db.patch(existing._id, payload)
      return { ok: true, id: existing._id }
    }

    const id = await ctx.db.insert('notifications', payload)
    return { ok: true, id }
  },
})

export const getUnreadCount = query({
  args: {
    workspaceId: v.string(),
    role: v.optional(v.union(v.literal('admin'), v.literal('team'), v.literal('client'))),
    clientId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error('Unauthorized')

    const userId = identity.subject

    const rows = await ctx.db
      .query('notifications')
      .withIndex('by_workspaceId_createdAtMs', (q) => q.eq('workspaceId', args.workspaceId))
      .order('desc')
      .take(500)

    let count = 0

    for (const row of rows) {
      if (args.role && !(row.recipientRoles ?? []).includes(args.role)) continue
      if (args.clientId && row.recipientClientId !== args.clientId) continue
      if ((row.readBy ?? []).includes(userId)) continue
      count += 1
    }

    return { unreadCount: count }
  },
})

export const ack = mutation({
  args: {
    workspaceId: v.string(),
    ids: v.array(v.string()),
    action: v.union(v.literal('read'), v.literal('dismiss')),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error('Unauthorized')

    const userId = identity.subject

    const notifications = await ctx.db
      .query('notifications')
      .withIndex('by_workspaceId_createdAtMs', (q) => q.eq('workspaceId', args.workspaceId))
      .take(1000)

    const idSet = new Set(args.ids)
    const updates = notifications.filter((row) => typeof row.legacyId === 'string' && idSet.has(row.legacyId))

    for (const row of updates) {
      const readBy = Array.isArray(row.readBy) ? row.readBy : []
      const acknowledgedBy = Array.isArray(row.acknowledgedBy) ? row.acknowledgedBy : []

      if (args.action === 'dismiss') {
        await ctx.db.patch(row._id, {
          readBy: readBy.includes(userId) ? readBy : [...readBy, userId],
          acknowledgedBy: acknowledgedBy.includes(userId) ? acknowledgedBy : [...acknowledgedBy, userId],
          updatedAtMs: Date.now(),
        })
      } else {
        await ctx.db.patch(row._id, {
          readBy: readBy.includes(userId) ? readBy : [...readBy, userId],
          updatedAtMs: Date.now(),
        })
      }
    }

    return { ok: true }
  },
})
