import { beforeEach, describe, expect, it, vi } from 'vitest'

const apiFetchMock = vi.hoisted(() => vi.fn())
const MockApiClientError = vi.hoisted(() => {
  return class ApiClientError extends Error {
    status?: number

    constructor(message: string, options: { status?: number } = {}) {
      super(message)
      this.name = 'ApiClientError'
      this.status = options.status
    }
  }
})

vi.mock('@/lib/api-client', () => {
  return {
    apiFetch: apiFetchMock,
    ApiClientError: MockApiClientError,
  }
})

describe('bootstrapAndSyncSession', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('bootstraps first, fetches a CSRF token, and syncs the session with the token header', async () => {
    apiFetchMock
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce({ csrfToken: 'csrf-token-123' })
      .mockResolvedValueOnce(undefined)

    const { bootstrapAndSyncSession } = await import('./auth-utils')

    await expect(bootstrapAndSyncSession()).resolves.toBeUndefined()

    expect(apiFetchMock).toHaveBeenNthCalledWith(1, '/api/auth/bootstrap', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
      credentials: 'include',
    })

    expect(apiFetchMock).toHaveBeenNthCalledWith(2, '/api/auth/session', {
      method: 'GET',
      credentials: 'include',
    })

    expect(apiFetchMock).toHaveBeenNthCalledWith(3, '/api/auth/session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-csrf-token': 'csrf-token-123',
      },
      body: JSON.stringify({}),
      credentials: 'include',
    })
  })

  it('stops before the POST sync when the CSRF token is missing', async () => {
    apiFetchMock
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce({ csrfToken: null })

    const { bootstrapAndSyncSession } = await import('./auth-utils')

    await expect(bootstrapAndSyncSession()).rejects.toThrow('Failed to sync session')

    expect(apiFetchMock).toHaveBeenCalledTimes(2)
  })

  it('surfaces bootstrap API failures directly', async () => {
    apiFetchMock.mockRejectedValueOnce(new MockApiClientError('Bootstrap failed', { status: 500 }))

    const { bootstrapAndSyncSession } = await import('./auth-utils')

    await expect(bootstrapAndSyncSession()).rejects.toThrow('Bootstrap failed')

    expect(apiFetchMock).toHaveBeenCalledTimes(1)
  })
})