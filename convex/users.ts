import { mutation, query, internalQuery, internalMutation } from './_generated/server'
import { v } from 'convex/values'

function requireIdentity(identity: unknown): asserts identity {
  if (!identity) {
    throw new Error('Unauthorized')
  }
}

function nowMs() {
  return Date.now()
}

function normalizeEmail(value: string | null | undefined) {
  if (typeof value !== 'string') return { email: null as string | null, emailLower: null as string | null }
  const trimmed = value.trim()
  if (!trimmed) return { email: null, emailLower: null }
  return { email: trimmed, emailLower: trimmed.toLowerCase() }
}

// Internal query - no auth required, for CLI/internal use only
export const _getByEmailInternal = internalQuery({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const normalized = normalizeEmail(args.email)
    if (!normalized.emailLower) return null

    const rows = await ctx.db
      .query('users')
      .withIndex('by_emailLower', (q) => q.eq('emailLower', normalized.emailLower))
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
    if (!normalized.emailLower) return { ok: false, error: 'Invalid email' }

    const matches = await ctx.db
      .query('users')
      .withIndex('by_emailLower', (q) => q.eq('emailLower', normalized.emailLower))
      .collect()

    if (matches.length === 0) return { ok: false, error: 'User not found' }

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

export const getByLegacyId = query({
  args: { legacyId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    requireIdentity(identity)

    const row = await ctx.db
      .query('users')
      .withIndex('by_legacyId', (q) => q.eq('legacyId', args.legacyId))
      .unique()

    if (!row) return null

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

export const getByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    requireIdentity(identity)

    const normalized = normalizeEmail(args.email)
    if (!normalized.emailLower) return null

    // Historical data may contain duplicates; prefer the most recently updated record.
    const rows = await ctx.db
      .query('users')
      .withIndex('by_emailLower', (q) => q.eq('emailLower', normalized.emailLower))
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

export const listWorkspaceMembers = query({
  args: { workspaceId: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    requireIdentity(identity)

    const limit = Math.min(Math.max(args.limit ?? 200, 1), 500)

    const rows = await ctx.db
      .query('users')
      .withIndex('by_agencyId', (q) => q.eq('agencyId', args.workspaceId))
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
export const getWorkspaceIdForUser = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    // This query is used by backend services, so we allow it without auth check
    // The userId comes from authenticated server context
    const row = await ctx.db
      .query('users')
      .withIndex('by_legacyId', (q) => q.eq('legacyId', args.userId))
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
export const getNotificationPreferencesByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const normalized = normalizeEmail(args.email)
    if (!normalized.emailLower) return null

    const rows = await ctx.db
      .query('users')
      .withIndex('by_emailLower', (q) => q.eq('emailLower', normalized.emailLower))
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
export const getWhatsAppRecipientsForWorkspace = query({
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
      .withIndex('by_agencyId', (q) => q.eq('agencyId', args.workspaceId))
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

export const bulkUpsert = mutation({
  args: {
    users: v.array(
      v.object({
        legacyId: v.string(),
        email: v.optional(v.union(v.string(), v.null())),
        name: v.optional(v.union(v.string(), v.null())),
        role: v.optional(v.union(v.string(), v.null())),
        status: v.optional(v.union(v.string(), v.null())),
        agencyId: v.optional(v.union(v.string(), v.null())),
        phoneNumber: v.optional(v.union(v.string(), v.null())),
        photoUrl: v.optional(v.union(v.string(), v.null())),
        stripeCustomerId: v.optional(v.union(v.string(), v.null())),
        notificationPreferences: v.optional(
          v.object({
            whatsappTasks: v.boolean(),
            whatsappCollaboration: v.boolean(),
            emailAdAlerts: v.boolean(),
            emailPerformanceDigest: v.boolean(),
            emailTaskActivity: v.boolean(),
          })
        ),
        regionalPreferences: v.optional(
          v.object({
            currency: v.optional(v.union(v.string(), v.null())),
            timezone: v.optional(v.union(v.string(), v.null())),
            locale: v.optional(v.union(v.string(), v.null())),
          })
        ),
        createdAtMs: v.optional(v.union(v.number(), v.null())),
        updatedAtMs: v.optional(v.union(v.number(), v.null())),
      })
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    requireIdentity(identity)

    const timestamp = nowMs()

    for (const user of args.users) {
      const existing = await ctx.db
        .query('users')
        .withIndex('by_legacyId', (q) => q.eq('legacyId', user.legacyId))
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

/**
 * Get Stripe customer ID for a user.
 * Used by billing to check if user already has a Stripe customer record.
 */
export const getStripeCustomerId = query({
  args: { legacyId: v.string() },
  handler: async (ctx, args) => {
    // No auth required - called from server-side billing code
    const row = await ctx.db
      .query('users')
      .withIndex('by_legacyId', (q) => q.eq('legacyId', args.legacyId))
      .unique()

    return {
      stripeCustomerId: row?.stripeCustomerId ?? null,
      userExists: !!row,
    }
  },
})

/**
 * Set Stripe customer ID for a user.
 * Creates user record if it doesn't exist.
 */
export const setStripeCustomerId = mutation({
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
      .withIndex('by_legacyId', (q) => q.eq('legacyId', args.legacyId))
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
