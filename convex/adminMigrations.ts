/**
 * Admin Migration Mutations
 *
 * One-time data migrations run by admins via script or dashboard.
 * Each migration is idempotent: safe to re-run, skips already-processed rows.
 */

import { v } from 'convex/values'
import { adminMutation } from './functions'
import { resolveMetricCurrency } from '@/domain/ads/money'
import {
  buildAccountKey,
  normalizeAdsProviderId,
  normalizeSurfaceId,
} from '@/domain/ads/provider'

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

    for (const workspaceId of workspaceIds) {
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
    }

    let patched = 0

    for (const row of result.page) {
      // Skip rows already stamped (currency field present, even if null).
      if (row.currency !== undefined) continue

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

      patched++
    }

    return {
      processed: result.page.length,
      patched,
      done: result.isDone,
      nextCursor: result.continueCursor,
    }
  },
})
