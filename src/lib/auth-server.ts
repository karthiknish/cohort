import { convexBetterAuthNextJs } from "@convex-dev/better-auth/nextjs";

function requireEnv(name: string, value: string | undefined | null): string {
  if (typeof value === 'string' && value.length > 0) return value
  throw new Error(`[auth-server] Missing required env var: ${name}`)
}

const convexUrl = requireEnv(
  'NEXT_PUBLIC_CONVEX_URL',
  process.env.NEXT_PUBLIC_CONVEX_URL ?? process.env.CONVEX_URL
)

// Convex Better Auth utilities need the *.convex.site URL.
// Many projects store this as NEXT_PUBLIC_CONVEX_HTTP_URL, so accept either.
// Fallback to NEXT_PUBLIC_APP_URL/NEXT_PUBLIC_SITE_URL only for local dev,
// so we can emit a clearer error instead of a generic 500.
const convexSiteUrl = requireEnv(
  'NEXT_PUBLIC_CONVEX_SITE_URL (or NEXT_PUBLIC_CONVEX_HTTP_URL)',
  process.env.NEXT_PUBLIC_CONVEX_SITE_URL ??
    process.env.NEXT_PUBLIC_CONVEX_HTTP_URL ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.NEXT_PUBLIC_APP_URL
)

export const {
  handler,
  preloadAuthQuery,
  isAuthenticated,
  getToken,
  fetchAuthQuery,
  fetchAuthMutation,
  fetchAuthAction,
} = convexBetterAuthNextJs({
  convexUrl,
  convexSiteUrl,
});
