import { createAuthClient } from "better-auth/react";
import { convexClient } from "@convex-dev/better-auth/client/plugins";
import { getPublicEnv } from "@/lib/public-env";

const authBaseURL = getPublicEnv('NEXT_PUBLIC_SITE_URL')
    ?? getPublicEnv('NEXT_PUBLIC_APP_URL')
    ?? (typeof window !== "undefined" ? window.location.origin : undefined);
export const authClient = createAuthClient({
    baseURL: authBaseURL,
    sessionOptions: {
        refetchInterval: 0,
        refetchOnWindowFocus: true,
        refetchWhenOffline: false,
    },
    plugins: [convexClient()],
});
