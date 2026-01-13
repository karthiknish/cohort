import { mutation, query } from './_generated/server'
import { v } from 'convex/values'
import { Errors } from './errors'

function requireAdmin(identity: unknown): asserts identity {
  if (!identity) {
    throw Errors.auth.unauthorized()
  }

  const role = (identity as any).role
  if (role !== 'admin') {
    throw Errors.auth.adminRequired()
  }
}

function nowMs() {
  return Date.now()
}

function normalizeEmail(value: string) {
  const trimmed = value.trim()
  return {
    email: trimmed,
    emailLower: trimmed.toLowerCase(),
  }
}

function generateToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let token = ''
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return token
}

export const listInvitations = query({
  args: {
    status: v.optional(
      v.union(v.literal('pending'), v.literal('accepted'), v.literal('expired'), v.literal('revoked'))
    ),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    requireAdmin(identity)

    const limit = Math.min(Math.max(args.limit ?? 50, 1), 100)

    const base = args.status
      ? ctx.db
          .query('invitations')
          .withIndex('by_status_createdAtMs', (q) => q.eq('status', args.status!))
          .order('desc')
      : ctx.db.query('invitations').order('desc')

    const rows = await base.take(limit)

    return {
      invitations: rows.map((row) => ({
        id: row._id,
        email: row.email,
        role: row.role,
        name: row.name,
        message: row.message,
        status: row.status,
        invitedBy: row.invitedBy,
        invitedByName: row.invitedByName,
        token: row.token,
        expiresAtMs: row.expiresAtMs,
        createdAtMs: row.createdAtMs,
        acceptedAtMs: row.acceptedAtMs,
      })),
    }
  },
})

export const createInvitation = mutation({
  args: {
    email: v.string(),
    role: v.union(v.literal('admin'), v.literal('team'), v.literal('client')),
    name: v.optional(v.union(v.string(), v.null())),
    message: v.optional(v.union(v.string(), v.null())),
    invitedBy: v.string(),
    invitedByName: v.optional(v.union(v.string(), v.null())),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    requireAdmin(identity)

    const normalized = normalizeEmail(args.email)

    const existingUser = await ctx.db
      .query('users')
      .withIndex('by_emailLower', (q) => q.eq('emailLower', normalized.emailLower))
      .unique()

    if (existingUser) {
      throw Errors.resource.alreadyExists('User with this email')
    }

    const existingInvite = await ctx.db
      .query('invitations')
      .withIndex('by_emailLower_status', (q) =>
        q.eq('emailLower', normalized.emailLower).eq('status', 'pending')
      )
      .unique()

    if (existingInvite) {
      throw Errors.resource.alreadyExists('Pending invitation for this email')
    }

    const token = generateToken()
    const createdAtMs = nowMs()
    const expiresAtMs = createdAtMs + 7 * 24 * 60 * 60 * 1000

    const id = await ctx.db.insert('invitations', {
      legacyId: null,
      email: normalized.emailLower,
      emailLower: normalized.emailLower,
      role: args.role,
      name: args.name ?? null,
      message: args.message ?? null,
      status: 'pending',
      invitedBy: args.invitedBy,
      invitedByName: args.invitedByName ?? null,
      token,
      expiresAtMs,
      createdAtMs,
      acceptedAtMs: null,
    })

    return {
      id,
      email: normalized.emailLower,
      role: args.role,
      name: args.name ?? null,
      message: args.message ?? null,
      status: 'pending' as const,
      invitedBy: args.invitedBy,
      invitedByName: args.invitedByName ?? null,
      token,
      expiresAtMs,
      createdAtMs,
      acceptedAtMs: null,
    }
  },
})

export const bulkUpsertInvitations = mutation({
  args: {
    invitations: v.array(
      v.object({
        legacyId: v.string(),
        email: v.string(),
        role: v.union(v.literal('admin'), v.literal('team'), v.literal('client')),
        name: v.union(v.string(), v.null()),
        message: v.union(v.string(), v.null()),
        status: v.union(
          v.literal('pending'),
          v.literal('accepted'),
          v.literal('expired'),
          v.literal('revoked')
        ),
        invitedBy: v.string(),
        invitedByName: v.union(v.string(), v.null()),
        token: v.string(),
        expiresAtMs: v.number(),
        createdAtMs: v.number(),
        acceptedAtMs: v.union(v.number(), v.null()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    requireAdmin(identity)

    for (const invitation of args.invitations) {
      const normalized = normalizeEmail(invitation.email)

      const existing = await ctx.db
        .query('invitations')
        .withIndex('by_legacyId', (q) => q.eq('legacyId', invitation.legacyId))
        .unique()

      const payload = {
        legacyId: invitation.legacyId,
        email: normalized.emailLower,
        emailLower: normalized.emailLower,
        role: invitation.role,
        name: invitation.name,
        message: invitation.message,
        status: invitation.status,
        invitedBy: invitation.invitedBy,
        invitedByName: invitation.invitedByName,
        token: invitation.token,
        expiresAtMs: invitation.expiresAtMs,
        createdAtMs: invitation.createdAtMs,
        acceptedAtMs: invitation.acceptedAtMs,
      }

      if (existing) {
        await ctx.db.patch(existing._id, payload)
      } else {
        await ctx.db.insert('invitations', payload)
      }
    }

    return { ok: true, upserted: args.invitations.length }
  },
})

export const deleteInvitation = mutation({
  args: { id: v.id('invitations') },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    requireAdmin(identity)

    const existing = await ctx.db.get(args.id)
    if (!existing) {
      throw Errors.resource.notFound('Invitation')
    }

    await ctx.db.delete(args.id)
    return { ok: true }
  },
})
