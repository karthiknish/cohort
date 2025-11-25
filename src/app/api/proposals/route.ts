import { NextRequest, NextResponse } from 'next/server'
import { FieldValue, Timestamp } from 'firebase-admin/firestore'
import type { Query, DocumentData, DocumentSnapshot } from 'firebase-admin/firestore'
import { z } from 'zod'

import { adminDb } from '@/lib/firebase-admin'
import { authenticateRequest, AuthenticationError } from '@/lib/server-auth'
import { mergeProposalForm, proposalDraftUpdateSchema, sanitizeProposalUpdate, type ProposalFormData } from '@/lib/proposals'

const updateSchema = proposalDraftUpdateSchema

type ProposalSnapshot = {
  status?: string
  stepProgress?: number
  formData?: unknown
  aiInsights?: unknown
  aiSuggestions?: unknown
  pdfUrl?: string | null
  pptUrl?: string | null
  createdAt?: Timestamp | string | null
  updatedAt?: Timestamp | string | null
  lastAutosaveAt?: Timestamp | string | null
  clientId?: string | null
  clientName?: string | null
  gammaDeck?: unknown
  presentationDeck?: unknown
}

const normalizeFormData = (input: unknown): ProposalFormData => {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return mergeProposalForm()
  }

  const record = input as Record<string, unknown>
  const partial: Partial<ProposalFormData> = {}

  const assignSection = <K extends keyof ProposalFormData>(key: K) => {
    const value = record[key]
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return
    }
    partial[key] = value as ProposalFormData[K]
  }

  assignSection('company')
  assignSection('marketing')
  assignSection('goals')
  assignSection('scope')
  assignSection('timelines')
  assignSection('value')

  return mergeProposalForm(partial)
}

type SerializedProposal = {
  id: string
  status: string
  stepProgress: number
  formData: ProposalFormData
  aiInsights: unknown
  aiSuggestions: string | null
  pdfUrl: string | null
  pptUrl: string | null
  createdAt: string | null
  updatedAt: string | null
  lastAutosaveAt: string | null
  clientId: string | null
  clientName: string | null
  presentationDeck: ReturnType<typeof serializePresentationDeck>
}

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request)
    if (!auth.uid) {
      throw new AuthenticationError('Authentication required', 401)
    }

    const url = new URL(request.url)
    const idParam = url.searchParams.get('id')
    const statusParam = url.searchParams.get('status')
    const clientIdParam = url.searchParams.get('clientId')
    const proposalsRef = adminDb.collection('users').doc(auth.uid).collection('proposals')

    if (idParam) {
      const docSnap = await proposalsRef.doc(idParam).get()
      if (!docSnap.exists) {
        return NextResponse.json({ error: 'Proposal not found' }, { status: 404 })
      }

      const proposal = mapProposalSnapshot(docSnap)
      return NextResponse.json({ proposal })
    }

    let proposalsQuery: Query<DocumentData> = proposalsRef

    if (statusParam) {
      proposalsQuery = proposalsQuery.where('status', '==', statusParam)
    }

    if (clientIdParam) {
      proposalsQuery = proposalsQuery.where('clientId', '==', clientIdParam)
    }

    const snapshot = await proposalsQuery.get()
    const results = snapshot.docs.map((docSnap) => mapProposalSnapshot(docSnap))

    return NextResponse.json({ proposals: results })
  } catch (error: unknown) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error('[api/proposals] GET failed', error)
    return NextResponse.json({ error: 'Failed to load proposals' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request)
    if (!auth.uid) {
      throw new AuthenticationError('Authentication required', 401)
    }

    const rawBody = (await request.json().catch(() => null)) as Record<string, unknown> | null

    const mergedFormData = normalizeFormData(rawBody?.formData)

    const rawStep = typeof rawBody?.stepProgress === 'number' ? rawBody.stepProgress : 0
    const stepProgress = Math.min(Math.max(Math.round(rawStep), 0), 10)

    const rawStatus = typeof rawBody?.status === 'string' ? rawBody.status : 'draft'
    const allowedStatuses = ['draft', 'in_progress', 'ready', 'sent'] as const
    const status = allowedStatuses.includes(rawStatus as (typeof allowedStatuses)[number]) ? rawStatus : 'draft'

    const clientId = typeof rawBody?.clientId === 'string' ? rawBody.clientId.trim() : null
    const clientName = typeof rawBody?.clientName === 'string' ? rawBody.clientName.trim() : null

    const timestamp = FieldValue.serverTimestamp()

    const docRef = await adminDb
      .collection('users')
      .doc(auth.uid)
      .collection('proposals')
      .add({
        ownerId: auth.uid,
        status,
        stepProgress,
        formData: mergedFormData,
        clientId: clientId && clientId.length > 0 ? clientId : null,
        clientName: clientName && clientName.length > 0 ? clientName : null,
        aiInsights: null,
        aiSuggestions: null,
        pdfUrl: null,
        pptUrl: null,
        createdAt: timestamp,
        updatedAt: timestamp,
        lastAutosaveAt: timestamp,
      })

    return NextResponse.json({ id: docRef.id }, { status: 201 })
  } catch (error: unknown) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error('[api/proposals] POST failed', error)
    return NextResponse.json({ error: 'Failed to create proposal' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request)
    if (!auth.uid) {
      throw new AuthenticationError('Authentication required', 401)
    }

    const body = (await request.json().catch(() => null)) as unknown
    const parsed = updateSchema.parse(body ?? {})
    const proposalId = extractProposalId(body)

    if (!proposalId) {
      return NextResponse.json({ error: 'Proposal id required' }, { status: 400 })
    }

    const proposalRef = adminDb
      .collection('users')
      .doc(auth.uid)
      .collection('proposals')
      .doc(proposalId)
    await proposalRef.update(sanitizeProposalUpdate(parsed, FieldValue.serverTimestamp()))

    return NextResponse.json({ ok: true })
  } catch (error: unknown) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    if (error instanceof z.ZodError) {
      console.error('[api/proposals] update validation failed', error.flatten())
      return NextResponse.json({ error: 'Invalid payload', details: error.flatten() }, { status: 400 })
    }
    console.error('[api/proposals] PATCH failed', error)
    return NextResponse.json({ error: 'Failed to update proposal' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request)
    if (!auth.uid) {
      throw new AuthenticationError('Authentication required', 401)
    }

    const body = (await request.json().catch(() => null)) as { id?: unknown } | null
    const rawId = body?.id
    if (typeof rawId !== 'string' || rawId.trim().length === 0) {
      return NextResponse.json({ error: 'Proposal id required' }, { status: 400 })
    }

    const proposalId = rawId.trim()
    const proposalRef = adminDb.collection('users').doc(auth.uid).collection('proposals').doc(proposalId)
    const snapshot = await proposalRef.get()

    if (!snapshot.exists) {
      return NextResponse.json({ error: 'Proposal not found' }, { status: 404 })
    }

    await proposalRef.delete()

    return NextResponse.json({ ok: true })
  } catch (error: unknown) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error('[api/proposals] DELETE failed', error)
    return NextResponse.json({ error: 'Failed to delete proposal' }, { status: 500 })
  }
}

type TimestampLike = Timestamp | Date | { toDate: () => Date } | string | null | undefined

function serializeTimestamp(value: TimestampLike): string | null {
  if (value === null || value === undefined) {
    return null
  }

  if (value instanceof Timestamp) {
    return value.toDate().toISOString()
  }

  if (value instanceof Date) {
    return value.toISOString()
  }

  if (typeof value === 'string') {
    return value
  }

  if (typeof value === 'object' && 'toDate' in value && typeof value.toDate === 'function') {
    const date = value.toDate()
    return date instanceof Date ? date.toISOString() : null
  }

  return null
}

function mapProposalSnapshot(docSnap: DocumentSnapshot<DocumentData>): SerializedProposal {
  const data = docSnap.data() as ProposalSnapshot

  return {
    id: docSnap.id,
    status: data.status ?? 'draft',
    stepProgress: typeof data.stepProgress === 'number' ? data.stepProgress : 0,
    formData: normalizeFormData(data.formData),
    aiInsights: data.aiInsights ?? null,
    aiSuggestions: typeof data.aiSuggestions === 'string' ? data.aiSuggestions : null,
    pdfUrl: data.pdfUrl ?? null,
    pptUrl: data.pptUrl ?? null,
    createdAt: serializeTimestamp(data.createdAt),
    updatedAt: serializeTimestamp(data.updatedAt),
    lastAutosaveAt: serializeTimestamp(data.lastAutosaveAt),
    clientId: typeof data.clientId === 'string' ? data.clientId : null,
    clientName: typeof data.clientName === 'string' ? data.clientName : null,
    presentationDeck: serializePresentationDeck(data.presentationDeck ?? data.gammaDeck),
  }
}

function serializePresentationDeck(value: unknown) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null
  }

  const record = value as Record<string, unknown>
  const generatedFiles = Array.isArray(record.generatedFiles)
    ? (record.generatedFiles as Array<Record<string, unknown>>)
        .map((item) => {
          const fileType = typeof item.fileType === 'string' ? item.fileType : typeof item.type === 'string' ? item.type : null
          const fileUrl = typeof item.fileUrl === 'string' ? item.fileUrl : typeof item.url === 'string' ? item.url : null
          if (!fileType || !fileUrl) {
            return null
          }
          return { fileType, fileUrl }
        })
        .filter((entry): entry is { fileType: string; fileUrl: string } => Boolean(entry))
    : []

  return {
    generationId: typeof record.generationId === 'string' ? record.generationId : null,
    status: typeof record.status === 'string' ? record.status : 'unknown',
    instructions: typeof record.instructions === 'string' ? record.instructions : null,
    webUrl: typeof record.webUrl === 'string' ? record.webUrl : null,
    shareUrl: typeof record.shareUrl === 'string' ? record.shareUrl : null,
    pptxUrl: typeof record.pptxUrl === 'string' ? record.pptxUrl : null,
    pdfUrl: typeof record.pdfUrl === 'string' ? record.pdfUrl : null,
    storageUrl: typeof record.storageUrl === 'string' ? record.storageUrl : null,
    generatedFiles,
  }
}

function extractProposalId(payload: unknown): string | null {
  if (!payload || typeof payload !== 'object') {
    return null
  }

  const record = payload as Record<string, unknown>
  const rawId = record.id
  if (typeof rawId === 'string') {
    const trimmed = rawId.trim()
    return trimmed.length ? trimmed : null
  }

  return null
}
