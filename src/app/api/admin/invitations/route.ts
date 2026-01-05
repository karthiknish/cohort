import { NextResponse } from 'next/server'
import { Timestamp } from 'firebase-admin/firestore'
import { z } from 'zod'

import { adminDb } from '@/lib/firebase-admin'
import { apiSuccess, createApiHandler } from '@/lib/api-handler'
import { ConflictError, NotFoundError, ValidationError } from '@/lib/api-errors'
import { toISO } from '@/lib/utils'

const ADMIN_USER_ROLES = ['admin', 'team', 'client'] as const
type AdminUserRole = (typeof ADMIN_USER_ROLES)[number]

const invitationSchema = z.object({
  email: z.string().email('Valid email is required').max(254),
  role: z.enum(ADMIN_USER_ROLES).default('team'),
  name: z.string().trim().max(120).optional(),
  message: z.string().trim().max(500).optional(),
})

type InvitationInput = z.infer<typeof invitationSchema>

type InvitationRecord = {
  id: string
  email: string
  role: AdminUserRole
  name: string | null
  message: string | null
  status: 'pending' | 'accepted' | 'expired' | 'revoked'
  invitedBy: string
  invitedByName: string | null
  token: string
  expiresAt: string
  createdAt: string
  acceptedAt: string | null
}

type StoredInvitation = {
  email?: unknown
  role?: unknown
  name?: unknown
  message?: unknown
  status?: unknown
  invitedBy?: unknown
  invitedByName?: unknown
  token?: unknown
  expiresAt?: unknown
  createdAt?: unknown
  acceptedAt?: unknown
}

function mapInvitationDoc(docId: string, data: StoredInvitation): InvitationRecord {
  return {
    id: docId,
    email: typeof data.email === 'string' ? data.email : '',
    role: ADMIN_USER_ROLES.includes(data.role as AdminUserRole)
      ? (data.role as AdminUserRole)
      : 'team',
    name: typeof data.name === 'string' ? data.name : null,
    message: typeof data.message === 'string' ? data.message : null,
    status: ['pending', 'accepted', 'expired', 'revoked'].includes(data.status as string)
      ? (data.status as InvitationRecord['status'])
      : 'pending',
    invitedBy: typeof data.invitedBy === 'string' ? data.invitedBy : '',
    invitedByName: typeof data.invitedByName === 'string' ? data.invitedByName : null,
    token: typeof data.token === 'string' ? data.token : '',
    expiresAt: toISO(data.expiresAt) ?? new Date().toISOString(),
    createdAt: toISO(data.createdAt) ?? new Date().toISOString(),
    acceptedAt: toISO(data.acceptedAt),
  }
}

function generateToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let token = ''
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return token
}

const EMAIL_WEBHOOK_URL =
  process.env.INVITATION_EMAIL_WEBHOOK_URL || process.env.CONTACT_EMAIL_WEBHOOK_URL

async function sendInvitationEmail(invitation: {
  email: string
  role: string
  invitedByName: string | null
  token: string
  expiresAt: string
}) {
  if (!EMAIL_WEBHOOK_URL) {
    console.info('[invitations] email webhook not configured, skipping email send')
    return { sent: false, reason: 'webhook_not_configured' }
  }

  try {
    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL || 'http://localhost:3000'
    const inviteUrl = `${appUrl}/auth?invite=${invitation.token}`

    await fetch(EMAIL_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'invitation.created',
        payload: {
          to: invitation.email,
          role: invitation.role,
          invitedBy: invitation.invitedByName || 'An administrator',
          inviteUrl,
          expiresAt: invitation.expiresAt,
        },
      }),
    })
    return { sent: true }
  } catch (error) {
    console.error('[invitations] email webhook failed', error)
    return { sent: false, reason: 'webhook_failed' }
  }
}

export const GET = createApiHandler(
  {
    adminOnly: true,
    rateLimit: 'standard',
  },
  async (req) => {
    const searchParams = req.nextUrl.searchParams
    const statusFilter = searchParams.get('status')
    const limitParam = searchParams.get('limit')
    const limit = Math.min(Math.max(Number(limitParam) || 50, 1), 100)

    let query = adminDb.collection('invitations').orderBy('createdAt', 'desc').limit(limit)

    if (statusFilter && ['pending', 'accepted', 'expired', 'revoked'].includes(statusFilter)) {
      query = adminDb
        .collection('invitations')
        .where('status', '==', statusFilter)
        .orderBy('createdAt', 'desc')
        .limit(limit)
    }

    const snapshot = await query.get()
    const invitations = snapshot.docs.map((doc) =>
      mapInvitationDoc(doc.id, doc.data() as StoredInvitation)
    )

    return { invitations }
  }
)

export const POST = createApiHandler(
  {
    adminOnly: true,
    bodySchema: invitationSchema,
    rateLimit: 'sensitive',
  },
  async (req, { auth, body }) => {
    const payload = body as InvitationInput

    const normalizedEmail = payload.email.toLowerCase().trim()

    // Check if user already exists
    const existingUserSnapshot = await adminDb
      .collection('users')
      .where('email', '==', normalizedEmail)
      .limit(1)
      .get()

    if (!existingUserSnapshot.empty) {
      throw new ConflictError('A user with this email already exists')
    }

    // Check for existing pending invitation
    const existingInviteSnapshot = await adminDb
      .collection('invitations')
      .where('email', '==', normalizedEmail)
      .where('status', '==', 'pending')
      .limit(1)
      .get()

    if (!existingInviteSnapshot.empty) {
      throw new ConflictError('A pending invitation already exists for this email')
    }

    // Get inviter's name
    const inviterDoc = await adminDb.collection('users').doc(auth.uid!).get()
    const inviterData = inviterDoc.data()
    const inviterName = typeof inviterData?.name === 'string' ? inviterData.name : null

    const token = generateToken()
    const now = Timestamp.now()
    const expiresAt = Timestamp.fromDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)) // 7 days

    const docRef = await adminDb.collection('invitations').add({
      email: normalizedEmail,
      role: payload.role,
      name: payload.name?.trim() || null,
      message: payload.message?.trim() || null,
      status: 'pending',
      invitedBy: auth.uid,
      invitedByName: inviterName,
      token,
      expiresAt,
      createdAt: now,
      acceptedAt: null,
    })

    const createdDoc = await docRef.get()
    const invitation = mapInvitationDoc(createdDoc.id, createdDoc.data() as StoredInvitation)

    // Send invitation email
    const emailResult = await sendInvitationEmail({
      email: invitation.email,
      role: invitation.role,
      invitedByName: invitation.invitedByName,
      token: invitation.token,
      expiresAt: invitation.expiresAt,
    })

    return NextResponse.json(
      apiSuccess({
        invitation,
        emailSent: emailResult.sent,
        emailError: emailResult.sent ? undefined : emailResult.reason,
      }),
      { status: 201 }
    )
  }
)
