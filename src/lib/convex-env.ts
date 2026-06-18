import { getPublicEnv } from '@/lib/public-env'

function requireEnv(name: string, value: string | undefined): string {
  if (typeof value === 'string' && value.length > 0) return value
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
