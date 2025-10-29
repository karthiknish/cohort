import { NextRequest } from 'next/server'

export interface AuthResult {
  uid: string | null
  email: string | null
  isCron: boolean
}

class AuthenticationError extends Error {
  status: number
  constructor(message: string, status = 401) {
    super(message)
    this.status = status
    this.name = 'AuthenticationError'
  }
}

async function verifyIdToken(idToken: string): Promise<{ uid: string; email: string | null }> {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY
  if (!apiKey) {
    throw new AuthenticationError('Firebase API key not configured', 500)
  }

  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
      cache: 'no-store',
    }
  )

  if (!response.ok) {
    throw new AuthenticationError('Invalid or expired token', 401)
  }

  const payload = await response.json()
  const users = Array.isArray(payload?.users) ? payload.users : []
  const user = users[0]
  const uid = user?.localId as string | undefined
  const email = typeof user?.email === 'string' ? user.email : null

  if (!uid) {
    throw new AuthenticationError('Unable to verify user identity', 401)
  }

  return { uid, email }
}

export async function authenticateRequest(request: NextRequest): Promise<AuthResult> {
  const cronSecret = process.env.INTEGRATIONS_CRON_SECRET
  const cronKey = request.headers.get('x-cron-key')

  if (cronSecret && cronKey && cronKey === cronSecret) {
    return { uid: null, email: null, isCron: true }
  }

  const authHeader = request.headers.get('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AuthenticationError('Missing Authorization header', 401)
  }

  const token = authHeader.slice(7)
  const { uid, email } = await verifyIdToken(token)
  return { uid, email, isCron: false }
}

export function assertAdmin(auth: AuthResult) {
  if (auth.isCron) return

  const admins = (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)

  if (!auth.email || !admins.includes(auth.email.toLowerCase())) {
    throw new AuthenticationError('Admin access required', 403)
  }
}

export { AuthenticationError }
