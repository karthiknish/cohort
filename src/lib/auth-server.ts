import { convexBetterAuthReactStart } from '@convex-dev/better-auth/react-start'
import { getConvexSiteUrl, getConvexUrl } from '@/lib/convex-env'

export const {
  handler,
  getToken,
  fetchAuthQuery,
  fetchAuthMutation,
  fetchAuthAction,
} = convexBetterAuthReactStart({
  convexUrl: getConvexUrl(),
  convexSiteUrl: getConvexSiteUrl(),
})
