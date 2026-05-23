import { describe, expect, it } from 'vitest'

import {
  buildMeetingNotesUserPrompt,
  buildTranscriptExcerptForNotes,
  MAX_TRANSCRIPT_CHARS_FOR_NOTES,
  MEETING_NOTES_REQUIRED_HEADINGS,
  validateAndNormalizeMeetingNotes,
} from './meeting-notes-gemini'

function validNotes(): string {
  return MEETING_NOTES_REQUIRED_HEADINGS.map((heading) => `${heading}\n- Example point`).join('\n\n')
}

describe('meeting-notes-gemini', () => {
  it('truncates long transcripts for note generation', () => {
    const transcript = 'a'.repeat(MAX_TRANSCRIPT_CHARS_FOR_NOTES + 500)
    const excerpt = buildTranscriptExcerptForNotes(transcript)

    expect(excerpt.truncated).toBe(true)
    expect(excerpt.text).toContain('[... transcript truncated for note generation ...]')
    expect(excerpt.text.length).toBeLessThan(transcript.length)
  })

  it('accepts well-formed meeting notes', () => {
    const result = validateAndNormalizeMeetingNotes(validNotes())

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.notes).toContain('## Summary')
    }
  })

  it('rejects notes missing required headings', () => {
    const result = validateAndNormalizeMeetingNotes(
      '## Summary\n- The team reviewed launch scope, timeline, ownership, and dependencies for the next milestone.\n- Marketing and product aligned on messaging and rollout checkpoints.',
    )

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.reason).toContain('missing required heading')
    }
  })

  it('builds a retry-aware user prompt', () => {
    const prompt = buildMeetingNotesUserPrompt('Team agreed to ship the dashboard next week.', {
      retryInvalidFormat: true,
    })

    expect(prompt).toContain('previous response was invalid')
    expect(prompt).toContain('Transcript:')
  })
})
