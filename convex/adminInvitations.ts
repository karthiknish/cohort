import { z } from 'zod/v4'

import type { Id } from '/_generated/dataModel'
import { Errors, isAppError } from './errors'
import { zAdminMutation, zAdminQuery } from './functions'

type InvitationStatus = 'pending' | 'accepted' | 'expired' | 'revoked'

const INVITATION_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000

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

function getEffectiveStatus(status: InvitationStatus, expiresAtMs: number, currentTimeMs: number): InvitationStatus {
  if (status === 'pending' && expiresAtMs <= currentTimeMs) {
    return 'expired'
  }
  return status
}

function serializeInvitation(
  row: {
    _id: Id<'invitations'>
    email: string
    role: 'admin' | 'team' | 'client'
    name: string | null
    message: string | null
    status: InvitationStatus
    invitedBy: string
    invitedByName: string | null
    token: string
    expiresAtMs: number
    createdAtMs: number
    acceptedAtMs: number | null
  },
  currentTimeMs = nowMs()
) {
  return {
    id: row._id,
    email: row.email,
    role: row.role,
    name: row.name,
    message: row.message,
    status: row.status,
    effectiveStatus: getEffectiveStatus(row.status, row.expiresAtMs, currentTimeMs),
    invitedBy: row.invitedBy,
    invitedByName: row.invitedByName,
    token: row.token,
    expiresAtMs: row.expiresAtMs,
    createdAtMs: row.createdAtMs,
    acceptedAtMs: row.acceptedAtMs,
  }
}

function throwAdminInvitationsError(operation: string, error: unknown, context?: Record<string, unknown>): never {
  console.error(`[adminInvitations:${operation}]`, context ?? {}, error)

  if (isAppError(error)) {
    throw error
  }

  throw Errors.base.internal('Admin invitation operation failed')
}

export const listInvitations = zAdminQuery({
  args: {
    status: z.union([
      z.literal('pending'),
      z.literal('accepted'),
      z.literal('expired'),
      z.literal('revoked'),
    ]).optional(),
    limit: z.number().optional(),
  },
  handler: async (ctx, args) => {
    try {
      const limit = Math.min(Math.max(args.limit ?? 50, 1), 100)
      const currentTimeMs = nowMs()
      const status = args.status

      const base = status
        ? ctx.db
            .query('invitations')
            .withIndex('by_status_createdAtMs', (q) => q.eq('status', status))
            .order('desc')
        : ctx.db
            .query('invitations')
            .withIndex('by_createdAtMs', (q) => q)
            .order('desc')

      const rows = await base.take(limit)

      return {
        invitations: rows.map((row) => serializeInvitation(row, currentTimeMs)),
      }
    } catch (error) {
      throwAdminInvitationsError('listInvitations', error, { status: args.status ?? null, limit: args.limit ?? null })
    }
  },
})

export const createInvitation = zAdminMutation({
  args: {
    email: z.string(),
    role: z.union([z.literal('admin'), z.literal('team'), z.literal('client')]),
    name: z.string().nullable().optional(),
    message: z.string().nullable().optional(),
    invitedBy: z.string(),
    invitedByName: z.string().nullable().optional(),
  },
  handler: async (ctx, args) => {
    try {
      const normalized = normalizeEmail(args.email)

      const existingUser = await ctx.db
        .query('users')
        .withIndex('by_emailLower', (q) => q.eq('emailLower', normalized.emailLower))
        .unique()

      if (existingUser) {
        throw Errors.resource.alreadyExists('User with this email')
      }

      const existingInvites = await ctx.db
        .query('invitations')
        .withIndex('by_emailLower_status', (q) =>
          q.eq('emailLower', normalized.emailLower).eq('status', 'pending')
        )
        .take(1)

      if (existingInvites.length > 0) {
        throw Errors.resource.alreadyExists('Pending invitation for this email')
      }

      const token = generateToken()
      const createdAtMs = nowMs()
      const expiresAtMs = createdAtMs + INVITATION_EXPIRY_MS

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

      const createdInvitation = await ctx.db.get(id)
      if (!createdInvitation) {
        throw Errors.resource.notFound('Invitation', String(id))
      }

      return serializeInvitation(createdInvitation, createdAtMs)
    } catch (error) {
      throwAdminInvitationsError('createInvitation', error, { email: args.email, role: args.role })
    }
  },
})

export const revokeInvitation = zAdminMutation({
  args: { id: z.string() },
  handler: async (ctx, args) => {
    try {
      const invitationId = args.id as Id<'invitations'>
      const existing = await ctx.db.get(invitationId)
      if (!existing) {
        throw Errors.resource.notFound('Invitation')
      }

      if (existing.status === 'accepted') {
        throw Errors.validation.invalidState('Accepted invitations cannot be revoked')
      }

      if (existing.status !== 'revoked') {
        await ctx.db.patch(invitationId, {
          status: 'revoked',
          acceptedAtMs: null,
        })
      }

      const updated = await ctx.db.get(invitationId)
      if (!updated) {
        throw Errors.resource.notFound('Invitation')
      }

      return serializeInvitation(updated)
    } catch (error) {
      throwAdminInvitationsError('revokeInvitation', error, { id: args.id })
    }
  },
})

export const resendInvitation = zAdminMutation({
  args: { id: z.string() },
  handler: async (ctx, args) => {
    try {
      const invitationId = args.id as Id<'invitations'>
      const existing = await ctx.db.get(invitationId)
      if (!existing) {
        throw Errors.resource.notFound('Invitation')
      }

      if (existing.status === 'accepted') {
        throw Errors.validation.invalidState('Accepted invitations do not need a resend')
      }

      const existingUser = await ctx.db
        .query('users')
        .withIndex('by_emailLower', (q) => q.eq('emailLower', existing.emailLower))
        .unique()

      if (existingUser) {
        throw Errors.resource.alreadyExists('User with this email')
      }

      const pendingInvitations = await ctx.db
        .query('invitations')
        .withIndex('by_emailLower_status', (q) => q.eq('emailLower', existing.emailLower).eq('status', 'pending'))
        .collect()

      for (const pendingInvitation of pendingInvitations) {
        await ctx.db.patch(pendingInvitation._id, {
          status: 'revoked',
          acceptedAtMs: null,
        })
      }

      const createdAtMs = nowMs()
      const expiresAtMs = createdAtMs + INVITATION_EXPIRY_MS
      const token = generateToken()

      const newInvitationId = await ctx.db.insert('invitations', {
        legacyId: null,
        email: existing.emailLower,
        emailLower: existing.emailLower,
        role: existing.role,
        name: existing.name,
        message: existing.message,
        status: 'pending',
        invitedBy: ctx.user.legacyId,
        invitedByName: ctx.user.name ?? null,
        token,
        expiresAtMs,
        createdAtMs,
        acceptedAtMs: null,
      })

      const resentInvitation = await ctx.db.get(newInvitationId)
      if (!resentInvitation) {
        throw Errors.resource.notFound('Invitation', String(newInvitationId))
      }

      return serializeInvitation(resentInvitation, createdAtMs)
    } catch (error) {
      throwAdminInvitationsError('resendInvitation', error, { id: args.id })
    }
  },
})
