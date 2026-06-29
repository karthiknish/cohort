'use client';
import type { ReactNode } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ConvexProvider, ConvexProviderWithAuth, ConvexReactClient, useConvexAuth } from 'convex/react';
import { AlertTriangle } from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import { getPublicEnv } from '@/lib/public-env';
import { assertConvexDeploymentsAligned } from '@/lib/convex-env';

// Custom useAuth hook that short-circuits before making network calls for unauthenticated users.
// This prevents the 401 cycle caused by stale JWT tokens being passed to Convex.
//
// CRITICAL: The useMemo that returns the auth state object MUST depend on primitive values
// (sessionId: string, isSessionPending: boolean, cachedToken: string|null) — NOT on the
// `session` object itself. Better Auth's useSession() can return a new object reference on
// every render even when the session data hasn't changed. If the session object is in the
// deps, the useMemo recomputes every render, Convex sees a "new" auth state every render,
// re-evaluates auth, destabilizes all queries, and hooks that setState during render
// (like useDirectConversationsQuery) enter an infinite loop → React error #301.
function useAuthFromBetterAuth(initialToken?: string | null) {
    const [cachedToken, setCachedToken] = useState<string | null>(initialToken ?? null);
    const cachedTokenRef = useRef(cachedToken);
    const sessionRef = useRef<unknown>(null);
    const pendingTokenRef = useRef<Promise<string | null> | null>(null);

    const { data: session, isPending: isSessionPending } = authClient.useSession();
    // Use the session ID (a primitive string) for all dependency comparisons.
    // This is stable across re-renders when the session hasn't actually changed.
    const sessionId = (session?.session?.id ?? null) as string | null;
    const hasSession = sessionId !== null;

    // Keep refs in sync with state — runs every render but only writes to refs (no loop risk)
    cachedTokenRef.current = cachedToken;
    sessionRef.current = session;

    // Clear cached token when session is invalidated — depend on sessionId (primitive), not session
    useEffect(() => {
        if (!hasSession && !isSessionPending && cachedToken) {
            setCachedToken(null);
        }
    }, [hasSession, isSessionPending, cachedToken]);

    const fetchAccessToken = useCallback(
        async ({ forceRefreshToken = false }: { forceRefreshToken?: boolean } = {}) => {
            // SHORT-CIRCUIT: If there's no session, don't make any network calls.
            // Use ref to ensure we always have the current session value.
            if (!sessionRef.current) {
                return null;
            }

            // Return cached token if available and not forcing refresh
            if (cachedTokenRef.current && !forceRefreshToken) {
                return cachedTokenRef.current;
            }

            // Deduplicate concurrent requests
            if (!forceRefreshToken && pendingTokenRef.current) {
                return pendingTokenRef.current;
            }

            // Fetch new token from Convex endpoint
            pendingTokenRef.current = authClient.convex
                .token({ fetchOptions: { throw: false } })
                .then(({ data }) => {
                    const token = data?.token || null;
                    setCachedToken(token);
                    return token;
                })
                .catch(() => {
                    setCachedToken(null);
                    return null;
                })
                .finally(() => {
                    pendingTokenRef.current = null;
                });

            return pendingTokenRef.current;
        },
        // Only depend on sessionId (primitive). When the session ID changes (login/logout),
        // we recreate the callback so it picks up the new sessionRef value.
        [sessionId]
    );

    return useMemo(
        () => ({
            isLoading: isSessionPending && !cachedToken,
            isAuthenticated: hasSession || cachedToken !== null,
            fetchAccessToken,
        }),
        // CRITICAL: Use primitives only (hasSession, isSessionPending, cachedToken).
        // Do NOT include the `session` object — it can be a new reference every render
        // even when unchanged, which would cause Convex to re-evaluate auth every render.
        [isSessionPending, hasSession, cachedToken, fetchAccessToken]
    );
}

function AuthDebug() {
    const { isLoading, isAuthenticated } = useConvexAuth();
    const prevRef = useRef<{ isLoading: boolean; isAuthenticated: boolean } | null>(null);
    useEffect(() => {
        const prev = prevRef.current;
        if (prev && (prev.isLoading !== isLoading || prev.isAuthenticated !== isAuthenticated)) {
            console.warn('[ConvexAuth] transition', { from: prev, to: { isLoading, isAuthenticated } });
        }
        prevRef.current = { isLoading, isAuthenticated };
    }, [isLoading, isAuthenticated]);
    return null;
}
interface ConvexClientProviderProps {
    children: ReactNode;
    initialToken?: string | null;
}

// Handle one-time token verification for cross-domain auth
function OneTimeTokenHandler({ authClient }: { authClient: typeof import('@/lib/auth-client').authClient }) {
    useEffect(() => {
        (async () => {
            if (typeof window === 'undefined' || !window.location?.href) {
                return;
            }
            const url = new URL(window.location.href);
            const token = url.searchParams.get('ott');
            if (token) {
                const authClientWithCrossDomain = authClient as typeof authClient & {
                    crossDomain?: {
                        oneTimeToken?: {
                            verify: (args: { token: string }) => Promise<{ data?: { session?: { token: string } } }>;
                        };
                    };
                    updateSession?: () => void;
                };
                url.searchParams.delete('ott');
                window.history.replaceState({}, '', url);
                const result = await authClientWithCrossDomain.crossDomain?.oneTimeToken?.verify({
                    token,
                });
                const session = result?.data?.session;
                if (session) {
                    await authClient.getSession({
                        fetchOptions: {
                            headers: {
                                Authorization: `Bearer ${session.token}`,
                            },
                        },
                    });
                    authClientWithCrossDomain.updateSession?.();
                }
            }
        })();
    }, [authClient]);
    return null;
}

export function ConvexClientProvider({ children, initialToken }: ConvexClientProviderProps) {
    const convexUrl = getPublicEnv('NEXT_PUBLIC_CONVEX_URL');
    const useBetterAuth = getPublicEnv('NEXT_PUBLIC_USE_BETTER_AUTH') !== 'false';
    const [client] = useState(() => {
        if (!convexUrl)
            return null;
        return new ConvexReactClient(convexUrl, { expectAuth: true });
    });

    // Use custom useAuth hook with ConvexProviderWithAuth instead of ConvexBetterAuthProvider
    const useAuth = useMemo(() => () => useAuthFromBetterAuth(initialToken), [initialToken]);

    if (!client) {
        if (process.env.NODE_ENV !== 'production') {
            console.warn('[convex] NEXT_PUBLIC_CONVEX_URL is not set; Convex client is disabled.');
        }
        return (<div className="flex min-h-screen items-center justify-center bg-background px-6 py-10">
        <div role="alert" aria-live="assertive" className="w-full max-w-xl rounded-2xl border border-destructive/40 bg-card p-8 text-center shadow-sm">
          <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="size-7 text-destructive" aria-hidden/>
          </div>
          <h1 className="mt-5 text-xl font-semibold text-foreground">Convex is not configured</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {process.env.NODE_ENV === 'production'
                ? 'Core data, authentication, and real-time features are unavailable because NEXT_PUBLIC_CONVEX_URL is missing from this deployment.'
                : 'Set NEXT_PUBLIC_CONVEX_URL in .env.local to enable Convex before loading the application UI.'}
          </p>
          <p className="mt-4 text-xs uppercase tracking-[0.2em] text-muted-foreground/80">
            Application unavailable until the data layer is configured
          </p>
        </div>
      </div>);
    }

    if (useBetterAuth) {
        // Non-fatal client-side mirror of the server guard: a deployment
        // split-brain (auth vs data on different Convex deployments) yields
        // silent 401s + infinite loading, so make it visible in the console.
        try {
            assertConvexDeploymentsAligned();
        }
        catch (error) {
            console.error('[convex] auth/data deployment misconfiguration:', error instanceof Error ? error.message : error);
        }

        return (
            <ConvexProviderWithAuth client={client} useAuth={useAuth}>
                <OneTimeTokenHandler authClient={authClient} />
                <AuthDebug />
                {children}
            </ConvexProviderWithAuth>
        );
    }

    return <ConvexProvider client={client}>{children}</ConvexProvider>;
}
