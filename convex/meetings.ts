import { z } from 'zod/v4'

import { Errors } from './errors'
import { zWorkspaceMutation, zWorkspaceQuery } from './functions'
import type { Doc } from './_generated/dataModel'

const meetingStatusValues = ['scheduled', 'in_progress', 'completed', 'cancelled'] as const
const meetingStatusZ = z.enum(meetingStatusValues)

function assertCanManageMeetings(role: string | null | undefined): void {
  if (role === 'admin' || role === 'team') {
    return
  }

  throw Errors.auth.forbidden('Only admin and team users can modify meetings')
}

const meetingZ = z.object({
  legacyId: z.string(),
  providerId: z.string(),
  integrationUserId: z.string().nullable(),
  clientId: z.string().nullable(),
  title: z.string(),
  description: z.string().nullable(),
  startTimeMs: z.number(),
  endTimeMs: z.number(),
  timezone: z.string(),
  meetLink: z.string().nullable(),
  calendarEventId: z.string().nullable(),
  status: meetingStatusZ,
  attendeeEmails: z.array(z.string()),
  createdBy: z.string(),
  createdAtMs: z.number(),
  updatedAtMs: z.number(),
  transcriptText: z.string().nullable(),
  transcriptUpdatedAtMs: z.number().nullable(),
  transcriptSource: z.string().nullable(),
  notesSummary: z.string().nullable(),
  notesUpdatedAtMs: z.number().nullable(),
  notesModel: z.string().nullable(),
})

function slugify(value: string): string {
  const base = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40)

  if (base.length === 0) {
    return 'meeting'
  }

  return base
}

function normalizeEmails(values: string[]): string[] {
  return Array.from(
    new Set(
      values
        .map((value) => value.trim().toLowerCase())
        .filter((value) => value.length > 0)
    )
  )
}

function mapMeeting(row: Doc<'meetings'>): z.infer<typeof meetingZ> {
  return {
    legacyId: row.legacyId,
    providerId: row.providerId,
    integrationUserId: row.integrationUserId,
    clientId: row.clientId,
    title: row.title,
    description: row.description,
    startTimeMs: row.startTimeMs,
    endTimeMs: row.endTimeMs,
    timezone: row.timezone,
    meetLink: row.meetLink,
    calendarEventId: row.calendarEventId,
    status: row.status,
    attendeeEmails: row.attendeeEmails,
    createdBy: row.createdBy,
    createdAtMs: row.createdAtMs,
    updatedAtMs: row.updatedAtMs,
    transcriptText: row.transcriptText,
    transcriptUpdatedAtMs: row.transcriptUpdatedAtMs,
    transcriptSource: row.transcriptSource,
    notesSummary: row.notesSummary,
    notesUpdatedAtMs: row.notesUpdatedAtMs,
    notesModel: row.notesModel,
  }
}

export const list = zWorkspaceQuery({
  args: {
    workspaceId: z.string(),
    clientId: z.string().nullable().optional(),
    status: meetingStatusZ.optional(),
    includePast: z.boolean().optional(),
    limit: z.number().optional(),
  },
  returns: z.array(meetingZ),
  handler: async (ctx, args) => {
    const clientId = typeof args.clientId === 'string' && args.clientId.trim().length > 0 ? args.clientId.trim() : null
    const includePast = args.includePast === true
    const limit = Math.min(Math.max(args.limit ?? 50, 1), 100)

    let query = clientId
      ? ctx.db
          .query('meetings')
          .withIndex('by_workspace_client_startTimeMs', (q) => q.eq('workspaceId', args.workspaceId).eq('clientId', clientId))
          .order('desc')
      : args.status
        ? ctx.db
            .query('meetings')
            .withIndex('by_workspace_status_startTimeMs', (q) => q.eq('workspaceId', args.workspaceId).eq('status', args.status!))
            .order('desc')
        : ctx.db
            .query('meetings')
            .withIndex('by_workspace_startTimeMs', (q) => q.eq('workspaceId', args.workspaceId))
            .order('desc')

    if (!includePast) {
      const now = Date.now()
      query = query.filter((q) => q.gte(q.field('endTimeMs'), now))
    }

    if (args.status && clientId) {
      query = query.filter((q) => q.eq(q.field('status'), args.status!))
    }

    const rows = await query.take(limit)
    return rows.map(mapMeeting)
  },
})

export const getByLegacyId = zWorkspaceQuery({
  args: {
    workspaceId: z.string(),
    legacyId: z.string(),
  },
  returns: meetingZ,
  handler: async (ctx, args) => {
    const row = await ctx.db
      .query('meetings')
      .withIndex('by_workspace_legacyId', (q) => q.eq('workspaceId', args.workspaceId).eq('legacyId', args.legacyId))
      .unique()

    if (!row) {
      throw Errors.resource.notFound('Meeting', args.legacyId)
    }

    return mapMeeting(row)
  },
})

export const create = zWorkspaceMutation({
  args: {
    workspaceId: z.string(),
    title: z.string(),
    description: z.string().nullable().optional(),
    startTimeMs: z.number(),
    endTimeMs: z.number(),
    timezone: z.string(),
    meetLink: z.string().nullable().optional(),
    calendarEventId: z.string().nullable().optional(),
    attendeeEmails: z.array(z.string()),
    clientId: z.string().nullable().optional(),
    integrationUserId: z.string().nullable().optional(),
    providerId: z.string().optional(),
  },
  returns: meetingZ,
  handler: async (ctx, args) => {
    assertCanManageMeetings(ctx.user.role)

    const title = args.title.trim()
    if (title.length === 0) {
      throw Errors.validation.invalidInput('Meeting title is required')
    }

    if (args.endTimeMs <= args.startTimeMs) {
      throw Errors.validation.invalidInput('Meeting end time must be after start time')
    }

    const base = `${slugify(title)}-${ctx.now}`
    let legacyId = base

    for (let attempt = 1; attempt <= 20; attempt += 1) {
      const existing = await ctx.db
        .query('meetings')
        .withIndex('by_workspace_legacyId', (q) => q.eq('workspaceId', args.workspaceId).eq('legacyId', legacyId))
        .unique()

      if (!existing) {
        break
      }

      legacyId = `${base}-${attempt}`
    }

    const payload = {
      workspaceId: args.workspaceId,
      legacyId,
      providerId: args.providerId ?? 'google-workspace',
      integrationUserId: args.integrationUserId ?? ctx.legacyId,
      clientId: args.clientId ?? null,
      title,
      description: args.description ?? null,
      startTimeMs: args.startTimeMs,
      endTimeMs: args.endTimeMs,
      timezone: args.timezone,
      meetLink: args.meetLink ?? null,
      calendarEventId: args.calendarEventId ?? null,
      status: 'scheduled' as const,
      attendeeEmails: normalizeEmails(args.attendeeEmails),
      createdBy: ctx.legacyId,
      createdAtMs: ctx.now,
      updatedAtMs: ctx.now,
      transcriptText: null,
      transcriptUpdatedAtMs: null,
      transcriptSource: null,
      notesSummary: null,
      notesUpdatedAtMs: null,
      notesModel: null,
    }

    await ctx.db.insert('meetings', payload)
    return payload
  },
})

export const updateStatus = zWorkspaceMutation({
  args: {
    workspaceId: z.string(),
    legacyId: z.string(),
    status: meetingStatusZ,
  },
  returns: z.string(),
  handler: async (ctx, args) => {
    assertCanManageMeetings(ctx.user.role)

    const meeting = await ctx.db
      .query('meetings')
      .withIndex('by_workspace_legacyId', (q) => q.eq('workspaceId', args.workspaceId).eq('legacyId', args.legacyId))
      .unique()

    if (!meeting) {
      throw Errors.resource.notFound('Meeting', args.legacyId)
    }

    await ctx.db.patch(meeting._id, {
      status: args.status,
      updatedAtMs: ctx.now,
    })

    return meeting.legacyId
  },
})

export const updateDetails = zWorkspaceMutation({
  args: {
    workspaceId: z.string(),
    legacyId: z.string(),
    title: z.string().optional(),
    description: z.string().nullable().optional(),
    startTimeMs: z.number().optional(),
    endTimeMs: z.number().optional(),
    timezone: z.string().optional(),
    attendeeEmails: z.array(z.string()).optional(),
    meetLink: z.string().nullable().optional(),
    status: meetingStatusZ.optional(),
  },
  returns: meetingZ,
  handler: async (ctx, args) => {
    assertCanManageMeetings(ctx.user.role)

    const meeting = await ctx.db
      .query('meetings')
      .withIndex('by_workspace_legacyId', (q) => q.eq('workspaceId', args.workspaceId).eq('legacyId', args.legacyId))
      .unique()

    if (!meeting) {
      throw Errors.resource.notFound('Meeting', args.legacyId)
    }

    const nextTitle = typeof args.title === 'string' ? args.title.trim() : meeting.title
    if (nextTitle.length === 0) {
      throw Errors.validation.invalidInput('Meeting title is required')
    }

    const nextStartTimeMs = typeof args.startTimeMs === 'number' ? args.startTimeMs : meeting.startTimeMs
    const nextEndTimeMs = typeof args.endTimeMs === 'number' ? args.endTimeMs : meeting.endTimeMs

    if (nextEndTimeMs <= nextStartTimeMs) {
      throw Errors.validation.invalidInput('Meeting end time must be after start time')
    }

    await ctx.db.patch(meeting._id, {
      title: nextTitle,
      description: args.description === undefined ? meeting.description : args.description,
      startTimeMs: nextStartTimeMs,
      endTimeMs: nextEndTimeMs,
      timezone: args.timezone ?? meeting.timezone,
      attendeeEmails: args.attendeeEmails ? normalizeEmails(args.attendeeEmails) : meeting.attendeeEmails,
      meetLink: args.meetLink === undefined ? meeting.meetLink : args.meetLink,
      status: args.status ?? meeting.status,
      updatedAtMs: ctx.now,
    })

    const updated = await ctx.db.get(meeting._id)
    if (!updated) {
      throw Errors.resource.notFound('Meeting', args.legacyId)
    }

    return mapMeeting(updated)
  },
})

export const attachTranscript = zWorkspaceMutation({
  args: {
    workspaceId: z.string(),
    legacyId: z.string(),
    transcriptText: z.string(),
    source: z.string().optional(),
    status: meetingStatusZ.optional(),
    eventType: z.string().optional(),
    rawPayload: z.any().optional(),
  },
  returns: z.string(),
  handler: async (ctx, args) => {
    assertCanManageMeetings(ctx.user.role)

    const meeting = await ctx.db
      .query('meetings')
      .withIndex('by_workspace_legacyId', (q) => q.eq('workspaceId', args.workspaceId).eq('legacyId', args.legacyId))
      .unique()

    if (!meeting) {
      throw Errors.resource.notFound('Meeting', args.legacyId)
    }

    const nextStatus = args.status ?? meeting.status

    await ctx.db.patch(meeting._id, {
      transcriptText: args.transcriptText,
      transcriptUpdatedAtMs: ctx.now,
      transcriptSource: args.source ?? meeting.transcriptSource ?? 'google-workspace',
      status: nextStatus,
      updatedAtMs: ctx.now,
    })

    await ctx.db.insert('meetingEvents', {
      workspaceId: args.workspaceId,
      meetingLegacyId: meeting.legacyId,
      eventType: args.eventType ?? 'transcript.received',
      payload: args.rawPayload ?? {},
      receivedAtMs: ctx.now,
    })

    return meeting.legacyId
  },
})

export const attachTranscriptByCalendarEventId = zWorkspaceMutation({
  args: {
    workspaceId: z.string(),
    calendarEventId: z.string(),
    transcriptText: z.string(),
    source: z.string().optional(),
    status: meetingStatusZ.optional(),
    eventType: z.string().optional(),
    rawPayload: z.any().optional(),
  },
  returns: z.string(),
  handler: async (ctx, args) => {
    assertCanManageMeetings(ctx.user.role)

    const meeting = await ctx.db
      .query('meetings')
      .withIndex('by_workspace_calendarEventId', (q) =>
        q.eq('workspaceId', args.workspaceId).eq('calendarEventId', args.calendarEventId)
      )
      .unique()

    if (!meeting) {
      throw Errors.resource.notFound('Meeting calendar event', args.calendarEventId)
    }

    const nextStatus = args.status ?? meeting.status

    await ctx.db.patch(meeting._id, {
      transcriptText: args.transcriptText,
      transcriptUpdatedAtMs: ctx.now,
      transcriptSource: args.source ?? meeting.transcriptSource ?? 'google-workspace',
      status: nextStatus,
      updatedAtMs: ctx.now,
    })

    await ctx.db.insert('meetingEvents', {
      workspaceId: args.workspaceId,
      meetingLegacyId: meeting.legacyId,
      eventType: args.eventType ?? 'transcript.received',
      payload: args.rawPayload ?? {},
      receivedAtMs: ctx.now,
    })

    return meeting.legacyId
  },
})

export const saveNotes = zWorkspaceMutation({
  args: {
    workspaceId: z.string(),
    legacyId: z.string(),
    summary: z.string(),
    model: z.string().optional(),
  },
  returns: z.string(),
  handler: async (ctx, args) => {
    assertCanManageMeetings(ctx.user.role)

    const meeting = await ctx.db
      .query('meetings')
      .withIndex('by_workspace_legacyId', (q) => q.eq('workspaceId', args.workspaceId).eq('legacyId', args.legacyId))
      .unique()

    if (!meeting) {
      throw Errors.resource.notFound('Meeting', args.legacyId)
    }

    await ctx.db.patch(meeting._id, {
      notesSummary: args.summary,
      notesUpdatedAtMs: ctx.now,
      notesModel: args.model ?? null,
      updatedAtMs: ctx.now,
    })

    await ctx.db.insert('meetingEvents', {
      workspaceId: args.workspaceId,
      meetingLegacyId: meeting.legacyId,
      eventType: 'notes.generated',
      payload: {
        model: args.model ?? null,
      },
      receivedAtMs: ctx.now,
    })

    return meeting.legacyId
  },
})
