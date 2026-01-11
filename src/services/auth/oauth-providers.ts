/**
 * OAuth Provider Connection Helpers (legacy)
 *
 * Firebase popup OAuth flows are no longer supported after migrating to Better Auth.
 * Keep this module as a stub so any lingering imports fail loudly.
 */

import { ServiceUnavailableError } from '@/lib/api-errors'
import type { AuthUser } from './types'

export interface OAuthConnectionOptions {
  currentUser: unknown
  authUser: AuthUser | null
  clientId?: string | null
}

export interface OAuthSignInResult {
  user: unknown
  displayName: string | null
}

export async function connectGoogleAdsViaPopup(): Promise<void> {
  throw new ServiceUnavailableError('Google Ads popup OAuth is not supported; use server OAuth redirect flows')
}

export async function connectGoogleAnalyticsViaPopup(): Promise<void> {
  throw new ServiceUnavailableError('Google Analytics popup OAuth is not supported; use server OAuth redirect flows')
}

export async function connectMetaAdsViaPopup(): Promise<void> {
  throw new ServiceUnavailableError('Meta popup OAuth is not supported; use server OAuth redirect flows')
}

export async function connectLinkedInAdsViaPopup(): Promise<void> {
  throw new ServiceUnavailableError('LinkedIn popup OAuth is not supported; use server OAuth redirect flows')
}
