/**
 * User bootstrap helpers (legacy)
 *
 * Firebase-based bootstrapping and Bearer token exchange were used during the old auth stack.
 * The Better Auth migration uses cookie-based auth and server-side session bootstrapping.
 */

import { ServiceUnavailableError } from '@/lib/api-errors'

export async function ensureUserBootstrap(): Promise<{ agencyId?: string; claimsUpdated?: boolean }> {
  throw new ServiceUnavailableError('User bootstrap via client Bearer tokens is no longer supported')
}
