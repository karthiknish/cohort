import { FieldValue, Timestamp, FieldPath } from 'firebase-admin/firestore'
import { z } from 'zod'

import { createApiHandler } from '@/lib/api-handler'
import { adminDb } from '@/lib/firebase-admin'
import { resolveWorkspaceContext } from '@/lib/workspace'
import type { ClientRecord, ClientTeamMember } from '@/types/clients'
import { ConflictError, NotFoundError } from '@/lib/api-errors'
import { toISO } from '@/lib/utils'
import { logAuditAction } from '@/lib/audit-logger'
import { coerceClientTeamMembers, mapClientDoc, type StoredClient } from '@/lib/firestore/mappers'
import { decodeStringIdCursor, encodeStringIdCursor, parsePageSize } from '@/lib/pagination'

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


const addTeamMemberSchema = z.object({
  action: z.literal('addTeamMember'),
  id: z.string().trim().min(1, 'Client id is required'),
  name: z.string().trim().min(1, 'Team member name is required').max(120),
  role: z.string().trim().max(120).optional(),
})

const paginationQuerySchema = z.object({
  pageSize: z.string().optional(),
  after: z.string().optional(),
  includeTotals: z.string().optional(),
})

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

const coerceTeamMembers = coerceClientTeamMembers

export const GET = createApiHandler(
  {
    workspace: 'required',
    rateLimit: 'standard',
    querySchema: paginationQuerySchema,
  },
  async (req, { auth, workspace, query }) => {
    if (!workspace) throw new Error('Workspace context missing')
    
    const pageSize = parsePageSize(query.pageSize, { defaultValue: 50, max: 100 })
    const afterParam = query.after
    const includeTotals = query.includeTotals === 'true' || query.includeTotals === '1'

    let baseQuery = workspace.clientsCollection
      .where('deletedAt', '==', null)
      .orderBy('name', 'asc')
      .orderBy(FieldPath.documentId(), 'asc')
      .limit(pageSize + 1)

    const decodedCursor = decodeStringIdCursor(typeof afterParam === 'string' ? afterParam : null)
    if (decodedCursor) {
      baseQuery = baseQuery.startAfter(decodedCursor.value, decodedCursor.id)
    }

    let snapshot = await baseQuery.get()

    // One-time compatibility bridge: if this workspace has no clients, but the legacy
    // per-user subcollection has data, migrate it into the workspace-scoped collection.
    // This prevents "No clients available" after switching to workspace-scoped paths.
    if (snapshot.empty) {
      try {
        const workspaceSnap = await workspace.workspaceRef.get()
        const workspaceData = (workspaceSnap.data() ?? {}) as Record<string, unknown>
        const migrations = (workspaceData.migrations ?? {}) as Record<string, unknown>
        const clientsFromUser = (migrations.clientsFromUser ?? {}) as Record<string, unknown>
        const alreadyMigrated = clientsFromUser.completedAt != null

        if (!alreadyMigrated) {
          const legacyUserId = auth.uid

          if (legacyUserId) {
            const legacySnapshot = await adminDb.collection('users').doc(legacyUserId).collection('clients').get()

            if (!legacySnapshot.empty) {
              let migratedCount = 0

              let batch = adminDb.batch()
              let pendingOps = 0
              const commitIfNeeded = async () => {
                if (pendingOps > 0) {
                  await batch.commit()
                  batch = adminDb.batch()
                  pendingOps = 0
                }
              }

              for (const doc of legacySnapshot.docs) {
                const data = (doc.data() ?? {}) as Record<string, unknown>
                const deletedAt = data.deletedAt ?? null

                // Skip legacy soft-deleted clients (if the field exists and is not null).
                if (deletedAt !== null) continue

                migratedCount += 1
                const targetRef = workspace.clientsCollection.doc(doc.id)
                batch.set(
                  targetRef,
                  {
                    ...data,
                    workspaceId: workspace.workspaceId,
                    deletedAt: null,
                    migratedFromUser: legacyUserId,
                    migratedAt: FieldValue.serverTimestamp(),
                    updatedAt: FieldValue.serverTimestamp(),
                  },
                  { merge: true }
                )
                pendingOps += 1

                // Keep well under Firestore's 500 operations per batch.
                if (pendingOps >= 400) {
                  await commitIfNeeded()
                }
              }

              await commitIfNeeded()
              await workspace.workspaceRef.set(
                {
                  migrations: {
                    clientsFromUser: {
                      completedAt: FieldValue.serverTimestamp(),
                      sourceUserId: legacyUserId,
                      migratedCount,
                    },
                  },
                },
                { merge: true }
              )

              if (migratedCount > 0) {
                // Re-run the original query after migration.
                snapshot = await baseQuery.get()
              }
            } else {
              await workspace.workspaceRef.set(
                {
                  migrations: {
                    clientsFromUser: {
                      completedAt: FieldValue.serverTimestamp(),
                      sourceUserId: legacyUserId,
                      migratedCount: 0,
                    },
                  },
                },
                { merge: true }
              )
            }
          }
        }
      } catch {
        // Best-effort only; falling back to empty list is fine.
      }
    }

    const allDocs = snapshot.docs
    const hasMore = allDocs.length > pageSize
    const docs = hasMore ? allDocs.slice(0, pageSize) : allDocs

    const clients = docs.map((doc) => mapClientDoc(doc.id, doc.data() as StoredClient))

    let nextCursor: string | null = null
    if (hasMore && docs.length > 0) {
      const lastDoc = docs[docs.length - 1]
      const lastData = lastDoc.data() as StoredClient
      nextCursor = encodeStringIdCursor(typeof lastData.name === 'string' ? lastData.name : '', lastDoc.id)
    }

    const totalsAgg = includeTotals
      ? await workspace.clientsCollection.where('deletedAt', '==', null).count().get()
      : null

    const total = includeTotals
      ? typeof totalsAgg?.data().count === 'number'
        ? totalsAgg.data().count
        : 0
      : undefined

    return { clients, nextCursor, ...(includeTotals ? { total } : {}) }
  }
)

export const POST = createApiHandler(
  {
    workspace: 'required',
    adminOnly: true,
    bodySchema: createClientSchema,
    rateLimit: 'sensitive',
  },
  async (req, { auth, workspace, body }) => {
    if (!workspace) throw new Error('Workspace context missing')
    const payload = body

    const resolvedTeam: ClientTeamMember[] = payload.teamMembers
      .map((member) => ({
        name: member.name.trim(),
        role: (member.role ?? '').trim() || 'Contributor',
      }))
      .filter((member): member is ClientTeamMember => member.name.length > 0)

    if (!resolvedTeam.some((member) => member.name.toLowerCase() === payload.accountManager.toLowerCase())) {
      resolvedTeam.unshift({ name: payload.accountManager, role: 'Account Manager' })
    }

    const billingEmail = payload.billingEmail?.trim().toLowerCase() ?? null
    const timestamp = FieldValue.serverTimestamp()

    const client = await workspace.workspaceRef.firestore.runTransaction(async (transaction) => {
      const baseId = slugify(payload.name)
      let candidateId = baseId
      let attempt = 1
      let finalId = ''

      while (attempt <= 20) {
        const docRef = workspace.clientsCollection.doc(candidateId)
        const snapshot = await transaction.get(docRef)
        if (!snapshot.exists) {
          finalId = candidateId
          break
        }
        candidateId = `${baseId}-${attempt}`
        attempt += 1
      }

      if (!finalId) {
        finalId = `${baseId}-${Date.now()}`
      }

      const docRef = workspace.clientsCollection.doc(finalId)
      const clientData = {
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
        deletedAt: null,
      }

      transaction.set(docRef, clientData)
      return { id: finalId, ...clientData }
    })

    await logAuditAction({
      action: 'CLIENT_CREATE',
      actorId: auth.uid!,
      targetId: client.id,
      workspaceId: workspace.workspaceId,
      metadata: {
        name: payload.name,
        accountManager: payload.accountManager,
      },
    })

    return mapClientDoc(client.id, client as unknown as StoredClient)
  }
)

export const PATCH = createApiHandler(
  {
    workspace: 'required',
    adminOnly: true,
    bodySchema: addTeamMemberSchema,
    rateLimit: 'sensitive',
  },
  async (req, { workspace, body }) => {
    if (!workspace) throw new Error('Workspace context missing')
    const { id, name, role } = body
    const clientRef = workspace.clientsCollection.doc(id)
    const snapshot = await clientRef.get()

    if (!snapshot.exists) {
      throw new NotFoundError('Client not found')
    }

    const existingMembers = coerceTeamMembers(snapshot.data()?.teamMembers)
    const normalizedName = name.trim()
    const normalizedRole = (role ?? '').trim() || 'Contributor'

    if (existingMembers.some((member) => member.name.toLowerCase() === normalizedName.toLowerCase())) {
      throw new ConflictError('Team member already exists for this client')
    }

    const updatedMembers = [...existingMembers, { name: normalizedName, role: normalizedRole }]

    await clientRef.update({
      teamMembers: updatedMembers,
      updatedAt: FieldValue.serverTimestamp(),
    })

    return { teamMembers: updatedMembers }
  }
)

