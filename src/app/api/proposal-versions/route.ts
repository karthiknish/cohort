import { NextRequest, NextResponse } from 'next/server'
import { FieldValue, Timestamp } from 'firebase-admin/firestore'
import { z } from 'zod'

import { adminDb } from '@/lib/firebase-admin'
import { authenticateRequest, AuthenticationError } from '@/lib/server-auth'
import { mergeProposalForm, type ProposalFormData } from '@/lib/proposals'
import type { ProposalVersion } from '@/types/proposal-versions'

const createVersionSchema = z.object({
  proposalId: z.string().trim().min(1, 'Proposal ID is required'),
  changeDescription: z.string().trim().max(500).nullable().optional(),
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

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request)
    if (!auth.uid) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const url = new URL(request.url)
    const proposalId = url.searchParams.get('proposalId')

    if (!proposalId) {
      return NextResponse.json({ error: 'Proposal ID required' }, { status: 400 })
    }

    // Verify proposal ownership
    const proposalRef = adminDb.collection('users').doc(auth.uid).collection('proposals').doc(proposalId)
    const proposalSnap = await proposalRef.get()
    
    if (!proposalSnap.exists) {
      return NextResponse.json({ error: 'Proposal not found' }, { status: 404 })
    }

    const versionsRef = proposalRef.collection('versions')
    const snapshot = await versionsRef.orderBy('versionNumber', 'desc').limit(50).get()

    const versions: ProposalVersion[] = snapshot.docs.map((doc) =>
      mapVersionDoc(doc.id, doc.data() as StoredVersion)
    )

    return NextResponse.json({ versions })
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error('[proposal-versions] GET error', error)
    return NextResponse.json({ error: 'Failed to fetch versions' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request)
    if (!auth.uid) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const json = await request.json().catch(() => null)
    const input = createVersionSchema.parse(json ?? {})

    // Get proposal and verify ownership
    const proposalRef = adminDb.collection('users').doc(auth.uid).collection('proposals').doc(input.proposalId)
    const proposalSnap = await proposalRef.get()

    if (!proposalSnap.exists) {
      return NextResponse.json({ error: 'Proposal not found' }, { status: 404 })
    }

    const proposalData = proposalSnap.data() ?? {}
    const versionsRef = proposalRef.collection('versions')

    // Get current highest version number
    const latestVersionSnap = await versionsRef.orderBy('versionNumber', 'desc').limit(1).get()
    const latestVersion = latestVersionSnap.empty ? 0 : (latestVersionSnap.docs[0].data().versionNumber ?? 0)
    const newVersionNumber = latestVersion + 1

    // Get user name for attribution
    const userRef = adminDb.collection('users').doc(auth.uid)
    const userSnap = await userRef.get()
    const userData = userSnap.data() ?? {}
    const userName = typeof userData.name === 'string' ? userData.name : auth.email ?? null

    const timestamp = Timestamp.now()

    // Create version snapshot
    const versionDoc = await versionsRef.add({
      proposalId: input.proposalId,
      versionNumber: newVersionNumber,
      formData: proposalData.formData ?? {},
      status: proposalData.status ?? 'draft',
      stepProgress: proposalData.stepProgress ?? 0,
      changeDescription: input.changeDescription ?? null,
      createdBy: auth.uid,
      createdByName: userName,
      createdAt: timestamp,
    })

    // Update proposal to track version count
    await proposalRef.update({
      currentVersion: newVersionNumber,
      lastVersionAt: timestamp,
      updatedAt: FieldValue.serverTimestamp(),
    })

    const createdDoc = await versionDoc.get()
    const version = mapVersionDoc(createdDoc.id, createdDoc.data() as StoredVersion)

    return NextResponse.json({ version }, { status: 201 })
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten().formErrors.join(', ') || 'Invalid input' }, { status: 400 })
    }
    console.error('[proposal-versions] POST error', error)
    return NextResponse.json({ error: 'Failed to create version' }, { status: 500 })
  }
}
