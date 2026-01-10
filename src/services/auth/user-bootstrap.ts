import { db } from '@/lib/firebase'
import { doc, getDoc } from 'firebase/firestore'
import { User as FirebaseUser } from 'firebase/auth'
import { toISO } from '@/lib/dates'
import { normalizeRole, normalizeStatus, getBrowserCookie } from './utils'
import type { AuthRole, AuthStatus, AuthUser } from './types'
import { ServiceUnavailableError } from '@/lib/api-errors'

/**
 * Resolve the user's agency ID from token claims, localStorage, or Firestore
 */
export async function resolveUserAgency(firebaseUser: FirebaseUser): Promise<string> {
    try {
        const tokenResult = await firebaseUser.getIdTokenResult()
        const claimAgency = tokenResult?.claims?.agencyId
        if (typeof claimAgency === 'string' && claimAgency.trim().length > 0) {
            return claimAgency.trim()
        }
    } catch (error) {
        console.warn('Failed to resolve agencyId from token claims', error)
    }

    if (typeof window !== 'undefined') {
        const cachedAgency = window.localStorage.getItem(`cohorts_agency_${firebaseUser.uid}`)
        if (cachedAgency) return cachedAgency
    }

    // Fallback to user document in Firestore
    try {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid))
        if (userDoc.exists()) {
            const data = userDoc.data()
            if (typeof data.agencyId === 'string' && data.agencyId.trim().length > 0) {
                const agencyId = data.agencyId.trim()
                if (typeof window !== 'undefined') {
                    window.localStorage.setItem(`cohorts_agency_${firebaseUser.uid}`, agencyId)
                }
                return agencyId
            }
        }
    } catch (error) {
        console.warn('Failed to resolve agencyId from Firestore', error)
    }

    return firebaseUser.uid
}

/**
 * Resolve user role from token claims, cookies, or localStorage
 */
export async function resolveUserRole(firebaseUser: FirebaseUser): Promise<AuthRole> {
    try {
        const tokenResult = await firebaseUser.getIdTokenResult()
        const claimRole = tokenResult?.claims?.role
        if (typeof claimRole === 'string') {
            return normalizeRole(claimRole)
        }
    } catch (error) {
        console.warn('Failed to resolve role from token claims', error)
    }

    if (typeof window !== 'undefined') {
        const cookieRole = getBrowserCookie('cohorts_role')
        if (typeof cookieRole === 'string') {
            return normalizeRole(cookieRole)
        }

        try {
            const storedRole = window.localStorage?.getItem('cohorts_role')
            if (typeof storedRole === 'string') {
                return normalizeRole(storedRole)
            }
        } catch (error) {
            console.warn('Failed to read stored role from localStorage', error)
        }
    }

    return 'client'
}

/**
 * Resolve user status from token claims or cookies
 */
export async function resolveUserStatus(firebaseUser: FirebaseUser): Promise<AuthStatus> {
    try {
        const tokenResult = await firebaseUser.getIdTokenResult()
        const claimStatus = tokenResult?.claims?.status
        if (typeof claimStatus === 'string') {
            return normalizeStatus(claimStatus, 'pending')
        }
    } catch (error) {
        console.warn('Failed to resolve status from token claims', error)
    }

    if (typeof window !== 'undefined') {
        const cookieStatus = getBrowserCookie('cohorts_status')
        if (typeof cookieStatus === 'string') {
            return normalizeStatus(cookieStatus, 'pending')
        }
    }

    return 'pending'
}

/**
 * Map a Firebase User object to our app's AuthUser type
 */
export async function mapFirebaseUser(firebaseUser: FirebaseUser): Promise<AuthUser> {
    const [role, status, agencyId] = await Promise.all([
        resolveUserRole(firebaseUser),
        resolveUserStatus(firebaseUser),
        resolveUserAgency(firebaseUser),
    ])

    return {
        id: firebaseUser.uid,
        email: firebaseUser.email!,
        name: firebaseUser.displayName || 'User',
        phoneNumber: firebaseUser.phoneNumber ?? null,
        photoURL: firebaseUser.photoURL ?? null,
        role,
        status,
        agencyId,
        createdAt: firebaseUser.metadata.creationTime
            ? (toISO(firebaseUser.metadata.creationTime) || toISO())
            : toISO(),
        updatedAt: toISO(),
        notificationPreferences: {
            whatsapp: {
                tasks: false,
                collaboration: false,
            },
        },
    }
}

/**
 * Ensure the user is bootstrapped in our backend
 */
export async function ensureUserBootstrap(
    firebaseUser: FirebaseUser,
    getIdToken: (forceRefresh?: boolean) => Promise<string>,
    name?: string | null
): Promise<{ agencyId?: string; claimsUpdated?: boolean }> {
    const uid = firebaseUser.uid
    const bootstrappedKey = `cohorts_bootstrapped_${uid}`

    const lastBootstrap = localStorage.getItem(bootstrappedKey)
    if (lastBootstrap && Date.now() - parseInt(lastBootstrap, 10) < 3600000) {
        return {}
    }

    const idToken = await getIdToken(false)
    const payloadName = typeof name === 'string' && name.trim().length > 0 ? name.trim() : undefined

    const response = await fetch('/api/auth/bootstrap', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify(payloadName ? { name: payloadName } : {}),
    })

    let payload: { error?: string; claimsUpdated?: boolean; agencyId?: string } | null = null
    try {
        payload = (await response.json()) as { error?: string; claimsUpdated?: boolean; agencyId?: string } | null
    } catch {
        payload = null
    }

    if (!response.ok || !payload) {
        const message = typeof payload?.error === 'string' ? payload.error : 'Failed to synchronise your account profile'
        throw new ServiceUnavailableError(message)
    }

    if (payload.agencyId) {
        localStorage.setItem(`cohorts_agency_${uid}`, payload.agencyId)
    }

    localStorage.setItem(bootstrappedKey, Date.now().toString())

    return {
        agencyId: payload.agencyId,
        claimsUpdated: payload.claimsUpdated,
    }
}
