import { z } from 'zod/v4'

import { Errors } from './errors'
import { zWorkspaceMutation, zWorkspaceQuery } from './functions'
import type { Doc } from '/_generated/dataModel'

const meetingStatusValues = ['scheduled', 'in_progress', 'completed', 'cancelled'] as const
const meetingStatusZ = z.enum(meetingStatusValues)
const meetingProcessingStateValues = ['idle', 'processing', 'failed'] as const
const meetingProcessingStateZ = z.enum(meetingProcessingStateValues)

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
  roomName: z.string().nullable(),
  calendarEventId: z.string().nullable(),
  status: meetingStatusZ,
  attendeeEmails: z.array(z.string()),
  createdBy: z.string(),
  createdAtMs: z.number(),
  updatedAtMs: z.number(),
  transcriptText: z.string().nullable(),
  transcriptUpdatedAtMs: z.number().nullable(),
  transcriptSource: z.string().nullable(),
  transcriptProcessingState: meetingProcessingStateZ.nullable(),
  transcriptProcessingError: z.string().nullable(),
  notesSummary: z.string().nullable(),
  notesUpdatedAtMs: z.number().nullable(),
  notesModel: z.string().nullable(),
  notesProcessingState: meetingProcessingStateZ.nullable(),
  notesProcessingError: z.string().nullable(),
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

type JsonScalar = string | number | boolean | null
type JsonLayer1 = JsonScalar | JsonScalar[] | Record<string, JsonScalar>
type JsonLayer2 = JsonLayer1 | JsonLayer1[] | Record<string, JsonLayer1>

function isJsonScalar(value: unknown): value is JsonScalar {
  return value === null || typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean'
}

function toJsonLayer1(value: unknown): JsonLayer1 | null {
  if (isJsonScalar(value)) return value

  if (Array.isArray(value)) {
    return value.every(isJsonScalar) ? value : null
  }

  if (value && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
    if (entries.every(([, entry]) => isJsonScalar(entry))) {
      return Object.fromEntries(entries) as Record<string, JsonScalar>
    }
  }

  return null
}

function normalizeEventPayload(value: unknown): JsonLayer2 {
  const asLayer1 = toJsonLayer1(value)
  if (asLayer1 !== null) return asLayer1

  if (Array.isArray(value)) {
    const mapped = value.map((entry) => toJsonLayer1(entry))
    if (mapped.every((entry): entry is JsonLayer1 => entry !== null)) {
      return mapped
    }
    return null
  }

  if (value && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
    const mappedEntries = entries.map(([key, entry]) => [key, toJsonLayer1(entry)] as const)
    if (mappedEntries.every(([, entry]) => entry !== null)) {
      return Object.fromEntries(mappedEntries) as Record<string, JsonLayer1>
    }
  }

  return null
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
    roomName: row.roomName ?? null,
    calendarEventId: row.calendarEventId,
    status: row.status,
    attendeeEmails: row.attendeeEmails,
    createdBy: row.createdBy,
    createdAtMs: row.createdAtMs,
    updatedAtMs: row.updatedAtMs,
    transcriptText: row.transcriptText,
    transcriptUpdatedAtMs: row.transcriptUpdatedAtMs,
    transcriptSource: row.transcriptSource,
    transcriptProcessingState: row.transcriptProcessingState ?? 'idle',
    transcriptProcessingError: row.transcriptProcessingError ?? null,
    notesSummary: row.notesSummary,
    notesUpdatedAtMs: row.notesUpdatedAtMs,
    notesModel: row.notesModel,
    notesProcessingState: row.notesProcessingState ?? 'idle',
    notesProcessingError: row.notesProcessingError ?? null,
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
    const status = args.status
    const includePast = args.includePast === true
    const limit = Math.min(Math.max(args.limit ?? 50, 1), 100)

    let query = clientId
      ? ctx.db
          .query('meetings')
          .withIndex('by_workspace_client_startTimeMs', (q) => q.eq('workspaceId', args.workspaceId).eq('clientId', clientId))
          .order('desc')
        : status
        ? ctx.db
            .query('meetings')
          .withIndex('by_workspace_status_startTimeMs', (q) => q.eq('workspaceId', args.workspaceId).eq('status', status))
            .order('desc')
        : ctx.db
            .query('meetings')
            .withIndex('by_workspace_startTimeMs', (q) => q.eq('workspaceId', args.workspaceId))
            .order('desc')

    if (!includePast) {
      const now = Date.now()
      query = query.filter((q) =>
        q.or(
          q.gte(q.field('endTimeMs'), now),
          q.eq(q.field('transcriptProcessingState'), 'processing'),
          q.eq(q.field('transcriptProcessingState'), 'failed'),
          q.eq(q.field('notesProcessingState'), 'processing'),
          q.eq(q.field('notesProcessingState'), 'failed')
        )
      )
    }

    if (status && clientId) {
      query = query.filter((q) => q.eq(q.field('status'), status))
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

export const getByRoomName = zWorkspaceQuery({
  args: {
    workspaceId: z.string(),
    roomName: z.string(),
  },
  returns: meetingZ,
  handler: async (ctx, args) => {
    const roomName = args.roomName.trim()
    if (roomName.length === 0) {
      throw Errors.validation.invalidInput('Room name is required')
    }

    const row = await ctx.db
      .query('meetings')
      .withIndex('by_workspace_roomName', (q) => q.eq('workspaceId', args.workspaceId).eq('roomName', roomName))
      .unique()

    if (!row) {
      throw Errors.resource.notFound('Meeting room', roomName)
    }

    return mapMeeting(row)
  },
})

export const getByCalendarEventId = zWorkspaceQuery({
  args: {
    workspaceId: z.string(),
    calendarEventId: z.string(),
  },
  returns: meetingZ,
  handler: async (ctx, args) => {
    const calendarEventId = args.calendarEventId.trim()
    if (calendarEventId.length === 0) {
      throw Errors.validation.invalidInput('Calendar event id is required')
    }

    const row = await ctx.db
      .query('meetings')
      .withIndex('by_workspace_calendarEventId', (q) =>
        q.eq('workspaceId', args.workspaceId).eq('calendarEventId', calendarEventId)
      )
      .unique()

    if (!row) {
      throw Errors.resource.notFound('Meeting calendar event', calendarEventId)
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
    roomName: z.string().nullable().optional(),
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
      roomName: args.roomName ?? null,
      calendarEventId: args.calendarEventId ?? null,
      status: 'scheduled' as const,
      attendeeEmails: normalizeEmails(args.attendeeEmails),
      createdBy: ctx.legacyId,
      createdAtMs: ctx.now,
      updatedAtMs: ctx.now,
      transcriptText: null,
      transcriptUpdatedAtMs: null,
      transcriptSource: null,
      transcriptProcessingState: 'idle' as const,
      transcriptProcessingError: null,
      notesSummary: null,
      notesUpdatedAtMs: null,
      notesModel: null,
      notesProcessingState: 'idle' as const,
      notesProcessingError: null,
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
    roomName: z.string().nullable().optional(),
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
      roomName: args.roomName === undefined ? meeting.roomName : args.roomName,
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

export const ensureNativeRoom = zWorkspaceMutation({
  args: {
    workspaceId: z.string(),
    legacyId: z.string(),
    roomName: z.string(),
    meetLink: z.string().nullable(),
  },
  returns: meetingZ,
  handler: async (ctx, args) => {
    const roomName = args.roomName.trim()
    if (roomName.length === 0) {
      throw Errors.validation.invalidInput('Meeting room name is required')
    }

    const meeting = await ctx.db
      .query('meetings')
      .withIndex('by_workspace_legacyId', (q) => q.eq('workspaceId', args.workspaceId).eq('legacyId', args.legacyId))
      .unique()

    if (!meeting) {
      throw Errors.resource.notFound('Meeting', args.legacyId)
    }

    if (meeting.roomName === roomName && meeting.meetLink === (args.meetLink ?? null)) {
      return mapMeeting(meeting)
    }

    await ctx.db.patch(meeting._id, {
      roomName,
      meetLink: args.meetLink ?? meeting.meetLink ?? null,
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
    rawPayload: z.unknown().optional(),
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
      transcriptProcessingState: 'idle',
      transcriptProcessingError: null,
      status: nextStatus,
      updatedAtMs: ctx.now,
    })

    await ctx.db.insert('meetingEvents', {
      workspaceId: args.workspaceId,
      meetingLegacyId: meeting.legacyId,
      eventType: args.eventType ?? 'transcript.received',
      payload: normalizeEventPayload(args.rawPayload),
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
    rawPayload: z.unknown().optional(),
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
      transcriptProcessingState: 'idle',
      transcriptProcessingError: null,
      status: nextStatus,
      updatedAtMs: ctx.now,
    })

    await ctx.db.insert('meetingEvents', {
      workspaceId: args.workspaceId,
      meetingLegacyId: meeting.legacyId,
      eventType: args.eventType ?? 'transcript.received',
      payload: normalizeEventPayload(args.rawPayload),
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
    eventType: z.string().optional(),
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

    const summary = args.summary.trim()
    if (summary.length === 0) {
      throw Errors.validation.invalidInput('Meeting notes are required')
    }

    await ctx.db.patch(meeting._id, {
      notesSummary: summary,
      notesUpdatedAtMs: ctx.now,
      notesModel: args.model ?? null,
      notesProcessingState: 'idle',
      notesProcessingError: null,
      updatedAtMs: ctx.now,
    })

    await ctx.db.insert('meetingEvents', {
      workspaceId: args.workspaceId,
      meetingLegacyId: meeting.legacyId,
      eventType: args.eventType ?? 'notes.generated',
      payload: {
        model: args.model ?? null,
      },
      receivedAtMs: ctx.now,
    })

    return meeting.legacyId
  },
})

export const setProcessingState = zWorkspaceMutation({
  args: {
    workspaceId: z.string(),
    legacyId: z.string(),
    status: meetingStatusZ.optional(),
    transcriptProcessingState: meetingProcessingStateZ.optional(),
    transcriptProcessingError: z.string().nullable().optional(),
    notesProcessingState: meetingProcessingStateZ.optional(),
    notesProcessingError: z.string().nullable().optional(),
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

    const patch: Partial<Doc<'meetings'>> = {
      updatedAtMs: ctx.now,
    }

    if (args.status !== undefined) {
      patch.status = args.status
    }

    if (args.transcriptProcessingState !== undefined) {
      patch.transcriptProcessingState = args.transcriptProcessingState
    }

    if (args.transcriptProcessingError !== undefined) {
      patch.transcriptProcessingError = args.transcriptProcessingError
    }

    if (args.notesProcessingState !== undefined) {
      patch.notesProcessingState = args.notesProcessingState
    }

    if (args.notesProcessingError !== undefined) {
      patch.notesProcessingError = args.notesProcessingError
    }

    await ctx.db.patch(meeting._id, patch)

    const updated = await ctx.db.get(meeting._id)
    if (!updated) {
      throw Errors.resource.notFound('Meeting', args.legacyId)
    }

    return mapMeeting(updated)
  },
})
