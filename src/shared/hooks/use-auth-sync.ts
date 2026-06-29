'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useConvexAuth, useMutation, useQuery } from 'convex/react';
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
 * Composes the standard signals (`authClient.useSession()` + `useConvexAuth()`)
 * with a single Convex query for the domain profile (`api.users.getByLegacyIdSafe`).
 * First-touch profile creation runs through the identity-gated
 * `api.users.ensureProfileOnSignIn` mutation — no custom bootstrap endpoint,
 * no CSRF, no session-cookie polling.
 *
 * `legacyId` is derived from the Convex JWT subject (the authoritative value
 * that the Convex server sees as `identity.subject`), so it always matches the
 * `getByLegacyIdSafe` identity guard. It falls back to the Better Auth user id,
 * which the convex plugin sets as the JWT `sub`.
 */
export function useAuthSync() {
    const [authError, setAuthError] = useState<AuthError | null>(null);
    // Track whether we've already attempted the first-touch profile creation for
    // the current legacyId so we don't loop on a persistently-missing row.
    const bootstrappedLegacyIdRef = useRef<string | null>(null);

    const { data: betterAuthSession, isPending: sessionPending, refetch: refetchSession } = authClient.useSession();
    const { isAuthenticated, isLoading: convexAuthLoading } = useConvexAuth();

    // The authoritative legacyId IS the Better Auth user id. The
    // @convex-dev/better-auth plugin sets `user._id` as the Convex JWT `sub`,
    // so this value always matches what `getByLegacyIdSafe`'s identity guard
    // sees on the server. No async token fetch needed — the session object is
    // available synchronously on the first render, which eliminates the race
    // where the domain profile query waits for a deferred JWT decode.
    const legacyId = betterAuthSession?.user?.id ?? null;

    // Domain profile: role/status/agencyId. Only queried once Convex auth is
    // ready and we have a legacyId (the query is identity-gated server-side).
    const convexUser = useQuery(
        api.users.getByLegacyIdSafe,
        legacyId && isAuthenticated ? { legacyId } : 'skip',
    );

    const ensureProfile = useMutation(api.users.ensureProfileOnSignIn);

    const hasSession = Boolean(betterAuthSession?.user);
    const profileLoading = isAuthenticated && (legacyId === null || convexUser === undefined);
    // Only treat as missing after a bootstrap attempt has been made for this
    // legacyId. Otherwise the phase flips to sync_failed before the upsert
    // has a chance to run, causing a flash of the error screen on first login.
    const profileMissing = Boolean(legacyId)
        && isAuthenticated
        && !convexAuthLoading
        && convexUser === null
        && bootstrappedLegacyIdRef.current === legacyId;

    // First-touch profile creation: when authenticated but the domain row is
    // missing, run the identity-gated upsert exactly once per legacyId.
    useEffect(() => {
        if (!isAuthenticated || !legacyId || convexUser !== null) {
            return;
        }
        // Query still loading (undefined) — wait for it to resolve.
        if (convexUser === undefined) {
            return;
        }
        if (bootstrappedLegacyIdRef.current === legacyId) {
            // Already attempted for this account and still missing — surface
            // error only once. Setting a new error object on every render
            // would cause an infinite re-render loop (#301).
            setAuthError((prev) => prev ?? createAuthError(
                'SESSION_SYNC_FAILED',
                'Your workspace profile could not be loaded. Please try again or contact support.',
                undefined,
                true,
            ));
            return;
        }
        bootstrappedLegacyIdRef.current = legacyId;
        void ensureProfile({ legacyId }).catch((error: unknown) => {
            setAuthError(createAuthError(
                'SESSION_SYNC_FAILED',
                error instanceof Error ? error.message : 'Failed to set up your workspace.',
                undefined,
                true,
            ));
        });
    }, [isAuthenticated, legacyId, convexUser, ensureProfile]);

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
        bootstrappedLegacyIdRef.current = null;
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
