import { createAuthClient } from "better-auth/react";
import { convexClient } from "@convex-dev/better-auth/client/plugins";

export const authClient = createAuthClient({
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
