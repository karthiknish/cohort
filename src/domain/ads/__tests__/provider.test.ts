import { describe, it, expect } from 'vitest'
import {
  normalizeAdsProviderId,
  isCanonicalAdsProvider,
  normalizeAdsAccountId,
  buildAccountKey,
  normalizeSurfaceId,
} from '../provider'

// =============================================================================
// normalizeAdsProviderId
// =============================================================================

describe('normalizeAdsProviderId', () => {
  it('returns canonical id for exact canonical inputs', () => {
    expect(normalizeAdsProviderId('google')).toBe('google')
    expect(normalizeAdsProviderId('facebook')).toBe('facebook')
    expect(normalizeAdsProviderId('linkedin')).toBe('linkedin')
    expect(normalizeAdsProviderId('tiktok')).toBe('tiktok')
  })

  it('resolves Google Ads aliases', () => {
    expect(normalizeAdsProviderId('google_ads')).toBe('google')
    expect(normalizeAdsProviderId('google-ads')).toBe('google')
    expect(normalizeAdsProviderId('googleads')).toBe('google')
    expect(normalizeAdsProviderId('adwords')).toBe('google')
    expect(normalizeAdsProviderId('GOOGLE_ADS')).toBe('google')
  })

  it('resolves Meta / Facebook aliases', () => {
    expect(normalizeAdsProviderId('meta')).toBe('facebook')
    expect(normalizeAdsProviderId('meta_ads')).toBe('facebook')
    expect(normalizeAdsProviderId('meta-ads')).toBe('facebook')
    expect(normalizeAdsProviderId('metaads')).toBe('facebook')
    expect(normalizeAdsProviderId('facebook_ads')).toBe('facebook')
    expect(normalizeAdsProviderId('facebook-ads')).toBe('facebook')
    expect(normalizeAdsProviderId('META')).toBe('facebook')
  })

  it('resolves LinkedIn aliases', () => {
    expect(normalizeAdsProviderId('linkedin_ads')).toBe('linkedin')
    expect(normalizeAdsProviderId('linkedin-ads')).toBe('linkedin')
  })

  it('resolves TikTok aliases', () => {
    expect(normalizeAdsProviderId('tiktok_ads')).toBe('tiktok')
    expect(normalizeAdsProviderId('tiktok-ads')).toBe('tiktok')
  })

  it('returns null for Google Analytics variants (explicitly excluded)', () => {
    expect(normalizeAdsProviderId('google_analytics')).toBeNull()
    expect(normalizeAdsProviderId('google-analytics')).toBeNull()
    expect(normalizeAdsProviderId('googleanalytics')).toBeNull()
    expect(normalizeAdsProviderId('ga')).toBeNull()
    expect(normalizeAdsProviderId('ga4')).toBeNull()
  })

  it('returns null for empty or null input', () => {
    expect(normalizeAdsProviderId(null)).toBeNull()
    expect(normalizeAdsProviderId(undefined)).toBeNull()
    expect(normalizeAdsProviderId('')).toBeNull()
    expect(normalizeAdsProviderId('   ')).toBeNull()
  })

  it('returns null for unknown providers', () => {
    expect(normalizeAdsProviderId('bing_ads')).toBeNull()
    expect(normalizeAdsProviderId('snapchat')).toBeNull()
    expect(normalizeAdsProviderId('custom_platform')).toBeNull()
  })
})

// =============================================================================
// isCanonicalAdsProvider
// =============================================================================

describe('isCanonicalAdsProvider', () => {
  it('returns true for canonical ids', () => {
    expect(isCanonicalAdsProvider('google')).toBe(true)
    expect(isCanonicalAdsProvider('facebook')).toBe(true)
  })

  it('returns true for known aliases', () => {
    expect(isCanonicalAdsProvider('meta')).toBe(true)
    expect(isCanonicalAdsProvider('google_ads')).toBe(true)
  })

  it('returns false for non-ads providers', () => {
    expect(isCanonicalAdsProvider('google_analytics')).toBe(false)
    expect(isCanonicalAdsProvider('ga')).toBe(false)
    expect(isCanonicalAdsProvider('custom')).toBe(false)
    expect(isCanonicalAdsProvider(null)).toBe(false)
  })
})

// =============================================================================
// normalizeAdsAccountId
// =============================================================================

describe('normalizeAdsAccountId', () => {
  it('strips act_ prefix for facebook', () => {
    expect(normalizeAdsAccountId('facebook', 'act_123456')).toBe('123456')
    expect(normalizeAdsAccountId('meta', 'act_ABCDEF')).toBe('abcdef')
  })

  it('does not strip act_ prefix for other providers', () => {
    expect(normalizeAdsAccountId('google', 'act_123456')).toBe('act_123456')
    expect(normalizeAdsAccountId('linkedin', 'act_789')).toBe('act_789')
  })

  it('lowercases account ids', () => {
    expect(normalizeAdsAccountId('google', 'CUSTOMER_123')).toBe('customer_123')
    expect(normalizeAdsAccountId('linkedin', 'CAMPAIGN_ABC')).toBe('campaign_abc')
  })

  it('returns null for empty or null input', () => {
    expect(normalizeAdsAccountId('google', null)).toBeNull()
    expect(normalizeAdsAccountId('google', undefined)).toBeNull()
    expect(normalizeAdsAccountId('facebook', '')).toBeNull()
    expect(normalizeAdsAccountId('facebook', '   ')).toBeNull()
  })
})

// =============================================================================
// buildAccountKey
// =============================================================================

describe('buildAccountKey', () => {
  it('produces canonical|normalizedAccount key', () => {
    expect(buildAccountKey('facebook', 'act_123')).toBe('facebook|123')
    expect(buildAccountKey('meta', 'act_123')).toBe('facebook|123')
    expect(buildAccountKey('google', 'CUSTOMER_ID')).toBe('google|customer_id')
  })

  it('handles unknown providers with raw string fallback', () => {
    const key = buildAccountKey('custom_platform', 'ACCT_1')
    // Unknown provider falls back to normalized raw string
    expect(key).toBe('custom_platform|acct_1')
  })

  it('handles null account id', () => {
    expect(buildAccountKey('google', null)).toBe('google|')
  })
})

// =============================================================================
// normalizeSurfaceId
// =============================================================================

describe('normalizeSurfaceId', () => {
  it('returns null for empty surface', () => {
    expect(normalizeSurfaceId('facebook', null)).toBeNull()
    expect(normalizeSurfaceId('facebook', '')).toBeNull()
    expect(normalizeSurfaceId('google', undefined)).toBeNull()
  })

  it('passes through lowercase surface for non-Meta providers', () => {
    expect(normalizeSurfaceId('google', 'SEARCH')).toBe('search')
    expect(normalizeSurfaceId('tiktok', 'ForYou')).toBe('foryou')
  })

  it('normalizes Meta surface variants to canonical values', () => {
    expect(normalizeSurfaceId('facebook', 'facebook')).toBe('facebook')
    expect(normalizeSurfaceId('meta', 'instagram')).toBe('instagram')
    expect(normalizeSurfaceId('facebook', 'audience_network')).toBe('audience_network')
    expect(normalizeSurfaceId('facebook', 'messenger')).toBe('messenger')
  })
})
