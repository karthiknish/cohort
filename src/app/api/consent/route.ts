import { NextRequest, NextResponse } from 'next/server'

import { adminDb } from '@/lib/firebase-admin'
import { authenticateRequest, AuthenticationError } from '@/lib/server-auth'

/**
 * GDPR Consent Record API
 * Stores consent preferences server-side for audit trail purposes
 */

interface ConsentRecord {
  userId: string
  type: 'cookie' | 'marketing' | 'analytics'
  preferences: {
    essential: boolean
    analytics: boolean
    functionality: boolean
    marketing: boolean
  }
  granted: boolean
  timestamp: string
  ipAddress: string | null
  userAgent: string | null
}

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request)

    if (!auth.uid) {
      throw new AuthenticationError('Authentication required', 401)
    }

    const body = await request.json() as {
      type?: string
      preferences?: {
        essential?: boolean
        analytics?: boolean
        functionality?: boolean
        marketing?: boolean
      }
    }

    const type = body.type ?? 'cookie'
    const preferences = {
      essential: true,
      analytics: body.preferences?.analytics ?? false,
      functionality: body.preferences?.functionality ?? false,
      marketing: body.preferences?.marketing ?? false,
    }

    // Determine if consent was granted (any non-essential preference is true)
    const granted = preferences.analytics || preferences.functionality || preferences.marketing

    // Get IP address from headers (may be forwarded by proxy)
    const forwardedFor = request.headers.get('x-forwarded-for')
    const ipAddress = forwardedFor ? forwardedFor.split(',')[0].trim() : null

    const userAgent = request.headers.get('user-agent')

    const consentRecord: ConsentRecord = {
      userId: auth.uid,
      type: type as 'cookie' | 'marketing' | 'analytics',
      preferences,
      granted,
      timestamp: new Date().toISOString(),
      ipAddress,
      userAgent,
    }

    // Store consent record
    await adminDb.collection('consent_records').add(consentRecord)

    // Also update the user document with latest consent status
    await adminDb.collection('users').doc(auth.uid).set(
      {
        consentPreferences: preferences,
        consentTimestamp: consentRecord.timestamp,
        updatedAt: consentRecord.timestamp,
      },
      { merge: true }
    )

    return NextResponse.json({
      ok: true,
      timestamp: consentRecord.timestamp,
    })
  } catch (error: unknown) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    console.error('[consent] failed to store consent', error)
    return NextResponse.json({ error: 'Failed to store consent record' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request)

    if (!auth.uid) {
      throw new AuthenticationError('Authentication required', 401)
    }

    // Get consent history for the user
    const snapshot = await adminDb
      .collection('consent_records')
      .where('userId', '==', auth.uid)
      .orderBy('timestamp', 'desc')
      .limit(50)
      .get()

    const records = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      // Redact IP for privacy
      ipAddress: doc.data().ipAddress ? '***.***.***' : null,
    }))

    return NextResponse.json({ records })
  } catch (error: unknown) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    console.error('[consent] failed to get consent history', error)
    return NextResponse.json({ error: 'Failed to retrieve consent history' }, { status: 500 })
  }
}
