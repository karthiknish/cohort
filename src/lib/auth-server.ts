import { convexBetterAuthNextJs } from "@convex-dev/better-auth/nextjs";

function requireEnv(name: string, value: string | undefined | null): string {
  if (typeof value === 'string' && value.length > 0) return value
  throw new Error(`[auth-server] Missing required env var: ${name}`)
}

const convexUrl = requireEnv(
  'NEXT_PUBLIC_CONVEX_URL',
  process.env.NEXT_PUBLIC_CONVEX_URL ?? process.env.CONVEX_URL
)

// Convex Better Auth utilities need to *.convex.site URL.
// Many projects store this as NEXT_PUBLIC_CONVEX_HTTP_URL, so accept either.
export const convexSiteUrl = requireEnv(
  'NEXT_PUBLIC_CONVEX_SITE_URL (or NEXT_PUBLIC_CONVEX_HTTP_URL)',
  process.env.NEXT_PUBLIC_CONVEX_SITE_URL ??
  process.env.NEXT_PUBLIC_CONVEX_HTTP_URL
)

export const SESSION_EXPIRES_COOKIE = 'cohorts_session_expires'

const authUtilities = convexBetterAuthNextJs({
  convexUrl,
  convexSiteUrl,
});

export const {
  handler,
  preloadAuthQuery,
  isAuthenticated,
  getToken,
  fetchAuthQuery,
  fetchAuthMutation,
  fetchAuthAction,
} = authUtilities;
