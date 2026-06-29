'use client';
import { LoaderCircle } from 'lucide-react';
import { Link } from '@/shared/ui/link';
import { usePathname, useRouter } from '@/shared/ui/navigation';
import { useEffect, useRef, useState } from 'react';
import { isLoadingPhase } from '@/lib/auth-phase';
import { Button } from '@/shared/ui/button';
import { SiteLogo } from '@/shared/components/site-logo';
import { useAuth } from '@/shared/contexts/auth-context';
interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredRole?: 'admin' | 'team' | 'client';
    allowPreviewAccess?: boolean;
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

/**
 * Client-side route guard for authed layouts.
 *
 * Gates purely on the official Convex + Better Auth signals exposed via
 * `useAuth()` (authPhase + profile status). There is no custom session
 * polling, CSRF, or expiry-timer logic here — Better Auth's cookieCache +
 * updateAge handle session freshness, and Convex's AuthenticationManager
 * refreshes the JWT on its own schedule. Status redirects (pending/disabled)
 * are driven by the resolved domain profile, not a cookie.
 */
export function ProtectedRoute({ children, requiredRole, allowPreviewAccess = false }: ProtectedRouteProps) {
    const { user, authPhase, authError, retrySync, signOut } = useAuth();
    const { replace } = useRouter();
    const pathname = usePathname();

    // If auth stays in a loading phase for too long, surface retry/sign-out
    // options instead of spinning forever (e.g. deploy propagation, network
    // issues, or stuck Convex auth).
    const [loadingTimedOut, setLoadingTimedOut] = useState(false);
    useEffect(() => {
        if (!isLoadingPhase(authPhase)) {
            return;
        }
        const timer = window.setTimeout(() => setLoadingTimedOut(true), 20000);
        return () => window.clearTimeout(timer);
    }, [authPhase]);
    const hasPreviewAccess = allowPreviewAccess;

    const redirectToAuth = () => {
        const redirectParam = pathname ? `?redirect=${encodeURIComponent(pathname)}` : '';
        replace(`/auth${redirectParam}`);
    };
    const handleRetrySync = () => {
        setLoadingTimedOut(false);
        void retrySync();
    };
    const handleSignOutAfterSyncFailure = () => {
        void signOut().finally(() => {
            redirectToAuth();
        });
    };

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
    if (loadingTimedOut) {
        return (<AccessOverlay title="Loading is taking longer than expected" message="Your session could not be verified. Try again or sign in once more." actionLabel="Retry" actionOnClick={handleRetrySync} secondaryActionLabel="Sign out" secondaryActionOnClick={handleSignOutAfterSyncFailure}/>);
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
