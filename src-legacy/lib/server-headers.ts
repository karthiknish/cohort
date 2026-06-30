/**
 * Isomorphic `headers()` / `cookies()` helpers backed by the current
 * TanStack Start request on the server, and a synthesized header object on
 * the client (the only header shared-layout code consumes is `x-pathname`).
 */
function isServer(): boolean {
  return typeof window === 'undefined'
}

async function getServerHeaders(): Promise<Headers> {
  const { getRequest } = await import('@tanstack/react-start/server')
  try {
    return getRequest().headers
  } catch {
    return new Headers()
  }
}

function getClientHeaders(): Headers {
  const headers = new Headers()
  if (typeof window !== 'undefined') {
    headers.set('x-pathname', window.location.pathname)
    headers.set('referer', window.location.href)
  }
  return headers
}

/** Incoming request headers (read-only). */
export async function headers(): Promise<Headers> {
  return isServer() ? getServerHeaders() : getClientHeaders()
}

type ReadonlyCookieJar = {
  get: (name: string) => { name: string; value: string } | undefined
  getAll: () => { name: string; value: string }[]
  has: (name: string) => boolean
}

function parseCookies(
  cookieHeader: string,
): { name: string; value: string }[] {
  if (!cookieHeader) return []
  return cookieHeader.split(';').flatMap((part) => {
    const idx = part.indexOf('=')
    if (idx === -1) return []
    const name = part.slice(0, idx).trim()
    const value = part.slice(idx + 1).trim()
    return name ? [{ name, value }] : []
  })
}

/** Read-only access to the incoming request cookies. */
export async function cookies(): Promise<ReadonlyCookieJar> {
  const h = await headers()
  const all = parseCookies(h.get('cookie') ?? '')
  return {
    get: (name) => all.find((c) => c.name === name),
    getAll: () => all,
    has: (name) => all.some((c) => c.name === name),
  }
}

export type { ReadonlyCookieJar }
