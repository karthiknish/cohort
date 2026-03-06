import type { ConvexHttpClient } from 'convex/browser'
import type { FunctionReference } from 'convex/server'

import { createConvexAdminClient } from '@/lib/convex-admin'
import type { AuthResult } from '@/lib/server-auth'
import { resolveWorkspaceIdForUser } from '@/lib/workspace'

function getConvexClientForUser(userId: string, email?: string | null, name?: string | null): ConvexHttpClient | null {
  const auth: AuthResult = {
    uid: userId,
    email: email ?? null,
    name: name ?? null,
    claims: { provider: 'better-auth' },
    isCron: false,
  }

  return createConvexAdminClient({ auth })
}

async function executeMutation(convex: ConvexHttpClient, name: string, args: Record<string, unknown>) {
  return await convex.mutation(name as unknown as FunctionReference<'mutation'>, args)
}

async function executeQuery(convex: ConvexHttpClient, name: string, args: Record<string, unknown>) {
  return await convex.query(name as unknown as FunctionReference<'query'>, args)
}

export type GoogleWorkspaceTokenRecord = {
  providerId: string
  userId: string
  userEmail: string | null
  accessToken: string | null
  refreshToken: string | null
  idToken: string | null
  scopes: string[]
  accessTokenExpiresAtMs: number | null
  refreshTokenExpiresAtMs: number | null
  linkedAtMs: number | null
  lastUsedAtMs: number | null
  updatedAtMs: number
}

export async function upsertGoogleWorkspaceTokens(options: {
  userId: string
  userEmail?: string | null
  accessToken: string | null
  refreshToken?: string | null
  idToken?: string | null
  scopes?: string[]
  accessTokenExpiresAtMs?: number | null
  refreshTokenExpiresAtMs?: number | null
}): Promise<{ workspaceId: string; updatedAtMs: number }> {
  const workspaceId = await resolveWorkspaceIdForUser(options.userId)
  const convex = getConvexClientForUser(options.userId, options.userEmail ?? null, null)

  if (!convex) {
    throw new Error('Convex admin client is not configured')
  }

  const result = (await executeMutation(convex, 'meetingIntegrations:upsertGoogleWorkspaceTokens', {
    workspaceId,
    userEmail: options.userEmail ?? null,
    accessToken: options.accessToken,
    refreshToken: options.refreshToken ?? undefined,
    idToken: options.idToken ?? undefined,
    scopes: options.scopes ?? undefined,
    accessTokenExpiresAtMs: options.accessTokenExpiresAtMs ?? undefined,
    refreshTokenExpiresAtMs: options.refreshTokenExpiresAtMs ?? undefined,
  })) as { updatedAtMs: number }

  return {
    workspaceId,
    updatedAtMs: result.updatedAtMs,
  }
}

export async function getGoogleWorkspaceTokens(options: {
  userId: string
}): Promise<{ workspaceId: string; tokens: GoogleWorkspaceTokenRecord | null }> {
  const workspaceId = await resolveWorkspaceIdForUser(options.userId)
  const convex = getConvexClientForUser(options.userId, null, null)

  if (!convex) {
    throw new Error('Convex admin client is not configured')
  }

  const tokens = (await executeQuery(convex, 'meetingIntegrations:getGoogleWorkspaceTokensInternal', {
    workspaceId,
    userId: options.userId,
  })) as GoogleWorkspaceTokenRecord | null

  return { workspaceId, tokens }
}

export type CreateMeetingInput = {
  userId: string
  userEmail?: string | null
  title: string
  description?: string | null
  startTimeMs: number
  endTimeMs: number
  timezone: string
  meetLink?: string | null
  calendarEventId?: string | null
  attendeeEmails: string[]
  clientId?: string | null
  integrationUserId?: string | null
  providerId?: string
}

export type MeetingRecord = {
  legacyId: string
  providerId: string
  integrationUserId: string | null
  clientId: string | null
  title: string
  description: string | null
  startTimeMs: number
  endTimeMs: number
  timezone: string
  meetLink: string | null
  calendarEventId: string | null
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
  attendeeEmails: string[]
  createdBy: string
  createdAtMs: number
  updatedAtMs: number
  transcriptText: string | null
  transcriptUpdatedAtMs: number | null
  transcriptSource: string | null
  notesSummary: string | null
  notesUpdatedAtMs: number | null
  notesModel: string | null
}

export async function createMeetingRecord(options: CreateMeetingInput) {
  const workspaceId = await resolveWorkspaceIdForUser(options.userId)
  const convex = getConvexClientForUser(options.userId, options.userEmail ?? null, null)

  if (!convex) {
    throw new Error('Convex admin client is not configured')
  }

  return await executeMutation(convex, 'meetings:create', {
    workspaceId,
    title: options.title,
    description: options.description ?? null,
    startTimeMs: options.startTimeMs,
    endTimeMs: options.endTimeMs,
    timezone: options.timezone,
    meetLink: options.meetLink ?? null,
    calendarEventId: options.calendarEventId ?? null,
    attendeeEmails: options.attendeeEmails,
    clientId: options.clientId ?? null,
    integrationUserId: options.integrationUserId ?? null,
    providerId: options.providerId ?? 'google-workspace',
  })
}

export async function getMeetingRecord(options: {
  userId: string
  legacyId: string
  workspaceId?: string
  userEmail?: string | null
}): Promise<{ workspaceId: string; meeting: MeetingRecord }> {
  const workspaceId = options.workspaceId ?? (await resolveWorkspaceIdForUser(options.userId))
  const convex = getConvexClientForUser(options.userId, options.userEmail ?? null, null)

  if (!convex) {
    throw new Error('Convex admin client is not configured')
  }

  const meeting = (await executeQuery(convex, 'meetings:getByLegacyId', {
    workspaceId,
    legacyId: options.legacyId,
  })) as MeetingRecord

  return { workspaceId, meeting }
}

export async function updateMeetingRecord(options: {
  userId: string
  legacyId: string
  workspaceId?: string
  userEmail?: string | null
  title?: string
  description?: string | null
  startTimeMs?: number
  endTimeMs?: number
  timezone?: string
  attendeeEmails?: string[]
  meetLink?: string | null
  status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
}): Promise<{ workspaceId: string; meeting: MeetingRecord }> {
  const workspaceId = options.workspaceId ?? (await resolveWorkspaceIdForUser(options.userId))
  const convex = getConvexClientForUser(options.userId, options.userEmail ?? null, null)

  if (!convex) {
    throw new Error('Convex admin client is not configured')
  }

  const meeting = (await executeMutation(convex, 'meetings:updateDetails', {
    workspaceId,
    legacyId: options.legacyId,
    title: options.title,
    description: options.description,
    startTimeMs: options.startTimeMs,
    endTimeMs: options.endTimeMs,
    timezone: options.timezone,
    attendeeEmails: options.attendeeEmails,
    meetLink: options.meetLink,
    status: options.status,
  })) as MeetingRecord

  return { workspaceId, meeting }
}

export async function saveMeetingTranscript(options: {
  userId: string
  workspaceId: string
  meetingLegacyId?: string
  calendarEventId?: string
  transcriptText: string
  source?: string
  status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
  eventType?: string
  rawPayload?: unknown
}) {
  const convex = getConvexClientForUser(options.userId, null, null)

  if (!convex) {
    throw new Error('Convex admin client is not configured')
  }

  if (options.meetingLegacyId) {
    return await executeMutation(convex, 'meetings:attachTranscript', {
      workspaceId: options.workspaceId,
      legacyId: options.meetingLegacyId,
      transcriptText: options.transcriptText,
      source: options.source,
      status: options.status,
      eventType: options.eventType,
      rawPayload: options.rawPayload,
    })
  }

  if (options.calendarEventId) {
    return await executeMutation(convex, 'meetings:attachTranscriptByCalendarEventId', {
      workspaceId: options.workspaceId,
      calendarEventId: options.calendarEventId,
      transcriptText: options.transcriptText,
      source: options.source,
      status: options.status,
      eventType: options.eventType,
      rawPayload: options.rawPayload,
    })
  }

  throw new Error('Either meetingLegacyId or calendarEventId is required to save a transcript')
}

export async function saveMeetingNotes(options: {
  userId: string
  workspaceId: string
  legacyId: string
  summary: string
  model?: string
  eventType?: string
}) {
  const convex = getConvexClientForUser(options.userId, null, null)

  if (!convex) {
    throw new Error('Convex admin client is not configured')
  }

  return await executeMutation(convex, 'meetings:saveNotes', {
    workspaceId: options.workspaceId,
    legacyId: options.legacyId,
    summary: options.summary,
    model: options.model,
    eventType: options.eventType,
  })
}
