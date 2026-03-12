import { describe, it, expect } from 'vitest'
import { resolveMetricCurrency, assessComparability } from '../money'

// =============================================================================
// resolveMetricCurrency
// =============================================================================

describe('resolveMetricCurrency', () => {
  it('prefers metric-level currency when provided', () => {
    const result = resolveMetricCurrency({
      metricCurrency: 'EUR',
      integrationCurrency: 'USD',
      providerDefaultCurrency: 'GBP',
    })
    expect(result.currency).toBe('EUR')
    expect(result.source).toBe('metric')
  })

  it('falls back to integration currency when metric currency is absent', () => {
    const result = resolveMetricCurrency({
      metricCurrency: null,
      integrationCurrency: 'INR',
      providerDefaultCurrency: null,
    })
    expect(result.currency).toBe('INR')
    expect(result.source).toBe('integration')
  })

  it('falls back to provider default currency when integration currency is absent', () => {
    const result = resolveMetricCurrency({
      metricCurrency: null,
      integrationCurrency: null,
      providerDefaultCurrency: 'CAD',
    })
    expect(result.currency).toBe('CAD')
    expect(result.source).toBe('integration')
  })

  it('returns unknown when all currency sources are absent', () => {
    const result = resolveMetricCurrency({
      metricCurrency: null,
      integrationCurrency: null,
      providerDefaultCurrency: null,
    })
    expect(result.currency).toBeNull()
    expect(result.source).toBe('unknown')
  })

  it('normalizes currency to uppercase', () => {
    const result = resolveMetricCurrency({
      metricCurrency: 'usd',
      integrationCurrency: null,
      providerDefaultCurrency: null,
    })
    expect(result.currency).toBe('USD')
  })

  it('trims whitespace from currency', () => {
    const result = resolveMetricCurrency({
      metricCurrency: '  USD  ',
      integrationCurrency: null,
      providerDefaultCurrency: null,
    })
    expect(result.currency).toBe('USD')
  })

  it('treats empty string currency as absent', () => {
    const result = resolveMetricCurrency({
      metricCurrency: '',
      integrationCurrency: 'USD',
      providerDefaultCurrency: null,
    })
    expect(result.currency).toBe('USD')
    expect(result.source).toBe('integration')
  })
})

// =============================================================================
// assessComparability
// =============================================================================

describe('assessComparability', () => {
  it('returns single_currency when all currencies are the same', () => {
    expect(assessComparability(['USD', 'USD', 'USD'])).toBe('single_currency')
  })

  it('returns mixed_currency when there are different currencies', () => {
    expect(assessComparability(['USD', 'EUR'])).toBe('mixed_currency')
    expect(assessComparability(['USD', 'EUR', 'INR'])).toBe('mixed_currency')
  })

  it('returns unknown_currency when the list is empty', () => {
    expect(assessComparability([])).toBe('unknown_currency')
  })

  it('returns unknown_currency when all currencies are null/undefined', () => {
    expect(assessComparability([null, undefined, null])).toBe('unknown_currency')
  })

  it('returns mixed_currency when some currencies are known and some are null', () => {
    // A mix of known and unknown cannot be confirmed as single-currency
    expect(assessComparability(['USD', null])).toBe('mixed_currency')
    expect(assessComparability([null, 'EUR'])).toBe('mixed_currency')
  })

  it('returns single_currency for a single entry', () => {
    expect(assessComparability(['GBP'])).toBe('single_currency')
  })

  it('normalises currency case before comparing', () => {
    // 'usd' and 'USD' should count as the same currency
    expect(assessComparability(['usd', 'USD'])).toBe('single_currency')
  })
})
