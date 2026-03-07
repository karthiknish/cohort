import { beforeEach, describe, expect, it, vi } from 'vitest'

const apiFetchMock = vi.hoisted(() => vi.fn())

vi.mock('@/lib/api-client', () => ({
  apiFetch: apiFetchMock,
}))

describe('syncGoogleAnalytics', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('posts an empty JSON body to the sync endpoint and returns the payload', async () => {
    apiFetchMock.mockResolvedValue({ written: 7, propertyName: 'Main Property' })

    const { syncGoogleAnalytics } = await import('./use-google-analytics-sync')

    await expect(syncGoogleAnalytics({ periodDays: 30, clientId: 'client_123' })).resolves.toEqual({
      written: 7,
      propertyName: 'Main Property',
    })

    expect(apiFetchMock).toHaveBeenCalledWith(
      '/api/analytics/google-analytics/sync?days=30&clientId=client_123',
      {
        method: 'POST',
        credentials: 'same-origin',
        body: JSON.stringify({}),
      }
    )
  })
})