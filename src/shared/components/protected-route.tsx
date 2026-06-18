'use client';
import { LoaderCircle } from 'lucide-react';
import { Link } from '@/shared/ui/link';
import { usePathname, useRouter } from '@/shared/ui/navigation';
import { useEffect, useEffectEvent, useRef } from 'react';
import { isLoadingPhase } from '@/lib/auth-phase';
import { Button } from '@/shared/ui/button';
import { SiteLogo } from '@/shared/components/site-logo';
import { useAuth } from '@/shared/contexts/auth-context';
import { dismissToast, notifyFailure, notifySuccess, notifyWarning, } from '@/lib/notifications';
const SESSION_DURATION_MS = 2 * 60 * 60 * 1000;
const SESSION_WARNING_WINDOW_MS = SESSION_DURATION_MS / 10;
const SESSION_WARNING_TOAST_ID = 'session-expiry-warning';
const SESSION_EXPIRED_TOAST_ID = 'session-expired';
interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredRole?: 'admin' | 'team' | 'client';
    allowPreviewAccess?: boolean;
}
type SessionMetadata = {
    hasSession: boolean;
    expiresAt: number | null;
    csrfToken: string | null;
};
async function fetchSessionMetadata(): Promise<SessionMetadata | null> {
    try {
        const response = await fetch('/api/auth/session', {
            method: 'GET',
            credentials: 'include',
            headers: {
                Accept: 'application/json',
                'Cache-Control': 'no-store',
            },
        });
        if (!response.ok) {
            return null;
        }
        const payload = await response.json() as {
            hasSession?: unknown;
            expiresAt?: unknown;
            csrfToken?: unknown;
        };
        return {
            hasSession: payload.hasSession === true,
            expiresAt: typeof payload.expiresAt === 'number' && Number.isFinite(payload.expiresAt)
                ? payload.expiresAt
                : null,
            csrfToken: typeof payload.csrfToken === 'string' && payload.csrfToken.length > 0
                ? payload.csrfToken
                : null,
        };
    }
    catch {
        return null;
    }
}
async function refreshSession(): Promise<SessionMetadata | null> {
    const metadata = await fetchSessionMetadata();
    if (!metadata?.csrfToken) {
        return null;
    }
    const response = await fetch('/api/auth/session', {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            'x-csrf-token': metadata.csrfToken,
        },
        body: '{}',
    });
    if (!response.ok) {
        return null;
    }
    return await fetchSessionMetadata();
}
function hasRequiredRole(userRole: string, requiredRole?: string): boolean {
    const roleHierarchy: Record<string, number> = {
        client: 0,
        team: 1,
        admin: 2,
    };
    const userRoleLevel = userRole ? roleHierarchy[userRole] ?? 0 : 0;
    const requiredRoleLevel = requiredRole ? roleHierarchy[requiredRole] ?? 0 : 0;
    return userRoleLevel >= requiredRoleLevel;
}
interface AccessOverlayProps {
    title: string;
    message: string;
    actionLabel?: string;
    actionHref?: string;
    actionOnClick?: () => void;
    secondaryActionLabel?: string;
    secondaryActionOnClick?: () => void;
    actionVariant?: 'default' | 'outline';
    showSpinner?: boolean;
    showLogo?: boolean;
}
function AccessOverlay({ title, message, actionHref, actionLabel, actionOnClick, secondaryActionLabel, secondaryActionOnClick, actionVariant = 'default', showSpinner, showLogo, }: AccessOverlayProps) {
    return (<div className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-16">
      <div className="w-full max-w-md rounded-lg border border-border bg-background p-8 text-center shadow-sm">
        {showLogo ? (<div className="mb-8 flex justify-center">
            <SiteLogo size="wordmarkXl"/>
          </div>) : null}
        {showSpinner ? (<div className="mb-4 flex justify-center">
            <LoaderCircle className="size-6 animate-spin text-primary"/>
          </div>) : null}
        <h2 className="mb-2 text-lg font-semibold text-foreground">{title}</h2>
        <p className="text-sm text-muted-foreground">{message}</p>
        {actionLabel || secondaryActionLabel ? (<div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-center">
            {actionLabel ? (actionHref ? (<Button asChild variant={actionVariant}>
                  <Link href={actionHref}>{actionLabel}</Link>
                </Button>) : (<Button variant={actionVariant} onClick={actionOnClick}>
                  {actionLabel}
                </Button>)) : null}
            {secondaryActionLabel ? (<Button variant="outline" onClick={secondaryActionOnClick}>
                {secondaryActionLabel}
              </Button>) : null}
          </div>) : null}
      </div>
    </div>);
}
export function ProtectedRoute({ children, requiredRole, allowPreviewAccess = false }: ProtectedRouteProps) {
    const { user, authPhase, authError, retrySync, signOut } = useAuth();
    const { replace } = useRouter();
    const pathname = usePathname();
    const hasPreviewAccess = allowPreviewAccess;
    const warningTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const expiryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const clearSessionTimers = useEffectEvent(() => {
        if (warningTimerRef.current) {
            clearTimeout(warningTimerRef.current);
            warningTimerRef.current = null;
        }
        if (expiryTimerRef.current) {
            clearTimeout(expiryTimerRef.current);
            expiryTimerRef.current = null;
        }
    });
    const redirectToAuth = () => {
        const redirectParam = pathname ? `?redirect=${encodeURIComponent(pathname)}` : '';
        replace(`/auth${redirectParam}`);
    };
    const handleRetrySync = () => {
        void retrySync();
    };
    const handleSignOutAfterSyncFailure = () => {
        void signOut().finally(() => {
            redirectToAuth();
        });
    };
    useEffect(() => {
        return () => {
            clearSessionTimers();
            dismissToast(SESSION_WARNING_TOAST_ID);
            dismissToast(SESSION_EXPIRED_TOAST_ID);
        };
    }, []);
    const handleSessionExpired = useEffectEvent(() => {
        clearSessionTimers();
        dismissToast(SESSION_WARNING_TOAST_ID);
        notifyFailure({
            id: SESSION_EXPIRED_TOAST_ID,
            title: 'Session expired',
            message: 'Please sign in again to continue where you left off.',
            duration: 6000,
        });
        void signOut().finally(() => {
            redirectToAuth();
        });
    });
    const scheduleSessionPromptsRef = useRef<(metadata: SessionMetadata | null) => void>(() => {});
    const scheduleSessionPrompts = useEffectEvent((metadata: SessionMetadata | null) => {
        clearSessionTimers();
        if (!metadata?.hasSession || !metadata.expiresAt) {
            return;
        }
        const remainingMs = metadata.expiresAt - Date.now();
        if (remainingMs <= 0) {
            handleSessionExpired();
            return;
        }
        const showWarning = () => {
            notifyWarning({
                id: SESSION_WARNING_TOAST_ID,
                title: 'Session ending soon',
                message: 'Stay signed in to keep working without interruption.',
                duration: 0,
                action: {
                    label: 'Stay signed in',
                    onClick: () => {
                        void refreshSession()
                            .then((nextMetadata) => {
                            if (!nextMetadata?.hasSession || !nextMetadata.expiresAt) {
                                throw new Error('Session refresh failed');
                            }
                            notifySuccess({
                                id: SESSION_WARNING_TOAST_ID,
                                title: 'Session extended',
                                message: 'Your workspace session is active again.',
                                duration: 4000,
                            });
                            scheduleSessionPromptsRef.current(nextMetadata);
                        })
                            .catch(() => {
                            notifyFailure({
                                id: SESSION_WARNING_TOAST_ID,
                                title: 'Could not extend session',
                                message: 'Please save your work and sign in again before the session expires.',
                                duration: 6000,
                            });
                        });
                    },
                },
            });
        };
        if (remainingMs <= SESSION_WARNING_WINDOW_MS) {
            showWarning();
        }
        else {
            warningTimerRef.current = setTimeout(showWarning, remainingMs - SESSION_WARNING_WINDOW_MS);
        }
        expiryTimerRef.current = setTimeout(() => {
            handleSessionExpired();
        }, remainingMs);
    });
    useEffect(() => {
        scheduleSessionPromptsRef.current = scheduleSessionPrompts;
    });
    useEffect(() => {
        if (hasPreviewAccess || authPhase !== 'ready_active' || !user) {
            clearSessionTimers();
            dismissToast(SESSION_WARNING_TOAST_ID);
            return;
        }
        let cancelled = false;
        const syncSessionExpiry = async () => {
            if (cancelled || hasPreviewAccess || authPhase !== 'ready_active' || !user) {
                return;
            }
            const metadata = await fetchSessionMetadata();
            if (cancelled)
                return;
            scheduleSessionPrompts(metadata);
        };
        void syncSessionExpiry();
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                void syncSessionExpiry();
            }
        };
        const handleFocus = () => {
            void syncSessionExpiry();
        };
        window.addEventListener('focus', handleFocus);
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            cancelled = true;
            clearSessionTimers();
            window.removeEventListener('focus', handleFocus);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [authPhase, hasPreviewAccess, user]);
    const redirectedPendingRef = useRef(false);
    useEffect(() => {
        if (hasPreviewAccess ||
            authPhase !== 'ready_pending' ||
            pathname === '/pending-approval' ||
            redirectedPendingRef.current) {
            return;
        }
        redirectedPendingRef.current = true;
        const status = user?.status ?? 'pending';
        window.location.href = `/pending-approval?status=${encodeURIComponent(status)}`;
    }, [authPhase, hasPreviewAccess, pathname, user?.status]);
    const redirectedUnauthRef = useRef(false);
    useEffect(() => {
        if (hasPreviewAccess ||
            authPhase !== 'unauthenticated' ||
            pathname === '/auth' ||
            redirectedUnauthRef.current) {
            return;
        }
        redirectedUnauthRef.current = true;
        redirectToAuth();
    }, [authPhase, hasPreviewAccess, pathname]);
    if (hasPreviewAccess) {
        return <>{children}</>;
    }
    if (isLoadingPhase(authPhase)) {
        return (<AccessOverlay title="Loading your workspace" message="Just a moment while we secure your account and verify your permissions." showLogo showSpinner/>);
    }
    if (authPhase === 'sync_failed') {
        return (<AccessOverlay title="Could not connect your workspace" message={authError?.message ?? 'We could not finish securing your session. Try again or sign in once more.'} actionLabel="Retry" actionOnClick={handleRetrySync} secondaryActionLabel="Sign out" secondaryActionOnClick={handleSignOutAfterSyncFailure}/>);
    }
    if (authPhase === 'unauthenticated') {
        return (<AccessOverlay title="Signing you in" message="Redirecting to the sign-in page..." showLogo showSpinner/>);
    }
    if (authPhase === 'ready_pending') {
        return (<AccessOverlay title="Checking account access" message="Taking you to your account status page so you can review the next steps." showLogo showSpinner/>);
    }
    if (authPhase !== 'ready_active' || !user) {
        return (<AccessOverlay title="Loading your workspace" message="Just a moment while we secure your account and verify your permissions." showLogo showSpinner/>);
    }
    if (requiredRole && !hasRequiredRole(user.role, requiredRole)) {
        return (<AccessOverlay title="Insufficient permissions" message="You do not have the required role to access this area." actionLabel="Back to dashboard" actionHref="/for-you"/>);
    }
    return <>{children}</>;
}
