import type { AuthStatus, AuthUser } from '@/services/auth';

/**
 * Auth phase is derived purely from the official Convex + Better Auth signals:
 *   - `authClient.useSession()` → is the Better Auth session resolved?
 *   - `useConvexAuth()` → has Convex received a valid JWT?
 *   - the domain `users` row → role/status (loaded via Convex query).
 *
 * There is no longer a custom sync pipeline or `AuthSyncState` machine: the
 * Better Auth session + Convex auth + domain profile query compose directly.
 */
export type AuthPhase =
  | 'initializing'
  | 'unauthenticated'
  | 'syncing'
  | 'profile_loading'
  | 'ready_active'
  | 'ready_pending'
  | 'sync_failed';

export function isLoadingPhase(phase: AuthPhase): boolean {
  return phase === 'initializing' || phase === 'syncing' || phase === 'profile_loading';
}

export function deriveAuthPhase(input: {
  /** True only while the Better Auth session hook is pending AND no user payload is available yet */
  sessionPending: boolean;
  hasSession: boolean;
  /** Convex auth (`useConvexAuth`) still applying the JWT, or not authenticated */
  convexAuthLoading: boolean;
  isAuthenticated: boolean;
  /** Domain profile query is in flight (post-auth) */
  profileLoading: boolean;
  /** Domain profile could not be loaded after authentication */
  profileMissing: boolean;
  user: AuthUser | null;
}): AuthPhase {
  // Better Auth session not resolved yet.
  if (input.sessionPending && !input.hasSession) {
    return 'initializing';
  }
  // No Better Auth session at all.
  if (!input.hasSession) {
    return 'unauthenticated';
  }
  // Profile row missing after a successful auth — surface a retryable failure
  // instead of hanging. The hook keeps `user` populated from the Better Auth
  // session, so `hasSession` is true here.
  if (input.profileMissing) {
    return 'sync_failed';
  }
  // Authenticated but Convex hasn't applied the JWT yet (token in flight).
  if (!input.isAuthenticated || input.convexAuthLoading) {
    return 'syncing';
  }
  // Authenticated + Convex ready, but the domain profile query is still loading.
  if (input.profileLoading || !input.user) {
    return 'profile_loading';
  }
  return input.user.status === 'active' ? 'ready_active' : 'ready_pending';
}

/**
 * Layer role/status/agencyId from the Convex domain `users` row onto the
 * Better Auth user. Kept here so the hook stays declarative.
 */
export function mergeConvexProfile(baseUser: AuthUser, convexUser: {
  legacyId: string;
  role: string | null;
  status: string | null;
  agencyId: string | null;
} | null): AuthUser {
  if (!convexUser) {
    return baseUser;
  }
  return {
    ...baseUser,
    id: convexUser.legacyId,
    role: (convexUser.role as AuthUser['role']) || baseUser.role,
    status: (convexUser.status as AuthStatus) || baseUser.status,
    agencyId: convexUser.agencyId || baseUser.agencyId || convexUser.legacyId,
  };
}
