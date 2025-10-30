import type { OAuthCredential } from 'firebase/auth'

import type { AuthRole, AuthStatus, AuthUser } from './types'

export function isFirebaseError(error: unknown): error is { code: string } {
  return typeof error === 'object' && error !== null && 'code' in error && typeof (error as { code?: unknown }).code === 'string'
}

export function normalizeRole(value: unknown): AuthRole {
  switch (value) {
    case 'admin':
    case 'team':
    case 'client':
      return value
    case 'manager':
      return 'team'
    case 'member':
      return 'client'
    default:
      return 'client'
  }
}

export function normalizeStatus(value: unknown, fallback: AuthStatus = 'active'): AuthStatus {
  switch (value) {
    case 'active':
    case 'pending':
    case 'invited':
    case 'disabled':
    case 'suspended':
      return value
    case 'inactive':
    case 'blocked':
      return 'disabled'
    default:
      return fallback
  }
}

export function extractRefreshToken(
  credential: OAuthCredential | null,
  tokenResponse?: {
    oauthRefreshToken?: string
    refreshToken?: string
  }
): string | null {
  if (credential && typeof credential === 'object' && 'refreshToken' in credential) {
    const candidate = (credential as { refreshToken?: unknown }).refreshToken
    if (typeof candidate === 'string' && candidate.length > 0) {
      return candidate
    }
  }

  const oauthRefreshToken = tokenResponse?.oauthRefreshToken
  if (typeof oauthRefreshToken === 'string' && oauthRefreshToken.length > 0) {
    return oauthRefreshToken
  }

  const refreshToken = tokenResponse?.refreshToken
  if (typeof refreshToken === 'string' && refreshToken.length > 0) {
    return refreshToken
  }

  return null
}

export function isRole(value: unknown): value is AuthUser['role'] {
  return value === 'admin' || value === 'team' || value === 'client'
}

export function isStatus(value: unknown): value is AuthUser['status'] {
  return value === 'active' || value === 'pending' || value === 'invited' || value === 'disabled' || value === 'suspended'
}

export function getBrowserCookie(name: string): string | undefined {
  if (typeof document === 'undefined') {
    return undefined
  }

  const match = document.cookie
    .split(';')
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(`${name}=`))

  if (!match) {
    return undefined
  }

  try {
    return decodeURIComponent(match.split('=')[1] ?? '') || undefined
  } catch (error) {
    console.warn('Failed to decode cookie value', error)
    return undefined
  }
}
