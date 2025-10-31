import { FieldValue } from 'firebase-admin/firestore'

import { adminDb } from '@/lib/firebase-admin'
import type { AuthResult } from '@/lib/server-auth'
import { AuthenticationError } from '@/lib/server-auth'

export type WorkspaceContext = {
  workspaceId: string
  workspaceRef: FirebaseFirestore.DocumentReference
  clientsCollection: FirebaseFirestore.CollectionReference
  tasksCollection: FirebaseFirestore.CollectionReference
  collaborationCollection: FirebaseFirestore.CollectionReference
  financeInvoicesCollection: FirebaseFirestore.CollectionReference
  financeRevenueCollection: FirebaseFirestore.CollectionReference
  financeCostsCollection: FirebaseFirestore.CollectionReference
}

function normalizeCandidate(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null
  }
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

export async function resolveWorkspaceContext(auth: AuthResult): Promise<WorkspaceContext> {
  if (!auth.uid) {
    throw new AuthenticationError('Authentication required', 401)
  }

  const userRef = adminDb.collection('users').doc(auth.uid)
  const userSnapshot = await userRef.get()
  const userData = (userSnapshot.data() ?? {}) as Record<string, unknown>

  const claimAgency = normalizeCandidate(auth.claims?.agencyId)
  const storedAgency = normalizeCandidate(userData.agencyId)
  const workspaceId = claimAgency ?? storedAgency ?? auth.uid

  if (!userSnapshot.exists || storedAgency !== workspaceId) {
    const updatePayload: Record<string, unknown> = {
      agencyId: workspaceId,
      updatedAt: FieldValue.serverTimestamp(),
    }

    if (!userSnapshot.exists) {
      updatePayload.createdAt = FieldValue.serverTimestamp()
      updatePayload.email = normalizeCandidate(auth.email) ?? ''
      updatePayload.role = userData.role ?? auth.claims?.role ?? 'client'
      updatePayload.status = userData.status ?? auth.claims?.status ?? 'pending'
      updatePayload.name = normalizeCandidate(userData.name) ?? normalizeCandidate(auth.email) ?? 'Pending user'
    }

    await userRef.set(updatePayload, { merge: true })
  }

  const workspaceRef = adminDb.collection('workspaces').doc(workspaceId)
  const workspaceSnapshot = await workspaceRef.get()

  if (!workspaceSnapshot.exists) {
    await workspaceRef.set(
      {
        createdAt: FieldValue.serverTimestamp(),
        createdBy: auth.uid,
      },
      { merge: true }
    )
  }

  const clientsCollection = workspaceRef.collection('clients')
  const tasksCollection = workspaceRef.collection('tasks')
  const collaborationCollection = workspaceRef.collection('collaborationMessages')
  const financeInvoicesCollection = workspaceRef.collection('financeInvoices')
  const financeRevenueCollection = workspaceRef.collection('financeRevenue')
  const financeCostsCollection = workspaceRef.collection('financeCosts')

  return {
    workspaceId,
    workspaceRef,
    clientsCollection,
    tasksCollection,
    collaborationCollection,
    financeInvoicesCollection,
    financeRevenueCollection,
    financeCostsCollection,
  }
}
