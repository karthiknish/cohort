import { createAuthClient } from "better-auth/react";
import { convexClient } from "@convex-dev/better-auth/client/plugins";

// For Next.js, we point to our own API route which proxies to Convex
// This allows cookies to work properly (same-origin)
export const authClient = createAuthClient({
  baseURL: typeof window !== 'undefined'
    ? window.location.origin
    : process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  fetchOptions: {
    credentials: 'include',
  },
  // Point to the Next.js API route (same origin), not directly to Convex
  // The /api/auth/[...all] route proxies requests to Convex
  plugins: [
    convexClient(),
  ],
});
