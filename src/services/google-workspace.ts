import { decrypt, encrypt } from '@/lib/crypto'

const GOOGLE_AUTH_ENDPOINT = 'https://accounts.google.com/o/oauth2/v2/auth'
const GOOGLE_TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token'
const GOOGLE_CALENDAR_EVENTS_ENDPOINT = 'https://www.googleapis.com/calendar/v3/calendars/primary/events'
const GOOGLE_MEET_SPACES_ENDPOINT = 'https://meet.googleapis.com/v2/spaces'
export const GOOGLE_MEET_SPACE_SETTINGS_SCOPE = 'https://www.googleapis.com/auth/meetings.space.settings'

const GOOGLE_WORKSPACE_SCOPES = [
  'https://www.googleapis.com/auth/calendar.events',
  GOOGLE_MEET_SPACE_SETTINGS_SCOPE,
  'openid',
  'email',
  'profile',
]

const STATE_TTL_MS = 5 * 60 * 1000

function readEnvValue(key: string): string | null {
  const value = process.env[key]
  if (typeof value !== 'string') {
    return null
  }

  const normalized = value.trim()
  return normalized.length > 0 ? normalized : null
}

function firstEnvValue(keys: readonly string[]): string | null {
  for (const key of keys) {
    const value = readEnvValue(key)
    if (value) {
      return value
    }
  }

  return null
}

export function resolveGoogleWorkspaceOAuthCredentials(): {
  clientId: string | null
  clientSecret: string | null
} {
  return {
    clientId: firstEnvValue(['GOOGLE_WORKSPACE_CLIENT_ID', 'GOOGLE_CLIENT_ID', 'GOOGLE_ADS_CLIENT_ID']),
    clientSecret: firstEnvValue(['GOOGLE_WORKSPACE_CLIENT_SECRET', 'GOOGLE_CLIENT_SECRET', 'GOOGLE_ADS_CLIENT_SECRET']),
  }
}

export function resolveGoogleWorkspaceOAuthRedirectUri(appUrl?: string | null): string | null {
  const explicit = firstEnvValue([
    'GOOGLE_WORKSPACE_OAUTH_REDIRECT_URI',
    'GOOGLE_OAUTH_REDIRECT_URI',
    'GOOGLE_ADS_OAUTH_REDIRECT_URI',
  ])

  if (explicit) {
    return explicit
  }

  const normalizedAppUrl = typeof appUrl === 'string' ? appUrl.trim().replace(/\/+$/, '') : ''
  if (!normalizedAppUrl) {
    return null
  }

  return `${normalizedAppUrl}/api/integrations/google-workspace/oauth/callback`
}

type GoogleWorkspaceOAuthContext = {
  state: string
  redirect?: string
  createdAt: number
}

type GoogleWorkspaceOAuthStatePayload = Omit<GoogleWorkspaceOAuthContext, 'createdAt'> & {
  createdAt?: number
}

type ExchangeCodeOptions = {
  clientId: string
  clientSecret: string
  redirectUri: string
  code: string
}

type RefreshTokenOptions = {
  clientId: string
  clientSecret: string
  refreshToken: string
}

export type GoogleWorkspaceTokenResponse = {
  access_token: string
  refresh_token?: string
  token_type?: string
  expires_in?: number
  scope?: string
  id_token?: string
}

type GoogleWorkspaceErrorResponse = {
  error?: string
  error_description?: string
}

export type CalendarMeetEvent = {
  eventId: string
  eventLink: string | null
  meetLink: string | null
  startTimeIso: string | null
  endTimeIso: string | null
}

export type MeetArtifactSetupStatus = {
  configured: boolean
  spaceName: string | null
  meetingCode: string | null
  reason: 'configured' | 'missing_meet_link' | 'missing_scope' | 'space_lookup_failed' | 'patch_failed'
  message: string | null
}

type GoogleConferenceEntryPoint = {
  entryPointType?: string
  uri?: string
}

type GoogleCalendarEventResponse = {
  id?: string
  htmlLink?: string
  hangoutLink?: string
  conferenceData?: {
    entryPoints?: GoogleConferenceEntryPoint[]
  }
  start?: {
    dateTime?: string
  }
  end?: {
    dateTime?: string
  }
  error?: {
    status?: string
    message?: string
  }
}

type GoogleMeetSpaceResponse = {
  name?: string
  meetingUri?: string
  meetingCode?: string
  error?: {
    status?: string
    message?: string
  }
}

function parseCalendarEventResponse(raw: string): GoogleCalendarEventResponse {
  try {
    return JSON.parse(raw) as GoogleCalendarEventResponse
  } catch {
    throw new GoogleWorkspaceOAuthError({
      message: `Unexpected Google Calendar response: ${raw.slice(0, 200)}`,
    })
  }
}

function mapCalendarEventResponse(parsed: GoogleCalendarEventResponse): CalendarMeetEvent {
  const eventId = typeof parsed?.id === 'string' ? parsed.id : ''
  if (!eventId) {
    throw new GoogleWorkspaceOAuthError({ message: 'Google Calendar did not return an event id' })
  }

  const conferenceEntryPoints = Array.isArray(parsed?.conferenceData?.entryPoints)
    ? parsed.conferenceData.entryPoints
    : []

  const videoEntry = conferenceEntryPoints.find((entry) => entry?.entryPointType === 'video')

  return {
    eventId,
    eventLink: typeof parsed?.htmlLink === 'string' ? parsed.htmlLink : null,
    meetLink:
      typeof parsed?.hangoutLink === 'string'
        ? parsed.hangoutLink
        : typeof videoEntry?.uri === 'string'
          ? videoEntry.uri
          : null,
    startTimeIso: typeof parsed?.start?.dateTime === 'string' ? parsed.start.dateTime : null,
    endTimeIso: typeof parsed?.end?.dateTime === 'string' ? parsed.end.dateTime : null,
  }
}

function buildCalendarEventDescription(description: string | null | undefined, meetingUrl: string | null | undefined): string {
  const normalizedDescription = typeof description === 'string' ? description.trim() : ''
  const normalizedMeetingUrl = typeof meetingUrl === 'string' ? meetingUrl.trim() : ''

  if (normalizedDescription && normalizedMeetingUrl) {
    return `${normalizedDescription}\n\nJoin in Cohorts: ${normalizedMeetingUrl}`
  }

  if (normalizedDescription) {
    return normalizedDescription
  }

  if (normalizedMeetingUrl) {
    return `Join in Cohorts: ${normalizedMeetingUrl}`
  }

  return ''
}

function parseGoogleMeetSpaceResponse(raw: string): GoogleMeetSpaceResponse {
  try {
    return JSON.parse(raw) as GoogleMeetSpaceResponse
  } catch {
    throw new GoogleWorkspaceOAuthError({
      message: `Unexpected Google Meet response: ${raw.slice(0, 200)}`,
    })
  }
}

function extractGoogleMeetCode(meetLink: string | null | undefined): string | null {
  if (!meetLink) return null

  try {
    const url = new URL(meetLink)
    if (url.hostname !== 'meet.google.com') return null
    const code = url.pathname.replace(/^\/+/, '').split('/')[0]
    return code && /^[a-z]+-[a-z]+-[a-z]+$/i.test(code) ? code.toLowerCase() : null
  } catch {
    return null
  }
}

export function hasGoogleWorkspaceScope(scopes: string[] | null | undefined, requiredScope: string): boolean {
  if (!Array.isArray(scopes)) return false
  return scopes.some((scope) => scope.trim() === requiredScope)
}

export class GoogleWorkspaceOAuthError extends Error {
  readonly code?: string
  readonly description?: string

  constructor(options: { message: string; code?: string; description?: string }) {
    super(options.message)
    this.name = 'GoogleWorkspaceOAuthError'
    this.code = options.code
    this.description = options.description
  }
}

export function createGoogleWorkspaceOAuthState(payload: GoogleWorkspaceOAuthStatePayload): string {
  const context: GoogleWorkspaceOAuthContext = {
    state: payload.state,
    redirect: payload.redirect,
    createdAt: payload.createdAt ?? Date.now(),
  }

  return encodeURIComponent(encrypt(JSON.stringify(context)))
}

export function validateGoogleWorkspaceOAuthState(state: string): GoogleWorkspaceOAuthContext {
  if (!state) {
    throw new GoogleWorkspaceOAuthError({ message: 'Missing OAuth state' })
  }

  let parsed: GoogleWorkspaceOAuthContext
  try {
    parsed = JSON.parse(decrypt(decodeURIComponent(state))) as GoogleWorkspaceOAuthContext
  } catch {
    throw new GoogleWorkspaceOAuthError({ message: 'Invalid OAuth state payload' })
  }

  if (!parsed.state || !parsed.createdAt) {
    throw new GoogleWorkspaceOAuthError({ message: 'Malformed OAuth state payload' })
  }

  if (Date.now() - parsed.createdAt > STATE_TTL_MS) {
    throw new GoogleWorkspaceOAuthError({ message: 'OAuth state has expired' })
  }

  return parsed
}

export function buildGoogleWorkspaceOAuthUrl(options: {
  clientId: string
  redirectUri: string
  state: string
  scopes?: string[]
  accessType?: 'online' | 'offline'
  prompt?: 'none' | 'consent' | 'select_account'
}) {
  const scopes = options.scopes ?? GOOGLE_WORKSPACE_SCOPES

  if (!options.clientId) {
    throw new GoogleWorkspaceOAuthError({ message: 'Google Workspace client ID is required' })
  }

  if (!options.redirectUri) {
    throw new GoogleWorkspaceOAuthError({ message: 'Google Workspace redirect URI is required' })
  }

  const params = new URLSearchParams({
    client_id: options.clientId,
    redirect_uri: options.redirectUri,
    response_type: 'code',
    scope: scopes.join(' '),
    access_type: options.accessType ?? 'offline',
    prompt: options.prompt ?? 'consent',
    state: options.state,
  })

  return `${GOOGLE_AUTH_ENDPOINT}?${params.toString()}`
}

function parseGoogleTokenResponse(raw: string): GoogleWorkspaceTokenResponse | GoogleWorkspaceErrorResponse {
  try {
    return JSON.parse(raw) as GoogleWorkspaceTokenResponse | GoogleWorkspaceErrorResponse
  } catch {
    throw new GoogleWorkspaceOAuthError({
      message: `Invalid response from Google token endpoint: ${raw.slice(0, 200)}`,
    })
  }
}

export async function exchangeGoogleWorkspaceCodeForTokens(
  options: ExchangeCodeOptions
): Promise<GoogleWorkspaceTokenResponse> {
  if (!options.code) {
    throw new GoogleWorkspaceOAuthError({ message: 'Authorization code is required' })
  }

  const body = new URLSearchParams({
    client_id: options.clientId,
    client_secret: options.clientSecret,
    redirect_uri: options.redirectUri,
    code: options.code,
    grant_type: 'authorization_code',
  })

  const response = await fetch(GOOGLE_TOKEN_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  })

  const raw = await response.text()
  const parsed = parseGoogleTokenResponse(raw)

  if (!response.ok) {
    const error = parsed as GoogleWorkspaceErrorResponse
    throw new GoogleWorkspaceOAuthError({
      message: error.error_description ?? `Google token exchange failed (${response.status})`,
      code: error.error,
      description: error.error_description,
    })
  }

  const data = parsed as GoogleWorkspaceTokenResponse
  if (!data.access_token) {
    throw new GoogleWorkspaceOAuthError({ message: 'Google token response did not include access_token' })
  }

  return data
}

export async function refreshGoogleWorkspaceAccessToken(
  options: RefreshTokenOptions
): Promise<GoogleWorkspaceTokenResponse> {
  if (!options.refreshToken) {
    throw new GoogleWorkspaceOAuthError({ message: 'Refresh token is required to refresh access' })
  }

  const body = new URLSearchParams({
    client_id: options.clientId,
    client_secret: options.clientSecret,
    refresh_token: options.refreshToken,
    grant_type: 'refresh_token',
  })

  const response = await fetch(GOOGLE_TOKEN_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  })

  const raw = await response.text()
  const parsed = parseGoogleTokenResponse(raw)

  if (!response.ok) {
    const error = parsed as GoogleWorkspaceErrorResponse
    throw new GoogleWorkspaceOAuthError({
      message: error.error_description ?? `Google token refresh failed (${response.status})`,
      code: error.error,
      description: error.error_description,
    })
  }

  const data = parsed as GoogleWorkspaceTokenResponse
  if (!data.access_token) {
    throw new GoogleWorkspaceOAuthError({ message: 'Google refresh response did not include access_token' })
  }

  return data
}

export async function createGoogleCalendarMeetEvent(options: {
  accessToken: string
  title: string
  description?: string | null
  startTimeMs: number
  endTimeMs: number
  timezone: string
  attendeeEmails: string[]
}): Promise<CalendarMeetEvent> {
  if (!options.accessToken) {
    throw new GoogleWorkspaceOAuthError({ message: 'Access token is required to schedule a meeting' })
  }

  const requestId = `cohorts-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`

  const response = await fetch(`${GOOGLE_CALENDAR_EVENTS_ENDPOINT}?conferenceDataVersion=1&sendUpdates=all`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${options.accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      summary: options.title,
      description: options.description ?? '',
      start: {
        dateTime: new Date(options.startTimeMs).toISOString(),
        timeZone: options.timezone,
      },
      end: {
        dateTime: new Date(options.endTimeMs).toISOString(),
        timeZone: options.timezone,
      },
      attendees: options.attendeeEmails.map((email) => ({ email })),
      conferenceData: {
        createRequest: {
          requestId,
          conferenceSolutionKey: {
            type: 'hangoutsMeet',
          },
        },
      },
    }),
  })

  const raw = await response.text()
  const parsed = parseCalendarEventResponse(raw)

  if (!response.ok) {
    const message = parsed?.error?.message || `Google Calendar event creation failed (${response.status})`
    throw new GoogleWorkspaceOAuthError({
      message,
      code: parsed?.error?.status,
      description: parsed?.error?.message,
    })
  }

  return mapCalendarEventResponse(parsed)
}

export async function createGoogleCalendarEvent(options: {
  accessToken: string
  title: string
  description?: string | null
  startTimeMs: number
  endTimeMs: number
  timezone: string
  attendeeEmails: string[]
  meetingUrl?: string | null
}): Promise<CalendarMeetEvent> {
  if (!options.accessToken) {
    throw new GoogleWorkspaceOAuthError({ message: 'Access token is required to schedule a meeting' })
  }

  const response = await fetch(`${GOOGLE_CALENDAR_EVENTS_ENDPOINT}?sendUpdates=all`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${options.accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      summary: options.title,
      description: buildCalendarEventDescription(options.description, options.meetingUrl),
      location: options.meetingUrl ?? undefined,
      start: {
        dateTime: new Date(options.startTimeMs).toISOString(),
        timeZone: options.timezone,
      },
      end: {
        dateTime: new Date(options.endTimeMs).toISOString(),
        timeZone: options.timezone,
      },
      attendees: options.attendeeEmails.map((email) => ({ email })),
    }),
  })

  const raw = await response.text()
  const parsed = parseCalendarEventResponse(raw)

  if (!response.ok) {
    const message = parsed?.error?.message || `Google Calendar event creation failed (${response.status})`
    throw new GoogleWorkspaceOAuthError({
      message,
      code: parsed?.error?.status,
      description: parsed?.error?.message,
    })
  }

  const event = mapCalendarEventResponse(parsed)
  return {
    ...event,
    meetLink: options.meetingUrl ?? event.meetLink,
  }
}

export async function configureGoogleMeetArtifacts(options: {
  accessToken: string
  meetLink: string | null
  scopes?: string[] | null
}): Promise<MeetArtifactSetupStatus> {
  if (!options.accessToken) {
    throw new GoogleWorkspaceOAuthError({ message: 'Access token is required to configure Google Meet artifacts' })
  }

  const meetingCode = extractGoogleMeetCode(options.meetLink)
  if (!meetingCode) {
    return {
      configured: false,
      spaceName: null,
      meetingCode: null,
      reason: 'missing_meet_link',
      message: 'Google Meet link missing from Calendar event response.',
    }
  }

  if (!hasGoogleWorkspaceScope(options.scopes, GOOGLE_MEET_SPACE_SETTINGS_SCOPE)) {
    return {
      configured: false,
      spaceName: null,
      meetingCode,
      reason: 'missing_scope',
      message: 'Reconnect Google Workspace to grant meetings.space.settings for automatic transcripts and smart notes.',
    }
  }

  const getResponse = await fetch(`${GOOGLE_MEET_SPACES_ENDPOINT}/${encodeURIComponent(`spaces/${meetingCode}`)}`, {
    headers: {
      Authorization: `Bearer ${options.accessToken}`,
    },
  })

  const getRaw = await getResponse.text()
  const getParsed = parseGoogleMeetSpaceResponse(getRaw)

  if (!getResponse.ok) {
    return {
      configured: false,
      spaceName: null,
      meetingCode,
      reason: 'space_lookup_failed',
      message: getParsed?.error?.message ?? `Failed to look up Google Meet space (${getResponse.status}).`,
    }
  }

  const spaceName = typeof getParsed.name === 'string' ? getParsed.name : null
  if (!spaceName) {
    return {
      configured: false,
      spaceName: null,
      meetingCode,
      reason: 'space_lookup_failed',
      message: 'Google Meet space lookup succeeded without returning a space name.',
    }
  }

  const patchResponse = await fetch(
    `${GOOGLE_MEET_SPACES_ENDPOINT}/${encodeURIComponent(spaceName)}?updateMask=config.artifactConfig`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${options.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: spaceName,
        config: {
          artifactConfig: {
            transcriptionConfig: {
              autoTranscriptionGeneration: 'ON',
            },
            smartNotesConfig: {
              autoSmartNotesGeneration: 'ON',
            },
          },
        },
      }),
    }
  )

  const patchRaw = await patchResponse.text()
  const patchParsed = parseGoogleMeetSpaceResponse(patchRaw)

  if (!patchResponse.ok) {
    return {
      configured: false,
      spaceName,
      meetingCode,
      reason: 'patch_failed',
      message: patchParsed?.error?.message ?? `Failed to configure Google Meet artifacts (${patchResponse.status}).`,
    }
  }

  return {
    configured: true,
    spaceName,
    meetingCode,
    reason: 'configured',
    message: null,
  }
}

export async function updateGoogleCalendarMeetEvent(options: {
  accessToken: string
  eventId: string
  title: string
  description?: string | null
  startTimeMs: number
  endTimeMs: number
  timezone: string
  attendeeEmails: string[]
}): Promise<CalendarMeetEvent> {
  if (!options.accessToken) {
    throw new GoogleWorkspaceOAuthError({ message: 'Access token is required to update a meeting' })
  }

  if (!options.eventId) {
    throw new GoogleWorkspaceOAuthError({ message: 'Google Calendar event id is required' })
  }

  const endpoint = `${GOOGLE_CALENDAR_EVENTS_ENDPOINT}/${encodeURIComponent(options.eventId)}?conferenceDataVersion=1&sendUpdates=all`

  const response = await fetch(endpoint, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${options.accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      summary: options.title,
      description: options.description ?? '',
      start: {
        dateTime: new Date(options.startTimeMs).toISOString(),
        timeZone: options.timezone,
      },
      end: {
        dateTime: new Date(options.endTimeMs).toISOString(),
        timeZone: options.timezone,
      },
      attendees: options.attendeeEmails.map((email) => ({ email })),
    }),
  })

  const raw = await response.text()
  const parsed = parseCalendarEventResponse(raw)

  if (!response.ok) {
    const message = parsed?.error?.message || `Google Calendar event update failed (${response.status})`
    throw new GoogleWorkspaceOAuthError({
      message,
      code: parsed?.error?.status,
      description: parsed?.error?.message,
    })
  }

  return mapCalendarEventResponse(parsed)
}

export async function updateGoogleCalendarEvent(options: {
  accessToken: string
  eventId: string
  title: string
  description?: string | null
  startTimeMs: number
  endTimeMs: number
  timezone: string
  attendeeEmails: string[]
  meetingUrl?: string | null
}): Promise<CalendarMeetEvent> {
  if (!options.accessToken) {
    throw new GoogleWorkspaceOAuthError({ message: 'Access token is required to update a meeting' })
  }

  if (!options.eventId) {
    throw new GoogleWorkspaceOAuthError({ message: 'Google Calendar event id is required' })
  }

  const endpoint = `${GOOGLE_CALENDAR_EVENTS_ENDPOINT}/${encodeURIComponent(options.eventId)}?sendUpdates=all`

  const response = await fetch(endpoint, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${options.accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      summary: options.title,
      description: buildCalendarEventDescription(options.description, options.meetingUrl),
      location: options.meetingUrl ?? undefined,
      start: {
        dateTime: new Date(options.startTimeMs).toISOString(),
        timeZone: options.timezone,
      },
      end: {
        dateTime: new Date(options.endTimeMs).toISOString(),
        timeZone: options.timezone,
      },
      attendees: options.attendeeEmails.map((email) => ({ email })),
    }),
  })

  const raw = await response.text()
  const parsed = parseCalendarEventResponse(raw)

  if (!response.ok) {
    const message = parsed?.error?.message || `Google Calendar event update failed (${response.status})`
    throw new GoogleWorkspaceOAuthError({
      message,
      code: parsed?.error?.status,
      description: parsed?.error?.message,
    })
  }

  const event = mapCalendarEventResponse(parsed)
  return {
    ...event,
    meetLink: options.meetingUrl ?? event.meetLink,
  }
}

export async function cancelGoogleCalendarEvent(options: {
  accessToken: string
  eventId: string
}): Promise<void> {
  if (!options.accessToken) {
    throw new GoogleWorkspaceOAuthError({ message: 'Access token is required to cancel a meeting' })
  }

  if (!options.eventId) {
    throw new GoogleWorkspaceOAuthError({ message: 'Google Calendar event id is required' })
  }

  const endpoint = `${GOOGLE_CALENDAR_EVENTS_ENDPOINT}/${encodeURIComponent(options.eventId)}?sendUpdates=all`
  const response = await fetch(endpoint, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${options.accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status: 'cancelled' }),
  })

  if (!response.ok) {
    const raw = await response.text().catch(() => '')
    let parsed: GoogleCalendarEventResponse | null = null

    try {
      parsed = JSON.parse(raw) as GoogleCalendarEventResponse
    } catch {
      parsed = null
    }

    const message = parsed?.error?.message || `Google Calendar event cancellation failed (${response.status})`
    throw new GoogleWorkspaceOAuthError({
      message,
      code: parsed?.error?.status,
      description: parsed?.error?.message,
    })
  }
}

export function parseGoogleScopeList(scopeValue: string | undefined): string[] {
  if (!scopeValue) return []
  return scopeValue
    .split(' ')
    .map((scope) => scope.trim())
    .filter((scope) => scope.length > 0)
}
