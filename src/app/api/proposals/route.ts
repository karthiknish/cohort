import { NextRequest, NextResponse } from 'next/server'
import { addDoc, collection, doc, getDocs, query, updateDoc, where } from 'firebase/firestore'
import { z } from 'zod'

import { db } from '@/lib/firebase'
import { authenticateRequest, AuthenticationError } from '@/lib/server-auth'
import { buildProposalDocument, proposalDraftSchema, sanitizeProposalUpdate } from '@/lib/proposals'

const createSchema = proposalDraftSchema.extend({
  formData: proposalDraftSchema.shape.formData.default({}),
})

const updateSchema = proposalDraftSchema.partial()

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request)
    if (!auth.uid) {
      throw new AuthenticationError('Authentication required', 401)
    }

    const url = new URL(request.url)
    const statusParam = url.searchParams.get('status')
    const baseCollection = collection(db, `users/${auth.uid}/proposals`)

    const constraints = []
    if (statusParam) {
      constraints.push(where('status', '==', statusParam))
    }

    const proposalsQuery = constraints.length ? query(baseCollection, ...constraints) : query(baseCollection)
    const snapshot = await getDocs(proposalsQuery)
    const results = snapshot.docs.map((docSnap) => {
      const data = docSnap.data()
      return {
        id: docSnap.id,
        ...data,
        createdAt: 'createdAt' in data && data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt ?? null,
        updatedAt: 'updatedAt' in data && data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt ?? null,
        lastAutosaveAt:
          'lastAutosaveAt' in data && data.lastAutosaveAt?.toDate
            ? data.lastAutosaveAt.toDate().toISOString()
            : data.lastAutosaveAt ?? null,
      }
    })

    return NextResponse.json({ proposals: results })
  } catch (error: any) {
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

    const body = await request.json().catch(() => null)
    const parsed = createSchema.parse(body ?? {})

    const docRef = await addDoc(collection(db, `users/${auth.uid}/proposals`), buildProposalDocument(parsed, auth.uid))

    return NextResponse.json({ id: docRef.id }, { status: 201 })
  } catch (error: any) {
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

    const body = await request.json().catch(() => null)
    const parsed = updateSchema.parse(body ?? {})
    const proposalId = (body?.id as string | undefined)?.trim()

    if (!proposalId) {
      return NextResponse.json({ error: 'Proposal id required' }, { status: 400 })
    }

    const proposalRef = doc(db, `users/${auth.uid}/proposals/${proposalId}`)
    await updateDoc(proposalRef, sanitizeProposalUpdate(parsed))

    return NextResponse.json({ ok: true })
  } catch (error: any) {
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
