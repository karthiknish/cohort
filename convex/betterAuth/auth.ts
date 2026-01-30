import { createClient } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import type { GenericCtx } from "@convex-dev/better-auth/utils";
import type { BetterAuthOptions } from "better-auth";
import { betterAuth } from "better-auth";

import { components } from "../_generated/api";
import type { DataModel } from "../_generated/dataModel";
import authConfig from "../auth.config";
import schema from "./schema";

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
  const origins: string[] = [];

  const siteUrl = process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (siteUrl) origins.push(siteUrl);
  if (appUrl && appUrl !== siteUrl) origins.push(appUrl);

  // Add localhost for development
  if (process.env.NODE_ENV !== "production") {
    origins.push("http://localhost:3000");
  }

  return origins;
}

// Better Auth Options
export const createAuthOptions = (ctx: GenericCtx<DataModel>): BetterAuthOptions => {
  // Access env vars at runtime for Convex compatibility
  const siteUrl = process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL;
  const baseURL = process.env.BETTER_AUTH_URL || siteUrl;
  const secret = process.env.BETTER_AUTH_SECRET;
  const isSecureBaseUrl = typeof baseURL === "string" && baseURL.startsWith("https://");

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
      useSecureCookies: isSecureBaseUrl,
    },
    plugins: [convex({ authConfig })],
  };
};

// For `@better-auth/cli`
export const options = createAuthOptions({} as GenericCtx<DataModel>);

// Better Auth Instance
export const createAuth = (ctx: GenericCtx<DataModel>) => {
  return betterAuth(createAuthOptions(ctx));
};
