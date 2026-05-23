import { v } from 'convex/values'
import { z } from 'zod/v4'

import { Errors } from './errors'
import { zWorkspaceQuery } from './functions'
import { internalMutation, internalQuery } from './_generated/server'
import { resolveStoredObjectUrl } from './lib/fileStorage'

export const getProposalForArchive = internalQuery({
  args: {
    workspaceId: v.string(),
    legacyId: v.string(),
  },
  handler: async (ctx, args) => {
    const proposal = await ctx.db
      .query('proposals')
      .withIndex('by_workspace_legacyId', (q) => q.eq('workspaceId', args.workspaceId).eq('legacyId', args.legacyId))
      .unique()

    if (!proposal) {
      return null
    }

    return {
      legacyId: proposal.legacyId,
      clientName: proposal.clientName,
      pdfUrl: proposal.pdfUrl,
      pptUrl: proposal.pptUrl,
      pdfStorageId: proposal.pdfStorageId ?? null,
      pptStorageId: proposal.pptStorageId ?? null,
    }
  },
})

export const patchArtifactStorage = internalMutation({
  args: {
    workspaceId: v.string(),
    legacyId: v.string(),
    pdfStorageId: v.optional(v.union(v.string(), v.null())),
    pptStorageId: v.optional(v.union(v.string(), v.null())),
  },
  handler: async (ctx, args) => {
    const proposal = await ctx.db
      .query('proposals')
      .withIndex('by_workspace_legacyId', (q) => q.eq('workspaceId', args.workspaceId).eq('legacyId', args.legacyId))
      .unique()

    if (!proposal) {
      throw Errors.resource.notFound('Proposal', args.legacyId)
    }

    const patch: {
      pdfStorageId?: string | null
      pptStorageId?: string | null
      updatedAtMs: number
    } = {
      updatedAtMs: Date.now(),
    }

    if (args.pdfStorageId !== undefined) {
      patch.pdfStorageId = args.pdfStorageId
    }

    if (args.pptStorageId !== undefined) {
      patch.pptStorageId = args.pptStorageId
    }

    await ctx.db.patch(proposal._id, patch)
  },
})

export const getArtifactDownloadUrls = zWorkspaceQuery({
  args: {
    workspaceId: z.string(),
    legacyId: z.string(),
  },
  returns: z.object({
    pdfDownloadUrl: z.string().nullable(),
    pptDownloadUrl: z.string().nullable(),
    pdfArchived: z.boolean(),
    pptArchived: z.boolean(),
  }),
  handler: async (ctx, args) => {
    const proposal = await ctx.db
      .query('proposals')
      .withIndex('by_workspace_legacyId', (q) => q.eq('workspaceId', args.workspaceId).eq('legacyId', args.legacyId))
      .unique()

    if (!proposal) {
      throw Errors.resource.notFound('Proposal', args.legacyId)
    }

    const pdfDownloadUrl = proposal.pdfStorageId
      ? await resolveStoredObjectUrl(ctx, proposal.pdfStorageId, { expiresIn: 60 * 60 })
      : null

    const pptDownloadUrl = proposal.pptStorageId
      ? await resolveStoredObjectUrl(ctx, proposal.pptStorageId, { expiresIn: 60 * 60 })
      : null

    return {
      pdfDownloadUrl,
      pptDownloadUrl,
      pdfArchived: Boolean(proposal.pdfStorageId),
      pptArchived: Boolean(proposal.pptStorageId),
    }
  },
})
