import { describe, expect, it } from 'vitest'

import { buildAnalyticsMoneyDisplay } from './analytics-currency'

describe('buildAnalyticsMoneyDisplay', () => {
  it('uses metric currency when rows share one code', () => {
    const display = buildAnalyticsMoneyDisplay([
      { revenue: 100, currency: 'EUR' },
      { revenue: 200, currency: 'EUR' },
    ])

    expect(display.displayCurrency).toBe('EUR')
    expect(display.totalRevenue).toBe(300)
    expect(display.revenueComparable).toBe(true)
    expect(display.formatRevenue(300)).not.toBe('Multi-currency')
  })

  it('falls back to integration currency when metric rows omit currency', () => {
    const display = buildAnalyticsMoneyDisplay(
      [{ revenue: 500 }, { revenue: 250 }],
      { integrationCurrency: 'GBP' },
    )

    expect(display.displayCurrency).toBe('GBP')
    expect(display.totalRevenue).toBe(750)
  })

  it('prefers GA property currency over workspace USD preference when rows lack currency', () => {
    const display = buildAnalyticsMoneyDisplay(
      [{ revenue: 100 }],
      { integrationCurrency: 'GBP', preferenceCurrency: 'USD' },
    )

    expect(display.displayCurrency).toBe('GBP')
    expect(display.formatRevenue(100)).toContain('£')
  })

  it('returns multi-currency label when rows conflict', () => {
    const display = buildAnalyticsMoneyDisplay([
      { revenue: 100, currency: 'USD' },
      { revenue: 200, currency: 'GBP' },
    ])

    expect(display.totalRevenue).toBeNull()
    expect(display.formatRevenue(100)).toBe('Multi-currency')
  })
})
