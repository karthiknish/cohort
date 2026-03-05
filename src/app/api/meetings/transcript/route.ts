import { z } from 'zod'

import { createApiHandler } from '@/lib/api-handler'
import { BadRequestError, ForbiddenError, UnauthorizedError } from '@/lib/api-errors'
import { saveMeetingNotes, saveMeetingTranscript } from '@/lib/meetings-admin'
import { GeminiAIService } from '@/services/gemini'

const saveTranscriptSchema = z.object({
  legacyId: z.string().min(1),
  transcriptText: z.string().min(1),
  source: z.string().optional(),
  markCompleted: z.boolean().optional(),
})

async function generateConciseMeetingNotes(transcriptText: string): Promise<{ summary: string; model: string } | null> {
  const apiKey = process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY ?? ''
  if (!apiKey) {
    return null
  }

  const gemini = new GeminiAIService(apiKey)
  const prompt = [
    'You are an expert meeting note taker.',
    'Read the transcript and return concise markdown notes with these sections:',
    '1. Summary (3-5 bullets)',
    '2. Decisions',
    '3. Action Items (owner + due date if available)',
    '4. Risks/Blockers',
    'Keep output under 220 words, factual, and avoid speculation.',
    '',
    'Transcript:',
    transcriptText,
  ].join('\n')

  const summary = await gemini.generateContent(prompt)
  const model = process.env.GEMINI_MODEL?.trim() || 'gemini-3-flash-preview'

  return {
    summary,
    model,
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

    const transcriptText = body.transcriptText.trim()
    if (transcriptText.length < 20) {
      throw new BadRequestError('Transcript is too short. Record at least a few sentences before saving.')
    }

    const meetingLegacyId = (await saveMeetingTranscript({
      userId: auth.uid,
      workspaceId: workspace.workspaceId,
      meetingLegacyId: body.legacyId,
      transcriptText,
      source: body.source ?? 'in-site-voice',
      status: body.markCompleted ? 'completed' : 'in_progress',
      eventType: 'transcript.manual',
      rawPayload: {
        mode: 'in-site-manual-recording',
        meetingLegacyId: body.legacyId,
      },
    })) as string

    let notesGenerated = false
    let summary: string | null = null
    let model: string | null = null

    try {
      const notes = await generateConciseMeetingNotes(transcriptText)
      if (notes) {
        await saveMeetingNotes({
          userId: auth.uid,
          workspaceId: workspace.workspaceId,
          legacyId: meetingLegacyId,
          summary: notes.summary,
          model: notes.model,
        })

        notesGenerated = true
        summary = notes.summary
        model = notes.model
      }
    } catch (error) {
      console.error('[meetings/transcript] Failed to generate notes', error)
    }

    return {
      meetingLegacyId,
      notesGenerated,
      summary,
      model,
    }
  }
)
