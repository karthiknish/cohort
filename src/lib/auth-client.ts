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
