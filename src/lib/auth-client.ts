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

if (typeof window !== 'undefined') {
    console.warn('[auth-client] baseURL', (authClient as { baseURL?: string }).baseURL);
}
