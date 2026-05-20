import {
  zAuthenticatedMutation,
  zAuthenticatedQuery,
} from './functions'
import { z } from 'zod/v4'
import {
  DEFAULT_NOTIFICATION_PREFERENCES_V2,
  applyPreferencesPatch,
  normalizePreferences,
  type NotificationPreferencesPatch,
  type NotificationPreferencesV2,
} from '../src/lib/notifications/preferences'

const channelPrefsZ = z.object({
  inApp: z.boolean().optional(),
  email: z.boolean().optional(),
})

const quietHoursZ = z.object({
  enabled: z.boolean().optional(),
  start: z.string().optional(),
  end: z.string().optional(),
})

const categoriesPatchZ = z.object({
  tasks: channelPrefsZ.optional(),
  collaboration: channelPrefsZ.optional(),
  ads: channelPrefsZ.optional(),
  digest: channelPrefsZ.optional(),
  projects: channelPrefsZ.optional(),
  meetings: channelPrefsZ.optional(),
})

export const notificationPreferencesV2Z = z.object({
  version: z.literal(2),
  pauseAll: z.boolean(),
  quietHours: z.object({
    enabled: z.boolean(),
    start: z.string(),
    end: z.string(),
  }),
  categories: z.object({
    tasks: z.object({ inApp: z.boolean(), email: z.boolean() }),
    collaboration: z.object({ inApp: z.boolean(), email: z.boolean() }),
    ads: z.object({ inApp: z.boolean(), email: z.boolean() }),
    digest: z.object({ inApp: z.boolean(), email: z.boolean() }),
    projects: z.object({ inApp: z.boolean(), email: z.boolean() }),
    meetings: z.object({ inApp: z.boolean(), email: z.boolean() }),
  }),
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
  notificationPreferences: notificationPreferencesV2Z,
  regionalPreferences: regionalPreferencesZ,
  updatedAtMs: z.number().nullable(),
})

function nowMs() {
  return Date.now()
}

function serializeNotificationPreferences(
  stored: unknown,
): NotificationPreferencesV2 {
  return normalizePreferences(stored as NotificationPreferencesV2 | null)
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
      notificationPreferences: serializeNotificationPreferences(row.notificationPreferences),
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
  returns: notificationPreferencesV2Z,
  handler: async (ctx) => {
    return serializeNotificationPreferences(ctx.user.notificationPreferences)
  },
})

export const updateMyNotificationPreferences = zAuthenticatedMutation({
  args: {
    pauseAll: z.boolean().optional(),
    quietHours: quietHoursZ.optional(),
    categories: categoriesPatchZ.optional(),
  },
  returns: notificationPreferencesV2Z,
  handler: async (ctx, args) => {
    const row = ctx.user
    const patch: NotificationPreferencesPatch = {
      ...(args.pauseAll !== undefined ? { pauseAll: args.pauseAll } : {}),
      ...(args.quietHours !== undefined ? { quietHours: args.quietHours } : {}),
      ...(args.categories !== undefined ? { categories: args.categories } : {}),
    }

    const next = applyPreferencesPatch(row.notificationPreferences, patch)

    await ctx.db.patch(row._id, {
      notificationPreferences: next,
      updatedAtMs: nowMs(),
    })

    return next
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

export { DEFAULT_NOTIFICATION_PREFERENCES_V2 }
