import { api } from '/_generated/api'
import { asNonEmptyString, asNumber, asString } from '../../helpers'
import type { OperationHandler } from '../../types'

function formatMeetingWhen(startTimeMs: number, endTimeMs: number): string {
  const start = new Date(startTimeMs)
  const end = new Date(endTimeMs)
  return `${start.toLocaleString()} – ${end.toLocaleTimeString()}`
}

export const meetingOperationHandlers: Record<string, OperationHandler> = {
  async summarizeMeetings(ctx, input) {
    const clientId =
      asNonEmptyString(input.params.clientId) ?? asNonEmptyString(input.context?.activeClientId ?? null)
    const includePast = input.params.includePast === true || input.params.includePast === 'true'
    const limit = Math.min(Math.max(asNumber(input.params.limit) ?? 12, 1), 20)

    const rawMeetings = await ctx.runQuery(api.meetings.list, {
      workspaceId: input.workspaceId,
      clientId: clientId ?? undefined,
      includePast,
      limit: 40,
    })

    const meetings = Array.isArray(rawMeetings)
      ? rawMeetings.flatMap((row) => {
          if (!row || typeof row !== 'object') return []
          const record = row as Record<string, unknown>
          const legacyId = asNonEmptyString(record.legacyId)
          const title = asNonEmptyString(record.title)
          const startTimeMs = asNumber(record.startTimeMs)
          const endTimeMs = asNumber(record.endTimeMs)
          if (!legacyId || !title || startTimeMs === null || endTimeMs === null) return []

          const notesSummary = asNonEmptyString(record.notesSummary)
          const transcriptText = asString(record.transcriptText)
          const status = asNonEmptyString(record.status) ?? 'scheduled'

          return [{
            meetingId: legacyId,
            title,
            status,
            when: formatMeetingWhen(startTimeMs, endTimeMs),
            notesSummary: notesSummary ?? null,
            hasTranscript: Boolean(transcriptText && transcriptText.trim().length > 0),
            route: `/dashboard/meetings?meeting=${encodeURIComponent(legacyId)}`,
          }]
        })
      : []

    const listed = meetings.slice(0, limit)
    const withNotes = listed.filter((meeting) => meeting.notesSummary)

    return {
      success: true,
      route: '/dashboard/meetings',
      data: {
        total: meetings.length,
        withNotes: withNotes.length,
        meetings: listed,
      },
      userMessage:
        listed.length === 0
          ? 'I could not find meetings to summarize in this workspace.'
          : withNotes.length > 0
            ? `Found ${listed.length} meeting${listed.length === 1 ? '' : 's'}; ${withNotes.length} already have notes summaries.`
            : `Found ${listed.length} upcoming meeting${listed.length === 1 ? '' : 's'}, but none have notes summaries yet.`,
    }
  },
}
