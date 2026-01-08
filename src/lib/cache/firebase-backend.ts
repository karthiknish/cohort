import { FieldValue, Timestamp } from 'firebase-admin/firestore'
import { createHash } from 'crypto'

import type { CacheBackend } from './cache-manager'

export type FirestoreCacheBackendOptions = {
  collectionName?: string
}

type StoredCacheRecord = {
  key: string
  value: string
  expiresAt: FirebaseFirestore.Timestamp
  createdAt?: FirebaseFirestore.FieldValue
  updatedAt?: FirebaseFirestore.FieldValue
}

function hashKey(key: string): string {
  // Firestore doc IDs cannot contain slashes.
  return createHash('sha256').update(key).digest('hex')
}

export class FirestoreCacheBackend implements CacheBackend {
  private readonly collection: FirebaseFirestore.CollectionReference

  constructor(
    private readonly db: FirebaseFirestore.Firestore,
    opts: FirestoreCacheBackendOptions = {}
  ) {
    const collectionName = opts.collectionName ?? '_cache'
    this.collection = db.collection(collectionName)
  }

  async get(key: string): Promise<string | null> {
    const docId = hashKey(key)
    const snap = await this.collection.doc(docId).get()
    if (!snap.exists) return null

    const data = (snap.data() ?? {}) as Partial<StoredCacheRecord>
    if (typeof data.value !== 'string') return null

    const expiresAt = data.expiresAt instanceof Timestamp ? data.expiresAt.toDate() : undefined
    if (!expiresAt || expiresAt.getTime() <= Date.now()) {
      // Best-effort cleanup of expired values
      await this.collection.doc(docId).delete().catch(() => {})
      return null
    }

    return data.value
  }

  async set(key: string, value: string, ttlMs: number): Promise<void> {
    const ttl = Number(ttlMs)
    if (!Number.isFinite(ttl) || ttl <= 0) {
      await this.invalidate(key)
      return
    }

    const docId = hashKey(key)
    const expiresAt = Timestamp.fromDate(new Date(Date.now() + ttl))

    const payload: StoredCacheRecord = {
      key,
      value,
      expiresAt,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    }

    await this.collection.doc(docId).set(payload, { merge: true })
  }

  async invalidate(pattern: string): Promise<void> {
    if (!pattern || pattern === '*') {
      // Delete everything in batches
      while (true) {
        const snap = await this.collection.orderBy('__name__').limit(300).get()
        if (snap.empty) return

        const batch = this.db.batch()
        for (const doc of snap.docs) {
          batch.delete(doc.ref)
        }
        await batch.commit()
      }
    }

    if (pattern.endsWith('*')) {
      const prefix = pattern.slice(0, -1)

      while (true) {
        const snap = await this.collection
          .where('key', '>=', prefix)
          .where('key', '<', `${prefix}\uf8ff`)
          .limit(300)
          .get()

        if (snap.empty) return

        const batch = this.db.batch()
        for (const doc of snap.docs) {
          batch.delete(doc.ref)
        }
        await batch.commit()
      }
    }

    // Exact key
    const docId = hashKey(pattern)
    await this.collection.doc(docId).delete().catch(() => {})
  }
}
