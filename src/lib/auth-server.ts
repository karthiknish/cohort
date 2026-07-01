import { convexBetterAuthReactStart } from '@convex-dev/better-auth/react-start'
import { getConvexSiteUrl, getConvexUrl } from '@/lib/convex-env'

const auth = convexBetterAuthReactStart({
  convexUrl: getConvexUrl(),
  convexSiteUrl: getConvexSiteUrl(),
})

function hasAuthCookie(cookieHeader: string | null | undefined): boolean {
  return Boolean(
    cookieHeader?.includes('better-auth.session_token') ||
      cookieHeader?.includes('convex_jwt'),
  )
}

export const {
  handler,
  fetchAuthQuery,
  fetchAuthMutation,
  fetchAuthAction,
} = auth

export async function getToken(): ReturnType<typeof auth.getToken> {
  const { getRequestHeaders } = await import('@tanstack/react-start/server')
  if (!hasAuthCookie(getRequestHeaders().get('cookie'))) {
    return undefined
  }

  return auth.getToken()
}
