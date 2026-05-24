import { v } from 'convex/values'
import { z } from 'zod/v4'

import { Errors } from '../../errors'
import { zWorkspaceQuery } from '../../functions'
import { internalMutation, internalQuery } from '../../_generated/server'
import { resolveStoredObjectUrl } from '../../lib/fileStorage'

export const getMeetingForArchive = internalQuery({
  args: {
    workspaceId: v.string(),
    legacyId: v.string(),
  },
  handler: async (ctx, args) => {
    const meeting = await ctx.db
      .query('meetings')
      .withIndex('by_workspace_legacyId', (q) => q.eq('workspaceId', args.workspaceId).eq('legacyId', args.legacyId))
      .unique()

    if (!meeting) {
      return null
    }

    return {
      legacyId: meeting.legacyId,
      title: meeting.title,
      notesSummary: meeting.notesSummary,
      transcriptText: meeting.transcriptText,
      notesStorageId: meeting.notesStorageId ?? null,
      transcriptStorageId: meeting.transcriptStorageId ?? null,
    }
  },
})

export const patchArtifactStorage = internalMutation({
  args: {
    workspaceId: v.string(),
    legacyId: v.string(),
    notesStorageId: v.optional(v.union(v.string(), v.null())),
    transcriptStorageId: v.optional(v.union(v.string(), v.null())),
  },
  handler: async (ctx, args) => {
    const meeting = await ctx.db
      .query('meetings')
      .withIndex('by_workspace_legacyId', (q) => q.eq('workspaceId', args.workspaceId).eq('legacyId', args.legacyId))
      .unique()

    if (!meeting) {
      throw Errors.resource.notFound('Meeting', args.legacyId)
    }

    const patch: {
      notesStorageId?: string | null
      transcriptStorageId?: string | null
      updatedAtMs: number
    } = {
      updatedAtMs: Date.now(),
    }

    if (args.notesStorageId !== undefined) {
      patch.notesStorageId = args.notesStorageId
    }

    if (args.transcriptStorageId !== undefined) {
      patch.transcriptStorageId = args.transcriptStorageId
    }

    await ctx.db.patch(meeting._id, patch)
  },
})

export const getArtifactDownloadUrls = zWorkspaceQuery({
  args: {
    workspaceId: z.string(),
    legacyId: z.string(),
  },
  returns: z.object({
    notesDownloadUrl: z.string().nullable(),
    transcriptDownloadUrl: z.string().nullable(),
    notesArchived: z.boolean(),
    transcriptArchived: z.boolean(),
  }),
  handler: async (ctx, args) => {
    const meeting = await ctx.db
      .query('meetings')
      .withIndex('by_workspace_legacyId', (q) => q.eq('workspaceId', args.workspaceId).eq('legacyId', args.legacyId))
      .unique()

    if (!meeting) {
      throw Errors.resource.notFound('Meeting', args.legacyId)
    }

    const notesDownloadUrl = meeting.notesStorageId
      ? await resolveStoredObjectUrl(ctx, meeting.notesStorageId, { expiresIn: 60 * 60 })
      : null

    const transcriptDownloadUrl = meeting.transcriptStorageId
      ? await resolveStoredObjectUrl(ctx, meeting.transcriptStorageId, { expiresIn: 60 * 60 })
      : null

    return {
      notesDownloadUrl,
      transcriptDownloadUrl,
      notesArchived: Boolean(meeting.notesStorageId),
      transcriptArchived: Boolean(meeting.transcriptStorageId),
    }
  },
})
