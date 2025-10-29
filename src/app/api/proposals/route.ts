import { NextRequest, NextResponse } from 'next/server'
import { FieldValue, Timestamp } from 'firebase-admin/firestore'
import type { Query, DocumentData } from 'firebase-admin/firestore'
import { z } from 'zod'

import { adminDb } from '@/lib/firebase-admin'
import { authenticateRequest, AuthenticationError } from '@/lib/server-auth'
import { buildProposalDocument, proposalDraftSchema, sanitizeProposalUpdate } from '@/lib/proposals'

const createSchema = proposalDraftSchema.extend({
  formData: proposalDraftSchema.shape.formData.default({}),
})

const updateSchema = proposalDraftSchema.partial()

type ProposalSnapshot = {
  status?: string
  stepProgress?: number
  formData?: unknown
  aiInsights?: unknown
  pdfUrl?: string | null
  createdAt?: Timestamp | string | null
  updatedAt?: Timestamp | string | null
  lastAutosaveAt?: Timestamp | string | null
}

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request)
    if (!auth.uid) {
      throw new AuthenticationError('Authentication required', 401)
    }

    const url = new URL(request.url)
    const statusParam = url.searchParams.get('status')
    const proposalsRef = adminDb.collection('users').doc(auth.uid).collection('proposals')
    let proposalsQuery: Query<DocumentData> = proposalsRef

    if (statusParam) {
      proposalsQuery = proposalsQuery.where('status', '==', statusParam)
    }

    const snapshot = await proposalsQuery.get()
    const results = snapshot.docs.map((docSnap) => {
      const data = docSnap.data() as ProposalSnapshot

      return {
        id: docSnap.id,
        status: data.status ?? 'draft',
        stepProgress: typeof data.stepProgress === 'number' ? data.stepProgress : 0,
        formData: data.formData ?? {},
        aiInsights: data.aiInsights ?? null,
        pdfUrl: data.pdfUrl ?? null,
        createdAt: serializeTimestamp(data.createdAt),
        updatedAt: serializeTimestamp(data.updatedAt),
        lastAutosaveAt: serializeTimestamp(data.lastAutosaveAt),
      }
    })

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

    const body = (await request.json().catch(() => null)) as unknown
    const parsed = createSchema.parse(body ?? {})

    const docRef = await adminDb
      .collection('users')
      .doc(auth.uid)
      .collection('proposals')
      .add(buildProposalDocument(parsed, auth.uid, FieldValue.serverTimestamp()))

    return NextResponse.json({ id: docRef.id }, { status: 201 })
  } catch (error: unknown) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid payload', details: error.flatten() }, { status: 400 })
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
      return NextResponse.json({ error: 'Invalid payload', details: error.flatten() }, { status: 400 })
    }
    console.error('[api/proposals] PATCH failed', error)
    return NextResponse.json({ error: 'Failed to update proposal' }, { status: 500 })
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
