/**
 * Canonical Money Model
 *
 * Defines the internal money contract for the ads insights domain.
 * Used by both src/* and convex/* — must remain pure (no browser APIs, no React, no Next.js).
 *
 * Rules:
 * - spend = billed ad spend in **native account currency**
 * - revenue = provider-reported conversion value in the same native currency
 * - financial metrics (ROAS, CPA, CPC) are only comparable inside a single-currency group
 * - delivery metrics (impressions, clicks, conversions) may aggregate across currencies
 */

// =============================================================================
// TYPES
// =============================================================================

/**
 * How a currency assignment was determined for a metric row.
 * Priority: metric-stamped > integration-level > unknown
 */
export type CurrencySource = 'metric' | 'integration' | 'unknown'

/**
 * A monetary amount with its currency and provenance.
 */
export type MoneyValue = {
  amount: number
  currency: string | null
  source: CurrencySource
}

/**
 * Whether financial metrics in a given set of rows are safe to aggregate.
 *
 * - single_currency: all rows share the same known currency — totals are valid
 * - mixed_currency: rows have different currencies — totals are not meaningful
 * - unknown_currency: no reliable currency info available
 */
export type FinancialComparability = 'single_currency' | 'mixed_currency' | 'unknown_currency'

// =============================================================================
// RESOLUTION
// =============================================================================

/**
 * Resolve the currency for a single metric row.
 *
 * Priority order:
 * 1. currency stamped directly on the metric row (source = 'metric')
 * 2. integration-level account currency (source = 'integration')
 * 3. provider-default currency from integration (source = 'integration')
 * 4. unknown (source = 'unknown')
 */
export function resolveMetricCurrency(options: {
  metricCurrency: string | null | undefined
  integrationCurrency: string | null | undefined
  providerDefaultCurrency: string | null | undefined
}): { currency: string | null; source: CurrencySource } {
  const { metricCurrency, integrationCurrency, providerDefaultCurrency } = options

  const metricC = cleanCurrency(metricCurrency)
  if (metricC) return { currency: metricC, source: 'metric' }

  const integrationC = cleanCurrency(integrationCurrency)
  if (integrationC) return { currency: integrationC, source: 'integration' }

  const defaultC = cleanCurrency(providerDefaultCurrency)
  if (defaultC) return { currency: defaultC, source: 'integration' }

  return { currency: null, source: 'unknown' }
}

/**
 * Determine financial comparability across a collection of currency labels.
 *
 * null / undefined entries are treated as "unknown" (legacy rows written before currency
 * stamping was introduced). Unknown rows do NOT make comparability non-single — only
 * rows with genuinely DIFFERENT known currencies do.
 *
 * - single_currency: all known rows share the same currency (unknowns assumed same)
 * - mixed_currency: known rows have two or more distinct currencies
 * - unknown_currency: no known currency in the set at all
 */
export function assessComparability(
  currencies: Array<string | null | undefined>,
): FinancialComparability {
  const unique = new Set<string>()

  for (const c of currencies) {
    const cleaned = cleanCurrency(c)
    if (cleaned) unique.add(cleaned)
  }

  if (unique.size === 0) return 'unknown_currency'
  if (unique.size > 1) return 'mixed_currency'
  // unique.size === 1: all identified rows share one currency.
  // Unknown/null rows are treated as the same currency (legacy unstamped data).
  return 'single_currency'
}

// =============================================================================
// HELPERS
// =============================================================================

/** Upper-case and trim a currency code. Returns null for empty/non-string. */
export function cleanCurrency(value: string | null | undefined): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim().toUpperCase()
  return trimmed.length > 0 ? trimmed : null
}
