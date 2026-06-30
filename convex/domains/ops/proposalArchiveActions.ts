'use node'

import { v } from 'convex/values'

import { internal } from '../../_generated/api'
import { internalAction } from '../../_generated/server'

/**
 * Deck files are now stored directly in R2 during generation (pptxgenjs).
 * This action is kept for backward compatibility but is a no-op when the
 * PPTX is already archived.
 */
export const archiveDeckFiles = internalAction({
  args: {
    workspaceId: v.string(),
    legacyId: v.string(),
    pptUrl: v.union(v.string(), v.null()),
    pdfUrl: v.union(v.string(), v.null()),
  },
  handler: async (ctx, args) => {
    const proposal = await ctx.runQuery(internal.proposalArchives.getProposalForArchive, {
      workspaceId: args.workspaceId,
      legacyId: args.legacyId,
    })

    if (!proposal) {
      return
    }

    // With pptxgenjs, the PPTX is already stored in R2 during generation.
    // No download step is needed. PDF export is not supported.
    return
  },
})
