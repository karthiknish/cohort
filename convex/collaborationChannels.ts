import { z } from 'zod/v4'

import { Errors } from './errors'
import {
  zWorkspaceMutation,
  zWorkspaceQuery,
  type AuthenticatedMutationCtx,
  type AuthenticatedQueryCtx,
} from './functions'

type CollaborationChannelCtx = AuthenticatedQueryCtx | AuthenticatedMutationCtx

const channelMemberSummaryZ = z.object({
  id: z.string(),
  name: z.string(),
  role: z.string().nullable(),
  email: z.string().nullable().optional(),
})

const collaborationChannelZ = z.object({
  legacyId: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  channelType: z.string(),
  visibility: z.union([z.literal('public'), z.literal('private')]),
  memberIds: z.array(z.string()),
  memberSummaries: z.array(channelMemberSummaryZ),
  createdBy: z.string(),
  createdAtMs: z.number(),
  updatedAtMs: z.number(),
  archivedAtMs: z.number().nullable(),
})

function assertAdmin(role: string | null | undefined) {
  if (role === 'admin') {
    return
  }

  throw Errors.auth.forbidden('Only admin users can manage collaboration channels')
}

function normalizeName(value: string) {
  return value.replace(/\s+/g, ' ').trim()
}

function toNameLower(value: string) {
  return normalizeName(value).toLowerCase()
}

async function loadWorkspaceUsers(ctx: CollaborationChannelCtx, workspaceId: string) {
  const [membersByAgency, agencyAdmin] = await Promise.all([
    ctx.db.query('users').withIndex('by_agencyId', (q) => q.eq('agencyId', workspaceId)).take(1000),
    ctx.db.query('users').withIndex('by_legacyId', (q) => q.eq('legacyId', workspaceId)).unique(),
  ])

  const combined = agencyAdmin
    ? [agencyAdmin, ...membersByAgency.filter((row) => row.legacyId !== agencyAdmin.legacyId)]
    : membersByAgency

  return combined.filter((row) => row.status !== 'disabled' && row.status !== 'suspended')
}

async function buildMemberSummaries(
  ctx: CollaborationChannelCtx,
  workspaceId: string,
  requestedMemberIds: string[],
) {
  const memberIdSet = new Set(requestedMemberIds.filter((value) => value.trim().length > 0))
  if (memberIdSet.size === 0) {
    return []
  }

  const workspaceUsers = await loadWorkspaceUsers(ctx, workspaceId)
  const summaries = workspaceUsers
    .filter((row) => memberIdSet.has(row.legacyId))
    .map((row) => ({
      id: row.legacyId,
      name: row.name ?? row.email ?? 'Unnamed user',
      role: row.role ?? null,
      email: row.email ?? null,
    }))

  if (summaries.length !== memberIdSet.size) {
    throw Errors.validation.invalidInput('One or more selected members are not part of this workspace')
  }

  return summaries
}

function canAccessChannel(args: {
  currentUserId: string
  currentUserRole: string | null | undefined
  visibility: 'public' | 'private'
  memberIds: string[]
}) {
  if (args.currentUserRole === 'admin') {
    return true
  }

  if (args.memberIds.includes(args.currentUserId)) {
    return true
  }

  if (args.visibility === 'public' && args.currentUserRole === 'team') {
    return true
  }

  return false
}

function mapChannel(row: {
  legacyId: string
  name: string
  description: string | null
  channelType: string
  visibility: 'public' | 'private'
  memberIds: string[]
  memberSummaries: Array<{ id: string; name: string; role?: string | null; email?: string | null }>
  createdBy: string
  createdAtMs: number
  updatedAtMs: number
  archivedAtMs: number | null
}) {
  return {
    legacyId: row.legacyId,
    name: row.name,
    description: row.description,
    channelType: row.channelType,
    visibility: row.visibility,
    memberIds: row.memberIds,
    memberSummaries: row.memberSummaries.map((member) => ({
      id: member.id,
      name: member.name,
      role: member.role ?? null,
      email: member.email ?? null,
    })),
    createdBy: row.createdBy,
    createdAtMs: row.createdAtMs,
    updatedAtMs: row.updatedAtMs,
    archivedAtMs: row.archivedAtMs,
  }
}

export const listAccessible = zWorkspaceQuery({
  args: {
    channelType: z.string().optional(),
  },
  returns: z.array(collaborationChannelZ),
  handler: async (ctx, args) => {
    const currentUserId = typeof ctx.legacyId === 'string' ? ctx.legacyId : null
    if (!currentUserId) {
      throw Errors.auth.unauthorized()
    }

    let rows = await ctx.db
      .query('collaborationChannels')
      .withIndex('by_workspace_channelType_updatedAtMs_legacyId', (q) =>
        q.eq('workspaceId', args.workspaceId).eq('channelType', args.channelType ?? 'team'),
      )
      .order('desc')
      .take(200)

    rows = rows.filter((row) => row.archivedAtMs === null)

    return rows
      .filter((row) =>
        canAccessChannel({
          currentUserId,
          currentUserRole: ctx.user.role,
          visibility: row.visibility,
          memberIds: row.memberIds,
        }),
      )
      .map(mapChannel)
  },
})

export const create = zWorkspaceMutation({
  args: {
    name: z.string(),
    description: z.string().nullable().optional(),
    visibility: z.union([z.literal('public'), z.literal('private')]).optional(),
    memberIds: z.array(z.string()).optional(),
  },
  returns: collaborationChannelZ,
  handler: async (ctx, args) => {
    assertAdmin(ctx.user.role)

    const name = normalizeName(args.name)
    if (name.length < 2) {
      throw Errors.validation.invalidInput('Channel name must be at least 2 characters long')
    }

    if (name.length > 50) {
      throw Errors.validation.invalidInput('Channel name must be 50 characters or fewer')
    }

    const existing = await ctx.db
      .query('collaborationChannels')
      .withIndex('by_workspace_nameLower_legacyId', (q) => q.eq('workspaceId', args.workspaceId).eq('nameLower', toNameLower(name)))
      .take(50)

    if (existing.some((row) => row.archivedAtMs === null)) {
      throw Errors.validation.invalidInput('A collaboration channel with that name already exists')
    }

    const memberIds = Array.from(new Set((args.memberIds ?? []).map((value) => value.trim()).filter(Boolean)))
    const memberSummaries = await buildMemberSummaries(ctx, args.workspaceId, memberIds)
    const legacyId = `channel_${ctx.now}_${Math.random().toString(16).slice(2, 10)}`

    const payload = {
      workspaceId: args.workspaceId,
      legacyId,
      name,
      nameLower: toNameLower(name),
      description: args.description?.trim() || null,
      channelType: 'team',
      visibility: args.visibility ?? 'private',
      memberIds,
      memberSummaries,
      createdBy: ctx.legacyId,
      createdAtMs: ctx.now,
      updatedAtMs: ctx.now,
      archivedAtMs: null,
    } as const

    await ctx.db.insert('collaborationChannels', payload)
    return payload
  },
})

export const updateMembers = zWorkspaceMutation({
  args: {
    legacyId: z.string(),
    memberIds: z.array(z.string()),
    visibility: z.union([z.literal('public'), z.literal('private')]).optional(),
  },
  returns: collaborationChannelZ,
  handler: async (ctx, args) => {
    assertAdmin(ctx.user.role)

    const row = await ctx.db
      .query('collaborationChannels')
      .withIndex('by_workspace_legacyId', (q) => q.eq('workspaceId', args.workspaceId).eq('legacyId', args.legacyId))
      .unique()

    if (!row || row.archivedAtMs !== null) {
      throw Errors.resource.notFound('Collaboration channel', args.legacyId)
    }

    const memberIds = Array.from(new Set(args.memberIds.map((value) => value.trim()).filter(Boolean)))
    const memberSummaries = await buildMemberSummaries(ctx, args.workspaceId, memberIds)

    await ctx.db.patch(row._id, {
      memberIds,
      memberSummaries,
      visibility: args.visibility ?? row.visibility,
      updatedAtMs: ctx.now,
    })

    const updated = await ctx.db.get(row._id)
    if (!updated) {
      throw Errors.resource.notFound('Collaboration channel', args.legacyId)
    }

    return mapChannel(updated)
  },
})

export const remove = zWorkspaceMutation({
  args: {
    legacyId: z.string(),
  },
  returns: z.object({ legacyId: z.string(), archivedAtMs: z.number() }),
  handler: async (ctx, args) => {
    assertAdmin(ctx.user.role)

    const row = await ctx.db
      .query('collaborationChannels')
      .withIndex('by_workspace_legacyId', (q) => q.eq('workspaceId', args.workspaceId).eq('legacyId', args.legacyId))
      .unique()

    if (!row || row.archivedAtMs !== null) {
      throw Errors.resource.notFound('Collaboration channel', args.legacyId)
    }

    await ctx.db.patch(row._id, {
      archivedAtMs: ctx.now,
      updatedAtMs: ctx.now,
    })

    return {
      legacyId: row.legacyId,
      archivedAtMs: ctx.now,
    }
  },
})
