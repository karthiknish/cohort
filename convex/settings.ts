import {
  authenticatedMutation,
  authenticatedQuery,
  zAuthenticatedMutation,
  zAuthenticatedQuery,
} from './functions'
import { z } from 'zod/v4'
 
const notificationPreferencesZ = z.object({
  whatsappTasks: z.boolean(),
  whatsappCollaboration: z.boolean(),
  emailAdAlerts: z.boolean(),
  emailPerformanceDigest: z.boolean(),
  emailTaskActivity: z.boolean(),
})
 
const regionalPreferencesZ = z.object({
  currency: z.string().nullable().optional(),
  timezone: z.string().nullable().optional(),
  locale: z.string().nullable().optional(),
}).nullable()
 
const profileZ = z.object({
  legacyId: z.string(),
  email: z.string().nullable(),
  name: z.string().nullable(),
  role: z.string().nullable(),
  status: z.string().nullable(),
  agencyId: z.string().nullable(),
  phoneNumber: z.string().nullable().optional(),
  photoUrl: z.string().nullable().optional(),
  notificationPreferences: notificationPreferencesZ,
  regionalPreferences: regionalPreferencesZ,
  updatedAtMs: z.number().nullable(),
})


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

export const getMyProfile = zAuthenticatedQuery({
  args: {},
  returns: profileZ,
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

export const updateMyProfile = zAuthenticatedMutation({
  args: {
    name: z.string().nullable().optional(),
    phoneNumber: z.string().nullable().optional(),
    photoUrl: z.string().nullable().optional(),
  },
  returns: z.object({ ok: z.boolean() }),
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

export const getMyNotificationPreferences = zAuthenticatedQuery({
  args: {},
  returns: notificationPreferencesZ.extend({ phoneNumber: z.string().nullable() }),
  handler: async (ctx) => {
    const row = ctx.user

    const prefs = row.notificationPreferences ?? defaultNotificationPreferences

    return {
      ...prefs,
      phoneNumber: row.phoneNumber ?? null,
    }
  },
})

export const updateMyNotificationPreferences = zAuthenticatedMutation({
  args: {
    whatsappTasks: z.boolean(),
    whatsappCollaboration: z.boolean(),
    emailAdAlerts: z.boolean().optional(),
    emailPerformanceDigest: z.boolean().optional(),
    emailTaskActivity: z.boolean().optional(),
    phoneNumber: z.string().nullable().optional(),
  },
  returns: notificationPreferencesZ.extend({ phoneNumber: z.string().nullable() }),
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

export const getMyRegionalPreferences = zAuthenticatedQuery({
  args: {},
  returns: regionalPreferencesZ,
  handler: async (ctx) => {
    return ctx.user.regionalPreferences ?? null
  },
})

export const updateMyRegionalPreferences = zAuthenticatedMutation({
  args: {
    currency: z.string().nullable().optional(),
    timezone: z.string().nullable().optional(),
    locale: z.string().nullable().optional(),
  },
  returns: regionalPreferencesZ,
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
