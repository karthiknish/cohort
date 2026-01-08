import { FieldValue } from 'firebase-admin/firestore'
import { z } from 'zod'

import { createApiHandler } from '@/lib/api-handler'
import { NotFoundError, UnauthorizedError } from '@/lib/api-errors'
import { adminDb } from '@/lib/firebase-admin'
import type { WorkspaceContext } from '@/lib/workspace'
import { sanitizeInput, toISO } from '@/lib/utils'

import type { CustomFormulaApiRecord } from '../route'

// =============================================================================
// SCHEMAS
// =============================================================================

const querySchema = z
  .object({
    workspaceId: z.string().trim().min(1),
  })
  .strict()

const patchSchema = z
  .object({
    workspaceId: z.string().trim().min(1),
    name: z.string().trim().min(1).max(200).optional(),
    description: z.string().trim().max(2000).optional().nullable(),
    formula: z.string().trim().min(1).max(2000).optional(),
    inputs: z.array(z.string().trim().min(1).max(60)).min(1).max(50).optional(),
    outputMetric: z.string().trim().min(1).max(60).optional(),
    isActive: z.boolean().optional(),
  })
  .strict()

// =============================================================================
// HELPERS
// =============================================================================

async function ensureClientExists(workspace: WorkspaceContext, clientId: string) {
  const clientDoc = await workspace.clientsCollection.doc(clientId).get()
  if (!clientDoc.exists) {
    throw new NotFoundError('Client not found for this workspace')
  }
}

function formulasCollectionForClient(clientId: string) {
  return adminDb.collection('workspaces').doc(clientId).collection('customFormulas')
}

function mapFormulaDoc(id: string, data: Record<string, unknown>): CustomFormulaApiRecord {
  return {
    workspaceId: typeof data.workspaceId === 'string' ? data.workspaceId : '',
    formulaId: id,
    name: typeof data.name === 'string' ? data.name : '',
    description: typeof data.description === 'string' ? data.description : null,
    formula: typeof data.formula === 'string' ? data.formula : '',
    inputs: Array.isArray(data.inputs) ? data.inputs.filter((v) => typeof v === 'string') : [],
    outputMetric: typeof data.outputMetric === 'string' ? data.outputMetric : '',
    isActive: typeof data.isActive === 'boolean' ? data.isActive : true,
    createdBy: typeof data.createdBy === 'string' ? data.createdBy : '',
    createdAt: toISO(data.createdAt),
    updatedAt: toISO(data.updatedAt),
  }
}

// =============================================================================
// PATCH - Update formula
// =============================================================================

export const PATCH = createApiHandler(
  {
    workspace: 'required',
    bodySchema: patchSchema,
    rateLimit: 'sensitive',
  },
  async (req, { auth, workspace, body, params }) => {
    if (!auth.uid) {
      throw new UnauthorizedError('Authentication required')
    }

    const formulaId = params.formulaId as string
    const clientId = body.workspaceId

    await ensureClientExists(workspace!, clientId)

    const ref = formulasCollectionForClient(clientId).doc(formulaId)
    const existing = await ref.get()
    if (!existing.exists) {
      throw new NotFoundError('Formula not found')
    }

    const updates: Record<string, unknown> = {
      updatedAt: FieldValue.serverTimestamp(),
    }

    if (body.name !== undefined) updates.name = sanitizeInput(body.name)
    if (body.description !== undefined) updates.description = body.description ? sanitizeInput(body.description) : null
    if (body.formula !== undefined) updates.formula = sanitizeInput(body.formula)
    if (body.inputs !== undefined) updates.inputs = body.inputs.map((value) => sanitizeInput(value))
    if (body.outputMetric !== undefined) updates.outputMetric = sanitizeInput(body.outputMetric)
    if (body.isActive !== undefined) updates.isActive = body.isActive

    await ref.update(updates)

    const snapshot = await ref.get()
    return mapFormulaDoc(snapshot.id, (snapshot.data() ?? {}) as Record<string, unknown>)
  }
)

// =============================================================================
// DELETE - Delete formula
// =============================================================================

export const DELETE = createApiHandler(
  {
    workspace: 'required',
    querySchema,
    rateLimit: 'sensitive',
  },
  async (req, { auth, workspace, query, params }) => {
    if (!auth.uid) {
      throw new UnauthorizedError('Authentication required')
    }

    const formulaId = params.formulaId as string
    const clientId = query.workspaceId

    await ensureClientExists(workspace!, clientId)

    const ref = formulasCollectionForClient(clientId).doc(formulaId)
    const existing = await ref.get()
    if (!existing.exists) {
      throw new NotFoundError('Formula not found')
    }

    await ref.delete()

    return { ok: true }
  }
)
