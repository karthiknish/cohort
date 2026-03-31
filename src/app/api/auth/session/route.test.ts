import { beforeEach, describe, expect, it, vi } from 'vitest'

const cookiesMock = vi.hoisted(() => vi.fn())

vi.mock('next/headers', () => ({
  cookies: cookiesMock,
}))

vi.mock('@/lib/api-handler', () => ({
  createApiHandler: (_options: unknown, handler: unknown) => handler,
}))

import { DELETE, GET, POST } from './route'

type CookieStore = {
  get: (name: string) => { name: string; value: string } | undefined
}

type AuthContext = {
  uid: string | null
  email: string | null
  name: string | null
  claims: Record<string, unknown>
  isCron: boolean
}

function createCookieStore(values: Record<string, string>): CookieStore {
  return {
    get(name: string) {
      const value = values[name]
      return typeof value === 'string' ? { name, value } : undefined
    },
  }
}

function createAuth(overrides: Partial<AuthContext> = {}): AuthContext {
  return {
    uid: 'user_1',
    email: 'user_1@example.com',
    name: 'User One',
    claims: {},
    isCron: false,
    ...overrides,
  }
}

function getHandler() {
  return GET as unknown as () => Promise<Response>
}

function postHandler() {
  return POST as unknown as (request: Request, context: { auth: AuthContext }) => Promise<Response>
}

function deleteHandler() {
  return DELETE as unknown as (request: Request) => Promise<Response>
}

function getSetCookieHeaders(response: Response): string[] {
  const headers = response.headers as Headers & { getSetCookie?: () => string[] }
  if (typeof headers.getSetCookie === 'function') {
    return headers.getSetCookie()
  }

  const single = headers.get('set-cookie')
  return single ? [single] : []
}

describe('/api/auth/session route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns session metadata and sets a fresh csrf cookie on GET', async () => {
    const expiresAt = Date.now() + 60_000
    cookiesMock.mockResolvedValue(createCookieStore({
      cohorts_role: 'team',
      cohorts_status: 'active',
      cohorts_agency_id: 'ws_1',
      cohorts_session_expires: String(expiresAt),
    }))

    const response = await getHandler()()
    const body = await response.json()

    expect(body).toMatchObject({
      success: true,
      hasSession: true,
      role: 'team',
      status: 'active',
      agencyId: 'ws_1',
      expiresAt,
    })
    expect(body.csrfToken).toMatch(/^[a-f0-9]{64}$/)
    expect(response.cookies.get('cohorts_csrf')?.value).toBe(body.csrfToken)
  })

  it('rejects POST session sync when the csrf header does not match the cookie', async () => {
    cookiesMock.mockResolvedValue(createCookieStore({
      cohorts_csrf: 'expected-token',
    }))

    const request = new Request('http://localhost/api/auth/session', {
      method: 'POST',
      headers: {
        'x-csrf-token': 'wrong-token',
      },
    })

    await expect(postHandler()(request, { auth: createAuth() })).rejects.toMatchObject({
      status: 403,
      code: 'FORBIDDEN',
      message: 'Security validation failed. Please refresh and try again.',
    })
  })

  it('sets session cookies and rotates the csrf token on valid POST session sync', async () => {
    cookiesMock.mockResolvedValue(createCookieStore({
      cohorts_csrf: 'match-token',
    }))

    const request = new Request('http://localhost/api/auth/session', {
      method: 'POST',
      headers: {
        'x-csrf-token': 'match-token',
      },
    })

    const response = await postHandler()(request, {
      auth: createAuth({
        claims: {
          role: 'team',
          status: 'active',
          agencyId: 'ws_1',
        },
      }),
    })
    const body = await response.json()

    expect(body).toEqual({ success: true })
    expect(response.cookies.get('cohorts_role')?.value).toBe('team')
    expect(response.cookies.get('cohorts_status')?.value).toBe('active')
    expect(response.cookies.get('cohorts_agency_id')?.value).toBe('ws_1')
    expect(response.cookies.get('cohorts_session_expires')?.value).toMatch(/^\d+$/)

    const nextCsrfToken = response.cookies.get('cohorts_csrf')?.value
    expect(nextCsrfToken).toMatch(/^[a-f0-9]{64}$/)
    expect(nextCsrfToken).not.toBe('match-token')
  })

  it('rejects DELETE session clear when the csrf header is missing or invalid', async () => {
    cookiesMock.mockResolvedValue(createCookieStore({
      cohorts_csrf: 'expected-token',
    }))

    const request = new Request('http://localhost/api/auth/session', {
      method: 'DELETE',
    })

    await expect(deleteHandler()(request)).rejects.toMatchObject({
      status: 403,
      code: 'FORBIDDEN',
      message: 'Security validation failed. Please refresh and try again.',
    })
  })

  it('clears session cookies on valid DELETE', async () => {
    cookiesMock.mockResolvedValue(createCookieStore({
      cohorts_csrf: 'match-token',
    }))

    const request = new Request('http://localhost/api/auth/session', {
      method: 'DELETE',
      headers: {
        'x-csrf-token': 'match-token',
      },
    })

    const response = await deleteHandler()(request)
    const body = await response.json()
    const setCookieHeaders = getSetCookieHeaders(response)

    expect(body).toEqual({ success: true })
    expect(setCookieHeaders).toEqual(expect.arrayContaining([
      expect.stringContaining('cohorts_role=;'),
      expect.stringContaining('cohorts_status=;'),
      expect.stringContaining('cohorts_agency_id=;'),
      expect.stringContaining('cohorts_session_expires=;'),
      expect.stringContaining('cohorts_csrf=;'),
    ]))
  })
})