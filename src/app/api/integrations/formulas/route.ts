import { FieldValue } from 'firebase-admin/firestore'
import { z } from 'zod'

import { createApiHandler } from '@/lib/api-handler'
import { NotFoundError, UnauthorizedError } from '@/lib/api-errors'
import { adminDb } from '@/lib/firebase-admin'
import type { WorkspaceContext } from '@/lib/workspace'
import { coerceBoolean, sanitizeInput, toISO } from '@/lib/utils'

// =============================================================================
// TYPES
// =============================================================================

export type CustomFormulaApiRecord = {
  workspaceId: string
  formulaId: string
  name: string
  description?: string | null
  formula: string
  inputs: string[]
  outputMetric: string
  isActive: boolean
  createdBy: string
  createdAt: string | null
  updatedAt: string | null
}

export type CustomFormulasListResponse = {
  formulas: CustomFormulaApiRecord[]
  count: number
}

// =============================================================================
// SCHEMAS
// =============================================================================

const listQuerySchema = z
  .object({
    workspaceId: z.string().trim().min(1),
    activeOnly: z.string().optional(),
  })
  .strict()

const createSchema = z
  .object({
    workspaceId: z.string().trim().min(1),
    name: z.string().trim().min(1).max(200),
    description: z.string().trim().max(2000).optional(),
    formula: z.string().trim().min(1).max(2000),
    inputs: z.array(z.string().trim().min(1).max(60)).min(1).max(50),
    outputMetric: z.string().trim().min(1).max(60),
  })
  .strict()

// =============================================================================
// HELPERS
// =============================================================================

function generateFormulaId(): string {
  return `formula_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

async function ensureClientExists(workspace: WorkspaceContext, clientId: string) {
  const clientDoc = await workspace.clientsCollection.doc(clientId).get()
  if (!clientDoc.exists) {
    throw new NotFoundError('Client not found for this workspace')
  }
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

function formulasCollectionForClient(clientId: string) {
  // NOTE: This mirrors the existing client-side storage path:
  // `workspaces/{clientId}/customFormulas/{formulaId}`.
  return adminDb.collection('workspaces').doc(clientId).collection('customFormulas')
}

// =============================================================================
// GET - List formulas
// =============================================================================

export const GET = createApiHandler(
  {
    workspace: 'required',
    querySchema: listQuerySchema,
    rateLimit: 'standard',
  },
  async (req, { auth, workspace, query }) => {
    if (!auth.uid) {
      throw new UnauthorizedError('Authentication required')
    }

    const clientId = query.workspaceId
    await ensureClientExists(workspace!, clientId)

    const activeOnly = coerceBoolean(query.activeOnly)

    let q: FirebaseFirestore.Query = formulasCollectionForClient(clientId)
    if (activeOnly) {
      q = q.where('isActive', '==', true)
    }

    const snapshot = await q.get()

    const formulas = snapshot.docs
      .map((doc) => mapFormulaDoc(doc.id, (doc.data() ?? {}) as Record<string, unknown>))
      .filter((formula) => Boolean(formula.formulaId) && Boolean(formula.name) && Boolean(formula.formula))

    return {
      formulas,
      count: formulas.length,
    } satisfies CustomFormulasListResponse
  }
)

// =============================================================================
// POST - Create formula
// =============================================================================

export const POST = createApiHandler(
  {
    workspace: 'required',
    bodySchema: createSchema,
    rateLimit: 'sensitive',
  },
  async (req, { auth, workspace, body }) => {
    if (!auth.uid) {
      throw new UnauthorizedError('Authentication required')
    }

    const clientId = body.workspaceId
    await ensureClientExists(workspace!, clientId)

    const formulaId = generateFormulaId()
    const ref = formulasCollectionForClient(clientId).doc(formulaId)

    const record: Record<string, unknown> = {
      workspaceId: clientId,
      formulaId,
      name: sanitizeInput(body.name),
      description: body.description ? sanitizeInput(body.description) : null,
      formula: sanitizeInput(body.formula),
      inputs: body.inputs.map((value) => sanitizeInput(value)),
      outputMetric: sanitizeInput(body.outputMetric),
      isActive: true,
      createdBy: auth.uid,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    }

    await ref.set(record, { merge: false })

    const snapshot = await ref.get()
    const mapped = mapFormulaDoc(snapshot.id, (snapshot.data() ?? {}) as Record<string, unknown>)

    return mapped
  }
)
