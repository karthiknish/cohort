import type { CollectionReference } from 'firebase-admin/firestore'

import { adminAuth, adminDb } from '@/lib/firebase-admin'
import { createApiHandler } from '@/lib/api-handler'
import { logAuditAction } from '@/lib/audit-logger'

async function deleteCollectionRecursively(collectionRef: CollectionReference, batchSize = 200): Promise<void> {
  const snapshot = await collectionRef.limit(batchSize).get()

  if (snapshot.empty) {
    return
  }

  const batch = adminDb.batch()
  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref)
  })
  await batch.commit()

  if (snapshot.size === batchSize) {
    await deleteCollectionRecursively(collectionRef, batchSize)
  }
}

export const DELETE = createApiHandler(
  {
    rateLimit: 'sensitive',
  },
  async (req, { auth }) => {
  const userRef = adminDb.collection('users').doc(auth.uid!)

  const subcollections = await userRef.listCollections()
  for (const subcollection of subcollections) {
    await deleteCollectionRecursively(subcollection)
  }

  await userRef.delete().catch((error) => {
    if (!(error instanceof Error && 'code' in error && (error as { code?: unknown }).code === 5)) {
      throw error
    }
  })

  await adminAuth.deleteUser(auth.uid!).catch((error: unknown) => {
    if (error instanceof Error && error.message.includes('not found')) {
      return
    }
    throw error
  })

  // Log the deletion
  await logAuditAction({
    action: 'USER_ACCOUNT_DELETE',
    actorId: auth.uid!,
    actorEmail: auth.email || undefined,
    ip: req.headers.get('x-forwarded-for') || undefined,
    userAgent: req.headers.get('user-agent') || undefined,
  })

  return { ok: true }
})
