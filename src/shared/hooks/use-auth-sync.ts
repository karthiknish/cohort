'use client';
import { useMemo, useState } from 'react';
import { useConvexAuth, useQuery } from 'convex/react';
import { authClient } from '@/lib/auth-client';
import { deriveAuthPhase, isLoadingPhase, mergeConvexProfile, type AuthPhase } from '@/lib/auth-phase';
import type { AuthUser } from '@/services/auth';
import { api } from '@convex/_generated/api';

export type AuthErrorCode = 'SESSION_SYNC_FAILED' | 'NETWORK_ERROR' | 'UNAUTHORIZED' | 'RATE_LIMITED' | 'SERVER_ERROR' | 'UNKNOWN';
export interface AuthError {
    code: AuthErrorCode;
    message: string;
    details?: Record<string, unknown>;
    retryable: boolean;
}
function createAuthError(code: AuthErrorCode, message: string, details?: Record<string, unknown>, retryable = false): AuthError {
    return { code, message, details, retryable };
}

function normalizeRole(value: unknown): AuthUser['role'] {
    return value === 'admin' || value === 'team' || value === 'client' ? value : 'client';
}
function normalizeStatus(value: unknown): AuthUser['status'] {
    return value === 'active' || value === 'pending' || value === 'invited' || value === 'disabled' || value === 'suspended'
        ? value
        : 'pending';
}

/**
 * Maps a Better Auth session user onto the app's `AuthUser`. role/status/agencyId
 * default until the Convex domain profile query overlays the real values.
 */
function mapSessionUser(raw: Record<string, unknown>): AuthUser {
    const id = typeof raw.id === 'string' ? raw.id : '';
    const email = typeof raw.email === 'string' ? raw.email : '';
    const name = typeof raw.name === 'string' ? raw.name : email;
    return {
        id,
        email,
        name,
        phoneNumber: null,
        photoURL: typeof raw.image === 'string' ? raw.image : null,
        role: normalizeRole((raw as { role?: unknown }).role),
        status: normalizeStatus((raw as { status?: unknown }).status),
        agencyId: typeof (raw as { agencyId?: unknown }).agencyId === 'string'
            ? String((raw as { agencyId?: unknown }).agencyId)
            : id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
}

/**
 * Official Convex + Better Auth session sync.
 *
 * Uses the official `@convex-dev/better-auth` pattern:
 * - `useConvexAuth()` for authentication state (isLoading, isAuthenticated)
 * - `authClient.useSession()` for the Better Auth user payload
 * - `api.users.getByLegacyIdSafe` for the domain profile (role/status/agencyId)
 *
 * The `legacyId` is the Better Auth user `id`, which is also the JWT `sub` and
 * the `legacyId` in the app `users` table (synced via `createAuthFunctions`
 * triggers in `convex/betterAuth/auth.ts`).
 */
export function useAuthSync() {
    const [authError, setAuthError] = useState<AuthError | null>(null);

    const { data: betterAuthSession, isPending: sessionPending, refetch: refetchSession } = authClient.useSession();
    const { isAuthenticated, isLoading: convexAuthLoading } = useConvexAuth();

    // The authoritative legacyId IS the Better Auth user id. The
    // @convex-dev/better-auth plugin sets `user._id` as the Convex JWT `sub`,
    // and the triggers in `convex/betterAuth/auth.ts` sync it to the app
    // `users` table as `legacyId`.
    const legacyId = betterAuthSession?.user?.id ?? null;

    // Domain profile: role/status/agencyId. Only queried once Convex auth is
    // ready and we have a legacyId (the query is identity-gated server-side).
    const convexUser = useQuery(
        api.users.getByLegacyIdSafe,
        legacyId && isAuthenticated ? { legacyId } : 'skip',
    );

    const hasSession = Boolean(betterAuthSession?.user);
    const profileLoading = isAuthenticated && (legacyId === null || convexUser === undefined);
    // Profile is only "missing" if Convex auth is ready, the query returned
    // null (not undefined), and we've waited long enough for triggers to run.
    const profileMissing = Boolean(legacyId)
        && isAuthenticated
        && !convexAuthLoading
        && convexUser === null;

    const user = useMemo<AuthUser | null>(() => {
        const rawUser = betterAuthSession?.user;
        if (!rawUser) return null;
        const base = mapSessionUser(rawUser as Record<string, unknown>);
        if (convexUser) {
            return mergeConvexProfile(base, convexUser);
        }
        return base;
    }, [betterAuthSession?.user, convexUser]);

    const phase: AuthPhase = deriveAuthPhase({
        sessionPending,
        hasSession,
        convexAuthLoading,
        isAuthenticated,
        profileLoading,
        profileMissing,
        user,
    });

    const retrySync = async () => {
        setAuthError(null);
        await refetchSession().catch(() => null);
    };
    const clearAuthError = () => setAuthError(null);

    return {
        phase,
        user,
        authError,
        clearAuthError,
        retrySync,
        loading: isLoadingPhase(phase),
        isSyncing: phase === 'syncing' || phase === 'profile_loading',
    };
}
