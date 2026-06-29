'use client';
import { createContext, use, useCallback, useEffect, useMemo, type ReactNode } from 'react';
import type { AuthPhase } from '@/lib/auth-phase';
import type { AuthUser, SignUpData } from '@/services/auth';
import { useAuthSync, type AuthError, type AuthErrorCode, } from '@/shared/hooks/use-auth-sync';
import { authClient } from '@/lib/auth-client';
import { setSentryUser } from '@/lib/sentry-capture';
import { getFriendlyAuthErrorMessage } from '@/services/auth/error-utils';
import {
  BadRequestError,
  SessionExpiredError,
  ServiceUnavailableError,
  UnauthorizedError,
} from '@/lib/api-errors';
import { composeAbortSignal, isTimeoutError } from '@/lib/retry-utils';
import { ResponseBodyParseError, parseJsonBody } from '@/lib/response-json';
import { isValidRedirectUrl } from '@/lib/utils';
import { logError } from '@/lib/convex-errors';
export type { AuthError, AuthErrorCode };

const OAUTH_START_TIMEOUT_MS = 15000;

interface AuthContextType {
    user: AuthUser | null;
    authPhase: AuthPhase;
    loading: boolean;
    isSyncing: boolean;
    authError: AuthError | null;
    clearAuthError: () => void;
    retrySync: () => Promise<void>;
    signIn: (email: string, password: string) => Promise<AuthUser>;
    signInWithGoogle: (callbackURL?: string) => Promise<void>;
    connectGoogleAdsAccount: () => Promise<void>;
    connectGoogleAnalyticsAccount: () => Promise<void>;
    connectFacebookAdsAccount: () => Promise<void>;
    connectLinkedInAdsAccount: () => Promise<void>;
    startGoogleOauth: (redirect?: string, clientId?: string | null) => Promise<{
        url: string;
    }>;
    startGoogleWorkspaceOauth: (redirect?: string) => Promise<{
        url: string;
    }>;
    startMetaOauth: (redirect?: string, clientId?: string | null, surface?: 'facebook' | 'instagram', entryPoint?: 'socials' | 'ads') => Promise<{
        url: string;
    }>;
    startTikTokOauth: (redirect?: string, clientId?: string | null) => Promise<{
        url: string;
    }>;
    startLinkedInOauth: (redirect?: string, clientId?: string | null) => Promise<{
        url: string;
    }>;
    disconnectProvider: (providerId: string, clientId?: string | null) => Promise<void>;
    getIdToken: () => Promise<string | null>;
    signUp: (data: SignUpData) => Promise<AuthUser>;
    signOut: () => Promise<void>;
    resetPassword: (email: string) => Promise<void>;
    verifyPasswordResetCode: (oobCode: string) => Promise<string>;
    confirmPasswordReset: (oobCode: string, newPassword: string) => Promise<void>;
    updateProfile: (data: Partial<AuthUser>) => Promise<AuthUser>;
    changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
    deleteAccount: () => Promise<void>;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);
export function useAuth() {
    const context = use(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
interface AuthProviderProps {
    children: ReactNode;
}

/** Fetch a Convex auth token so callers can `setAuth` a one-off ConvexHttpClient. */
async function fetchConvexToken(): Promise<string | null> {
    // Short-circuit: don't fetch token if there's no session
    const session = await authClient.getSession({ fetchOptions: { throw: false } });
    if (!session?.session) {
        return null;
    }

    const result = await authClient.convex.token().catch(() => null);
    if (!result) return null;
    let payload: unknown = result;
    if (typeof result === 'object' && result !== null && 'data' in result) {
        payload = (result as { data?: unknown }).data;
    }
    if (typeof payload !== 'object' || payload === null || !('token' in payload)) {
        return null;
    }
    const token = (payload as { token?: unknown }).token;
    return typeof token === 'string' && token.trim().length > 0 ? token.trim() : null;
}

/**
 * Better Auth client methods for password/account management. These exist at
 * runtime (the client is built dynamically from the auth options) but are not
 * surfaced on the inferred type, so we route through a narrow typed view.
 */
type BetterAuthCallResult = { error?: unknown; data?: unknown } | null | undefined;
type BetterAuthAccountClient = {
    forgetPassword: (args: { email: string; redirectTo?: string }) => Promise<BetterAuthCallResult>;
    resetPassword: (args: { token: string; newPassword: string }) => Promise<BetterAuthCallResult>;
    changePassword: (args: { currentPassword: string; newPassword: string }) => Promise<BetterAuthCallResult>;
    deleteUser: () => Promise<BetterAuthCallResult>;
    updateUser: (args: { name?: string; image?: string }) => Promise<BetterAuthCallResult>;
};
const accountClient = authClient as unknown as BetterAuthAccountClient;
function throwIfError(result: BetterAuthCallResult): void {
    if (result && typeof result === 'object' && 'error' in result && result.error) {
        throw new BadRequestError(getFriendlyAuthErrorMessage(result.error));
    }
}

/** POST to an integration OAuth start endpoint with timeout + a single 401 retry. */
async function startIntegrationOauth(
    path: string,
    search: string,
): Promise<{ url: string }> {
    const { signal, cleanup } = composeAbortSignal({ timeoutMs: OAUTH_START_TIMEOUT_MS });
    try {
        const doFetch = () => fetch(`${path}${search}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            signal,
        });
        let response = await doFetch();
        if (response.status === 401) {
            // Force-refresh the Better Auth session, then retry once.
            await authClient.getSession({ query: { disableCookieCache: true } }).catch(() => null);
            response = await doFetch();
        }
        const payload = await parseJsonBody<unknown>(response, { context: path });
        if (payload && typeof payload === 'object' && 'success' in payload) {
            const record = payload as { success: boolean; data?: unknown; error?: unknown };
            if (!record.success) {
                const message = typeof record.error === 'string' ? record.error : 'Failed to start OAuth';
                throw response.status === 401 ? new SessionExpiredError(message) : new BadRequestError(message);
            }
            const data = record.data as { url?: unknown } | undefined;
            if (typeof data?.url === 'string' && data.url.length > 0) {
                return { url: data.url };
            }
        }
        if (!response.ok) {
            const record = payload as { error?: unknown } | undefined;
            const message = typeof record?.error === 'string' ? record.error : 'Failed to start OAuth';
            throw response.status === 401 ? new SessionExpiredError(message) : new BadRequestError(message);
        }
        const legacy = payload as { url?: unknown } | undefined;
        if (typeof legacy?.url === 'string' && legacy.url.length > 0) return { url: legacy.url };
        throw new ServiceUnavailableError('OAuth did not return a URL');
    }
    catch (error: unknown) {
        if (error instanceof ResponseBodyParseError
            || error instanceof BadRequestError
            || error instanceof SessionExpiredError
            || error instanceof ServiceUnavailableError) {
            throw error;
        }
        if (isTimeoutError(error)) {
            throw new ServiceUnavailableError('The authentication service took too long to respond.');
        }
        throw new ServiceUnavailableError('Failed to start OAuth. Please try again.');
    }
    finally {
        cleanup();
    }
}

function buildSearch(redirect?: string, clientId?: string | null, extra?: Record<string, string | undefined>): string {
    const params = new URLSearchParams();
    if (redirect && !isValidRedirectUrl(redirect)) {
        throw new BadRequestError('Invalid redirect URL');
    }
    if (redirect) params.set('redirect', redirect);
    if (clientId) params.set('clientId', clientId);
    if (extra) {
        for (const [k, v] of Object.entries(extra)) {
            if (v) params.set(k, v);
        }
    }
    const s = params.toString();
    return s ? `?${s}` : '';
}

export function AuthProvider({ children }: AuthProviderProps) {
    const { phase: authPhase, user, authError, clearAuthError, retrySync, loading, isSyncing } = useAuthSync();

    // Sync authenticated user to Sentry so errors are attributed correctly.
    const sentrySync = useCallback((u: AuthUser | null) => {
        if (u) {
            setSentryUser({ id: u.id, email: u.email, role: u.role });
        } else {
            setSentryUser(null);
        }
    }, []);
    useEffect(() => { sentrySync(user); }, [user, sentrySync]);

    const signIn = useCallback(async (email: string, password: string): Promise<AuthUser> => {
        const result = await authClient.signIn.email({ email: email.trim(), password });
        const errorInResult = result && typeof result === 'object' && 'error' in result
            ? (result as { error?: unknown }).error
            : null;
        if (errorInResult) {
            const message = getFriendlyAuthErrorMessage(errorInResult);
            throw new BadRequestError(message);
        }
        const data = result && typeof result === 'object' && 'data' in result
            ? (result as { data?: { user?: Record<string, unknown> | null } | null }).data
            : null;
        if (!data?.user) {
            throw new BadRequestError('Sign-in failed. Please try again.');
        }
        // useSession() reactivity updates `user` on the next tick; return a
        // mapped snapshot so the caller (auth page redirect) has the id immediately.
        const raw = data.user as Record<string, unknown>;
        const id = typeof raw.id === 'string' ? raw.id : '';
        return {
            id,
            email: typeof raw.email === 'string' ? raw.email : email,
            name: typeof raw.name === 'string' ? raw.name : email,
            phoneNumber: null,
            photoURL: typeof raw.image === 'string' ? raw.image : null,
            role: 'client',
            status: 'pending',
            agencyId: id,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
    }, []);

    const signUp = useCallback(async (signUpData: SignUpData): Promise<AuthUser> => {
        const result = await authClient.signUp.email({
            email: signUpData.email.trim(),
            password: signUpData.password,
            name: signUpData.displayName ?? signUpData.email,
        });
        const errorInResult = result && typeof result === 'object' && 'error' in result
            ? (result as { error?: unknown }).error
            : null;
        if (errorInResult) {
            const message = getFriendlyAuthErrorMessage(errorInResult);
            throw new BadRequestError(message);
        }
        const data = result && typeof result === 'object' && 'data' in result
            ? (result as { data?: { user?: Record<string, unknown> | null } | null }).data
            : null;
        if (!data?.user) {
            throw new BadRequestError('Sign-up failed. Please try again.');
        }
        const raw = data.user as Record<string, unknown>;
        const id = typeof raw.id === 'string' ? raw.id : '';
        return {
            id,
            email: typeof raw.email === 'string' ? raw.email : signUpData.email,
            name: typeof raw.name === 'string' ? raw.name : signUpData.email,
            phoneNumber: null,
            photoURL: typeof raw.image === 'string' ? raw.image : null,
            role: 'client',
            status: 'pending',
            agencyId: id,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
    }, []);

    const signInWithGoogle = useCallback(async (callbackURL = '/dashboard'): Promise<void> => {
        await authClient.signIn.social({ provider: 'google', callbackURL });
    }, []);

    const signOut = useCallback(async (): Promise<void> => {
        await authClient.signOut().catch((error: unknown) => {
            logError(error, 'AuthProvider.signOut');
        });
    }, []);

    const resetPassword = useCallback(async (email: string): Promise<void> => {
        const result = await accountClient.forgetPassword({ email: email.trim(), redirectTo: '/auth/reset' });
        throwIfError(result);
    }, []);

    const verifyPasswordResetCode = useCallback(async (oobCode: string): Promise<string> => {
        // Better Auth issues a signed JWT for password reset. Reject empty or
        // obviously-invalid tokens immediately so the caller shows the error form
        // early instead of only discovering the problem on password submission.
        if (!oobCode || oobCode.length < 10) {
            throw new BadRequestError('Invalid or expired reset link. Please request a new one.');
        }
        // The token is well-formed — return an empty email since Better Auth's
        // resetPassword call validates the signature server-side. The caller
        // proceeds to show the password form and only gets an error on submit
        // if the token has expired or been consumed.
        return '';
    }, []);

    const confirmPasswordReset = useCallback(async (oobCode: string, newPassword: string): Promise<void> => {
        const result = await accountClient.resetPassword({ token: oobCode, newPassword });
        throwIfError(result);
    }, []);

    const updateProfile = useCallback(async (data: Partial<AuthUser>): Promise<AuthUser> => {
        const result = await accountClient.updateUser({
            name: data.name,
            image: data.photoURL ?? undefined,
        });
        throwIfError(result);
        // The reactive useSession() will refresh the canonical user; return a
        // merged snapshot for the caller.
        if (!user) throw new UnauthorizedError('No authenticated user');
        return { ...user, ...data, updatedAt: new Date().toISOString() };
    }, [user]);

    const changePassword = useCallback(async (currentPassword: string, newPassword: string): Promise<void> => {
        const result = await accountClient.changePassword({ currentPassword, newPassword });
        throwIfError(result);
    }, []);

    const deleteAccount = useCallback(async (): Promise<void> => {
        const result = await accountClient.deleteUser();
        throwIfError(result);
        await authClient.signOut().catch(() => null);
    }, []);

    // Integration OAuth-start endpoints (NOT login) — these remain custom app
    // routes that mint per-provider OAuth URLs server-side.
    const startGoogleOauth = useCallback(async (redirect?: string, clientId?: string | null) => {
        return startIntegrationOauth('/api/integrations/google/oauth/url', buildSearch(redirect, clientId));
    }, []);
    const startGoogleWorkspaceOauth = useCallback(async (redirect?: string) => {
        return startIntegrationOauth('/api/integrations/google-workspace/oauth/url', buildSearch(redirect));
    }, []);
    const startMetaOauth = useCallback(async (
        redirect?: string, clientId?: string | null,
        surface?: 'facebook' | 'instagram', entryPoint?: 'socials' | 'ads',
    ) => {
        return startIntegrationOauth('/api/integrations/meta/oauth/url', buildSearch(redirect, clientId, { surface, entryPoint }));
    }, []);
    const startTikTokOauth = useCallback(async (redirect?: string, clientId?: string | null) => {
        return startIntegrationOauth('/api/integrations/tiktok/oauth/url', buildSearch(redirect, clientId));
    }, []);
    const startLinkedInOauth = useCallback(async (redirect?: string, clientId?: string | null) => {
        return startIntegrationOauth('/api/integrations/linkedin/oauth/url', buildSearch(redirect, clientId));
    }, []);

    const disconnectProvider = useCallback(async (_providerId: string, _clientId?: string | null): Promise<void> => {
        throw new ServiceUnavailableError('Provider disconnect must be implemented with Better Auth');
    }, []);
    const connectGoogleAdsAccount = useCallback(async (): Promise<void> => {
        throw new ServiceUnavailableError('Popup integrations require Better Auth OAuth setup');
    }, []);
    const connectGoogleAnalyticsAccount = useCallback(async (): Promise<void> => {
        throw new ServiceUnavailableError('Popup integrations require Better Auth OAuth setup');
    }, []);
    const connectFacebookAdsAccount = useCallback(async (): Promise<void> => {
        throw new ServiceUnavailableError('Popup integrations require Better Auth OAuth setup');
    }, []);
    const connectLinkedInAdsAccount = useCallback(async (): Promise<void> => {
        throw new ServiceUnavailableError('Popup integrations require Better Auth OAuth setup');
    }, []);

    const getIdToken = useCallback(async (): Promise<string | null> => {
        if (typeof window === 'undefined') return null;
        return fetchConvexToken();
    }, []);

    const value = useMemo<AuthContextType>(() => ({
        user,
        authPhase,
        loading,
        isSyncing,
        authError,
        clearAuthError,
        retrySync,
        signIn,
        signInWithGoogle,
        connectGoogleAdsAccount,
        connectGoogleAnalyticsAccount,
        connectFacebookAdsAccount,
        connectLinkedInAdsAccount,
        startGoogleOauth,
        startGoogleWorkspaceOauth,
        startMetaOauth,
        startTikTokOauth,
        startLinkedInOauth,
        disconnectProvider,
        getIdToken,
        signUp,
        signOut,
        resetPassword,
        verifyPasswordResetCode,
        confirmPasswordReset,
        updateProfile,
        changePassword,
        deleteAccount,
    }), [
        user, authPhase, loading, isSyncing, authError,
        clearAuthError, retrySync,
        signIn, signInWithGoogle, signUp, signOut,
        connectGoogleAdsAccount, connectGoogleAnalyticsAccount,
        connectFacebookAdsAccount, connectLinkedInAdsAccount,
        startGoogleOauth, startGoogleWorkspaceOauth,
        startMetaOauth, startTikTokOauth, startLinkedInOauth,
        disconnectProvider, getIdToken,
        resetPassword, verifyPasswordResetCode,
        confirmPasswordReset, updateProfile,
        changePassword, deleteAccount,
    ]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
