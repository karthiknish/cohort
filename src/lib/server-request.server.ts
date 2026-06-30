import { getRequest } from '@tanstack/react-start/server'

/**
 * Returns the current server Request in route `beforeLoad`.
 * Safe to import from any route file — TanStack Start automatically
 * excludes `.server.ts` modules from the client bundle.
 */
export function getServerRequest(): Request {
  return getRequest()
}
