import { FieldValue } from 'firebase-admin/firestore'
import { z } from 'zod'
import { createApiHandler } from '@/lib/api-handler'
import { NotFoundError, ValidationError } from '@/lib/api-errors'
import { proposalDraftUpdateSchema, sanitizeProposalUpdate } from '@/lib/proposals'

export const PATCH = createApiHandler(
  {
    workspace: 'required',
    bodySchema: proposalDraftUpdateSchema,
    rateLimit: 'sensitive',
  },
  async (req, { workspace, body, params }) => {
    if (!workspace) throw new Error('Workspace context missing')
    const proposalId = params.id as string

    if (!proposalId) {
      throw new ValidationError('Proposal id required')
    }

    const proposalRef = workspace.proposalsCollection.doc(proposalId)
    const snapshot = await proposalRef.get()
    if (!snapshot.exists) {
      throw new NotFoundError('Proposal not found')
    }

    await proposalRef.update(sanitizeProposalUpdate(body, FieldValue.serverTimestamp()))

    return { ok: true }
  }
)

export const DELETE = createApiHandler(
  {
    workspace: 'required',
    rateLimit: 'sensitive',
  },
  async (req, { workspace, params }) => {
    if (!workspace) throw new Error('Workspace context missing')
    const proposalId = params.id as string

    if (!proposalId) {
      throw new ValidationError('Proposal id required')
    }

    const proposalRef = workspace.proposalsCollection.doc(proposalId)
    const snapshot = await proposalRef.get()

    if (!snapshot.exists) {
      throw new NotFoundError('Proposal not found')
    }

    await proposalRef.delete()

    return { ok: true }
  }
)
