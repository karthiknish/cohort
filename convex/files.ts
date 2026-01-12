import { v } from 'convex/values'
import { mutation, query } from './_generated/server'
import type { Id } from './_generated/dataModel'
import { authenticatedMutation, authenticatedQuery } from './functions'

export const generateUploadUrl = authenticatedMutation({
  args: {},
  handler: async (ctx) => {
    const url = await ctx.storage.generateUploadUrl()
    return { url }
  },
})

export const getDownloadUrl = authenticatedQuery({
  args: {
    storageId: v.string(),
  },
  handler: async (ctx, args) => {
    const url = await ctx.storage.getUrl(args.storageId as Id<'_storage'>)
    return { url: url ?? null }
  },
})

export const getPublicUrl = authenticatedQuery({
  args: {
    storageId: v.string(),
  },
  handler: async (ctx, args) => {
    const url = await ctx.storage.getUrl(args.storageId as Id<'_storage'>)
    return { url: url ?? null }
  },
})

export const getProposalFileDownloadUrl = authenticatedQuery({
  args: {
    workspaceId: v.string(),
    proposalId: v.string(),
    fileType: v.union(v.literal('pptx'), v.literal('pdf')),
  },
  handler: async (ctx, args) => {
    const proposal = await ctx.db
      .query('proposals')
      .withIndex('by_workspace_legacyId', (q) => q.eq('workspaceId', args.workspaceId).eq('legacyId', args.proposalId))
      .unique()

    if (!proposal) {
      return { ok: false as const, error: 'not_found' as const }
    }

    const storageId = args.fileType === 'pdf' ? proposal.pdfStorageId : proposal.pptStorageId

    if (typeof storageId !== 'string' || storageId.length === 0) {
      return { ok: false as const, error: 'not_found' as const }
    }

    const url = await ctx.storage.getUrl(storageId as Id<'_storage'>)
    if (!url) {
      return { ok: false as const, error: 'not_found' as const }
    }

    const filename = args.fileType === 'pdf' ? 'proposal.pdf' : 'proposal.pptx'
    const contentType =
      args.fileType === 'pdf'
        ? 'application/pdf'
        : 'application/vnd.openxmlformats-officedocument.presentationml.presentation'

    return { ok: true as const, url, filename, contentType }
  },
})

export const getCollaborationAttachmentDownloadUrl = authenticatedQuery({
  args: {
    workspaceId: v.string(),
    messageId: v.string(),
    attachmentIndex: v.number(),
  },
  handler: async (ctx, args) => {
    const message = await ctx.db
      .query('collaborationMessages')
      .withIndex('by_workspace_legacyId', (q) => q.eq('workspaceId', args.workspaceId).eq('legacyId', args.messageId))
      .unique()

    if (!message) {
      return { ok: false as const, error: 'not_found' as const }
    }

    const attachments = Array.isArray(message.attachments) ? message.attachments : []
    const idx = Math.trunc(args.attachmentIndex)

    if (idx < 0 || idx >= attachments.length) {
      return { ok: false as const, error: 'not_found' as const }
    }

    const attachment = attachments[idx]
    const storageId = attachment?.storageId

    if (typeof storageId !== 'string' || storageId.length === 0) {
      return { ok: false as const, error: 'not_found' as const }
    }

    const url = await ctx.storage.getUrl(storageId as Id<'_storage'>)
    if (!url) {
      return { ok: false as const, error: 'not_found' as const }
    }

    return {
      ok: true as const,
      url,
      filename: typeof attachment?.name === 'string' ? attachment.name : null,
      contentType: typeof attachment?.type === 'string' ? attachment.type : null,
    }
  },
})
