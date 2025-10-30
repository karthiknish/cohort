import { NextRequest, NextResponse } from 'next/server'
import { FieldValue, Timestamp } from 'firebase-admin/firestore'
import { z } from 'zod'

import { adminDb } from '@/lib/firebase-admin'
import { authenticateRequest, assertAdmin, AuthenticationError } from '@/lib/server-auth'
import type { FinanceCostEntry } from '@/types/finance'

type StoredFinanceCost = {
  clientId?: unknown
  category?: unknown
  amount?: unknown
  cadence?: unknown
  createdAt?: unknown
  updatedAt?: unknown
}

const amountSchema = z
  .union([z.number(), z.string()])
  .transform((value) => {
    const numeric = typeof value === 'string' ? Number(value) : value
    if (!Number.isFinite(numeric)) {
      throw new Error('Amount must be a number')
    }
    return numeric
  })
  .refine((value) => value > 0, { message: 'Amount must be greater than zero' })

const createCostSchema = z.object({
  category: z.string().trim().min(1, 'Category is required').max(200),
  amount: amountSchema,
  cadence: z.enum(['monthly', 'quarterly', 'annual']),
  clientId: z
    .union([z.string().trim().min(1), z.null(), z.undefined()])
    .transform((value) => (typeof value === 'string' ? value : null))
    .optional(),
})

function toISO(value: unknown): string | null {
  if (!value && value !== 0) return null
  if (value instanceof Timestamp) {
    return value.toDate().toISOString()
  }
  if (
    typeof value === 'object' &&
    value !== null &&
    'toDate' in value &&
    typeof (value as { toDate?: () => Date }).toDate === 'function'
  ) {
    return (value as Timestamp).toDate().toISOString()
  }
  if (typeof value === 'string') {
    const parsed = new Date(value)
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString()
    }
    return value
  }
  return null
}

function coerceNumber(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }
  if (typeof value === 'string') {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) {
      return parsed
    }
  }
  return 0
}

function mapCostDoc(docId: string, data: StoredFinanceCost): FinanceCostEntry {
  const cadence = (typeof data.cadence === 'string' ? data.cadence : 'monthly') as FinanceCostEntry['cadence']
  return {
    id: docId,
    clientId: typeof data.clientId === 'string' ? data.clientId : null,
    category: typeof data.category === 'string' ? data.category : 'Uncategorized',
    amount: coerceNumber(data.amount),
    cadence: cadence === 'monthly' || cadence === 'quarterly' || cadence === 'annual' ? cadence : 'monthly',
    createdAt: toISO(data.createdAt),
    updatedAt: toISO(data.updatedAt),
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request)
    if (!auth.uid) {
      throw new AuthenticationError('Authentication required', 401)
    }

    assertAdmin(auth)

    const json = (await request.json().catch(() => null)) ?? {}
    const payload = createCostSchema.parse(json)

    const userRef = adminDb.collection('users').doc(auth.uid)
    const costsRef = userRef.collection('financeCosts')
    const docRef = costsRef.doc()
    const timestamp = FieldValue.serverTimestamp()

    await docRef.set({
      category: payload.category,
      amount: payload.amount,
      cadence: payload.cadence,
      clientId: payload.clientId ?? null,
      createdAt: timestamp,
      updatedAt: timestamp,
    })

    const snapshot = await docRef.get()
    const cost = mapCostDoc(snapshot.id, snapshot.data() as StoredFinanceCost)

    return NextResponse.json({ cost }, { status: 201 })
  } catch (error: unknown) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid cost payload', details: error.flatten() }, { status: 400 })
    }

    console.error('[finance/costs] POST failed', error)
    return NextResponse.json({ error: 'Failed to create cost entry' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request)
    if (!auth.uid) {
      throw new AuthenticationError('Authentication required', 401)
    }

    assertAdmin(auth)

    const id = request.nextUrl.searchParams.get('id')?.trim() ?? ''
    if (!id) {
      return NextResponse.json({ error: 'Cost id is required' }, { status: 400 })
    }

    const docRef = adminDb.collection('users').doc(auth.uid).collection('financeCosts').doc(id)
    const snapshot = await docRef.get()

    if (!snapshot.exists) {
      return NextResponse.json({ error: 'Cost entry not found' }, { status: 404 })
    }

    await docRef.delete()

    return NextResponse.json({ ok: true })
  } catch (error: unknown) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    console.error('[finance/costs] DELETE failed', error)
    return NextResponse.json({ error: 'Failed to delete cost entry' }, { status: 500 })
  }
}
