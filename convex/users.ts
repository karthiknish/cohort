import { mutation, query, internalQuery, type MutationCtx } from './_generated/server'
import { v } from 'convex/values'
import { assertAppProxySecret } from './appProxy'
import {
  authenticatedQuery,
  optionalAuthenticatedQuery,
  zAdminMutation,
  zAdminQuery,
  zAuthenticatedQuery,
  zRateLimitedAuthenticatedMutation,
  zRateLimitedIdentityMutation,
  zWorkspaceQuery,
} from './functions'
import * as z from 'zod'
import { Errors } from './errors'
import { notificationPreferencesV2Z } from './settings'
import {
  normalizePreferences,
  type StoredNotificationPreferences,
} from '../src/lib/notifications/preferences'
import {
  dedupeClientRosterNames,
  resolveProfilesForRosterNames,
} from './taskDocumentImportParsing'


function nowMs() {
  return Date.now()
}

function normalizeEmail(value: string | null | undefined) {
  if (typeof value !== 'string') return { email: null as string | null, emailLower: null as string | null }
  const trimmed = value.trim()
  if (!trimmed) return { email: null, emailLower: null }
  return { email: trimmed, emailLower: trimmed.toLowerCase() }
}

function pickMostRecentlyUpdated<T extends { updatedAtMs: number | null; createdAtMs: number | null }>(rows: T[]) {
  const [firstRow, ...restRows] = rows
  if (!firstRow) {
    return null
  }

  let best = firstRow
  for (const row of restRows) {
    const bestUpdated = best.updatedAtMs ?? best.createdAtMs ?? 0
    const rowUpdated = row.updatedAtMs ?? row.createdAtMs ?? 0
    if (rowUpdated > bestUpdated) {
      best = row
    }
  }

  return best
}

const DEFAULT_USER_ROLE = 'client'
const DEFAULT_USER_STATUS = 'pending'

function serializeUserRow(row: {
  legacyId: string
  email: string | null
  name: string | null
  role: string | null
  status: string | null
  agencyId: string | null
  phoneNumber?: string | null
  photoUrl?: string | null
  notificationPreferences?: StoredNotificationPreferences
  regionalPreferences?: {
    currency?: string | null
    timezone?: string | null
    locale?: string | null
  } | null
  createdAtMs: number | null
  updatedAtMs: number | null
}) {
  return {
    legacyId: row.legacyId,
    email: row.email,
    name: row.name,
    role: row.role,
    status: row.status,
    agencyId: row.agencyId,
    phoneNumber: row.phoneNumber ?? null,
    photoUrl: row.photoUrl ?? null,
    notificationPreferences:
      row.notificationPreferences != null
        ? normalizePreferences(row.notificationPreferences)
        : null,
    regionalPreferences: row.regionalPreferences ?? null,
    createdAtMs: row.createdAtMs,
    updatedAtMs: row.updatedAtMs,
  }
}

function serializeDirectoryUser(row: {
  legacyId: string
  email: string | null
  name: string | null
  role: string | null
}) {
  return {
    id: row.legacyId,
    name: row.name ?? row.email ?? 'Unnamed user',
    email: row.email ?? undefined,
    role: row.role ?? undefined,
  }
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
  notificationPreferences: notificationPreferencesV2Z.nullable(),
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

export const getByLegacyId = zAuthenticatedQuery({
  args: { legacyId: z.string() },
  returns: userZ,
  handler: async (ctx, args) => {
    if (ctx.user.role !== 'admin' && args.legacyId !== ctx.legacyId) {
      throw Errors.auth.forbidden('You do not have access to this user profile')
    }

    const row = await ctx.db
      .query('users')
      .withIndex('by_legacyId', (q) => q.eq('legacyId', args.legacyId))
      .unique()

    if (!row) throw Errors.resource.notFound('User', args.legacyId)

    return serializeUserRow(row)
  },
})

export const getByEmail = zAuthenticatedQuery({
  args: { email: z.string() },
  returns: userZ,
  handler: async (ctx, args) => {
    const normalized = normalizeEmail(args.email)
    if (!normalized.emailLower) throw Errors.validation.invalidInput('Invalid email')

    const currentUserEmail = normalizeEmail(ctx.user.email)
    if (ctx.user.role !== 'admin' && normalized.emailLower !== currentUserEmail.emailLower) {
      throw Errors.auth.forbidden('You do not have access to this user profile')
    }

    // Historical data may contain duplicates; prefer the most recently updated record.
    const rows = await ctx.db
      .query('users')
      .withIndex('by_emailLower', (q) => q.eq('emailLower', normalized.emailLower))
      .collect()

    const best = pickMostRecentlyUpdated(rows)

    if (!best) throw Errors.resource.notFound('User', args.email)

    return serializeUserRow(best)
  },
})

export const listWorkspaceMembers = zWorkspaceQuery({
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

    // Query users who are part of this workspace:
    // 1. Users whose agencyId matches the workspaceId (team members)
    // 2. Users whose legacyId matches the workspaceId (agency admin/owner)
    const [membersByAgency, agencyAdmin] = await Promise.all([
      ctx.db
        .query('users')
        .withIndex('by_agencyId', (q) => q.eq('agencyId', args.workspaceId))
        .take(limit),
      ctx.db
        .query('users')
        .withIndex('by_legacyId', (q) => q.eq('legacyId', args.workspaceId))
        .unique(),
    ])

    const allRows = agencyAdmin
      ? [agencyAdmin, ...membersByAgency.filter((r) => r.legacyId !== agencyAdmin.legacyId)]
      : membersByAgency

    return allRows.slice(0, limit).flatMap((row) =>
      row.status !== 'disabled' && row.status !== 'suspended'
        ? [serializeDirectoryUser(row)]
        : [],
    )
  },
})

export const resolveProfilesForNames = zWorkspaceQuery({
  args: {
    workspaceId: z.string(),
    names: z.array(z.string()),
  },
  returns: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      email: z.string().optional(),
      role: z.string().optional(),
    }),
  ),
  handler: async (ctx, args) => {
    void ctx
    void args.workspaceId

    const rosterNames = dedupeClientRosterNames(args.names).slice(0, 100)
    if (rosterNames.length === 0) return []

    const rows = await ctx.db.query('users').take(1000)
    const directory = rows.flatMap((row) =>
      row.status !== 'disabled' && row.status !== 'suspended' ? [serializeDirectoryUser(row)] : [],
    )

    return resolveProfilesForRosterNames(rosterNames, directory).map((profile) => {
      const row = rows.find((candidate) => candidate.legacyId === profile.id)
      return {
        ...profile,
        role: row?.role ?? undefined,
      }
    })
  },
})

export const listAllUsers = zAdminQuery({
  args: { limit: z.number().optional() },
  returns: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      email: z.string().optional(),
      role: z.string().optional(),
    })
  ),
  handler: async (ctx, args) => {
    const limit = Math.min(Math.max(args.limit ?? 500, 1), 1000)

    const rows = await ctx.db
      .query('users')
      .take(limit)

    return rows.flatMap((row) =>
      row.status !== 'disabled' && row.status !== 'suspended'
        ? [serializeDirectoryUser(row)]
        : [],
    )
  },
})

export const listDMParticipants = zWorkspaceQuery({
  args: {
    workspaceId: z.string(),
    currentUserRole: z.string().nullable(),
    currentUserId: z.string(),
    limit: z.number().optional(),
  },
  returns: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      email: z.string().optional(),
      role: z.string().optional(),
    })
  ),
  handler: async (ctx, args) => {
    if (args.currentUserId !== ctx.legacyId) {
      throw Errors.auth.forbidden('You can only list participants for the current user')
    }

    const limit = Math.min(Math.max(args.limit ?? 200, 1), 500)
    const role = ctx.user.role?.toLowerCase()

    const [membersByAgency, agencyAdmin] = await Promise.all([
      ctx.db
        .query('users')
        .withIndex('by_agencyId', (q) => q.eq('agencyId', args.workspaceId))
        .take(limit),
      ctx.db
        .query('users')
        .withIndex('by_legacyId', (q) => q.eq('legacyId', args.workspaceId))
        .unique(),
    ])

    const allRows = agencyAdmin
      ? [agencyAdmin, ...membersByAgency.filter((r) => r.legacyId !== agencyAdmin.legacyId)]
      : membersByAgency

    if (role === 'client') {
      return allRows
        .filter((row) => row.status !== 'disabled' && row.status !== 'suspended' && row.legacyId !== args.currentUserId && row.role !== 'client')
        .slice(0, limit)
        .map((row) => serializeDirectoryUser(row))
    }

    return allRows
      .filter((row) => row.status !== 'disabled' && row.status !== 'suspended' && row.legacyId !== args.currentUserId)
      .slice(0, limit)
      .map((row) => serializeDirectoryUser(row))
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
      .withIndex('by_legacyId', (q) => q.eq('legacyId', args.userId))
      .unique()

    // If user doesn't exist or has no agencyId, fall back to userId
    return {
      workspaceId: row?.agencyId ?? args.userId,
      userExists: !!row,
    }
  },
})

export const getMyWorkspaceContext = authenticatedQuery({
  args: {},
  returns: v.object({
    workspaceId: v.string(),
    userId: v.string(),
    role: v.string(),
  }),
  handler: async (ctx) => {
    return {
      workspaceId: ctx.agencyId,
      userId: ctx.legacyId,
      role: ctx.user.role ?? 'team',
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
      .withIndex('by_emailLower', (q) => q.eq('emailLower', normalized.emailLower))
      .collect()

    const best = pickMostRecentlyUpdated(rows)

    if (!best) throw Errors.auth.userNotFound()

    return {
      notificationPreferences: normalizePreferences(best.notificationPreferences),
    }
  },
})

// oxlint-disable-next-line convex-unused/no-unused-functions
export const bulkUpsert = zAdminMutation({
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
        notificationPreferences: z
          .object({
            emailAdAlerts: z.boolean(),
            emailPerformanceDigest: z.boolean(),
            emailTaskActivity: z.boolean(),
            emailCollaboration: z.boolean(),
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

    await Promise.all(
      args.users.map(async (user) => {
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
          notificationPreferences: user.notificationPreferences
            ? normalizePreferences(user.notificationPreferences as StoredNotificationPreferences)
            : undefined,
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
          return
        }

        await ctx.db.insert('users', {
          ...payload,
          createdAtMs: payload.createdAtMs ?? timestamp,
          updatedAtMs: payload.updatedAtMs ?? timestamp,
        })
      }),
    )

    return { ok: true, upserted: args.users.length }
  },
})

// Safe version that returns null instead of throwing - for client-side queries
export const getByLegacyIdSafe = optionalAuthenticatedQuery({
  args: { legacyId: v.string() },
  handler: async (ctx, args): Promise<{
    legacyId: string
    email: string | null
    name: string | null
    role: string | null
    status: string | null
    agencyId: string | null
    phoneNumber: string | null
    photoUrl: string | null
    notificationPreferences: ReturnType<typeof normalizePreferences> | null
    regionalPreferences:
      | {
          currency?: string | null
          timezone?: string | null
          locale?: string | null
        }
      | null
    createdAtMs: number | null
    updatedAtMs: number | null
  } | null> => {
    if (!ctx.legacyId || ctx.legacyId !== args.legacyId) {
      return null
    }

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
      notificationPreferences:
        row.notificationPreferences != null
          ? normalizePreferences(row.notificationPreferences)
          : null,
      regionalPreferences: row.regionalPreferences ?? null,
      createdAtMs: row.createdAtMs,
      updatedAtMs: row.updatedAtMs,
    }
  },
})

type EnsureProfileOnSignInArgs = {
  legacyId: string
  email?: string
  name?: string
}

async function ensureProfileOnSignInCore(ctx: Pick<MutationCtx, 'db'>, args: EnsureProfileOnSignInArgs) {
  const existing = await ctx.db
    .query('users')
    .withIndex('by_legacyId', (q) => q.eq('legacyId', args.legacyId))
    .unique()

  const normalized = normalizeEmail(args.email ?? existing?.email ?? null)
  const timestamp = nowMs()
  const name = args.name ?? existing?.name ?? null

  if (existing) {
    const emailChanged = normalized.email !== existing.email
    const emailLowerChanged = normalized.emailLower !== existing.emailLower
    const nameChanged = name !== existing.name

    if (emailChanged || emailLowerChanged || nameChanged) {
      await ctx.db.patch(existing._id, {
        email: normalized.email,
        emailLower: normalized.emailLower,
        name,
        updatedAtMs: timestamp,
      })
    }

    return {
      ok: true as const,
      created: false,
      legacyId: args.legacyId,
      role: existing.role,
      status: existing.status,
      agencyId: existing.agencyId ?? args.legacyId,
    }
  }

  const isFirstUser = (await ctx.db.query('users').first()) === null
  const role = isFirstUser ? 'admin' : DEFAULT_USER_ROLE
  const status = isFirstUser ? 'active' : DEFAULT_USER_STATUS
  const agencyId = args.legacyId

  await ctx.db.insert('users', {
    legacyId: args.legacyId,
    email: normalized.email,
    emailLower: normalized.emailLower,
    name,
    role,
    status,
    agencyId,
    phoneNumber: null,
    photoUrl: null,
    notificationPreferences: undefined,
    regionalPreferences: undefined,
    createdAtMs: timestamp,
    updatedAtMs: timestamp,
  })

  return {
    ok: true as const,
    created: true,
    legacyId: args.legacyId,
    role,
    status,
    agencyId,
  }
}

/** Sign-in bootstrap: creates/updates profile without requiring an active users row. */
export const ensureProfileOnSignIn = zRateLimitedIdentityMutation({
  rateLimit: 'sensitive',
  args: {
    legacyId: z.string(),
    email: z.string().optional(),
    name: z.string().optional(),
  },
  handler: async (ctx, args) => {
    if (ctx.legacyId !== args.legacyId) {
      throw Errors.auth.unauthorized()
    }

    return ensureProfileOnSignInCore(ctx, args)
  },
})

/**
 * Trusted bootstrap from POST /api/auth/bootstrap after Better Auth session is verified.
 * Does not require a Convex JWT (avoids token timing issues right after sign-in).
 */
export const ensureProfileOnSignInFromApp = mutation({
  args: {
    serverSecret: v.string(),
    legacyId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    assertAppProxySecret(args.serverSecret)
    return ensureProfileOnSignInCore(ctx, {
      legacyId: args.legacyId,
      email: args.email,
      name: args.name,
    })
  },
})

/** Admin / post-active bootstrap. Not for first sign-in (requires active users row). */
export const bootstrapUpsert = zRateLimitedAuthenticatedMutation({
  rateLimit: 'sensitive',
  args: {
    legacyId: z.string(),
    email: z.string().optional(),
    name: z.string().optional(),
    role: z.string().optional(),
    status: z.string().optional(),
    agencyId: z.string().optional(),
  },
  handler: async (ctx, args) => {
    if (ctx.legacyId !== args.legacyId) {
      throw Errors.auth.unauthorized()
    }

    const existing = await ctx.db
      .query('users')
      .withIndex('by_legacyId', (q) => q.eq('legacyId', args.legacyId))
      .unique()

    const normalized = normalizeEmail(args.email ?? existing?.email ?? null)
    const timestamp = nowMs()
    const role = existing?.role ?? DEFAULT_USER_ROLE
    const status = existing?.status ?? DEFAULT_USER_STATUS
    const agencyId = existing?.agencyId ?? args.legacyId
    const name = args.name ?? existing?.name ?? null

    const payload = {
      legacyId: args.legacyId,
      email: normalized.email,
      emailLower: normalized.emailLower,
      name,
      role,
      status,
      agencyId,
      phoneNumber: existing?.phoneNumber ?? null,
      photoUrl: existing?.photoUrl ?? null,
      notificationPreferences: existing?.notificationPreferences,
      regionalPreferences: existing?.regionalPreferences,
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

