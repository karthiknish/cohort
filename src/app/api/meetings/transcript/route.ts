import { z } from 'zod'

import { createApiHandler } from '@/lib/api-handler'
import { BadRequestError, ForbiddenError, UnauthorizedError } from '@/lib/api-errors'
import {
  buildGeminiRateLimitKey,
  formatGeminiRateLimitMessage,
  GEMINI_RATE_LIMITS,
} from '@/lib/geminiRateLimits'
import { getMeetingRecord, saveMeetingNotes, saveMeetingTranscript, setMeetingProcessingState, updateMeetingRecord } from '@/lib/meetings-admin'
import { checkConvexRateLimit } from '@/lib/rate-limiter-convex'
import { GeminiAIService, resolveGeminiApiKey } from '@/services/gemini'

const transcriptModeValues = ['save-transcript', 'save-transcript-and-generate-notes', 'save-notes', 'finalize-post-meeting'] as const
const transcriptModeZ = z.enum(transcriptModeValues)

const saveTranscriptSchema = z.object({
  legacyId: z.string().min(1),
  transcriptText: z.string().optional(),
  notesSummary: z.string().optional(),
  source: z.string().optional(),
  markCompleted: z.boolean().optional(),
  mode: transcriptModeZ.optional(),
})

const MAX_TRANSCRIPT_CHARS_FOR_NOTES = 18_000

function normalizeTranscriptText(value: string): string {
  return value
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map((line) => line.trimEnd())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function normalizeNotesSummary(value: string): string {
  return value
    .replace(/\r\n?/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function buildTranscriptExcerptForNotes(transcriptText: string): { text: string; truncated: boolean } {
  if (transcriptText.length <= MAX_TRANSCRIPT_CHARS_FOR_NOTES) {
    return { text: transcriptText, truncated: false }
  }

  const leading = transcriptText.slice(0, 11_000).trim()
  const trailing = transcriptText.slice(-7_000).trim()

  return {
    text: `${leading}\n\n[... transcript truncated for note generation ...]\n\n${trailing}`,
    truncated: true,
  }
}

async function generateConciseMeetingNotes(transcriptText: string): Promise<{ summary: string; model: string; truncated: boolean } | null> {
  const apiKey = resolveGeminiApiKey()
  if (!apiKey) {
    return null
  }

  const gemini = new GeminiAIService(apiKey)
  const excerpt = buildTranscriptExcerptForNotes(transcriptText)
  const prompt = [
    'You are an expert meeting note taker.',
    'Read the transcript and return concise markdown meeting notes with exactly these headings:',
    '## Summary',
    '## Decisions',
    '## Action Items',
    '## Risks / Blockers',
    'Under each heading, use short bullet points only.',
    'Keep the output under 260 words, factual, and avoid speculation.',
    'If a section has no clear content, write a single bullet with "None noted."',
    excerpt.truncated ? 'The transcript may be truncated. Prefer the most concrete decisions and actions that appear in the provided text.' : '',
    '',
    'Transcript:',
    excerpt.text,
  ].join('\n')

  const summary = await gemini.generateContent(prompt)
  const model = gemini.getModel()

  return {
    summary: normalizeNotesSummary(summary),
    model,
    truncated: excerpt.truncated,
  }
}

export const POST = createApiHandler(
  {
    workspace: 'required',
    bodySchema: saveTranscriptSchema,
    rateLimit: 'sensitive',
  },
  async (_req, { auth, workspace, body }) => {
    if (!auth.uid) {
      throw new UnauthorizedError('Authentication required')
    }

    const role = typeof auth.claims?.role === 'string' ? auth.claims.role : null
    if (role !== 'admin' && role !== 'team') {
      throw new ForbiddenError('Client users cannot save meeting transcripts')
    }

    if (!workspace?.workspaceId) {
      throw new BadRequestError('Workspace context is required for transcript processing')
    }

    const mode = body.mode ?? 'save-transcript-and-generate-notes'
    const shouldFinalizeAfterMeeting = mode === 'finalize-post-meeting'
    const shouldSaveTranscript =
      mode === 'save-transcript' || mode === 'save-transcript-and-generate-notes' || shouldFinalizeAfterMeeting
    const shouldGenerateNotes = mode === 'save-transcript-and-generate-notes' || shouldFinalizeAfterMeeting
    const meetingRecord = await getMeetingRecord({
      userId: auth.uid,
      legacyId: body.legacyId,
      workspaceId: workspace.workspaceId,
      userEmail: auth.email,
    })

    const currentMeeting = meetingRecord.meeting
    const incomingTranscript = typeof body.transcriptText === 'string' ? normalizeTranscriptText(body.transcriptText) : ''
    const incomingNotes = typeof body.notesSummary === 'string' ? normalizeNotesSummary(body.notesSummary) : ''

    const effectiveTranscript = incomingTranscript || normalizeTranscriptText(currentMeeting.transcriptText ?? '')
    let transcriptSaved = false
    let notesGenerated = false
    let notesSaved = false
    let summary: string | null = currentMeeting.notesSummary
    let model: string | null = currentMeeting.notesModel
    let notesReason: 'ai_not_configured' | 'generation_failed' | null = null
    let transcriptTruncatedForNotes = false

    if (shouldFinalizeAfterMeeting) {
      await setMeetingProcessingState({
        userId: auth.uid,
        workspaceId: workspace.workspaceId,
        legacyId: body.legacyId,
        userEmail: auth.email,
        status: 'completed',
        transcriptProcessingState: effectiveTranscript.length >= 20 ? 'processing' : 'idle',
        transcriptProcessingError: null,
        notesProcessingState: effectiveTranscript.length >= 20 ? 'processing' : 'idle',
        notesProcessingError: null,
      })
    } else if (shouldGenerateNotes && effectiveTranscript.length >= 20) {
      await setMeetingProcessingState({
        userId: auth.uid,
        workspaceId: workspace.workspaceId,
        legacyId: body.legacyId,
        userEmail: auth.email,
        transcriptProcessingState: shouldSaveTranscript ? 'processing' : currentMeeting.transcriptProcessingState ?? 'idle',
        transcriptProcessingError: null,
        notesProcessingState: 'processing',
        notesProcessingError: null,
      })
    }

    if (shouldSaveTranscript) {
      if (effectiveTranscript.length < 20 && !shouldFinalizeAfterMeeting) {
        throw new BadRequestError('Transcript is too short. Record at least a few sentences before saving.')
      }

      if (effectiveTranscript.length >= 20) {
        try {
          await saveMeetingTranscript({
            userId: auth.uid,
            workspaceId: workspace.workspaceId,
            meetingLegacyId: body.legacyId,
            transcriptText: effectiveTranscript,
            source: body.source ?? currentMeeting.transcriptSource ?? 'in-site-voice',
            status: body.markCompleted || shouldFinalizeAfterMeeting ? 'completed' : 'in_progress',
            eventType: shouldFinalizeAfterMeeting ? 'transcript.finalized' : 'transcript.manual',
            rawPayload: {
              mode,
              meetingLegacyId: body.legacyId,
            },
          })

          transcriptSaved = true
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Transcript finalization failed'

          await setMeetingProcessingState({
            userId: auth.uid,
            workspaceId: workspace.workspaceId,
            legacyId: body.legacyId,
            userEmail: auth.email,
            status: body.markCompleted || shouldFinalizeAfterMeeting ? 'completed' : undefined,
            transcriptProcessingState: 'failed',
            transcriptProcessingError: message,
            notesProcessingState: shouldGenerateNotes ? 'failed' : undefined,
            notesProcessingError: shouldGenerateNotes ? 'Transcript could not be finalized, so notes were not generated.' : undefined,
          })

          throw error
        }
      } else if (shouldFinalizeAfterMeeting && currentMeeting.status !== 'completed') {
        await updateMeetingRecord({
          userId: auth.uid,
          userEmail: auth.email,
          workspaceId: workspace.workspaceId,
          legacyId: body.legacyId,
          status: 'completed',
        })
      }
    }

    if (shouldGenerateNotes && effectiveTranscript.length >= 20) {
      try {
        const rateLimit = await checkConvexRateLimit(
          buildGeminiRateLimitKey({
            name: 'meetingNotes',
            userId: auth.uid,
            workspaceId: workspace.workspaceId,
            resourceId: body.legacyId,
            scope: mode,
          }),
          GEMINI_RATE_LIMITS.meetingNotes,
        )

        if (!rateLimit.allowed) {
          throw new Error(formatGeminiRateLimitMessage(rateLimit.resetMs))
        }

        const notes = await generateConciseMeetingNotes(effectiveTranscript)
        if (notes) {
          await saveMeetingNotes({
            userId: auth.uid,
            workspaceId: workspace.workspaceId,
            legacyId: body.legacyId,
            summary: notes.summary,
            model: notes.model,
            eventType: 'notes.generated',
          })

          notesGenerated = true
          notesSaved = true
          summary = notes.summary
          model = notes.model
          transcriptTruncatedForNotes = notes.truncated
        } else {
          notesReason = 'ai_not_configured'

          await setMeetingProcessingState({
            userId: auth.uid,
            workspaceId: workspace.workspaceId,
            legacyId: body.legacyId,
            userEmail: auth.email,
            notesProcessingState: 'failed',
            notesProcessingError: 'AI notes generation is unavailable in this environment.',
          })
        }
      } catch (error) {
        notesReason = 'generation_failed'
        console.error('[meetings/transcript] Failed to generate notes', error)

        await setMeetingProcessingState({
          userId: auth.uid,
          workspaceId: workspace.workspaceId,
          legacyId: body.legacyId,
          userEmail: auth.email,
          notesProcessingState: 'failed',
          notesProcessingError: error instanceof Error ? error.message : 'AI note generation failed',
        })
      }
    }

    if (mode === 'save-notes') {
      if (incomingNotes.length < 10) {
        throw new BadRequestError('Meeting notes are too short. Add a more complete summary before saving.')
      }

      await saveMeetingNotes({
        userId: auth.uid,
        workspaceId: workspace.workspaceId,
        legacyId: body.legacyId,
        summary: incomingNotes,
        eventType: 'notes.manual_saved',
      })

      notesSaved = true
      summary = incomingNotes
      model = null

      if (body.markCompleted && currentMeeting.status !== 'completed') {
        await updateMeetingRecord({
          userId: auth.uid,
          userEmail: auth.email,
          workspaceId: workspace.workspaceId,
          legacyId: body.legacyId,
          status: 'completed',
        })
      }
    }

    const updatedMeetingRecord = await getMeetingRecord({
      userId: auth.uid,
      legacyId: body.legacyId,
      workspaceId: workspace.workspaceId,
      userEmail: auth.email,
    })

    return {
      meetingLegacyId: body.legacyId,
      meeting: updatedMeetingRecord.meeting,
      transcriptSaved,
      notesGenerated,
      notesSaved,
      summary,
      model,
      notesReason,
      transcriptTruncatedForNotes,
      mode,
    }
  }
)
