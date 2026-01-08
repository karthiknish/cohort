/**
 * Account Operations Helpers
 * 
 * Functions for account management: password reset, change, deletion
 */

import { auth } from '@/lib/firebase'
import {
    sendPasswordResetEmail,
    verifyPasswordResetCode as firebaseVerifyResetCode,
    confirmPasswordReset as firebaseConfirmReset,
    EmailAuthProvider,
    reauthenticateWithCredential,
    updatePassword,
    deleteUser,
} from 'firebase/auth'
import { isFirebaseError } from './utils'
import { getFriendlyAuthErrorMessage } from './error-utils'

/**
 * Password strength validation rules
 */
export interface PasswordValidationResult {
    valid: boolean
    errors: string[]
}

export function validatePasswordStrength(password: string): PasswordValidationResult {
    const errors: string[] = []

    if (password.length < 8) {
        errors.push('Password must be at least 8 characters long')
    }
    if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter')
    }
    if (!/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter')
    }
    if (!/[0-9]/.test(password)) {
        errors.push('Password must contain at least one number')
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        errors.push('Password must contain at least one special character')
    }

    return {
        valid: errors.length === 0,
        errors,
    }
}

/**
 * Throws an error if password is not strong enough
 */
export function assertPasswordStrength(password: string): void {
    const result = validatePasswordStrength(password)
    if (!result.valid) {
        throw new Error(result.errors[0])
    }
}

/**
 * Send password reset email
 */
export async function sendResetPasswordEmail(
    email: string,
    appUrl?: string
): Promise<void> {
    if (!email || !email.trim()) {
        throw new Error('Enter the email associated with your account')
    }

    const normalizedEmail = email.trim().toLowerCase()
    const resolvedAppUrl = appUrl ||
        process.env.NEXT_PUBLIC_APP_URL ||
        (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000')

    const actionCodeSettings = {
        url: `${resolvedAppUrl}/auth/reset`,
        handleCodeInApp: true
    }

    try {
        await sendPasswordResetEmail(auth, normalizedEmail, actionCodeSettings)
    } catch (error: unknown) {
        console.error('Password reset error:', error)
        if (isFirebaseError(error) && error.code === 'auth/user-not-found') {
            // Don't reveal if user exists
            return
        }
        throw new Error(getFriendlyAuthErrorMessage(error))
    }
}

/**
 * Verify password reset code
 */
export async function verifyResetCode(oobCode: string): Promise<string> {
    try {
        return await firebaseVerifyResetCode(auth, oobCode)
    } catch (error: unknown) {
        console.error('Password reset code verification error:', error)
        throw new Error(getFriendlyAuthErrorMessage(error))
    }
}

/**
 * Confirm password reset with new password
 */
export async function confirmReset(oobCode: string, newPassword: string): Promise<void> {
    try {
        await firebaseConfirmReset(auth, oobCode, newPassword)
    } catch (error: unknown) {
        console.error('Password reset confirmation error:', error)
        throw new Error(getFriendlyAuthErrorMessage(error))
    }
}

/**
 * Re-authenticate user with password
 */
export async function reauthenticateUser(password: string): Promise<void> {
    const user = auth.currentUser
    if (!user || !user.email) {
        throw new Error('No authenticated user')
    }

    const credential = EmailAuthProvider.credential(user.email, password)
    try {
        await reauthenticateWithCredential(user, credential)
    } catch (error: unknown) {
        console.error('Re-authentication error:', error)
        if (isFirebaseError(error) && error.code === 'auth/wrong-password') {
            throw new Error('Incorrect password')
        }
        throw new Error('Failed to re-authenticate')
    }
}

/**
 * Change user password
 */
export async function changeUserPassword(
    currentPassword: string,
    newPassword: string
): Promise<void> {
    if (!currentPassword || !newPassword) {
        throw new Error('Current and new passwords are required')
    }

    assertPasswordStrength(newPassword)

    try {
        await reauthenticateUser(currentPassword)
        const user = auth.currentUser
        if (!user) throw new Error('No authenticated user')
        await updatePassword(user, newPassword)
        console.log('Password changed successfully')
    } catch (error: unknown) {
        console.error('Password change error:', error)
        if (error instanceof Error) throw error
        throw new Error('Failed to change password')
    }
}

/**
 * Delete user account
 */
export async function deleteUserAccount(
    getIdToken: () => Promise<string>,
    password?: string
): Promise<void> {
    const user = auth.currentUser
    if (!user) throw new Error('No authenticated user')

    try {
        if (password) {
            await reauthenticateUser(password)
        }

        const token = await getIdToken()
        const response = await fetch('/api/auth/delete', {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })

        if (!response.ok) {
            const payload = (await response.json().catch(() => null)) as { error?: string } | null
            const message = payload?.error ?? 'Failed to delete account'
            throw new Error(message)
        }

        await deleteUser(user)
    } catch (error: unknown) {
        console.error('Account deletion error:', error)
        if (isFirebaseError(error) && error.code === 'auth/requires-recent-login') {
            throw new Error('This operation requires recent authentication. Please provide your password.')
        }
        if (error instanceof Error && error.message) {
            throw new Error(error.message)
        }
        throw new Error('Failed to delete account')
    }
}

/**
 * Disconnect an OAuth provider
 */
export async function disconnectProvider(
    providerId: string,
    getIdToken: () => Promise<string>
): Promise<void> {
    const token = await getIdToken()
    const response = await fetch('/api/integrations/disconnect', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ providerId }),
    })

    if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as { error?: string }
        const message = typeof payload?.error === 'string' ? payload.error : 'Failed to disconnect provider'
        throw new Error(message)
    }
}
