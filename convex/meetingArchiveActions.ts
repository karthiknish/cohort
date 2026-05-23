'use node'

import { R2 } from '@convex-dev/r2'
import { v } from 'convex/values'

import { buildMeetingNotesPdfArrayBuffer } from '@/lib/meeting-notes-pdf'
import { slugifyMeetingTitle } from '@/lib/slugify'

import { components, internal } from './_generated/api'
import { internalAction } from './_generated/server'
import { storeR2Artifact } from './lib/r2ArtifactStore'

const r2 = new R2(components.r2)

const MIN_TRANSCRIPT_CHARS = 20

function buildNotesObjectKey(workspaceId: string, legacyId: string): string {
  return `workspaces/${workspaceId}/meetings/${legacyId}/notes.pdf`
}

function buildTranscriptObjectKey(workspaceId: string, legacyId: string): string {
  return `workspaces/${workspaceId}/meetings/${legacyId}/transcript.md`
}

export const archiveNotes = internalAction({
  args: {
    workspaceId: v.string(),
    legacyId: v.string(),
  },
  handler: async (ctx, args) => {
    const meeting = await ctx.runQuery(internal.meetingArchives.getMeetingForArchive, args)
    const summary = meeting?.notesSummary?.trim()
    if (!meeting || !summary) {
      return
    }

    const slug = slugifyMeetingTitle(meeting.title)
    const key = buildNotesObjectKey(args.workspaceId, args.legacyId)
    const pdfBuffer = buildMeetingNotesPdfArrayBuffer({
      meetingTitle: meeting.title,
      content: summary,
    })

    const notesStorageId = await storeR2Artifact({
      r2,
      ctx,
      key,
      body: pdfBuffer,
      contentType: 'application/pdf',
      downloadFilename: `${slug}-notes.pdf`,
    })

    await ctx.runMutation(internal.meetingArchives.patchArtifactStorage, {
      workspaceId: args.workspaceId,
      legacyId: args.legacyId,
      notesStorageId,
    })
  },
})

export const archiveTranscript = internalAction({
  args: {
    workspaceId: v.string(),
    legacyId: v.string(),
  },
  handler: async (ctx, args) => {
    const meeting = await ctx.runQuery(internal.meetingArchives.getMeetingForArchive, args)
    const transcript = meeting?.transcriptText?.trim()
    if (!meeting || !transcript || transcript.length < MIN_TRANSCRIPT_CHARS) {
      return
    }

    const slug = slugifyMeetingTitle(meeting.title)
    const key = buildTranscriptObjectKey(args.workspaceId, args.legacyId)

    const transcriptStorageId = await storeR2Artifact({
      r2,
      ctx,
      key,
      body: new Blob([transcript], { type: 'text/markdown; charset=utf-8' }),
      contentType: 'text/markdown; charset=utf-8',
      downloadFilename: `${slug}-transcript.md`,
    })

    await ctx.runMutation(internal.meetingArchives.patchArtifactStorage, {
      workspaceId: args.workspaceId,
      legacyId: args.legacyId,
      transcriptStorageId,
    })
  },
})
