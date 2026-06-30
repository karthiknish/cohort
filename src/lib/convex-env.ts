import { getPublicEnv } from '@/lib/public-env'

function requireEnv(name: string, value: string | undefined): string {
  if (typeof value === 'string' && value.length > 0) return value.trim()
  throw new Error(`[convex-env] Missing required env var: ${name}`)
}

export function getConvexUrl(): string {
  return requireEnv(
    'VITE_CONVEX_URL (or NEXT_PUBLIC_CONVEX_URL)',
    getPublicEnv('VITE_CONVEX_URL') ??
      getPublicEnv('NEXT_PUBLIC_CONVEX_URL') ??
      getPublicEnv('CONVEX_URL'),
  )
}

export function getConvexSiteUrl(): string {
  return requireEnv(
    'VITE_CONVEX_SITE_URL (or NEXT_PUBLIC_CONVEX_SITE_URL)',
    getPublicEnv('VITE_CONVEX_SITE_URL') ??
      getPublicEnv('NEXT_PUBLIC_CONVEX_SITE_URL') ??
      getPublicEnv('NEXT_PUBLIC_CONVEX_HTTP_URL'),
  )
}

export function getSiteUrl(): string {
  const raw =
    getPublicEnv('VITE_SITE_URL') ??
    getPublicEnv('NEXT_PUBLIC_SITE_URL') ??
    getPublicEnv('NEXT_PUBLIC_APP_URL')
  if (typeof raw === 'string' && raw.trim().length > 0) {
    return raw.trim().replace(/\/$/, '')
  }
  if (process.env.NODE_ENV !== 'production') {
    return 'http://localhost:3000'
  }
  throw new Error(
    '[convex-env] VITE_SITE_URL (or NEXT_PUBLIC_SITE_URL) is required in production',
  )
}

/**
 * Extracts the Convex deployment slug from a `*.convex.cloud` or
 * `*.convex.site` URL. Returns `null` for non-Convex hosts.
 */
function extractConvexDeploymentSlug(url: string): string | null {
  const match = /^https?:\/\/([^.]+)\.convex\.(?:cloud|site)\b/i.exec(url.trim())
  return match?.[1]?.toLowerCase() ?? null
}

/**
 * Fails loudly when the data deployment and the auth deployment point at
 * different Convex deployments.
 */
export function assertConvexDeploymentsAligned(): void {
  const cloudSlug = extractConvexDeploymentSlug(getConvexUrl())
  const siteSlug = extractConvexDeploymentSlug(getConvexSiteUrl())
  if (cloudSlug && siteSlug && cloudSlug !== siteSlug) {
    throw new Error(
      `[convex-env] Convex deployment mismatch: CONVEX_URL targets "${cloudSlug}" ` +
        `but CONVEX_SITE_URL targets "${siteSlug}". Auth and data MUST point at ` +
        `the same deployment, or all authenticated requests will 401.`,
    )
  }
}
