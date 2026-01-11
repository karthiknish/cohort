import { mutation, query } from './_generated/server'
import { v } from 'convex/values'

function requireIdentity(identity: unknown): asserts identity {
  if (!identity) throw new Error('Unauthorized')
}

function nowMs() {
  return Date.now()
}

const defaultNotificationPreferences = {
  whatsappTasks: false,
  whatsappCollaboration: false,
  emailAdAlerts: true,
  emailPerformanceDigest: true,
  emailTaskActivity: true,
}

export const getMyProfile = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    requireIdentity(identity)

    const email = typeof identity.email === 'string' ? identity.email : null
    const emailLower = email ? email.toLowerCase() : null

    if (!emailLower) return null

    const row = await ctx.db
      .query('users')
      .withIndex('by_emailLower', (q) => q.eq('emailLower', emailLower))
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
      notificationPreferences: row.notificationPreferences ?? defaultNotificationPreferences,
      regionalPreferences: row.regionalPreferences ?? null,
      updatedAtMs: row.updatedAtMs,
    }
  },
})

export const updateMyProfile = mutation({
  args: {
    name: v.optional(v.union(v.string(), v.null())),
    phoneNumber: v.optional(v.union(v.string(), v.null())),
    photoUrl: v.optional(v.union(v.string(), v.null())),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    requireIdentity(identity)

    const email = typeof identity.email === 'string' ? identity.email : null
    const emailLower = email ? email.toLowerCase() : null

    if (!emailLower) throw new Error('Email required')

    const row = await ctx.db
      .query('users')
      .withIndex('by_emailLower', (q) => q.eq('emailLower', emailLower))
      .unique()

    if (!row) throw new Error('Profile not found')

    await ctx.db.patch(row._id, {
      ...(args.name !== undefined ? { name: args.name } : {}),
      ...(args.phoneNumber !== undefined ? { phoneNumber: args.phoneNumber } : {}),
      ...(args.photoUrl !== undefined ? { photoUrl: args.photoUrl } : {}),
      updatedAtMs: nowMs(),
    })

    return { ok: true }
  },
})

export const getMyNotificationPreferences = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    requireIdentity(identity)

    const email = typeof identity.email === 'string' ? identity.email : null
    const emailLower = email ? email.toLowerCase() : null

    if (!emailLower) return null

    const row = await ctx.db
      .query('users')
      .withIndex('by_emailLower', (q) => q.eq('emailLower', emailLower))
      .unique()

    if (!row) return null

    const prefs = row.notificationPreferences ?? defaultNotificationPreferences

    return {
      ...prefs,
      phoneNumber: row.phoneNumber ?? null,
    }
  },
})

export const updateMyNotificationPreferences = mutation({
  args: {
    whatsappTasks: v.boolean(),
    whatsappCollaboration: v.boolean(),
    emailAdAlerts: v.optional(v.boolean()),
    emailPerformanceDigest: v.optional(v.boolean()),
    emailTaskActivity: v.optional(v.boolean()),
    phoneNumber: v.optional(v.union(v.string(), v.null())),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    requireIdentity(identity)

    const email = typeof identity.email === 'string' ? identity.email : null
    const emailLower = email ? email.toLowerCase() : null

    if (!emailLower) throw new Error('Email required')

    const row = await ctx.db
      .query('users')
      .withIndex('by_emailLower', (q) => q.eq('emailLower', emailLower))
      .unique()

    if (!row) throw new Error('Profile not found')

    const next = {
      whatsappTasks: args.whatsappTasks,
      whatsappCollaboration: args.whatsappCollaboration,
      emailAdAlerts: args.emailAdAlerts ?? true,
      emailPerformanceDigest: args.emailPerformanceDigest ?? true,
      emailTaskActivity: args.emailTaskActivity ?? true,
    }

    await ctx.db.patch(row._id, {
      notificationPreferences: next,
      ...(args.phoneNumber !== undefined ? { phoneNumber: args.phoneNumber } : {}),
      updatedAtMs: nowMs(),
    })

    return {
      ...next,
      phoneNumber: (args.phoneNumber !== undefined ? args.phoneNumber : row.phoneNumber) ?? null,
    }
  },
})

export const getMyRegionalPreferences = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    requireIdentity(identity)

    const email = typeof identity.email === 'string' ? identity.email : null
    const emailLower = email ? email.toLowerCase() : null

    if (!emailLower) return null

    const row = await ctx.db
      .query('users')
      .withIndex('by_emailLower', (q) => q.eq('emailLower', emailLower))
      .unique()

    if (!row) return null

    return row.regionalPreferences ?? null
  },
})

export const updateMyRegionalPreferences = mutation({
  args: {
    currency: v.optional(v.union(v.string(), v.null())),
    timezone: v.optional(v.union(v.string(), v.null())),
    locale: v.optional(v.union(v.string(), v.null())),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    requireIdentity(identity)

    const email = typeof identity.email === 'string' ? identity.email : null
    const emailLower = email ? email.toLowerCase() : null

    if (!emailLower) throw new Error('Email required')

    const row = await ctx.db
      .query('users')
      .withIndex('by_emailLower', (q) => q.eq('emailLower', emailLower))
      .unique()

    if (!row) throw new Error('Profile not found')

    const existing = row.regionalPreferences ?? {}

    const next = {
      ...existing,
      ...(args.currency !== undefined ? { currency: args.currency } : {}),
      ...(args.timezone !== undefined ? { timezone: args.timezone } : {}),
      ...(args.locale !== undefined ? { locale: args.locale } : {}),
    }

    await ctx.db.patch(row._id, {
      regionalPreferences: next,
      updatedAtMs: nowMs(),
    })

    return next
  },
})
