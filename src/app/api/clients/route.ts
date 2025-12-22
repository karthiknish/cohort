import { NextRequest, NextResponse } from 'next/server'
import { FieldValue, Timestamp } from 'firebase-admin/firestore'
import { z } from 'zod'

import { createApiHandler } from '@/lib/api-handler'
import { resolveWorkspaceContext } from '@/lib/workspace'
import type { ClientRecord, ClientTeamMember } from '@/types/clients'

const teamMemberSchema = z.object({
  name: z.string().trim().min(1, 'Team member name is required').max(120),
  role: z.string().trim().max(120).optional(),
})

const createClientSchema = z.object({
  name: z.string().trim().min(1, 'Client name is required').max(200),
  accountManager: z.string().trim().min(1, 'Account manager is required').max(120),
  teamMembers: z.array(teamMemberSchema).optional().default([]),
  billingEmail: z.string().trim().email().optional(),
})

const deleteClientSchema = z.object({
  id: z.string().trim().min(1, 'Client id is required'),
})

const addTeamMemberSchema = z.object({
  action: z.literal('addTeamMember'),
  id: z.string().trim().min(1, 'Client id is required'),
  name: z.string().trim().min(1, 'Team member name is required').max(120),
  role: z.string().trim().max(120).optional(),
})

type StoredClient = {
  name?: unknown
  accountManager?: unknown
  teamMembers?: unknown
  billingEmail?: unknown
  stripeCustomerId?: unknown
  lastInvoiceStatus?: unknown
  lastInvoiceAmount?: unknown
  lastInvoiceCurrency?: unknown
  lastInvoiceIssuedAt?: unknown
  lastInvoiceNumber?: unknown
  lastInvoiceUrl?: unknown
  createdAt?: unknown
  updatedAt?: unknown
}

function slugify(value: string): string {
  const base = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)

  if (base.length === 0) {
    return `client-${Date.now()}`
  }

  return base
}

async function generateClientId(
  clientsCollection: FirebaseFirestore.CollectionReference,
  name: string
): Promise<string> {
  const baseId = slugify(name)
  let candidateId = baseId
  let attempt = 1

  while (attempt <= 20) {
    const docRef = clientsCollection.doc(candidateId)
    const snapshot = await docRef.get()
    if (!snapshot.exists) {
      return candidateId
    }
    candidateId = `${baseId}-${attempt}`
    attempt += 1
  }

  return `${baseId}-${Date.now()}`
}

function coerceTeamMembers(value: unknown): ClientTeamMember[] {
  if (!Array.isArray(value)) {
    return []
  }

  return value
    .map((item) => {
      if (!item || typeof item !== 'object') {
        return null
      }

      const record = item as Record<string, unknown>
      const name = typeof record.name === 'string' ? record.name.trim() : ''
      const role = typeof record.role === 'string' ? record.role.trim() : ''

      if (!name) {
        return null
      }

      return {
        name,
        role: role || 'Contributor',
      }
    })
    .filter(Boolean) as ClientTeamMember[]
}

function coerceNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }
  if (typeof value === 'string') {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) {
      return parsed
    }
  }
  return null
}

type TimestampLike = Timestamp | Date | { toDate: () => Date } | string | null | undefined

function toISO(value: TimestampLike): string | null {
  if (value == null) {
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

function mapClientDoc(docId: string, data: StoredClient): ClientRecord {
  const name = typeof data.name === 'string' ? data.name : 'Untitled client'
  const accountManager = typeof data.accountManager === 'string' ? data.accountManager : 'Unassigned'
  const teamMembers = coerceTeamMembers(data.teamMembers)
  const billingEmail = typeof data.billingEmail === 'string' ? data.billingEmail : null
  const stripeCustomerId = typeof data.stripeCustomerId === 'string' ? data.stripeCustomerId : null
  const lastInvoiceStatus = typeof data.lastInvoiceStatus === 'string' ? data.lastInvoiceStatus : null
  const lastInvoiceAmount = coerceNumber(data.lastInvoiceAmount)
  const lastInvoiceCurrency = typeof data.lastInvoiceCurrency === 'string' ? data.lastInvoiceCurrency : null
  const lastInvoiceIssuedAt = toISO(data.lastInvoiceIssuedAt as TimestampLike)
  const lastInvoiceNumber = typeof data.lastInvoiceNumber === 'string' ? data.lastInvoiceNumber : null
  const lastInvoiceUrl = typeof data.lastInvoiceUrl === 'string' ? data.lastInvoiceUrl : null

  return {
    id: docId,
    name,
    accountManager,
    teamMembers,
    billingEmail,
    stripeCustomerId,
    lastInvoiceStatus,
    lastInvoiceAmount,
    lastInvoiceCurrency,
    lastInvoiceIssuedAt,
    lastInvoiceNumber,
    lastInvoiceUrl,
    createdAt: toISO(data.createdAt as TimestampLike),
    updatedAt: toISO(data.updatedAt as TimestampLike),
  }
}

export const GET = createApiHandler(
  {
    workspace: 'required',
  },
  async (req, { workspace }) => {
    if (!workspace) throw new Error('Workspace context missing')
    const snapshot = await workspace.clientsCollection.get()

    const clients = snapshot.docs
      .map((doc) => mapClientDoc(doc.id, doc.data() as StoredClient))
      .sort((a, b) => a.name.localeCompare(b.name))

    return { clients }
  }
)

export const POST = createApiHandler(
  {
    workspace: 'required',
    adminOnly: true,
    bodySchema: createClientSchema,
  },
  async (req, { auth, workspace, body }) => {
    if (!workspace) throw new Error('Workspace context missing')
    const payload = body

    const resolvedTeam = payload.teamMembers
      .map((member: any) => ({
        name: member.name.trim(),
        role: (member.role ?? '').trim() || 'Contributor',
      }))
      .filter((member: any) => member.name.length > 0)

    if (!resolvedTeam.some((member: any) => member.name.toLowerCase() === payload.accountManager.toLowerCase())) {
      resolvedTeam.unshift({ name: payload.accountManager, role: 'Account Manager' })
    }

    const billingEmail = payload.billingEmail?.trim().toLowerCase() ?? null

    const clientId = await generateClientId(workspace.clientsCollection, payload.name)
    const timestamp = FieldValue.serverTimestamp()

    const docRef = workspace.clientsCollection.doc(clientId)

    await docRef.set({
      name: payload.name,
      accountManager: payload.accountManager,
      teamMembers: resolvedTeam,
      billingEmail,
      stripeCustomerId: null,
      lastInvoiceStatus: null,
      lastInvoiceAmount: null,
      lastInvoiceCurrency: null,
      lastInvoiceIssuedAt: null,
      lastInvoiceNumber: null,
      lastInvoiceUrl: null,
      workspaceId: workspace.workspaceId,
      createdBy: auth.uid,
      createdAt: timestamp,
      updatedAt: timestamp,
    })

    const created = await docRef.get()
    const client = mapClientDoc(created.id, created.data() as StoredClient)

    return { client }
  }
)

export const PATCH = createApiHandler(
  {
    workspace: 'required',
    adminOnly: true,
    bodySchema: addTeamMemberSchema,
  },
  async (req, { workspace, body }) => {
    if (!workspace) throw new Error('Workspace context missing')
    const { id, name, role } = body
    const clientRef = workspace.clientsCollection.doc(id)
    const snapshot = await clientRef.get()

    if (!snapshot.exists) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    const existingMembers = coerceTeamMembers(snapshot.data()?.teamMembers)
    const normalizedName = name.trim()
    const normalizedRole = (role ?? '').trim() || 'Contributor'

    if (existingMembers.some((member) => member.name.toLowerCase() === normalizedName.toLowerCase())) {
      return NextResponse.json({ error: 'Team member already exists for this client' }, { status: 409 })
    }

    const updatedMembers = [...existingMembers, { name: normalizedName, role: normalizedRole }]

    await clientRef.update({
      teamMembers: updatedMembers,
      updatedAt: FieldValue.serverTimestamp(),
    })

    return { teamMembers: updatedMembers }
  }
)

export const DELETE = createApiHandler(
  {
    workspace: 'required',
    adminOnly: true,
    bodySchema: deleteClientSchema,
  },
  async (req, { workspace, body }) => {
    if (!workspace) throw new Error('Workspace context missing')
    const { id } = body
    const docRef = workspace.clientsCollection.doc(id)
    const snapshot = await docRef.get()

    if (!snapshot.exists) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    await docRef.delete()

    return { ok: true }
  }
)
