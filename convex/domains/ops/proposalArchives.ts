import { v } from 'convex/values'
import { z } from 'zod/v4'

import { Errors } from '../../errors'
import { zWorkspaceQuery, zWorkspaceAction } from '../../functions'
import { internalMutation, internalQuery } from '../../_generated/server'
import { resolveStoredObjectUrl, asR2ObjectRef, toR2ObjectKey, isR2ObjectRef } from '../../lib/fileStorage'
import { r2 } from '../../r2'

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

    // If pptStorageId is missing, try to extract the R2 key from the
    // presentationDeck storage URL (backfill for older proposals).
    let pptStorageId = proposal.pptStorageId ?? null
    if (!pptStorageId && proposal.presentationDeck) {
      const deck = proposal.presentationDeck as Record<string, unknown> | null
      const storageUrl = deck?.storageUrl ?? deck?.pptxUrl
      if (typeof storageUrl === 'string') {
        // R2 URLs look like: https://<account>.r2.cloudflarestorage.com/<bucket>/<key>?X-Amz-...
        try {
          const parsed = new URL(storageUrl)
          // Path after the first slash is the object key (bucket/key)
          const pathAfterHost = parsed.pathname.replace(/^\/+/, '')
          // The key includes the workspace/proposals/<id>/deck.pptx path
          if (pathAfterHost.includes('proposals/')) {
            pptStorageId = asR2ObjectRef(pathAfterHost)
          }
        } catch {
          // Not a valid URL — skip
        }
      }
    }

    const pptDownloadUrl = pptStorageId
      ? await resolveStoredObjectUrl(ctx, pptStorageId, { expiresIn: 60 * 60 })
      : null

    return {
      pdfDownloadUrl,
      pptDownloadUrl,
      pdfArchived: Boolean(pptStorageId),
      pptArchived: Boolean(pptStorageId),
    }
  },
})

/**
 * Generate a fresh signed URL for an R2 object given its storage URL.
 * The client calls this when the original signed URL has expired.
 *
 * Extracts the R2 object key from the URL path and generates a new signed URL
 * with a 1-hour expiry. Works across deployments because R2 credentials are
 * shared via Convex environment variables.
 */
export const refreshSignedUrl = zWorkspaceAction({
  args: {
    url: z.string(),
  },
  returns: z.string().nullable(),
  handler: async (_ctx, args) => {
    try {
      const parsed = new URL(args.url)
      const pathAfterHost = parsed.pathname.replace(/^\/+/, '')

      if (!pathAfterHost) return null

      const freshUrl = await r2.getUrl(pathAfterHost, { expiresIn: 60 * 60 })
      return freshUrl
    } catch {
      return null
    }
  },
})
