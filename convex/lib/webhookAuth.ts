import { Errors } from '../errors'

/** True when running on a deployed Convex instance (not local dev). */
export function isDeployedConvexEnvironment(): boolean {
  return process.env.NODE_ENV === 'production' || Boolean(process.env.CONVEX_CLOUD_URL)
}

/**
 * Validates a webhook/cron shared secret.
 * Fail-closed on deployed environments when the env var is unset.
 */
export function assertWebhookSecret(envVarName: string, provided: string | null | undefined): void {
  const expected = process.env[envVarName]
  if (!expected || expected.length === 0) {
    if (isDeployedConvexEnvironment()) {
      throw Errors.base.internal(`${envVarName} is not configured`)
    }
    return
  }

  if (!provided || provided !== expected) {
    throw Errors.auth.unauthorized('Invalid webhook credentials')
  }
}
