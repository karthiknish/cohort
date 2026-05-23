/**
 * Batch backfill for meeting notes/transcripts and proposal decks in R2.
 *
 * Schedules existing archive actions; safe to re-run (archives skip when storage ids exist).
 *
 * Loop until `done: true`:
 *
 *   let cursor = null
 *   do {
 *     const res = await convex.mutation(
 *       internal.artifactArchiveBackfills.backfillMeetingArchivesInternal,
 *       { workspaceId: 'ws_…', cursor },
 *     )
 *     cursor = res.nextCursor
 *   } while (!res.done)
 *
 *   npx convex run artifactArchiveBackfills:backfillMeetingArchivesInternal \
 *     '{"workspaceId":"YOUR_WORKSPACE_ID"}' --prod
 */

import { v } from 'convex/values'

import { internalMutation, type MutationCtx } from './_generated/server'
import { adminMutation } from './functions'
import {
  MIN_TRANSCRIPT_CHARS,
  scheduleMeetingNotesArchive,
  scheduleMeetingTranscriptArchive,
  scheduleProposalDeckArchive,
} from './lib/artifactArchiveSchedule'

const MIN_BATCH = 1
const MAX_BATCH = 100
const DEFAULT_BATCH = 25
function clampBatchSize(batchSize: number | undefined): number {
  const size = batchSize ?? DEFAULT_BATCH
  return Math.min(Math.max(size, MIN_BATCH), MAX_BATCH)
}

type BackfillMeetingResult = {
  scheduled: number
  scanned: number
  done: boolean
  nextCursor: string | null
}

async function backfillMeetingArchivesBatch(
  ctx: MutationCtx,
  args: { workspaceId: string; cursor?: string | null; batchSize?: number },
): Promise<BackfillMeetingResult> {
  const batchSize = clampBatchSize(args.batchSize)
  const page = await ctx.db
    .query('meetings')
    .withIndex('by_workspace_startTimeMs', (q) => q.eq('workspaceId', args.workspaceId))
    .paginate({ numItems: batchSize, cursor: args.cursor ?? null })

  let scheduled = 0

  const scheduleCounts = await Promise.all(
    page.page.map(async (meeting) => {
      const tasks: Promise<unknown>[] = []
      let meetingScheduled = 0

      const notes = meeting.notesSummary?.trim()
      if (notes && !meeting.notesStorageId) {
        tasks.push(
          scheduleMeetingNotesArchive(ctx, {
            workspaceId: args.workspaceId,
            legacyId: meeting.legacyId,
          }),
        )
        meetingScheduled += 1
      }

      const transcript = meeting.transcriptText?.trim()
      if (transcript && transcript.length >= MIN_TRANSCRIPT_CHARS && !meeting.transcriptStorageId) {
        tasks.push(
          scheduleMeetingTranscriptArchive(
            ctx,
            { workspaceId: args.workspaceId, legacyId: meeting.legacyId },
            transcript,
          ),
        )
        meetingScheduled += 1
      }

      if (tasks.length > 0) {
        await Promise.all(tasks)
      }

      return meetingScheduled
    }),
  )
  scheduled = scheduleCounts.reduce<number>((total, count) => total + Number(count ?? 0), 0)

  return {
    scheduled,
    scanned: page.page.length,
    done: page.isDone,
    nextCursor: page.isDone ? null : page.continueCursor,
  }
}

type BackfillProposalResult = {
  scheduled: number
  scanned: number
  done: boolean
  nextCursor: string | null
}

async function backfillProposalArchivesBatch(
  ctx: MutationCtx,
  args: { workspaceId: string; cursor?: string | null; batchSize?: number },
): Promise<BackfillProposalResult> {
  const batchSize = clampBatchSize(args.batchSize)
  const page = await ctx.db
    .query('proposals')
    .withIndex('by_workspace_updatedAtMs_legacyId', (q) => q.eq('workspaceId', args.workspaceId))
    .paginate({ numItems: batchSize, cursor: args.cursor ?? null })

  let scheduled = 0

  const scheduleCounts = await Promise.all(
    page.page.map(async (proposal) => {
      const needsPdf = !proposal.pdfStorageId && Boolean(proposal.pdfUrl?.trim())
      const needsPpt = !proposal.pptStorageId && Boolean(proposal.pptUrl?.trim())
      if (!needsPdf && !needsPpt) {
        return 0
      }

      await scheduleProposalDeckArchive(ctx, {
        workspaceId: args.workspaceId,
        legacyId: proposal.legacyId,
        pdfUrl: proposal.pdfUrl,
        pptxUrl: proposal.pptUrl,
      })

      return 1
    }),
  )
  scheduled = scheduleCounts.reduce<number>((total, count) => total + Number(count ?? 0), 0)

  return {
    scheduled,
    scanned: page.page.length,
    done: page.isDone,
    nextCursor: page.isDone ? null : page.continueCursor,
  }
}

const meetingBackfillReturns = v.object({
  scheduled: v.number(),
  scanned: v.number(),
  done: v.boolean(),
  nextCursor: v.union(v.string(), v.null()),
})

const proposalBackfillReturns = meetingBackfillReturns

const backfillArgs = {
  workspaceId: v.string(),
  batchSize: v.optional(v.number()),
  cursor: v.optional(v.union(v.string(), v.null())),
}

export const backfillMeetingArchives = adminMutation({
  args: backfillArgs,
  returns: meetingBackfillReturns,
  handler: async (ctx, args) => backfillMeetingArchivesBatch(ctx, args),
})

export const backfillMeetingArchivesInternal = internalMutation({
  args: backfillArgs,
  returns: meetingBackfillReturns,
  handler: async (ctx, args) => backfillMeetingArchivesBatch(ctx, args),
})

export const backfillProposalArchives = adminMutation({
  args: backfillArgs,
  returns: proposalBackfillReturns,
  handler: async (ctx, args) => backfillProposalArchivesBatch(ctx, args),
})

export const backfillProposalArchivesInternal = internalMutation({
  args: backfillArgs,
  returns: proposalBackfillReturns,
  handler: async (ctx, args) => backfillProposalArchivesBatch(ctx, args),
})
