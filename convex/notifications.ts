import { internalMutation } from './_generated/server'
import { v } from 'convex/values'
import { Errors } from './errors'
import {
  zWorkspaceMutation,
  zWorkspaceQuery,
} from './functions'
import { z } from 'zod/v4'
import type { WorkspaceNotification, WorkspaceNotificationKind, WorkspaceNotificationRole, WorkspaceNotificationResource } from '../src/types/notifications'
import { matchesNotificationRecipient } from './notificationTargeting'

const RESOURCE_TO_URL: Record<string, string> = {
  task: '/dashboard/tasks',
  collaboration: '/dashboard/collaboration',
  project: '/dashboard/projects',
  proposal: '/dashboard/proposals',
}

const metadataScalarValidator = v.union(v.null(), v.boolean(), v.number(), v.string())
const metadataLayer1Validator = v.union(
  metadataScalarValidator,
  v.array(metadataScalarValidator),
  v.record(v.string(), metadataScalarValidator),
)
const metadataLayer2Validator = v.union(
  metadataLayer1Validator,
  v.array(metadataLayer1Validator),
  v.record(v.string(), metadataLayer1Validator),
)
const metadataValidator = v.record(v.string(), metadataLayer2Validator)
type NotificationMetadata = Record<string, string | number | boolean | null>

function normalizeNotificationMetadata(value: unknown): NotificationMetadata | undefined {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined

  const record = value as Record<string, unknown>
  const normalized: NotificationMetadata = {}

  for (const [key, entry] of Object.entries(record)) {
    if (typeof entry === 'string' || typeof entry === 'number' || typeof entry === 'boolean' || entry === null) {
      normalized[key] = entry
    }
  }

  return Object.keys(normalized).length > 0 ? normalized : undefined
}

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
  ]

  return (allowed as readonly string[]).includes(input) ? (input as WorkspaceNotificationKind) : 'task.created'
}

function toResource(type: string, id: string): WorkspaceNotificationResource {
  if (type === 'project') return { type: 'project', id }
  if (type === 'collaboration') return { type: 'collaboration', id }
  if (type === 'proposal') return { type: 'proposal', id }
  return { type: 'task', id }
}

function readMetadataString(metadata: Record<string, unknown> | undefined, key: string): string | null {
  const value = metadata?.[key]
  return typeof value === 'string' && value.trim().length > 0 ? value : null
}

function resolveChannelId(args: {
  channelType: string | null
  channelId: string | null
  clientId: string | null
  projectId: string | null
}): string | null {
  if (args.channelId) return args.channelId
  if (args.channelType === 'team') return 'team-agency'
  if (args.channelType === 'client' && args.clientId) return `client-${args.clientId}`
  if (args.channelType === 'project' && args.projectId) return `project-${args.projectId}`
  return null
}

function buildCollaborationNavigationUrl(args: {
  channelType: string | null
  channelId: string | null
  clientId: string | null
  projectId: string | null
  messageId: string | null
  threadId: string | null
}) {
  const params = new URLSearchParams()

  const resolvedChannelId = resolveChannelId(args)
  if (resolvedChannelId) params.set('channelId', resolvedChannelId)
  if (args.channelType) params.set('channelType', args.channelType)
  if (args.clientId) params.set('clientId', args.clientId)
  if (args.projectId) params.set('projectId', args.projectId)
  if (args.messageId) params.set('messageId', args.messageId)
  if (args.threadId) params.set('threadId', args.threadId)

  const query = params.toString()
  return query ? `/dashboard/collaboration?${query}` : '/dashboard/collaboration'
}

function buildNotificationNavigationUrl(row: unknown): string {
  const record = row && typeof row === 'object' ? (row as Record<string, unknown>) : null
  const resourceType = typeof record?.resourceType === 'string' ? record.resourceType : ''
  if (resourceType !== 'collaboration') {
    return RESOURCE_TO_URL[resourceType] ?? '/dashboard'
  }

  const metadata = record?.metadata && typeof record.metadata === 'object'
    ? (record.metadata as Record<string, unknown>)
    : undefined

  const channelType = readMetadataString(metadata, 'channelType')
  const channelId = readMetadataString(metadata, 'channelId')
  const clientId = readMetadataString(metadata, 'clientId')
  const projectId = readMetadataString(metadata, 'projectId')
  const messageId = readMetadataString(metadata, 'messageId') ?? (typeof record?.resourceId === 'string' ? record.resourceId : null)
  const threadId = readMetadataString(metadata, 'threadRootId') ?? readMetadataString(metadata, 'parentMessageId')

  return buildCollaborationNavigationUrl({
    channelType,
    channelId,
    clientId,
    projectId,
    messageId,
    threadId,
  })
}

function mapNotification(row: unknown, userId: string): WorkspaceNotification {
  const record = row && typeof row === 'object' ? (row as Record<string, unknown>) : null
  const recipientRoles = Array.isArray(record?.recipientRoles) ? record.recipientRoles : []
  const roles = recipientRoles.filter((value: unknown): value is WorkspaceNotificationRole => value === 'admin' || value === 'team' || value === 'client')
  const metadata =
    record?.metadata && typeof record.metadata === 'object' && !Array.isArray(record.metadata)
      ? (record.metadata as Record<string, unknown>)
      : undefined
  const recipientClientIds = Array.isArray(record?.recipientClientIds)
    ? record.recipientClientIds.filter((value): value is string => typeof value === 'string')
    : undefined
  const recipientUserIds = Array.isArray(record?.recipientUserIds)
    ? record.recipientUserIds.filter((value): value is string => typeof value === 'string')
    : undefined
  const readBy = Array.isArray(record?.readBy)
    ? record.readBy.filter((value): value is string => typeof value === 'string')
    : []
  const acknowledgedBy = Array.isArray(record?.acknowledgedBy)
    ? record.acknowledgedBy.filter((value): value is string => typeof value === 'string')
    : []

  return {
    id: typeof record?.legacyId === 'string' ? record.legacyId : String(record?._id ?? ''),
    kind: toNotificationKind(typeof record?.kind === 'string' ? record.kind : 'task.created'),
    title: typeof record?.title === 'string' ? record.title : 'Notification',
    body: typeof record?.body === 'string' ? record.body : '',
    actor: {
      id: typeof record?.actorId === 'string' ? record.actorId : null,
      name: typeof record?.actorName === 'string' ? record.actorName : null,
    },
    resource: toResource(
      typeof record?.resourceType === 'string' ? record.resourceType : 'task',
      typeof record?.resourceId === 'string' ? record.resourceId : ''
    ),
    recipients: {
      roles,
      clientIds: recipientClientIds,
      clientId: typeof record?.recipientClientId === 'string' ? record.recipientClientId : null,
      userIds: recipientUserIds,
    },
    metadata,
    navigationUrl: buildNotificationNavigationUrl(row),
    createdAt: typeof record?.createdAtMs === 'number' ? new Date(record.createdAtMs).toISOString() : null,
    updatedAt: typeof record?.updatedAtMs === 'number' ? new Date(record.updatedAtMs).toISOString() : null,
    read: readBy.includes(userId),
    acknowledged: acknowledgedBy.includes(userId),
  }
}

export const list = zWorkspaceQuery({
  args: {
    pageSize: z.number().optional(),
    afterCreatedAtMs: z.number().optional(),
    afterLegacyId: z.string().optional(),
    role: z.union([z.literal('admin'), z.literal('team'), z.literal('client')]).optional(),
    clientId: z.string().optional(),
    unread: z.boolean().optional(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw Errors.auth.unauthorized()

    const userId = identity.subject
    const pageSize = Math.min(Math.max(args.pageSize ?? 25, 1), 100)

    const base = ctx.db
      .query('notifications')
      .withIndex('by_workspaceId_createdAtMs', (q) => q.eq('workspaceId', args.workspaceId))
      .order('desc')

    const rows = await base.take(500)

    const filtered = rows
      .filter((row) => {
        return matchesNotificationRecipient(row, {
          userId,
          role: args.role,
          clientId: args.clientId,
          unreadOnly: args.unread,
          excludeActor: true,
        })
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

export const create = zWorkspaceMutation({
  args: {
    legacyId: z.string(),
    kind: z.string(),
    title: z.string(),
    body: z.string(),
    actorId: z.string().nullable(),
    actorName: z.string().nullable(),
    resourceType: z.string(),
    resourceId: z.string(),
    recipientRoles: z.array(z.string()),
    recipientClientId: z.string().nullable(),
    recipientClientIds: z.array(z.string()).optional(),
    recipientUserIds: z.array(z.string()).optional(),
    metadata: z.record(z.string(), z.unknown()).optional(),
    createdAtMs: z.number(),
    updatedAtMs: z.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw Errors.auth.unauthorized()

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
      metadata: normalizeNotificationMetadata(args.metadata),
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

export const getUnreadCount = zWorkspaceQuery({
  args: {
    role: z.union([z.literal('admin'), z.literal('team'), z.literal('client')]).optional(),
    clientId: z.string().optional(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw Errors.auth.unauthorized()

    const userId = identity.subject

    const rows = await ctx.db
      .query('notifications')
      .withIndex('by_workspaceId_createdAtMs', (q) => q.eq('workspaceId', args.workspaceId))
      .order('desc')
      .take(500)

    let count = 0

    for (const row of rows) {
      if (!matchesNotificationRecipient(row, {
        userId,
        role: args.role,
        clientId: args.clientId,
        unreadOnly: true,
        excludeActor: true,
      })) continue
      count += 1
    }

    return { unreadCount: count }
  },
})

export const ack = zWorkspaceMutation({
  args: {
    ids: z.array(z.string()),
    action: z.union([z.literal('read'), z.literal('dismiss')]),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw Errors.auth.unauthorized()

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

export const createInternal = internalMutation({
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
    metadata: v.optional(metadataValidator),
    createdAtMs: v.number(),
    updatedAtMs: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('notifications')
      .withIndex('by_workspaceId_legacyId', (q) => q.eq('workspaceId', args.workspaceId).eq('legacyId', args.legacyId))
      .unique()

    if (existing) {
      return { ok: true, id: existing._id }
    }

    const id = await ctx.db.insert('notifications', {
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
      metadata: normalizeNotificationMetadata(args.metadata),
      createdAtMs: args.createdAtMs,
      updatedAtMs: args.updatedAtMs,
      readBy: [],
      acknowledgedBy: [],
    })
    return { ok: true, id }
  },
})
