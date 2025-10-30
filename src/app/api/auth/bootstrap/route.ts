import { NextRequest, NextResponse } from 'next/server'

import { FieldValue } from 'firebase-admin/firestore'
import { z } from 'zod'

import { adminAuth, adminDb } from '@/lib/firebase-admin'
import { authenticateRequest, AuthenticationError } from '@/lib/server-auth'

const payloadSchema = z
  .object({
    name: z.string().trim().min(1).max(120).optional(),
  })
  .optional()

const roleSchema = z.enum(['admin', 'team', 'client'])
const statusSchema = z.enum(['active', 'pending', 'invited', 'disabled', 'suspended'])

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request)
    if (!auth.uid) {
      throw new AuthenticationError('Authentication required', 401)
    }

    const parsedBody = payloadSchema.safeParse(await request.json().catch(() => undefined))
    const providedName = parsedBody.success ? parsedBody.data?.name : undefined

    const claimedRole = typeof auth.claims?.role === 'string' ? normalizeRole(auth.claims.role) : null
    const claimedStatus = typeof auth.claims?.status === 'string' ? normalizeStatus(auth.claims.status, 'active') : null

    const userRef = adminDb.collection('users').doc(auth.uid)
    const snapshot = await userRef.get()
    const existingData = snapshot.exists ? (snapshot.data() as Record<string, unknown>) : {}

    const storedRole = snapshot.exists ? normalizeRole(existingData.role) : null
    const storedStatus = snapshot.exists ? normalizeStatus(existingData.status, 'active') : null

    const finalRole = claimedRole ?? storedRole ?? 'client'
    let finalStatus = claimedStatus ?? storedStatus ?? (finalRole === 'admin' ? 'active' : 'pending')
    if (finalRole === 'admin' && finalStatus !== 'active') {
      finalStatus = 'active'
    }

    const serverTimestamp = FieldValue.serverTimestamp()
    const updatePayload: Record<string, unknown> = {
      updatedAt: serverTimestamp,
      lastLoginAt: serverTimestamp,
    }

    if (!snapshot.exists) {
      updatePayload.createdAt = serverTimestamp
      updatePayload.email = auth.email ?? ''
      updatePayload.agencyId = existingData?.agencyId ?? null
      updatePayload.role = finalRole
      updatePayload.status = finalStatus
      updatePayload.name = providedName ?? auth.email ?? 'Pending user'
    } else {
      if (existingData.role !== finalRole) {
        updatePayload.role = finalRole
      }
      if (existingData.status !== finalStatus) {
        updatePayload.status = finalStatus
      }
      if (providedName) {
        updatePayload.name = providedName
      }
    }

    await userRef.set(updatePayload, { merge: true })

    const userRecord = await adminAuth.getUser(auth.uid)
    const customClaims = userRecord.customClaims ?? {}
    const claimRoleExisting = typeof customClaims.role === 'string' ? normalizeRole(customClaims.role) : null
    const claimStatusExisting = typeof customClaims.status === 'string' ? normalizeStatus(customClaims.status, 'active') : null

    const claimsNeedUpdate = claimRoleExisting !== finalRole || claimStatusExisting !== finalStatus

    if (claimsNeedUpdate) {
      const nextClaims = {
        ...Object.fromEntries(
          Object.entries(customClaims).filter(([key]) => key !== 'role' && key !== 'status')
        ),
        role: finalRole,
        status: finalStatus,
      }
      await adminAuth.setCustomUserClaims(auth.uid, nextClaims)
    }

    return NextResponse.json({ ok: true, role: finalRole, status: finalStatus, claimsUpdated: claimsNeedUpdate })
  } catch (error: unknown) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error('[auth/bootstrap] failed', error)
    return NextResponse.json({ error: 'Failed to synchronise account' }, { status: 500 })
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
