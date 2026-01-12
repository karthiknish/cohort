import { describe, expect, it, vi, beforeEach } from 'vitest'

describe('apiFetch', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.resetAllMocks()
  })

  it('returns envelope data when success is true', async () => {
    globalThis.fetch = vi.fn(async () => ({
      ok: true,
      status: 200,
      headers: new Headers(),
      json: async () => ({ success: true, data: { hello: 'world' } }),
    })) as any

    const { apiFetch } = await import('./api-client')

    const result = await apiFetch<{ hello: string }>('/api/example')
    expect(result).toEqual({ hello: 'world' })
  })

  it('throws ApiClientError when response is not ok', async () => {
    globalThis.fetch = vi.fn(async () => ({
      ok: false,
      status: 401,
      headers: new Headers(),
      json: async () => ({ error: 'Nope' }),
    })) as any

    const { apiFetch } = await import('./api-client')

    await expect(apiFetch('/api/example')).rejects.toMatchObject({
      status: 401,
      code: 'UNAUTHORIZED',
      message: 'Nope',
    })
  })

  it('throws ApiClientError when envelope success is false', async () => {
    globalThis.fetch = vi.fn(async () => ({
      ok: true,
      status: 200,
      headers: new Headers(),
      json: async () => ({ success: false, code: 'BOOM', error: 'Bad' }),
    })) as any

    const { apiFetch } = await import('./api-client')

    await expect(apiFetch('/api/example')).rejects.toMatchObject({
      code: 'BOOM',
      message: 'Bad',
    })
  })
})
