import { afterEach, describe, expect, it, vi } from 'vitest'

import { assertWebhookSecret, isDeployedConvexEnvironment } from './webhookAuth'

describe('webhookAuth', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('allows missing secret in non-deployed environments', () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('CONVEX_CLOUD_URL', '')
    expect(() => assertWebhookSecret('TEST_SECRET', null)).not.toThrow()
  })

  it('rejects missing secret on deployed environments', () => {
    vi.stubEnv('NODE_ENV', 'production')
    expect(() => assertWebhookSecret('TEST_SECRET', null)).toThrow(/not configured/i)
  })

  it('rejects invalid secret when configured', () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('TEST_SECRET', 'expected')
    expect(() => assertWebhookSecret('TEST_SECRET', 'wrong')).toThrow(/Invalid webhook credentials/i)
  })

  it('detects deployed Convex via CONVEX_CLOUD_URL', () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('CONVEX_CLOUD_URL', 'https://example.convex.cloud')
    expect(isDeployedConvexEnvironment()).toBe(true)
  })
})
