import { auth } from '@/lib/firebase'
import {
    sendPasswordResetEmail as firebaseSendPasswordResetEmail,
    verifyPasswordResetCode as firebaseVerifyPasswordResetCode,
    confirmPasswordReset as firebaseConfirmPasswordReset,
    updateProfile as updateFirebaseProfile,
    EmailAuthProvider,
    reauthenticateWithCredential,
    updatePassword as firebaseUpdatePassword,
    deleteUser as firebaseDeleteUser,
    User as FirebaseUser,
} from 'firebase/auth'
import { toISO } from '@/lib/dates'
import { isFirebaseError } from './utils'
import { getFriendlyAuthErrorMessage } from './error-utils'
import type { AuthUser } from './types'

/**
 * Send a password reset email
 */
export async function sendPasswordResetEmail(email: string): Promise<void> {
    if (!email || !email.trim()) {
        throw new Error('Enter the email associated with your account')
    }

    const normalizedEmail = email.trim().toLowerCase()
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ||
        (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000')

    const actionCodeSettings = {
        url: `${appUrl}/auth/reset`,
        handleCodeInApp: true
    }

    try {
        await firebaseSendPasswordResetEmail(auth, normalizedEmail, actionCodeSettings)
    } catch (error: unknown) {
        console.error('Password reset error:', error)
        if (isFirebaseError(error) && error.code === 'auth/user-not-found') {
            return
        }
        throw new Error(getFriendlyAuthErrorMessage(error))
    }
}

/**
 * Verify a password reset code
 */
export async function verifyPasswordResetCode(oobCode: string): Promise<string> {
    try {
        return await firebaseVerifyPasswordResetCode(auth, oobCode)
    } catch (error: unknown) {
        console.error('Password reset code verification error:', error)
        throw new Error(getFriendlyAuthErrorMessage(error))
    }
}

/**
 * Confirm a password reset
 */
export async function confirmPasswordReset(oobCode: string, newPassword: string): Promise<void> {
    try {
        await firebaseConfirmPasswordReset(auth, oobCode, newPassword)
    } catch (error: unknown) {
        console.error('Password reset confirmation error:', error)
        throw new Error(getFriendlyAuthErrorMessage(error))
    }
}

/**
 * Update the user's profile information
 */
export async function updateProfile(
    currentUser: AuthUser,
    data: Partial<AuthUser>,
    onNotify: (user: AuthUser) => void
): Promise<AuthUser> {
    const firebaseUser = auth.currentUser
    if (!firebaseUser) {
        throw new Error('No authenticated user')
    }

    try {
        const profileUpdates: { displayName?: string | null; photoURL?: string | null } = {}
        let resolvedName: string | undefined
        if (typeof data.name === 'string') {
            resolvedName = data.name.trim()
            if (resolvedName.length > 0 && resolvedName !== firebaseUser.displayName) {
                profileUpdates.displayName = resolvedName
            }
        }

        const hasPhotoUpdate = Object.prototype.hasOwnProperty.call(data, 'photoURL')
        if (hasPhotoUpdate) {
            profileUpdates.photoURL = data.photoURL ?? null
        }

        if (Object.keys(profileUpdates).length > 0) {
            await updateFirebaseProfile(firebaseUser, profileUpdates)
        }

        const updatedUser: AuthUser = {
            ...currentUser,
            ...data,
            name: typeof resolvedName === 'string' && resolvedName.length > 0 ? resolvedName : currentUser.name,
            photoURL: hasPhotoUpdate ? data.photoURL ?? null : currentUser.photoURL,
            updatedAt: toISO(),
        }

        onNotify(updatedUser)
        return updatedUser
    } catch (error: unknown) {
        console.error('Profile update error:', error)
        throw new Error('Failed to update profile')
    }
}

/**
 * Re-authenticate the user with their current password
 */
export async function reauthenticate(password: string): Promise<void> {
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
 * Change the user's password
 */
export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
    if (!currentPassword || !newPassword) {
        throw new Error('Current and new passwords are required')
    }

    validatePasswordStrength(newPassword)

    try {
        await reauthenticate(currentPassword)
        const user = auth.currentUser
        if (!user) throw new Error('No authenticated user')
        await firebaseUpdatePassword(user, newPassword)
    } catch (error: unknown) {
        console.error('Password change error:', error)
        if (error instanceof Error) throw error
        throw new Error('Failed to change password')
    }
}

/**
 * Delete the user's account
 */
export async function deleteAccount(
    getIdToken: (forceRefresh?: boolean) => Promise<string>,
    onClear: () => void,
    password?: string
): Promise<void> {
    const user = auth.currentUser
    if (!user) throw new Error('No authenticated user')

    try {
        if (password) {
            await reauthenticate(password)
        }

        const token = await getIdToken(true)
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

        await firebaseDeleteUser(user)
        onClear()
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
 * Disconnect an integration provider
 */
export async function disconnectProvider(
    getIdToken: () => Promise<string>,
    providerId: string
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

/**
 * Validate password strength
 */
export function validatePasswordStrength(password: string): void {
    if (password.length < 8) {
        throw new Error('Password must be at least 8 characters long')
    }
    if (!/[A-Z]/.test(password)) {
        throw new Error('Password must contain at least one uppercase letter')
    }
    if (!/[a-z]/.test(password)) {
        throw new Error('Password must contain at least one lowercase letter')
    }
    if (!/[0-9]/.test(password)) {
        throw new Error('Password must contain at least one number')
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        throw new Error('Password must contain at least one special character')
    }
}
