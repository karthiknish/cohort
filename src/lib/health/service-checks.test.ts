import { describe, expect, it, vi } from 'vitest'

import { buildConfiguredServiceChecks } from './service-checks'

describe('buildConfiguredServiceChecks', () => {
  it('returns warning checks when optional integrations are missing', () => {
    vi.stubEnv('NEXT_PUBLIC_CONVEX_URL', 'https://demo.convex.cloud')
    vi.stubEnv('BETTER_AUTH_SECRET', '')

    const checks = buildConfiguredServiceChecks()

    expect(checks.environment?.status).toBe('ok')
    expect(checks.betterAuth?.status).toBe('warning')
    expect(checks.googleAds?.status).toBe('warning')
  })
})