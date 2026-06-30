import { getPublicEnv } from '@/lib/public-env'

function requireEnv(name: string, value: string | undefined): string {
  if (typeof value === 'string' && value.length > 0) return value.trim()
  throw new Error(`[convex-env] Missing required env var: ${name}`)
}

export function getConvexUrl(): string {
  return requireEnv(
    'NEXT_PUBLIC_CONVEX_URL',
    getPublicEnv('NEXT_PUBLIC_CONVEX_URL') ?? getPublicEnv('CONVEX_URL'),
  )
}

export function getConvexSiteUrl(): string {
  return requireEnv(
    'NEXT_PUBLIC_CONVEX_SITE_URL (or NEXT_PUBLIC_CONVEX_HTTP_URL)',
    getPublicEnv('NEXT_PUBLIC_CONVEX_SITE_URL') ??
      getPublicEnv('NEXT_PUBLIC_CONVEX_HTTP_URL'),
  )
}

export function getSiteUrl(): string {
  const raw =
    getPublicEnv('NEXT_PUBLIC_SITE_URL') ?? getPublicEnv('NEXT_PUBLIC_APP_URL')
  if (typeof raw === 'string' && raw.trim().length > 0) {
    return raw.trim().replace(/\/$/, '')
  }
  if (process.env.NODE_ENV !== 'production') {
    return 'http://localhost:3000'
  }
  throw new Error(
    '[convex-env] NEXT_PUBLIC_SITE_URL (or NEXT_PUBLIC_APP_URL) is required in production',
  )
}

/**
 * Extracts the Convex deployment slug from a `*.convex.cloud` or
 * `*.convex.site` URL (e.g. `https://deafening-impala-890.convex.cloud`
 * → `deafening-impala-890`). Returns `null` for non-Convex hosts (custom
 * domains, self-hosted, localhost) where the check can't apply.
 */
function extractConvexDeploymentSlug(url: string): string | null {
  const match = /^https?:\/\/([^.]+)\.convex\.(?:cloud|site)\b/i.exec(url.trim())
  return match?.[1]?.toLowerCase() ?? null
}

/**
 * Fails loudly when the data deployment (`NEXT_PUBLIC_CONVEX_URL`,
 * `*.convex.cloud`) and the auth deployment (`NEXT_PUBLIC_CONVEX_SITE_URL`,
 * `*.convex.site`) point at *different* Convex deployments.
 *
 * This is a silent-killer misconfiguration: Better Auth mints JWTs on the
 * `.convex.site` deployment, but the WebSocket/queries run against the
 * `.convex.cloud` deployment which validates those JWTs against its own JWKS.
 * When they diverge, every authenticated request 401s, `useConvexAuth()` never
 * settles, and the UI hangs on "loading" with no actionable error. Catching it
 * here turns that into an obvious startup failure.
 */
export function assertConvexDeploymentsAligned(): void {
  const cloudSlug = extractConvexDeploymentSlug(getConvexUrl())
  const siteSlug = extractConvexDeploymentSlug(getConvexSiteUrl())
  // Only assert when both are recognizable Convex deployment slugs; custom
  // domains / self-hosted deployments legitimately won't match this shape.
  if (cloudSlug && siteSlug && cloudSlug !== siteSlug) {
    throw new Error(
      `[convex-env] Convex deployment mismatch: NEXT_PUBLIC_CONVEX_URL targets "${cloudSlug}" ` +
        `but NEXT_PUBLIC_CONVEX_SITE_URL targets "${siteSlug}". Auth (.convex.site) and data ` +
        `(.convex.cloud) MUST point at the same deployment, or all authenticated requests will ` +
        `401 and the app will hang on loading. Set both env vars to the same deployment.`,
    )
  }
}
