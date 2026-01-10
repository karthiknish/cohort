import { z } from 'zod'
import { createApiHandler } from '@/lib/api-handler'
import { adminDb } from '@/lib/firebase-admin'

/**
 * Admin API for managing user-reported problems.
 * Requires admin privileges.
 */

export const GET = createApiHandler({
  auth: 'required',
  adminOnly: true,
  querySchema: z.object({
    status: z.string().optional()
  })
}, async (req, { query }) => {
  const { status } = query

  let q: any = adminDb.collection('problemReports').orderBy('createdAt', 'desc')

  if (status && status !== 'all') {
    q = adminDb.collection('problemReports')
      .where('status', '==', status)
      .orderBy('createdAt', 'desc')
  }

  const snapshot = await q.get()
  const reports = snapshot.docs.map((doc: any) => ({
    id: doc.id,
    ...doc.data(),
  }))

  return reports
})

export const PATCH = createApiHandler({
  auth: 'required',
  adminOnly: true,
  bodySchema: z.object({
    id: z.string(),
    status: z.string().optional(),
    fixed: z.boolean().optional(),
    resolution: z.string().optional()
  }).passthrough()
}, async (req, { body }) => {
  const { id, ...updates } = body

  const reportRef = adminDb.collection('problemReports').doc(id)
  await reportRef.update({
    ...updates,
    updatedAt: new Date().toISOString(),
  })

  return { success: true }
})

export const DELETE = createApiHandler({
  auth: 'required',
  adminOnly: true,
  querySchema: z.object({
    id: z.string()
  })
}, async (req, { query }) => {
  const { id } = query

  await adminDb.collection('problemReports').doc(id).delete()
  return { success: true }
})
