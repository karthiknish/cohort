'use client';
import { createContext, use, useCallback, useEffect, useMemo, type ReactNode } from 'react';
import type { AuthPhase } from '@/lib/auth-phase';
import { authService } from '@/services/auth';
import type { AuthUser, SignUpData } from '@/services/auth';
import { useAuthSync, type AuthError, type AuthErrorCode, } from '@/shared/hooks/use-auth-sync';
import { authClient } from '@/lib/auth-client';
import { setSentryUser } from '@/lib/sentry-capture';
export type { AuthError, AuthErrorCode };
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
export function AuthProvider({ children }: AuthProviderProps) {
    const { phase: authPhase, user, authError, clearAuthError, retrySync, resetSession, applySessionUser, loading, isSyncing, } = useAuthSync();
    // Sync authenticated user to Sentry so errors are attributed correctly.
    useEffect(() => {
        if (user) {
            setSentryUser({
                id: user.id,
                email: user.email,
                role: user.role,
            });
        } else {
            setSentryUser(null);
        }
    }, [user]);
    const signIn = (email: string, password: string): Promise<AuthUser> => {
        return authService
            .signIn(email, password)
            .then((authUser) => {
            applySessionUser(authUser);
            return authUser;
        });
    };
    const signUp = (data: SignUpData): Promise<AuthUser> => {
        return authService
            .signUp(data)
            .then((authUser) => {
            applySessionUser(authUser);
            return authUser;
        });
    };
    const signInWithGoogle = (callbackURL?: string): Promise<void> => {
        return authService.signInWithGoogle(callbackURL);
    };
    const signOut = (): Promise<void> => {
        return authService
            .signOut()
            .then(() => {
            resetSession();
        })
            .catch((error) => {
            resetSession();
            throw error;
        });
    };
    const resetPassword = async (email: string): Promise<void> => {
        void email;
        await authService.resetPassword();
    };
    const verifyPasswordResetCode = async (oobCode: string): Promise<string> => {
        void oobCode;
        return await authService.verifyPasswordResetCode();
    };
    const confirmPasswordReset = async (oobCode: string, newPassword: string): Promise<void> => {
        void oobCode;
        void newPassword;
        await authService.confirmPasswordReset();
    };
    const updateProfile = async (data: Partial<AuthUser>): Promise<AuthUser> => {
        const authUser = await authService.updateProfile(data);
        applySessionUser(authUser);
        return authUser;
    };
    const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
        void currentPassword;
        void newPassword;
        await authService.changePassword();
    };
    const deleteAccount = (): Promise<void> => {
        return authService
            .deleteAccount()
            .then(() => {
            resetSession();
        });
    };
    const connectGoogleAdsAccount = async () => {
        await authService.connectGoogleAdsAccount();
    };
    const connectGoogleAnalyticsAccount = async () => {
        await authService.connectGoogleAnalyticsAccount();
    };
    const connectFacebookAdsAccount = async () => {
        await authService.connectFacebookAdsAccount();
    };
    const connectLinkedInAdsAccount = async () => {
        await authService.connectLinkedInAdsAccount();
    };
    const startGoogleOauth = async (redirect?: string, clientId?: string | null) => {
        return await authService.startGoogleOauth(redirect, clientId);
    };
    const startGoogleWorkspaceOauth = async (redirect?: string) => {
        return await authService.startGoogleWorkspaceOauth(redirect);
    };
    const startMetaOauth = async (redirect?: string, clientId?: string | null, surface?: 'facebook' | 'instagram', entryPoint?: 'socials' | 'ads') => {
        return await authService.startMetaOauth(redirect, clientId, surface, entryPoint);
    };
    const startTikTokOauth = async (redirect?: string, clientId?: string | null) => {
        return await authService.startTikTokOauth(redirect, clientId);
    };
    const startLinkedInOauth = async (redirect?: string, clientId?: string | null) => {
        return await authService.startLinkedInOauth(redirect, clientId);
    };
    const disconnectProvider = async (providerId: string, clientId?: string | null) => {
        void providerId;
        void clientId;
        await authService.disconnectProvider();
    };
    const getIdToken = async () => {
        if (typeof window === 'undefined')
            return null;
        const result = await authClient.convex.token().catch(() => null);
        if (!result)
            return null;
        let payload: unknown = result;
        if (typeof result === 'object' && result !== null && 'data' in result) {
            payload = (result as {
                data?: unknown;
            }).data;
        }
        if (typeof payload !== 'object' || payload === null || !('token' in payload)) {
            return null;
        }
        const token = (payload as {
            token?: unknown;
        }).token;
        return typeof token === 'string' && token.trim().length > 0 ? token.trim() : null;
    };
    const value = ({
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
    });
    return (<AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>);
}
