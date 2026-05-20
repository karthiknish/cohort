import type { AuthStatus, AuthUser } from '@/services/auth'

export type AuthPhase =
  | 'initializing'
  | 'unauthenticated'
  | 'syncing'
  | 'profile_loading'
  | 'ready_active'
  | 'ready_pending'
  | 'sync_failed'

export type AuthSyncState = 'idle' | 'running' | 'failed' | 'success'

export function isLoadingPhase(phase: AuthPhase): boolean {
  return phase === 'initializing' || phase === 'syncing' || phase === 'profile_loading'
}

export function deriveAuthPhase(input: {
  /** True only while the session hook is pending AND no user payload is available yet */
  sessionPending: boolean
  hasSession: boolean
  syncState: AuthSyncState
  convexAuthLoading: boolean
  isAuthenticated: boolean
  profilePending: boolean
  user: AuthUser | null
}): AuthPhase {
  if (input.sessionPending && !input.hasSession) {
    return 'initializing'
  }

  if (!input.hasSession) {
    return 'unauthenticated'
  }

  if (input.syncState === 'failed') {
    return 'sync_failed'
  }

  if (input.syncState === 'idle' || input.syncState === 'running') {
    return 'syncing'
  }

  if (!input.user) {
    return 'syncing'
  }

  // Bootstrap API already returned role/status — do not block on Convex profile query.
  if (input.syncState === 'success') {
    if (input.user.status === 'active') {
      return 'ready_active'
    }
    return 'ready_pending'
  }

  if (input.isAuthenticated && !input.convexAuthLoading && input.profilePending) {
    return 'profile_loading'
  }

  if (input.user.status === 'active') {
    return 'ready_active'
  }

  return 'ready_pending'
}

export function mergeConvexProfile(
  baseUser: AuthUser,
  convexUser: {
    legacyId: string
    role: string | null
    status: string | null
    agencyId: string | null
  } | null
): AuthUser {
  if (!convexUser) {
    return baseUser
  }

  return {
    ...baseUser,
    id: convexUser.legacyId,
    role: (convexUser.role as AuthUser['role']) || baseUser.role,
    status: (convexUser.status as AuthStatus) || baseUser.status,
    agencyId: convexUser.agencyId || baseUser.agencyId || convexUser.legacyId,
  }
}
