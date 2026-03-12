/**
 * Canonical Ads Provider Identity Layer
 *
 * Owns all provider alias resolution and account ID normalization.
 * Used by both src/* and convex/* — must remain pure (no browser APIs, no React, no Next.js).
 *
 * Rule: no page, hook, component, or Convex query may inline provider alias handling.
 * Use normalizeAdsProviderId() everywhere instead.
 */

// =============================================================================
// TYPES
// =============================================================================

/**
 * The four canonical ad provider identifiers used in this repository.
 * 'facebook' is the canonical id for Meta Ads (not 'meta').
 */
export type CanonicalAdsProviderId = 'google' | 'facebook' | 'linkedin' | 'tiktok'

// =============================================================================
// CONSTANTS
// =============================================================================

const CANONICAL_IDS = new Set<string>(['google', 'facebook', 'linkedin', 'tiktok'])

/**
 * All known provider aliases → canonical id.
 * google-analytics variants are intentionally excluded: GA is not an ads provider.
 */
const PROVIDER_ALIASES: Record<string, CanonicalAdsProviderId> = {
  google_ads: 'google',
  'google-ads': 'google',
  googleads: 'google',
  adwords: 'google',
  // Meta / Facebook
  meta: 'facebook',
  meta_ads: 'facebook',
  'meta-ads': 'facebook',
  metaads: 'facebook',
  facebook_ads: 'facebook',
  'facebook-ads': 'facebook',
  // LinkedIn
  linkedin_ads: 'linkedin',
  'linkedin-ads': 'linkedin',
  // TikTok
  tiktok_ads: 'tiktok',
  'tiktok-ads': 'tiktok',
}

/**
 * Non-ads provider aliases that must NOT be resolved to an ads provider id.
 * These strings map to google-analytics in the theme layer but are not ad networks.
 */
const NON_ADS_ALIASES = new Set([
  'google_analytics',
  'google-analytics',
  'googleanalytics',
  'ga',
  'ga4',
])

// =============================================================================
// NORMALIZATION
// =============================================================================

/**
 * Canonicalize a raw provider string to a CanonicalAdsProviderId.
 * Returns null for unknown or non-ads providers (e.g. google-analytics).
 */
export function normalizeAdsProviderId(
  raw: string | null | undefined,
): CanonicalAdsProviderId | null {
  const normalized = String(raw ?? '').trim().toLowerCase()
  if (!normalized || NON_ADS_ALIASES.has(normalized)) return null
  if (CANONICAL_IDS.has(normalized)) return normalized as CanonicalAdsProviderId
  return PROVIDER_ALIASES[normalized] ?? null
}

/**
 * Returns true when raw resolves to a known ads provider.
 */
export function isCanonicalAdsProvider(
  raw: string | null | undefined,
): raw is CanonicalAdsProviderId {
  return normalizeAdsProviderId(raw) !== null
}

/**
 * Normalize a raw ad account ID to a stable comparable form.
 *
 * - Meta: strips `act_` prefix (act_123 → 123) and lowercases
 * - All others: trim and lowercase
 *
 * Returns null for empty values.
 */
export function normalizeAdsAccountId(
  providerId: CanonicalAdsProviderId | string,
  rawAccountId: string | null | undefined,
): string | null {
  const raw = String(rawAccountId ?? '').trim()
  if (!raw) return null

  const canonical = normalizeAdsProviderId(providerId)
  if (canonical === 'facebook') {
    return raw.replace(/^act_/i, '').toLowerCase()
  }
  return raw.toLowerCase()
}

/**
 * Build a stable lookup key: `{canonicalProviderId}|{normalizedAccountId}`.
 * Used for currency/dedup maps across the ads domain.
 */
export function buildAccountKey(
  providerId: CanonicalAdsProviderId | string,
  accountId: string | null | undefined,
): string {
  const canonical = normalizeAdsProviderId(providerId) ?? String(providerId).trim().toLowerCase()
  const normalized = normalizeAdsAccountId(canonical, accountId)
  return `${canonical}|${normalized ?? ''}`
}

/**
 * Normalize a publisher platform / reporting surface string to a canonical surface id.
 *
 * - Meta: maps known variants to consistent lowercase (facebook, instagram, audience_network, messenger)
 * - Google / TikTok / LinkedIn: passthrough lowercased value
 *
 * Returns null for empty values.
 */
export function normalizeSurfaceId(
  providerId: CanonicalAdsProviderId | string,
  rawSurface: string | null | undefined,
): string | null {
  const surface = String(rawSurface ?? '').trim().toLowerCase()
  if (!surface) return null

  const canonical = normalizeAdsProviderId(providerId)
  if (canonical === 'facebook') {
    const META_SURFACE_MAP: Record<string, string> = {
      facebook: 'facebook',
      instagram: 'instagram',
      audience_network: 'audience_network',
      an: 'audience_network',
      messenger: 'messenger',
    }
    return META_SURFACE_MAP[surface] ?? surface
  }
  return surface
}
