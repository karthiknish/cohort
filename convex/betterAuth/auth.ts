import { createClient } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import type { GenericCtx } from "@convex-dev/better-auth/utils";
import type { BetterAuthOptions } from "better-auth";
import { betterAuth } from "better-auth";

import { components } from '/_generated/api';
import type { DataModel } from '/_generated/dataModel';
import authConfig from "../auth.config";
import schema from "./schema";

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

function isLocalDevUrl(value: string | undefined | null): value is string {
  return typeof value === "string" && /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(value);
}

function shouldForceLocalhostAuthOrigin(): boolean {
  return [
    process.env.BETTER_AUTH_URL,
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.SITE_URL,
    process.env.NEXT_PUBLIC_SITE_URL,
  ].some(isLocalDevUrl);
}

function resolveAuthBaseUrl(): string | undefined {
  const explicitBaseUrl = process.env.BETTER_AUTH_URL;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  const convexSiteUrl =
    process.env.NEXT_PUBLIC_CONVEX_SITE_URL
    || process.env.NEXT_PUBLIC_CONVEX_HTTP_URL
    || process.env.CONVEX_SITE_URL;
  const siteUrl = process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL;

  if (shouldForceLocalhostAuthOrigin()) return LOCAL_DEV_AUTH_ORIGIN;

  if (isSecureUrl(explicitBaseUrl)) return explicitBaseUrl;
  if (isSecureUrl(appUrl)) return appUrl;
  if (isSecureUrl(siteUrl)) return siteUrl;
  if (isSecureUrl(convexSiteUrl)) return convexSiteUrl;

  return explicitBaseUrl || appUrl || siteUrl || convexSiteUrl || undefined;
}

// Better Auth Component
export const authComponent = createClient<DataModel, typeof schema>(
  components.betterAuth,
  {
    local: { schema },
    verbose: false,
  },
);

// Build social providers dynamically based on available env vars
function buildSocialProviders() {
  const providers: Record<string, { clientId: string; clientSecret: string }> = {};

  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    providers.google = {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    };
  }

  return providers;
}

// Build trusted origins from env
function buildTrustedOrigins(): string[] {
  if (shouldForceLocalhostAuthOrigin()) {
    return [LOCAL_DEV_AUTH_ORIGIN];
  }

  const origins = new Set<string>();

  const explicitBaseUrl = process.env.BETTER_AUTH_URL;
  const siteUrl = process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  const convexSiteUrl =
    process.env.NEXT_PUBLIC_CONVEX_SITE_URL
    || process.env.NEXT_PUBLIC_CONVEX_HTTP_URL
    || process.env.CONVEX_SITE_URL;

  if (explicitBaseUrl) origins.add(explicitBaseUrl);
  if (siteUrl) origins.add(siteUrl);
  if (appUrl) origins.add(appUrl);
  if (convexSiteUrl) origins.add(convexSiteUrl);

  return [...origins];
}

// Better Auth Options
export const createAuthOptions = (
  ctx: GenericCtx<DataModel>,
  { enforceSecureProductionUrl = true }: AuthOptionsConfig = {},
): ConvexCompatibleBetterAuthOptions => {
  // Access env vars at runtime for Convex compatibility
  const siteUrl = process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL;
  const baseURL = resolveAuthBaseUrl();
  const secret = process.env.BETTER_AUTH_SECRET;
  const isProduction = process.env.NODE_ENV === "production";
  const isSecureBaseUrl = isSecureUrl(baseURL);
  const shouldEnforceSecureProductionUrl =
    enforceSecureProductionUrl && !isStaticAuthBootstrap(ctx);

  if (shouldEnforceSecureProductionUrl && isProduction && !isSecureBaseUrl) {
    throw new Error("BETTER_AUTH_URL or SITE_URL must use https:// in production.");
  }

  return {
    appName: "Cohorts",
    baseURL: baseURL || siteUrl,
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
      useSecureCookies: isProduction || isSecureBaseUrl,
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
