export async function bootstrapAndSyncSession(): Promise<void> {
  const bootstrapRes = await fetch('/api/auth/bootstrap', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
    credentials: 'include',
  })

  if (!bootstrapRes.ok) {
    const payload = await bootstrapRes.json().catch(() => null)
    throw new Error(payload?.data?.error ?? 'Failed to bootstrap user')
  }

  const sessionRes = await fetch('/api/auth/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  })

  if (!sessionRes.ok) {
    const payload = await sessionRes.json().catch(() => null)
    throw new Error(payload?.error ?? payload?.message ?? 'Failed to sync session')
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
    color = 'bg-red-500'
  } else if (passedChecks === 2) {
    score = 2
    label = 'Fair'
    color = 'bg-orange-500'
  } else if (passedChecks === 3) {
    score = 3
    label = 'Good'
    color = 'bg-yellow-500'
  } else if (passedChecks === 4) {
    score = 3
    label = 'Strong'
    color = 'bg-emerald-500'
  } else {
    score = 4
    label = 'Very Strong'
    color = 'bg-emerald-600'
  }

  return { score, label, color, checks }
}
