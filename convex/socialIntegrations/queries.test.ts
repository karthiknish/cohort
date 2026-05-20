import { describe, expect, it } from 'vitest'

/**
 * Documents that Socials status is sourced from socialIntegrations, not adIntegrations.
 * Full handler tests require Convex test harness; this guards the module contract.
 */
describe('socialIntegrations queries module', () => {
  it('exports getStatus from socialIntegrations table module', async () => {
    const mod = await import('./queries')
    expect(typeof mod.getStatus).toBe('object')
  })
})
