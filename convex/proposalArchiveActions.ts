'use node'

import { R2 } from '@convex-dev/r2'
import { v } from 'convex/values'

import { slugifyProposalLabel } from '@/lib/slugify'
import { downloadGammaPresentation } from '@/services/gamma-utils'

import { components, internal } from './_generated/api'
import { internalAction } from './_generated/server'
import { storeR2Artifact } from './lib/r2ArtifactStore'

const r2 = new R2(components.r2)

function buildPdfObjectKey(workspaceId: string, legacyId: string): string {
  return `workspaces/${workspaceId}/proposals/${legacyId}/deck.pdf`
}

function buildPptObjectKey(workspaceId: string, legacyId: string): string {
  return `workspaces/${workspaceId}/proposals/${legacyId}/deck.pptx`
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer
}

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

    const label = slugifyProposalLabel(proposal.clientName ?? proposal.legacyId)
    const patch: {
      pdfStorageId?: string
      pptStorageId?: string
    } = {}

    const pdfSourceUrl = args.pdfUrl?.trim() || proposal.pdfUrl?.trim() || null
    if (pdfSourceUrl && !proposal.pdfStorageId) {
      try {
        const pdfBytes = await downloadGammaPresentation(pdfSourceUrl)
        patch.pdfStorageId = await storeR2Artifact({
          r2,
          ctx,
          key: buildPdfObjectKey(args.workspaceId, args.legacyId),
          body: toArrayBuffer(pdfBytes),
          contentType: 'application/pdf',
          downloadFilename: `${label}-proposal.pdf`,
        })
      } catch (error) {
        console.warn('[ProposalArchive] PDF upload failed', error)
      }
    }

    const pptSourceUrl = args.pptUrl?.trim() || proposal.pptUrl?.trim() || null
    if (pptSourceUrl && !proposal.pptStorageId) {
      try {
        const pptBytes = await downloadGammaPresentation(pptSourceUrl)
        patch.pptStorageId = await storeR2Artifact({
          r2,
          ctx,
          key: buildPptObjectKey(args.workspaceId, args.legacyId),
          body: toArrayBuffer(pptBytes),
          contentType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
          downloadFilename: `${label}-proposal.pptx`,
        })
      } catch (error) {
        console.warn('[ProposalArchive] PPTX upload failed', error)
      }
    }

    if (!patch.pdfStorageId && !patch.pptStorageId) {
      return
    }

    await ctx.runMutation(internal.proposalArchives.patchArtifactStorage, {
      workspaceId: args.workspaceId,
      legacyId: args.legacyId,
      pdfStorageId: patch.pdfStorageId,
      pptStorageId: patch.pptStorageId,
    })
  },
})
