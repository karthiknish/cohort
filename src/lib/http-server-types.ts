/**
 * Request/Response primitives shared by API handlers, server-auth, and the
 * rate limiter. The `NextRequest` / `NextResponse` / `after` names are kept
 * (they originated from `next/server`) to minimize churn across consumers;
 * conceptually they are plain Web-API request/response helpers now.
 */

type CookieEntry = { name: string; value: string }

function parseCookieHeader(cookieHeader: string): CookieEntry[] {
  if (!cookieHeader) return []
  return cookieHeader.split(';').flatMap((part) => {
    const idx = part.indexOf('=')
    if (idx === -1) return []
    const name = part.slice(0, idx).trim()
    const value = part.slice(idx + 1).trim()
    return name ? [{ name, value }] : []
  })
}

function createCookieStore(request: Request) {
  const all = parseCookieHeader(request.headers.get('cookie') ?? '')
  return {
    get: (name: string) => all.find((c) => c.name === name),
    getAll: () => all,
    has: (name: string) => all.some((c) => c.name === name),
  }
}

export type NextRequest = Request & {
  nextUrl: URL
  cookies: ReturnType<typeof createCookieStore>
}

export function toNextRequest(request: Request): NextRequest {
  const url = new URL(request.url)
  return Object.assign(request, {
    nextUrl: url,
    cookies: createCookieStore(request),
  }) as NextRequest
}

export class NextResponse extends Response {
  static override json(data: unknown, init?: ResponseInit): NextResponse {
    const headers = new Headers(init?.headers)
    if (!headers.has('content-type')) {
      headers.set('content-type', 'application/json')
    }
    return new NextResponse(JSON.stringify(data), { ...init, headers })
  }

  static override redirect(url: string | URL, status = 307): NextResponse {
    return NextResponse.json(null, {
      status,
      headers: { Location: String(url) },
    })
  }

  static next(init?: { request?: { headers: Headers } }): NextResponse {
    const headers = new Headers(init?.request?.headers)
    return new NextResponse(null, { status: 200, headers })
  }

  cookies = {
    set: (name: string, value: string, options?: Record<string, unknown>) => {
      let cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`
      if (options?.maxAge && typeof options.maxAge === 'number')
        cookie += `; Max-Age=${options.maxAge}`
      if (options?.path && typeof options.path === 'string')
        cookie += `; Path=${options.path}`
      if (options?.domain && typeof options.domain === 'string')
        cookie += `; Domain=${options.domain}`
      if (options?.secure || options?.secure === undefined) cookie += '; Secure'
      if (options?.httpOnly) cookie += '; HttpOnly'
      if (options?.sameSite === 'strict') cookie += '; SameSite=Strict'
      else if (options?.sameSite === 'lax') cookie += '; SameSite=Lax'
      else if (options?.sameSite === 'none') cookie += '; SameSite=None'
      this.headers.append('Set-Cookie', cookie)
    },
    get: (name: string): { name: string; value: string } | undefined => {
      const cookies = parseCookieHeader(this.headers.get('Set-Cookie') ?? '')
      return cookies.find((c) => c.name === name)
    },
    delete: (name: string) => {
      this.headers.append(
        'Set-Cookie',
        `${encodeURIComponent(name)}=; Max-Age=0; Path=/`,
      )
    },
    getAll: () => {
      return parseCookieHeader(this.headers.get('Set-Cookie') ?? '')
    },
    has: (name: string) => {
      return parseCookieHeader(this.headers.get('Set-Cookie') ?? '').some(
        (c) => c.name === name,
      )
    },
  }
}

/** Fire-and-forget async work. */
export function after(callback: () => void | Promise<void>): void {
  void Promise.resolve().then(callback)
}
