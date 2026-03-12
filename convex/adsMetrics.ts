import { query } from './_generated/server'
import { workspaceQuery } from './functions'
import { v } from 'convex/values'
import { resolveMetricCurrency, assessComparability } from '@/domain/ads/money'
import { normalizeAdsProviderId, normalizeAdsAccountId, buildAccountKey, normalizeSurfaceId } from '@/domain/ads/provider'

const creativeValidator = v.object({
  spend: v.optional(v.number()),
  impressions: v.optional(v.number()),
  clicks: v.optional(v.number()),
  conversions: v.optional(v.number()),
  revenue: v.optional(v.number()),
  url: v.optional(v.union(v.string(), v.null())),
  type: v.string(),
  id: v.string(),
  name: v.string(),
})

const metricValidator = v.object({
  providerId: v.union(v.string(), v.null()),
  clientId: v.union(v.string(), v.null()),
  accountId: v.union(v.string(), v.null()),
  currency: v.union(v.string(), v.null()),
  publisherPlatform: v.union(v.string(), v.null()),
  date: v.string(),
  spend: v.number(),
  impressions: v.number(),
  clicks: v.number(),
  conversions: v.number(),
  revenue: v.union(v.number(), v.null()),
  campaignId: v.union(v.string(), v.null()),
  campaignName: v.union(v.string(), v.null()),
  creatives: v.union(v.array(creativeValidator), v.null()),
  createdAtMs: v.union(v.number(), v.null()),
})

const derivedMetricValidator = v.object({
  date: v.string(),
  spend: v.number(),
  impressions: v.number(),
  clicks: v.number(),
  conversions: v.number(),
  revenue: v.number(),
  cpc: v.number(),
  ctr: v.number(),
  roas: v.number(),
  cpa: v.number(),
})

const enrichedMetricValidator = v.object({
  id: v.string(),
  providerId: v.string(),
  accountId: v.union(v.string(), v.null()),
  currency: v.union(v.string(), v.null()),
  publisherPlatform: v.union(v.string(), v.null()),
  date: v.string(),
  spend: v.number(),
  impressions: v.number(),
  clicks: v.number(),
  conversions: v.number(),
  revenue: v.union(v.number(), v.null()),
  createdAtMs: v.union(v.number(), v.null()),
  clientId: v.union(v.string(), v.null()),
  campaignId: v.union(v.string(), v.null()),
  campaignName: v.union(v.string(), v.null()),
})

const summaryValidator = v.object({
  totals: v.object({
    spend: v.number(),
    impressions: v.number(),
    clicks: v.number(),
    conversions: v.number(),
    revenue: v.number(),
  }),
  providers: v.record(
    v.string(),
    v.object({
      spend: v.number(),
      impressions: v.number(),
      clicks: v.number(),
      conversions: v.number(),
      revenue: v.number(),
    })
  ),
  count: v.number(),
})

export const listMetrics = workspaceQuery({
  args: {
    clientId: v.optional(v.union(v.string(), v.null())),
    providerIds: v.optional(v.array(v.string())),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  returns: v.array(metricValidator),
  handler: async (ctx, args) => {
    const limit = Math.min(Math.max(args.limit ?? 500, 1), 2000)

    const all = await ctx.db
      .query('adMetrics')
      .withIndex('by_workspace_date', (q) => q.eq('workspaceId', args.workspaceId))
      .collect()

    const providerSet = args.providerIds ? new Set(args.providerIds) : null
    const clientId = typeof args.clientId === 'string' ? args.clientId : null
    const integrations = await ctx.db
      .query('adIntegrations')
      .withIndex('by_workspace_provider', (q) => q.eq('workspaceId', args.workspaceId))
      .collect()

    const accountCurrencyMap = new Map<string, string>()
    const providerDefaultCurrencyMap = new Map<string, string>()
    integrations.forEach((integration) => {
      if (!integration.currency || integration.currency.trim().length === 0) return
      const key = buildAccountKey(integration.providerId, integration.accountId)
      const providerKey = normalizeAdsProviderId(integration.providerId) ?? String(integration.providerId ?? '').trim().toLowerCase()
      accountCurrencyMap.set(key, integration.currency)
      if (!providerDefaultCurrencyMap.has(providerKey)) {
        providerDefaultCurrencyMap.set(providerKey, integration.currency)
      }
    })

    const filtered = all.filter((row) => {
      if (clientId !== null && row.clientId !== clientId) return false
      if (providerSet && !providerSet.has(row.providerId)) return false
      if (args.startDate && row.date < args.startDate) return false
      if (args.endDate && row.date > args.endDate) return false
      return true
    })

    filtered.sort((a, b) => {
      if (a.date !== b.date) return a.date < b.date ? 1 : -1
      return b.createdAtMs - a.createdAtMs
    })

    return filtered.slice(0, limit).map((row) => ({
      currency:
        accountCurrencyMap.get(buildAccountKey(row.providerId, row.accountId)) ??
        providerDefaultCurrencyMap.get(normalizeAdsProviderId(row.providerId) ?? '') ??
        null,
      providerId: row.providerId,
      clientId: row.clientId,
      accountId: row.accountId,
      publisherPlatform: row.publisherPlatform ?? null,
      date: row.date,
      spend: row.spend,
      impressions: row.impressions,
      clicks: row.clicks,
      conversions: row.conversions,
      revenue: row.revenue,
      campaignId: row.campaignId,
      campaignName: row.campaignName,
      creatives: row.creatives,
      createdAtMs: row.createdAtMs,
    }))
  },
})

/**
 * Fetches recent metrics for alert evaluation (no auth - server-side use).
 * Filters by workspaceId and clientId, returns in chronological order.
 */
export const listRecentForAlerts = query({
  args: {
    workspaceId: v.string(),
    clientId: v.string(),
    limit: v.optional(v.number()),
  },
  returns: v.array(derivedMetricValidator),
  handler: async (ctx, args) => {
    // No auth required - called from server-side alert processor
    const limit = Math.min(Math.max(args.limit ?? 30, 1), 100)

    const all = await ctx.db
      .query('adMetrics')
      .withIndex('by_workspace_date', (q) => q.eq('workspaceId', args.workspaceId))
      .collect()

    // Filter by clientId
    const filtered = all.filter((row) => row.clientId === args.clientId)

    // Sort by date descending (newest first) for limiting
    filtered.sort((a, b) => {
      if (a.date !== b.date) return a.date < b.date ? 1 : -1
      return b.createdAtMs - a.createdAtMs
    })

    // Take limit then reverse to get chronological order
    const limited = filtered.slice(0, limit)
    limited.reverse()

    return limited.map((row) => ({
      date: row.date,
      spend: Number(row.spend || 0),
      impressions: Number(row.impressions || 0),
      clicks: Number(row.clicks || 0),
      conversions: Number(row.conversions || 0),
      revenue: Number(row.revenue || 0),
      // Calculate derived metrics
      cpc: row.clicks > 0 ? Number(row.spend || 0) / row.clicks : 0,
      ctr: row.impressions > 0 ? (row.clicks / row.impressions) * 100 : 0,
      roas: Number(row.spend || 0) > 0 ? Number(row.revenue || 0) / Number(row.spend || 0) : 0,
      cpa: row.conversions > 0 ? Number(row.spend || 0) / row.conversions : 0,
    }))
  },
})

export const listMetricsWithSummary = workspaceQuery({
  args: {
    clientId: v.optional(v.union(v.string(), v.null())),
    clientIds: v.optional(v.array(v.string())),
    providerIds: v.optional(v.array(v.string())),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
    limit: v.optional(v.number()),
    aggregate: v.optional(v.boolean()),
  },
  returns: v.object({
    metrics: v.array(enrichedMetricValidator),
    nextCursor: v.union(v.string(), v.null()),
    summary: v.union(v.null(), summaryValidator),
  }),
  handler: async (ctx, args) => {
    const shouldAggregate = args.aggregate === true
    const pageSize = Math.min(Math.max(args.limit ?? 100, 1), 500)
    const fetchLimit = shouldAggregate ? 3000 : pageSize

    const all = await ctx.db
      .query('adMetrics')
      .withIndex('by_workspace_date', (q) => q.eq('workspaceId', args.workspaceId))
      .collect()
    const integrations = await ctx.db
      .query('adIntegrations')
      .withIndex('by_workspace_provider', (q) => q.eq('workspaceId', args.workspaceId))
      .collect()

    const accountCurrencyMap = new Map<string, string>()
    const providerDefaultCurrencyMap = new Map<string, string>()
    integrations.forEach((integration) => {
      if (!integration.currency || integration.currency.trim().length === 0) return
      const key = buildAccountKey(integration.providerId, integration.accountId)
      const providerKey = normalizeAdsProviderId(integration.providerId) ?? String(integration.providerId ?? '').trim().toLowerCase()
      accountCurrencyMap.set(key, integration.currency)
      if (!providerDefaultCurrencyMap.has(providerKey)) {
        providerDefaultCurrencyMap.set(providerKey, integration.currency)
      }
    })

    const providerSet = args.providerIds ? new Set(args.providerIds) : null
    const clientId = typeof args.clientId === 'string' ? args.clientId : null
    const clientIdsSet = args.clientIds && args.clientIds.length > 0 ? new Set(args.clientIds) : null

    const filtered = all.filter((row) => {
      // Single clientId filter takes precedence
      if (clientId !== null && row.clientId !== clientId) return false
      // Multiple clientIds filter (if single clientId not provided)
      if (clientId === null && clientIdsSet && row.clientId && !clientIdsSet.has(row.clientId)) return false
      if (providerSet && !providerSet.has(row.providerId)) return false
      if (args.startDate && row.date < args.startDate) return false
      if (args.endDate && row.date > args.endDate) return false
      return true
    })

    // Sort by date (newest first), then by createdAtMs (newest first)
    filtered.sort((a, b) => {
      if (a.date !== b.date) return a.date < b.date ? 1 : -1
      return b.createdAtMs - a.createdAtMs
    })

    // Map to output format with generated ID
    const mapped = filtered.slice(0, fetchLimit).map((row) => ({
      id: `${row.providerId ?? 'unknown'}|${row.accountId ?? ''}|${row.date ?? ''}|${row.createdAtMs ?? ''}`,
      providerId: row.providerId ?? 'unknown',
      accountId: row.accountId ?? null,
      currency:
        accountCurrencyMap.get(buildAccountKey(row.providerId, row.accountId)) ??
        providerDefaultCurrencyMap.get(normalizeAdsProviderId(row.providerId) ?? '') ??
        null,
      publisherPlatform: row.publisherPlatform ?? null,
      date: row.date ?? 'unknown',
      spend: Number(row.spend ?? 0),
      impressions: Number(row.impressions ?? 0),
      clicks: Number(row.clicks ?? 0),
      conversions: Number(row.conversions ?? 0),
      revenue: row.revenue !== undefined ? Number(row.revenue) : null,
      createdAtMs: row.createdAtMs ?? null,
      clientId: row.clientId ?? null,
      campaignId: row.campaignId ?? null,
      campaignName: row.campaignName ?? null,
    }))

    if (!shouldAggregate) {
      return {
        metrics: mapped.slice(0, pageSize),
        nextCursor: null,
        summary: null,
      }
    }

    // Aggregation: deduplicate by providerId|accountId|publisherPlatform|date, keeping newest.
    // publisherPlatform must be included because Meta returns one row per platform breakdown
    // (facebook, instagram, audience_network) per day — collapsing on date alone would drop spend.
    const uniqueMetrics = new Map<string, (typeof mapped)[0] & { createdAtMillis: number }>()
    mapped.forEach((m) => {
      // Include campaignId in the dedup key so that multiple campaigns for the
      // same (provider, account, platform, date) are each kept and summed into
      // the totals. Without campaignId, multi-campaign rows collapse to one,
      // making total spend appear as a single campaign's spend.
      const key = `${m.providerId}|${m.accountId ?? ''}|${m.publisherPlatform ?? ''}|${m.campaignId ?? ''}|${m.date}`
      const existing = uniqueMetrics.get(key)
      const createdAtMillis = m.createdAtMs ?? 0
      const existingCreatedAt = existing?.createdAtMillis ?? 0

      if (!existing || createdAtMillis > existingCreatedAt) {
        uniqueMetrics.set(key, { ...m, createdAtMillis })
      }
    })

    // Calculate totals
    const totals = { spend: 0, impressions: 0, clicks: 0, conversions: 0, revenue: 0 }
    const providers: Record<string, typeof totals> = {}

    uniqueMetrics.forEach((m) => {
      const pId = m.providerId || 'unknown'
      if (!providers[pId]) {
        providers[pId] = { spend: 0, impressions: 0, clicks: 0, conversions: 0, revenue: 0 }
      }

      const p = providers[pId]
      p.spend += Number(m.spend || 0)
      p.impressions += Number(m.impressions || 0)
      p.clicks += Number(m.clicks || 0)
      p.conversions += Number(m.conversions || 0)
      p.revenue += Number(m.revenue || 0)

      totals.spend += Number(m.spend || 0)
      totals.impressions += Number(m.impressions || 0)
      totals.clicks += Number(m.clicks || 0)
      totals.conversions += Number(m.conversions || 0)
      totals.revenue += Number(m.revenue || 0)
    })

    return {
      metrics: mapped.slice(0, pageSize),
      nextCursor: null,
      summary: {
        totals,
        providers,
        count: uniqueMetrics.size,
      },
    }
  },
})

// =============================================================================
// V2 READ MODEL — Currency-Aware Insights Summary
// =============================================================================

const v2DeliveryTotalsValidator = v.object({
  impressions: v.number(),
  clicks: v.number(),
  conversions: v.number(),
})

const v2FinancialTotalsValidator = v.object({
  comparability: v.union(
    v.literal('single_currency'),
    v.literal('mixed_currency'),
    v.literal('unknown_currency'),
  ),
  totalsByCurrency: v.record(
    v.string(),
    v.object({ spend: v.number(), revenue: v.number() }),
  ),
  primaryCurrency: v.union(v.string(), v.null()),
  spend: v.union(v.number(), v.null()),
  revenue: v.union(v.number(), v.null()),
})

const v2ProviderSummaryValidator = v.object({
  providerId: v.string(),
  accountIds: v.array(v.string()),
  currencies: v.array(v.string()),
  deliveryTotals: v2DeliveryTotalsValidator,
  financialTotals: v2FinancialTotalsValidator,
})

const v2InsightsSummaryValidator = v.object({
  deliveryTotals: v2DeliveryTotalsValidator,
  financialTotals: v2FinancialTotalsValidator,
  providers: v.array(v2ProviderSummaryValidator),
  warnings: v.array(v.string()),
  count: v.number(),
})

const v2EnrichedMetricValidator = v.object({
  id: v.string(),
  providerId: v.string(),
  accountId: v.union(v.string(), v.null()),
  currency: v.union(v.string(), v.null()),
  currencySource: v.union(
    v.literal('metric'),
    v.literal('integration'),
    v.literal('unknown'),
  ),
  surfaceId: v.union(v.string(), v.null()),
  publisherPlatform: v.union(v.string(), v.null()),
  date: v.string(),
  spend: v.number(),
  impressions: v.number(),
  clicks: v.number(),
  conversions: v.number(),
  revenue: v.union(v.number(), v.null()),
  createdAtMs: v.union(v.number(), v.null()),
  clientId: v.union(v.string(), v.null()),
  campaignId: v.union(v.string(), v.null()),
  campaignName: v.union(v.string(), v.null()),
})

/**
 * V2 read model: returns a currency-aware insights summary alongside paginated metrics.
 *
 * Financial totals are only presented as a single value when all rows share the same
 * known currency (comparability === 'single_currency').  Mixed-currency selections
 * get per-currency breakdowns and a 'mixed_currency' signal instead of silent summation.
 *
 * Delivery metrics (impressions, clicks, conversions) aggregate freely across currencies.
 */
export const listMetricsWithSummaryV2 = workspaceQuery({
  args: {
    clientId: v.optional(v.union(v.string(), v.null())),
    clientIds: v.optional(v.array(v.string())),
    providerIds: v.optional(v.array(v.string())),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
    limit: v.optional(v.number()),
    aggregate: v.optional(v.boolean()),
  },
  returns: v.object({
    metrics: v.array(v2EnrichedMetricValidator),
    nextCursor: v.union(v.string(), v.null()),
    summary: v.union(v.null(), v2InsightsSummaryValidator),
  }),
  handler: async (ctx, args) => {
    const shouldAggregate = args.aggregate === true
    const pageSize = Math.min(Math.max(args.limit ?? 100, 1), 500)
    const fetchLimit = shouldAggregate ? 3000 : pageSize

    const all = await ctx.db
      .query('adMetrics')
      .withIndex('by_workspace_date', (q) => q.eq('workspaceId', args.workspaceId))
      .collect()

    // Build currency lookup from integrations for rows that were written before
    // the currency stamping was introduced (backfill / legacy rows).
    const integrations = await ctx.db
      .query('adIntegrations')
      .withIndex('by_workspace_provider', (q) => q.eq('workspaceId', args.workspaceId))
      .collect()

    // accountKey → currency, providerKey → default currency
    const accountCurrencyMap = new Map<string, string>()
    const providerDefaultCurrencyMap = new Map<string, string>()

    integrations.forEach((integration) => {
      if (!integration.currency || integration.currency.trim().length === 0) return
      const canonical = normalizeAdsProviderId(integration.providerId)
      if (!canonical) return
      const key = buildAccountKey(canonical, integration.accountId)
      accountCurrencyMap.set(key, integration.currency.trim().toUpperCase())
      if (!providerDefaultCurrencyMap.has(canonical)) {
        providerDefaultCurrencyMap.set(canonical, integration.currency.trim().toUpperCase())
      }
    })

    // Filtering
    const providerSet = args.providerIds ? new Set(args.providerIds) : null
    const clientId = typeof args.clientId === 'string' ? args.clientId : null
    const clientIdsSet =
      args.clientIds && args.clientIds.length > 0 ? new Set(args.clientIds) : null

    const filtered = all.filter((row) => {
      if (clientId !== null && row.clientId !== clientId) return false
      if (clientId === null && clientIdsSet && row.clientId && !clientIdsSet.has(row.clientId)) return false
      if (providerSet && !providerSet.has(row.providerId)) return false
      if (args.startDate && row.date < args.startDate) return false
      if (args.endDate && row.date > args.endDate) return false
      return true
    })

    filtered.sort((a, b) => {
      if (a.date !== b.date) return a.date < b.date ? 1 : -1
      return b.createdAtMs - a.createdAtMs
    })

    // Map rows to V2 enriched metric format, resolving currency at read time for legacy rows.
    const mapped = filtered.slice(0, fetchLimit).map((row) => {
      const canonical = normalizeAdsProviderId(row.providerId)

      // Currency resolution priority:
      // 1. Stamped at write time (row.currency / row.currencySource from sync worker)
      // 2. Integration account-level lookup (for rows written before stamping)
      // 3. Provider-default from integration
      const rowCurrency =
        typeof row.currency === 'string' && row.currency.trim().length > 0
          ? row.currency.trim().toUpperCase()
          : null
      const rowCurrencySource = row.currencySource ?? null

      let resolvedCurrency: string | null
      let resolvedSource: 'metric' | 'integration' | 'unknown'

      if (rowCurrency && rowCurrencySource) {
        // Already stamped
        resolvedCurrency = rowCurrency
        resolvedSource = rowCurrencySource as 'metric' | 'integration' | 'unknown'
      } else if (rowCurrency) {
        // Has currency but no source tag — treat as integration-stamped
        resolvedCurrency = rowCurrency
        resolvedSource = 'integration'
      } else if (canonical) {
        // Legacy row: resolve from integration maps
        const accKey = buildAccountKey(canonical, row.accountId)
        const fallback = resolveMetricCurrency({
          metricCurrency: null,
          integrationCurrency: accountCurrencyMap.get(accKey) ?? null,
          providerDefaultCurrency: providerDefaultCurrencyMap.get(canonical) ?? null,
        })
        resolvedCurrency = fallback.currency
        resolvedSource = fallback.source
      } else {
        resolvedCurrency = null
        resolvedSource = 'unknown'
      }

      // Canonical surface id
      const rawSurface = row.surfaceId ?? row.publisherPlatform ?? null
      const surfaceId = canonical ? normalizeSurfaceId(canonical, rawSurface) : rawSurface

      return {
        id: `${row.providerId ?? 'unknown'}|${row.accountId ?? ''}|${row.date ?? ''}|${row.createdAtMs ?? ''}`,
        providerId: canonical ?? row.providerId ?? 'unknown',
        accountId: row.accountId ?? null,
        currency: resolvedCurrency,
        currencySource: resolvedSource,
        surfaceId: surfaceId ?? null,
        publisherPlatform: row.publisherPlatform ?? null,
        date: row.date ?? 'unknown',
        spend: Number(row.spend ?? 0),
        impressions: Number(row.impressions ?? 0),
        clicks: Number(row.clicks ?? 0),
        conversions: Number(row.conversions ?? 0),
        revenue: row.revenue !== undefined ? Number(row.revenue) : null,
        createdAtMs: row.createdAtMs ?? null,
        clientId: row.clientId ?? null,
        campaignId: row.campaignId ?? null,
        campaignName: row.campaignName ?? null,
      }
    })

    if (!shouldAggregate) {
      return { metrics: mapped.slice(0, pageSize), nextCursor: null, summary: null }
    }

    // Deduplicate by canonical key: provider|account|surfaceId|campaignId|date
    // Keep the newest row per key (highest createdAtMs).
    const uniqueMetrics = new Map<
      string,
      (typeof mapped)[0] & { _createdAtMs: number }
    >()
    mapped.forEach((m) => {
      const key = `${m.providerId}|${m.accountId ?? ''}|${m.surfaceId ?? ''}|${m.campaignId ?? ''}|${m.date}`
      const existing = uniqueMetrics.get(key)
      const ts = m.createdAtMs ?? 0
      if (!existing || ts > existing._createdAtMs) {
        uniqueMetrics.set(key, { ...m, _createdAtMs: ts })
      }
    })

    // -----------------------------------------------------------------------
    // Build per-provider aggregations
    // -----------------------------------------------------------------------
    type ProviderAgg = {
      accountIds: Set<string>
      currencies: Set<string>
      delivery: { impressions: number; clicks: number; conversions: number }
      byCurrency: Record<string, { spend: number; revenue: number }>
      currencyList: Array<string | null>
    }
    const providerAggs = new Map<string, ProviderAgg>()

    uniqueMetrics.forEach((m) => {
      const pId = m.providerId
      const agg: ProviderAgg = providerAggs.get(pId) ?? {
        accountIds: new Set(),
        currencies: new Set(),
        delivery: { impressions: 0, clicks: 0, conversions: 0 },
        byCurrency: {},
        currencyList: [],
      }

      if (m.accountId) agg.accountIds.add(m.accountId)
      if (m.currency) agg.currencies.add(m.currency)
      agg.currencyList.push(m.currency)

      agg.delivery.impressions += m.impressions
      agg.delivery.clicks += m.clicks
      agg.delivery.conversions += m.conversions

      const curr = m.currency ?? '__unknown__'
      const bucket = agg.byCurrency[curr] ?? { spend: 0, revenue: 0 }
      bucket.spend += m.spend
      bucket.revenue += m.revenue ?? 0
      agg.byCurrency[curr] = bucket

      providerAggs.set(pId, agg)
    })

    // -----------------------------------------------------------------------
    // Build top-level delivery and financial totals
    // -----------------------------------------------------------------------
    const globalDelivery = { impressions: 0, clicks: 0, conversions: 0 }
    const globalByCurrency: Record<string, { spend: number; revenue: number }> = {}
    const allCurrencies: Array<string | null> = []
    const warnings: string[] = []

    const providerSummaries: Array<{
      providerId: string
      accountIds: string[]
      currencies: string[]
      deliveryTotals: { impressions: number; clicks: number; conversions: number }
      financialTotals: {
        comparability: 'single_currency' | 'mixed_currency' | 'unknown_currency'
        totalsByCurrency: Record<string, { spend: number; revenue: number }>
        primaryCurrency: string | null
        spend: number | null
        revenue: number | null
      }
    }> = []

    providerAggs.forEach((agg, providerId) => {
      globalDelivery.impressions += agg.delivery.impressions
      globalDelivery.clicks += agg.delivery.clicks
      globalDelivery.conversions += agg.delivery.conversions

      allCurrencies.push(...agg.currencyList)

      // Merge per-currency buckets into global map (keyed without '__unknown__')
      Object.entries(agg.byCurrency).forEach(([curr, totals]) => {
        const key = curr === '__unknown__' ? '?' : curr
        const g = globalByCurrency[key] ?? { spend: 0, revenue: 0 }
        g.spend += totals.spend
        g.revenue += totals.revenue
        globalByCurrency[key] = g
      })

      const providerComparability = assessComparability(agg.currencyList)
      const visibleByCurrency = Object.fromEntries(
        Object.entries(agg.byCurrency).filter(([k]) => k !== '__unknown__'),
      )
      const currencies = Array.from(agg.currencies)
      const primaryCurrency: string | null = currencies.length === 1 ? (currencies[0] ?? null) : null

      if (providerComparability === 'mixed_currency') {
        warnings.push(
          `Provider '${providerId}' has mixed currencies (${currencies.join(', ')}). Financial totals are shown per-currency.`,
        )
      }
      if (providerComparability === 'unknown_currency') {
        warnings.push(
          `Provider '${providerId}' has rows without known currency. Financial totals are unavailable.`,
        )
      }

      providerSummaries.push({
        providerId,
        accountIds: Array.from(agg.accountIds),
        currencies,
        deliveryTotals: agg.delivery,
        financialTotals: {
          comparability: providerComparability,
          totalsByCurrency: visibleByCurrency,
          primaryCurrency,
          spend: providerComparability === 'single_currency' ? (visibleByCurrency[primaryCurrency!]?.spend ?? 0) : null,
          revenue: providerComparability === 'single_currency' ? (visibleByCurrency[primaryCurrency!]?.revenue ?? 0) : null,
        },
      })
    })

    const globalComparability = assessComparability(allCurrencies)
    const globalCurrencies = Array.from(
      new Set(allCurrencies.filter((c): c is string => c !== null)),
    )
    const globalPrimaryCurrency: string | null = globalCurrencies.length === 1 ? (globalCurrencies[0] ?? null) : null

    if (globalComparability === 'mixed_currency' && globalCurrencies.length > 1) {
      warnings.push(
        `Multiple currencies detected (${globalCurrencies.join(', ')}). Aggregate spend and revenue are not shown.`,
      )
    }

    const globalVisibleByCurrency = Object.fromEntries(
      Object.entries(globalByCurrency).filter(([k]) => k !== '?'),
    )

    const summary = {
      deliveryTotals: globalDelivery,
      financialTotals: {
        comparability: globalComparability,
        totalsByCurrency: globalVisibleByCurrency,
        primaryCurrency: globalPrimaryCurrency,
        spend:
          globalComparability === 'single_currency'
            ? (globalVisibleByCurrency[globalPrimaryCurrency!]?.spend ?? 0)
            : null,
        revenue:
          globalComparability === 'single_currency'
            ? (globalVisibleByCurrency[globalPrimaryCurrency!]?.revenue ?? 0)
            : null,
      },
      providers: providerSummaries,
      warnings,
      count: uniqueMetrics.size,
    }

    return {
      metrics: mapped.slice(0, pageSize),
      nextCursor: null,
      summary,
    }
  },
})

