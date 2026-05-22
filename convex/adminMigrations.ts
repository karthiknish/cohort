/**
 * Admin Migration Mutations
 *
 * One-time data migrations run by admins via script or dashboard.
 * Each migration is idempotent: safe to re-run, skips already-processed rows.
 */

import { v } from 'convex/values'
import { internalMutation } from './_generated/server'
import { adminMutation } from './functions'
import { resolveMetricCurrency } from '@/domain/ads/money'
import {
  buildAccountKey,
  normalizeAdsProviderId,
  normalizeSurfaceId,
} from '@/domain/ads/provider'
import {
  loadWorkspaceAdminMembers,
  mergeTeamMembersWithAdmins,
} from './clientAdminTeamSync'

// =============================================================================
// backfillAdMetricsCurrency
//
// Stamps `currency`, `currencySource`, and `surfaceId` on all adMetrics rows
// that predate the sync-worker stamping introduced in the ads domain refactor.
//
// Logic per row:
//   1. Skip rows where `currency` is already set (undefined = unstamped).
//   2. Look up the matching adIntegrations row by workspaceId + normalised
//      provider + account key to find the account currency.
//   3. Stamp `currencySource = 'integration'` when a match is found, else 'unknown'.
//   4. Derive `surfaceId` from the legacy `publisherPlatform` field.
//
// The mutation returns a cursor. Callers must loop until `done: true`:
//
//   let cursor = null
//   do {
//     const res = await convex.mutation(api.adminMigrations.backfillAdMetricsCurrency, { cursor })
//     cursor = res.data.nextCursor
//   } while (!res.data.done)
//
// =============================================================================

export const backfillAdMetricsCurrency = adminMutation({
  args: {
    /** Number of adMetrics rows to process per call (1–500, default 200). */
    batchSize: v.optional(v.number()),
    /** Pagination cursor from the previous call, or null/omitted for the first call. */
    cursor: v.optional(v.union(v.string(), v.null())),
  },
  returns: v.object({
    /** Number of rows fetched in this batch. */
    processed: v.number(),
    /** Number of rows patched (were unstamped). */
    patched: v.number(),
    /** True when the table has been fully scanned. */
    done: v.boolean(),
    /** Pass as `cursor` to the next call to continue. null when done. */
    nextCursor: v.union(v.string(), v.null()),
  }),
  handler: async (ctx, args) => {
    const batchSize = Math.min(Math.max(args.batchSize ?? 200, 1), 500)

    // Page through adMetrics in insertion order.
    const result = await ctx.db
      .query('adMetrics')
      .paginate({ numItems: batchSize, cursor: args.cursor ?? null })

    // Collect unique workspaceIds in this page to minimise integration queries.
    const workspaceIds = new Set(result.page.map((r) => r.workspaceId))

    // Per-workspace maps: accountKey → currency  and  providerKey → currency
    const wsAccountMap = new Map<string, Map<string, string>>()
    const wsProviderMap = new Map<string, Map<string, string>>()

    await Promise.all(
      [...workspaceIds].map(async (workspaceId) => {
        const integrations = await ctx.db
          .query('adIntegrations')
          .withIndex('by_workspace_provider', (q) => q.eq('workspaceId', workspaceId))
          .collect()

        const accountMap = new Map<string, string>()
        const providerMap = new Map<string, string>()

        for (const integration of integrations) {
          if (!integration.currency?.trim()) continue
          const key = buildAccountKey(integration.providerId, integration.accountId)
          const providerKey =
            normalizeAdsProviderId(integration.providerId) ??
            String(integration.providerId ?? '').trim().toLowerCase()
          accountMap.set(key, integration.currency)
          if (!providerMap.has(providerKey)) {
            providerMap.set(providerKey, integration.currency)
          }
        }

        wsAccountMap.set(workspaceId, accountMap)
        wsProviderMap.set(workspaceId, providerMap)
      }),
    )

    let patched = 0

    const rowsToPatch = result.page.filter((row) => row.currency === undefined)
    await Promise.all(
      rowsToPatch.map(async (row) => {
        const accountMap = wsAccountMap.get(row.workspaceId) ?? new Map<string, string>()
        const providerMap = wsProviderMap.get(row.workspaceId) ?? new Map<string, string>()

        // Resolve currency from integration data only (no metric-level currency for legacy rows).
        const integrationCurrency =
          accountMap.get(buildAccountKey(row.providerId, row.accountId)) ??
          providerMap.get(normalizeAdsProviderId(row.providerId) ?? '') ??
          null

        const resolved = resolveMetricCurrency({
          metricCurrency: null,
          integrationCurrency,
          providerDefaultCurrency: null,
        })

        // Derive surfaceId from the legacy publisherPlatform field.
        const surfaceId = normalizeSurfaceId(row.providerId, row.publisherPlatform ?? null)

        await ctx.db.patch(row._id, {
          currency: resolved.currency,
          currencySource: resolved.source,
          surfaceId,
        })
      }),
    )
    patched = rowsToPatch.length

    return {
      processed: result.page.length,
      patched,
      done: result.isDone,
      nextCursor: result.continueCursor,
    }
  },
})

// =============================================================================
// backfillClientAdminTeamMembers
//
// Adds every active workspace admin to each active client roster. Idempotent:
// skips clients that already include an admin by name (case-insensitive).
//
// Loop until `done: true` (admin session or CLI internal mutation):
//
//   let cursor = null
//   do {
//     const res = await convex.mutation(api.adminMigrations.backfillClientAdminTeamMembers, { cursor })
//     cursor = res.data.nextCursor
//   } while (!res.data.done)
//
// CLI (production deploy key):
//
//   npx convex run adminMigrations:backfillClientAdminTeamMembersInternal --prod --env-file .env.prod
//
// =============================================================================

type BackfillClientAdminTeamMembersArgs = {
  batchSize?: number
  cursor?: string | null
}

type BackfillClientAdminTeamMembersResult = {
  processed: number
  patched: number
  done: boolean
  nextCursor: string | null
}

async function backfillClientAdminTeamMembersBatch(
  ctx: { db: Parameters<typeof loadWorkspaceAdminMembers>[0]['db'] },
  args: BackfillClientAdminTeamMembersArgs,
  now: number,
): Promise<BackfillClientAdminTeamMembersResult> {
  const batchSize = Math.min(Math.max(args.batchSize ?? 50, 1), 200)

  const result = await ctx.db
    .query('clients')
    .withIndex('by_createdAtMs')
    .order('asc')
    .paginate({ numItems: batchSize, cursor: args.cursor ?? null })

  const adminMembersByWorkspace = new Map<string, Awaited<ReturnType<typeof loadWorkspaceAdminMembers>>>()
  let patched = 0

  for (const client of result.page) {
    if (client.deletedAtMs !== null) {
      continue
    }

    let adminMembers = adminMembersByWorkspace.get(client.workspaceId)
    if (!adminMembers) {
      adminMembers = await loadWorkspaceAdminMembers(ctx, client.workspaceId)
      adminMembersByWorkspace.set(client.workspaceId, adminMembers)
    }

    if (adminMembers.length === 0) {
      continue
    }

    const merged = mergeTeamMembersWithAdmins(client.teamMembers, adminMembers)
    if (merged.length === client.teamMembers.length) {
      continue
    }

    await ctx.db.patch(client._id, {
      teamMembers: merged,
      updatedAtMs: now,
    })
    patched += 1
  }

  return {
    processed: result.page.length,
    patched,
    done: result.isDone,
    nextCursor: result.continueCursor,
  }
}

export const backfillClientAdminTeamMembers = adminMutation({
  args: {
    batchSize: v.optional(v.number()),
    cursor: v.optional(v.union(v.string(), v.null())),
  },
  returns: v.object({
    processed: v.number(),
    patched: v.number(),
    done: v.boolean(),
    nextCursor: v.union(v.string(), v.null()),
  }),
  handler: async (ctx, args) => backfillClientAdminTeamMembersBatch(ctx, args, ctx.now),
})

export const backfillClientAdminTeamMembersInternal = internalMutation({
  args: {
    batchSize: v.optional(v.number()),
    cursor: v.optional(v.union(v.string(), v.null())),
  },
  returns: v.object({
    processed: v.number(),
    patched: v.number(),
    done: v.boolean(),
    nextCursor: v.union(v.string(), v.null()),
  }),
  handler: async (ctx, args) => backfillClientAdminTeamMembersBatch(ctx, args, Date.now()),
})
