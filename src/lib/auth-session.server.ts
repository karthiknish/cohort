/**
 * Server-only session validation.
 *
 * Split from auth-guard.ts because getToken requires a server-only import
 * (@tanstack/react-start/server) which cannot be in client-bundled modules.
 */
import { getToken } from '@/lib/auth-token.server'

export async function hasValidSession(_request: Request): Promise<boolean> {
  try {
    const token = await getToken()
    return !!token
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[auth-guard] session check error:', err)
    }
    return false
  }
}
