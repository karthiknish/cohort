import { internal } from '../_generated/api'
import type { ActionCtx, MutationCtx } from '../_generated/server'

type SchedulerCtx = Pick<MutationCtx, 'scheduler'> | Pick<ActionCtx, 'scheduler'>

export const MIN_TRANSCRIPT_CHARS = 20

export function scheduleMeetingNotesArchive(
  ctx: SchedulerCtx,
  args: { workspaceId: string; legacyId: string },
) {
  return ctx.scheduler.runAfter(0, internal.meetingArchiveActions.archiveNotes, args)
}

export function scheduleMeetingTranscriptArchive(
  ctx: SchedulerCtx,
  args: { workspaceId: string; legacyId: string },
  transcriptText: string,
) {
  if (transcriptText.trim().length < MIN_TRANSCRIPT_CHARS) {
    return Promise.resolve()
  }

  return ctx.scheduler.runAfter(0, internal.meetingArchiveActions.archiveTranscript, args)
}

function proposalDeckArchiveArgs(args: {
  workspaceId: string
  legacyId: string
  pptxUrl: string | null
  pdfUrl: string | null
}) {
  return {
    workspaceId: args.workspaceId,
    legacyId: args.legacyId,
    pptUrl: args.pptxUrl,
    pdfUrl: args.pdfUrl,
  }
}

export function scheduleProposalDeckArchive(
  ctx: SchedulerCtx,
  args: {
    workspaceId: string
    legacyId: string
    pptxUrl: string | null
    pdfUrl: string | null
  },
) {
  if (!args.pptxUrl && !args.pdfUrl) {
    return Promise.resolve()
  }

  return ctx.scheduler.runAfter(
    0,
    internal.proposalArchiveActions.archiveDeckFiles,
    proposalDeckArchiveArgs(args),
  )
}

/** Archive deck files while storage URLs are still fresh (generation handler). */
export async function runProposalDeckArchive(
  ctx: Pick<ActionCtx, 'runAction'>,
  args: {
    workspaceId: string
    legacyId: string
    pptxUrl: string | null
    pdfUrl: string | null
  },
) {
  if (!args.pptxUrl && !args.pdfUrl) {
    return
  }

  await ctx.runAction(
    internal.proposalArchiveActions.archiveDeckFiles,
    proposalDeckArchiveArgs(args),
  )
}
