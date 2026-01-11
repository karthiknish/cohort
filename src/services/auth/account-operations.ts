/**
 * Account operations (legacy)
 *
 * These functions previously used Firebase + Bearer token authenticated API calls.
 * With Better Auth migration, these operations must be implemented server-side and
 * authenticated via cookies.
 */

import { ServiceUnavailableError } from '@/lib/api-errors'
import type { AuthUser } from './types'

export async function sendPasswordResetEmail(): Promise<void> {
  throw new ServiceUnavailableError('Password reset must be implemented with Better Auth')
}

export async function verifyPasswordResetCode(): Promise<string> {
  throw new ServiceUnavailableError('Password reset must be implemented with Better Auth')
}

export async function confirmPasswordReset(): Promise<void> {
  throw new ServiceUnavailableError('Password reset must be implemented with Better Auth')
}

export async function updateProfile(currentUser: AuthUser): Promise<AuthUser> {
  return currentUser
}

export async function changePassword(): Promise<void> {
  throw new ServiceUnavailableError('Password change must be implemented with Better Auth')
}

export async function deleteAccount(): Promise<void> {
  throw new ServiceUnavailableError('Account deletion must be implemented with Better Auth')
}

export async function disconnectProvider(): Promise<void> {
  throw new ServiceUnavailableError('Provider disconnect must be implemented with Better Auth')
}

export function validatePasswordStrength(): void {
  throw new ServiceUnavailableError('Password validation must be implemented with Better Auth')
}
