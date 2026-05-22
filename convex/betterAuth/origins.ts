/**
 * Shared trusted-origin helpers for Better Auth and Convex HTTP CORS.
 * Keep SITE_URL / BETTER_AUTH_URL aligned with the live Next.js deployment origin.
 */

const LOCAL_DEV_ORIGINS = ['http://localhost:3000', 'http://127.0.0.1:3000'] as const

export function isConvexDevDeployment(): boolean {
  const deployment = process.env.CONVEX_DEPLOYMENT ?? ''
  return deployment.startsWith('dev:') || deployment === 'local'
}

export function isLocalDevUrl(value: string | undefined | null): value is string {
  return typeof value === 'string' && /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(value)
}

/** Strip trailing slash; return undefined for empty input. */
export function normalizeOrigin(value: string | undefined | null): string | undefined {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim().replace(/\/$/, '')
  return trimmed.length > 0 ? trimmed : undefined
}

/** Add www <-> apex variant when host looks like a public site (not localhost / IP). */
export function relatedSiteOrigins(origin: string): string[] {
  const normalized = normalizeOrigin(origin)
  if (!normalized) return []

  try {
    const url = new URL(normalized)
    const host = url.hostname
    if (host === 'localhost' || host === '127.0.0.1' || /^\d+\.\d+\.\d+\.\d+$/.test(host)) {
      return [normalized]
    }

    const variants = new Set<string>([normalized])
    if (host.startsWith('www.')) {
      variants.add(`${url.protocol}//${host.slice(4)}${url.port ? `:${url.port}` : ''}`)
    } else {
      variants.add(`${url.protocol}//www.${host}${url.port ? `:${url.port}` : ''}`)
    }
    return [...variants]
  } catch {
    return [normalized]
  }
}

function authOriginCandidates(): Array<string | undefined> {
  return [
    process.env.BETTER_AUTH_URL,
    process.env.SITE_URL,
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined,
    process.env.VERCEL_BRANCH_URL,
  ]
}

function shouldForceLocalhostAuthOrigin(): boolean {
  return authOriginCandidates().some(isLocalDevUrl)
}

function buildLocalDevOrigins(): string[] {
  const origins = new Set<string>(LOCAL_DEV_ORIGINS)

  for (const value of authOriginCandidates()) {
    const normalized = normalizeOrigin(value)
    if (normalized && isLocalDevUrl(normalized)) {
      origins.add(normalized)
    }
  }

  if (isConvexDevDeployment()) {
    for (const origin of LOCAL_DEV_ORIGINS) {
      origins.add(origin)
    }
  }

  return [...origins]
}

function addOrigin(origins: Set<string>, value: string | undefined | null): void {
  const normalized = normalizeOrigin(value)
  if (!normalized) return
  for (const variant of relatedSiteOrigins(normalized)) {
    origins.add(variant)
  }
}

export function buildTrustedOrigins(): string[] {
  if (shouldForceLocalhostAuthOrigin()) {
    return buildLocalDevOrigins()
  }

  const origins = new Set<string>()

  for (const candidate of authOriginCandidates()) {
    addOrigin(origins, candidate)
  }

  const convexSiteUrl =
    process.env.NEXT_PUBLIC_CONVEX_SITE_URL
    || process.env.NEXT_PUBLIC_CONVEX_HTTP_URL
    || process.env.CONVEX_SITE_URL
  addOrigin(origins, convexSiteUrl)

  if (isConvexDevDeployment()) {
    for (const origin of LOCAL_DEV_ORIGINS) {
      origins.add(origin)
    }
  }

  return [...origins]
}

const normalizedAllowedOrigins = (): Set<string> => {
  return new Set(buildTrustedOrigins().map((o) => normalizeOrigin(o)).filter(Boolean) as string[])
}

/**
 * Resolve Access-Control-Allow-Origin for credentialed auth requests.
 * Returns the request origin only when it exactly matches the allow list.
 */
export function resolveCorsAllowOrigin(requestOrigin: string | null): string | null {
  if (!requestOrigin) return null

  const normalizedRequest = normalizeOrigin(requestOrigin)
  if (!normalizedRequest) return null

  const allowed = normalizedAllowedOrigins()
  if (allowed.has(normalizedRequest)) {
    return normalizedRequest
  }

  return null
}

export function corsHeadersForOrigin(requestOrigin: string | null): HeadersInit {
  const allowOrigin = resolveCorsAllowOrigin(requestOrigin)
  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers':
      'Content-Type, Authorization, X-Requested-With, better-auth-cookie',
    'Access-Control-Max-Age': '86400',
  }

  if (allowOrigin) {
    headers['Access-Control-Allow-Origin'] = allowOrigin
    headers['Access-Control-Allow-Credentials'] = 'true'
  }

  return headers
}
