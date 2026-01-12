import { betterAuth } from 'better-auth'

let cachedAuth: ReturnType<typeof betterAuth> | null = null

function hasValidSecret(secret: string | undefined): secret is string {
  return typeof secret === 'string' && secret.trim().length >= 32
}

export function getBetterAuthOrNull() {
  const secret = process.env.BETTER_AUTH_SECRET
  if (!hasValidSecret(secret)) {
    return null
  }

  if (cachedAuth) {
    return cachedAuth
  }

  const baseURL =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    'http://localhost:3000'

  // Build social providers config dynamically based on available env vars
  const socialProviders: Record<string, { clientId: string; clientSecret: string }> = {}

  const googleClientId = process.env.GOOGLE_CLIENT_ID
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET
  if (googleClientId && googleClientSecret) {
    socialProviders.google = {
      clientId: googleClientId,
      clientSecret: googleClientSecret,
    }
  }

  cachedAuth = betterAuth({
    secret,
    baseURL,
    emailAndPassword: {
      enabled: true,
    },
    socialProviders,
    // Stateless mode is enabled automatically when no database is configured.
    session: {
      cookieCache: {
        enabled: true,
        // 7 days cache duration (seconds)
        maxAge: 7 * 24 * 60 * 60,
        strategy: 'compact',
        refreshCache: true,
      },
    },
    account: {
      storeStateStrategy: 'cookie',
      storeAccountCookie: true,
    },
  })

  return cachedAuth
}

export function getBetterAuth() {
  const auth = getBetterAuthOrNull()
  if (!auth) {
    throw new Error(
      'Better Auth is not configured. Set BETTER_AUTH_SECRET (>= 32 chars) and NEXT_PUBLIC_SITE_URL.'
    )
  }
  return auth
}
