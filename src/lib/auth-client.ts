import { createAuthClient } from "better-auth/react";
import { convexClient } from "@convex-dev/better-auth/client/plugins";

export const authClient = createAuthClient({
    // Force same-origin auth calls via the TanStack Start proxy at /api/auth/*.
    // Without this, Better Auth's getBaseURL() may pick up BETTER_AUTH_URL /
    // NEXT_PUBLIC_BETTER_AUTH_URL / NEXT_PUBLIC_AUTH_URL from client-side env
    // and call Convex directly (*.convex.site). Cross-origin cookie scoping
    // then strips the session cookie, producing 401s on /convex/token every
    // 60s (Convex WebSocket serverInactivityThreshold reconnect cycle).
    baseURL: typeof window !== 'undefined' ? `${window.location.origin}/api/auth` : undefined,
    sessionOptions: {
        refetchInterval: 0,
        refetchOnWindowFocus: true,
        refetchWhenOffline: false,
    },
    plugins: [convexClient()],
});

// Wrap convex.token to log when the Convex client requests a JWT and whether
// it succeeded. This is the primary diagnostic for 60s-polling 401s: if the
// WebSocket reconnects (serverInactivityThreshold=60s) it re-fetches a token
// here. A 401 on this call means the session cookie is missing/expired.
if (typeof window !== 'undefined') {
    // Log the resolved baseURL so we can confirm the auth client is calling
    // the app origin (not Convex directly).
    console.warn('[auth-client] baseURL', (authClient as { baseURL?: string }).baseURL);
    type TokenResponse = { data?: { token?: string } };
    type TokenFn = (...args: unknown[]) => Promise<TokenResponse>;
    const convexPlugin = authClient.convex as { token?: TokenFn } | undefined;
    if (convexPlugin?.token) {
        const originalToken = convexPlugin.token.bind(convexPlugin) as TokenFn;
        convexPlugin.token = ((...args: unknown[]) => {
            const t0 = performance.now();
            return originalToken(...args).then((res: TokenResponse) => {
                const hasToken = Boolean(res?.data?.token);
                const ms = Math.round(performance.now() - t0);
                console.warn('[auth-client] convex.token', { hasToken, ms });
                return res;
            }).catch((error: unknown) => {
                console.warn('[auth-client] convex.token error', error instanceof Error ? error.message : error);
                throw error;
            });
        }) as TokenFn;
    }
}
