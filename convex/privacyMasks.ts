import { z } from 'zod/v4'
import { Errors } from './errors'
import {
  zWorkspaceQuery,
  zWorkspaceQueryActive,
  zWorkspaceMutation,
} from './functions'

function generateLegacyId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`
}

const ADJECTIVES = ['Swift', 'Bright', 'Calm', 'Eager', 'Gentle', 'Keen', 'Lively', 'Merry', 'Noble', 'Patient']
const NOUNS = ['Falcon', 'Hawk', 'Lion', 'Tiger', 'Bear', 'Wolf', 'Eagle', 'Raven', 'Phoenix', 'Dragon']

export function generatePseudonym(): string {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)]
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)]
  const num = Math.floor(Math.random() * 9999)
  return `${adj} ${noun} ${num}`
}

export function generateRelayIdentifier(): string {
  const prefix = 'relay'
  const random = Math.random().toString(36).substring(2, 8).toLowerCase()
  const domain = 'private.cohorts.app'
  return `${prefix}-${random}@${domain}`
}

export const createMask = zWorkspaceMutation({
  args: {
    resourceType: z.enum(['conversation', 'channel', 'user']),
    resourceId: z.string(),
    maskType: z.enum(['pseudonym', 'relay_number', 'anonymous']),
    displayName: z.string().optional(),
    visibleToRoles: z.array(z.string()).optional(),
    visibleToUserIds: z.array(z.string()).optional(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('privacyMasks')
      .withIndex('by_workspace_resource', (q) =>
        q
          .eq('workspaceId', args.workspaceId)
          .eq('resourceType', args.resourceType)
          .eq('resourceId', args.resourceId)
      )
      .first()

    if (existing) {
      return { _id: existing._id, legacyId: existing.legacyId, isNew: false }
    }

    const legacyId = generateLegacyId()
    const now = Date.now()

    let displayName = args.displayName
    let relayIdentifier: string | null = null

    if (!displayName) {
      if (args.maskType === 'pseudonym') {
        displayName = generatePseudonym()
      } else if (args.maskType === 'relay_number') {
        displayName = `Relay ${Math.random().toString(36).substring(2, 6).toUpperCase()}`
        relayIdentifier = generateRelayIdentifier()
      } else {
        displayName = 'Anonymous'
      }
    }

    const maskId = await ctx.db.insert('privacyMasks', {
      workspaceId: args.workspaceId,
      legacyId,
      resourceType: args.resourceType,
      resourceId: args.resourceId,
      maskType: args.maskType,
      displayName,
      realName: null,
      relayIdentifier,
      visibleToRoles: args.visibleToRoles ?? ['admin'],
      visibleToUserIds: args.visibleToUserIds ?? [],
      createdAtMs: now,
      updatedAtMs: now,
    })

    return { _id: maskId, legacyId, isNew: true, displayName }
  },
})

export const getMaskForResource = zWorkspaceQuery({
  args: {
    resourceType: z.enum(['conversation', 'channel', 'user']),
    resourceId: z.string(),
  },
  handler: async (ctx, args) => {
    const mask = await ctx.db
      .query('privacyMasks')
      .withIndex('by_workspace_resource', (q) =>
        q
          .eq('workspaceId', args.workspaceId)
          .eq('resourceType', args.resourceType)
          .eq('resourceId', args.resourceId)
      )
      .first()

    if (!mask) return null

    return {
      _id: mask._id,
      legacyId: mask.legacyId,
      maskType: mask.maskType,
      displayName: mask.displayName,
      relayIdentifier: mask.relayIdentifier,
    }
  },
})

export const resolveIdentity = zWorkspaceMutation({
  args: {
    maskLegacyId: z.string(),
  },
  handler: async (ctx, args) => {
    const mask = await ctx.db
      .query('privacyMasks')
      .withIndex('by_workspace_legacyId', (q) =>
        q.eq('workspaceId', args.workspaceId).eq('legacyId', args.maskLegacyId)
      )
      .first()

    if (!mask) {
      throw Errors.resource.notFound('Privacy mask')
    }

    const currentUserId = ctx.user._id
    const currentUserRole = typeof ctx.user.role === 'string' ? ctx.user.role : ''

    const canViewRealIdentity =
      currentUserRole === 'admin' ||
      mask.visibleToRoles.includes(currentUserRole) ||
      mask.visibleToUserIds.includes(currentUserId)

    if (!canViewRealIdentity) {
      throw Errors.auth.forbidden('You do not have permission to view the real identity')
    }

    return {
      realName: mask.realName,
      resourceType: mask.resourceType,
      resourceId: mask.resourceId,
    }
  },
})

export const updateMaskVisibility = zWorkspaceMutation({
  args: {
    maskLegacyId: z.string(),
    visibleToRoles: z.array(z.string()).optional(),
    visibleToUserIds: z.array(z.string()).optional(),
  },
  handler: async (ctx, args) => {
    const mask = await ctx.db
      .query('privacyMasks')
      .withIndex('by_workspace_legacyId', (q) =>
        q.eq('workspaceId', args.workspaceId).eq('legacyId', args.maskLegacyId)
      )
      .first()

    if (!mask) {
      throw Errors.resource.notFound('Privacy mask')
    }

    const now = Date.now()
    const updates: { updatedAtMs: number; visibleToRoles?: string[]; visibleToUserIds?: string[] } = { updatedAtMs: now }

    if (args.visibleToRoles !== undefined) {
      updates.visibleToRoles = args.visibleToRoles
    }
    if (args.visibleToUserIds !== undefined) {
      updates.visibleToUserIds = args.visibleToUserIds
    }

    await ctx.db.patch(mask._id, updates)

    return { success: true }
  },
})

export const setRealName = zWorkspaceMutation({
  args: {
    maskLegacyId: z.string(),
    realName: z.string(),
  },
  handler: async (ctx, args) => {
    const currentUserId = ctx.user._id
    const currentUserRole = ctx.user.role

    if (currentUserRole !== 'admin') {
      throw Errors.auth.forbidden('Only admins can set real names')
    }

    const mask = await ctx.db
      .query('privacyMasks')
      .withIndex('by_workspace_legacyId', (q) =>
        q.eq('workspaceId', args.workspaceId).eq('legacyId', args.maskLegacyId)
      )
      .first()

    if (!mask) {
      throw Errors.resource.notFound('Privacy mask')
    }

    const now = Date.now()
    await ctx.db.patch(mask._id, {
      realName: args.realName,
      updatedAtMs: now,
    })

    return { success: true }
  },
})

export const removeMask = zWorkspaceMutation({
  args: {
    maskLegacyId: z.string(),
  },
  handler: async (ctx, args) => {
    const currentUserId = ctx.user._id
    const currentUserRole = ctx.user.role

    if (currentUserRole !== 'admin') {
      throw Errors.auth.forbidden('Only admins can remove privacy masks')
    }

    const mask = await ctx.db
      .query('privacyMasks')
      .withIndex('by_workspace_legacyId', (q) =>
        q.eq('workspaceId', args.workspaceId).eq('legacyId', args.maskLegacyId)
      )
      .first()

    if (!mask) {
      throw Errors.resource.notFound('Privacy mask')
    }

    await ctx.db.delete(mask._id)

    return { success: true }
  },
})

export const listMasks = zWorkspaceQueryActive({
  args: {
    resourceType: z.enum(['conversation', 'channel', 'user']).optional(),
  },
  handler: async (ctx, args) => {
    const q = ctx.db.query('privacyMasks')

    const masks = await q.collect()

    return masks
      .filter((m) => m.workspaceId === args.workspaceId)
      .filter((m) => !args.resourceType || m.resourceType === args.resourceType)
      .map((m) => ({
        _id: m._id,
        legacyId: m.legacyId,
        resourceType: m.resourceType,
        resourceId: m.resourceId,
        maskType: m.maskType,
        displayName: m.displayName,
        relayIdentifier: m.relayIdentifier,
        createdAtMs: m.createdAtMs,
      }))
  },
})

export const getOrCreateUserMask = zWorkspaceMutation({
  args: {
    userId: z.string(),
    userName: z.string(),
    maskType: z.enum(['pseudonym', 'relay_number', 'anonymous']).optional(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('privacyMasks')
      .withIndex('by_workspace_resource', (q) =>
        q.eq('workspaceId', args.workspaceId).eq('resourceType', 'user').eq('resourceId', args.userId)
      )
      .first()

    if (existing) {
      return {
        _id: existing._id,
        legacyId: existing.legacyId,
        displayName: existing.displayName,
        isNew: false,
      }
    }

    const maskType = args.maskType ?? 'pseudonym'
    const legacyId = generateLegacyId()
    const now = Date.now()

    let displayName: string
    let relayIdentifier: string | null = null

    if (maskType === 'pseudonym') {
      displayName = generatePseudonym()
    } else if (maskType === 'relay_number') {
      displayName = `Relay ${Math.random().toString(36).substring(2, 6).toUpperCase()}`
      relayIdentifier = generateRelayIdentifier()
    } else {
      displayName = 'Anonymous'
    }

    const maskId = await ctx.db.insert('privacyMasks', {
      workspaceId: args.workspaceId,
      legacyId,
      resourceType: 'user',
      resourceId: args.userId,
      maskType,
      displayName,
      realName: args.userName,
      relayIdentifier,
      visibleToRoles: ['admin'],
      visibleToUserIds: [],
      createdAtMs: now,
      updatedAtMs: now,
    })

    return { _id: maskId, legacyId, displayName, isNew: true }
  },
})
