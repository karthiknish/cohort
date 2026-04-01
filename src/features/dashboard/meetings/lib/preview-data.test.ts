import { describe, expect, it } from 'vitest'

import {
  getPreviewGoogleWorkspaceStatus,
  getPreviewMeetingWorkspaceMembers,
  getPreviewMeetings,
} from './preview-data'

describe('meetings preview data', () => {
  it('provides broad lifecycle and processing coverage for preview meetings', () => {
    const meetings = getPreviewMeetings(null, 'UTC')

    expect(meetings.length).toBeGreaterThanOrEqual(7)
    expect(new Set(meetings.map((meeting) => meeting.status))).toEqual(
      new Set(['scheduled', 'in_progress', 'completed', 'cancelled']),
    )
    expect(meetings.some((meeting) => meeting.transcriptProcessingState === 'processing')).toBe(true)
    expect(meetings.some((meeting) => meeting.notesProcessingState === 'failed')).toBe(true)
    expect(meetings.some((meeting) => Boolean(meeting.notesSummary))).toBe(true)
    expect(meetings.some((meeting) => Boolean(meeting.transcriptText))).toBe(true)
    expect(meetings.some((meeting) => Boolean(meeting.notesUpdatedAtMs) && Boolean(meeting.notesModel))).toBe(true)
    expect(meetings.some((meeting) => Boolean(meeting.transcriptUpdatedAtMs) && Boolean(meeting.transcriptSource))).toBe(true)
  })

  it('filters preview meetings by client and keeps matching client-specific records', () => {
    const techCorpMeetings = getPreviewMeetings('preview-tech-corp', 'UTC')
    const startupMeetings = getPreviewMeetings('preview-startupxyz', 'UTC')

    expect(techCorpMeetings.length).toBeGreaterThanOrEqual(3)
    expect(startupMeetings.length).toBeGreaterThanOrEqual(2)
    expect(techCorpMeetings.every((meeting) => meeting.legacyId === 'preview-meeting-1' || meeting.legacyId === 'preview-meeting-4' || meeting.legacyId === 'preview-meeting-7')).toBe(true)
    expect(startupMeetings.every((meeting) => meeting.legacyId === 'preview-meeting-2' || meeting.legacyId === 'preview-meeting-5')).toBe(true)
  })

  it('keeps attendee suggestions and workspace integration status rich enough for demos', () => {
    const members = getPreviewMeetingWorkspaceMembers()
    const googleWorkspace = getPreviewGoogleWorkspaceStatus()

    expect(members.length).toBeGreaterThanOrEqual(8)
    expect(new Set(members.map((member) => member.email)).size).toBe(members.length)
    expect(googleWorkspace.connected).toBe(true)
    expect(googleWorkspace.linkedAtMs).not.toBeNull()
    expect(googleWorkspace.scopes).toContain('calendar.events')
    expect(googleWorkspace.scopes).toContain('calendar.readonly')
    expect(googleWorkspace.scopes).toContain('meetings.space.created')
  })
})