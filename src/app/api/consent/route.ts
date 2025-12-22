import { z } from 'zod'

import { adminDb } from '@/lib/firebase-admin'
import { createApiHandler } from '@/lib/api-handler'

/**
 * GDPR Consent Record API
 * Stores consent preferences server-side for audit trail purposes
 */

const consentBodySchema = z.object({
  type: z.string().optional().default('cookie'),
  preferences: z.object({
    essential: z.boolean().optional().default(true),
    analytics: z.boolean().optional().default(false),
    functionality: z.boolean().optional().default(false),
    marketing: z.boolean().optional().default(false),
  }).optional(),
})

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

export const POST = createApiHandler(
  {
    bodySchema: consentBodySchema,
  },
  async (req, { auth, body }) => {
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
    const forwardedFor = req.headers.get('x-forwarded-for')
    const ipAddress = forwardedFor ? forwardedFor.split(',')[0].trim() : null

    const userAgent = req.headers.get('user-agent')

    const consentRecord: ConsentRecord = {
      userId: auth.uid!,
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
    await adminDb.collection('users').doc(auth.uid!).set(
      {
        consentPreferences: preferences,
        consentTimestamp: consentRecord.timestamp,
        updatedAt: consentRecord.timestamp,
      },
      { merge: true }
    )

    return {
      ok: true,
      timestamp: consentRecord.timestamp,
    }
  }
)

export const GET = createApiHandler({}, async (req, { auth }) => {
  // Get consent history for the user
  const snapshot = await adminDb
    .collection('consent_records')
    .where('userId', '==', auth.uid!)
    .orderBy('timestamp', 'desc')
    .limit(50)
    .get()

  const records = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    // Redact IP for privacy
    ipAddress: doc.data().ipAddress ? '***.***.***' : null,
  }))

  return { records }
})
