import { createAuthClient } from "better-auth/react";
import { convexClient, crossDomainClient } from "@convex-dev/better-auth/client/plugins";

// The Convex site URL is where Better Auth runs (*.convex.site)
// For cross-domain setups, we need to explicitly set the baseURL
const convexSiteUrl = process.env.NEXT_PUBLIC_CONVEX_SITE_URL ?? process.env.NEXT_PUBLIC_CONVEX_HTTP_URL;

export const authClient = createAuthClient({
  // Point to Convex site where Better Auth is hosted
  baseURL: convexSiteUrl,
  plugins: [
    convexClient(),
    // Cross-domain plugin stores session in localStorage since cookies can't be shared across domains
    crossDomainClient(),
  ],
});
