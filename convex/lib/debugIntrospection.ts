import { Errors } from '../errors'

/**
 * Whether cross-workspace debug queries are available on this deployment.
 * Off on prod Convex unless ENABLE_DEBUG_INTROSPECTION=true.
 */
export function isDebugIntrospectionEnabled(): boolean {
  const flag = process.env.ENABLE_DEBUG_INTROSPECTION
  if (flag === 'true') return true
  if (flag === 'false') return false

  const deployment = process.env.CONVEX_DEPLOYMENT ?? ''
  return deployment.startsWith('dev:') || deployment === 'local'
}

export function assertDebugIntrospectionEnabled(): void {
  if (!isDebugIntrospectionEnabled()) {
    throw Errors.auth.forbidden('Debug introspection is not available')
  }
}
