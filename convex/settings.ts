import { mutation, query } from './_generated/server'
import { v } from 'convex/values'
import { authenticatedMutation, authenticatedQuery } from './functions'


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

export const getMyProfile = authenticatedQuery({
  args: {},
  handler: async (ctx) => {
    const row = ctx.user

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

export const updateMyProfile = authenticatedMutation({
  args: {
    name: v.optional(v.union(v.string(), v.null())),
    phoneNumber: v.optional(v.union(v.string(), v.null())),
    photoUrl: v.optional(v.union(v.string(), v.null())),
  },
  handler: async (ctx, args) => {
    const row = ctx.user

    await ctx.db.patch(row._id, {
      ...(args.name !== undefined ? { name: args.name } : {}),
      ...(args.phoneNumber !== undefined ? { phoneNumber: args.phoneNumber } : {}),
      ...(args.photoUrl !== undefined ? { photoUrl: args.photoUrl } : {}),
      updatedAtMs: nowMs(),
    })

    return { ok: true }
  },
})

export const getMyNotificationPreferences = authenticatedQuery({
  args: {},
  handler: async (ctx) => {
    const row = ctx.user

    const prefs = row.notificationPreferences ?? defaultNotificationPreferences

    return {
      ...prefs,
      phoneNumber: row.phoneNumber ?? null,
    }
  },
})

export const updateMyNotificationPreferences = authenticatedMutation({
  args: {
    whatsappTasks: v.boolean(),
    whatsappCollaboration: v.boolean(),
    emailAdAlerts: v.optional(v.boolean()),
    emailPerformanceDigest: v.optional(v.boolean()),
    emailTaskActivity: v.optional(v.boolean()),
    phoneNumber: v.optional(v.union(v.string(), v.null())),
  },
  handler: async (ctx, args) => {
    const row = ctx.user

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

export const getMyRegionalPreferences = authenticatedQuery({
  args: {},
  handler: async (ctx) => {
    return ctx.user.regionalPreferences ?? null
  },
})

export const updateMyRegionalPreferences = authenticatedMutation({
  args: {
    currency: v.optional(v.union(v.string(), v.null())),
    timezone: v.optional(v.union(v.string(), v.null())),
    locale: v.optional(v.union(v.string(), v.null())),
  },
  handler: async (ctx, args) => {
    const row = ctx.user

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
