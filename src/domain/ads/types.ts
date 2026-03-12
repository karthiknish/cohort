/**
 * Canonical Ads Insights Domain Types
 *
 * Shared contracts used by both src/* UI layer and convex/* query layer.
 * All financial types encode currency comparability so UI can make safe display decisions.
 */

export type { CanonicalAdsProviderId } from './provider'
export type { MoneyValue, FinancialComparability, CurrencySource } from './money'

// =============================================================================
// SURFACE / PLACEMENT
// =============================================================================

/**
 * Canonical cross-platform "where this ran" identifier.
 * Examples: 'facebook', 'instagram', 'audience_network', 'messenger'
 * publisherPlatform is the legacy alias — surfaceId is the canonical field going forward.
 */
export type SurfaceId = string

// =============================================================================
// METRIC
// =============================================================================

import type { CurrencySource } from './money'

/**
 * A fully-resolved ad metric row with canonical provider, account, currency, and surface identity.
 */
export type NormalizedAdMetric = {
  id: string
  providerId: string
  accountId: string | null
  /** Native account currency for this metric row. */
  currency: string | null
  /** How the currency value was determined. */
  currencySource: CurrencySource
  /** Canonical surface id (e.g. 'facebook', 'instagram', 'audience_network'). */
  surfaceId: string | null
  /** Legacy alias: kept for backward compat. Mirrors surfaceId when originating from Meta. */
  publisherPlatform: string | null
  campaignId: string | null
  date: string
  spend: number
  impressions: number
  clicks: number
  conversions: number
  revenue: number | null
  createdAt: string | null
}

// =============================================================================
// AGGREGATION CONTRACTS
// =============================================================================

/** Delivery metrics that are safe to aggregate across currencies. */
export type DeliveryTotals = {
  impressions: number
  clicks: number
  conversions: number
}

import type { FinancialComparability } from './money'

/**
 * Currency-aware financial totals.
 * Consumers must check `comparability` before displaying aggregate spend/revenue/ROAS/CPA.
 */
export type FinancialTotals = {
  comparability: FinancialComparability
  /**
   * Per-currency spend and revenue breakdowns.
   * Always populated regardless of comparability — use this for mixed-currency display.
   */
  totalsByCurrency: Record<string, { spend: number; revenue: number }>
  /**
   * Set only when comparability === 'single_currency'.
   * The shared currency code for all rows in this group.
   */
  primaryCurrency: string | null
  /**
   * Set only when comparability === 'single_currency'.
   * Aggregate spend across all rows.
   */
  spend: number | null
  /**
   * Set only when comparability === 'single_currency'.
   * Aggregate revenue across all rows (null if not reported).
   */
  revenue: number | null
}

// =============================================================================
// SUMMARY CONTRACTS
// =============================================================================

/** Per-provider summary within an AdsInsightsSummary. */
export type ProviderInsightsSummary = {
  providerId: string
  accountIds: string[]
  /** All distinct currency codes seen for this provider's rows. */
  currencies: string[]
  deliveryTotals: DeliveryTotals
  financialTotals: FinancialTotals
}

/**
 * Top-level currency-aware summary returned by the V2 read model.
 * Replaces the previous flat numeric summary contract.
 */
export type AdsInsightsSummary = {
  deliveryTotals: DeliveryTotals
  financialTotals: FinancialTotals
  providers: ProviderInsightsSummary[]
  /** Human-readable warnings about mixed currencies, unknown currencies, etc. */
  warnings: string[]
  count: number
}

// =============================================================================
// INTEGRATION / CURRENCY RESOLUTION
// =============================================================================

/** Result of currency resolution for a single metric row. */
export type CurrencyResolution = {
  currency: string | null
  source: CurrencySource
}
