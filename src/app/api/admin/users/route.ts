import { NextRequest, NextResponse } from 'next/server'

import { FieldPath, FieldValue, Timestamp } from 'firebase-admin/firestore'
import { z } from 'zod'

import { adminAuth, adminDb } from '@/lib/firebase-admin'
import { authenticateRequest, assertAdmin, AuthenticationError } from '@/lib/server-auth'

const roleSchema = z.enum(['admin', 'team', 'client'])
const statusSchema = z.enum(['active', 'invited', 'pending', 'disabled', 'suspended'])

function toISO(value: unknown): string | null {
  if (!value) return null
  try {
    if (value instanceof Date) {
      return value.toISOString()
    }
    if (value instanceof Timestamp) {
      return value.toDate().toISOString()
    }
    const timestamp = (value as { toDate?: () => Date }).toDate?.()
    if (timestamp) {
      return timestamp.toISOString()
    }
  } catch {
    // noop
  }
  if (typeof value === 'string') {
    const date = new Date(value)
    if (!Number.isNaN(date.getTime())) {
      return date.toISOString()
    }
    return value
  }
  return null
}

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request)
    assertAdmin(auth)

    const url = new URL(request.url)
    const sizeParam = url.searchParams.get('pageSize')
    const searchParam = url.searchParams.get('search')
    const statusParam = url.searchParams.get('status')
    const roleParam = url.searchParams.get('role')
    const cursorParam = url.searchParams.get('cursor')

    const pageSize = Math.min(Math.max(Number(sizeParam) || 50, 1), 200)

    let usersQuery = adminDb
      .collection('users')
      .orderBy('createdAt', 'desc')
      .orderBy(FieldPath.documentId(), 'desc')
      .limit(pageSize)

    if (cursorParam) {
      const [cursorTime, cursorId] = cursorParam.split('|')
      if (cursorTime && cursorId) {
        const cursorDate = new Date(cursorTime)
        if (!Number.isNaN(cursorDate.getTime())) {
              usersQuery = usersQuery.startAfter(Timestamp.fromDate(cursorDate), cursorId)
        }
      }
    }
              const snapshot = await usersQuery.get()

    const records = snapshot.docs.map((docSnap) => {
      const data = docSnap.data() as Record<string, unknown>
      const roleValue = typeof data.role === 'string' ? data.role : null
      const statusValue = typeof data.status === 'string' ? data.status : null
      const role = normalizeRole(roleValue)
      const status = normalizeStatus(statusValue, 'active')

      return {
        id: docSnap.id,
        name: typeof data.name === 'string' && data.name.trim().length > 0 ? data.name : 'Unnamed user',
        email: typeof data.email === 'string' ? data.email : '',
        role,
        status,
        agencyId: typeof data.agencyId === 'string' ? data.agencyId : null,
        createdAt: toISO(data.createdAt),
        updatedAt: toISO(data.updatedAt),
        lastLoginAt: toISO(data.lastLoginAt ?? data.lastActiveAt ?? data.updatedAt ?? data.createdAt),
      }
    })

    let filtered = records

    if (statusParam && statusSchema.safeParse(statusParam).success) {
      filtered = filtered.filter((record) => record.status === statusParam)
    }

    if (roleParam) {
      const normalizedFilterRole = normalizeRole(roleParam)
      const acceptedFilter = roleParam === normalizedFilterRole || roleParam === 'manager' || roleParam === 'member'
      if (acceptedFilter) {
        filtered = filtered.filter((record) => record.role === normalizedFilterRole)
      }
    }

    if (searchParam && searchParam.trim().length > 0) {
      const term = searchParam.trim().toLowerCase()
      filtered = filtered.filter((record) => {
        const haystack = `${record.name} ${record.email}`.toLowerCase()
        return haystack.includes(term)
      })
    }

    const lastDoc = snapshot.docs[snapshot.docs.length - 1]
    let nextCursor: string | null = null
    if (lastDoc && snapshot.docs.length === pageSize) {
      const lastData = lastDoc.data() as Record<string, unknown>
      const createdAt = toISO(lastData.createdAt)
      if (createdAt) {
        nextCursor = `${createdAt}|${lastDoc.id}`
      }
    }

    return NextResponse.json({ users: filtered, nextCursor })
  } catch (error: unknown) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error('[admin/users] get failed', error)
    return NextResponse.json({ error: 'Failed to load users' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request)
    assertAdmin(auth)

    const body = await request.json().catch(() => null)
    const schema = z
      .object({
        id: z.string().min(1),
        role: roleSchema.optional(),
        status: statusSchema.optional(),
      })
      .refine((payload) => payload.role !== undefined || payload.status !== undefined, {
        message: 'Role or status must be provided',
        path: ['role'],
      })

    const parseResult = schema.safeParse(body)
    if (!parseResult.success) {
      return NextResponse.json({ error: 'Invalid request payload' }, { status: 400 })
    }

    const { id, role, status } = parseResult.data

    const userRef = adminDb.collection('users').doc(id)
    const userSnapshot = await userRef.get()
    if (!userSnapshot.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const docData = userSnapshot.data() as Record<string, unknown>
    const currentRole = normalizeRole(docData?.role)
    const currentStatus = normalizeStatus(docData?.status, 'active')

    const nextRole = role ?? currentRole
    let nextStatus = status ?? currentStatus
    if (nextRole === 'admin' && nextStatus !== 'active') {
      nextStatus = 'active'
    }

    const updatePayload: Record<string, unknown> = {
      updatedAt: FieldValue.serverTimestamp(),
    }

    if (docData?.role !== nextRole) {
      updatePayload.role = nextRole
    }

    if (docData?.status !== nextStatus) {
      updatePayload.status = nextStatus
    }

    if (Object.keys(updatePayload).length > 1) {
      await userRef.update(updatePayload)
    }

    const userRecord = await adminAuth.getUser(id).catch(() => null)
    if (!userRecord) {
      return NextResponse.json({ error: 'Firebase user not found' }, { status: 404 })
    }

    const existingClaims = userRecord.customClaims ?? {}
    const nextClaims = {
      ...Object.fromEntries(
        Object.entries(existingClaims).filter(([key]) => key !== 'role' && key !== 'status')
      ),
      role: nextRole,
      status: nextStatus,
    }

    await adminAuth.setCustomUserClaims(id, nextClaims)

    return NextResponse.json({ ok: true, role: nextRole, status: nextStatus })
  } catch (error: unknown) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error('[admin/users] patch failed', error)
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
  }
}

function normalizeRole(value: unknown): z.infer<typeof roleSchema> {
  if (value === 'admin' || value === 'team' || value === 'client') {
    return value
  }
  if (value === 'manager') {
    return 'team'
  }
  if (value === 'member') {
    return 'client'
  }
  return 'client'
}

function normalizeStatus(value: unknown, fallback: z.infer<typeof statusSchema> = 'active'): z.infer<typeof statusSchema> {
  if (value === 'active' || value === 'pending' || value === 'invited' || value === 'disabled' || value === 'suspended') {
    return value
  }
  if (value === 'inactive' || value === 'blocked') {
    return 'disabled'
  }
  return fallback
}
