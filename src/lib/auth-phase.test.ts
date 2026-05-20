import { describe, expect, it } from 'vitest'

import { deriveAuthPhase } from './auth-phase'

const baseUser = {
  id: 'user-1',
  email: 'test@example.com',
  name: 'Test',
  role: 'admin' as const,
  status: 'active' as const,
  agencyId: 'agency-1',
}

describe('deriveAuthPhase', () => {
  it('stays syncing after bootstrap success until Convex JWT is active', () => {
    expect(
      deriveAuthPhase({
        sessionPending: false,
        hasSession: true,
        syncState: 'success',
        convexAuthLoading: false,
        isAuthenticated: false,
        profilePending: false,
        user: baseUser,
      }),
    ).toBe('syncing')
  })

  it('reaches ready_active when sync succeeded and Convex is authenticated', () => {
    expect(
      deriveAuthPhase({
        sessionPending: false,
        hasSession: true,
        syncState: 'success',
        convexAuthLoading: false,
        isAuthenticated: true,
        profilePending: false,
        user: baseUser,
      }),
    ).toBe('ready_active')
  })
})
