import { apiFetch, ApiClientError } from '@/lib/api-client'

const CSRF_HEADER = 'x-csrf-token'

type SessionMetadata = {
  csrfToken?: string | null
}

async function fetchSessionCsrfToken(): Promise<string> {
  const session = await apiFetch<SessionMetadata>('/api/auth/session', {
    method: 'GET',
    credentials: 'include',
  })

  const csrfToken = typeof session?.csrfToken === 'string' ? session.csrfToken : ''
  if (!csrfToken) {
    throw new Error('Missing CSRF token')
  }

  return csrfToken
}

export async function bootstrapAndSyncSession(): Promise<void> {
  try {
    await apiFetch('/api/auth/bootstrap', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
      credentials: 'include',
    })
  } catch (error) {
    const message = error instanceof ApiClientError ? error.message : 'Failed to bootstrap user'
    throw new Error(message)
  }

  try {
    const csrfToken = await fetchSessionCsrfToken()

    await apiFetch('/api/auth/session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        [CSRF_HEADER]: csrfToken,
      },
      body: JSON.stringify({}),
      credentials: 'include',
    })
  } catch (error) {
    const message = error instanceof ApiClientError ? error.message : 'Failed to sync session'
    throw new Error(message)
  }
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