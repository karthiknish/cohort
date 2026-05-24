import { Errors } from '../../errors'

/** Shared secret for trusted Next.js → Convex mutations (bootstrap, idempotency, etc.). */
export function assertAppProxySecret(provided: string): void {
  const expected = process.env.COHORTS_API_IDEMPOTENCY_SECRET
  if (!expected || provided !== expected) {
    throw Errors.auth.unauthorized('Invalid app proxy secret')
  }
}
