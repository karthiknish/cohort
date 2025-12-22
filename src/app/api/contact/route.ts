import { FieldValue } from 'firebase-admin/firestore'
import { z } from 'zod'

import { adminDb } from '@/lib/firebase-admin'
import { notifyContactEmail, notifyContactSlack } from '@/lib/notifications'
import { createApiHandler } from '@/lib/api-handler'

const contactSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  company: z.string().max(120).optional().or(z.literal('')),
  message: z.string().min(10).max(2000),
})

export const POST = createApiHandler(
  {
    auth: 'none',
    bodySchema: contactSchema,
  },
  async (req, { body }) => {
    const payload = {
      ...body,
      company: body.company?.trim() || null,
    }

    await adminDb.collection('contactMessages').add({
      ...payload,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      status: 'new',
    })

    await Promise.allSettled([
      notifyContactEmail(payload),
      notifyContactSlack(payload),
    ])

    return { ok: true }
  }
)

export const GET = createApiHandler(
  { auth: 'none' },
  async () => {
    return { message: 'Contact endpoint ready' }
  }
)
