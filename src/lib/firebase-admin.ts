import { Buffer } from 'node:buffer'

import { applicationDefault, cert, getApps, initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'
import { getStorage } from 'firebase-admin/storage'

interface ServiceAccount {
  projectId: string
  clientEmail: string
  privateKey: string
}

function decodeBase64PrivateKey(base64Key: string) {
  try {
    const normalized = base64Key.replace(/\s+/g, '')
    const decoded = Buffer.from(normalized, 'base64').toString('utf8')
    const trimmed = decoded.trim()
    if (trimmed.startsWith('-----BEGIN') && trimmed.includes('PRIVATE KEY')) {
      return trimmed.replace(/\r\n/g, '\n')
    }

    try {
      const parsed = JSON.parse(decoded) as { private_key?: string } | null
      if (parsed?.private_key) {
        const key = parsed.private_key
        if (key.includes('BEGIN PRIVATE KEY')) {
          return key.replace(/\r\n/g, '\n')
        }
      }
    } catch {
      // Not a JSON payload; fall through to warn below.
    }
  } catch (error) {
    console.warn('[firebase-admin] Failed to decode FIREBASE_ADMIN_PRIVATE_KEY_B64', error)
  }

  return null
}

function resolvePrivateKeyFromEnv(): string | null {
  const base64Key = process.env.FIREBASE_ADMIN_PRIVATE_KEY_B64
  if (base64Key) {
    const decoded = decodeBase64PrivateKey(base64Key)
    if (decoded) {
      return decoded
    }
  }

  const rawKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY
  if (rawKey) {
    return rawKey.replace(/\\n/g, '\n')
  }

  return null
}

function resolveServiceAccount(): ServiceAccount | null {
  const jsonKey = process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT_KEY
  if (jsonKey) {
    try {
      const parsed = JSON.parse(jsonKey) as Partial<ServiceAccount>
      if (parsed.projectId && parsed.clientEmail && parsed.privateKey) {
        return {
          projectId: parsed.projectId,
          clientEmail: parsed.clientEmail,
          privateKey: parsed.privateKey.replace(/\\n/g, '\n'),
        }
      }
    } catch (error) {
      console.warn('[firebase-admin] Failed to parse FIREBASE_ADMIN_SERVICE_ACCOUNT_KEY', error)
    }
  }

  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL
  const privateKey = resolvePrivateKeyFromEnv()

  if (projectId && clientEmail && privateKey) {
    return {
      projectId,
      clientEmail,
      privateKey,
    }
  }

  return null
}

function initializeFirebaseAdmin() {
  if (getApps().length) {
    return getApps()[0]
  }

  const serviceAccount = resolveServiceAccount()
  const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET

  if (serviceAccount) {
    return initializeApp({
      credential: cert(serviceAccount),
      projectId: serviceAccount.projectId,
      storageBucket,
    })
  }

  try {
    return initializeApp({
      credential: applicationDefault(),
      storageBucket,
    })
  } catch (error) {
    throw new Error(
      'Failed to initialize Firebase Admin SDK. Provide either FIREBASE_ADMIN_SERVICE_ACCOUNT_KEY JSON or the FIREBASE_ADMIN_CLIENT_EMAIL, FIREBASE_ADMIN_PRIVATE_KEY, and FIREBASE_ADMIN_PROJECT_ID variables.',
    )
  }
}

export const firebaseAdminApp = initializeFirebaseAdmin()
export const adminDb = getFirestore(firebaseAdminApp)
export const adminAuth = getAuth(firebaseAdminApp)
export const adminStorage = getStorage(firebaseAdminApp)
