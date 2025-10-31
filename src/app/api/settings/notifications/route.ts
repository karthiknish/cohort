import { NextRequest, NextResponse } from 'next/server'
import { FieldValue } from 'firebase-admin/firestore'
import { z } from 'zod'

import { authenticateRequest, AuthenticationError } from '@/lib/server-auth'
import { adminDb } from '@/lib/firebase-admin'

const phoneNumberSchema = z
  .string()
  .trim()
  .min(6)
  .max(32)
  .regex(/^[+0-9().\-\s]*$/, 'Invalid phone number format')

const updatePreferencesSchema = z.object({
  whatsappTasks: z.boolean(),
  whatsappCollaboration: z.boolean(),
  phoneNumber: z.union([phoneNumberSchema, z.null()]).optional(),
})

type PreferencesPayload = z.infer<typeof updatePreferencesSchema>

function mapPreferences(data: Record<string, unknown>) {
  const prefs =
    data.notificationPreferences && typeof data.notificationPreferences === 'object'
      ? (data.notificationPreferences as { whatsapp?: { tasks?: unknown; collaboration?: unknown } })
      : {}

  const whatsapp = prefs.whatsapp && typeof prefs.whatsapp === 'object' ? prefs.whatsapp : {}

  const phoneNumber = typeof data.phoneNumber === 'string' ? data.phoneNumber : null

  return {
    whatsappTasks: Boolean((whatsapp as { tasks?: unknown }).tasks),
    whatsappCollaboration: Boolean((whatsapp as { collaboration?: unknown }).collaboration),
    phoneNumber,
  }
}

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request)
    if (!auth.uid) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const userRef = adminDb.collection('users').doc(auth.uid)
    const snapshot = await userRef.get()
    const data = (snapshot.data() ?? {}) as Record<string, unknown>

    return NextResponse.json(mapPreferences(data))
  } catch (error: unknown) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    console.error('[settings/notifications] failed to load preferences', error)
    return NextResponse.json({ error: 'Failed to load notification preferences' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request)
    if (!auth.uid) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const json = (await request.json().catch(() => null)) ?? {}
    const payload = updatePreferencesSchema.parse(json) satisfies PreferencesPayload

    const userRef = adminDb.collection('users').doc(auth.uid)

    const updateData: Record<string, unknown> = {
      notificationPreferences: {
        whatsapp: {
          tasks: payload.whatsappTasks,
          collaboration: payload.whatsappCollaboration,
        },
      },
      updatedAt: FieldValue.serverTimestamp(),
    }

    if (payload.phoneNumber !== undefined) {
      updateData.phoneNumber = payload.phoneNumber && payload.phoneNumber.length > 0 ? payload.phoneNumber : null
    }

    await userRef.set(updateData, { merge: true })

    const snapshot = await userRef.get()
    const data = (snapshot.data() ?? {}) as Record<string, unknown>

    return NextResponse.json(mapPreferences(data))
  } catch (error: unknown) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten().formErrors.join('\n') || 'Invalid preferences payload' }, { status: 400 })
    }

    console.error('[settings/notifications] failed to update preferences', error)
    return NextResponse.json({ error: 'Failed to update notification preferences' }, { status: 500 })
  }
}
