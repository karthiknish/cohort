import { apiFetch, ApiClientError } from '@/lib/api-client'
import { authClient } from '@/lib/auth-client'

/**
 * Starts Better Auth Google OAuth (proxied to Convex via /api/auth).
 * Redirects the browser; does not return on success.
 */
export async function startGoogleOAuthSignIn(callbackURL: string): Promise<void> {
  await authClient.signIn.social({
    provider: 'google',
    callbackURL,
  })
}

export type BootstrapProfile = {
  legacyId: string
  role: 'admin' | 'team' | 'client'
  status: 'active' | 'pending' | 'invited' | 'disabled' | 'suspended'
  agencyId: string
}

function normalizeBootstrapRole(value: unknown): BootstrapProfile['role'] {
  if (value === 'admin' || value === 'team' || value === 'client') {
    return value
  }
  return 'client'
}

function normalizeBootstrapStatus(value: unknown): BootstrapProfile['status'] {
  if (
    value === 'active'
    || value === 'pending'
    || value === 'invited'
    || value === 'disabled'
    || value === 'suspended'
  ) {
    return value
  }
  return 'pending'
}

function unwrapBootstrapPayload(payload: unknown): Record<string, unknown> {
  if (!payload || typeof payload !== 'object') {
    return {}
  }

  const record = payload as Record<string, unknown>
  if (record.data && typeof record.data === 'object') {
    return record.data as Record<string, unknown>
  }

  return record
}

/**
 * Single sign-in bootstrap: Convex profile upsert + cohorts_* session cookies (7-day TTL).
 * No follow-up /api/auth/session round-trip — cookies are set on the bootstrap response.
 */
export async function bootstrapAndSyncSession(): Promise<BootstrapProfile> {
  let bootstrapPayload: unknown
  try {
    bootstrapPayload = await apiFetch('/api/auth/bootstrap', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
      credentials: 'include',
    })
  } catch (error) {
    const message = error instanceof ApiClientError ? error.message : 'Failed to bootstrap user'
    throw new Error(message)
  }

  const record = unwrapBootstrapPayload(bootstrapPayload)
  const legacyId = typeof record.legacyId === 'string' && record.legacyId.length > 0
    ? record.legacyId
    : null
  const agencyId = typeof record.agencyId === 'string' && record.agencyId.length > 0
    ? record.agencyId
    : null

  if (!legacyId) {
    throw new Error('Bootstrap response missing user id')
  }

  return {
    legacyId,
    role: normalizeBootstrapRole(record.role),
    status: normalizeBootstrapStatus(record.status),
    agencyId: agencyId ?? legacyId,
  }
}

let bootstrapCache: BootstrapProfile | null = null
let bootstrapPromise: Promise<BootstrapProfile> | null = null

/** Runs bootstrap once per page session (dedupes AuthService + useAuthSync). */
export async function bootstrapAndSyncSessionOnce(): Promise<BootstrapProfile> {
  if (bootstrapCache) {
    return bootstrapCache
  }

  if (!bootstrapPromise) {
    bootstrapPromise = bootstrapAndSyncSession()
      .then((profile) => {
        bootstrapCache = profile
        return profile
      })
      .catch((error) => {
        bootstrapCache = null
        throw error
      })
      .finally(() => {
        bootstrapPromise = null
      })
  }

  return bootstrapPromise
}

export function resetBootstrapSessionCache(): void {
  bootstrapCache = null
  bootstrapPromise = null
}

export type PasswordStrength = {
  score: number
  label: string
  color: string
  checks: {
    length: boolean
    uppercase: boolean
    lowercase: boolean
    number: boolean
    special: boolean
  }
}

export function calculatePasswordStrength(password: string): PasswordStrength {
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  }

  const passedChecks = Object.values(checks).filter(Boolean).length

  let score: number
  let label: string
  let color: string

  if (password.length === 0) {
    score = 0
    label = ''
    color = 'bg-muted'
  } else if (passedChecks <= 1) {
    score = 1
    label = 'Weak'
    color = 'bg-destructive'
  } else if (passedChecks === 2) {
    score = 2
    label = 'Fair'
    color = 'bg-warning'
  } else if (passedChecks === 3) {
    score = 3
    label = 'Good'
    color = 'bg-info'
  } else if (passedChecks === 4) {
    score = 3
    label = 'Strong'
    color = 'bg-success'
  } else {
    score = 4
    label = 'Very Strong'
    color = 'bg-success'
  }

  return { score, label, color, checks }
}
