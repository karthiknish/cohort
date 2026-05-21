import { describe, expect, it, vi, beforeEach } from 'vitest'

import { googleAdsSearch } from './client'
import { fetchGoogleAdsMetrics } from './metrics'

vi.mock('./client', () => ({
  googleAdsSearch: vi.fn(),
  normalizeCost: (micros: unknown) => {
    const value = typeof micros === 'string' ? parseFloat(micros) : Number(micros)
    return Number.isFinite(value) ? value / 1_000_000 : 0
  },
  DEFAULT_RETRY_CONFIG: { maxRetries: 3 },
}))

describe('fetchGoogleAdsMetrics', () => {
  beforeEach(() => {
    vi.mocked(googleAdsSearch).mockReset()
    vi.mocked(googleAdsSearch).mockResolvedValue([])
    process.env.GOOGLE_ADS_DEVELOPER_TOKEN = 'test-dev-token'
  })

  it('passes managerCustomerId as login-customer-id when loginCustomerId is absent', async () => {
    await fetchGoogleAdsMetrics({
      accessToken: 'token',
      customerId: '1234567890',
      managerCustomerId: '9876543210',
      timeframeDays: 7,
    })

    expect(googleAdsSearch).toHaveBeenCalledWith(
      expect.objectContaining({
        customerId: '1234567890',
        loginCustomerId: '9876543210',
      }),
    )
  })

  it('prefers loginCustomerId over managerCustomerId', async () => {
    await fetchGoogleAdsMetrics({
      accessToken: 'token',
      customerId: '1234567890',
      loginCustomerId: '1111111111',
      managerCustomerId: '9876543210',
      timeframeDays: 7,
    })

    expect(googleAdsSearch).toHaveBeenCalledWith(
      expect.objectContaining({
        loginCustomerId: '1111111111',
      }),
    )
  })
})
