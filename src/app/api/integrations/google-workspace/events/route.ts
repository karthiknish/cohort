import { z } from 'zod'

import { createApiHandler } from '@/lib/api-handler'
import { BadRequestError, UnauthorizedError } from '@/lib/api-errors'
import { saveMeetingNotes, saveMeetingTranscript } from '@/lib/meetings-admin'
import { GeminiAIService, resolveGeminiApiKey } from '@/services/gemini'

const webhookSchema = z.unknown()

type MeetingStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled'

type PubSubContext = {
  subscription: string | null
  messageId: string | null
  publishTime: string | null
  deliveryAttempt: number | null
  attributes: Record<string, string>
  decodedData: Record<string, unknown> | null
}

type NormalizedTranscriptWebhookPayload = {
  workspaceId: string | null
  userId: string | null
  meetingLegacyId: string | null
  calendarEventId: string | null
  transcriptText: string | null
  status: MeetingStatus | undefined
  source: string
  eventType: string | null
  cloudEventSubject: string | null
  transcriptResourceName: string | null
  conferenceRecordName: string | null
  pubsub: PubSubContext
  rawEnvelope: Record<string, unknown> | null
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null
  }

  return value as Record<string, unknown>
}

function asString(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null
  }

  const normalized = value.trim()
  return normalized.length > 0 ? normalized : null
}

function firstString(...values: unknown[]): string | null {
  for (const value of values) {
    const normalized = asString(value)
    if (normalized) {
      return normalized
    }
  }

  return null
}

function parseAttributeMap(value: unknown): Record<string, string> {
  const record = asRecord(value)
  if (!record) {
    return {}
  }

  const normalized: Record<string, string> = {}
  for (const [key, rawValue] of Object.entries(record)) {
    const stringValue = asString(rawValue)
    if (stringValue) {
      normalized[key] = stringValue
    }
  }

  return normalized
}

function parseDeliveryAttempt(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }

  const parsedFromString = Number(firstString(value))
  if (Number.isFinite(parsedFromString)) {
    return parsedFromString
  }

  return null
}

function decodePubSubData(value: unknown): Record<string, unknown> | null {
  const encoded = asString(value)
  if (!encoded) {
    return null
  }

  try {
    const decoded = Buffer.from(encoded, 'base64').toString('utf8')
    return asRecord(JSON.parse(decoded))
  } catch {
    return null
  }
}

function parsePubSubContext(body: Record<string, unknown> | null): PubSubContext {
  const message = asRecord(body?.message)
  const attributes = parseAttributeMap(message?.attributes)

  return {
    subscription: firstString(body?.subscription),
    messageId: firstString(message?.messageId, message?.message_id),
    publishTime: firstString(message?.publishTime, message?.publish_time),
    deliveryAttempt: parseDeliveryAttempt(body?.deliveryAttempt),
    attributes,
    decodedData: decodePubSubData(message?.data),
  }
}

function extractTranscriptTextFromEntries(value: unknown): string | null {
  if (!Array.isArray(value)) {
    return null
  }

  const lines: string[] = []
  for (const entry of value) {
    const row = asRecord(entry)
    const text = firstString(
      row?.text,
      row?.content,
      row?.transcriptText,
      asRecord(row?.segment)?.text,
      asRecord(row?.entry)?.text
    )

    if (text) {
      lines.push(text)
    }
  }

  return lines.length > 0 ? lines.join('\n') : null
}

function normalizeStatus(status: unknown): MeetingStatus | undefined {
  if (status === 'scheduled' || status === 'in_progress' || status === 'completed' || status === 'cancelled') {
    return status
  }

  if (status === 'ended' || status === 'done') {
    return 'completed'
  }

  return undefined
}

function statusFromEventType(eventType: string | null): MeetingStatus | undefined {
  if (!eventType) {
    return undefined
  }

  if (eventType === 'google.workspace.meet.conference.v2.started') {
    return 'in_progress'
  }

  if (eventType === 'google.workspace.meet.conference.v2.ended') {
    return 'completed'
  }

  return undefined
}

function normalizeTranscriptWebhookPayload(
  body: unknown,
  request: Request
): NormalizedTranscriptWebhookPayload {
  const envelope = asRecord(body)
  const pubsub = parsePubSubContext(envelope)

  const primary = pubsub.decodedData ?? envelope
  const cloudEvent = asRecord(primary)
  const hasStructuredCloudEvent = Boolean(asString(cloudEvent?.specversion))
  const eventPayload = hasStructuredCloudEvent ? asRecord(cloudEvent?.data) ?? {} : (asRecord(primary) ?? {})

  const context = asRecord(eventPayload.context)
  const metadata = asRecord(eventPayload.metadata)
  const meeting = asRecord(eventPayload.meeting)
  const transcript = asRecord(eventPayload.transcript)
  const calendarEvent = asRecord(eventPayload.calendarEvent)
  const conferenceRecord = asRecord(eventPayload.conferenceRecord)

  const headerEventType = asString(request.headers.get('ce-type'))
  const headerEventSource = asString(request.headers.get('ce-source'))
  const headerEventSubject = asString(request.headers.get('ce-subject'))

  const cloudEventSubject = firstString(
    pubsub.attributes['ce-subject'],
    headerEventSubject,
    cloudEvent?.subject,
    eventPayload.subject
  )

  const eventType = firstString(
    pubsub.attributes['ce-type'],
    headerEventType,
    cloudEvent?.type,
    eventPayload.eventType,
    eventPayload.event_type,
    eventPayload.type
  )

  const source =
    firstString(
      pubsub.attributes['ce-source'],
      headerEventSource,
      cloudEvent?.source,
      eventPayload.source,
      eventPayload.provider
    ) ?? 'google-workspace'

  const transcriptResourceName = firstString(
    transcript?.name,
    eventPayload.transcriptName,
    eventPayload.transcript_resource_name,
    eventPayload.resourceName,
    cloudEventSubject
  )

  const conferenceRecordName =
    firstString(
      conferenceRecord?.name,
      eventPayload.conferenceRecordName,
      eventPayload.conference_record_name,
      asRecord(eventPayload.conferenceRecord)?.name
    ) ??
    (transcriptResourceName?.match(/conferenceRecords\/[^/]+/)?.[0] ?? null)

  const transcriptText =
    firstString(
      eventPayload.transcriptText,
      eventPayload.transcript_text,
      eventPayload.fullTranscript,
      eventPayload.transcript,
      transcript?.text,
      transcript?.content,
      transcript?.transcriptText,
      asRecord(eventPayload.resource)?.transcriptText,
      asRecord(eventPayload.resourceData)?.transcriptText,
      metadata?.transcriptText
    ) ??
    extractTranscriptTextFromEntries(eventPayload.entries) ??
    extractTranscriptTextFromEntries(eventPayload.transcriptEntries)

  const status =
    normalizeStatus(
      firstString(
        eventPayload.status,
        eventPayload.meetingStatus,
        metadata?.status,
        pubsub.attributes['status']
      )
    ) ?? statusFromEventType(eventType)

  return {
    workspaceId: firstString(
      eventPayload.workspaceId,
      eventPayload.workspace_id,
      context?.workspaceId,
      context?.workspace_id,
      metadata?.workspaceId,
      metadata?.workspace_id,
      meeting?.workspaceId,
      pubsub.attributes['workspaceId'],
      pubsub.attributes['workspace_id'],
      pubsub.attributes['workspaceid'],
      pubsub.attributes['x-workspace-id']
    ),
    userId: firstString(
      eventPayload.userId,
      eventPayload.user_id,
      context?.userId,
      context?.user_id,
      metadata?.userId,
      metadata?.user_id,
      meeting?.userId,
      pubsub.attributes['userId'],
      pubsub.attributes['user_id'],
      pubsub.attributes['userid'],
      pubsub.attributes['x-user-id']
    ),
    meetingLegacyId: firstString(
      eventPayload.meetingLegacyId,
      eventPayload.meeting_legacy_id,
      eventPayload.legacyId,
      meeting?.legacyId,
      meeting?.meetingLegacyId,
      metadata?.meetingLegacyId,
      pubsub.attributes['meetingLegacyId'],
      pubsub.attributes['meeting_legacy_id'],
      pubsub.attributes['meetinglegacyid'],
      pubsub.attributes['x-meeting-legacy-id']
    ),
    calendarEventId: firstString(
      eventPayload.calendarEventId,
      eventPayload.calendar_event_id,
      calendarEvent?.eventId,
      calendarEvent?.id,
      meeting?.calendarEventId,
      metadata?.calendarEventId,
      pubsub.attributes['calendarEventId'],
      pubsub.attributes['calendar_event_id'],
      pubsub.attributes['calendareventid'],
      pubsub.attributes['x-calendar-event-id']
    ),
    transcriptText,
    status,
    source,
    eventType,
    cloudEventSubject,
    transcriptResourceName,
    conferenceRecordName,
    pubsub,
    rawEnvelope: envelope,
  }
}

function getMissingFields(payload: NormalizedTranscriptWebhookPayload): string[] {
  const missing: string[] = []

  if (!payload.workspaceId) {
    missing.push('workspaceId')
  }

  if (!payload.userId) {
    missing.push('userId')
  }

  if (!payload.meetingLegacyId && !payload.calendarEventId) {
    missing.push('meetingLegacyId/calendarEventId')
  }

  if (!payload.transcriptText) {
    missing.push('transcriptText')
  }

  return missing
}

async function generateConciseMeetingNotes(transcriptText: string): Promise<{ summary: string; model: string } | null> {
  const apiKey = resolveGeminiApiKey()
  if (!apiKey) return null

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
  const model = gemini.getModel()

  return {
    summary,
    model,
  }
}

export const POST = createApiHandler(
  {
    auth: 'none',
    bodySchema: webhookSchema,
    rateLimit: 'sensitive',
  },
  async (req, { body }) => {
    const configuredSecret = process.env.GOOGLE_WORKSPACE_EVENTS_SECRET || process.env.EXTERNAL_WEBHOOK_SECRET
    const providedSecret = req.headers.get('x-webhook-secret')

    if (configuredSecret && providedSecret !== configuredSecret) {
      throw new UnauthorizedError('Invalid webhook signature')
    }

    const normalized = normalizeTranscriptWebhookPayload(body, req)
    const missingFields = getMissingFields(normalized)

    if (missingFields.length > 0) {
      const isGoogleWorkspaceEvent =
        normalized.eventType?.startsWith('google.workspace.') || Boolean(normalized.pubsub.messageId) || Boolean(normalized.pubsub.subscription)

      if (isGoogleWorkspaceEvent) {
        return {
          received: true,
          accepted: false,
          reason: `missing_required_fields:${missingFields.join(',')}`,
          eventType: normalized.eventType,
          source: normalized.source,
          transcriptResourceName: normalized.transcriptResourceName,
          conferenceRecordName: normalized.conferenceRecordName,
          pubsub: {
            subscription: normalized.pubsub.subscription,
            messageId: normalized.pubsub.messageId,
            publishTime: normalized.pubsub.publishTime,
            deliveryAttempt: normalized.pubsub.deliveryAttempt,
          },
        }
      }

      throw new BadRequestError(`Missing required webhook fields: ${missingFields.join(', ')}`)
    }

    const updatedMeetingLegacyId = (await saveMeetingTranscript({
      userId: normalized.userId as string,
      workspaceId: normalized.workspaceId as string,
      meetingLegacyId: normalized.meetingLegacyId ?? undefined,
      calendarEventId: normalized.calendarEventId ?? undefined,
      transcriptText: normalized.transcriptText as string,
      source: normalized.source,
      status: normalized.status,
      eventType: normalized.eventType ?? 'transcript.received',
      rawPayload: {
        envelope: normalized.rawEnvelope,
        decodedData: normalized.pubsub.decodedData,
        attributes: normalized.pubsub.attributes,
        cloudEvent: {
          type: normalized.eventType,
          subject: normalized.cloudEventSubject,
          source: normalized.source,
        },
        transcriptResourceName: normalized.transcriptResourceName,
        conferenceRecordName: normalized.conferenceRecordName,
      },
    })) as string

    let notesGenerated = false

    try {
      const notes = await generateConciseMeetingNotes(normalized.transcriptText as string)
      if (notes) {
        await saveMeetingNotes({
          userId: normalized.userId as string,
          workspaceId: normalized.workspaceId as string,
          legacyId: updatedMeetingLegacyId,
          summary: notes.summary,
          model: notes.model,
        })
        notesGenerated = true
      }
    } catch (error) {
      console.error('[google-workspace/events] failed to generate meeting notes', error)
    }

    return {
      received: true,
      accepted: true,
      meetingLegacyId: updatedMeetingLegacyId,
      eventType: normalized.eventType,
      source: normalized.source,
      notesGenerated,
    }
  }
)
