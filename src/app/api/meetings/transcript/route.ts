import { z } from 'zod'

import { createApiHandler } from '@/lib/api-handler'
import { BadRequestError, ForbiddenError, UnauthorizedError } from '@/lib/api-errors'
import { getMeetingRecord, saveMeetingNotes, saveMeetingTranscript, updateMeetingRecord } from '@/lib/meetings-admin'
import { GeminiAIService } from '@/services/gemini'

const transcriptModeValues = ['save-transcript', 'save-transcript-and-generate-notes', 'save-notes'] as const
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
  const apiKey = process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY ?? ''
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
  const model = process.env.GEMINI_MODEL?.trim() || 'gemini-3-flash-preview'

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

    if (mode === 'save-transcript' || mode === 'save-transcript-and-generate-notes') {
      if (effectiveTranscript.length < 20) {
        throw new BadRequestError('Transcript is too short. Record at least a few sentences before saving.')
      }

      await saveMeetingTranscript({
        userId: auth.uid,
        workspaceId: workspace.workspaceId,
        meetingLegacyId: body.legacyId,
        transcriptText: effectiveTranscript,
        source: body.source ?? currentMeeting.transcriptSource ?? 'in-site-voice',
        status: body.markCompleted ? 'completed' : 'in_progress',
        eventType: 'transcript.manual',
        rawPayload: {
          mode,
          meetingLegacyId: body.legacyId,
        },
      })

      transcriptSaved = true
    }

    if (mode === 'save-transcript-and-generate-notes') {
      try {
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
        }
      } catch (error) {
        notesReason = 'generation_failed'
        console.error('[meetings/transcript] Failed to generate notes', error)
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
