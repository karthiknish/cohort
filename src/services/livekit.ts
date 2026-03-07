import { AccessToken } from 'livekit-server-sdk'

function readEnvValue(key: string): string | null {
  const value = process.env[key]
  if (typeof value !== 'string') {
    return null
  }

  const normalized = value.trim()
  return normalized.length > 0 ? normalized : null
}

function sanitizeSegment(value: string): string {
  const base = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 20)

  return base.length > 0 ? base : 'room'
}

export function resolveLiveKitServerUrl(): string | null {
  return readEnvValue('NEXT_PUBLIC_LIVEKIT_URL') ?? readEnvValue('LIVEKIT_URL')
}

export function resolveLiveKitCredentials(): {
  apiKey: string | null
  apiSecret: string | null
  serverUrl: string | null
} {
  return {
    apiKey: readEnvValue('LIVEKIT_API_KEY'),
    apiSecret: readEnvValue('LIVEKIT_API_SECRET'),
    serverUrl: resolveLiveKitServerUrl(),
  }
}

export function createLiveKitRoomName(seed?: string | null): string {
  const label = sanitizeSegment(seed ?? 'meeting')
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).slice(2, 8)
  return `cohorts-${label}-${timestamp}-${random}`
}

export function buildCohortsMeetingUrl(options: {
  appUrl: string
  roomName: string
}): string {
  const base = options.appUrl.replace(/\/+$/, '')
  const roomParam = encodeURIComponent(options.roomName)
  return `${base}/dashboard/meetings?room=${roomParam}`
}

export async function createLiveKitParticipantToken(options: {
  roomName: string
  participantIdentity: string
  participantName?: string | null
  metadata?: Record<string, unknown>
  ttl?: string | number
}): Promise<string> {
  const { apiKey, apiSecret } = resolveLiveKitCredentials()
  if (!apiKey || !apiSecret) {
    throw new Error('LiveKit credentials are not configured')
  }

  const token = new AccessToken(apiKey, apiSecret, {
    identity: options.participantIdentity,
    name: options.participantName ?? undefined,
    metadata: options.metadata ? JSON.stringify(options.metadata) : undefined,
    ttl: options.ttl ?? '8h',
  })

  token.addGrant({
    room: options.roomName,
    roomJoin: true,
    canPublish: true,
    canPublishData: true,
    canSubscribe: true,
  })

  return await token.toJwt()
}
