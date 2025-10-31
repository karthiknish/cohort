import { NextRequest, NextResponse } from 'next/server'

import type { CollectionReference } from 'firebase-admin/firestore'

import { adminAuth, adminDb } from '@/lib/firebase-admin'
import { authenticateRequest, AuthenticationError } from '@/lib/server-auth'

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

export async function DELETE(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request)

    if (!auth.uid) {
      throw new AuthenticationError('Authentication required', 401)
    }

    const userRef = adminDb.collection('users').doc(auth.uid)

    const subcollections = await userRef.listCollections()
    for (const subcollection of subcollections) {
      await deleteCollectionRecursively(subcollection)
    }

    await userRef.delete().catch((error) => {
      if (!(error instanceof Error && 'code' in error && (error as { code?: unknown }).code === 5)) {
        throw error
      }
    })

    await adminAuth.deleteUser(auth.uid).catch((error: unknown) => {
      if (error instanceof Error && error.message.includes('not found')) {
        return
      }
      throw error
    })

    return NextResponse.json({ ok: true })
  } catch (error: unknown) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    console.error('[auth/delete] failed', error)
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 })
  }
}
