import { mutation, query, internalQuery, internalMutation } from './_generated/server'
import { v } from 'convex/values'
import {
  authenticatedMutation,
  authenticatedQuery,
  zAuthenticatedMutation,
  zAuthenticatedQuery,
} from './functions'
import { z } from 'zod/v4'
import { Errors } from './errors'


function nowMs() {
  return Date.now()
}

function normalizeEmail(value: string | null | undefined) {
  if (typeof value !== 'string') return { email: null as string | null, emailLower: null as string | null }
  const trimmed = value.trim()
  if (!trimmed) return { email: null, emailLower: null }
  return { email: trimmed, emailLower: trimmed.toLowerCase() }
}
 
const userZ = z.object({
  legacyId: z.string(),
  email: z.string().nullable(),
  name: z.string().nullable(),
  role: z.string().nullable(),
  status: z.string().nullable(),
  agencyId: z.string().nullable(),
  phoneNumber: z.string().nullable(),
  photoUrl: z.string().nullable(),
  notificationPreferences: z
    .object({
      whatsappTasks: z.boolean(),
      whatsappCollaboration: z.boolean(),
      emailAdAlerts: z.boolean(),
      emailPerformanceDigest: z.boolean(),
      emailTaskActivity: z.boolean(),
    })
    .nullable(),
  regionalPreferences: z
    .object({
      currency: z.string().nullable().optional(),
      timezone: z.string().nullable().optional(),
      locale: z.string().nullable().optional(),
    })
    .nullable(),
  createdAtMs: z.number().nullable(),
  updatedAtMs: z.number().nullable(),
})

// Internal query - no auth required, for CLI/internal use only
export const _getByEmailInternal = internalQuery({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const normalized = normalizeEmail(args.email)
    if (!normalized.emailLower) return null

    const rows = await ctx.db
      .query('users')
      .withIndex('by_emailLower', (q: any) => q.eq('emailLower', normalized.emailLower))
      .collect()

    if (rows.length === 0) return null

    let best = rows[0]
    for (const row of rows) {
      const bestUpdated = best.updatedAtMs ?? best.createdAtMs ?? 0
      const rowUpdated = row.updatedAtMs ?? row.createdAtMs ?? 0
      if (rowUpdated > bestUpdated) {
        best = row
      }
    }

    return best
  },
})

// Internal mutation - no auth required, for CLI/internal use only
export const _updateUserRoleStatus = internalMutation({
  args: {
    email: v.string(),
    role: v.string(),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const normalized = normalizeEmail(args.email)
    if (!normalized.emailLower) throw Errors.validation.invalidInput('Invalid email')

    const matches = await ctx.db
      .query('users')
      .withIndex('by_emailLower', (q: any) => q.eq('emailLower', normalized.emailLower))
      .collect()

    if (matches.length === 0) throw Errors.resource.notFound('User', args.email)

    let best = matches[0]
    for (const row of matches) {
      const bestUpdated = best.updatedAtMs ?? best.createdAtMs ?? 0
      const rowUpdated = row.updatedAtMs ?? row.createdAtMs ?? 0
      if (rowUpdated > bestUpdated) {
        best = row
      }
    }

    await ctx.db.patch(best._id, {
      role: args.role,
      status: args.status,
      updatedAtMs: nowMs(),
    })

    return { ok: true, legacyId: best.legacyId, updatedUserId: best._id, duplicateCount: matches.length }
  },
})

export const getByLegacyId = zAuthenticatedQuery({
  args: { legacyId: z.string() },
  returns: userZ,
  handler: async (ctx, args) => {
    const row = await ctx.db
      .query('users')
      .withIndex('by_legacyId', (q: any) => q.eq('legacyId', args.legacyId))
      .unique()

    if (!row) throw Errors.resource.notFound('User', args.legacyId)

    return {
      legacyId: row.legacyId,
      email: row.email,
      name: row.name,
      role: row.role,
      status: row.status,
      agencyId: row.agencyId,
      phoneNumber: row.phoneNumber ?? null,
      photoUrl: row.photoUrl ?? null,
      notificationPreferences: row.notificationPreferences ?? null,
      regionalPreferences: row.regionalPreferences ?? null,
      createdAtMs: row.createdAtMs,
      updatedAtMs: row.updatedAtMs,
    }
  },
})

export const getByEmail = zAuthenticatedQuery({
  args: { email: z.string() },
  returns: userZ,
  handler: async (ctx, args) => {
    const normalized = normalizeEmail(args.email)
    if (!normalized.emailLower) throw Errors.validation.invalidInput('Invalid email')

    // Historical data may contain duplicates; prefer the most recently updated record.
    const rows = await ctx.db
      .query('users')
      .withIndex('by_emailLower', (q: any) => q.eq('emailLower', normalized.emailLower))
      .collect()

    if (rows.length === 0) throw Errors.resource.notFound('User', args.email)

    let best = rows[0]
    for (const row of rows) {
      const bestUpdated = best.updatedAtMs ?? best.createdAtMs ?? 0
      const rowUpdated = row.updatedAtMs ?? row.createdAtMs ?? 0
      if (rowUpdated > bestUpdated) {
        best = row
      }
    }

    return {
      legacyId: best.legacyId,
      email: best.email,
      name: best.name,
      role: best.role,
      status: best.status,
      agencyId: best.agencyId,
      phoneNumber: best.phoneNumber ?? null,
      photoUrl: best.photoUrl ?? null,
      notificationPreferences: best.notificationPreferences ?? null,
      regionalPreferences: best.regionalPreferences ?? null,
      createdAtMs: best.createdAtMs,
      updatedAtMs: best.updatedAtMs,
    }
  },
})

export const listWorkspaceMembers = zAuthenticatedQuery({
  args: { workspaceId: z.string(), limit: z.number().optional() },
  returns: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      email: z.string().optional(),
      role: z.string().optional(),
    })
  ),
  handler: async (ctx, args) => {
    const limit = Math.min(Math.max(args.limit ?? 200, 1), 500)

    const rows = await ctx.db
      .query('users')
      .withIndex('by_agencyId', (q: any) => q.eq('agencyId', args.workspaceId))
      .take(limit)

    return rows
      .filter((row) => row.status !== 'disabled' && row.status !== 'suspended')
      .map((row) => ({
        id: row.legacyId,
        name: row.name ?? row.email ?? 'Unnamed user',
        email: row.email ?? undefined,
        role: row.role ?? undefined,
      }))
  },
})

/**
 * Get workspace ID for a given user ID.
 * Returns agencyId if set, otherwise falls back to userId.
 * This is used by backend services to resolve workspace context.
 */
export const getWorkspaceIdForUser = internalQuery({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    // This query is used by backend services, so we allow it without auth check
    // The userId comes from authenticated server context
    const row = await ctx.db
      .query('users')
      .withIndex('by_legacyId', (q: any) => q.eq('legacyId', args.userId))
      .unique()

    // If user doesn't exist or has no agencyId, fall back to userId
    return {
      workspaceId: row?.agencyId ?? args.userId,
      userExists: !!row,
    }
  },
})

/**
 * Get notification preferences for a user by email.
 * Used by email notification services to check preferences.
 * No auth required - called from server-side code.
 */
export const getNotificationPreferencesByEmail = internalQuery({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const normalized = normalizeEmail(args.email)
    if (!normalized.emailLower) throw Errors.validation.invalidInput('Invalid email')

    const rows = await ctx.db
      .query('users')
      .withIndex('by_emailLower', (q: any) => q.eq('emailLower', normalized.emailLower))
      .collect()

    if (rows.length === 0) throw Errors.auth.userNotFound()

    let best = rows[0]
    for (const row of rows) {
      const bestUpdated = best.updatedAtMs ?? best.createdAtMs ?? 0
      const rowUpdated = row.updatedAtMs ?? row.createdAtMs ?? 0
      if (rowUpdated > bestUpdated) {
        best = row
      }
    }

    return {
      notificationPreferences: best.notificationPreferences ?? null,
    }
  },
})

/**
 * Get users in a workspace with WhatsApp notifications enabled.
 * Returns phone numbers for users with the specified notification type enabled.
 * No auth required - called from server-side notification code.
 */
export const getWhatsAppRecipientsForWorkspace = internalQuery({
  args: {
    workspaceId: v.string(),
    notificationType: v.union(
      v.literal('tasks'),
      v.literal('collaboration'),
      v.literal('billing')
    ),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit ?? 50, 100)

    const rows = await ctx.db
      .query('users')
      .withIndex('by_agencyId', (q: any) => q.eq('agencyId', args.workspaceId))
      .take(limit)

    const phoneNumbers: string[] = []

    for (const row of rows) {
      if (!row.phoneNumber) continue

      const prefs = row.notificationPreferences
      if (!prefs) continue

      // Check if the specific notification type is enabled
      let enabled = false
      switch (args.notificationType) {
        case 'tasks':
          enabled = prefs.whatsappTasks === true
          break
        case 'collaboration':
          enabled = prefs.whatsappCollaboration === true
          break
        case 'billing':
          // No specific billing preference in schema, use tasks as fallback
          enabled = prefs.whatsappTasks === true
          break
      }

      if (enabled) {
        phoneNumbers.push(row.phoneNumber)
      }
    }

    return { phoneNumbers }
  },
})

export const bulkUpsert = zAuthenticatedMutation({
  args: {
    users: z.array(
      z.object({
        legacyId: z.string(),
        email: z.string().nullable().optional(),
        name: z.string().nullable().optional(),
        role: z.string().nullable().optional(),
        status: z.string().nullable().optional(),
        agencyId: z.string().nullable().optional(),
        phoneNumber: z.string().nullable().optional(),
        photoUrl: z.string().nullable().optional(),
        stripeCustomerId: z.string().nullable().optional(),
        notificationPreferences: z
          .object({
            whatsappTasks: z.boolean(),
            whatsappCollaboration: z.boolean(),
            emailAdAlerts: z.boolean(),
            emailPerformanceDigest: z.boolean(),
            emailTaskActivity: z.boolean(),
          })
          .optional(),
        regionalPreferences: z
          .object({
            currency: z.string().nullable().optional(),
            timezone: z.string().nullable().optional(),
            locale: z.string().nullable().optional(),
          })
          .optional(),
        createdAtMs: z.number().nullable().optional(),
        updatedAtMs: z.number().nullable().optional(),
      })
    ),
  },
  returns: z.object({
    ok: z.boolean(),
    upserted: z.number(),
  }),
  handler: async (ctx, args) => {
    const timestamp = nowMs()

    for (const user of args.users) {
      const existing = await ctx.db
        .query('users')
        .withIndex('by_legacyId', (q: any) => q.eq('legacyId', user.legacyId))
        .unique()

      const normalized = normalizeEmail((user.email ?? null) as string | null)

      const payload = {
        legacyId: user.legacyId,
        email: normalized.email,
        emailLower: normalized.emailLower,
        name: (user.name ?? null) as string | null,
        role: (user.role ?? null) as string | null,
        status: (user.status ?? null) as string | null,
        agencyId: (user.agencyId ?? null) as string | null,
        phoneNumber: (user.phoneNumber ?? null) as string | null,
        photoUrl: (user.photoUrl ?? null) as string | null,
        stripeCustomerId: (user.stripeCustomerId ?? null) as string | null,
        notificationPreferences: (user.notificationPreferences ?? undefined) as
          | {
              whatsappTasks: boolean
              whatsappCollaboration: boolean
              emailAdAlerts: boolean
              emailPerformanceDigest: boolean
              emailTaskActivity: boolean
            }
          | undefined,
        regionalPreferences: (user.regionalPreferences ?? undefined) as
          | { currency?: string | null; timezone?: string | null; locale?: string | null }
          | undefined,
        createdAtMs: (user.createdAtMs ?? null) as number | null,
        updatedAtMs: (user.updatedAtMs ?? null) as number | null,
      }

      if (existing) {
        await ctx.db.patch(existing._id, {
          ...payload,
          updatedAtMs: payload.updatedAtMs ?? timestamp,
        })
        continue
      }

      await ctx.db.insert('users', {
        ...payload,
        createdAtMs: payload.createdAtMs ?? timestamp,
        updatedAtMs: payload.updatedAtMs ?? timestamp,
      })
    }

    return { ok: true, upserted: args.users.length }
  },
})

export const bootstrapUpsert = mutation({
  args: {
    legacyId: v.string(),
    email: v.optional(v.string()),
    name: v.optional(v.string()),
    role: v.optional(v.string()),
    status: v.optional(v.string()),
    agencyId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity || identity.subject !== args.legacyId) {
      throw Errors.auth.unauthorized()
    }

    const existing = await ctx.db
      .query('users')
      .withIndex('by_legacyId', (q: any) => q.eq('legacyId', args.legacyId))
      .unique()

    const normalized = normalizeEmail(args.email ?? null)
    const timestamp = nowMs()
    const payload = {
      legacyId: args.legacyId,
      email: normalized.email,
      emailLower: normalized.emailLower,
      name: args.name ?? null,
      role: args.role ?? null,
      status: args.status ?? null,
      agencyId: args.agencyId ?? null,
      phoneNumber: null,
      photoUrl: null,
      stripeCustomerId: null,
      notificationPreferences: undefined,
      regionalPreferences: undefined,
      createdAtMs: existing?.createdAtMs ?? timestamp,
      updatedAtMs: timestamp,
    }

    if (existing) {
      await ctx.db.patch(existing._id, payload)
      return { ok: true, created: false }
    }

    await ctx.db.insert('users', payload)
    return { ok: true, created: true }
  },
})

/**
 * Get Stripe customer ID for a user.
 * Used by billing to check if user already has a Stripe customer record.
 */
export const getStripeCustomerId = internalQuery({
  args: { legacyId: v.string() },
  handler: async (ctx, args) => {
    // No auth required - called from server-side billing code
    const row = await ctx.db
      .query('users')
      .withIndex('by_legacyId', (q: any) => q.eq('legacyId', args.legacyId))
      .unique()

    return {
      stripeCustomerId: row?.stripeCustomerId ?? null,
      userExists: !!row,
    }
  },
})

// Public query - no auth required for test user management
export const getUserByEmailPublic = internalQuery({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const normalized = normalizeEmail(args.email)
    if (!normalized.emailLower) return { found: false, user: null }

    const rows = await ctx.db
      .query('users')
      .withIndex('by_emailLower', (q: any) => q.eq('emailLower', normalized.emailLower))
      .collect()

    if (rows.length === 0) return { found: false, user: null }

    let best = rows[0]
    for (const row of rows) {
      const bestUpdated = best.updatedAtMs ?? best.createdAtMs ?? 0
      const rowUpdated = row.updatedAtMs ?? row.createdAtMs ?? 0
      if (rowUpdated > bestUpdated) {
        best = row
      }
    }

    return { 
      found: true, 
      user: {
        _id: best._id,
        legacyId: best.legacyId,
        email: best.email,
        name: best.name,
        role: best.role,
        status: best.status,
        agencyId: best.agencyId,
        createdAtMs: best.createdAtMs,
        updatedAtMs: best.updatedAtMs,
      }
    }
  },
})

/**
 * Set Stripe customer ID for a user.
 * Creates user record if it doesn't exist.
 */
export const setStripeCustomerId = internalMutation({
  args: {
    legacyId: v.string(),
    stripeCustomerId: v.string(),
    email: v.optional(v.union(v.string(), v.null())),
    name: v.optional(v.union(v.string(), v.null())),
  },
  handler: async (ctx, args) => {
    // No auth required - called from server-side billing code
    const existing = await ctx.db
      .query('users')
      .withIndex('by_legacyId', (q: any) => q.eq('legacyId', args.legacyId))
      .unique()

    const timestamp = nowMs()

    if (existing) {
      await ctx.db.patch(existing._id, {
        stripeCustomerId: args.stripeCustomerId,
        updatedAtMs: timestamp,
      })
      return { ok: true, created: false }
    }

    // Create minimal user record if it doesn't exist
    const normalized = normalizeEmail(args.email ?? null)
    await ctx.db.insert('users', {
      legacyId: args.legacyId,
      email: normalized.email,
      emailLower: normalized.emailLower,
      name: args.name ?? null,
      role: null,
      status: null,
      agencyId: null,
      phoneNumber: null,
      photoUrl: null,
      stripeCustomerId: args.stripeCustomerId,
      createdAtMs: timestamp,
      updatedAtMs: timestamp,
    })

    return { ok: true, created: true }
  },
})

// Public mutation - no auth required for test user management
