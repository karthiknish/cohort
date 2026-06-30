'use client';

import { LoaderCircle } from 'lucide-react';
import { Link } from '@/shared/ui/link';
import { usePathname, useRouter } from '@/shared/ui/navigation';
import { useEffect } from 'react';
import { useConvexAuth } from 'convex/react';
import { authClient } from '@/lib/auth-client';
import { useAuth } from '@/shared/contexts/auth-context';
import { Button } from '@/shared/ui/button';
import { SiteLogo } from '@/shared/components/site-logo';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'team' | 'client';
  allowPreviewAccess?: boolean;
}

function hasRequiredRole(userRole: string, requiredRole?: string): boolean {
  const roleHierarchy: Record<string, number> = { client: 0, team: 1, admin: 2 };
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

function AccessOverlay({
  title,
  message,
  actionHref,
  actionLabel,
  actionOnClick,
  secondaryActionLabel,
  secondaryActionOnClick,
  actionVariant = 'default',
  showSpinner,
  showLogo,
}: AccessOverlayProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-16">
      <div className="w-full max-w-md rounded-lg border border-border bg-background p-8 text-center shadow-sm">
        {showLogo ? (
          <div className="mb-8 flex justify-center">
            <SiteLogo size="wordmarkXl" />
          </div>
        ) : null}
        {showSpinner ? (
          <div className="mb-4 flex justify-center">
            <LoaderCircle className="size-6 animate-spin text-primary" />
          </div>
        ) : null}
        <h2 className="mb-2 text-lg font-semibold text-foreground">{title}</h2>
        <p className="text-sm text-muted-foreground">{message}</p>
        {actionLabel || secondaryActionLabel ? (
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-center">
            {actionLabel ? (
              actionHref ? (
                <Button asChild variant={actionVariant}>
                  <Link href={actionHref}>{actionLabel}</Link>
                </Button>
              ) : (
                <Button variant={actionVariant} onClick={actionOnClick}>
                  {actionLabel}
                </Button>
              )
            ) : null}
            {secondaryActionLabel ? (
              <Button variant="outline" onClick={secondaryActionOnClick}>
                {secondaryActionLabel}
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}

/**
 * Client-side route guard using the official Convex + Better Auth hooks.
 * Gates on `useConvexAuth()` (isLoading, isAuthenticated) and
 * `authClient.useSession()` for the user payload.
 */
export function ProtectedRoute({ children, requiredRole, allowPreviewAccess = false }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { user, authPhase } = useAuth();
  const { replace } = useRouter();
  const pathname = usePathname();

  // Redirect to /auth when unauthenticated — in an effect to avoid
  // calling navigate during render (which causes infinite loops with
  // useRouter's per-render function reference).
  useEffect(() => {
    if (allowPreviewAccess || isLoading || isAuthenticated) return;
    const redirectParam = pathname ? `?redirect=${encodeURIComponent(pathname)}` : '';
    replace(`/auth${redirectParam}`);
  }, [allowPreviewAccess, isLoading, isAuthenticated, pathname, replace]);

  if (allowPreviewAccess) {
    return <>{children}</>;
  }

  if (isLoading || authPhase === 'loading') {
    return (
      <AccessOverlay
        title="Loading your workspace"
        message="Just a moment while we secure your account and verify your permissions."
        showLogo
        showSpinner
      />
    );
  }

  if (!isAuthenticated) {
    return (
      <AccessOverlay
        title="Signing you in"
        message="Redirecting to the sign-in page..."
        showLogo
        showSpinner
      />
    );
  }

  if (!user) {
    return (
      <AccessOverlay
        title="Loading your workspace"
        message="Just a moment while we secure your account and verify your permissions."
        showLogo
        showSpinner
      />
    );
  }

  if (requiredRole) {
    if (!hasRequiredRole(user.role, requiredRole)) {
      return (
        <AccessOverlay
          title="Insufficient permissions"
          message="You do not have the required role to access this area."
          actionLabel="Back to dashboard"
          actionHref="/for-you"
        />
      );
    }
  }

  return <>{children}</>;
}
