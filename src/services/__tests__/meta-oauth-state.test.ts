import { describe, it, expect, beforeAll } from 'vitest'

// Set encryption secret before importing the module under test.
// crypto.ts relies on METRIC_SECRET (or JWT_SECRET / NEXTAUTH_SECRET).
beforeAll(() => {
  process.env.METRIC_SECRET = 'test-secret-for-oauth-state-tests-32b'
})

// Lazy import so the env is set first
async function getModule() {
  return await import('@/services/meta-business')
}

describe('createMetaOAuthState / validateMetaOAuthState round-trip', () => {
  it('encodes and decodes a minimal payload', async () => {
    const { createMetaOAuthState, validateMetaOAuthState } = await getModule()
    const state = createMetaOAuthState({ state: 'user-id-123' })
    const ctx = validateMetaOAuthState(state)
    expect(ctx.state).toBe('user-id-123')
    expect(ctx.surface).toBeUndefined()
    expect(ctx.entryPoint).toBeUndefined()
  })

  it('encodes surface=facebook and entryPoint=socials', async () => {
    const { createMetaOAuthState, validateMetaOAuthState } = await getModule()
    const state = createMetaOAuthState({
      state: 'user-id-456',
      surface: 'facebook',
      entryPoint: 'socials',
    })
    const ctx = validateMetaOAuthState(state)
    expect(ctx.surface).toBe('facebook')
    expect(ctx.entryPoint).toBe('socials')
  })

  it('encodes surface=instagram and entryPoint=socials', async () => {
    const { createMetaOAuthState, validateMetaOAuthState } = await getModule()
    const state = createMetaOAuthState({
      state: 'user-id-789',
      surface: 'instagram',
      entryPoint: 'socials',
    })
    const ctx = validateMetaOAuthState(state)
    expect(ctx.surface).toBe('instagram')
    expect(ctx.entryPoint).toBe('socials')
    expect(ctx.state).toBe('user-id-789')
  })

  it('encodes entryPoint=ads (default Flow)', async () => {
    const { createMetaOAuthState, validateMetaOAuthState } = await getModule()
    const state = createMetaOAuthState({
      state: 'user-ads',
      entryPoint: 'ads',
    })
    const ctx = validateMetaOAuthState(state)
    expect(ctx.entryPoint).toBe('ads')
    expect(ctx.surface).toBeUndefined()
  })

  it('preserves redirect URL through encode/decode', async () => {
    const { createMetaOAuthState, validateMetaOAuthState } = await getModule()
    const redirect = 'https://app.example.com/dashboard/socials?tab=instagram'
    const state = createMetaOAuthState({ state: 'uid', redirect, surface: 'instagram', entryPoint: 'socials' })
    const ctx = validateMetaOAuthState(state)
    expect(ctx.redirect).toBe(redirect)
    expect(ctx.surface).toBe('instagram')
    expect(ctx.entryPoint).toBe('socials')
  })

  it('preserves clientId through encode/decode', async () => {
    const { createMetaOAuthState, validateMetaOAuthState } = await getModule()
    const state = createMetaOAuthState({ state: 'uid', clientId: 'client-abc', surface: 'facebook' })
    const ctx = validateMetaOAuthState(state)
    expect(ctx.clientId).toBe('client-abc')
    expect(ctx.surface).toBe('facebook')
  })

  it('throws on tampered/invalid state', async () => {
    const { validateMetaOAuthState } = await getModule()
    expect(() => validateMetaOAuthState('definitely-not-valid-base64')).toThrow()
  })

  it('throws on empty state', async () => {
    const { validateMetaOAuthState } = await getModule()
    expect(() => validateMetaOAuthState('')).toThrow('Missing OAuth state')
  })

  it('throws on expired state', async () => {
    const { createMetaOAuthState, validateMetaOAuthState } = await getModule()
    // Inject a createdAt 10 minutes in the past (beyond 5 min TTL)
    const expiredCreatedAt = Date.now() - 10 * 60 * 1000
    const state = createMetaOAuthState({
      state: 'uid',
      surface: 'facebook',
      entryPoint: 'socials',
      createdAt: expiredCreatedAt,
    })
    expect(() => validateMetaOAuthState(state)).toThrow('OAuth state has expired')
  })
})
