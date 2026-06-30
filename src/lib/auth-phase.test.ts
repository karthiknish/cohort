import { describe, expect, it } from 'vitest';
import { deriveAuthPhase, isLoadingPhase } from './auth-phase';
const baseUser = {
    id: 'user-1',
    email: 'test@example.com',
    name: 'Test',
    phoneNumber: null,
    photoURL: null,
    role: 'admin' as const,
    status: 'active' as const,
    agencyId: 'agency-1',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
};

describe('deriveAuthPhase', () => {
    it('returns initializing while the Better Auth session is pending', () => {
        expect(deriveAuthPhase({
            sessionPending: true,
            hasSession: false,
            convexAuthLoading: false,
            isAuthenticated: false,
            profileLoading: false,
            profileMissing: false,
            user: null,
        })).toBe('initializing');
    });

    it('returns unauthenticated with no session', () => {
        expect(deriveAuthPhase({
            sessionPending: false,
            hasSession: false,
            convexAuthLoading: false,
            isAuthenticated: false,
            profileLoading: false,
            profileMissing: false,
            user: null,
        })).toBe('unauthenticated');
    });

    it('stays syncing until Convex auth has applied the JWT', () => {
        expect(deriveAuthPhase({
            sessionPending: false,
            hasSession: true,
            convexAuthLoading: false,
            isAuthenticated: false,
            profileLoading: false,
            profileMissing: false,
            user: baseUser,
        })).toBe('syncing');
    });

    it('enters profile_loading once authenticated but before the domain row resolves', () => {
        expect(deriveAuthPhase({
            sessionPending: false,
            hasSession: true,
            convexAuthLoading: false,
            isAuthenticated: true,
            profileLoading: true,
            profileMissing: false,
            user: baseUser,
        })).toBe('profile_loading');
    });

    it('reaches ready_active when authenticated with an active profile', () => {
        expect(deriveAuthPhase({
            sessionPending: false,
            hasSession: true,
            convexAuthLoading: false,
            isAuthenticated: true,
            profileLoading: false,
            profileMissing: false,
            user: baseUser,
        })).toBe('ready_active');
    });

    it('reaches ready_pending for a non-active profile', () => {
        expect(deriveAuthPhase({
            sessionPending: false,
            hasSession: true,
            convexAuthLoading: false,
            isAuthenticated: true,
            profileLoading: false,
            profileMissing: false,
            user: { ...baseUser, status: 'pending' },
        })).toBe('ready_pending');
    });

    it('surfaces sync_failed when the profile is missing after auth', () => {
        expect(deriveAuthPhase({
            sessionPending: false,
            hasSession: true,
            convexAuthLoading: false,
            isAuthenticated: true,
            profileLoading: false,
            profileMissing: true,
            user: baseUser,
        })).toBe('sync_failed');
    });
});

describe('isLoadingPhase', () => {
    it('treats initializing / syncing / profile_loading as loading', () => {
        expect(isLoadingPhase('initializing')).toBe(true);
        expect(isLoadingPhase('syncing')).toBe(true);
        expect(isLoadingPhase('profile_loading')).toBe(true);
    });
    it('treats terminal phases as not loading', () => {
        expect(isLoadingPhase('ready_active')).toBe(false);
        expect(isLoadingPhase('ready_pending')).toBe(false);
        expect(isLoadingPhase('unauthenticated')).toBe(false);
        expect(isLoadingPhase('sync_failed')).toBe(false);
    });
});
