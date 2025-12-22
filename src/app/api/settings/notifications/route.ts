import { FieldValue } from 'firebase-admin/firestore'
import { z } from 'zod'

import { adminDb } from '@/lib/firebase-admin'
import { createApiHandler } from '@/lib/api-handler'

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

export const GET = createApiHandler({}, async (req, { auth }) => {
  if (!auth.uid) {
    return { error: 'Authentication required', status: 401 }
  }

  const userRef = adminDb.collection('users').doc(auth.uid)
  const snapshot = await userRef.get()
  const data = (snapshot.data() ?? {}) as Record<string, unknown>

  return mapPreferences(data)
})

export const PATCH = createApiHandler(
  {
    bodySchema: updatePreferencesSchema,
  },
  async (req, { auth, body: payload }) => {
    if (!auth.uid) {
      return { error: 'Authentication required', status: 401 }
    }

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

    return mapPreferences(data)
  }
)
