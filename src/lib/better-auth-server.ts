/**
 * @deprecated This file is deprecated. Use the consolidated auth configuration in convex/auth.ts instead.
 * 
 * The canonical Better Auth configuration now lives in convex/auth.ts which:
 * - Uses Convex as the database backend
 * - Properly configures BETTER_AUTH_SECRET and BETTER_AUTH_URL
 * - Has secure cookie settings, rate limiting, and account linking
 * 
 * For server-side auth operations, use the helpers from @/lib/auth-server instead:
 * - isAuthenticated()
 * - getToken()
 * - fetchAuthQuery(), fetchAuthMutation(), fetchAuthAction()
 */

export function getBetterAuthOrNull() {
  console.warn(
    '[DEPRECATED] getBetterAuthOrNull() is deprecated. Use auth helpers from @/lib/auth-server instead.'
  )
  return null
}

export function getBetterAuth() {
  throw new Error(
    '[DEPRECATED] getBetterAuth() is deprecated. Use auth helpers from @/lib/auth-server instead. ' +
    'The canonical auth config is in convex/auth.ts.'
  )
}
