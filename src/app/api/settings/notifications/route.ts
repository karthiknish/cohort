import { FieldValue } from 'firebase-admin/firestore'
import { z } from 'zod'

import { adminDb } from '@/lib/firebase-admin'
import { createApiHandler } from '@/lib/api-handler'
import { UnauthorizedError } from '@/lib/api-errors'

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

export const GET = createApiHandler({ auth: 'required', rateLimit: 'standard' }, async (req, { auth }) => {
  if (!auth.uid) {
    throw new UnauthorizedError('Authentication required')
  }

  const userRef = adminDb.collection('users').doc(auth.uid)
  const snapshot = await userRef.get()
  const data = (snapshot.data() ?? {}) as Record<string, unknown>

  return mapPreferences(data)
})

export const PATCH = createApiHandler(
  {
    auth: 'required',
    bodySchema: updatePreferencesSchema,
    rateLimit: 'standard'
  },
  async (req, { auth, body: payload }) => {
    if (!auth.uid) {
      throw new UnauthorizedError('Authentication required')
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
