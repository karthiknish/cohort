import { FieldValue, Timestamp } from 'firebase-admin/firestore'
import { z } from 'zod'

import { adminDb } from '@/lib/firebase-admin'
import { createApiHandler } from '@/lib/api-handler'
import { mergeProposalForm, type ProposalFormData } from '@/lib/proposals'
import type { ProposalVersion } from '@/types/proposal-versions'

const querySchema = z.object({
  proposalId: z.string().trim().min(1, 'Proposal ID is required'),
})

const restoreSchema = z.object({
  proposalId: z.string().trim().min(1, 'Proposal ID is required'),
})

type StoredVersion = {
  proposalId?: string
  versionNumber?: number
  formData?: unknown
  status?: string
  stepProgress?: number
  changeDescription?: string | null
  createdBy?: string
  createdByName?: string | null
  createdAt?: unknown
}

function toISO(value: unknown): string | null {
  if (!value) return null
  if (value instanceof Timestamp) {
    return value.toDate().toISOString()
  }
  if (typeof value === 'object' && value !== null && 'toDate' in value) {
    return (value as Timestamp).toDate().toISOString()
  }
  if (typeof value === 'string') {
    return value
  }
  return null
}

function mapVersionDoc(docId: string, data: StoredVersion): ProposalVersion {
  const rawFormData = data.formData && typeof data.formData === 'object' ? data.formData as Partial<ProposalFormData> : {}
  const formData = mergeProposalForm(rawFormData)

  return {
    id: docId,
    proposalId: typeof data.proposalId === 'string' ? data.proposalId : '',
    versionNumber: typeof data.versionNumber === 'number' ? data.versionNumber : 1,
    formData,
    status: typeof data.status === 'string' ? data.status : 'draft',
    stepProgress: typeof data.stepProgress === 'number' ? data.stepProgress : 0,
    changeDescription: typeof data.changeDescription === 'string' ? data.changeDescription : null,
    createdBy: typeof data.createdBy === 'string' ? data.createdBy : '',
    createdByName: typeof data.createdByName === 'string' ? data.createdByName : null,
    createdAt: toISO(data.createdAt),
  }
}

export const GET = createApiHandler(
  {
    querySchema,
  },
  async (req, { auth, query, params }) => {
    const { versionId } = params as { versionId: string }
    const { proposalId } = query

    if (!versionId) {
      return { error: 'Version ID required', status: 400 }
    }

    // Verify proposal ownership
    const proposalRef = adminDb.collection('users').doc(auth.uid!).collection('proposals').doc(proposalId)
    const proposalSnap = await proposalRef.get()

    if (!proposalSnap.exists) {
      return { error: 'Proposal not found', status: 404 }
    }

    const versionRef = proposalRef.collection('versions').doc(versionId)
    const versionSnap = await versionRef.get()

    if (!versionSnap.exists) {
      return { error: 'Version not found', status: 404 }
    }

    const version = mapVersionDoc(versionSnap.id, versionSnap.data() as StoredVersion)
    return { version }
  }
)

// Restore proposal to a specific version
export const POST = createApiHandler(
  {
    bodySchema: restoreSchema,
  },
  async (req, { auth, body, params }) => {
    const { versionId } = params as { versionId: string }
    const { proposalId } = body

    if (!versionId) {
      return { error: 'Version ID required', status: 400 }
    }

    // Verify proposal ownership
    const proposalRef = adminDb.collection('users').doc(auth.uid!).collection('proposals').doc(proposalId)
    const proposalSnap = await proposalRef.get()

    if (!proposalSnap.exists) {
      return { error: 'Proposal not found', status: 404 }
    }

    const versionRef = proposalRef.collection('versions').doc(versionId)
    const versionSnap = await versionRef.get()

    if (!versionSnap.exists) {
      return { error: 'Version not found', status: 404 }
    }

    const versionData = versionSnap.data() as StoredVersion
    const versionsRef = proposalRef.collection('versions')

    // First, create a new version snapshot of current state before restoring
    const latestVersionSnap = await versionsRef.orderBy('versionNumber', 'desc').limit(1).get()
    const latestVersion = latestVersionSnap.empty ? 0 : (latestVersionSnap.docs[0].data().versionNumber ?? 0)
    const newVersionNumber = latestVersion + 1

    const currentProposalData = proposalSnap.data() ?? {}
    const userRef = adminDb.collection('users').doc(auth.uid!)
    const userSnap = await userRef.get()
    const userData = userSnap.data() ?? {}
    const userName = typeof userData.name === 'string' ? userData.name : auth.email ?? null

    const timestamp = Timestamp.now()

    // Save current state as a version before restoring
    await versionsRef.add({
      proposalId,
      versionNumber: newVersionNumber,
      formData: currentProposalData.formData ?? {},
      status: currentProposalData.status ?? 'draft',
      stepProgress: currentProposalData.stepProgress ?? 0,
      changeDescription: `Auto-saved before restoring to version ${versionData.versionNumber}`,
      createdBy: auth.uid,
      createdByName: userName,
      createdAt: timestamp,
    })

    // Restore proposal to the selected version
    const restoredFormData = versionData.formData && typeof versionData.formData === 'object'
      ? mergeProposalForm(versionData.formData as Partial<ProposalFormData>)
      : mergeProposalForm({})

    await proposalRef.update({
      formData: restoredFormData,
      status: versionData.status ?? 'draft',
      stepProgress: versionData.stepProgress ?? 0,
      currentVersion: newVersionNumber + 1, // After restore, we'll be at a new version
      restoredFromVersion: versionData.versionNumber,
      updatedAt: FieldValue.serverTimestamp(),
      lastAutosaveAt: FieldValue.serverTimestamp(),
    })

    // Create a new version for the restored state
    await versionsRef.add({
      proposalId,
      versionNumber: newVersionNumber + 1,
      formData: restoredFormData,
      status: versionData.status ?? 'draft',
      stepProgress: versionData.stepProgress ?? 0,
      changeDescription: `Restored from version ${versionData.versionNumber}`,
      createdBy: auth.uid,
      createdByName: userName,
      createdAt: Timestamp.now(),
    })

    return {
      success: true,
      restoredFromVersion: versionData.versionNumber,
      newVersion: newVersionNumber + 1,
    }
  }
)
