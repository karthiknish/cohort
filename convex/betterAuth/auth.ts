import { createClient } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import type { GenericCtx } from "@convex-dev/better-auth/utils";
import { betterAuth, type BetterAuthOptions } from "better-auth/minimal";

import { components } from '/_generated/api';
import type { DataModel } from '/_generated/dataModel';
import authConfig from "../auth.config";
import { buildTrustedOrigins, isConvexDevDeployment, isLocalDevUrl, normalizeOrigin } from "./origins";
import schema from "./schema";

export { buildTrustedOrigins } from "./origins";

type ConvexCompatibleBetterAuthOptions = BetterAuthOptions & {
  baseURL?: string;
};

type AuthOptionsConfig = {
  enforceSecureProductionUrl?: boolean;
};

const LOCAL_DEV_AUTH_ORIGIN = "http://localhost:3000";

function isStaticAuthBootstrap(ctx: GenericCtx<DataModel>): boolean {
  return Object.keys((ctx ?? {}) as object).length === 0;
}

function isSecureUrl(value: string | undefined | null): value is string {
  return typeof value === "string" && value.startsWith("https://");
}

function authOriginCandidates(): Array<string | undefined> {
  return [
    process.env.BETTER_AUTH_URL,
    process.env.SITE_URL,
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.NEXT_PUBLIC_APP_URL,
  ];
}

/** Public app origin for OAuth — must be the Next.js URL, never *.convex.site. */
function resolveAuthBaseUrl(): string {
  const localDev = authOriginCandidates().find(isLocalDevUrl);
  if (localDev) return normalizeOrigin(localDev) ?? LOCAL_DEV_AUTH_ORIGIN;

  const siteUrl =
    process.env.SITE_URL
    || process.env.BETTER_AUTH_URL
    || process.env.NEXT_PUBLIC_SITE_URL
    || process.env.NEXT_PUBLIC_APP_URL;

  return normalizeOrigin(siteUrl) ?? LOCAL_DEV_AUTH_ORIGIN;
}

/** Non-secret snapshot for GET /api/auth/ok (deployed auth debugging). */
export function getAuthHealthSnapshot(): {
  ok: true;
  baseURL: string;
  trustedOriginCount: number;
} {
  return {
    ok: true,
    baseURL: resolveAuthBaseUrl(),
    trustedOriginCount: buildTrustedOrigins().length,
  };
}

function resolveGoogleOAuthCredentials(): { clientId: string; clientSecret: string } | null {
  const clientId =
    process.env.GOOGLE_CLIENT_ID
    || process.env.GOOGLE_ADS_CLIENT_ID
    || undefined;
  const clientSecret =
    process.env.GOOGLE_CLIENT_SECRET
    || process.env.GOOGLE_ADS_CLIENT_SECRET
    || undefined;

  if (!clientId || !clientSecret) {
    return null;
  }

  return { clientId, clientSecret };
}

// Better Auth Component
export const authComponent = createClient<DataModel, typeof schema>(
  components.betterAuth,
  {
    local: { schema },
    // Logs options.baseURL on each auth request — disable after OAuth is verified.
    verbose: process.env.BETTER_AUTH_DEBUG === "true",
  },
);

// Build social providers dynamically based on Convex env vars (set via `npx convex env set`).
function buildSocialProviders() {
  const providers: Record<string, {
    clientId: string;
    clientSecret: string;
    prompt?: string;
  }> = {};

  const google = resolveGoogleOAuthCredentials();
  if (google) {
    providers.google = {
      ...google,
      prompt: "select_account",
    };
  }

  return providers;
}

// Better Auth Options
export const createAuthOptions = (
  ctx: GenericCtx<DataModel>,
  { enforceSecureProductionUrl = true }: AuthOptionsConfig = {},
): ConvexCompatibleBetterAuthOptions => {
  // Access env vars at runtime for Convex compatibility
  const baseURL = resolveAuthBaseUrl();
  const secret = process.env.BETTER_AUTH_SECRET;
  const isProduction = process.env.NODE_ENV === "production";
  const isSecureBaseUrl = isSecureUrl(baseURL);
  const isLocalDev = isLocalDevUrl(baseURL);
  const shouldEnforceSecureProductionUrl =
    enforceSecureProductionUrl
    && !isStaticAuthBootstrap(ctx)
    && !isConvexDevDeployment();

  if (!isStaticAuthBootstrap(ctx) && (!secret || secret.length < 32)) {
    throw new Error(
      "[betterAuth] BETTER_AUTH_SECRET must be set on the Convex deployment (32+ chars). "
      + 'Run: npx convex env set BETTER_AUTH_SECRET "$(openssl rand -base64 32)"',
    );
  }

  // Convex cloud sets NODE_ENV=production even for dev deployments; allow http://localhost.
  if (shouldEnforceSecureProductionUrl && isProduction && !isSecureBaseUrl && !isLocalDev) {
    throw new Error(
      "BETTER_AUTH_URL or SITE_URL must use https:// in production.",
    );
  }

  if (!isStaticAuthBootstrap(ctx) && !resolveGoogleOAuthCredentials()) {
    console.warn(
      "[betterAuth] Google sign-in is disabled. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET on the Convex deployment (npx convex env set).",
    );
  }

  const appOrigin = baseURL.replace(/\/$/, "");

  return {
    appName: "Cohorts",
    baseURL: appOrigin,
    secret,
    database: authComponent.adapter(ctx),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
    },
    socialProviders: buildSocialProviders(),
    trustedOrigins: buildTrustedOrigins(),
    session: {
      expiresIn: 60 * 60 * 24 * 7, // 7 days
      updateAge: 60 * 60 * 24, // Update session every 24 hours
      cookieCache: {
        enabled: true,
        maxAge: 60 * 5, // 5 minutes (short for security)
        strategy: "compact",
      },
    },
    account: {
      accountLinking: {
        enabled: true,
        trustedProviders: ["google"],
        allowDifferentEmails: false,
      },
    },
    rateLimit: {
      enabled: true,
      window: 60, // 1 minute window
      max: 10, // 10 requests per window for auth endpoints
      customRules: {
        "/sign-in/*": { window: 60, max: 5 },
        "/sign-up/*": { window: 60, max: 3 },
        "/forgot-password": { window: 300, max: 3 },
      },
    },
    advanced: {
      // Next.js proxies to Convex; forwarded host/proto must win over *.convex.site request URL.
      trustedProxyHeaders: true,
      useSecureCookies: isSecureBaseUrl && !isLocalDev,
    },
    onAPIError: {
      // Send OAuth errors to the Next.js app, not *.convex.site (which has no routes).
      errorURL: `${appOrigin}/auth`,
    },
    plugins: [convex({ authConfig })],
  };
};

// For `@better-auth/cli`
export const options = createAuthOptions({} as GenericCtx<DataModel>, {
  enforceSecureProductionUrl: false,
});

// Better Auth Instance
export const createAuth = (ctx: GenericCtx<DataModel>) => {
  return betterAuth(createAuthOptions(ctx));
};
